import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-pg"; // Changed to use PostgreSQL storage
import { 
  insertPositionSchema, 
  insertCandidateSchema, 
  insertReferralSchema 
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { isAuthenticated } from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const apiPrefix = "/api";
  
  // POST /api/login
  // POST /api/login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("[Login Route] Request body:", req.body);

  const user = await storage.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials, wrong email" });
  }

  const isPasswordValid = password === user.password; // Use real hash comparison in production
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid credentials, wrong password" });
  }

  req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
  await storage.updateUserLastLogin(user.id);

  res.json({ message: "Logged in", user: req.session.user });
});

  // POST /api/logout
  app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ message: 'Logged out' });
    });
  });

  // GET /api/me
  app.get('/api/me', (req, res) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    res.json(req.session.user);
  });

  // Positions routes
app.get(`${apiPrefix}/positions`, isAuthenticated, async (req: Request, res: Response) => {
    try {
      const positions = await storage.getAllPositions();
      res.json(positions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch positions" });
    }
  });
  
  app.get(`${apiPrefix}/positions/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid position ID" });
      }
      
      const position = await storage.getPosition(id);
      if (!position) {
        return res.status(404).json({ message: "Position not found" });
      }
      
      res.json(position);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch position" });
    }
  });
  
  app.post(`${apiPrefix}/positions`, async (req: Request, res: Response) => {
    try {
      const result = insertPositionSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const newPosition = await storage.createPosition(result.data);
      res.status(201).json(newPosition);
    } catch (error) {
      res.status(500).json({ message: "Failed to create position" });
    }
  });
  
  app.put(`${apiPrefix}/positions/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid position ID" });
      }
      
      const result = insertPositionSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const updatedPosition = await storage.updatePosition(id, result.data);
      if (!updatedPosition) {
        return res.status(404).json({ message: "Position not found" });
      }
      
      res.json(updatedPosition);
    } catch (error) {
      res.status(500).json({ message: "Failed to update position" });
    }
  });
  
  app.delete(`${apiPrefix}/positions/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid position ID" });
      }
      
      const deleted = await storage.deletePosition(id);
      if (!deleted) {
        return res.status(404).json({ 
          message: "Position not found or cannot be deleted because it has referrals" 
        });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete position" });
    }
  });
  
  // Candidates routes
app.get(`${apiPrefix}/candidates`, isAuthenticated, async (req: Request, res: Response) => {
    try {
      const candidates = await storage.getAllCandidates();
      res.status(200).json(candidates);
    } catch (error: any) {
      console.error("Error fetching candidates:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });
  
  app.get(`${apiPrefix}/candidates/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid candidate ID" });
      }
      
      const candidate = await storage.getCandidate(id);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      
      res.json(candidate);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch candidate" });
    }
  });
  
app.post(`${apiPrefix}/candidates`, isAuthenticated, async (req: Request, res: Response) => {
    try {
      console.log("[POST /api/candidates] Received body:", req.body);
      const result = insertCandidateSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const newCandidate = await storage.createCandidate(result.data);
      res.status(201).json(newCandidate);
    } catch (error) {
      res.status(500).json({ message: "Failed to create candidate" });
    }
  });
  
  app.put(`${apiPrefix}/candidates/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid candidate ID" });
      }
      
      const result = insertCandidateSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const updatedCandidate = await storage.updateCandidate(id, result.data);
      if (!updatedCandidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      
      res.json(updatedCandidate);
    } catch (error) {
      res.status(500).json({ message: "Failed to update candidate" });
    }
  });
  
  app.delete(`${apiPrefix}/candidates/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid candidate ID" });
      }
      
      const deleted = await storage.deleteCandidate(id);
      if (!deleted) {
        return res.status(404).json({ 
          message: "Candidate not found or cannot be deleted because they have referrals" 
        });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete candidate" });
    }
  });
  
  // Referrals routes
app.get(`${apiPrefix}/referrals`, isAuthenticated, async (req: Request, res: Response) => {
    try {
      const referrals = await storage.getAllReferrals();
      res.json(referrals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch referrals" });
    }
  });
  
  app.get(`${apiPrefix}/referrals/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid referral ID" });
      }
      
      const referral = await storage.getReferral(id);
      if (!referral) {
        return res.status(404).json({ message: "Referral not found" });
      }
      
      res.json(referral);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch referral" });
    }
  });
  
  app.post(`${apiPrefix}/referrals`, async (req: Request, res: Response) => {
    try {
      const result = insertReferralSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const newReferral = await storage.createReferral(result.data);
      res.status(201).json(newReferral);
    } catch (error) {
      res.status(500).json({ message: "Failed to create referral" });
    }
  });
  
  app.put(`${apiPrefix}/referrals/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid referral ID" });
      }
      
      const result = insertReferralSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const updatedReferral = await storage.updateReferral(id, result.data);
      if (!updatedReferral) {
        return res.status(404).json({ message: "Referral not found" });
      }
      
      res.json(updatedReferral);
    } catch (error) {
      res.status(500).json({ message: "Failed to update referral" });
    }
  });
  
  app.delete(`${apiPrefix}/referrals/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid referral ID" });
      }
      
      const deleted = await storage.deleteReferral(id);
      if (!deleted) {
        return res.status(404).json({ message: "Referral not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete referral" });
    }
  });
  
  // Dashboard stats route
  app.get(`${apiPrefix}/dashboard/stats`, async (req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
  
  // Recent activities route
  app.get(`${apiPrefix}/activities`, async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const activities = await storage.getAllActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
