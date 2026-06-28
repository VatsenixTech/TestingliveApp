import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./HiddenOpportunitiesPage.css";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function HiddenOpportunitiesPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const candidateId = user?._id || user?.candidateId || user?.id;
  const name = user?.name || user?.fullName || "Candidate";
  const role = user?.role || user?.currentRole || "Candidate";

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All");
  const [workMode, setWorkMode] = useState("All");
  const [salaryRange, setSalaryRange] = useState("All");
  const [matchOnly, setMatchOnly] = useState(true);

  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function goTo(path) {
    window.location.href = path;
  }

  useEffect(() => {
    fetchHiddenOpportunities();
  }, [candidateId]);

  async function fetchHiddenOpportunities() {
    if (!candidateId) {
      setError("Candidate login required.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `${API_BASE}/api/hidden-opportunities/candidate/${candidateId}`
      );

      setJobs(res.data.opportunities || []);
      setStats(res.data.stats || null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load hidden opportunities."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const text = `${job.companyName || ""} ${job.role || ""} ${(job.requiredSkills || []).join(" ")}`.toLowerCase();

      const searchOk = text.includes(search.toLowerCase());

      const locationOk =
        location === "All" || (job.location || "").includes(location);

      const modeOk =
        workMode === "All" || job.workMode === workMode;

      const matchOk = !matchOnly || Number(job.aiMatch || 0) >= 80;

      let salaryOk = true;
      if (salaryRange === "30-40") {
        salaryOk = Number(job.salaryMin) >= 30 && Number(job.salaryMax) <= 45;
      }
      if (salaryRange === "40-50") {
        salaryOk = Number(job.salaryMin) >= 40 && Number(job.salaryMax) <= 55;
      }
      if (salaryRange === "50+") {
        salaryOk = Number(job.salaryMax) >= 50;
      }

      return searchOk && locationOk && modeOk && matchOk && salaryOk;
    });
  }, [jobs, search, location, workMode, salaryRange, matchOnly]);

  async function requestReferral(job) {
    try {
      const res = await axios.post(
        `${API_BASE}/api/hidden-opportunities/referral/${job._id}`,
        { candidateId }
      );

      alert(res.data.message || "Referral request submitted.");
      fetchHiddenOpportunities();
    } catch (err) {
      alert(err.response?.data?.message || "Referral request failed.");
    }
  }

  async function applyConfidentially(job) {
    try {
      const res = await axios.post(
        `${API_BASE}/api/hidden-opportunities/apply/${job._id}`,
        { candidateId }
      );

      alert(res.data.message || "Confidential application submitted.");
      setSelectedJob(null);
      fetchHiddenOpportunities();
    } catch (err) {
      alert(err.response?.data?.message || "Application failed.");
    }
  }

  function exportReport() {
    const text = `
NoPromptJobs Hidden Opportunities Report

Candidate: ${name}
Role: ${role}

Hidden Jobs: ${stats?.hiddenJobs || 0}
Emergency Openings: ${stats?.emergencyOpenings || 0}
Average Salary: ₹${stats?.avgSalary || 0} LPA
Recruiter Invites: ${stats?.recruiterInvites || 0}
Referral Available: ${stats?.referralAvailable || 0}
Best AI Match: ${stats?.bestMatch || 0}%

Opportunities:
${filteredJobs
  .map(
    (j) =>
      `${j.companyName} - ${j.role} - ₹${j.salaryMin}-${j.salaryMax} LPA - ${j.aiMatch}% Match - ${j.timeLeft}`
  )
  .join("\n")}
`;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "hidden-opportunities-report.txt";
    a.click();

    URL.revokeObjectURL(url);
  }

  function getTypeIcon(type) {
    if (type === "Emergency Opening") return "🔥";
    if (type === "Confidential Hiring") return "🔒";
    if (type === "Referral Opening") return "👥";
    if (type === "Fast Track Interview") return "⚡";
    if (type === "Contract Role") return "💼";
    if (type === "Premium High Salary") return "👑";
    return "🛡";
  }

  return (
    <main className="ho-page">
      <aside className="ho-sidebar">
        <div className="ho-logo">
          <img src="/logo.png" alt="NoPromptJobs" />
        </div>

        <nav className="ho-menu">
          <button onClick={() => goTo("/ultimate-dashboard")}>🏠 Dashboard</button>
          <button onClick={() => goTo("/resume-studio")}>📄 AI Resume Review</button>
          <button onClick={() => goTo("/skill-analyzer")}>📊 Skill Analyzer</button>
          <button onClick={() => goTo("/career-roadmap")}>🧭 Career Roadmap</button>
          <button onClick={() => goTo("/salary-predictor")}>💰 Salary Predictor</button>
          <button onClick={() => goTo("/jobs")}>💼 Job Matcher</button>
          <button onClick={() => goTo("/ai-interview-prep")}>🎤 Interview Prep</button>
          <button onClick={() => goTo("/ai-interview-prep?tab=Question%20Bank")}>
            📚 Question Bank
          </button>
          <button className="active">🛡 Hidden Opportunities</button>
          <button onClick={() => goTo("/applications")}>📂 My Applications</button>
          <button onClick={() => goTo("/ai-interview-prep?tab=My%20Reports")}>
            📈 Reports
          </button>
          <button onClick={() => goTo("/settings")}>⚙ Settings</button>
        </nav>

        <div className="ho-profile">
          <div className="ho-profile-img">
            <img src={user?.profileImageUrl || "/profile.png"} alt="Candidate" />
          </div>
          <div>
            <h4>{name}</h4>
            <p>{role}</p>
          </div>
          <span>{stats?.bestMatch || 0}%</span>
        </div>
      </aside>

      <section className="ho-main">
        <header className="ho-header">
          <div>
            <h1>Hidden Opportunities 👑</h1>
            <p>
              Emergency openings, confidential hiring, referral roles and recruiter-only jobs.
            </p>
          </div>

          <div className="ho-header-actions">
            <button onClick={fetchHiddenOpportunities}>⟳ Refresh</button>
            <button onClick={exportReport}>⬇ Export</button>
            <div className="ho-avatar">{name.slice(0, 2).toUpperCase()}</div>
          </div>
        </header>

        <section className="ho-filter-card">
          <div className="ho-search">
            <span>⌕</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hidden jobs, companies, roles, skills..."
            />
          </div>

          <select value={location} onChange={(e) => setLocation(e.target.value)}>
            <option>All</option>
            <option>Bangalore</option>
            <option>Hyderabad</option>
            <option>Pune</option>
            <option>Chennai</option>
            <option>Mumbai</option>
            <option>Remote</option>
          </select>

          <select value={workMode} onChange={(e) => setWorkMode(e.target.value)}>
            <option>All</option>
            <option>Remote</option>
            <option>Hybrid</option>
            <option>Onsite</option>
          </select>

          <select value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)}>
            <option>All</option>
            <option value="30-40">₹30-40 LPA</option>
            <option value="40-50">₹40-50 LPA</option>
            <option value="50+">₹50+ LPA</option>
          </select>

          <label className="ho-toggle">
            AI Match Only
            <input
              type="checkbox"
              checked={matchOnly}
              onChange={(e) => setMatchOnly(e.target.checked)}
            />
            <span></span>
          </label>
        </section>

        <section className="ho-stats-grid">
          {[
            ["💼", stats?.hiddenJobs || 0, "Hidden Jobs", "Active now"],
            ["🔥", stats?.emergencyOpenings || 0, "Emergency", "Closing soon"],
            ["💵", `₹${stats?.avgSalary || 0} LPA`, "Avg. Salary", "Market estimate"],
            ["👥", stats?.recruiterInvites || 0, "Recruiter Invites", "High match roles"],
            ["🎯", `${stats?.bestMatch || 0}%`, "Best AI Match", "Profile fit"],
          ].map((item) => (
            <article className="ho-stat" key={item[2]}>
              <div>{item[0]}</div>
              <h2>{item[1]}</h2>
              <p>{item[2]}</p>
              <small>{item[3]}</small>
            </article>
          ))}
        </section>

        {loading && (
          <div className="ho-section-card">
            <div className="ho-empty">Loading hidden opportunities...</div>
          </div>
        )}

        {error && !loading && (
          <div className="ho-section-card">
            <div className="ho-empty">{error}</div>
          </div>
        )}

        {!loading && !error && (
          <section className="ho-content-grid">
            <section className="ho-left">
              <div className="ho-section-card">
                <div className="ho-section-title">
                  <h2>Real Hidden Opportunities</h2>
                  <span>Recruiter Verified</span>
                </div>

                {filteredJobs.length === 0 ? (
                  <div className="ho-empty">
                    No matching hidden opportunities found right now.
                  </div>
                ) : (
                  filteredJobs.map((job) => (
                    <article className="ho-job-card" key={job._id}>
                      <div className="ho-company-logo">
                        {job.companyLogo ? (
                          <img src={job.companyLogo} alt={job.companyName} />
                        ) : (
                          (job.companyName || "C").slice(0, 1)
                        )}
                      </div>

                      <div className="ho-job-main">
                        <span className={`exclusive ${job.urgencyLevel?.toLowerCase()}`}>
                          {getTypeIcon(job.opportunityType)} {job.opportunityType}
                        </span>

                        <span className="deadline-badge">⏳ {job.timeLeft}</span>

                        <h3>{job.role}</h3>

                        <p>
                          {job.companyName} • {job.location} • {job.workMode}
                        </p>

                        <div className="ho-tags">
                          {(job.requiredSkills || []).map((skill) => (
                            <span key={skill}>{skill}</span>
                          ))}
                        </div>
                      </div>

                      <div className="ho-recruiter">
                        <p>Openings</p>
                        <b>{job.openings || 1}</b>
                        <p>Applicants</p>
                        <h4>{job.applicantsCount || 0}</h4>
                      </div>

                      <div className="ho-match">
                        <div>{job.aiMatch || 0}%</div>
                        <p>
                          {(job.aiMatch || 0) >= 90
                            ? "Very Strong Match"
                            : "Strong Match"}
                        </p>
                      </div>

                      <div className="ho-actions">
                        <button onClick={() => setSelectedJob(job)}>
                          View Details
                        </button>

                        <button
                          disabled={job.referralRequested}
                          onClick={() => requestReferral(job)}
                        >
                          {job.referralRequested ? "Referral Requested" : "Request Referral"}
                        </button>

                        <button
                          disabled={job.hasApplied}
                          onClick={() => applyConfidentially(job)}
                        >
                          {job.hasApplied ? "Applied" : "Apply Confidentially"}
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            <aside className="ho-right">
              <div className="ho-insight-card">
                <h3>AI Career Intelligence <span>BETA</span></h3>
                <div className="career-ring">{stats?.bestMatch || 0}%</div>
                <b>Best Match Score</b>
                <p>Your profile is compared with active hidden roles.</p>
              </div>

              <div className="ho-insight-card">
                <h3>Hidden Opportunity Types</h3>
                <p>🔥 Emergency openings close within 24–72 hours.</p>
                <p>🔒 Confidential hiring is recruiter-only.</p>
                <p>👥 Referral openings require referral approval.</p>
                <p>⚡ Fast-track roles can schedule interviews quickly.</p>
              </div>

              <div className="ho-insight-card">
                <h3>Improve Your Match</h3>
                <p>✅ Keep resume updated.</p>
                <p>✅ Complete Trust Passport.</p>
                <p>✅ Add missing skills.</p>
                <p>✅ Practice AI interviews.</p>
              </div>
            </aside>
          </section>
        )}
      </section>

      {selectedJob && (
        <div className="ho-modal">
          <div className="ho-modal-card">
            <button className="close" onClick={() => setSelectedJob(null)}>
              ×
            </button>

            <h2>{selectedJob.role}</h2>
            <h3>{selectedJob.companyName}</h3>

            <p>
              {selectedJob.description ||
                "This is a hidden recruiter-side opportunity available only to matching candidates."}
            </p>

            <div className="modal-grid">
              <div>
                <b>Salary</b>
                <span>
                  ₹{selectedJob.salaryMin}-{selectedJob.salaryMax} LPA
                </span>
              </div>

              <div>
                <b>AI Match</b>
                <span>{selectedJob.aiMatch}%</span>
              </div>

              <div>
                <b>Closing</b>
                <span>{selectedJob.timeLeft}</span>
              </div>

              <div>
                <b>Type</b>
                <span>{selectedJob.opportunityType}</span>
              </div>
            </div>

            <button
              disabled={selectedJob.referralRequested}
              onClick={() => requestReferral(selectedJob)}
            >
              {selectedJob.referralRequested ? "Referral Requested" : "Request Referral"}
            </button>

            <button
              disabled={selectedJob.hasApplied}
              onClick={() => applyConfidentially(selectedJob)}
            >
              {selectedJob.hasApplied ? "Already Applied" : "Apply Confidentially"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default HiddenOpportunitiesPage;