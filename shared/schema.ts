import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Position Schema
export const positions = pgTable("positions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  salaryMin: integer("salary_min").notNull(),
  salaryMax: integer("salary_max").notNull(),
  status: text("status").notNull().default("Open"), // Open or Closed
  dateAdded: timestamp("date_added").notNull().defaultNow(),
});

export const insertPositionSchema = createInsertSchema(positions).omit({
  id: true,
});

// Candidate Schema
export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  currentRole: text("current_role").notNull(),
  skills: text("skills").notNull(), // Comma-separated skills
  experience: integer("experience").notNull(), // Years of experience
  salaryExpectation: integer("salary_expectation"), // Monthly salary expectation in ILS
  notes: text("notes"),
  availability: text("availability").notNull(), // immediate, 2weeks, 1month, 3months
  status: text("status").notNull().default("Looking"), // Looking or Placed
});

export const insertCandidateSchema = createInsertSchema(candidates).omit({
  id: true,
});

// Referral Schema
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull(),
  positionId: integer("position_id").notNull(),
  referralDate: timestamp("referral_date").notNull().defaultNow(),
  status: text("status").notNull().default("Referred"), // Referred, Interviewing, Hired, Rejected
  notes: text("notes"),
  feeEarned: doublePrecision("fee_earned"), // Only set when status is Hired
  mode: text("mode").notNull().default("Placement"), // Placement or Outsource
  feeType: text("fee_type").notNull().default("OneTime"), // OneTime or Monthly
  feeMonths: integer("fee_months"), // Number of months for outsource mode
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
});

// Activity Schema for dashboard
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // candidate_added, position_added, referral_created, referral_updated
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  relatedId: integer("related_id"), // ID of the related entity (position, candidate, or referral)
  relatedType: text("related_type"), // Type of the related entity (position, candidate, or referral)
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
});

// Types
export type Position = typeof positions.$inferSelect;
export type InsertPosition = z.infer<typeof insertPositionSchema>;

export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"), // Hashed password (might be null for OAuth users)
  provider: text("provider").default("local"), // "local", "google", etc.
  providerId: text("provider_id"), // ID from the provider
  role: text("role").notNull().default("user"), // user, admin
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  lastLogin: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Extended types with joined data
export type ReferralWithDetails = Referral & {
  candidate: Candidate;
  position: Position;
};
