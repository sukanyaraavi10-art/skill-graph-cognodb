MATCH (u:User {name: "Ravi"})-[:HAS_SKILL]->(s:Skill)-[:REQUIRED_FOR]->(j:Job)-[:OFFERED_BY]->(c:Company)
RETURN
  u.name AS user,
  s.name AS skill,
  j.title AS job,
  c.name AS company
ORDER BY skill, job