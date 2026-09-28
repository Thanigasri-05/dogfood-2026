import { useEffect, useState } from "react"

const API = "http://127.0.0.1:8000"

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null")
  )

  const handleLogin = (data) => {
    localStorage.setItem("token", data.access_token)
    localStorage.setItem(
      "user",
      JSON.stringify({
        user_id: data.user_id,
        name: data.name,
        email: data.email,
        role: data.role,
      })
    )

    setToken(data.access_token)
    setUser({
      user_id: data.user_id,
      name: data.name,
      email: data.email,
      role: data.role,
    })
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
  }

  if (!token || !user) {
    return <Login onLogin={handleLogin} />
  }

  if (user.role === "judge") {
    return (
      <JudgeDashboard
        token={token}
        user={user}
        onLogout={logout}
      />
    )
  }

  if (user.role === "organizer" || user.role === "admin") {
    return (
      <OrganizerDashboard
        token={token}
        user={user}
        onLogout={logout}
      />
    )
  }

  return (
    <ParticipantDashboard
      user={user}
      onLogout={logout}
    />
  )
}

/* =========================
   LOGIN
========================= */

function Login({ onLogin }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const submitLogin = async (e) => {
    e.preventDefault()

    setLoading(true)
    setError("")

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
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error || "Login failed")
      }

      onLogin(data)
    } catch (error) {
      setError(error.message || "Backend connect aagala.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="brand-block">
          <div className="brand-mark">D</div>

          <div>
            <h1>DOGFOOD</h1>
            <span>2026</span>
          </div>
        </div>

        <div className="login-hero">
          <p className="eyebrow">HACKATHON PLATFORM</p>

          <h2>
            Build.
            <br />
            Submit.
            <br />
            Get judged.
          </h2>

          <p>
            A self-hosted hackathon management platform for
            organizers, participants and judges.
          </p>
        </div>
      </div>

      <div className="login-right">
        <form className="login-card" onSubmit={submitLogin}>
          <p className="eyebrow">WELCOME BACK</p>

          <h2>Sign in</h2>

          <p className="login-description">
            Access your Dogfood 2026 workspace.
          </p>

          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            className="primary-button login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="demo-accounts">
            <strong>Demo accounts</strong>

            <div>
              Organizer: user@example.com
            </div>

            <div>
              Judge: judge@example.com
            </div>

            <div>
              Password: string
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

/* =========================
   NAVBAR
========================= */

function Navbar({ title, user, onLogout }) {
  return (
    <header className="topbar">
      <div className="topbar-brand">
        <div className="brand-mark small">D</div>

        <div>
          <div className="brand-name">DOGFOOD</div>
          <div className="brand-year">2026</div>
        </div>
      </div>

      <div className="topbar-title">
        {title}
      </div>

      <div className="topbar-user">
        <div className="avatar">
          {(user?.name || "U").charAt(0).toUpperCase()}
        </div>

        <div className="user-info">
          <strong>{user?.name}</strong>
          <span>{user?.role}</span>
        </div>

        <button
          className="logout-button"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </header>
  )
}

/* =========================
   JUDGE DASHBOARD
========================= */

function JudgeDashboard({ token, user, onLogout }) {
  const [assignments, setAssignments] = useState([])
  const [rubric, setRubric] = useState(null)
  const [scores, setScores] = useState({})
  const [overallComment, setOverallComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const submissionId = 1

  const loadAssignments = async () => {
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const assignmentResponse = await fetch(
        `${API}/judging/assignments/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!assignmentResponse.ok) {
        throw new Error("Unable to load assignments")
      }

      const assignmentData = await assignmentResponse.json()

      setAssignments(
        Array.isArray(assignmentData)
          ? assignmentData
          : assignmentData.assignments || []
      )

      const rubricResponse = await fetch(
        `${API}/judging/rubrics/1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!rubricResponse.ok) {
        throw new Error("Unable to load rubric")
      }

      const rubricData = await rubricResponse.json()

      setRubric(rubricData)

      const criteria =
        rubricData.criteria ||
        rubricData.criterions ||
        []

      const initialScores = {}

      criteria.forEach((criterion) => {
        initialScores[criterion.id] = ""
      })

      setScores(initialScores)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const updateScore = (criterionId, value) => {
    setScores((previous) => ({
      ...previous,
      [criterionId]: value,
    }))
  }

  const submitScores = async () => {
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const criteria =
        rubric?.criteria ||
        rubric?.criterions ||
        []

      for (const criterion of criteria) {
        const scoreValue = Number(scores[criterion.id])

        if (
          Number.isNaN(scoreValue) ||
          scores[criterion.id] === ""
        ) {
          throw new Error(
            `Please enter score for ${criterion.name}`
          )
        }

        const response = await fetch(
          `${API}/judging/score`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              submission_id: submissionId,
              criterion_id: criterion.id,
              score: scoreValue,
              comment: overallComment || null,
            }),
          }
        )

        if (!response.ok) {
          const data = await response.json().catch(() => null)

          throw new Error(
            data?.detail || "Score submission failed"
          )
        }
      }

      setMessage("Scores submitted successfully ✓")
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const criteria =
    rubric?.criteria ||
    rubric?.criterions ||
    []

  return (
    <div className="app-shell">
      <Navbar
        title="Judge Dashboard"
        user={user}
        onLogout={onLogout}
      />

      <main className="dashboard-page">
        <section className="page-heading">
          <div>
            <p className="eyebrow">JUDGING</p>

            <h1>Evaluate submissions</h1>

            <p>
              Review assigned projects and submit your scores.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={loadAssignments}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load assignments"}
          </button>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <span>Assigned events</span>
            <strong>{assignments.length}</strong>
          </div>

          <div className="stat-card">
            <span>Current submission</span>
            <strong>#{submissionId}</strong>
          </div>

          <div className="stat-card">
            <span>Criteria</span>
            <strong>{criteria.length}</strong>
          </div>
        </section>

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <section className="judge-grid">
          <div className="panel">
            <p className="eyebrow">SUBMISSION</p>

            <h2>Project to evaluate</h2>

            <label>Submission ID</label>

            <input
              value={submissionId}
              readOnly
            />

            <div className="submission-card">
              <div className="project-icon">
                AI
              </div>

              <div>
                <h3>AI Hackathon Project</h3>
                <p>Team Alpha</p>
              </div>
            </div>

            <div className="link-row">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                Repository ↗
              </a>

              <a
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                Demo ↗
              </a>
            </div>
          </div>

          <div className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">RUBRIC</p>

                <h2>
                  {rubric?.name || "Main Judging Rubric"}
                </h2>
              </div>

              <span className="badge">
                Weighted
              </span>
            </div>

            {!rubric ? (
              <div className="empty-state">
                Click <strong>Load assignments</strong> to
                load your judging rubric.
              </div>
            ) : (
              <div className="criteria-list">
                {criteria.map((criterion) => (
                  <div
                    className="criterion-card"
                    key={criterion.id}
                  >
                    <div className="criterion-header">
                      <div>
                        <h3>{criterion.name}</h3>

                        <p>
                          {criterion.description ||
                            "Evaluate this criterion."}
                        </p>
                      </div>

                      <span>
                        {criterion.weight}% weight
                      </span>
                    </div>

                    <div className="score-row">
                      <label>
                        Score
                      </label>

                      <input
                        type="number"
                        min="0"
                        max={
                          criterion.max_score || 10
                        }
                        step="0.5"
                        value={
                          scores[criterion.id] ?? ""
                        }
                        onChange={(e) =>
                          updateScore(
                            criterion.id,
                            e.target.value
                          )
                        }
                        placeholder={`0-${criterion.max_score || 10}`}
                      />
                    </div>
                  </div>
                ))}

                <div className="overall-comment">
                  <label>
                    Overall comments
                  </label>

                  <textarea
                    value={overallComment}
                    onChange={(e) =>
                      setOverallComment(
                        e.target.value
                      )
                    }
                    placeholder="Add overall feedback for this submission..."
                    rows="4"
                  />
                </div>

                <button
                  className="primary-button"
                  onClick={submitScores}
                  disabled={
                    loading || criteria.length === 0
                  }
                >
                  {loading
                    ? "Submitting..."
                    : "Submit Scores"}
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

/* =========================
   ORGANIZER DASHBOARD
========================= */

function OrganizerDashboard({
  token,
  user,
  onLogout,
}) {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [loaded, setLoaded] = useState(false)

  const loadLeaderboard = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch(
        `${API}/judging/leaderboard/1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        const data = await response.json().catch(() => null)

        throw new Error(
          data?.detail || "Unable to load leaderboard"
        )
      }

      const data = await response.json()

      setLeaderboard(
        Array.isArray(data)
          ? data
          : data.leaderboard || []
      )

      setLoaded(true)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  /* FIXED CSV DOWNLOAD
     window.open() cannot send Authorization header.
     This fetches the CSV with the bearer token and
     downloads it as a file.
  */
  const downloadCSV = async () => {
    try {
      setError("")

      const response = await fetch(
        `${API}/judging/leaderboard/1/csv`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        const data = await response.json().catch(() => null)

        throw new Error(
          data?.detail || "CSV download failed"
        )
      }

      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)

      const a = document.createElement("a")

      a.href = url
      a.download = "event_1_leaderboard.csv"

      document.body.appendChild(a)

      a.click()

      a.remove()

      window.URL.revokeObjectURL(url)
    } catch (error) {
      setError(error.message)
    }
  }

  const getScore = (item) => {
    return (
      item.final_score ??
      item.score ??
      item.total_score ??
      0
    )
  }

  const getRank = (item, index) => {
    return item.rank ?? index + 1
  }

  const getProjectName = (item) => {
    return (
      item.project_name ||
      item.submission_name ||
      item.name ||
      `Submission #${item.submission_id || ""}`
    )
  }

  const getTeamName = (item) => {
    return (
      item.team_name ||
      item.team ||
      "Team"
    )
  }

  return (
    <div className="app-shell">
      <Navbar
        title="Organizer Dashboard"
        user={user}
        onLogout={onLogout}
      />

      <main className="dashboard-page">
        <section className="page-heading">
          <div>
            <p className="eyebrow">ORGANIZER</p>

            <h1>Hackathon overview</h1>

            <p>
              Manage judging and review final results.
            </p>
          </div>

          <div className="button-row">
            <button
              className="secondary-button"
              onClick={loadLeaderboard}
              disabled={loading}
            >
              {loading
                ? "Loading..."
                : "Refresh leaderboard"}
            </button>

            <button
              className="primary-button"
              onClick={downloadCSV}
            >
              Download CSV
            </button>
          </div>
        </section>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <section className="stats-grid">
          <div className="stat-card">
            <span>Event</span>
            <strong>Hackathon 2026</strong>
          </div>

          <div className="stat-card">
            <span>Submissions scored</span>
            <strong>{leaderboard.length}</strong>
          </div>

          <div className="stat-card">
            <span>Status</span>
            <strong className="status-active">
              Judging active
            </strong>
          </div>
        </section>

        <section className="panel leaderboard-panel">
          <p className="eyebrow">RESULTS</p>

          <h2>Leaderboard</h2>

          {!loaded ? (
            <div className="empty-state">
              Click{" "}
              <strong>Refresh leaderboard</strong>{" "}
              to load results.
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="empty-state">
              No scored submissions yet.
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
                  {leaderboard.map(
                    (item, index) => (
                      <tr
                        key={
                          item.submission_id ||
                          item.id ||
                          index
                        }
                      >
                        <td>
                          <strong>
                            #{getRank(item, index)}
                          </strong>
                        </td>

                        <td>
                          {getProjectName(item)}
                        </td>

                        <td>
                          {getTeamName(item)}
                        </td>

                        <td>
                          <strong>
                            {Number(
                              getScore(item)
                            ).toFixed(2)}
                          </strong>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

/* =========================
   PARTICIPANT DASHBOARD
========================= */

function ParticipantDashboard({
  user,
  onLogout,
}) {
  return (
    <div className="app-shell">
      <Navbar
        title="Participant Dashboard"
        user={user}
        onLogout={onLogout}
      />

      <main className="dashboard-page">
        <section className="page-heading">
          <div>
            <p className="eyebrow">
              PARTICIPANT
            </p>

            <h1>Hackathon workspace</h1>

            <p>
              Manage your team and submission.
            </p>
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <span>Event</span>
            <strong>Hackathon 2026</strong>
          </div>

          <div className="stat-card">
            <span>Team</span>
            <strong>Team Alpha</strong>
          </div>

          <div className="stat-card">
            <span>Submission</span>
            <strong>Submitted</strong>
          </div>
        </section>

        <section className="participant-grid">
          <div className="panel">
            <p className="eyebrow">TEAM</p>

            <h2>Team Alpha</h2>

            <p>
              Your hackathon team and members.
            </p>

            <div className="submission-card">
              <div className="project-icon">
                A
              </div>

              <div>
                <h3>Team Alpha</h3>
                <p>
                  Active team
                </p>
              </div>
            </div>
          </div>

          <div className="panel">
            <p className="eyebrow">
              SUBMISSION
            </p>

            <h2>
              AI Hackathon Project
            </h2>

            <p>
              Your project has been submitted
              successfully.
            </p>

            <div className="status-pill">
              Submitted
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App