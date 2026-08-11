function GraphExplorer({ user, paths }) {
  const skills = [...new Set(paths.map((path) => path.skill))];
  const jobs = [...new Set(paths.map((path) => path.job))];
  const companies = [...new Set(paths.map((path) => path.company))];

  return (
    <section className="graph-section">
      <div className="section-label">GRAPH EXPLORER</div>

      <div className="graph-heading">
        <div>
          <h2>How {user}'s career graph connects</h2>
          <p>
            Follow the relationships from user → skills → jobs → companies.
          </p>
        </div>

        <div className="graph-badge">
          {skills.length + jobs.length + companies.length} nodes
        </div>
      </div>

      <div className="graph-container">

        {/* USER */}
        <div className="graph-column">
          <div className="graph-column-title">USER</div>

          <div className="graph-node user-node">
            <span className="node-icon">●</span>
            <strong>{user}</strong>
          </div>
        </div>

        <div className="graph-arrow">→</div>

        {/* SKILLS */}
        <div className="graph-column">
          <div className="graph-column-title">SKILLS</div>

          {skills.map((skill) => (
            <div className="graph-node skill-node" key={skill}>
              <span className="node-icon">✦</span>
              <strong>{skill}</strong>
            </div>
          ))}
        </div>

        <div className="graph-arrow">→</div>

        {/* JOBS */}
        <div className="graph-column">
          <div className="graph-column-title">JOBS</div>

          {jobs.map((job) => (
            <div className="graph-node job-node" key={job}>
              <span className="node-icon">◆</span>
              <strong>{job}</strong>
            </div>
          ))}
        </div>

        <div className="graph-arrow">→</div>

        {/* COMPANIES */}
        <div className="graph-column">
          <div className="graph-column-title">COMPANIES</div>

          {companies.map((company) => (
            <div className="graph-node company-node" key={company}>
              <span className="node-icon">●</span>
              <strong>{company}</strong>
            </div>
          ))}
        </div>

      </div>

      {/* RELATIONSHIP EXPLANATION */}
      <div className="relationship-bar">
        <span>HAS_SKILL</span>
        <span>→</span>
        <span>REQUIRED_FOR</span>
        <span>→</span>
        <span>OFFERED_BY</span>
      </div>
    </section>
  );
}

export default GraphExplorer;