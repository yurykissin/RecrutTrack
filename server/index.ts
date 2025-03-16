import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { seedDatabase } from "./storage-pg";
import pg from 'pg';
const { Pool } = pg;
import cors from "cors";
import session from "express-session";

declare module "express-session" {
  interface SessionData {
    user?: {
      id: number;
      name: string;
      email: string;
      role: string;
    };
  }
}

const app = express();
app.use(cors({
  origin: "http://localhost:5173", // Adjust to your frontend URL
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

if (!process.env.SESSION_SECRET) {
  console.warn("⚠️  SESSION_SECRET not set. Using fallback insecure secret.");
}

// Session middleware (must be before routes and authentication checks)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "super-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true if running behind HTTPS (e.g., in production)
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

app.use((req, _res, next) => {
  console.log("[session] Session state:", req.session);
  if (req.session?.user) {
    console.log("[session] Authenticated user:", req.session.user);
  } else {
    console.log("[session] No authenticated user.");
  }
  next();
});

app.use((req, res, next) => {
  console.log(`[request] ${req.method} ${req.url}`);
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      try {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      } catch (err) {
        logLine += " :: [Error stringifying JSON response]";
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// Initialize the database schema and seed data
const initDatabase = async () => {
  try {
    // Push schema to database using Drizzle's db:push functionality
    console.log("Pushing schema to database...", "database");
    
    // We're using drizzle-orm's migrate functionality to create the tables
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    // Push schema changes directly to the database
    console.log("Creating database tables if they don't exist...", "database");
    
    // This is where we would normally use migrations, but for simplicity,
    // we're directly pushing the schema changes to the database
    await pool.query(`
      CREATE TABLE IF NOT EXISTS positions (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        location TEXT NOT NULL,
        description TEXT NOT NULL,
        salary_min INTEGER NOT NULL,
        salary_max INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'Open',
        date_added TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS candidates (
        id SERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        "current_role" TEXT NOT NULL,
        skills TEXT NOT NULL,
        experience INTEGER NOT NULL,
        salary_expectation INTEGER,
        notes TEXT,
        availability TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Looking'
      );
      
      CREATE TABLE IF NOT EXISTS referrals (
        id SERIAL PRIMARY KEY,
        candidate_id INTEGER NOT NULL,
        position_id INTEGER NOT NULL,
        referral_date TIMESTAMP NOT NULL DEFAULT NOW(),
        status TEXT NOT NULL DEFAULT 'Referred',
        notes TEXT,
        fee_earned DOUBLE PRECISION,
        mode TEXT NOT NULL DEFAULT 'Placement',
        fee_type TEXT NOT NULL DEFAULT 'OneTime',
        fee_months INTEGER
      );
      
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        related_id INTEGER,
        related_type TEXT
      );
      
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT,
        provider TEXT DEFAULT 'local',
        provider_id TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        last_login TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // Seed the database with initial data
    await seedDatabase();
    
    console.log("Database initialization completed", "database");
  } catch (error) {
    console.log(`Error initializing database: ${error}`, "database");
    console.error("Database initialization error:", error);
  }
};

(async () => {
  // Initialize database before starting the server
  await initDatabase();
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 3000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 3000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    console.log(`serving on port ${port}`);
  });
})();
