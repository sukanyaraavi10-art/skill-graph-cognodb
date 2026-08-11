import dotenv from "dotenv";
import driver from "../src/database.js";

dotenv.config();

const session = driver.session();

async function seedDatabase() {
  try {
    console.log("Starting database seed...");

    // Create skills
    await session.run(
      `
      MERGE (javascript:Skill {name: "JavaScript"})
      MERGE (react:Skill {name: "React"})
      MERGE (nodejs:Skill {name: "Node.js"})
      MERGE (python:Skill {name: "Python"})
      MERGE (sql:Skill {name: "SQL"})
      `
    );

    // Create jobs
    await session.run(
      `
      MERGE (frontend:Job {title: "Frontend Developer"})
      MERGE (backend:Job {title: "Backend Developer"})
      MERGE (fullstack:Job {title: "Full Stack Developer"})
      MERGE (dataAnalyst:Job {title: "Data Analyst"})
      `
    );

    // Create companies
    await session.run(
      `
      MERGE (google:Company {name: "Google"})
      MERGE (microsoft:Company {name: "Microsoft"})
      MERGE (tcs:Company {name: "TCS"})
      MERGE (infosys:Company {name: "Infosys"})
      `
    );

    // Connect skills -> jobs -> companies
    await session.run(
      `
      MATCH
        (javascript:Skill {name: "JavaScript"}),
        (react:Skill {name: "React"}),
        (nodejs:Skill {name: "Node.js"}),
        (python:Skill {name: "Python"}),
        (sql:Skill {name: "SQL"}),
        (frontend:Job {title: "Frontend Developer"}),
        (backend:Job {title: "Backend Developer"}),
        (fullstack:Job {title: "Full Stack Developer"}),
        (dataAnalyst:Job {title: "Data Analyst"}),
        (google:Company {name: "Google"}),
        (microsoft:Company {name: "Microsoft"}),
        (tcs:Company {name: "TCS"}),
        (infosys:Company {name: "Infosys"})

      MERGE (javascript)-[:REQUIRED_FOR]->(frontend)
      MERGE (react)-[:REQUIRED_FOR]->(frontend)

      MERGE (nodejs)-[:REQUIRED_FOR]->(backend)
      MERGE (python)-[:REQUIRED_FOR]->(backend)

      MERGE (javascript)-[:REQUIRED_FOR]->(fullstack)
      MERGE (react)-[:REQUIRED_FOR]->(fullstack)
      MERGE (nodejs)-[:REQUIRED_FOR]->(fullstack)

      MERGE (python)-[:REQUIRED_FOR]->(dataAnalyst)
      MERGE (sql)-[:REQUIRED_FOR]->(dataAnalyst)

      MERGE (frontend)-[:OFFERED_BY]->(google)
      MERGE (backend)-[:OFFERED_BY]->(microsoft)
      MERGE (fullstack)-[:OFFERED_BY]->(tcs)
      MERGE (dataAnalyst)-[:OFFERED_BY]->(infosys)
      `
    );

    // Connect Ravi-type users to frontend skills
    await session.run(
      `
      MATCH (u:User)
      WHERE toLower(u.name) CONTAINS "ravi"

      MATCH
        (javascript:Skill {name: "JavaScript"}),
        (react:Skill {name: "React"}),
        (nodejs:Skill {name: "Node.js"})

      MERGE (u)-[:HAS_SKILL]->(javascript)
      MERGE (u)-[:HAS_SKILL]->(react)
      MERGE (u)-[:HAS_SKILL]->(nodejs)
      `
    );

    // Connect Sukanya-type users to data/backend skills
    await session.run(
      `
      MATCH (u:User)
      WHERE toLower(u.name) CONTAINS "sukanya"

      MATCH
        (python:Skill {name: "Python"}),
        (sql:Skill {name: "SQL"})

      MERGE (u)-[:HAS_SKILL]->(python)
      MERGE (u)-[:HAS_SKILL]->(sql)
      `
    );

    // Create demo users only if they do not already exist
    await session.run(
      `
      MERGE (ravi:User {name: "Ravi"})
      MERGE (sukanya:User {name: "Sukanya"})
      `
    );

    // Give demo users their skills
    await session.run(
      `
      MATCH
        (ravi:User {name: "Ravi"}),
        (sukanya:User {name: "Sukanya"}),
        (javascript:Skill {name: "JavaScript"}),
        (react:Skill {name: "React"}),
        (nodejs:Skill {name: "Node.js"}),
        (python:Skill {name: "Python"}),
        (sql:Skill {name: "SQL"})

      MERGE (ravi)-[:HAS_SKILL]->(javascript)
      MERGE (ravi)-[:HAS_SKILL]->(react)
      MERGE (ravi)-[:HAS_SKILL]->(nodejs)

      MERGE (sukanya)-[:HAS_SKILL]->(python)
      MERGE (sukanya)-[:HAS_SKILL]->(sql)
      `
    );

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Seed error:", error);
  } finally {
    await session.close();
    await driver.close();
  }
}

seedDatabase();