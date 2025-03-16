import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { 
  positions, candidates, referrals, activities, users,
  type Position, type InsertPosition,
  type Candidate, type InsertCandidate,
  type Referral, type InsertReferral,
  type Activity, type InsertActivity,
  type ReferralWithDetails,
  type User, type InsertUser
} from "@shared/schema";
import { IStorage } from "./storage";
import { and, desc, eq, gt, lt, sql } from "drizzle-orm";

const { Pool } = pg;

// Create a PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create a Drizzle instance
const db = drizzle(pool);

export class PostgresStorage implements IStorage {
  
  // Users and Authentication
  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }
  
  async getUserById(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }
  
  async updateUserLastLogin(id: number): Promise<void> {
    await db.update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, id));
  }
  
  // Positions
  async getAllPositions(): Promise<Position[]> {
    return await db.select().from(positions);
  }
  
  async getPosition(id: number): Promise<Position | undefined> {
    const result = await db.select().from(positions).where(eq(positions.id, id));
    return result[0];
  }
  
  async createPosition(position: InsertPosition): Promise<Position> {
    const result = await db.insert(positions).values(position).returning();
    const newPosition = result[0];
    
    // Create activity
    await this.createActivity({
      type: "position_added",
      description: `Added a new position: ${position.title} at ${position.company}`,
      timestamp: new Date(),
      relatedId: newPosition.id,
      relatedType: "position"
    });
    
    return newPosition;
  }
  
  async updatePosition(id: number, position: Partial<InsertPosition>): Promise<Position | undefined> {
    // Get existing position to check for status change
    const existingPosition = await this.getPosition(id);
    
    if (!existingPosition) {
      return undefined;
    }
    
    const result = await db.update(positions)
      .set(position)
      .where(eq(positions.id, id))
      .returning();
    
    const updatedPosition = result[0];
    
    // Create activity for status change
    if (position.status && position.status !== existingPosition.status) {
      await this.createActivity({
        type: "position_updated",
        description: `Updated position status: ${updatedPosition.title} at ${updatedPosition.company} is now ${position.status}`,
        timestamp: new Date(),
        relatedId: id,
        relatedType: "position"
      });
    }
    
    return updatedPosition;
  }
  
  async deletePosition(id: number): Promise<boolean> {
    // Get position for activity
    const position = await this.getPosition(id);
    if (!position) {
      return false;
    }
    
    // Check if position is referenced by any referrals
    const referralCheck = await db.select({ id: referrals.id })
      .from(referrals)
      .where(eq(referrals.positionId, id))
      .limit(1);
    
    if (referralCheck.length > 0) {
      return false;
    }
    
    const result = await db.delete(positions)
      .where(eq(positions.id, id))
      .returning();
    
    const deleted = result.length > 0;
    
    if (deleted) {
      await this.createActivity({
        type: "position_deleted",
        description: `Deleted position: ${position.title} at ${position.company}`,
        timestamp: new Date(),
        relatedType: "position"
      });
    }
    
    return deleted;
  }
  
  // Candidates
  async getAllCandidates(): Promise<Candidate[]> {
    return await db.select().from(candidates);
  }
  
  async getCandidate(id: number): Promise<Candidate | undefined> {
    const result = await db.select().from(candidates).where(eq(candidates.id, id));
    return result[0];
  }
  
  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const result = await db.insert(candidates).values(candidate).returning();
    const newCandidate = result[0];
    
    // Create activity
    await this.createActivity({
      type: "candidate_added",
      description: `Added a new candidate: ${candidate.fullName}`,
      timestamp: new Date(),
      relatedId: newCandidate.id,
      relatedType: "candidate"
    });
    
    return newCandidate;
  }
  
  async updateCandidate(id: number, candidate: Partial<InsertCandidate>): Promise<Candidate | undefined> {
    // Get existing candidate to check for status change
    const existingCandidate = await this.getCandidate(id);
    
    if (!existingCandidate) {
      return undefined;
    }
    
    const result = await db.update(candidates)
      .set(candidate)
      .where(eq(candidates.id, id))
      .returning();
    
    const updatedCandidate = result[0];
    
    // Create activity for status change
    if (candidate.status && candidate.status !== existingCandidate.status) {
      await this.createActivity({
        type: "candidate_updated",
        description: `Updated candidate status: ${updatedCandidate.fullName} is now ${candidate.status}`,
        timestamp: new Date(),
        relatedId: id,
        relatedType: "candidate"
      });
    }
    
    return updatedCandidate;
  }
  
  async deleteCandidate(id: number): Promise<boolean> {
    // Get candidate for activity
    const candidate = await this.getCandidate(id);
    if (!candidate) {
      return false;
    }
    
    // Check if candidate is referenced by any referrals
    const referralCheck = await db.select({ id: referrals.id })
      .from(referrals)
      .where(eq(referrals.candidateId, id))
      .limit(1);
    
    if (referralCheck.length > 0) {
      return false;
    }
    
    const result = await db.delete(candidates)
      .where(eq(candidates.id, id))
      .returning();
    
    const deleted = result.length > 0;
    
    if (deleted) {
      await this.createActivity({
        type: "candidate_deleted",
        description: `Deleted candidate: ${candidate.fullName}`,
        timestamp: new Date(),
        relatedType: "candidate"
      });
    }
    
    return deleted;
  }
  
  // Referrals
  async getAllReferrals(): Promise<ReferralWithDetails[]> {
    // Using a raw query with JOINs to get all related data at once
    const result = await db.execute<any>(sql`
      SELECT 
        r.*,
        c.id as "candidate_id", c.full_name, c.email, c.phone, c.current_role, 
        c.skills, c.experience, c.salary_expectation, c.notes as candidate_notes, 
        c.availability, c.status as candidate_status,
        p.id as "position_id", p.title, p.company, p.location, p.description as position_description, 
        p.salary_min, p.salary_max, p.status as position_status, p.date_added
      FROM referrals r
      JOIN candidates c ON r.candidate_id = c.id
      JOIN positions p ON r.position_id = p.id
    `);
    
    // Transform the raw results into the expected format
    return result.rows.map((row: any) => ({
      id: row.id,
      candidateId: row.candidate_id,
      positionId: row.position_id,
      referralDate: row.referral_date,
      status: row.status,
      notes: row.notes,
      feeEarned: row.fee_earned,
      mode: row.mode,
      feeType: row.fee_type,
      feeMonths: row.fee_months,
      candidate: {
        id: row.candidate_id,
        fullName: row.full_name,
        email: row.email,
        phone: row.phone,
        currentRole: row.current_role,
        skills: row.skills,
        experience: row.experience,
        salaryExpectation: row.salary_expectation,
        notes: row.candidate_notes,
        availability: row.availability,
        status: row.candidate_status
      },
      position: {
        id: row.position_id,
        title: row.title,
        company: row.company,
        location: row.location,
        description: row.position_description,
        salaryMin: row.salary_min,
        salaryMax: row.salary_max,
        status: row.position_status,
        dateAdded: row.date_added
      }
    }));
  }
  
  async getReferral(id: number): Promise<ReferralWithDetails | undefined> {
    // Using a raw query with JOINs
    const result = await db.execute<any>(sql`
      SELECT 
        r.*,
        c.id as "candidate_id", c.full_name, c.email, c.phone, c.current_role, 
        c.skills, c.experience, c.salary_expectation, c.notes as candidate_notes, 
        c.availability, c.status as candidate_status,
        p.id as "position_id", p.title, p.company, p.location, p.description as position_description, 
        p.salary_min, p.salary_max, p.status as position_status, p.date_added
      FROM referrals r
      JOIN candidates c ON r.candidate_id = c.id
      JOIN positions p ON r.position_id = p.id
      WHERE r.id = ${id}
    `);
    
    if (result.rows.length === 0) {
      return undefined;
    }
    
    const row = result.rows[0];
    
    return {
      id: row.id,
      candidateId: row.candidate_id,
      positionId: row.position_id,
      referralDate: row.referral_date,
      status: row.status,
      notes: row.notes,
      feeEarned: row.fee_earned,
      mode: row.mode,
      feeType: row.fee_type,
      feeMonths: row.fee_months,
      candidate: {
        id: row.candidate_id,
        fullName: row.full_name,
        email: row.email,
        phone: row.phone,
        currentRole: row.current_role,
        skills: row.skills,
        experience: row.experience,
        salaryExpectation: row.salary_expectation,
        notes: row.candidate_notes,
        availability: row.availability,
        status: row.candidate_status
      },
      position: {
        id: row.position_id,
        title: row.title,
        company: row.company,
        location: row.location,
        description: row.position_description,
        salaryMin: row.salary_min,
        salaryMax: row.salary_max,
        status: row.position_status,
        dateAdded: row.date_added
      }
    };
  }
  
  async createReferral(referral: InsertReferral): Promise<Referral> {
    const result = await db.insert(referrals).values(referral).returning();
    const newReferral = result[0];
    
    // Get candidate and position for activity
    const candidate = await this.getCandidate(referral.candidateId);
    const position = await this.getPosition(referral.positionId);
    
    // Create activity
    if (candidate && position) {
      await this.createActivity({
        type: "referral_created",
        description: `Made a new referral: ${candidate.fullName} for ${position.title} at ${position.company}`,
        timestamp: new Date(),
        relatedId: newReferral.id,
        relatedType: "referral"
      });
    }
    
    return newReferral;
  }
  
  async updateReferral(id: number, referral: Partial<InsertReferral>): Promise<Referral | undefined> {
    // Get existing referral
    const existingReferral = await db.select().from(referrals).where(eq(referrals.id, id)).then(res => res[0]);
    
    if (!existingReferral) {
      return undefined;
    }
    
    const result = await db.update(referrals)
      .set(referral)
      .where(eq(referrals.id, id))
      .returning();
    
    const updatedReferral = result[0];
    
    // Check if status changed to Hired and fee was earned
    if (
      referral.status === "Hired" && 
      existingReferral.status !== "Hired" && 
      referral.feeEarned
    ) {
      const candidate = await this.getCandidate(existingReferral.candidateId);
      
      if (candidate) {
        await this.createActivity({
          type: "referral_updated",
          description: `Received referral fee: ₪${referral.feeEarned} for ${candidate.fullName}`,
          timestamp: new Date(),
          relatedId: id,
          relatedType: "referral"
        });
        
        // Update candidate status to Placed
        await this.updateCandidate(candidate.id, { status: "Placed" });
      }
    }
    
    return updatedReferral;
  }
  
  async deleteReferral(id: number): Promise<boolean> {
    // Get referral info for activity
    const referralDetails = await this.getReferral(id);
    if (!referralDetails) {
      return false;
    }
    
    const result = await db.delete(referrals)
      .where(eq(referrals.id, id))
      .returning();
    
    const deleted = result.length > 0;
    
    if (deleted && referralDetails.candidate && referralDetails.position) {
      await this.createActivity({
        type: "referral_deleted",
        description: `Deleted referral: ${referralDetails.candidate.fullName} for ${referralDetails.position.title} at ${referralDetails.position.company}`,
        timestamp: new Date(),
        relatedType: "referral"
      });
    }
    
    return deleted;
  }
  
  // Activities
  async getAllActivities(limit?: number): Promise<Activity[]> {
    const query = db.select()
      .from(activities)
      .orderBy(desc(activities.timestamp));
    
    if (limit) {
      query.limit(limit);
    }
    
    return await query;
  }
  
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const result = await db.insert(activities).values(activity).returning();
    return result[0];
  }
  
  // Dashboard stats
  async getDashboardStats(): Promise<{
    openPositions: number;
    activeCandidates: number;
    referralsMade: number;
    feesEarned: number;
    monthlyChange: {
      openPositions: number;
      activeCandidates: number;
      referralsMade: number;
      feesEarned: number;
    };
  }> {
    // Current stats
    const openPositionsResult = await db.select({ count: sql<number>`count(*)` })
      .from(positions)
      .where(eq(positions.status, "Open"));
    const openPositions = openPositionsResult[0].count;
    
    const activeCandidatesResult = await db.select({ count: sql<number>`count(*)` })
      .from(candidates)
      .where(eq(candidates.status, "Looking"));
    const activeCandidates = activeCandidatesResult[0].count;
    
    const referralsMadeResult = await db.select({ count: sql<number>`count(*)` })
      .from(referrals);
    const referralsMade = referralsMadeResult[0].count;
    
    const feesEarnedResult = await db.select({ sum: sql<number>`COALESCE(sum(fee_earned), 0)` })
      .from(referrals)
      .where(eq(referrals.status, "Hired"));
    const feesEarned = feesEarnedResult[0].sum;
    
    // Calculate monthly changes
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    // Positions created in the last month
    const newPositionsResult = await db.select({ count: sql<number>`count(*)` })
      .from(positions)
      .where(gt(positions.dateAdded, oneMonthAgo));
    const newPositions = newPositionsResult[0].count;
    
    // New referrals in the last month
    const newReferralsResult = await db.select({ count: sql<number>`count(*)` })
      .from(referrals)
      .where(gt(referrals.referralDate, oneMonthAgo));
    const newReferrals = newReferralsResult[0].count;
    
    // Fees earned in the last month
    const newFeesResult = await db.select({ sum: sql<number>`COALESCE(sum(fee_earned), 0)` })
      .from(referrals)
      .where(
        and(
          eq(referrals.status, "Hired"),
          gt(referrals.referralDate, oneMonthAgo)
        )
      );
    const newFees = newFeesResult[0].sum;
    
    // New candidates in the last month (using activities as a proxy)
    const newCandidatesResult = await db.select({ count: sql<number>`count(*)` })
      .from(activities)
      .where(
        and(
          eq(activities.type, "candidate_added"),
          gt(activities.timestamp, oneMonthAgo)
        )
      );
    const newCandidates = newCandidatesResult[0].count;
    
    return {
      openPositions,
      activeCandidates,
      referralsMade,
      feesEarned,
      monthlyChange: {
        openPositions: newPositions,
        activeCandidates: newCandidates,
        referralsMade: newReferrals,
        feesEarned: newFees
      }
    };
  }
}

