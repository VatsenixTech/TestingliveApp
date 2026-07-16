import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaArrowRight,
  FaBell,
  FaBriefcase,
  FaCalendarPlus,
  FaChartLine,
  FaCheck,
  FaChevronDown,
  FaChevronRight,
  FaCircleCheck,
  FaFacebookF,
  FaFileLines,
  FaGear,
  FaHeart,
  FaInstagram,
  FaLinkedinIn,
  FaLock,
  FaMagnifyingGlass,
  FaMicrophone,
  FaRegCalendarDays,
  FaRegMessage,
  FaRightFromBracket,
  FaRocket,
  FaShieldHalved,
  FaStar,
  FaUser,
  FaUserGroup,
  FaWandMagicSparkles,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { HiOutlineHome, HiOutlineLightBulb } from "react-icons/hi";
import { MdOutlineAutoGraph, MdOutlineWorkOutline } from "react-icons/md";
import { RiRobot2Line } from "react-icons/ri";
import { TbBrain, TbTargetArrow } from "react-icons/tb";
import "./PremiumCareerDashboard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const EMPTY_DATA = {
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
};

function safeParseUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

function clampScore(value) {
  const number = Number(value || 0);
  return Math.max(0, Math.min(100, Number.isFinite(number) ? number : 0));
}

function statusOf(item) {
  return String(item?.status || item?.applicationStatus || "").toLowerCase();
}

function getDateValue(item) {
  return item?.date || item?.scheduledAt || item?.interviewDate || null;
}

function formatDate(value) {
  if (!value) return "Date pending";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Date pending";
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function MiniSparkline({ variant = 0 }) {
  const paths = [
    "M2 23 C14 20, 18 25, 29 20 S45 13, 56 17 S70 13, 82 11",
    "M2 23 C14 24, 20 19, 30 21 S45 11, 56 16 S68 8, 82 10",
    "M2 23 C16 19, 22 23, 33 17 S47 10, 58 14 S72 13, 82 8",
    "M2 23 C13 22, 18 25, 29 20 S43 13, 55 16 S69 9, 82 12",
    "M2 22 C15 18, 22 22, 32 20 S46 12, 57 14 S70 8, 82 9",
  ];

  return (
    <svg className="ud-sparkline" viewBox="0 0 84 28" aria-hidden="true">
      <path d={paths[variant % paths.length]} />
    </svg>
  );
}

function DashboardFooter({ goTo }) {
  const openExternal = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const subscribe = () => {
    const emailInput = document.getElementById("ud-newsletter-email");
    const email = emailInput?.value?.trim();

    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address");
      emailInput?.focus();
      return;
    }

    localStorage.setItem("newsletterEmail", email);
    alert("Thank you. You are subscribed to NoPromptJobs updates.");
    emailInput.value = "";
  };

  return (
    <footer className="ud-footer">
      <div className="ud-footer-main">
        <div className="ud-footer-brand">
          <button
            type="button"
            className="ud-footer-logo-button"
            onClick={() => goTo("/ultimate-dashboard")}
            aria-label="Open dashboard"
          >
            <img src="/logo.png" alt="NoPromptJobs" />
          </button>

          <p>Smart hiring. Real careers.</p>

          <div className="ud-socials">
            <button type="button" aria-label="LinkedIn" onClick={() => openExternal("https://www.linkedin.com")}><FaLinkedinIn /></button>
            <button type="button" aria-label="X" onClick={() => openExternal("https://x.com")}><FaXTwitter /></button>
            <button type="button" aria-label="Facebook" onClick={() => openExternal("https://www.facebook.com")}><FaFacebookF /></button>
            <button type="button" aria-label="Instagram" onClick={() => openExternal("https://www.instagram.com")}><FaInstagram /></button>
            <button type="button" aria-label="YouTube" onClick={() => openExternal("https://www.youtube.com")}><FaYoutube /></button>
          </div>
        </div>

        <div className="ud-footer-column">
          <h4>For Candidates</h4>
          <button type="button" onClick={() => goTo("/jobs")}>Browse Jobs</button>
          <button type="button" onClick={() => goTo("/resume-studio")}>Resume Studio</button>
          <button type="button" onClick={() => goTo("/ai-interview-prep")}>AI Interview Prep</button>
          <button type="button" onClick={() => goTo("/skill-analyzer")}>Skill Analyzer</button>
          <button type="button" onClick={() => goTo("/salary-predictor")}>Salary Predictor</button>
        </div>

        <div className="ud-footer-column">
          <h4>Company</h4>
          <button type="button" onClick={() => goTo("/about")}>About Us</button>
          <button type="button" onClick={() => goTo("/how-it-works")}>How It Works</button>
          <button type="button" onClick={() => goTo("/blog")}>Blog</button>
          <button type="button" onClick={() => goTo("/careers")}>Careers</button>
          <button type="button" onClick={() => goTo("/contact")}>Contact Us</button>
        </div>

        <div className="ud-footer-newsletter">
          <h4>Stay Updated</h4>
          <p>Get the latest jobs and career insights straight to your inbox.</p>
          <div>
            <input id="ud-newsletter-email" type="email" placeholder="Enter your email" />
            <button type="button" onClick={subscribe}>Subscribe</button>
          </div>
          <div className="ud-store-row">
            <button type="button" onClick={() => openExternal("https://play.google.com/store")}>Google Play</button>
            <button type="button" onClick={() => openExternal("https://www.apple.com/app-store/")}>App Store</button>
          </div>
        </div>
      </div>

      <div className="ud-footer-bottom">
        <span>© 2026 NoPromptJobs.com. All rights reserved.</span>
        <span><FaShieldHalved /> Secure &amp; Verified Platform</span>
        <span><FaCircleCheck /> AI-Powered Career Platform</span>
        <span>Made with ♥ in India</span>
      </div>
    </footer>
  );
}

