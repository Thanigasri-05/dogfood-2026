import { useEffect, useState } from "react"
import "./App.css"

const API = "http://127.0.0.1:8000"

/* =========================================================
   AUTH HELPERS
========================================================= */

function getToken() {
  return localStorage.getItem("token")
}

function authHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  }
}

/* =========================================================
   LOGIN
========================================================= */

function Login({ onLogin }) {
  const [email, setEmail] = useState("judge@example.com")
  const [password, setPassword] = useState("string")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError("")
    setLoading(true)

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
        setError(data.error || "Login failed")
        return
      }

      localStorage.setItem("token", data.access_token)

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.user_id,
          name: data.name,
          email: data.email,
          role: data.role,
        })
      )

      onLogin(data)
    } catch {
      setError("Unable to connect to backend")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-shell">

        <section className="login-intro">

          <div className="login-intro-brand">
            <div className="brand-logo">D</div>

            <div>
              <h2>Dogfood 2026</h2>
              <p>Hackathon Management Platform</p>
            </div>
          </div>

          <div className="login-intro-content">

            <p className="login-eyebrow">
              HACKATHON PLATFORM
            </p>

            <h1>
              Build.
              <br />
              Submit.
              <br />
              <span>Win.</span>
            </h1>

            <p>
              One platform to manage events, teams,
              submissions, judging and results.
            </p>

            <div className="login-features">

              <div className="login-feature">
                <span>01</span>

                <div>
                  <strong>Manage Teams</strong>
                  <p>
                    Create and manage your hackathon team.
                  </p>
                </div>
              </div>

              <div className="login-feature">
                <span>02</span>

                <div>
                  <strong>Submit Projects</strong>
                  <p>
                    Submit your project and showcase it.
                  </p>
                </div>
              </div>

              <div className="login-feature">
                <span>03</span>

                <div>
                  <strong>Judge & Score</strong>
                  <p>
                    Evaluate projects using weighted rubrics.
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div className="login-footer">
            Dogfood 2026 · Hackathon Management Platform
          </div>

        </section>

        <section className="login-form-area">

          <div className="login-card">

            <div className="mobile-brand">

              <div className="brand-logo">D</div>

              <div>
                <h2 className="brand-title">
                  Dogfood 2026
                </h2>

                <p className="brand-subtitle">
                  Hackathon Management Platform
                </p>
              </div>

            </div>

            <div className="login-heading">

              <p className="login-card-eyebrow">
                WELCOME
              </p>

              <h1>Welcome back</h1>

              <p className="login-description">
                Sign in to continue to your dashboard.
              </p>

            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>

              <div className="form-group">

                <label>Email address</label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="you@example.com"
                  required
                />

              </div>

              <div className="form-group">

                <label>Password</label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  required
                />

              </div>

              <button
                className="login-button"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  "Signing in..."
                ) : (
                  <>
                    Sign in
                    <span className="button-arrow">
                      →
                    </span>
                  </>
                )}
              </button>

            </form>

            <div className="login-note">
              <span className="status-dot"></span>
              Hackathon platform is online
            </div>

          </div>

        </section>

      </div>
    </div>
  )
}

/* =========================================================
   NAVBAR
========================================================= */

