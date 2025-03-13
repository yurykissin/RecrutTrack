import { 
  positions, candidates, referrals, activities, users,
  type Position, type InsertPosition,
  type Candidate, type InsertCandidate,
  type Referral, type InsertReferral,
  type Activity, type InsertActivity,
  type ReferralWithDetails,
  type User, type InsertUser
} from "@shared/schema";

export interface IStorage {
  // Users and Authentication
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(id: number): Promise<void>;
  
  // Positions
  getAllPositions(): Promise<Position[]>;
  getPosition(id: number): Promise<Position | undefined>;
  createPosition(position: InsertPosition): Promise<Position>;
  updatePosition(id: number, position: Partial<InsertPosition>): Promise<Position | undefined>;
  deletePosition(id: number): Promise<boolean>;
  
  // Candidates
  getAllCandidates(): Promise<Candidate[]>;
  getCandidate(id: number): Promise<Candidate | undefined>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  updateCandidate(id: number, candidate: Partial<InsertCandidate>): Promise<Candidate | undefined>;
  deleteCandidate(id: number): Promise<boolean>;
  
  // Referrals
  getAllReferrals(): Promise<ReferralWithDetails[]>;
  getReferral(id: number): Promise<ReferralWithDetails | undefined>;
  createReferral(referral: InsertReferral): Promise<Referral>;
  updateReferral(id: number, referral: Partial<InsertReferral>): Promise<Referral | undefined>;
  deleteReferral(id: number): Promise<boolean>;
  
  // Activities
  getAllActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Stats
  getDashboardStats(): Promise<{
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
  }>;
}

export class MemStorage implements IStorage {
  private positions: Map<number, Position>;
  private candidates: Map<number, Candidate>;
  private referrals: Map<number, Referral>;
  private activities: Map<number, Activity>;
  private users: Map<number, User>;
  
  private positionsId: number;
  private candidatesId: number;
  private referralsId: number;
  private activitiesId: number;
  private usersId: number;
  
  constructor() {
    this.positions = new Map();
    this.candidates = new Map();
    this.referrals = new Map();
    this.activities = new Map();
    this.users = new Map();
    
    this.positionsId = 1;
    this.candidatesId = 1;
    this.referralsId = 1;
    this.activitiesId = 1;
    this.usersId = 1;
    
    // Add some initial data
    this.seedData();
  }
  
  // User methods
  async getUserByEmail(email: string): Promise<User | undefined> {
    const users = Array.from(this.users.values());
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }
  
  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.usersId++;
    const now = new Date();
    
