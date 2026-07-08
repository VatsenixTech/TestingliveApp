import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./ApplicationsPage.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const candidateId = user?.candidateId || user?._id || user?.id || "";

  const goTo = (path) => {
    window.location.href = path;
  };

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadData = async () => {
    if (!candidateId) {
      goTo("/candidate-login");
      return;
    }

    try {
      setLoading(true);

      const [appRes, jobRes] = await Promise.allSettled([
        axios.get(`${API_URL}/api/applications/candidate/${candidateId}`, {
          headers: authHeaders(),
        }),
        axios.get(`${API_URL}/api/jobs`, {
          headers: authHeaders(),
        }),
      ]);

      if (appRes.status === "fulfilled") {
        const data =
          appRes.value.data?.applications ||
          appRes.value.data?.data ||
          appRes.value.data ||
          [];
        setApplications(Array.isArray(data) ? data : []);
      }

      if (jobRes.status === "fulfilled") {
        const data =
          jobRes.value.data?.jobs ||
          jobRes.value.data?.data ||
          jobRes.value.data ||
          [];
        setJobs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.log("APPLICATIONS LOAD ERROR:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [candidateId]);

  const filteredApps = useMemo(() => {
    const q = search.toLowerCase();

    return applications.filter((app) => {
      const title = app.jobTitle || app.title || app.job?.title || "";
      const company = app.company || app.companyName || app.job?.company || "";
      const status = app.status || "";

      return (
        title.toLowerCase().includes(q) ||
        company.toLowerCase().includes(q) ||
        status.toLowerCase().includes(q)
      );
    });
  }, [applications, search]);

  const underReview = applications.filter((a) =>
    String(a.status || "").toLowerCase().includes("review")
  );

  const interviews = applications.filter((a) =>
    String(a.status || "").toLowerCase().includes("interview")
  );

  const offers = applications.filter((a) =>
    String(a.status || "").toLowerCase().includes("offer")
  );

  const successRate =
    applications.length > 0
      ? Math.round(((interviews.length + offers.length) / applications.length) * 100)
      : null;

  const recommendedJobs = jobs.slice(0, 3);

  return (
    <main className="ua-page">
      <aside className="ua-sidebar">
        <img src="/logo.png" alt="NoPromptJobs" />

        <button onClick={() => goTo("/ultimate-dashboard")}>🏠 Dashboard</button>
        <button className="active">▣ Applications <b>{applications.length}</b></button>
        <button onClick={() => goTo("/ai-workspace")}>🤖 AI Workspace</button>
        <button onClick={() => goTo("/resume-studio")}>📄 Resume Studio</button>
        <button onClick={() => goTo("/ai-interview-prep")}>🎙 AI Interview Prep</button>
        <button onClick={() => goTo("/skill-analyzer")}>📊 Skill Analyzer</button>
        <button onClick={() => goTo("/salary-predictor")}>💰 Salary Predictor</button>
        <button onClick={() => goTo("/job-alerts")}>🔔 Job Alerts</button>
        <button onClick={() => goTo("/saved-jobs")}>❤️ Saved Jobs</button>
        <button onClick={() => goTo("/hidden-opportunities")}>💎 Hidden Opportunities</button>
      </aside>

      <section className="ua-main">
        <header className="ua-topbar">
          <button className="ua-menu">☰</button>

          <div className="ua-search">
            <span>⌕</span>
            <input
              placeholder="Search applications, companies, status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <kbd>⌘ K</kbd>
          </div>

          <button className="ua-ai">✨ AI Assistant</button>

          <button className="ua-icon">🔔</button>
          <button className="ua-icon">💬</button>

          <div className="ua-user">
            <img src={user?.profileImageUrl || "/profile.png"} alt="Candidate" />
            <div>
              <b>{user?.name || "Candidate"}</b>
              <span>Verified Candidate 💙</span>
            </div>
          </div>
        </header>

        <section className="ua-hero">
          <div>
            <span>APPLICATION INTELLIGENCE</span>
            <h1>Applications Command Center</h1>
            <p>
              Track every application, recruiter response, interview stage and hiring progress from live backend data.
            </p>
          </div>

          <button onClick={loadData}>{loading ? "Refreshing..." : "Refresh Data ↻"}</button>
        </section>

        <section className="ua-stats">
          <article>
            <i>💼</i>
            <h3>Total Applications</h3>
            <h2>{applications.length}</h2>
            <p>Live backend records</p>
          </article>

          <article>
            <i>✅</i>
            <h3>Applied</h3>
            <h2>{applications.length}</h2>
            <p>Submitted roles</p>
          </article>

          <article>
            <i>👁</i>
            <h3>Under Review</h3>
            <h2>{underReview.length}</h2>
            <p>Recruiter review</p>
          </article>

          <article>
            <i>🎙</i>
            <h3>Interviews</h3>
            <h2>{interviews.length}</h2>
            <p>Interview stage</p>
          </article>

          <article>
            <i>📈</i>
            <h3>Success Rate</h3>
            <h2>{successRate === null ? "—" : `${successRate}%`}</h2>
            <p>{successRate === null ? "Need application data" : "Progress score"}</p>
          </article>
        </section>

        <section className="ua-grid">
          <section className="ua-panel ua-pipeline">
            <div className="ua-panel-head">
              <div>
                <h2>Applications Pipeline</h2>
                <p>Live status from your applied jobs.</p>
              </div>

              <div>
                <button onClick={() => goTo("/jobs")}>+ Apply Jobs</button>
                <button onClick={loadData}>Refresh</button>
              </div>
            </div>

            {loading ? (
              <div className="ua-empty">Loading applications...</div>
            ) : filteredApps.length > 0 ? (
              <div className="ua-table">
                {filteredApps.map((app, index) => (
                  <article key={app._id || app.id || index}>
                    <div className="ua-company-logo">
                      {(app.company || app.companyName || app.job?.company || "C")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <h3>{app.jobTitle || app.title || app.job?.title || "Job title not added"}</h3>
                      <p>{app.company || app.companyName || app.job?.company || "Company not added"}</p>
                    </div>

                    <span>{app.status || "Applied"}</span>

                    <small>
                      {app.createdAt
                        ? new Date(app.createdAt).toLocaleDateString()
                        : "Date not added"}
                    </small>
                  </article>
                ))}
              </div>
            ) : (
              <div className="ua-empty premium">
                <div>📭</div>
                <h2>No applications yet</h2>
                <p>
                  Once you apply to backend jobs, your applications will appear here automatically.
                </p>
                <button onClick={() => goTo("/jobs")}>Explore Jobs →</button>
              </div>
            )}
          </section>

          <aside className="ua-right">
            <section className="ua-panel">
              <h2>Quick Actions</h2>

              <button onClick={() => goTo("/jobs")}>💼 Explore Jobs</button>
              <button onClick={() => goTo("/resume-studio")}>📄 Improve Resume</button>
              <button onClick={() => goTo("/ai-interview-prep")}>🎙 Practice Interview</button>
              <button onClick={() => goTo("/job-alerts")}>🔔 Manage Job Alerts</button>
            </section>

            <section className="ua-panel">
              <h2>Recommended Jobs</h2>

              {recommendedJobs.length > 0 ? (
                recommendedJobs.map((job) => (
                  <article className="ua-job-mini" key={job._id || job.id}>
                    <b>{job.title || job.jobTitle || job.role || "Job title not added"}</b>
                    <span>{job.company || job.companyName || "Company not added"}</span>
                  </article>
                ))
              ) : (
                <p className="ua-muted">No recommended jobs from backend.</p>
              )}
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}

export default ApplicationsPage;