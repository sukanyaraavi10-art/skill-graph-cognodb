import { useEffect, useState } from "react";
import "./App.css";
import GraphExplorer from "./GraphExplorer";
import Login from "./Login";
import Register from "./Register";

const API_URL = "https://skill-graph-cognodb.onrender.com";

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [showRegister, setShowRegister] = useState(false);

  const selectedUser = currentUser?.name || "";

  const [careerPaths, setCareerPaths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (user) => {
    setCurrentUser(user);
    setShowRegister(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setCareerPaths([]);
  };

  const fetchCareerPaths = async (userName) => {
    setLoading(true);
    setError("");
    setCareerPaths([]);

    try {
      const response = await fetch(
        `${API_URL}/api/career-path/${encodeURIComponent(userName)}`
      );

      if (!response.ok) {
        throw new Error("Unable to fetch career paths");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Something went wrong");
      }

      setCareerPaths(result.data);
    } catch (error) {
      console.error("Career path error:", error);

      setError(
        "Unable to connect to the SkillGraph server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      fetchCareerPaths(selectedUser);
    }
  }, [selectedUser]);

  const skills = [
    ...new Set(careerPaths.map((path) => path.skill)),
  ];

  if (!currentUser) {
    if (showRegister) {
      return (
        <Register
          onRegister={() => setShowRegister(false)}
          onShowLogin={() => setShowRegister(false)}
        />
      );
    }

    return (
      <Login
        onLogin={handleLogin}
        onShowRegister={() => setShowRegister(true)}
      />
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="brand">
          <div className="brand-mark">S</div>

          <div>
            <h1>SkillGraph</h1>
            <p>Career intelligence powered by graph data</p>
          </div>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          CognoDB Connected
        </div>
      </header>

      {/* Main */}
      <main className="main-container">
        {/* Hero */}
        <section className="hero">
          <div className="hero-content">
            <span className="eyebrow">
              GRAPH-POWERED CAREER EXPLORER
            </span>

            <h2>
              Discover where your
              <span> skills </span>
              can take you.
            </h2>

            <p>
              Explore the connection between your skills, career
              opportunities, and companies using SkillGraph.
            </p>
          </div>
        </section>

        {/* User Selection */}
        <section className="control-card">
          <div>
            <p className="section-label">SELECT PROFILE</p>

            <h3>Explore your career path</h3>

            <p className="muted">
              Discover connected skills, jobs and companies.
            </p>
          </div>

          <div className="select-wrapper">
            <label>User</label>

            <strong>{currentUser.name}</strong>

            <button
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </section>

        {/* Error */}
        {error && (
          <section className="message-card error-card">
            <div className="message-icon">!</div>

            <div>
              <h3>Connection problem</h3>

              <p>{error}</p>

              <button
                className="retry-button"
                onClick={() => fetchCareerPaths(selectedUser)}
              >
                Try again
              </button>
            </div>
          </section>
        )}

        {/* Loading */}
        {loading && (
          <section className="message-card">
            <div className="loader"></div>

            <div>
              <h3>Finding career connections...</h3>

              <p>
                SkillGraph is traversing your skills, jobs and companies.
              </p>
            </div>
          </section>
        )}

        {/* Skills */}
        {!loading && !error && careerPaths.length > 0 && (
          <>
            <section className="section">
              <div className="section-heading">
                <div>
                  <p className="section-label">
                    CONNECTED SKILLS
                  </p>

                  <h3>{selectedUser}'s Skills</h3>
                </div>

                <span className="count-badge">
                  {skills.length} skills
                </span>
              </div>

              <div className="skills-grid">
                {skills.map((skill) => (
                  <div
                    className="skill-card"
                    key={skill}
                  >
                    <div className="skill-icon">✦</div>

                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Graph Explorer */}
            <GraphExplorer
              user={selectedUser}
              paths={careerPaths}
            />

            {/* Career Paths */}
            <section className="section">
              <div className="section-heading">
                <div>
                  <p className="section-label">
                    GRAPH TRAVERSAL
                  </p>

                  <h3>Career Opportunities</h3>
                </div>

                <span className="count-badge">
                  {careerPaths.length} paths
                </span>
              </div>

              <div className="career-grid">
                {careerPaths.map((path, index) => (
                  <article
                    className="career-card"
                    key={`${path.skill}-${path.job}-${path.company}-${index}`}
                  >
                    <div className="card-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="path">
                      <div className="path-item">
                        <span className="path-type">
                          SKILL
                        </span>

                        <strong>{path.skill}</strong>
                      </div>

                      <div className="path-line"></div>

                      <div className="path-item">
                        <span className="path-type">
                          JOB
                        </span>

                        <strong>{path.job}</strong>
                      </div>

                      <div className="path-line"></div>

                      <div className="path-item company-item">
                        <span className="path-type">
                          COMPANY
                        </span>

                        <strong>{path.company}</strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Empty state */}
        {!loading &&
          !error &&
          careerPaths.length === 0 && (
            <section className="message-card">
              <div className="message-icon">?</div>

              <div>
                <h3>No career paths found</h3>

                <p>
                  There are currently no connected career
                  paths for this user.
                </p>
              </div>
            </section>
          )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>
          SkillGraph · Built with React, Express, Neo4j Driver & CognoDB
        </p>
      </footer>
    </div>
  );
}

export default App;