    const newUser: User = {
      ...user,
      id,
      lastLogin: null,
      createdAt: now
    };
    
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUserLastLogin(id: number): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.lastLogin = new Date();
      this.users.set(id, user);
    }
  }

  private seedData() {
    // Sample positions
    const position1: Position = {
      id: this.positionsId++,
      title: "Senior Software Engineer",
      company: "TechCorp",
      location: "Tel Aviv",
      description: "We are looking for an experienced software engineer to join our team...",
      salaryMin: 25000, // Monthly salary in ILS
      salaryMax: 35000, // Monthly salary in ILS
      status: "Open",
      dateAdded: new Date("2023-08-15")
    };
    
    const position2: Position = {
      id: this.positionsId++,
      title: "Product Manager",
      company: "InnoTech",
      location: "Herzliya",
      description: "Seeking a product manager to lead our product development efforts...",
      salaryMin: 22000, // Monthly salary in ILS
      salaryMax: 32000, // Monthly salary in ILS
      status: "Open",
      dateAdded: new Date("2023-08-10")
    };
    
    const position3: Position = {
      id: this.positionsId++,
      title: "UX Designer",
      company: "GlobalSoft",
      location: "Jerusalem",
      description: "Looking for a talented UX designer to improve our user experience...",
      salaryMin: 18000, // Monthly salary in ILS
      salaryMax: 24000, // Monthly salary in ILS
      status: "Closed",
      dateAdded: new Date("2023-07-22")
    };
    
    this.positions.set(position1.id, position1);
    this.positions.set(position2.id, position2);
    this.positions.set(position3.id, position3);
    
    // Sample candidates
    const candidate1: Candidate = {
      id: this.candidatesId++,
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
    };
    
    const candidate2: Candidate = {
      id: this.candidatesId++,
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
    };
    
    const candidate3: Candidate = {
      id: this.candidatesId++,
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
    };
    
    this.candidates.set(candidate1.id, candidate1);
    this.candidates.set(candidate2.id, candidate2);
    this.candidates.set(candidate3.id, candidate3);
    
    // Sample referrals
    const referral1: Referral = {
      id: this.referralsId++,
      candidateId: candidate3.id,
      positionId: position3.id,
      referralDate: new Date("2023-07-15"),
      status: "Hired",
      notes: "Great fit for the team, started August 1st",
      feeEarned: 25000,
      mode: "Placement",
      feeType: "OneTime",
      feeMonths: null
    };
    
    const referral2: Referral = {
      id: this.referralsId++,
      candidateId: candidate2.id,
      positionId: position2.id,
      referralDate: new Date("2023-08-05"),
      status: "Interviewing",
      notes: "Second interview scheduled next week",
      feeEarned: null,
      mode: "Placement",
      feeType: "OneTime",
      feeMonths: null
    };
    
    const referral3: Referral = {
      id: this.referralsId++,
      candidateId: candidate1.id,
      positionId: position1.id,
      referralDate: new Date("2023-08-10"),
      status: "Referred",
      notes: "Initial screening call scheduled",
      feeEarned: null,
      mode: "Outsource",
      feeType: "Monthly",
      feeMonths: 3
    };
    
    this.referrals.set(referral1.id, referral1);
    this.referrals.set(referral2.id, referral2);
    this.referrals.set(referral3.id, referral3);
    
    // Sample activities
    const activity1: Activity = {
      id: this.activitiesId++,
      type: "candidate_added",
      description: "Added a new candidate: Sarah Johnson",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      relatedId: candidate1.id,
      relatedType: "candidate"
    };
    
    const activity2: Activity = {
      id: this.activitiesId++,
      type: "referral_created",
      description: "Made a new referral: Michael Chen for Product Manager at InnoTech",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      relatedId: referral2.id,
      relatedType: "referral"
    };
    
    const activity3: Activity = {
      id: this.activitiesId++,
      type: "position_added",
      description: "Added a new position: Product Manager at InnoTech",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      relatedId: position2.id,
      relatedType: "position"
    };
    
    const activity4: Activity = {
      id: this.activitiesId++,
      type: "referral_updated",
      description: "Received referral fee: ₪25,000 for Emma Davis",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      relatedId: referral1.id,
      relatedType: "referral"
    };
    
    this.activities.set(activity1.id, activity1);
    this.activities.set(activity2.id, activity2);
    this.activities.set(activity3.id, activity3);
    this.activities.set(activity4.id, activity4);
  }
  
  // Position methods
  async getAllPositions(): Promise<Position[]> {
    return Array.from(this.positions.values());
  }
  
  async getPosition(id: number): Promise<Position | undefined> {
    return this.positions.get(id);
  }
  
  async createPosition(position: InsertPosition): Promise<Position> {
    const id = this.positionsId++;
    const now = new Date();
    const newPosition: Position = { 
      ...position, 
      id,
      dateAdded: position.dateAdded || now
    };
    
    this.positions.set(id, newPosition);
    
    // Create activity
    await this.createActivity({
      type: "position_added",
      description: `Added a new position: ${position.title} at ${position.company}`,
      timestamp: now,
      relatedId: id,
      relatedType: "position"
    });
    
    return newPosition;
  }
  
  async updatePosition(id: number, position: Partial<InsertPosition>): Promise<Position | undefined> {
    const existingPosition = this.positions.get(id);
    
    if (!existingPosition) {
      return undefined;
    }
    
    const updatedPosition: Position = { ...existingPosition, ...position };
    this.positions.set(id, updatedPosition);
    
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
    const position = this.positions.get(id);
    if (!position) {
      return false;
    }
    
    // Check if position is referenced by any referrals
    const referrals = Array.from(this.referrals.values()).filter(r => r.positionId === id);
    if (referrals.length > 0) {
      return false;
    }
    
    const deleted = this.positions.delete(id);
    
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
  
  // Candidate methods
  async getAllCandidates(): Promise<Candidate[]> {
    return Array.from(this.candidates.values());
  }
  
  async getCandidate(id: number): Promise<Candidate | undefined> {
    return this.candidates.get(id);
  }
  
  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const id = this.candidatesId++;
    const newCandidate: Candidate = { ...candidate, id };
    
    this.candidates.set(id, newCandidate);
    
    // Create activity
    await this.createActivity({
      type: "candidate_added",
      description: `Added a new candidate: ${candidate.fullName}`,
      timestamp: new Date(),
      relatedId: id,
      relatedType: "candidate"
    });
    
    return newCandidate;
  }
  
  async updateCandidate(id: number, candidate: Partial<InsertCandidate>): Promise<Candidate | undefined> {
    const existingCandidate = this.candidates.get(id);
    
    if (!existingCandidate) {
      return undefined;
    }
    
    const updatedCandidate: Candidate = { ...existingCandidate, ...candidate };
    this.candidates.set(id, updatedCandidate);
    
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
    const candidate = this.candidates.get(id);
    if (!candidate) {
      return false;
    }
    
    // Check if candidate is referenced by any referrals
    const referrals = Array.from(this.referrals.values()).filter(r => r.candidateId === id);
    if (referrals.length > 0) {
      return false;
    }
    
    const deleted = this.candidates.delete(id);
    
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
  
  // Referral methods
  async getAllReferrals(): Promise<ReferralWithDetails[]> {
    const referrals = Array.from(this.referrals.values());
    return referrals.map(referral => {
      const candidate = this.candidates.get(referral.candidateId)!;
      const position = this.positions.get(referral.positionId)!;
      return { ...referral, candidate, position };
    });
  }
  
  async getReferral(id: number): Promise<ReferralWithDetails | undefined> {
    const referral = this.referrals.get(id);
    
    if (!referral) {
      return undefined;
    }
    
    const candidate = this.candidates.get(referral.candidateId)!;
    const position = this.positions.get(referral.positionId)!;
    
    return { ...referral, candidate, position };
  }
  
  async createReferral(referral: InsertReferral): Promise<Referral> {
    const id = this.referralsId++;
    const now = new Date();
    
    // Set default values for new fields if not provided
    const mode = referral.mode || "Placement";
    const feeType = referral.feeType || "OneTime";
    
    const newReferral: Referral = { 
      ...referral, 
      id,
      referralDate: referral.referralDate || now,
      mode: mode,
      feeType: feeType,
      feeMonths: referral.feeMonths || null
    };
    
    this.referrals.set(id, newReferral);
    
    // Get candidate and position for the activity description
    const candidate = this.candidates.get(referral.candidateId);
    const position = this.positions.get(referral.positionId);
    
    // Create activity
    if (candidate && position) {
      await this.createActivity({
        type: "referral_created",
        description: `Made a new referral: ${candidate.fullName} for ${position.title} at ${position.company}`,
        timestamp: now,
        relatedId: id,
        relatedType: "referral"
      });
    }
    
    return newReferral;
  }
  
  async updateReferral(id: number, referral: Partial<InsertReferral>): Promise<Referral | undefined> {
    const existingReferral = this.referrals.get(id);
    
    if (!existingReferral) {
      return undefined;
    }
    
    const updatedReferral: Referral = { ...existingReferral, ...referral };
    this.referrals.set(id, updatedReferral);
    
    // Check if status changed to Hired and fee was earned
    if (
      referral.status === "Hired" && 
      existingReferral.status !== "Hired" && 
      referral.feeEarned
    ) {
      const candidate = this.candidates.get(existingReferral.candidateId);
      
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
    const referral = this.referrals.get(id);
    if (!referral) {
      return false;
    }
    
    const deleted = this.referrals.delete(id);
    
    if (deleted) {
      const candidate = this.candidates.get(referral.candidateId);
      const position = this.positions.get(referral.positionId);
      
      if (candidate && position) {
        await this.createActivity({
          type: "referral_deleted",
          description: `Deleted referral: ${candidate.fullName} for ${position.title} at ${position.company}`,
          timestamp: new Date(),
          relatedType: "referral"
        });
      }
    }
    
    return deleted;
  }
  
  // Activity methods
  async getAllActivities(limit?: number): Promise<Activity[]> {
    const activities = Array.from(this.activities.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return limit ? activities.slice(0, limit) : activities;
  }
  
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activitiesId++;
    const newActivity: Activity = { 
      ...activity, 
      id,
      timestamp: activity.timestamp || new Date()
    };
    
    this.activities.set(id, newActivity);
    return newActivity;
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
    const openPositions = Array.from(this.positions.values()).filter(p => p.status === "Open").length;
    const activeCandidates = Array.from(this.candidates.values()).filter(c => c.status === "Looking").length;
    const referralsMade = this.referrals.size;
    
    const feesEarned = Array.from(this.referrals.values())
      .filter(r => r.status === "Hired" && r.feeEarned)
      .reduce((sum, r) => sum + (r.feeEarned || 0), 0);
    
    // Calculate monthly changes (simulated)
    return {
      openPositions,
      activeCandidates,
      referralsMade,
      feesEarned,
      monthlyChange: {
        openPositions: 3,
        activeCandidates: 5,
        referralsMade: 12,
        feesEarned: 3200
      }
    };
  }
}

export const storage = new MemStorage();
