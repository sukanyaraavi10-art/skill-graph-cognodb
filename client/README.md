# SkillGraph

SkillGraph is a graph-powered career exploration application built with React, Express, Neo4j Driver, and CognoDB.

The application helps users explore how their skills connect to career opportunities and companies.

---

## What is SkillGraph?

SkillGraph models career information as a graph.

A user has skills, skills are required for jobs, and jobs are offered by companies.

Example:

User → Skill → Job → Company

For example:

Ravi
→ JavaScript
→ Frontend Developer
→ Google

Ravi
→ React
→ Full Stack Developer
→ TCS

---

## Why a Graph Database?

A graph database is useful for SkillGraph because the important information is about relationships and connections.

The application needs to answer questions such as:

- What skills does a user have?
- What jobs can those skills lead to?
- Which companies offer those jobs?
- What career paths exist through multiple relationships?

These questions naturally map to graph traversal.

The same information could be stored in relational tables, but finding connected paths across multiple tables would require several joins.

With a graph database, the relationships are first-class data and multi-hop traversal is straightforward.

For example:

User
→ HAS_SKILL
→ Skill
→ REQUIRED_FOR
→ Job
→ OFFERED_BY
→ Company

This makes the graph model a natural fit for the application.

---

## Graph Data Model

The application uses four main node types:

- User
- Skill
- Job
- Company

Relationships:

- User -[:HAS_SKILL]-> Skill
- Skill -[:REQUIRED_FOR]-> Job
- Job -[:OFFERED_BY]-> Company

### Graph Structure

```text
┌─────────┐
│  User   │
└────┬────┘
     │
     │ HAS_SKILL
     ↓
┌─────────┐
│  Skill  │
└────┬────┘
     │
     │ REQUIRED_FOR
     ↓
┌─────────┐
│   Job   │
└────┬────┘
     │
     │ OFFERED_BY
     ↓
┌─────────┐
│ Company │
└─────────┘