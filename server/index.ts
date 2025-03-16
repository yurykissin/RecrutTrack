import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./storage-pg";
// import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const { Pool } = pg;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Initialize the database schema and seed data
const initDatabase = async () => {
  try {
    // Push schema to database using Drizzle's db:push functionality
    log("Pushing schema to database...", "database");
    
    // We're using drizzle-orm's migrate functionality to create the tables
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    const db = drizzle(pool);
    
    // Push schema changes directly to the database
    log("Creating database tables if they don't exist...", "database");
    
    // This is where we would normally use migrations, but for simplicity,
    // we're directly pushing the schema changes to the database
    await db.execute(`
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
    
    log("Database initialization completed", "database");
  } catch (error) {
    log(`Error initializing database: ${error}`, "database");
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

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