function Navbar({
  user,
  page,
  setPage,
  onLogout,
}) {
  return (
    <nav className="navbar">

      <div className="navbar-left">

        <div className="navbar-brand">

          <div className="navbar-logo">
            D
          </div>

          <span>
            Dogfood 2026
          </span>

        </div>

        <button
          className={`nav-link ${
            page === "dashboard"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setPage("dashboard")
          }
        >
          Dashboard
        </button>

        <button
          className={`nav-link ${
            page === "gallery"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setPage("gallery")
          }
        >
          Public Gallery
        </button>

      </div>

      <div className="navbar-right">

        <div className="nav-user">

          <span className="nav-user-name">
            {user?.name}
          </span>

          <span className="nav-user-role">
            {user?.role}
          </span>

        </div>

        <button
          className="logout-button"
          onClick={onLogout}
        >
          Logout
        </button>

      </div>

    </nav>
  )
}

/* =========================================================
   PUBLIC GALLERY
========================================================= */

function PublicGallery() {
  const [projects, setProjects] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  async function loadProjects() {
    setLoading(true)

    try {
      const response = await fetch(
        `${API}/gallery/`
      )

      const data = await response.json()

      if (Array.isArray(data)) {
        setProjects(data)
      } else {
        setProjects([])
      }
    } catch {
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const filteredProjects = projects.filter(
    (project) => {
      const query = search
        .trim()
        .toLowerCase()

      if (!query) {
        return true
      }

      return (
        project.project_name
          ?.toLowerCase()
          .includes(query) ||

        project.description
          ?.toLowerCase()
          .includes(query) ||

        project.team_name
          ?.toLowerCase()
          .includes(query) ||

        project.track_name
          ?.toLowerCase()
          .includes(query)
      )
    }
  )

  return (
    <main className="page gallery-page">

      <div className="page-container gallery-container">

        {/* =========================
            HERO
        ========================= */}

        <div className="gallery-hero">

          <div className="gallery-heading">

            <p className="page-eyebrow">
              Public
            </p>

            <h1 className="page-title">
              Hackathon Gallery
            </h1>

            <p className="page-description">
              Explore projects submitted to
              Hackathon 2026.
            </p>

          </div>

          <button
            className="refresh-button"
            onClick={loadProjects}
            disabled={loading}
          >
            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>

        {/* =========================
            SEARCH
        ========================= */}

        <div className="gallery-toolbar">

          <div className="gallery-search-wrap">

            <span
              className="gallery-search-icon"
              aria-hidden="true"
            >
              ⌕
            </span>

            <input
              className="gallery-search"
              type="text"
              placeholder="Search projects, teams, or tracks..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              aria-label="Search projects, teams, or tracks"
            />

            {search && (
              <button
                type="button"
                className="gallery-clear"
                onClick={() =>
                  setSearch("")
                }
                aria-label="Clear search"
              >
                ×
              </button>
            )}

          </div>

        </div>

        {/* =========================
            RESULT COUNT
        ========================= */}

        <div className="gallery-result-count">

          <strong>
            {filteredProjects.length}
          </strong>

          {" "}

          project
          {filteredProjects.length === 1
            ? ""
            : "s"}

        </div>

        {/* =========================
            LOADING
        ========================= */}

        {loading && (
          <div className="gallery-state-card">

            <div className="gallery-state-icon">
              ◌
            </div>

            <div>
              <div className="gallery-state-title">
                Loading projects
              </div>

              <div className="gallery-state-text">
                Fetching the latest submissions...
              </div>
            </div>

          </div>
        )}

        {/* =========================
            EMPTY STATE
        ========================= */}

        {!loading &&
          filteredProjects.length === 0 && (
            <div className="gallery-state-card">

              <div className="gallery-state-icon">
                ?
              </div>

              <div>

                <div className="gallery-state-title">
                  No projects found
                </div>

                <div className="gallery-state-text">
                  Try a different project name,
                  team, or track.
                </div>

              </div>

            </div>
          )}

        {/* =========================
            PROJECTS
        ========================= */}

        {!loading &&
          filteredProjects.length > 0 && (
            <div className="gallery-grid">

              {filteredProjects.map(
                (project) => (
                  <article
                    className="project-card"
                    key={
                      project.submission_id
                    }
                  >

                    {/* CARD HEADER */}

                    <div className="project-card-header">

                      <div className="project-track-group">

                        <span className="track-badge">
                          {project.track_name ||
                            "AI"}
                        </span>

                        <span className="project-number">
                          Submission #
                          {project.submission_id}
                        </span>

                      </div>

                    </div>

                    {/* CARD BODY */}

                    <div className="project-card-body">

                      <h3>
                        {project.project_name ||
                          "Untitled Project"}
                      </h3>

                      <p className="project-description">
                        {project.description ||
                          "No project description provided."}
                      </p>

                      {/* PROJECT INFORMATION */}

                      <div className="project-info-grid">

                        <div className="project-info-item">

                          <span className="meta-label">
                            Team
                          </span>

                          <span className="meta-value">
                            {project.team_name ||
                              "Unknown team"}
                          </span>

                        </div>

                        <div className="project-info-item">

                          <span className="meta-label">
                            Track
                          </span>

                          <span className="meta-value">
                            {project.track_name ||
                              "Unknown track"}
                          </span>

                        </div>

                      </div>

                    </div>

                    {/* CARD FOOTER */}

                    {(project.repository_url ||
                      project.demo_url) && (
                      <div className="project-actions">

                        {project.repository_url && (
                          <a
                            className="repo-link"
                            href={
                              project.repository_url
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            Repository
                            <span>↗</span>
                          </a>
                        )}

                        {project.demo_url && (
                          <a
                            className="demo-link"
                            href={
                              project.demo_url
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            Live Demo
                            <span>↗</span>
                          </a>
                        )}

                      </div>
                    )}

                  </article>
                )
              )}

            </div>
          )}

      </div>
    </main>
  )
}

/* =========================================================
   PARTICIPANT DASHBOARD
========================================================= */

function ParticipantDashboard() {
  const [teams, setTeams] = useState([])
  const [submissions, setSubmissions] =
    useState([])
  const [loading, setLoading] =
    useState(true)

  async function loadData() {
    setLoading(true)

    try {
      const [
        teamsResponse,
        submissionsResponse,
      ] = await Promise.all([
        fetch(`${API}/teams/my`, {
          headers: authHeaders(),
        }),
        fetch(`${API}/submissions/my`, {
          headers: authHeaders(),
        }),
      ])

      const teamsData =
        await teamsResponse.json()

      const submissionsData =
        await submissionsResponse.json()

      setTeams(
        Array.isArray(teamsData)
          ? teamsData
          : []
      )

      setSubmissions(
        Array.isArray(submissionsData)
          ? submissionsData
          : []
      )
    } catch {
      setTeams([])
      setSubmissions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const currentTeam = teams[0]

  return (
    <main className="page">

      <div className="page-container">

        <div className="page-header">

          <div>

            <p className="page-eyebrow">
              Participant
            </p>

            <h1 className="page-title">
              Dashboard
            </h1>

            <p className="page-description">
              Manage your hackathon team
              and submissions.
            </p>

          </div>

          <button
            className="refresh-button"
            onClick={loadData}
          >
            Refresh
          </button>

        </div>

        <div className="stats-grid">

          <div className="stat-card">

            <div className="stat-label">
              Teams
            </div>

            <div className="stat-value">
              {loading
                ? "—"
                : teams.length}
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-label">
              Submissions
            </div>

            <div className="stat-value">
              {loading
                ? "—"
                : submissions.length}
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-label">
              Status
            </div>

            <div className="stat-value">
              Active
            </div>

          </div>

        </div>

        <div className="content-card">

          <h2>
            Current Team
          </h2>

          {currentTeam ? (
            <>
              <h3>
                {currentTeam.name}
              </h3>

              <p>
                Team ID: {currentTeam.id}
              </p>
            </>
          ) : (
            <p>
              No team found.
            </p>
          )}

        </div>

        <div
          className="content-card"
          style={{
            marginTop: "20px",
          }}
        >

          <h2>
            My Submissions
          </h2>

          {submissions.length === 0 ? (
            <p>
              No submissions found.
            </p>
          ) : (
            <div className="table-wrapper">

              <table className="data-table">

                <thead>
                  <tr>
                    <th>
                      Project
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Track
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {submissions.map(
                    (submission) => (
                      <tr
                        key={submission.id}
                      >

                        <td>
                          {
                            submission.project_name
                          }
                        </td>

                        <td>
                          {
                            submission.status
                          }
                        </td>

                        <td>
                          {
                            submission.track_id
                          }
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

    </main>
  )
}

/* =========================================================
   JUDGE DASHBOARD
========================================================= */

function JudgeDashboard() {
  const [assignments, setAssignments] =
    useState([])

  const [rubric, setRubric] =
    useState(null)

  const [scores, setScores] =
    useState({})

  const [comments, setComments] =
    useState({})

  const [message, setMessage] =
    useState("")

  const [loading, setLoading] =
    useState(true)

  const [submitting, setSubmitting] =
    useState(false)

  async function loadData() {
    setLoading(true)
    setMessage("")

    try {
      const [
        assignmentsResponse,
        rubricResponse,
      ] = await Promise.all([
        fetch(
          `${API}/judging/assignments/my`,
          {
            headers: authHeaders(),
          }
        ),

        fetch(
          `${API}/judging/rubrics/1`,
          {
            headers: authHeaders(),
          }
        ),
      ])

      const assignmentsData =
        await assignmentsResponse.json()

      const rubricData =
        await rubricResponse.json()

      setAssignments(
        Array.isArray(assignmentsData)
          ? assignmentsData
          : []
      )

      setRubric(rubricData)
    } catch {
      setAssignments([])
      setRubric(null)

      setMessage(
        "Unable to load judging data"
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function updateScore(
    criterionId,
    value
  ) {
    setScores((current) => ({
      ...current,
      [criterionId]: value,
    }))
  }

  function updateComment(
    criterionId,
    value
  ) {
    setComments((current) => ({
      ...current,
      [criterionId]: value,
    }))
  }

  async function submitScores(e) {
    e.preventDefault()
    setMessage("")

    if (!rubric?.criteria?.length) {
      setMessage(
        "No judging criteria available."
      )
      return
    }

    setSubmitting(true)

    try {
      for (const criterion of rubric.criteria) {
        const score =
          scores[criterion.id]

        if (
          score === undefined ||
          score === ""
        ) {
          continue
        }

        const response = await fetch(
          `${API}/judging/score`,
          {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({
              submission_id: 1,
              criterion_id: criterion.id,
              score: Number(score),
              comment:
                comments[criterion.id] ||
                null,
            }),
          }
        )

        const data =
          await response.json()

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Score submission failed"
          )
        }
      }

      setMessage(
        "Scores submitted successfully ✓"
      )
    } catch (error) {
      setMessage(
        error.message ||
          "Unable to submit scores"
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="page">

      <div className="page-container">

        <div className="page-header">

          <div>

            <p className="page-eyebrow">
              Judge
            </p>

            <h1 className="page-title">
              Judging Dashboard
            </h1>

            <p className="page-description">
              Review your assigned hackathon
              submissions.
            </p>

          </div>

          <button
            className="refresh-button"
            onClick={loadData}
          >
            Refresh
          </button>

        </div>

        <div className="stats-grid">

          <div className="stat-card">

            <div className="stat-label">
              Assignments
            </div>

            <div className="stat-value">
              {loading
                ? "—"
                : assignments.length}
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-label">
              Criteria
            </div>

            <div className="stat-value">
              {loading
                ? "—"
                : rubric?.criteria
                    ?.length || 0}
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-label">
              Status
            </div>

            <div className="stat-value">
              Active
            </div>

          </div>

        </div>

        {message && (
          <div
            className="content-card"
            style={{
              marginBottom: "20px",
            }}
          >
            <strong>
              {message}
            </strong>
          </div>
        )}

        <div className="judge-layout">

          <div className="judge-card">

            <h2>
              Assignment
            </h2>

            {assignments.length === 0 ? (
              <p>
                No assignments found.
              </p>
            ) : (
              assignments.map(
                (assignment) => (
                  <div
                    key={assignment.id}
                    style={{
                      padding: "14px 0",
                      borderBottom:
                        "1px solid #edf0f4",
                    }}
                  >

                    <strong>
                      Event #
                      {assignment.event_id}
                    </strong>

                    <div
                      style={{
                        marginTop: "5px",
                        color: "#64748b",
                        fontSize: "13px",
                      }}
                    >
                      Status:{" "}
                      {assignment.status}
                    </div>

                  </div>
                )
              )
            )}

          </div>

          <div className="judge-card">

            <h2>
              {rubric?.name ||
                "Judging Rubric"}
            </h2>

            {rubric?.description && (
              <p>
                {rubric.description}
              </p>
            )}

            <form
              onSubmit={submitScores}
            >

              {rubric?.criteria?.map(
                (criterion) => (
                  <div
                    className="criterion-row"
                    key={criterion.id}
                  >

                    <div>

                      <div className="criterion-name">
                        {criterion.name}
                      </div>

                      {criterion.description && (
                        <div className="criterion-description">
                          {
                            criterion.description
                          }
                        </div>
                      )}

                      <div
                        style={{
                          marginTop: "5px",
                          color: "#94a3b8",
                          fontSize: "12px",
                        }}
                      >
                        Weight:{" "}
                        {criterion.weight}%
                        {" · "}
                        Max:{" "}
                        {criterion.max_score}
                      </div>

                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection:
                          "column",
                        gap: "10px",
                      }}
                    >

                      <input
                        className="score-input"
                        type="number"
                        min="0"
                        max={
                          criterion.max_score
                        }
                        step="0.1"
                        placeholder="Score"
                        value={
                          scores[
                            criterion.id
                          ] || ""
                        }
                        onChange={(e) =>
                          updateScore(
                            criterion.id,
                            e.target.value
                          )
                        }
                      />

                      <textarea
                        className="criterion-comment"
                        placeholder="Optional comment"
                        value={
                          comments[
                            criterion.id
                          ] || ""
                        }
                        onChange={(e) =>
                          updateComment(
                            criterion.id,
                            e.target.value
                          )
                        }
                      />

                    </div>

                  </div>
                )
              )}

              {rubric?.criteria?.length >
                0 && (
                <div
                  style={{
                    marginTop: "20px",
                  }}
                >

                  <button
                    className="primary-button"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Submitting..."
                      : "Submit Scores"}
                  </button>

                </div>
              )}

            </form>

          </div>

        </div>

      </div>

    </main>
  )
}

/* =========================================================
   ORGANIZER DASHBOARD
========================================================= */

function OrganizerDashboard() {
  const [leaderboard, setLeaderboard] =
    useState([])

  const [loading, setLoading] =
    useState(false)

  const [message, setMessage] =
    useState("")

  async function loadLeaderboard() {
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch(
        `${API}/judging/leaderboard/1`,
        {
          headers: authHeaders(),
        }
      )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to load leaderboard"
        )
      }

      setLeaderboard(
        Array.isArray(data)
          ? data
          : []
      )
    } catch (error) {
      setLeaderboard([])

      setMessage(
        error.message ||
          "Unable to load leaderboard"
      )
    } finally {
      setLoading(false)
    }
  }

  async function downloadCSV() {
    try {
      const response = await fetch(
        `${API}/judging/leaderboard/1/csv`,
        {
          headers: {
            Authorization:
              `Bearer ${getToken()}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(
          "CSV download failed"
        )
      }

      const blob =
        await response.blob()

      const url =
        window.URL.createObjectURL(
          blob
        )

      const link =
        document.createElement("a")

      link.href = url

      link.download =
        "event_1_leaderboard.csv"

      document.body.appendChild(link)

      link.click()

      link.remove()

      window.URL.revokeObjectURL(url)
    } catch (error) {
      setMessage(
        error.message ||
          "CSV download failed"
      )
    }
  }

  useEffect(() => {
    loadLeaderboard()
  }, [])

  return (
    <main className="page">

      <div className="page-container">

        <div className="page-header">

          <div>

            <p className="page-eyebrow">
              Organizer
            </p>

            <h1 className="page-title">
              Organizer Dashboard
            </h1>

            <p className="page-description">
              Monitor Hackathon 2026
              judging and results.
            </p>

          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >

            <button
              className="refresh-button"
              onClick={loadLeaderboard}
            >
              Refresh leaderboard
            </button>

            <button
              className="primary-button"
              onClick={downloadCSV}
            >
              Export CSV
            </button>

          </div>

        </div>

        <div className="stats-grid">

          <div className="stat-card">

            <div className="stat-label">
              Event
            </div>

            <div
              className="stat-value"
              style={{
                fontSize: "21px",
              }}
            >
              Hackathon 2026
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-label">
              Submissions scored
            </div>

            <div className="stat-value">
              {leaderboard.length}
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-label">
              Status
            </div>

            <div className="stat-value">
              Judging active
            </div>

          </div>

        </div>

        {message && (
          <div
            className="content-card"
            style={{
              marginBottom: "20px",
            }}
          >
            <strong>
              {message}
            </strong>
          </div>
        )}

        <div className="content-card">

          <h2>
            Leaderboard
          </h2>

          {loading ? (
            <p>
              Loading leaderboard...
            </p>
          ) : leaderboard.length === 0 ? (
            <p>
              No scored submissions yet.
              Click{" "}
              <strong>
                Refresh leaderboard
              </strong>{" "}
              after judges submit scores.
            </p>
          ) : (
            <div
              className="table-wrapper"
              style={{
                marginTop: "18px",
              }}
            >

              <table className="data-table">

                <thead>

                  <tr>
                    <th>Rank</th>
                    <th>Submission</th>
                    <th>Project</th>
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
                          {item.rank ||
                            index + 1}
                        </td>

                        <td>
                          #{item.submission_id}
                        </td>

                        <td>
                          {item.project_name ||
                            `Submission #${item.submission_id}`}
                        </td>

                        <td>
                          <strong>
                            {Number(
                              item.final_score ||
                                0
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

        </div>

      </div>

    </main>
  )
}

/* =========================================================
   MAIN APP
========================================================= */

function App() {
  const [user, setUser] =
    useState(() => {
      const savedUser =
        localStorage.getItem("user")

      if (!savedUser) {
        return null
      }

      try {
        return JSON.parse(savedUser)
      } catch {
        return null
      }
    })

  const [page, setPage] =
    useState("dashboard")

  function handleLogin(data) {
    setUser({
      id: data.user_id,
      name: data.name,
      email: data.email,
      role: data.role,
    })

    setPage("dashboard")
  }

  function handleLogout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
  }

  if (!user) {
    return (
      <Login
        onLogin={handleLogin}
      />
    )
  }

  return (
    <>
      <Navbar
        user={user}
        page={page}
        setPage={setPage}
        onLogout={handleLogout}
      />

      {page === "gallery" ? (
        <PublicGallery />
      ) : user.role === "participant" ? (
        <ParticipantDashboard />
      ) : user.role === "judge" ? (
        <JudgeDashboard />
      ) : user.role === "organizer" ||
        user.role === "admin" ? (
        <OrganizerDashboard />
      ) : (
        <main className="page">

          <div className="page-container">

            <div className="content-card">

              <h2>
                Dashboard
              </h2>

              <p>
                Your role does not have a
                dashboard yet.
              </p>

            </div>

          </div>

        </main>
      )}
    </>
  )
}

export default App