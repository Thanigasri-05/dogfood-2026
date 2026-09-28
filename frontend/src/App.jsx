import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setError(data.error || "Login failed");
        return;
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          user_id: data.user_id,
          name: data.name,
          email: data.email,
          role: data.role,
        })
      );

      onLogin(data);
    } catch (err) {
      setError("Cannot connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand">
          <div className="brand-mark">D</div>
          <div>
            <h1>Dogfood 2026</h1>
            <p>Hackathon Management Platform</p>
          </div>
        </div>

        <h2>Welcome back</h2>
        <p className="muted">Sign in to continue to your dashboard.</p>

        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="error-box">{error}</div>}

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Navbar({ user, page, setPage, onLogout }) {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <div className="brand-mark small">D</div>
        <span>Dogfood 2026</span>
      </div>

      <div className="nav-links">
        <button
          className={page === "dashboard" ? "nav-link active" : "nav-link"}
          onClick={() => setPage("dashboard")}
        >
          Dashboard
        </button>

        <button
          className={page === "gallery" ? "nav-link active" : "nav-link"}
          onClick={() => setPage("gallery")}
        >
          Public Gallery
        </button>
      </div>

      <div className="nav-user">
        <div>
          <strong>{user.name}</strong>
          <span>{user.role}</span>
        </div>

        <button className="logout-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

function PublicGallery() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadGallery = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/gallery/`);

      if (!response.ok) {
        throw new Error("Failed to load gallery");
      }

      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError("Unable to load public gallery.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const filteredProjects = projects.filter((project) => {
    const text = `
      ${project.project_name}
      ${project.description}
      ${project.team_name}
      ${project.track_name}
    `.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">PUBLIC</p>
          <h1>Hackathon Gallery</h1>
          <p className="muted">
            Explore projects submitted to Hackathon 2026.
          </p>
        </div>

        <button className="secondary-button" onClick={loadGallery}>
          Refresh
        </button>
      </div>

      <div className="gallery-search">
        <input
          type="text"
          placeholder="Search projects, teams, tracks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <div className="empty-card">Loading projects...</div>}

      {error && <div className="error-box">{error}</div>}

      {!loading && !error && filteredProjects.length === 0 && (
        <div className="empty-card">
          No projects found.
        </div>
      )}

      {!loading && !error && filteredProjects.length > 0 && (
        <div className="gallery-grid">
          {filteredProjects.map((project) => (
            <div className="project-card" key={project.submission_id}>
              <div className="project-card-top">
                <span className="track-badge">
                  {project.track_name}
                </span>

                <span className="submission-id">
                  #{project.submission_id}
                </span>
              </div>

              <h2>{project.project_name}</h2>

              <p className="project-description">
                {project.description}
              </p>

              <div className="project-meta">
                <div>
                  <span>Team</span>
                  <strong>{project.team_name}</strong>
                </div>

                <div>
                  <span>Track</span>
                  <strong>{project.track_name}</strong>
                </div>
              </div>

              <div className="project-actions">
                {project.repository_url && (
                  <a
                    href={project.repository_url}
                    target="_blank"
                    rel="noreferrer"
                    className="secondary-button"
                  >
                    Repository ↗
                  </a>
                )}

                {project.demo_url && (
                  <a
                    href={project.demo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="primary-button link-button"
                  >
                    Live Demo ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ParticipantDashboard({ token }) {
  const [teams, setTeams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [teamsResponse, submissionsResponse] = await Promise.all([
        fetch(`${API}/teams/my`, { headers }),
        fetch(`${API}/submissions/my`, { headers }),
      ]);

      const teamsData = await teamsResponse.json();
      const submissionsData = await submissionsResponse.json();

      setTeams(Array.isArray(teamsData) ? teamsData : []);
      setSubmissions(
        Array.isArray(submissionsData) ? submissionsData : []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentTeam = teams.length > 0 ? teams[0] : null;
  const currentSubmission =
    submissions.length > 0 ? submissions[0] : null;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">PARTICIPANT</p>
          <h1>Hackathon Dashboard</h1>
          <p className="muted">
            Manage your team and submissions.
          </p>
        </div>

        <button className="secondary-button" onClick={loadData}>
          Refresh
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Teams</span>
          <strong>{loading ? "..." : teams.length}</strong>
        </div>

        <div className="stat-card">
          <span>Submissions</span>
          <strong>{loading ? "..." : submissions.length}</strong>
        </div>

        <div className="stat-card">
          <span>Event</span>
          <strong>Hackathon 2026</strong>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="content-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">TEAM</p>
              <h2>Current Team</h2>
            </div>
          </div>

          {currentTeam ? (
            <div className="detail-block">
              <h3>{currentTeam.name}</h3>
              <p>
                Team ID: <strong>#{currentTeam.id}</strong>
              </p>
            </div>
          ) : (
            <div className="empty-card">
              You are not part of a team yet.
            </div>
          )}
        </div>

        <div className="content-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">SUBMISSION</p>
              <h2>Current Submission</h2>
            </div>
          </div>

          {currentSubmission ? (
            <div className="detail-block">
              <h3>{currentSubmission.project_name}</h3>
              <p>{currentSubmission.description}</p>

              <span className="status-badge">
                {currentSubmission.status || "submitted"}
              </span>
            </div>
          ) : (
            <div className="empty-card">
              No submission found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function JudgeDashboard({ token }) {
  const [assignments, setAssignments] = useState([]);
  const [rubric, setRubric] = useState(null);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadData = async () => {
    setLoading(true);

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const assignmentsResponse = await fetch(
        `${API}/judging/assignments/my`,
        { headers }
      );

      const assignmentsData = await assignmentsResponse.json();
      setAssignments(
        Array.isArray(assignmentsData) ? assignmentsData : []
      );

      const rubricResponse = await fetch(
        `${API}/judging/rubrics/1`,
        { headers }
      );

      const rubricData = await rubricResponse.json();
      setRubric(rubricData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScoreChange = (criterionId, value) => {
    setScores((previous) => ({
      ...previous,
      [criterionId]: value,
    }));
  };

  const submitScores = async () => {
    setMessage("");

    try {
      const criteria = rubric?.criteria || [];

      for (const criterion of criteria) {
        const value = Number(scores[criterion.id]);

        if (Number.isNaN(value)) {
          setMessage("Please enter all scores.");
          return;
        }

        const response = await fetch(`${API}/judging/score`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            submission_id: 1,
            criterion_id: criterion.id,
            score: value,
            comment: "",
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || "Score submission failed");
        }
      }

      setMessage("Scores submitted successfully ✓");
    } catch (error) {
      setMessage(error.message || "Failed to submit scores.");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">JUDGE</p>
          <h1>Judge Dashboard</h1>
          <p className="muted">
            Review your assigned hackathon submissions.
          </p>
        </div>

        <button className="secondary-button" onClick={loadData}>
          Refresh
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Assignments</span>
          <strong>{loading ? "..." : assignments.length}</strong>
        </div>

        <div className="stat-card">
          <span>Criteria</span>
          <strong>{rubric?.criteria?.length || 0}</strong>
        </div>

        <div className="stat-card">
          <span>Event</span>
          <strong>Hackathon 2026</strong>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <div>
            <p className="eyebrow">SCORING</p>
            <h2>AI Hackathon Project</h2>
          </div>
        </div>

        {rubric?.criteria?.map((criterion) => (
          <div className="criterion-row" key={criterion.id}>
            <div>
              <strong>{criterion.name}</strong>
              <p>
                Weight: {criterion.weight}% · Max: {criterion.max_score}
              </p>
            </div>

            <input
              type="number"
              min="0"
              max={criterion.max_score}
              step="0.1"
              placeholder="Score"
              value={scores[criterion.id] || ""}
              onChange={(e) =>
                handleScoreChange(criterion.id, e.target.value)
              }
            />
          </div>
        ))}

        {message && (
          <div
            className={
              message.includes("successfully")
                ? "success-box"
                : "error-box"
            }
          >
            {message}
          </div>
        )}

        <button className="primary-button" onClick={submitScores}>
          Submit Scores
        </button>
      </div>
    </div>
  );
}

function OrganizerDashboard({ token }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadLeaderboard = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `${API}/judging/leaderboard/1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      setLeaderboard(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = async () => {
    try {
      const response = await fetch(
        `${API}/judging/leaderboard/1/csv`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("CSV download failed");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = "event_1_leaderboard.csv";

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("CSV download failed.");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">ORGANIZER</p>
          <h1>Hackathon overview</h1>
          <p className="muted">
            Manage judging and review final results.
          </p>
        </div>

        <div className="header-actions">
          <button
            className="secondary-button"
            onClick={loadLeaderboard}
          >
            {loading ? "Loading..." : "Refresh leaderboard"}
          </button>

          <button
            className="primary-button"
            onClick={downloadCSV}
          >
            Download CSV
          </button>
        </div>
      </div>

      <div className="overview-card">
        <div>
          <span>Event</span>
          <strong>Hackathon 2026</strong>
        </div>

        <div>
          <span>Submissions scored</span>
          <strong>{leaderboard.length}</strong>
        </div>

        <div>
          <span>Status</span>
          <strong className="status-badge">Judging active</strong>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <div>
            <p className="eyebrow">RESULTS</p>
            <h2>Leaderboard</h2>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <div className="empty-card">
            Click <strong>Refresh leaderboard</strong> to load results.
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Project</th>
                  <th>Team</th>
                  <th>Score</th>
                </tr>
              </thead>

              <tbody>
                {leaderboard.map((item, index) => (
                  <tr key={item.submission_id || index}>
                    <td>
                      <strong>
                        {item.rank || index + 1}
                      </strong>
                    </td>

                    <td>
                      {item.project_name ||
                        item.submission_id}
                    </td>

                    <td>
                      {item.team_name || "-"}
                    </td>

                    <td>
                      <strong>
                        {Number(
                          item.final_score ?? item.score ?? 0
                        ).toFixed(2)}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("token") || ""
  );

  const [page, setPage] = useState("dashboard");

  const handleLogin = (data) => {
    setUser({
      user_id: data.user_id,
      name: data.name,
      email: data.email,
      role: data.role,
    });

    setToken(data.access_token);
    setPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken("");
    setUser(null);
    setPage("dashboard");
  };

  if (!user || !token) {
    return <Login onLogin={handleLogin} />;
  }

  let dashboard = null;

  if (user.role === "judge") {
    dashboard = <JudgeDashboard token={token} />;
  } else if (user.role === "organizer" || user.role === "admin") {
    dashboard = <OrganizerDashboard token={token} />;
  } else {
    dashboard = <ParticipantDashboard token={token} />;
  }

  return (
    <div className="app">
      <Navbar
        user={user}
        page={page}
        setPage={setPage}
        onLogout={handleLogout}
      />

      <main>
        {page === "gallery" ? (
          <PublicGallery />
        ) : (
          dashboard
        )}
      </main>
    </div>
  );
}

export default App;