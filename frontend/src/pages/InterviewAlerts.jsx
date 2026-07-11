import React, { useEffect, useMemo, useState } from "react";
import {
  FiSearch,
  FiBell,
  FiChevronDown,
  FiArrowUpRight,
  FiCalendar,
  FiClock,
  FiVideo,
  FiBriefcase,
  FiFileText,
  FiBookOpen,
  FiMic,
  FiMapPin,
  FiMoreHorizontal,
  FiCheckCircle,
  FiUsers,
  FiTarget,
  FiTrendingUp,
  FiZap,
  FiRefreshCw,
} from "react-icons/fi";

import "./InterviewAlerts.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

/* =========================================================
   DATE HELPERS
========================================================= */

const safeDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
  const date = safeDate(value);

  if (!date) {
    return "Date pending";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatTime = (value) => {
  const date = safeDate(value);

  if (!date) {
    return "Time pending";
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getRoundLabel = (round = "") => {
  const normalized = String(round).toLowerCase();

  if (normalized.includes("hr")) {
    return "HR Round";
  }

  if (normalized.includes("technical")) {
    return "Technical Round";
  }

  if (normalized.includes("manager")) {
    return "Managerial Round";
  }

  if (normalized.includes("screen")) {
    return "Recruiter Screening";
  }

  return round || "Interview";
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const InterviewAlerts = () => {
  /* =======================================================
     APPLICATION PATHS

     Change only these values if your App.jsx uses
     different path names.
  ======================================================= */

  const ROUTES = {
    dashboard: "/ultimate-dashboard",
    jobs: "/jobs",
    companies: "/companies",
    services: "/services",
    notifications: "/notifications",
    interviewPractice: "/ai-interview",
    resumeStudio: "/resume-studio",
    questionBank: "/question-bank",
  };

  /* =======================================================
     IF-PATH NAVIGATION METHOD
  ======================================================= */

  const goTo = (path) => {
    if (!path) {
      return;
    }

    window.location.href = path;
  };

  /* =======================================================
     STATE
  ======================================================= */

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  /* =======================================================
     CANDIDATE INFORMATION
  ======================================================= */

  let savedUser = {};

  try {
    savedUser = JSON.parse(
      localStorage.getItem("user") || "{}"
    );
  } catch (error) {
    console.error("Unable to read saved user:", error);
    savedUser = {};
  }

  const candidateId =
    savedUser?.candidateId ||
    savedUser?._id ||
    savedUser?.id ||
    "";

  const candidateName =
    savedUser?.name ||
    savedUser?.fullName ||
    "VENKATESHA A";

  /* =======================================================
     LOAD INTERVIEW RECORDS
  ======================================================= */

  useEffect(() => {
    let isMounted = true;

    const fetchInterviews = async () => {
      try {
        setLoading(true);

        if (!candidateId) {
          if (isMounted) {
            setInterviews([]);
          }

          return;
        }

        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("authToken") ||
          "";

        const response = await fetch(
          `${API_URL}/api/interviews/candidate/${candidateId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",

              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Interview API returned ${response.status}`
          );
        }

        const result = await response.json();

        const records = Array.isArray(result)
          ? result
          : result?.interviews ||
            result?.data ||
            [];

        if (isMounted) {
          setInterviews(records);
        }
      } catch (error) {
        console.error(
          "Unable to load interviews:",
          error
        );

        if (isMounted) {
          setInterviews([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchInterviews();

    return () => {
      isMounted = false;
    };
  }, [candidateId]);

  /* =======================================================
     INTERVIEW STATISTICS
  ======================================================= */

  const stats = useMemo(() => {
    const now = new Date();

    const scheduled = interviews.filter((item) => {
      const date = safeDate(
        item?.scheduledAt ||
          item?.interviewDate ||
          item?.date
      );

      return date && date >= now;
    }).length;

    const technical = interviews.filter((item) =>
      String(item?.round || item?.type || "")
        .toLowerCase()
        .includes("technical")
    ).length;

    const hr = interviews.filter((item) =>
      String(item?.round || item?.type || "")
        .toLowerCase()
        .includes("hr")
    ).length;

    return {
      total: interviews.length,
      scheduled,
      technical,
      hr,
    };
  }, [interviews]);

  /* =======================================================
     SEARCH AND FILTER
  ======================================================= */

  const filteredInterviews = useMemo(() => {
    return interviews.filter((item) => {
      const company =
        item?.companyName ||
        item?.company ||
        "";

      const role =
        item?.jobTitle ||
        item?.role ||
        "";

      const round = getRoundLabel(
        item?.round ||
          item?.type ||
          ""
      );

      const searchText =
        `${company} ${role} ${round}`.toLowerCase();

      const matchesSearch = searchText.includes(
        search.trim().toLowerCase()
      );

      if (!matchesSearch) {
        return false;
      }

      if (activeFilter === "All") {
        return true;
      }

      return round
        .toLowerCase()
        .includes(activeFilter.toLowerCase());
    });
  }, [interviews, activeFilter, search]);

  /* =======================================================
     HEADER NAVIGATION
  ======================================================= */

  const navItems = [
    {
      label: "Dashboard",
      path: ROUTES.dashboard,
    },
    {
      label: "Jobs",
      path: ROUTES.jobs,
    },
    {
      label: "Companies",
      path: ROUTES.companies,
    },
    {
      label: "Services",
      path: ROUTES.services,
    },
  ];

  /* =======================================================
     STAT CARDS
  ======================================================= */

  const statCards = [
    {
      label: "Total Interviews",
      value: stats.total,
      icon: <FiCalendar />,
      note: "All interview activity",
      accent: "blue",
    },
    {
      label: "Upcoming",
      value: stats.scheduled,
      icon: <FiCheckCircle />,
      note: "Confirmed schedules",
      accent: "green",
    },
    {
      label: "Technical Rounds",
      value: stats.technical,
      icon: <FiTarget />,
      note: "Technical evaluation",
      accent: "violet",
    },
    {
      label: "HR Rounds",
      value: stats.hr,
      icon: <FiUsers />,
      note: "HR conversations",
      accent: "orange",
    },
  ];

  /* =======================================================
     INTERVIEW PREPARATION ACTIONS
  ======================================================= */

  const prepActions = [
    {
      title: "AI Mock Interview",
      text:
        "Practice with role-specific questions and receive instant feedback.",
      icon: <FiMic />,
      path: ROUTES.interviewPractice,
      button: "Start practice",
    },
    {
      title: "Resume Studio",
      text:
        "Improve ATS relevance before your recruiter conversation.",
      icon: <FiFileText />,
      path: ROUTES.resumeStudio,
      button: "Improve resume",
    },
    {
      title: "Question Bank",
      text:
        "Review curated interview questions for your target role.",
      icon: <FiBookOpen />,
      path: ROUTES.questionBank,
      button: "Open library",
    },
  ];

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="ia-page">
      <div className="ia-background-orb ia-orb-one" />
      <div className="ia-background-orb ia-orb-two" />

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="ia-header">
        <button
          type="button"
          className="ia-logo-wrap"
          onClick={() => goTo(ROUTES.dashboard)}
          aria-label="Go to Ultimate Dashboard"
        >
          <img
            src="/logo.png"
            alt="NoPromptJobs"
            className="ia-logo"
          />
        </button>

        <div className="ia-global-search">
          <FiSearch />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search interviews, companies or roles"
            aria-label="Search interviews"
          />

          <span>⌘ K</span>
        </div>

        <nav className="ia-nav">
          {navItems.map((item) => {
            const isActive =
              window.location.pathname === item.path;

            return (
              <button
                type="button"
                key={item.label}
                onClick={() => goTo(item.path)}
                className={isActive ? "active" : ""}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="ia-header-actions">
          <button
            type="button"
            className="ia-icon-button"
            onClick={() =>
              goTo(ROUTES.notifications)
            }
            aria-label="Open notifications"
          >
            <FiBell />
            <span className="ia-notification-dot" />
          </button>

          <button
            type="button"
            className="ia-profile-button"
            aria-label="Candidate profile"
          >
            <span className="ia-profile-avatar">
              {candidateName
                .charAt(0)
                .toUpperCase()}
            </span>

            <span className="ia-profile-copy">
              <small>Candidate</small>
              <strong>{candidateName}</strong>
            </span>

            <FiChevronDown />
          </button>
        </div>
      </header>

      {/* ===================================================
          MAIN CONTENT
      =================================================== */}

      <main className="ia-shell">
        {/* =================================================
            HERO SECTION
        ================================================= */}

        <section className="ia-hero">
          <div className="ia-hero-copy">
            <div className="ia-eyebrow">
              <FiZap />
              Interview Intelligence Center
            </div>

            <h1>
              Stay ready for every opportunity.
            </h1>

            <p>
              Track recruiter calls, technical rounds, HR
              discussions and scheduled interviews from one
              intelligent workspace.
            </p>

            <div className="ia-hero-actions">
              <button
                type="button"
                className="ia-primary-button"
                onClick={() =>
                  goTo(ROUTES.jobs)
                }
              >
                Explore matching jobs
                <FiArrowUpRight />
              </button>

              <button
                type="button"
                className="ia-secondary-button"
                onClick={() =>
                  goTo(ROUTES.interviewPractice)
                }
              >
                <FiVideo />
                Start mock interview
              </button>
            </div>
          </div>

          {/* ===============================================
              UPCOMING INTERVIEW CARD
          =============================================== */}

          <div className="ia-hero-insight">
            <div className="ia-insight-top">
              <span>Upcoming interviews</span>

              <div className="ia-live-pill">
                <span />
                Live status
              </div>
            </div>

            <div className="ia-upcoming-number">
              {stats.scheduled}
            </div>

            <p>
              {stats.scheduled > 0
                ? "You have interviews that need your attention."
                : "Your schedule is currently clear."}
            </p>

            <div className="ia-readiness-row">
              <div>
                <span>
                  Preparation readiness
                </span>

                {stats.scheduled > 0 ? (
                  <strong>72%</strong>
                ) : (
                  <button
                    type="button"
                    className="ia-readiness-button"
                    onClick={() =>
                      goTo(
                        ROUTES.interviewPractice
                      )
                    }
                  >
                    Start now
                  </button>
                )}
              </div>

              <div className="ia-progress-track">
                <span
                  style={{
                    width:
                      stats.scheduled > 0
                        ? "72%"
                        : "18%",
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="ia-stat-grid">
          {statCards.map((card) => (
            <article
              className="ia-stat-card"
              key={card.label}
            >
              <div
                className={`ia-stat-icon ia-${card.accent}`}
              >
                {card.icon}
              </div>

              <div className="ia-stat-value">
                {card.value}
              </div>

              <h3>{card.label}</h3>
              <p>{card.note}</p>

              <FiTrendingUp className="ia-stat-trend" />
            </article>
          ))}
        </section>

        {/* =================================================
            INTERVIEW PIPELINE AND PREPARATION
        ================================================= */}

        <section className="ia-content-grid">
          {/* ===============================================
              INTERVIEW PIPELINE
          =============================================== */}

          <article className="ia-interview-panel">
            <div className="ia-panel-heading">
              <div>
                <span className="ia-section-label">
                  Interview pipeline
                </span>

                <h2>
                  Scheduled interviews
                </h2>

                <p>
                  Manage every conversation from
                  screening to final round.
                </p>
              </div>

              <button
                type="button"
                className="ia-refresh-button"
                onClick={() =>
                  window.location.reload()
                }
              >
                <FiRefreshCw />
                Refresh
              </button>
            </div>

            {/* =============================================
                FILTER TOOLBAR
            ============================================= */}

            <div className="ia-toolbar">
              <div className="ia-filter-tabs">
                {[
                  "All",
                  "Technical",
                  "HR",
                  "Recruiter",
                ].map((filter) => (
                  <button
                    type="button"
                    key={filter}
                    className={
                      activeFilter === filter
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setActiveFilter(filter)
                    }
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="ia-compact-jobs"
                onClick={() =>
                  goTo(ROUTES.jobs)
                }
              >
                Browse jobs
                <FiArrowUpRight />
              </button>
            </div>

            {/* =============================================
                LOADING STATE
            ============================================= */}

            {loading ? (
              <div className="ia-loading-state">
                <div className="ia-loader" />

                <h3>
                  Loading your interview workspace
                </h3>

                <p>
                  Connecting to your latest interview
                  records.
                </p>
              </div>
            ) : filteredInterviews.length === 0 ? (
              /* ===========================================
                 EMPTY STATE
              =========================================== */

              <div className="ia-empty-state">
                <div className="ia-empty-visual">
                  <div className="ia-empty-calendar">
                    <FiCalendar />
                  </div>

                  <span className="ia-empty-badge">
                    All caught up
                  </span>
                </div>

                <h3>
                  No interviews scheduled yet
                </h3>

                <p>
                  When a recruiter schedules an
                  interview, the company, role, date,
                  round and meeting details will appear
                  here automatically.
                </p>

                <div className="ia-empty-actions">
                  <button
                    type="button"
                    className="ia-primary-button"
                    onClick={() =>
                      goTo(ROUTES.jobs)
                    }
                  >
                    Find relevant jobs
                    <FiArrowUpRight />
                  </button>

                  <button
                    type="button"
                    className="ia-text-button"
                    onClick={() =>
                      goTo(
                        ROUTES.interviewPractice
                      )
                    }
                  >
                    Practice while you wait
                  </button>
                </div>
              </div>
            ) : (
              /* ===========================================
                 INTERVIEW LIST
              =========================================== */

              <div className="ia-interview-list">
                {filteredInterviews.map(
                  (item, index) => {
                    const scheduledAt =
                      item?.scheduledAt ||
                      item?.interviewDate ||
                      item?.date ||
                      null;

                    const companyName =
                      item?.companyName ||
                      item?.company ||
                      "Company";

                    const jobTitle =
                      item?.jobTitle ||
                      item?.role ||
                      "Interview";

                    return (
                      <div
                        className="ia-interview-row"
                        key={
                          item?._id ||
                          item?.id ||
                          index
                        }
                      >
                        <div className="ia-company-mark">
                          {companyName
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="ia-interview-main">
                          <span className="ia-round-pill">
                            {getRoundLabel(
                              item?.round ||
                                item?.type
                            )}
                          </span>

                          <h3>{jobTitle}</h3>

                          <p>{companyName}</p>
                        </div>

                        <div className="ia-interview-meta">
                          <span>
                            <FiCalendar />
                            {formatDate(
                              scheduledAt
                            )}
                          </span>

                          <span>
                            <FiClock />
                            {formatTime(
                              scheduledAt
                            )}
                          </span>

                          {item?.location && (
                            <span>
                              <FiMapPin />
                              {item.location}
                            </span>
                          )}
                        </div>

                        <div className="ia-row-actions">
                          <button
                            type="button"
                            className="ia-join-button"
                            onClick={() => {
                              if (
                                !item?.meetingLink
                              ) {
                                return;
                              }

                              window.open(
                                item.meetingLink,
                                "_blank",
                                "noopener,noreferrer"
                              );
                            }}
                            disabled={
                              !item?.meetingLink
                            }
                          >
                            <FiVideo />

                            {item?.meetingLink
                              ? "Join interview"
                              : "Link pending"}
                          </button>

                          <button
                            type="button"
                            className="ia-more-button"
                            aria-label="More interview options"
                          >
                            <FiMoreHorizontal />
                          </button>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </article>

          {/* ===============================================
              INTERVIEW PREPARATION PANEL
          =============================================== */}

          <aside className="ia-prep-panel">
            <div className="ia-prep-header">
              <div className="ia-prep-icon">
                <FiBriefcase />
              </div>

              <span>
                Preparation suite
              </span>

              <h2>
                Interview Prep
              </h2>

              <p>
                Build confidence before your next
                recruiter conversation.
              </p>
            </div>

            {/* =============================================
                CLICKABLE PREPARATION CARDS
            ============================================= */}

            <div className="ia-prep-list">
              {prepActions.map((item) => (
                <button
                  type="button"
                  className="ia-prep-card"
                  key={item.title}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    goTo(item.path);
                  }}
                >
                  <span className="ia-prep-card-icon">
                    {item.icon}
                  </span>

                  <span className="ia-prep-card-copy">
                    <strong>
                      {item.title}
                    </strong>

                    <small>
                      {item.text}
                    </small>

                    <b>
                      {item.button}
                    </b>
                  </span>

                  <FiArrowUpRight />
                </button>
              ))}
            </div>

            <div className="ia-pro-tip">
              <span>Pro tip</span>

              <p>
                Complete one mock interview before every
                scheduled round to improve confidence and
                answer structure.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default InterviewAlerts;