// Seed function to create initial data
export async function seedDatabase() {
  try {
    // Check if we already have data
    const existingPositions = await db.select({ count: sql<number>`count(*)` }).from(positions);
    if (existingPositions[0].count > 0) {
      console.log("Database already has data, skipping seed");
      return;
    }
    
    console.log("Seeding database with initial data...");
    
    // Sample positions
    const position1 = await db.insert(positions).values({
      title: "Senior Software Engineer",
      company: "TechCorp",
      location: "Tel Aviv",
      description: "We are looking for an experienced software engineer to join our team...",
      salaryMin: 25000, // Monthly salary in ILS
      salaryMax: 35000, // Monthly salary in ILS
      status: "Open",
      dateAdded: new Date("2023-08-15")
    }).returning();
    
    const position2 = await db.insert(positions).values({
      title: "Product Manager",
      company: "InnoTech",
      location: "Herzliya",
      description: "Seeking a product manager to lead our product development efforts...",
      salaryMin: 22000, // Monthly salary in ILS
      salaryMax: 32000, // Monthly salary in ILS
      status: "Open",
      dateAdded: new Date("2023-08-10")
    }).returning();
    
    const position3 = await db.insert(positions).values({
      title: "UX Designer",
      company: "GlobalSoft",
      location: "Jerusalem",
      description: "Looking for a talented UX designer to improve our user experience...",
      salaryMin: 18000, // Monthly salary in ILS
      salaryMax: 24000, // Monthly salary in ILS
      status: "Closed",
      dateAdded: new Date("2023-07-22")
    }).returning();
    
    // Sample candidates
    const candidate1 = await db.insert(candidates).values({
      fullName: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      phone: "050-1234567",
      currentRole: "Senior Frontend Developer",
      skills: "JavaScript, React, TypeScript, CSS",
      experience: 8,
      salaryExpectation: 25000, // Monthly salary in ILS
      notes: "Great communication skills, looking for remote opportunities",
      availability: "2weeks",
      status: "Looking"
    }).returning();
    
    const candidate2 = await db.insert(candidates).values({
      fullName: "Michael Chen",
      email: "michael.chen@example.com",
      phone: "052-9876543",
      currentRole: "Product Manager",
      skills: "Product Strategy, Roadmapping, User Research, Agile",
      experience: 6,
      salaryExpectation: 30000, // Monthly salary in ILS
      notes: "Strong background in B2B SaaS products",
      availability: "1month",
      status: "Looking"
    }).returning();
    
    const candidate3 = await db.insert(candidates).values({
      fullName: "Emma Davis",
      email: "emma.davis@example.com",
      phone: "054-4567890",
      currentRole: "UX Designer",
      skills: "UI Design, Figma, User Testing, Prototyping",
      experience: 5,
      salaryExpectation: 23000, // Monthly salary in ILS
      notes: "Portfolio includes work for financial and healthcare sectors",
      availability: "immediate",
      status: "Placed"
    }).returning();
    
    // Sample referrals
    const referral1 = await db.insert(referrals).values({
      candidateId: candidate3[0].id,
      positionId: position3[0].id,
      referralDate: new Date("2023-07-15"),
      status: "Hired",
      notes: "Great fit for the team, started August 1st",
      feeEarned: 25000,
      mode: "Placement",
      feeType: "OneTime",
      feeMonths: null
    }).returning();
    
    const referral2 = await db.insert(referrals).values({
      candidateId: candidate2[0].id,
      positionId: position2[0].id,
      referralDate: new Date("2023-08-05"),
      status: "Interviewing",
      notes: "Second interview scheduled next week",
      feeEarned: null,
      mode: "Placement",
      feeType: "OneTime",
      feeMonths: null
    }).returning();
    
    const referral3 = await db.insert(referrals).values({
      candidateId: candidate1[0].id,
      positionId: position1[0].id,
      referralDate: new Date("2023-08-10"),
      status: "Referred",
      notes: "Initial screening call scheduled",
      feeEarned: null,
      mode: "Outsource",
      feeType: "Monthly",
      feeMonths: 3
    }).returning();
    
    // Sample activities
    await db.insert(activities).values({
      type: "candidate_added",
      description: "Added a new candidate: Sarah Johnson",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      relatedId: candidate1[0].id,
      relatedType: "candidate"
    });
    
    await db.insert(activities).values({
      type: "referral_created",
      description: "Made a new referral: Michael Chen for Product Manager at InnoTech",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      relatedId: referral2[0].id,
      relatedType: "referral"
    });
    
    await db.insert(activities).values({
      type: "position_added",
      description: "Added a new position: Product Manager at InnoTech",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      relatedId: position2[0].id,
      relatedType: "position"
    });
    
    await db.insert(activities).values({
      type: "referral_updated",
      description: "Received referral fee: ₪25,000 for Emma Davis",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      relatedId: referral1[0].id,
      relatedType: "referral"
    });
    
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

export const storage = new PostgresStorage();