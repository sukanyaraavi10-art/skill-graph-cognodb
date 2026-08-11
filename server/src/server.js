import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import driver from "./database.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

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