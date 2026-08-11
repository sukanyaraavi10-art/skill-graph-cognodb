import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import driver from "./database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
const JWT_SECRET = process.env.JWT_SECRET;
// Register
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email and password are required"
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters"
    });
  }

  const session = driver.session();

  try {
    const existingUser = await session.run(
      `
      MATCH (u:User {email: $email})
      RETURN u
      LIMIT 1
      `,
      { email }
    );

    if (existingUser.records.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await session.run(
      `
      CREATE (u:User {
        name: $name,
        email: $email,
        passwordHash: $passwordHash
      })
      `,
      {
        name,
        email,
        passwordHash
      }
    );

    res.status(201).json({
      success: true,
      message: "Registration successful"
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to register user"
    });
  } finally {
    await session.close();
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required"
    });
  }

  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (u:User {email: $email})
      RETURN u.name AS name,
             u.email AS email,
             u.passwordHash AS passwordHash
      LIMIT 1
      `,
      { email }
    );

    if (result.records.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const user = result.records[0];

    const name = user.get("name");
    const userEmail = user.get("email");
    const passwordHash = user.get("passwordHash");

    const passwordMatch = await bcrypt.compare(password, passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        email: userEmail,
        name
      },
      JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        name,
        email: userEmail
      }
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to login"
    });
  } finally {
    await session.close();
  }
});
// Health check
app.get("/api/health", (req, res) => {
  res.json({
    message: "SkillGraph backend is running"
  });
});

// CognoDB connection test
app.get("/api/db-test", async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(
      "RETURN 'CognoDB connection successful!' AS message"
    );

    res.json({
      success: true,
      message: result.records[0].get("message")
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to connect to CognoDB"
    });
  } finally {
    await session.close();
  }
});

// Get complete graph data
app.get("/api/graph", async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (n)-[r]->(m)
      RETURN
        labels(n) AS fromLabels,
        properties(n) AS fromProperties,
        type(r) AS relationship,
        labels(m) AS toLabels,
        properties(m) AS toProperties
      LIMIT 100
    `);

    const graph = result.records.map((record) => ({
      from: {
        labels: record.get("fromLabels"),
        properties: record.get("fromProperties")
      },
      relationship: record.get("relationship"),
      to: {
        labels: record.get("toLabels"),
        properties: record.get("toProperties")
      }
    }));

    res.json({
      success: true,
      data: graph
    });
  } catch (error) {
    console.error("Graph query error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch graph data"
    });
  } finally {
    await session.close();
  }
});
// Get career paths for a user
app.get("/api/career-path/:name", async (req, res) => {
  const { name } = req.params;
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (u:User {name: $name})
            -[:HAS_SKILL]->(s:Skill)
            -[:REQUIRED_FOR]->(j:Job)
            -[:OFFERED_BY]->(c:Company)
      RETURN
        u.name AS user,
        s.name AS skill,
        j.title AS job,
        c.name AS company
      ORDER BY skill, job
      `,
      {
        name
      }
    );

    const careerPaths = result.records.map((record) => ({
      user: record.get("user"),
      skill: record.get("skill"),
      job: record.get("job"),
      company: record.get("company")
    }));

    res.json({
      success: true,
      data: careerPaths
    });
  } catch (error) {
    console.error("Career path query error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch career paths"
    });
  } finally {
    await session.close();
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});