import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./JobAlertsPage.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function JobAlertsPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const candidateId = user?._id || user?.candidateId || user?.id;
  const name = user?.name || user?.fullName || "Candidate";
  const role = user?.role || user?.currentRole || "Candidate";

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All Alerts");
  const [details, setDetails] = useState(null);

  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function goTo(path) {
    window.location.href = path;
  }

  useEffect(() => {
    fetchAlerts();
  }, [candidateId]);

  async function fetchAlerts() {
    if (!candidateId) {
      setError("Candidate login required.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.get(`${API_BASE}/api/job-alerts/candidate/${candidateId}`);

      setAlerts(res.data.alerts || []);
      setStats(res.data.stats || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load job alerts.");
    } finally {
      setLoading(false);
    }
  }

  const filteredAlerts = useMemo(() => {
    return alerts.filter((item) => {
      const tabOk =
        activeTab === "All Alerts" ||
        (activeTab === "High Match" && item.aiMatch >= 90) ||
        (activeTab === "Closing Soon" && item.closingText && item.closingText !== "Expired") ||
        (activeTab === "Salary Upgrade" && item.isSalaryUpgrade) ||
        item.alertType === activeTab;

      const text = `${item.companyName || ""} ${item.title || ""} ${item.location || ""} ${(item.requiredSkills || []).join(" ")}`.toLowerCase();

      return tabOk && text.includes(search.toLowerCase());
    });
  }, [alerts, activeTab, search]);

  async function applyNow(alert) {
    try {
      const res = await axios.post(`${API_BASE}/api/job-alerts/apply/${alert._id}`);
      alert(res.data.message || "Application started.");
      fetchAlerts();
    } catch (err) {
      window.alert(err.response?.data?.message || "Application failed.");
    }
  }

  async function saveAlert(alert) {
    try {
      const res = await axios.post(`${API_BASE}/api/job-alerts/save/${alert._id}`);
      window.alert(res.data.message || "Alert saved.");
      fetchAlerts();
    } catch (err) {
      window.alert(err.response?.data?.message || "Save failed.");
    }
  }

  async function dismissAlert(alert) {
    try {
      await axios.post(`${API_BASE}/api/job-alerts/dismiss/${alert._id}`);
      fetchAlerts();
    } catch (err) {
      window.alert(err.response?.data?.message || "Dismiss failed.");
    }
  }

  function exportAlerts() {
    const content = `
NoPromptJobs Job Alerts Report

Candidate: ${name}
Role: ${role}

New Alerts Today: ${stats?.newAlertsToday || 0}
High Match Jobs: ${stats?.highMatchJobs || 0}
Urgent Jobs: ${stats?.urgentJobs || 0}
Salary Upgrade: ₹${stats?.salaryUpgrade || 0} LPA
Companies Hiring You: ${stats?.companiesHiring || 0}
AI Recommended: ${stats?.aiRecommended || 0}

Alerts:
${filteredAlerts
  .map(
    (a) =>
      `${a.companyName} - ${a.title} - ₹${a.salaryMin}-${a.salaryMax} LPA - ${a.aiMatch}% Match`
  )
  .join("\n")}
`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const file = document.createElement("a");

    file.href = url;
    file.download = "job-alerts-report.txt";
    file.click();

    URL.revokeObjectURL(url);
  }

  function getLogoText(alert) {
    if (alert.companyLogo) return null;
    return (alert.companyName || "C").slice(0, 1).toUpperCase();
  }

  function getLabelClass(type = "") {
    return type.toLowerCase().replaceAll(" ", "-");
  }

  return (
    <main className="ja-page">
      <aside className="ja-sidebar">
        <div className="ja-brand">
          <img src="/logo.png" alt="NoPromptJobs" />
        </div>

        <nav className="ja-menu">
          <button onClick={() => goTo("/ultimate-dashboard")}>🏠 Dashboard</button>
          <button onClick={() => goTo("/resume-studio")}>📄 AI Resume Review</button>
          <button onClick={() => goTo("/services")}>🤖 AI Workspace <span>New</span></button>
          <button onClick={() => goTo("/skill-analyzer")}>📊 Skill Analyzer</button>
          <button onClick={() => goTo("/career-roadmap")}>🧭 Career Roadmap</button>
          <button onClick={() => goTo("/salary-predictor")}>💰 Salary Predictor</button>
          <button onClick={() => goTo("/jobs")}>💼 Job Matcher</button>
          <button onClick={() => goTo("/ai-interview-prep")}>🎤 Interview Prep</button>
          <button onClick={() => goTo("/ai-interview-prep?tab=Question%20Bank")}>📚 Question Bank</button>
          <button onClick={() => goTo("/applications")}>📂 Applications <b>28</b></button>
          <button className="active">🔔 Job Alerts <b>{stats?.newAlertsToday || 0}</b></button>
          <button onClick={() => goTo("/saved-jobs")}>❤️ Saved Jobs</button>
          <button onClick={() => goTo("/hidden-opportunities")}>💎 Hidden Opportunities</button>
          <button onClick={() => goTo("/ai-interview-prep?tab=My%20Reports")}>📄 Reports</button>
          <button onClick={() => goTo("/trust-passport")}>🛡 Trust Passport</button>
          <button onClick={() => goTo("/settings")}>⚙ Settings</button>
        </nav>

        <div className="ja-member-card">
          <div className="crown">👑</div>
          <h3>You are an Ultimate Member</h3>
          <p>Enjoy all premium benefits</p>
          <button onClick={() => goTo("/services")}>View Benefits</button>
        </div>
      </aside>

      <section className="ja-main">
        <header className="ja-topbar">
          <div className="ja-search">
            <span>⌕</span>
            <input
              placeholder="Search jobs, companies, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <b>⌘ K</b>
          </div>

          <button className="ai-btn" onClick={() => goTo("/services")}>✨ AI Assistant</button>
          <button className="icon-btn">🔔 <b>{stats?.newAlertsToday || 0}</b></button>
          <button className="icon-btn">💬 <b>{stats?.recruiterMessages || 0}</b></button>

          <div className="ja-user">
            <img src={user?.profileImageUrl || "/profile.png"} alt="Candidate" />
            <div>
              <h4>{name}</h4>
              <p>Ultimate Member 👑</p>
            </div>
            <span>⌄</span>
          </div>
        </header>

        <section className="ja-hero">
          <div>
            <h1>🔔 Job Alerts</h1>
            <p>Real-time job alerts, recruiter updates & AI-powered opportunities</p>
          </div>

          <button onClick={() => setDetails({ type: "preferences" })}>
            ⚙ Manage Alert Preferences
          </button>
        </section>

        <section className="ja-stats-grid">
          {[
            ["🔔", "New Alerts Today", stats?.newAlertsToday || 0, "Today"],
            ["🎯", "High Match Jobs", stats?.highMatchJobs || 0, "90%+ match"],
            ["⚡", "Urgent Jobs", stats?.urgentJobs || 0, "Closing soon"],
            ["💰", "Salary Upgrade", `₹${stats?.salaryUpgrade || 0} LPA`, "Avg. increase"],
            ["🏢", "Companies Hiring You", stats?.companiesHiring || 0, "Actively recruiting"],
            ["🤖", "AI Recommended", stats?.aiRecommended || 0, "Based on your profile"],
          ].map((item) => (
            <article className="ja-stat-card" key={item[1]}>
              <div>{item[0]}</div>
              <p>{item[1]}</p>
              <h2>{item[2]}</h2>
              <small>{item[3]}</small>
            </article>
          ))}
        </section>

        {loading && <div className="ja-empty">Loading job alerts...</div>}
        {error && !loading && <div className="ja-empty">{error}</div>}

        {!loading && !error && (
          <section className="ja-layout">
            <section className="ja-center">
              <div className="ja-tabs">
                {[
                  "All Alerts",
                  "High Match",
                  "Closing Soon",
                  "Salary Upgrade",
                  "Recruiter Activity",
                  "Interview Alert",
                  "Referral Job",
                  "AI Suggestion",
                ].map((tab) => (
                  <button
                    key={tab}
                    className={activeTab === tab ? "active" : ""}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="ja-alert-list">
                {filteredAlerts.length === 0 ? (
                  <div className="ja-empty">No matching alerts found.</div>
                ) : (
                  filteredAlerts.map((item) => (
                    <article className="ja-alert-row" key={item._id}>
                      <button className="save-btn" onClick={() => saveAlert(item)}>
                        {item.status === "saved" ? "★" : "♡"}
                      </button>

                      <div className="company-logo">
                        {item.companyLogo ? (
                          <img src={item.companyLogo} alt={item.companyName} />
                        ) : (
                          getLogoText(item)
                        )}
                      </div>

                      <div className="alert-info">
                        <span className={`alert-label ${getLabelClass(item.alertType)}`}>
                          {item.alertType}
                        </span>

                        <h3>{item.title}</h3>

                        <p>
                          {item.companyName} • {item.location} • {item.workMode}
                        </p>

                        <div className="alert-tags">
                          <span>🛡 {item.aiMatch || 0}% Match</span>
                          <span>₹{item.salaryMin || 0} - {item.salaryMax || 0} LPA</span>
                          <span>{item.experienceMin || 0}-{item.experienceMax || 0} Yrs Exp</span>
                        </div>
                      </div>

                      <div className="alert-score">
                        {item.closingText && item.closingText !== "Expired" ? (
                          <div className="closing-box">
                            <p>Closing in</p>
                            <h3>{item.closingText}</h3>
                            <small>{item.postedText}</small>
                          </div>
                        ) : (
                          <div className="best-match">
                            <p>AI Match</p>
                            <h3>{item.aiMatch || 0}%</h3>
                            <span></span>
                            <small>{item.postedText}</small>
                          </div>
                        )}
                      </div>

                      <div className="alert-actions">
                        <button
                          disabled={item.status === "applied"}
                          onClick={() => applyNow(item)}
                        >
                          {item.status === "applied" ? "Applied" : "Apply Now"}
                        </button>

                        <button onClick={() => setDetails(item)}>View Details</button>
                      </div>

                      <button className="more-btn" onClick={() => dismissAlert(item)}>×</button>
                    </article>
                  ))
                )}
              </div>

              <button className="load-more" onClick={fetchAlerts}>
                Refresh Alerts
              </button>

              <div className="enable-banner">
                <div>
                  <span>🔔</span>
                  <h3>Never Miss an Opportunity! 🔔</h3>
                  <p>Enable notifications and stay ahead of other candidates.</p>
                </div>
                <button onClick={() => window.alert("All notifications enabled.")}>
                  Enable All Notifications
                </button>
              </div>
            </section>

            <aside className="ja-right">
              <div className="side-card">
                <div className="side-head">
                  <h3>Alert Filters</h3>
                  <button onClick={() => setActiveTab("All Alerts")}>Clear All</button>
                </div>

                {[
                  ["🔔 All Alerts", stats?.totalAlerts || 0],
                  ["💰 High Salary", stats?.salaryUpgrade || 0],
                  ["💬 Recruiter Messages", stats?.recruiterMessages || 0],
                  ["🎯 Interview Alerts", stats?.interviewAlerts || 0],
                  ["🔗 Referral Jobs", stats?.referralJobs || 0],
                  ["⏱ Closing Soon", stats?.closingSoon || 0],
                  ["🛡 Premium Only", stats?.premiumOnly || 0],
                ].map((filter) => (
                  <button className="filter-row" key={filter[0]}>
                    <span>{filter[0]}</span>
                    <b>{filter[1]}</b>
                  </button>
                ))}
              </div>

              <div className="side-card">
                <h3>AI Insights</h3>
                <div className="insight-grid">
                  <div><p>Total Alerts</p><h3>{stats?.totalAlerts || 0}</h3></div>
                  <div><p>High Match</p><h3>{stats?.highMatchJobs || 0}</h3></div>
                  <div><p>Interviews</p><h3>{stats?.interviewAlerts || 0}</h3></div>
                  <div><p>Offer Probability</p><h3>76%</h3><span className="mini-ring"></span></div>
                </div>
              </div>

              <div className="side-card">
                <h3>Notification Channels</h3>
                <div className="channel-grid">
                  {[
                    ["📧", "Email", "Active"],
                    ["🟢", "WhatsApp", "Active"],
                    ["🔔", "Push", "Active"],
                    ["💬", "SMS", "Inactive"],
                  ].map((item) => (
                    <div key={item[1]}>
                      <span>{item[0]}</span>
                      <p>{item[1]}</p>
                      <small className={item[2] === "Active" ? "active" : ""}>{item[2]}</small>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </section>
        )}
      </section>

      {details && (
        <div className="ja-modal">
          <div className="ja-modal-card">
            <button className="modal-close" onClick={() => setDetails(null)}>×</button>

            {details.type === "preferences" ? (
              <>
                <h2>Manage Alert Preferences</h2>
                <p>Customize how NoPromptJobs sends job alerts.</p>

                {[
                  "Email Alerts",
                  "WhatsApp Alerts",
                  "Browser Push Notifications",
                  "High Salary Alerts",
                  "Closing Soon Alerts",
                  "Recruiter Activity Alerts",
                ].map((item) => (
                  <label className="pref-row" key={item}>
                    <span>{item}</span>
                    <input type="checkbox" defaultChecked />
                  </label>
                ))}

                <button onClick={() => setDetails(null)}>Save Preferences</button>
              </>
            ) : (
              <>
                <h2>{details.title}</h2>
                <h3>{details.companyName}</h3>
                <p>
                  {details.recruiterMessage ||
                    "This alert is recommended based on your profile, skills, resume and recruiter activity."}
                </p>

                <div className="modal-grid">
                  <div><b>Location</b><span>{details.location}</span></div>
                  <div><b>Work Mode</b><span>{details.workMode}</span></div>
                  <div><b>Salary</b><span>₹{details.salaryMin}-{details.salaryMax} LPA</span></div>
                  <div><b>AI Match</b><span>{details.aiMatch}%</span></div>
                </div>

                <button onClick={() => applyNow(details)}>Apply Now</button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default JobAlertsPage;