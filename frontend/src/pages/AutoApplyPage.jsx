import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./ApplicationsPage.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STATUS_OPTIONS = [
  "Applied",
  "Under Review",
  "Interview",
  "Offered",
  "Rejected",
  "Saved",
];

export default function ApplicationsPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const candidateId = user?.candidateId || user?._id || user?.id || "";
  const name = user?.name || "VENKATESHA A";

  const [applications, setApplications] = useState([]);
  const [hiddenJobs, setHiddenJobs] = useState([]);
  const [emergencyJobs, setEmergencyJobs] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    role: "",
    company: "",
    location: "",
    status: "Applied",
  });

  const goTo = (path) => {
    window.location.href = path;
  };

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchApplications = async () => {
    if (!candidateId) {
      goTo("/candidate-login");
      return;
    }

    try {
      setLoading(true);

      const endpoints = [
        `${API_URL}/api/applications/candidate/${candidateId}`,
        `${API_URL}/api/candidates/${candidateId}/applications`,
      ];

      let data = [];

      for (const url of endpoints) {
        try {
          const res = await axios.get(url, { headers: authHeaders() });
          data = res.data?.applications || res.data?.data || res.data || [];
          if (Array.isArray(data)) break;
        } catch {
          data = [];
        }
      }

      setApplications(Array.isArray(data) ? data : []);
      localStorage.setItem(
        "applicationsCount",
        String(Array.isArray(data) ? data.length : 0)
      );
    } catch (err) {
      console.log("APPLICATIONS ERROR:", err.response?.data || err.message);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHiddenJobs = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/jobs/hidden`, {
        headers: authHeaders(),
      });
      const data = res.data?.jobs || res.data?.data || res.data || [];
      setHiddenJobs(Array.isArray(data) ? data : []);
    } catch {
      setHiddenJobs([]);
    }
  };

  const fetchEmergencyJobs = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/jobs/emergency`, {
        headers: authHeaders(),
      });
      const data = res.data?.jobs || res.data?.data || res.data || [];
      setEmergencyJobs(Array.isArray(data) ? data : []);
    } catch {
      setEmergencyJobs([]);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchHiddenJobs();
    fetchEmergencyJobs();
  }, [candidateId]);

  const addApplication = async () => {
    if (!form.role.trim() || !form.company.trim()) {
      alert("Please enter role and company");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/applications`,
        {
          candidateId,
          role: form.role.trim(),
          company: form.company.trim(),
          location: form.location.trim(),
          status: form.status,
          appliedDate: new Date(),
        },
        { headers: authHeaders() }
      );

      setShowAdd(false);
      setForm({
        role: "",
        company: "",
        location: "",
        status: "Applied",
      });

      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add application");
    }
  };

  const updateStatus = async (id, status) => {
    if (!id) return;

    try {
      await axios.put(
        `${API_URL}/api/applications/${id}`,
        { status },
        { headers: authHeaders() }
      );
      fetchApplications();
    } catch {
      alert("Status update failed");
    }
  };

  const deleteApplication = async (id) => {
    if (!id) return;
    if (!window.confirm("Delete this application?")) return;

    try {
      await axios.delete(`${API_URL}/api/applications/${id}`, {
        headers: authHeaders(),
      });
      fetchApplications();
    } catch {
      alert("Delete failed");
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const status = app.status || app.applicationStatus || "Applied";

      const title =
        app.role || app.title || app.jobTitle || app.job?.title || "";
      const company = app.company || app.companyName || app.job?.company || "";
      const location = app.location || app.job?.location || "";

      const matchesTab =
        activeTab === "All" ||
        status.toLowerCase() === activeTab.toLowerCase();

      const text = `${title} ${company} ${location} ${status}`.toLowerCase();

      return matchesTab && text.includes(searchText.toLowerCase());
    });
  }, [applications, activeTab, searchText]);

  const total = applications.length;

  const getStatusCount = (statusName) =>
    applications.filter((a) =>
      String(a.status || a.applicationStatus || "")
        .toLowerCase()
        .includes(statusName.toLowerCase())
    ).length;

  const applied = getStatusCount("Applied");
  const underReview = getStatusCount("Review");
  const interview = getStatusCount("Interview");
  const offered = getStatusCount("Offer");
  const rejected = getStatusCount("Reject");
  const saved = getStatusCount("Saved");
  const successRate = total ? Math.round((offered / total) * 100) : 0;

  const getTitle = (app) =>
    app.role || app.title || app.jobTitle || app.job?.title || "Job Role";

  const getCompany = (app) =>
    app.company || app.companyName || app.job?.company || "Company";

  const getLocation = (app) =>
    app.location || app.job?.location || "Location not added";

  const getStatus = (app) => app.status || app.applicationStatus || "Applied";

  const getDate = (app) => {
    const date =
      app.appliedDate || app.appliedAt || app.createdAt || app.updatedAt;
    return date ? new Date(date).toLocaleDateString() : "Today";
  };

  return (
    <section className="apps-page-content">
      <section className="apps-hero">
        <div>
          <span>Welcome back, {name}! 👋</span>
          <h1>Your Applications Command Center</h1>
          <p>
            Track every application, recruiter response, interview stage and
            hiring progress in one premium dashboard.
          </p>
        </div>

        <aside>
          <div>👑</div>
          <h3>Ultimate Access Active</h3>
          <p>All premium tools unlocked</p>
          <button onClick={() => goTo("/ultimate-dashboard")}>
            View Dashboard →
          </button>
        </aside>
      </section>

      <section className="stats-grid">
        <Stat title="Total Applications" value={total} icon="💼" />
        <Stat title="Applied" value={applied} icon="✅" />
        <Stat title="Under Review" value={underReview} icon="👁" />
        <Stat title="Interviews" value={interview} icon="🎤" />
        <Stat title="Success Rate" value={`${successRate}%`} icon="📈" />
      </section>

      <section className="apps-content-grid">
        <section className="apps-panel">
          <div className="apps-title-row">
            <div>
              <h2>Applications Pipeline</h2>
              <p>Live status from your real applied jobs</p>
            </div>

            <div className="apps-actions">
              <div className="apps-search-inline">
                <span>⌕</span>
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search applications..."
                />
              </div>

              <button className="ghost" onClick={() => window.print()}>
                Export
              </button>

              <button className="primary" onClick={() => setShowAdd(true)}>
                + Add Application
              </button>
            </div>
          </div>

          <div className="tabs">
            {["All", ...STATUS_OPTIONS].map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="application-list">
            {loading && (
              <div className="apps-empty-state">
                <div className="apps-empty-icon">⏳</div>
                <h3>Loading applications...</h3>
                <p>Please wait while we fetch your real application data.</p>
              </div>
            )}

            {!loading && filteredApplications.length === 0 && (
              <div className="apps-empty-state">
                <div className="apps-empty-icon">📭</div>
                <h3>No applications found</h3>
                <p>Click Add Application to add your first real application.</p>
                <button onClick={() => setShowAdd(true)}>
                  + Add Application
                </button>
              </div>
            )}

            {!loading &&
              filteredApplications.map((app, index) => {
                const id = app._id || app.id || app.applicationId || index;

                return (
                  <article className="app-row" key={id}>
                    <div className="company-logo">
                      {getCompany(app).charAt(0).toUpperCase()}
                    </div>

                    <section className="app-info">
                      <div>
                        <h3>{getTitle(app)}</h3>
                        <span>{getStatus(app)}</span>
                      </div>

                      <p>
                        {getCompany(app)} • {getLocation(app)}
                      </p>

                      <div className="app-meta">
                        <small>📅 {getDate(app)}</small>
                        <small>
                          ⚡ {app.matchScore || app.aiMatchScore || 92}% Match
                        </small>
                      </div>
                    </section>

                    <select
                      value={getStatus(app)}
                      onChange={(e) =>
                        updateStatus(app._id || app.id, e.target.value)
                      }
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>

                    <button
                      className="delete-btn"
                      onClick={() => deleteApplication(app._id || app.id)}
                    >
                      🗑
                    </button>
                  </article>
                );
              })}
          </div>
        </section>

        <aside className="right-stack">
          <div className="quick-card">
            <h2>Quick Actions</h2>

            <Action
              icon="🚨"
              title="Emergency Recruitment"
              text={`${emergencyJobs.length} urgent jobs available`}
              onClick={() => goTo("/emergency-recruitment")}
            />

            <Action
              icon="🔒"
              title="Hidden Applications"
              text={`${hiddenJobs.length} private jobs available`}
              onClick={() => goTo("/hidden-opportunities")}
            />

            <Action
              icon="📄"
              title="Resume Studio"
              text="Improve ATS resume score"
              onClick={() => goTo("/resume-studio")}
            />

            <Action
              icon="🎤"
              title="AI Interview Prep"
              text="Practice before recruiter call"
              onClick={() => goTo("/ai-interview-prep")}
            />
          </div>

          <div className="quick-card">
            <h2>Application Insights</h2>
            <Action icon="📌" title="Saved Jobs" text={`${saved} saved jobs`} />
            <Action icon="❌" title="Rejected" text={`${rejected} rejected`} />
            <Action icon="✅" title="Offered" text={`${offered} offers`} />
          </div>
        </aside>
      </section>

      {showAdd && (
        <div className="apps-modal">
          <div className="apps-modal-card">
            <button className="modal-close" onClick={() => setShowAdd(false)}>
              ×
            </button>

            <h2>Add Real Application</h2>

            <input
              placeholder="Job Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />

            <input
              placeholder="Company"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />

            <input
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />

            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>

            <button className="primary" onClick={addApplication}>
              Save Application
            </button>
          </div>
        </div>
      )}

      <ApplicationsFooter />
    </section>
  );
}

function Stat({ title, value, icon }) {
  return (
    <article className="stat-card">
      <div>
        <p>{title}</p>
        <h2>{value}</h2>
        <span>↑ live data</span>
      </div>
      <i>{icon}</i>
    </article>
  );
}

function Action({ icon, title, text, onClick }) {
  return (
    <div className="quick-action" onClick={onClick}>
      <span>{icon}</span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}

function ApplicationsFooter() {
  const goTo = (path) => {
    window.location.href = path;
  };

  return (
    <footer className="apps-premium-footer">
      <div className="apps-footer-grid">
        <div className="apps-footer-brand-block">
          <div className="apps-footer-brand">
            <div className="apps-footer-logo">NP</div>
            <div>
              <h3>NOPROMPTJOBS.COM</h3>
              <p>SMART HIRING. REAL CAREERS.</p>
            </div>
          </div>

          <p className="apps-footer-desc">
            NoPromptJobs.com is a next-generation hiring platform built to
            connect verified candidates with trusted career opportunities.
          </p>

          <div className="apps-footer-socials">
            <button onClick={() => window.open("https://linkedin.com", "_blank")}>
              in
            </button>
            <button onClick={() => window.open("https://twitter.com", "_blank")}>
              X
            </button>
            <button onClick={() => window.open("https://facebook.com", "_blank")}>
              f
            </button>
            <button onClick={() => window.open("https://instagram.com", "_blank")}>
              ig
            </button>
            <button onClick={() => window.open("https://youtube.com", "_blank")}>
              ▶
            </button>
          </div>
        </div>

        <div>
          <h4>For Candidates</h4>
          <button onClick={() => goTo("/jobs")}>Browse Jobs</button>
          <button onClick={() => goTo("/resume-studio")}>Resume Studio</button>
          <button onClick={() => goTo("/ai-interview-prep")}>
            AI Interview Prep
          </button>
          <button onClick={() => goTo("/skill-analyzer")}>Skill Analyzer</button>
          <button onClick={() => goTo("/salary-predictor")}>
            Salary Predictor
          </button>
        </div>

        <div>
          <h4>For Employers</h4>
          <button onClick={() => goTo("/recruiter-post-job")}>Post a Job</button>
          <button onClick={() => goTo("/recruiter-search")}>
            Search Candidates
          </button>
          <button onClick={() => goTo("/recruiter-login")}>
            Recruiter Login
          </button>
          <button onClick={() => goTo("/pricing")}>Pricing Plans</button>
          <button onClick={() => goTo("/hiring-solutions")}>
            Hiring Solutions
          </button>
        </div>

        <div>
          <h4>Company</h4>
          <button onClick={() => goTo("/about")}>About Us</button>
          <button onClick={() => goTo("/how-it-works")}>How It Works</button>
          <button onClick={() => goTo("/blog")}>Blog</button>
          <button onClick={() => goTo("/careers")}>Careers</button>
          <button onClick={() => goTo("/contact")}>Contact Us</button>
        </div>

        <div>
          <h4>Stay Updated</h4>
          <p>Get the latest jobs, hiring insights and career tips.</p>

          <div className="apps-footer-subscribe">
            <input placeholder="Enter your email" />
            <button onClick={() => alert("Subscribed successfully")}>
              Subscribe
            </button>
          </div>

          <div className="apps-store-row">
            <button>▶ Google Play</button>
            <button> App Store</button>
          </div>
        </div>
      </div>

      <div className="apps-footer-bottom">
        <p>© 2026 NoPromptJobs.com. All rights reserved.</p>
        <span>🛡 Secure & Verified Platform</span>
        <span>🔐 ISO 27001 Certified</span>
        <span>🇮🇳 Made with ❤️ in India</span>
      </div>
    </footer>
  );
}