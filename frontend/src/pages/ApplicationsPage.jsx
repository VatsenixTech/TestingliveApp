import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./ApplicationsPage.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ApplicationsPage() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const candidateId = user?.candidateId || user?._id || user?.id;
  const name = user?.name || "Venkatesha A";

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

  useEffect(() => {
    fetchApplications();
    fetchHiddenJobs();
    fetchEmergencyJobs();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_URL}/api/applications/candidate/${candidateId}`
      );

      setApplications(res.data?.applications || res.data || []);
    } catch (err) {
      console.log("APPLICATIONS ERROR:", err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHiddenJobs = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/jobs/hidden`);
      setHiddenJobs(res.data?.jobs || res.data || []);
    } catch (err) {
      console.log("HIDDEN JOBS ERROR:", err);
      setHiddenJobs([]);
    }
  };

  const fetchEmergencyJobs = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/jobs/emergency`);
      setEmergencyJobs(res.data?.jobs || res.data || []);
    } catch (err) {
      console.log("EMERGENCY JOBS ERROR:", err);
      setEmergencyJobs([]);
    }
  };

  const addApplication = async () => {
    if (!form.role || !form.company) {
      alert("Please enter role and company");
      return;
    }

    try {
      await axios.post(`${API_URL}/api/applications`, {
        candidateId,
        role: form.role,
        company: form.company,
        location: form.location,
        status: form.status,
        appliedDate: new Date(),
      });

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
    try {
      await axios.put(`${API_URL}/api/applications/${id}`, { status });
      fetchApplications();
    } catch (err) {
      alert("Status update failed");
    }
  };

  const deleteApplication = async (id) => {
    const ok = window.confirm("Delete this application?");
    if (!ok) return;

    try {
      await axios.delete(`${API_URL}/api/applications/${id}`);
      fetchApplications();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesTab =
        activeTab === "All" || app.status?.toLowerCase() === activeTab.toLowerCase();

      const text = `${app.role} ${app.company} ${app.location} ${app.status}`.toLowerCase();

      return matchesTab && text.includes(searchText.toLowerCase());
    });
  }, [applications, activeTab, searchText]);

  const total = applications.length;
  const underReview = applications.filter((a) => a.status === "Under Review").length;
  const interview = applications.filter((a) => a.status === "Interview").length;
  const offered = applications.filter((a) => a.status === "Offered").length;
  const rejected = applications.filter((a) => a.status === "Rejected").length;
  const saved = applications.filter((a) => a.status === "Saved").length;
  const successRate = total ? Math.round((offered / total) * 100) : 0;

  return (
    <main className="apps-shell">
      <aside className="apps-sidebar">
        <div className="apps-brand">
          <img src="/logo.png" alt="NoPromptJobs" />
          <div>
            <h2>NoPrompt</h2>
            <span>ULTIMATE</span>
          </div>
        </div>

        <nav className="apps-menu">
          <a onClick={() => (window.location.href = "/ultimate-dashboard")}>
            ⌂ Dashboard
          </a>
          <a>✦ Workspace</a>
          <a className="active">▣ Applications <b>{total}</b></a>
          <a onClick={() => (window.location.href = "/auto-apply")}>
            ⚡ Auto Apply
          </a>
          <a onClick={() => (window.location.href = "/job-alerts")}>
            🔔 Job Alerts
          </a>
          <a onClick={() => (window.location.href = "/resume-studio")}>
            📄 Resume Studio
          </a>
          <a onClick={() => (window.location.href = "/interview-alerts")}>
            ▦ Interview Alerts
          </a>
          <a onClick={() => (window.location.href = "/ai-interview-prep")}>
            🎤 AI Interview Prep
          </a>
        </nav>
      </aside>

      <section className="apps-main">
        <header className="apps-topbar">
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search applications, jobs, companies..."
          />
          <button onClick={() => alert("Career assistant will open here")}>
            ✦ Assistant
          </button>
          <span onClick={() => (window.location.href = "/notifications")}>🔔</span>
          <div className="avatar">{name.charAt(0).toUpperCase()}</div>
        </header>

        <section className="apps-panel">
          <div className="apps-title-row">
            <div>
              <h1>My Applications</h1>
              <p>Track real job applications, hidden jobs and emergency hiring.</p>
            </div>

            <div className="apps-actions">
              <button className="ghost" onClick={() => window.print()}>
                ⇩ Export Report
              </button>
              <button className="primary" onClick={() => setShowAdd(true)}>
                + Add Application
              </button>
            </div>
          </div>

          <div className="tabs">
            {["All", "Applied", "Under Review", "Interview", "Offered", "Rejected", "Saved"].map(
              (tab) => (
                <button
                  key={tab}
                  className={activeTab === tab ? "active" : ""}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          <div className="stats-grid">
            <Stat title="Total Applications" value={total} icon="💼" />
            <Stat title="Under Review" value={underReview} icon="👁" />
            <Stat title="Interview" value={interview} icon="👥" />
            <Stat title="Offered" value={offered} icon="✅" />
            <Stat title="Success Rate" value={`${successRate}%`} icon="📈" danger />
          </div>

          <div className="content-grid">
            <div className="recent-card">
              <h2>Recent Applications</h2>

              {loading && <p>Loading applications...</p>}

              {!loading && filteredApplications.length === 0 && (
                <p>No applications found. Click Add Application.</p>
              )}

              {filteredApplications.map((app) => (
                <div className="app-row" key={app._id}>
                  <div className="company-logo">
                    {app.company?.charAt(0)?.toUpperCase()}
                  </div>

                  <div className="app-info">
                    <h3>{app.role}</h3>
                    <p>{app.company} • {app.location || "Location not added"}</p>
                  </div>

                  <select
                    value={app.status}
                    onChange={(e) => updateStatus(app._id, e.target.value)}
                  >
                    <option>Applied</option>
                    <option>Under Review</option>
                    <option>Interview</option>
                    <option>Offered</option>
                    <option>Rejected</option>
                    <option>Saved</option>
                  </select>

                  <div className="date">
                    <strong>
                      {app.appliedDate
                        ? new Date(app.appliedDate).toLocaleDateString()
                        : "Today"}
                    </strong>
                  </div>

                  <button className="dots" onClick={() => deleteApplication(app._id)}>
                    🗑
                  </button>
                </div>
              ))}
            </div>

            <aside className="right-stack">
              <div className="quick-card">
                <h2>Quick Actions</h2>

                <Action
                  icon="🚨"
                  title="Emergency Recruitment"
                  text={`${emergencyJobs.length} urgent jobs available`}
                  onClick={() => (window.location.href = "/emergency-recruitment")}
                />

                <Action
                  icon="🔒"
                  title="Hidden Applications"
                  text={`${hiddenJobs.length} private jobs available`}
                  onClick={() => (window.location.href = "/hidden-opportunities")}
                />

                <Action
                  icon="⬆"
                  title="Bulk Application Import"
                  text="Import applications from Excel"
                  onClick={() => alert("Bulk import module can be connected next")}
                />

                <Action
                  icon="📄"
                  title="Application Templates"
                  text="Save and reuse templates"
                  onClick={() => alert("Application template page can be created next")}
                />
              </div>

              <div className="quick-card">
                <h2>Application Insights</h2>
                <Action icon="📌" title="Saved Jobs" text={`${saved} saved jobs`} />
                <Action icon="❌" title="Rejected" text={`${rejected} rejected applications`} />
              </div>
            </aside>
          </div>
        </section>
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
              <option>Applied</option>
              <option>Under Review</option>
              <option>Interview</option>
              <option>Offered</option>
              <option>Rejected</option>
              <option>Saved</option>
            </select>

            <button className="primary" onClick={addApplication}>
              Save Application
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({ title, value, icon, danger }) {
  return (
    <div className="stat-card">
      <div>
        <p>{title}</p>
        <h2>{value}</h2>
        <span className={danger ? "danger" : ""}>↑ live data</span>
      </div>
      <i>{icon}</i>
    </div>
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