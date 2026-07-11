import { useEffect, useState } from "react";
import axios from "axios";
import "./UltimateDashboard.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function UltimateDashboard({ children = null }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const candidateId = user?.candidateId || user?._id || user?.id || "";
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    candidate: {},
    resumeScore: 0,
    jobMatchScore: 0,
    trustScore: 0,
    applications: [],
    autoApply: [],
    jobs: [],
    hiddenJobs: [],
    savedJobs: [],
    notifications: [],
    interviews: [],
  });

  const goTo = (path) => {
    window.location.href = path;
  };

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const firstArray = (body, keys = []) => {
    for (const key of keys) {
      if (Array.isArray(body?.[key])) return body[key];
    }
    if (Array.isArray(body?.data)) return body.data;
    if (Array.isArray(body?.items)) return body.items;
    if (Array.isArray(body)) return body;
    return [];
  };

  const firstObject = (body, keys = []) => {
    for (const key of keys) {
      if (body?.[key] && typeof body[key] === "object") return body[key];
    }
    if (body?.data && typeof body.data === "object") return body.data;
    if (body && typeof body === "object") return body;
    return {};
  };

  const requestArray = async (urls, keys = []) => {
    for (const url of urls) {
      try {
        const res = await axios.get(url, { headers: authHeaders() });
        return firstArray(res.data, keys);
      } catch (err) {
        console.log("ARRAY API FAILED:", url, err.response?.data || err.message);
      }
    }
    return [];
  };

  const requestObject = async (urls, keys = []) => {
    for (const url of urls) {
      try {
        const res = await axios.get(url, { headers: authHeaders() });
        return firstObject(res.data, keys);
      } catch (err) {
        console.log("OBJECT API FAILED:", url, err.response?.data || err.message);
      }
    }
    return {};
  };

  const calculateResumeScore = (candidate) => {
    let score = 0;
    if (candidate?.resumeUrl || candidate?.resume) score += 25;
    if (candidate?.profileSummary) score += 15;
    if (candidate?.skills?.length) score += 20;
    if (candidate?.employment?.length || candidate?.workExperience?.length) score += 15;
    if (candidate?.education?.length) score += 10;
    if (candidate?.projects?.length || candidate?.projectTitle) score += 10;
    if (candidate?.linkedinUrl || candidate?.githubUrl || candidate?.portfolioUrl) score += 5;
    return Math.min(score, 100);
  };

  const calculateTrustScore = (candidate) => {
    let score = 25;
    if (candidate?.email) score += 10;
    if (candidate?.phone || candidate?.mobile) score += 10;
    if (candidate?.profileImageUrl) score += 10;
    if (candidate?.resumeUrl || candidate?.resume) score += 15;
    if (candidate?.selfIntroVideoUrl) score += 15;
    if (candidate?.projectVideoUrl) score += 10;
    if (candidate?.skills?.length) score += 5;
    return Math.min(score, 100);
  };

  const calculateJobMatchScore = (candidate, jobs) => {
    const candidateSkills = Array.isArray(candidate?.skills)
      ? candidate.skills.map((s) => String(s?.name || s).toLowerCase())
      : [];

    if (!candidateSkills.length || !jobs.length) return 0;

    const scores = jobs.slice(0, 20).map((job) => {
      const jobSkills = Array.isArray(job?.skills)
        ? job.skills.map((s) => String(s?.name || s).toLowerCase())
        : String(job?.skills || "").toLowerCase().split(",");

      const matched = candidateSkills.filter((s) =>
        jobSkills.some((j) => j.includes(s) || s.includes(j))
      );

      return Math.round((matched.length / Math.max(candidateSkills.length, 1)) * 100);
    });

    return Math.min(Math.round(scores.reduce((a, b) => a + b, 0) / scores.length), 100);
  };

  const loadUltimateRealData = async () => {
    if (!candidateId) {
      goTo("/candidate-login");
      return;
    }

    try {
      setLoading(true);

      const [
        candidate,
        applications,
        jobs,
        hiddenJobs,
        savedJobs,
        notifications,
        autoApply,
        interviews,
      ] = await Promise.all([
        requestObject([`${API_URL}/api/candidates/${candidateId}`], ["candidate"]),
        requestArray([
          `${API_URL}/api/applications/candidate/${candidateId}`,
          `${API_URL}/api/candidates/${candidateId}/applications`,
        ], ["applications"]),
        requestArray([`${API_URL}/api/jobs`], ["jobs"]),
        requestArray([`${API_URL}/api/jobs/hidden`], ["jobs", "hiddenJobs"]),
        requestArray([
          `${API_URL}/api/jobs/saved/${candidateId}`,
          `${API_URL}/api/candidates/${candidateId}/saved-jobs`,
        ], ["savedJobs", "jobs"]),
        requestArray([
          `${API_URL}/api/notifications/candidate/${candidateId}`,
        ], ["notifications"]),
        requestArray([
          `${API_URL}/api/auto-apply/candidate/${candidateId}`,
          `${API_URL}/api/auto-apply/${candidateId}`,
        ], ["autoApply", "applications", "data"]),
        requestArray([
          `${API_URL}/api/interviews/candidate/${candidateId}`,
          `${API_URL}/api/candidates/${candidateId}/interviews`,
        ], ["interviews"]),
      ]);

      setData({
        candidate,
        applications,
        jobs,
        hiddenJobs,
        savedJobs,
        notifications,
        autoApply,
        interviews,
        resumeScore:
          Number(candidate?.resumeScore) || calculateResumeScore(candidate),
        trustScore:
          Number(candidate?.trustScore) || calculateTrustScore(candidate),
        jobMatchScore:
          Number(candidate?.jobMatchScore) || calculateJobMatchScore(candidate, jobs),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUltimateRealData();
  }, [candidateId]);

  const candidate = data.candidate || {};
  const displayName = candidate?.name || candidate?.fullName || user?.name || "Candidate";
  const profileImage = candidate?.profileImageUrl || user?.profileImageUrl || "/profile.png";

  const unreadNotifications = data.notifications.filter((n) => !n.read && !n.isRead);
  const shortlisted = data.applications.filter((a) =>
    String(a.status || "").toLowerCase().includes("short")
  );
  const offers = data.applications.filter((a) =>
    String(a.status || "").toLowerCase().includes("offer")
  );

  const topJobs = data.jobs.slice(0, 3);
  const recentApplications = data.applications.slice(0, 3);
  const upcomingInterviews = data.interviews.slice(0, 3);

  const askCareerAssistant = async () => {
    if (!aiQuestion.trim()) return alert("Please type your question");

    try {
      setLoading(true);
      setAiAnswer("");

      const res = await axios.post(
        `${API_URL}/api/ai/career-assistant`,
        {
          candidateId,
          question: aiQuestion,
          candidate,
        },
        { headers: authHeaders() }
      );

      setAiAnswer(
        res.data?.answer ||
        res.data?.message ||
        res.data?.analysis ||
        "AI response received."
      );
    } catch (err) {
      alert(err.response?.data?.message || "AI assistant failed");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    ["📄", "Resume Score", `${data.resumeScore}%`, "ATS Optimized"],
    ["🎯", "Job Match Score", `${data.jobMatchScore}%`, "Best-fit jobs"],
    ["🛡", "Trust Score", `${data.trustScore}%`, "Verified profile"],
    ["💼", "Applications", data.applications.length, "Active applications"],
    ["🚀", "Auto Apply", data.autoApply.length, "Applications sent"],
    ["🔔", "Job Alerts", unreadNotifications.length, "Unread alerts"],
  ];

  return (
    <main className="ultimate-saas-page">
      <aside className="ultimate-saas-sidebar">
        <img src="/logo.png" alt="NoPromptJobs" className="ultimate-saas-logo" />

        <button onClick={() => goTo("/notifications")}>🔔 Notifications <b>{unreadNotifications.length}</b></button>
        <button onClick={() => goTo("/applications")}>▣ Applications <b>{data.applications.length}</b></button>
        <button onClick={() => goTo("/auto-apply")}>🚀 Auto Apply <b>{data.autoApply.length}</b></button>
        <button onClick={() => goTo("/job-alerts")}>🔔 Job Alerts <b>{unreadNotifications.length}</b></button>
        <button onClick={() => goTo("/resume-studio")}>📄 Resume Studio</button>
        <button onClick={() => goTo("/ai-interview-prep")}>🎙 Interview Prep</button>
        <button onClick={() => goTo("/skill-analyzer")}>📊 Skill Analyzer</button>
        <button onClick={() => goTo("/salary-predictor")}>💰 Salary Predictor</button>
        <button onClick={() => goTo("/career-roadmap")}>🧭 Career Roadmap</button>
        <button onClick={() => goTo("/saved-jobs")}>❤️ Saved Jobs <b>{data.savedJobs.length}</b></button>
        <button onClick={() => goTo("/hidden-opportunities")}>💎 Hidden Jobs <b>{data.hiddenJobs.length}</b></button>
        <button onClick={() => goTo("/trust-passport")}>🛡 Trust Passport</button>
      </aside>

      <section className="ultimate-saas-main">
        <header className="ultimate-saas-topbar">
          <div className="ultimate-search">
            <span>⌕</span>
            <input
              value={searchText}
              placeholder="Search jobs, companies, skills..."
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  goTo(`/jobs?search=${encodeURIComponent(searchText)}`);
                }
              }}
            />
          </div>

          <button className="ultimate-ai-btn">✨ AI Assistant</button>
          <button onClick={() => goTo("/notifications")}>🔔 {unreadNotifications.length}</button>

          <div className="ultimate-user-chip" onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <img src={profileImage} alt="Candidate" />
            <div>
              <b>{displayName}</b>
              <span>Verified Candidate</span>
            </div>
            <small>⌄</small>
          </div>

          {showProfileMenu && (
            <div className="profile-dropdown-menu ultimate-profile-menu">
              <button onClick={() => goTo(`/profile/${candidateId}`)}>My Profile</button>
              <button onClick={() => goTo("/candidate-settings")}>Settings</button>
              <button onClick={() => { localStorage.clear(); goTo("/candidate-login"); }}>Logout</button>
            </div>
          )}
        </header>

        {children ? children : (
          <>
            <section className="ultimate-hero-strip">
              <div>
                <span>Premium Candidate Intelligence</span>
                <h1>Welcome back, {displayName} 👋</h1>
                <p>All values below are loaded from your backend and candidate profile.</p>
              </div>
              <button onClick={loadUltimateRealData}>
                {loading ? "Refreshing..." : "Refresh Real Data ↻"}
              </button>
            </section>

            <section className="ultimate-stat-grid">
              {stats.map((s) => (
                <article className="ultimate-stat-card" key={s[1]}>
                  <span>{s[0]}</span>
                  <div>
                    <h3>{s[1]}</h3>
                    <h2>{s[2]}</h2>
                    <p>{s[3]}</p>
                  </div>
                </article>
              ))}
            </section>

            <section className="ultimate-dashboard-grid">
              <div className="ultimate-panel">
                <h2>Application Overview</h2>
                <div className="ultimate-overview-row">
                  <article><b>{data.applications.length}</b><span>Total</span></article>
                  <article><b>{shortlisted.length}</b><span>Shortlisted</span></article>
                  <article><b>{upcomingInterviews.length}</b><span>Interviews</span></article>
                  <article><b>{offers.length}</b><span>Offers</span></article>
                </div>
              </div>

              <div className="ultimate-panel">
                <h2>AI Career Assistant</h2>
                <div className="ultimate-ai-box">
                  <input
                    value={aiQuestion}
                    placeholder="Ask anything about your career..."
                    onChange={(e) => setAiQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && askCareerAssistant()}
                  />
                  <button onClick={askCareerAssistant}>➤</button>
                </div>
                {aiAnswer && <p className="ultimate-ai-answer">{aiAnswer}</p>}
              </div>

              <div className="ultimate-panel">
                <h2>Top Job Matches</h2>
                {topJobs.length ? topJobs.map((job) => (
                  <article className="ultimate-list-row" key={job._id || job.id}>
                    <b>{job.title || job.jobTitle || job.role}</b>
                    <span>{job.company || job.companyName} · {job.location || job.city}</span>
                  </article>
                )) : <p className="ultimate-empty">No jobs found from backend.</p>}
              </div>

              <div className="ultimate-panel">
                <h2>Recent Applications</h2>
                {recentApplications.length ? recentApplications.map((app) => (
                  <article className="ultimate-list-row" key={app._id || app.id}>
                    <b>{app.jobTitle || app.title || app.job?.title || "Application"}</b>
                    <span>{app.company || app.companyName || app.job?.company || "Company"} · {app.status || "Applied"}</span>
                  </article>
                )) : <p className="ultimate-empty">No applications found.</p>}
              </div>

              <div className="ultimate-panel">
                <h2>Upcoming Interviews</h2>
                {upcomingInterviews.length ? upcomingInterviews.map((item) => (
                  <article className="ultimate-list-row" key={item._id || item.id}>
                    <b>{item.company || item.companyName || "Company"}</b>
                    <span>{item.round || item.type || "Interview"} · {item.date || item.scheduledAt || "Date not set"}</span>
                  </article>
                )) : <p className="ultimate-empty">No upcoming interviews.</p>}
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
export default UltimateDashboard;