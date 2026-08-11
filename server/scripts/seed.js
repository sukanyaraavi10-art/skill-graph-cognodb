import dotenv from "dotenv";
import driver from "../src/database.js";

dotenv.config();

const session = driver.session();

async function seedDatabase() {
  try {
    console.log("Starting database seed...");

    await session.run(`
      MATCH (n)
      DETACH DELETE n
    `);

    await session.run(`
      CREATE
        (ravi:User {name: "Ravi"}),
        (sukanya:User {name: "Sukanya"}),

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
    `);

    await session.run(`
      MATCH
        (ravi:User {name: "Ravi"}),
        (sukanya:User {name: "Sukanya"}),
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

      CREATE
        (ravi)-[:HAS_SKILL]->(javascript),
        (ravi)-[:HAS_SKILL]->(react),
        (ravi)-[:HAS_SKILL]->(nodejs),

        (sukanya)-[:HAS_SKILL]->(python),
        (sukanya)-[:HAS_SKILL]->(sql),

        (javascript)-[:REQUIRED_FOR]->(frontend),
        (react)-[:REQUIRED_FOR]->(frontend),
        (nodejs)-[:REQUIRED_FOR]->(backend),
        (python)-[:REQUIRED_FOR]->(backend),
        (javascript)-[:REQUIRED_FOR]->(fullstack),
        (react)-[:REQUIRED_FOR]->(fullstack),
        (nodejs)-[:REQUIRED_FOR]->(fullstack),
        (python)-[:REQUIRED_FOR]->(dataAnalyst),
        (sql)-[:REQUIRED_FOR]->(dataAnalyst),

        (frontend)-[:OFFERED_BY]->(google),
        (backend)-[:OFFERED_BY]->(microsoft),
        (fullstack)-[:OFFERED_BY]->(tcs),
        (dataAnalyst)-[:OFFERED_BY]->(infosys)
    `);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Seed error:", error);
  } finally {
    await session.close();
    await driver.close();
  }
}

seedDatabase();