export default function PremiumCareerDashboard({ children = null }) {
  const user = safeParseUser();
  const candidateId = user?.candidateId || user?._id || user?.id || "";
  const name = user?.name || user?.fullName || "Candidate";
  const profileImage = user?.profileImageUrl || user?.profileImage || "/profile.png";
  const currentPath = window.location.pathname;

  const [aiQuestion, setAiQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState(EMPTY_DATA);

  const goTo = (path) => {
    window.location.assign(path);
  };

  const isMenuActive = (itemPath) => {
    if (!itemPath) return false;

    const normalizePath = (value) => {
      const normalized = String(value || "").replace(/\/+$/, "");
      return normalized || "/";
    };

    const pagePath = normalizePath(currentPath);
    const menuPath = normalizePath(itemPath);

    if (menuPath === "/ultimate-dashboard") {
      return (
        pagePath === "/ultimate-dashboard" ||
        pagePath.startsWith("/dashboard/")
      );
    }

    return (
      pagePath === menuPath ||
      pagePath.startsWith(`${menuPath}/`)
    );
  };

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const getArray = (result, keys = []) => {
    if (result.status !== "fulfilled") return [];
    const body = result.value?.data;
    for (const key of keys) {
      if (Array.isArray(body?.[key])) return body[key];
    }
    if (Array.isArray(body?.data)) return body.data;
    return Array.isArray(body) ? body : [];
  };

  const getObject = (result, keys = []) => {
    if (result.status !== "fulfilled") return {};
    const body = result.value?.data;
    for (const key of keys) {
      if (body?.[key] && typeof body[key] === "object") return body[key];
    }
    if (body?.data && typeof body.data === "object") return body.data;
    return body && typeof body === "object" ? body : {};
  };

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      if (!candidateId) {
        goTo("/candidate-login");
        return;
      }

      setLoading(true);
      try {
        const headers = authHeaders();
        const responses = await Promise.allSettled([
          axios.get(`${API_URL}/api/candidates/${candidateId}`, { headers }),
          axios.get(`${API_URL}/api/applications/candidate/${candidateId}`, { headers }),
          axios.get(`${API_URL}/api/jobs`, { headers }),
          axios.get(`${API_URL}/api/jobs/hidden`, { headers }),
          axios.get(`${API_URL}/api/jobs/saved/${candidateId}`, { headers }),
          axios.get(`${API_URL}/api/notifications/candidate/${candidateId}`, { headers }),
          axios.get(`${API_URL}/api/auto-apply/candidate/${candidateId}`, { headers }),
          axios.get(`${API_URL}/api/interviews/candidate/${candidateId}`, { headers }),
        ]);

        if (!active) return;

        const [candidateRes, applicationsRes, jobsRes, hiddenJobsRes, savedJobsRes, notificationsRes, autoApplyRes, interviewsRes] = responses;
        const candidate = getObject(candidateRes, ["candidate", "user"]);
        const applications = getArray(applicationsRes, ["applications", "items", "results"]);
        const directInterviews = getArray(interviewsRes, ["interviews", "items", "results"]);
        const interviewApplications = applications.filter((item) => statusOf(item).includes("interview"));

        setData({
          resumeScore: clampScore(candidate.resumeScore || candidate.atsScore),
          jobMatchScore: clampScore(candidate.jobMatchScore || candidate.aiMatchScore),
          trustScore: clampScore(candidate.trustScore || candidate.profileStrength),
          applications,
          jobs: getArray(jobsRes, ["jobs", "items", "results"]),
          hiddenJobs: getArray(hiddenJobsRes, ["jobs", "hiddenJobs", "items", "results"]),
          savedJobs: getArray(savedJobsRes, ["jobs", "savedJobs", "items", "results"]),
          notifications: getArray(notificationsRes, ["notifications", "items", "results"]),
          autoApply: getArray(autoApplyRes, ["applications", "autoApply", "autoApplications", "items", "results"]),
          interviews: directInterviews.length ? directInterviews : interviewApplications,
        });
      } catch (error) {
        console.error("ULTIMATE DASHBOARD ERROR:", error?.response?.data || error.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      active = false;
    };
  }, [candidateId]);

  const jobAlerts = useMemo(
    () => data.notifications.filter((item) => String(item?.type || item?.category || item?.notificationType || "").toLowerCase().includes("job")),
    [data.notifications]
  );

  const applicationCounts = useMemo(() => {
    const applied = data.applications.filter((item) => ["applied", "submitted", "active"].some((value) => statusOf(item).includes(value))).length;
    const interview = data.applications.filter((item) => statusOf(item).includes("interview")).length;
    const review = data.applications.filter((item) => ["review", "screen", "shortlist"].some((value) => statusOf(item).includes(value))).length;
    const rejected = data.applications.filter((item) => statusOf(item).includes("reject")).length;
    const saved = data.savedJobs.length;
    const fallbackApplied = Math.max(0, data.applications.length - interview - review - rejected);
    return { applied: applied || fallbackApplied, interview, review, saved, rejected };
  }, [data.applications, data.savedJobs.length]);

  const stats = [
    { icon: <FaFileLines />, label: "Resume Score", value: `${data.resumeScore}%`, helper: "ATS Optimized", tone: "blue" },
    { icon: <FaUser />, label: "Job Match Score", value: `${data.jobMatchScore}%`, helper: "High Fit Roles", tone: "violet" },
    { icon: <FaShieldHalved />, label: "Trust Score", value: `${data.trustScore}%`, helper: "Verified Profile", tone: "indigo" },
    { icon: <FaBriefcase />, label: "Applications", value: data.applications.length, helper: "Active Applications", tone: "purple" },
    { icon: <FaRocket />, label: "Auto Apply", value: data.autoApply.length, helper: "Applications Sent", tone: "pink" },
  ];

  const tools = [
    { icon: <FaWandMagicSparkles />, title: "Auto Apply Engine", text: "Smart Apply to Jobs", path: "/auto-apply", tone: "orange" },
    { icon: <FaFileLines />, title: "Resume Studio", text: "Build ATS Resume", path: "/resume-studio", tone: "blue" },
    { icon: <TbBrain />, title: "Skill Gap Analyzer", text: "Find Missing Skills", path: "/skill-analyzer", tone: "purple" },
    { icon: <FaMicrophone />, title: "Interview Prep Hub", text: "Practice Interviews", path: "/ai-interview-prep", tone: "violet" },
    { icon: <FaShieldHalved />, title: "Trust Passport", text: "Verify Your Profile", path: "/trust-passport", tone: "indigo" },
    { icon: <FaBell />, title: "Instant Job Alerts", text: "Real-time Alerts", path: "/job-alerts", tone: "yellow" },
  ];

  const menuGroups = [
    {
      title: "OVERVIEW",
      items: [
        {
          icon: <HiOutlineHome />,
          label: "Dashboard",
          path: "/ultimate-dashboard",
        },
      ],
    },
    {
      title: "MAIN",
      items: [
        { icon: <FaBriefcase />, label: "Applications", path: "/applications", count: data.applications.length },
        { icon: <FaRocket />, label: "Auto Apply", path: "/auto-apply", count: data.autoApply.length },
        { icon: <FaShieldHalved />, label: "Trust Score", path: "/trust-passport", count: Math.round(data.trustScore) },
        { icon: <RiRobot2Line />, label: "AI Workspace", path: "/services" },
        { icon: <FaFileLines />, label: "Resume Studio", path: "/resume-studio" },
        { icon: <FaMicrophone />, label: "AI Interview Prep", path: "/ai-interview-prep" },
        { icon: <MdOutlineAutoGraph />, label: "Skill Analyzer", path: "/skill-analyzer" },
        { icon: <FaChartLine />, label: "Salary Predictor", path: "/salary-predictor" },
        { icon: <FaBell />, label: "Job Alerts", path: "/job-alerts", count: jobAlerts.length },
        {
          icon: <span aria-hidden="true">🧭</span>,
          label: "Career Roadmap",
          path: "/career-roadmap",
        },
        { icon: <HiOutlineLightBulb />, label: "Hidden Opportunities", path: "/hidden-opportunities" },
      ],
    },
    {
      title: "ACCOUNT",
      items: [
        { icon: <FaGear />, label: "Settings", path: "/settings" },
        { icon: <FaRightFromBracket />, label: "Logout", action: "logout" },
      ],
    },
  ];

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    goTo("/candidate-login");
  };

  const handleAssistant = () => {
    const question = aiQuestion.trim();
    goTo(question ? `/services?q=${encodeURIComponent(question)}` : "/services");
  };

  return (
    <main className="ud-page">
      {sidebarOpen && <button className="ud-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Close menu" />}

      <aside className={`ud-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="ud-brand">
          <img src="/logo.png" alt="NoPromptJobs" />
        </div>

        <nav className="ud-nav">
          {menuGroups.map((group) => (
            <div className="ud-nav-group" key={group.title}>
              <p>{group.title}</p>
              {group.items.map((item) => (
                <button
                  key={item.label}
                  className={isMenuActive(item.path) ? "active" : ""}
                  onClick={() => {
                    setSidebarOpen(false);
                    if (item.action === "logout") logout();
                    else goTo(item.path);
                  }}
                >
                  <span className="ud-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {typeof item.count === "number" && <b>{item.count}</b>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <button className="ud-sidebar-profile" onClick={() => goTo(`/profile/${candidateId}`)}>
          <span className="ud-avatar ud-avatar-small">{name.charAt(0).toUpperCase()}</span>
          <span>
            <strong>{name}</strong>
            <small>Verified Candidate <FaCircleCheck /></small>
          </span>
          <FaChevronRight />
        </button>
      </aside>

      <section className="ud-main">
        <header className="ud-topbar">
          <button className="ud-menu-button" onClick={() => setSidebarOpen((value) => !value)} aria-label="Open menu">
            <span></span><span></span><span></span>
          </button>

          <label className="ud-search">
            <FaMagnifyingGlass />
            <input placeholder="Search jobs, companies, skills..." />
            <kbd>⌘ K</kbd>
          </label>

        <button
  type="button"
  className="ud-ai-button"
  onClick={() => goTo("/help-center?openChat=true")}
>
  <FaWandMagicSparkles />
  AI Assistant
</button>
          <button className="ud-top-icon" onClick={() => goTo("/notifications")} aria-label="Notifications">
            <FaBell /><b>{jobAlerts.length}</b>
          </button>
          <button className="ud-top-icon" onClick={() => goTo("/interview-alerts")} aria-label="Messages">
            <FaRegMessage /><b>{data.interviews.length}</b>
          </button>

          <button className="ud-user-card" onClick={() => goTo(`/profile/${candidateId}`)}>
            {profileImage ? <img src={profileImage} alt={name} onError={(event) => { event.currentTarget.style.display = "none"; }} /> : null}
            <span className="ud-avatar">{name.charAt(0).toUpperCase()}</span>
            <span className="ud-user-copy">
              <strong>{name}</strong>
              <small>Verified Candidate <FaCircleCheck /></small>
            </span>
            <FaChevronDown />
          </button>
        </header>

        <div className="ud-content">
          {children ? (
            <section className="ud-child-content">{children}</section>
          ) : (
            <>
              <section className="ud-stats-grid">
                {stats.map((item, index) => (
                  <article className="ud-stat-card" key={item.label}>
                    <span className={`ud-stat-icon ${item.tone}`}>{item.icon}</span>
                    <span className="ud-stat-copy">
                      <small>{item.label}</small>
                      <strong>{loading ? "—" : item.value}</strong>
                      <em>{item.helper}</em>
                    </span>
                    <MiniSparkline variant={index} />
                  </article>
                ))}
              </section>

              <section className="ud-dashboard-grid">
                <article className="ud-panel ud-workspace-panel">
                  <div className="ud-panel-head">
                    <div>
                      <h2>Workspace</h2>
                      <p>Powerful tools to supercharge your career</p>
                    </div>
                    <button onClick={() => goTo("/services")}>View All Tools <FaArrowRight /></button>
                  </div>

                  <div className="ud-tool-grid">
                    {tools.map((tool) => (
                      <button className="ud-tool-card" key={tool.title} onClick={() => goTo(tool.path)}>
                        <span className={`ud-tool-icon ${tool.tone}`}>{tool.icon}</span>
                        <span>
                          <strong>{tool.title}</strong>
                          <small>{tool.text}</small>
                        </span>
                        <FaChevronRight />
                      </button>
                    ))}
                  </div>
                </article>

                <div className="ud-right-stack">
                  <article className="ud-panel ud-assistant-panel">
                    <h2>Career Assistant</h2>
                    <p>Ask anything about your career</p>
                    <div className="ud-assistant-input">
                      <input
                        value={aiQuestion}
                        onChange={(event) => setAiQuestion(event.target.value)}
                        onKeyDown={(event) => event.key === "Enter" && handleAssistant()}
                        placeholder="Example: How can I become a Data Engineer in 6 months?"
                      />
                      <button onClick={handleAssistant}><FaArrowRight /></button>
                    </div>
                    <div className="ud-assistant-tags">
                      <button onClick={() => goTo("/resume-studio")}><FaFileLines /> Improve my resume</button>
                      <button onClick={() => goTo("/jobs")}><TbTargetArrow /> Find high paying jobs</button>
                      <button onClick={() => goTo("/ai-interview-prep")}><FaMicrophone /> Interview tips</button>
                      <button onClick={() => goTo("/career-roadmap")}><MdOutlineAutoGraph /> Skill roadmap</button>
                    </div>
                  </article>

                  <div className="ud-insights-grid">
                    <article className="ud-panel ud-overview-panel">
                      <div className="ud-panel-head compact">
                        <h2>Application Overview</h2>
                        <button onClick={() => goTo("/applications")}>View Analytics <FaArrowRight /></button>
                      </div>
                      <div className="ud-donut-layout">
                        <div className="ud-donut" style={{ "--total": Math.max(data.applications.length, 1) }}>
                          <span><strong>{data.applications.length}</strong><small>Total</small></span>
                        </div>
                        <div className="ud-legend">
                          {[
                            ["blue", "Applied", applicationCounts.applied],
                            ["green", "Interview", applicationCounts.interview],
                            ["purple", "Review", applicationCounts.review],
                            ["orange", "Saved", applicationCounts.saved],
                            ["red", "Rejected", applicationCounts.rejected],
                          ].map(([tone, label, value]) => (
                            <p key={label}><i className={tone}></i><span>{label}</span><b>{value}</b></p>
                          ))}
                        </div>
                      </div>
                    </article>

                    <article className="ud-panel ud-upcoming-panel">
                      <div className="ud-panel-head compact">
                        <h2>Upcoming</h2>
                        <button onClick={() => goTo("/interview-alerts")}>View All <FaArrowRight /></button>
                      </div>

                      {data.interviews.length === 0 ? (
                        <div className="ud-empty-state">
                          <span><FaRegCalendarDays /></span>
                          <strong>No upcoming interviews</strong>
                          <small>You&apos;re all caught up!</small>
                        </div>
                      ) : (
                        <div className="ud-interview-list">
                          {data.interviews.slice(0, 2).map((item, index) => (
                            <div key={item?._id || index}>
                              <span><FaRegCalendarDays /></span>
                              <p><strong>{item?.title || item?.round || item?.interviewType || "Interview"}</strong><small>{item?.company || item?.companyName || item?.job?.company || "Company"}</small></p>
                              <em>{formatDate(getDateValue(item))}</em>
                            </div>
                          ))}
                        </div>
                      )}
                      <button className="ud-calendar-button" onClick={() => goTo("/interview-alerts")}><FaCalendarPlus /> Add to Calendar</button>
                    </article>
                  </div>
                </div>
              </section>

              <article className="ud-panel ud-roadmap-panel">
                <div className="ud-panel-head">
                  <div>
                    <h2>Your Roadmap</h2>
                    <p>Personalized steps to achieve your dream career</p>
                  </div>
                  <button onClick={() => goTo("/career-roadmap")}>View Full Roadmap <FaArrowRight /></button>
                </div>

                <div className="ud-roadmap-grid">
                  {[
                    { icon: <FaCheck />, step: "Step 1", title: "Improve Resume Score", status: data.resumeScore >= 80 ? "Completed" : "Pending", tone: "green" },
                    { icon: <FaShieldHalved />, step: "Step 2", title: "Complete Trust Passport", status: data.trustScore >= 80 ? "Completed" : "In Progress", tone: "indigo" },
                    { icon: <MdOutlineWorkOutline />, step: "Step 3", title: "Apply to Match Jobs", status: data.applications.length ? "In Progress" : "Pending", tone: "red" },
                    { icon: <FaUserGroup />, step: "Step 4", title: "Practice Interviews", status: data.interviews.length ? "In Progress" : "Upcoming", tone: "purple" },
                    { icon: <FaStar />, step: "Step 5", title: "Ace Interviews", status: "Upcoming", tone: "yellow" },
                  ].map((item) => (
                    <div className="ud-roadmap-item" key={item.step}>
                      <span className={`ud-roadmap-icon ${item.tone}`}>{item.icon}</span>
                      <span>
                        <small>{item.step}</small>
                        <strong>{item.title}</strong>
                        <em>{item.status}</em>
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            </>
          )}

          <DashboardFooter goTo={goTo} />
        </div>
      </section>
    </main>
  );
}