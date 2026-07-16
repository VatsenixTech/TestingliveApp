import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaBell,
  FaBookmark,
  FaBriefcase,
  FaBuilding,
  FaCheck,
  FaChevronDown,
  FaClock,
  FaEllipsisVertical,
  FaIndianRupeeSign,
  FaLocationDot,
  FaMagnifyingGlass,
  FaRotate,
  FaStar,
  FaTrash,
  FaXmark,
} from "react-icons/fa6";

import "./JobAlertsPage.css";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


/* =========================================================
   HELPERS
========================================================= */

function getSavedUser() {
  try {
    return JSON.parse(
      localStorage.getItem(
        "user"
      ) || "{}"
    );
  } catch {
    return {};
  }
}


function formatNumber(value) {
  const number =
    Number(value || 0);

  return Number.isFinite(
    number
  )
    ? number.toLocaleString(
        "en-IN"
      )
    : "0";
}


function formatSalary(value) {
  const number =
    Number(value || 0);

  if (number <= 0) {
    return "Not disclosed";
  }

  return `₹${(
    number /
    100000
  ).toFixed(1)} LPA`;
}


function formatSalaryRange(
  minimum,
  maximum
) {
  const min =
    Number(minimum || 0);

  const max =
    Number(maximum || 0);

  if (
    min <= 0 &&
    max <= 0
  ) {
    return "Not disclosed";
  }

  if (
    min > 0 &&
    max > 0
  ) {
    return `${formatSalary(
      min
    )} – ${formatSalary(
      max
    )}`;
  }

  return formatSalary(
    max || min
  );
}


function timeAgo(value) {
  if (!value) {
    return "";
  }

  const timestamp =
    new Date(value)
      .getTime();

  if (
    Number.isNaN(
      timestamp
    )
  ) {
    return "";
  }

  const seconds =
    Math.floor(
      (
        Date.now() -
        timestamp
      ) /
      1000
    );

  if (seconds < 60) {
    return "Just now";
  }

  const minutes =
    Math.floor(
      seconds / 60
    );

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (hours < 24) {
    return `${hours} hours ago`;
  }

  const days =
    Math.floor(
      hours / 24
    );

  return `${days} days ago`;
}


function daysUntil(value) {
  if (!value) {
    return null;
  }

  const milliseconds =
    new Date(value) -
    new Date();

  return Math.ceil(
    milliseconds /
    86400000
  );
}


function getAlertLabel(type) {
  const labels = {
    job_match:
      "New Match",

    high_match:
      "High Match",

    closing_soon:
      "Urgent",

    salary_upgrade:
      "Salary Upgrade",

    recruiter_activity:
      "Recruiter Activity",

    interview_alert:
      "Interview Alert",

    ai_recommended:
      "AI Recommended",
  };

  return (
    labels[type] ||
    "Job Alert"
  );
}


/* =========================================================
   PAGE
========================================================= */

export default function JobAlertsPage() {
  const savedUser =
    useMemo(
      () => getSavedUser(),
      []
    );

  const candidateId =
    savedUser?.candidateId ||
    savedUser?._id ||
    savedUser?.id ||
    "";

  const [
    dashboard,
    setDashboard,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    activeType,
    setActiveType,
  ] = useState("all");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    location,
    setLocation,
  ] = useState("");

  const [
    sort,
    setSort,
  ] = useState("newest");


  const request =
    useCallback(
      async (
        endpoint,
        options = {}
      ) => {
        const token =
          localStorage.getItem(
            "token"
          );

        const response =
          await fetch(
            `${API_URL}${endpoint}`,
            {
              ...options,

              headers: {
                "Content-Type":
                  "application/json",

                ...(token
                  ? {
                      Authorization:
                        `Bearer ${token}`,
                    }
                  : {}),

                ...(options.headers ||
                  {}),
              },
            }
          );

        let result = {};

        try {
          result =
            await response.json();
        } catch {
          result = {};
        }

        if (!response.ok) {
          throw new Error(
            result?.message ||
            `Request failed: ${response.status}`
          );
        }

        return result;
      },
      []
    );


  const loadAlerts =
    useCallback(async () => {
      if (!candidateId) {
        setError(
          "Candidate ID was not found. Please login again."
        );

        setLoading(false);

        return;
      }

      setError("");

      try {
        const query =
          new URLSearchParams({
            type:
              activeType,

            sort,

            limit: "50",
          });

        if (search.trim()) {
          query.set(
            "search",
            search.trim()
          );
        }

        if (location.trim()) {
          query.set(
            "location",
            location.trim()
          );
        }

        const result =
          await request(
            `/api/job-alerts/candidate/${candidateId}?${query.toString()}`
          );

        setDashboard(
          result
        );
      } catch (
        requestError
      ) {
        console.error(
          requestError
        );

        setError(
          requestError.message ||
          "Unable to load job alerts."
        );
      } finally {
        setLoading(false);
      }
    }, [
      activeType,
      candidateId,
      location,
      request,
      search,
      sort,
    ]);


  useEffect(() => {
    const timeout =
      setTimeout(
        loadAlerts,
        250
      );

    return () =>
      clearTimeout(
        timeout
      );
  }, [loadAlerts]);


  async function refreshAlerts() {
    if (!candidateId) {
      return;
    }

    setRefreshing(true);
    setError("");
    setSuccess("");

    try {
      const result =
        await request(
          `/api/job-alerts/generate/${candidateId}`,
          {
            method: "POST",
          }
        );

      setSuccess(
        `${result?.result?.jobsAnalyzed || 0} active jobs analyzed. ${result?.result?.created || 0} new alerts created.`
      );

      await loadAlerts();
    } catch (
      requestError
    ) {
      setError(
        requestError.message
      );
    } finally {
      setRefreshing(false);
    }
  }


  async function updateAlert(
    alertId,
    action
  ) {
    try {
      await request(
        `/api/job-alerts/${alertId}/${action}`,
        {
          method: "PATCH",
        }
      );

      await loadAlerts();
    } catch (
      requestError
    ) {
      setError(
        requestError.message
      );
    }
  }


  function openJob(alert) {
    updateAlert(
      alert._id,
      "read"
    );

    window.location.href =
      `/job-details/${alert.job._id}`;
  }


  const alerts =
    Array.isArray(
      dashboard?.alerts
    )
      ? dashboard.alerts
      : [];

  const summary =
    dashboard?.summary ||
    {};

  const counts =
    dashboard?.filterCounts ||
    {};


  return (
    <div className="ja-page">
      {/* HEADER */}

      <section className="ja-header">
        <div>
          <span className="ja-eyebrow">
            LIVE OPPORTUNITY INTELLIGENCE
          </span>

          <h1>
            <FaBell />

            Job Alerts
          </h1>

          <p>
            Real-time job matches,
            recruiter updates and
            AI-powered opportunities
            calculated from your
            verified profile.
          </p>
        </div>

        <button
          type="button"
          className="ja-manage-button"
          onClick={() => {
            window.location.href =
              "/candidate-settings";
          }}
        >
          Manage Alert Preferences
        </button>
      </section>


      {error && (
        <div className="ja-feedback ja-feedback-error">
          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            <FaXmark />
          </button>
        </div>
      )}


      {success && (
        <div className="ja-feedback ja-feedback-success">
          <FaCheck />

          <span>
            {success}
          </span>

          <button
            type="button"
            onClick={() =>
              setSuccess("")
            }
          >
            <FaXmark />
          </button>
        </div>
      )}


      {/* METRICS */}

      <section className="ja-stats-grid">
        <StatCard
          icon={<FaBell />}
          title="New Alerts Today"
          value={formatNumber(
            summary.newAlertsToday
          )}
          caption="Created today"
        />

        <StatCard
          icon={<FaStar />}
          title="High Match Jobs"
          value={formatNumber(
            summary.highMatchJobs
          )}
          caption="90%+ match"
        />

        <StatCard
          icon={<FaClock />}
          title="Urgent Jobs"
          value={formatNumber(
            summary.urgentJobs
          )}
          caption="Closing soon"
        />

        <StatCard
          icon={
            <FaIndianRupeeSign />
          }
          title="Salary Upgrade"
          value={
            summary.salaryUpgrade > 0
              ? `+${summary.salaryUpgrade}%`
              : "—"
          }
          caption="Best available increase"
        />

        <StatCard
          icon={<FaBuilding />}
          title="Companies Hiring"
          value={formatNumber(
            summary.companiesHiring
          )}
          caption="Distinct employers"
        />

        <StatCard
          icon={<FaBriefcase />}
          title="AI Recommended"
          value={formatNumber(
            summary.aiRecommended
          )}
          caption="Based on your profile"
        />
      </section>


      <section className="ja-dashboard-layout">
        <div className="ja-main-panel">
          {/* TABS */}

          <div className="ja-tabs">
            {[
              [
                "all",
                "All Alerts",
              ],

              [
                "high_match",
                "High Match",
              ],

              [
                "closing_soon",
                "Closing Soon",
              ],

              [
                "salary_upgrade",
                "Salary Upgrade",
              ],

              [
                "recruiter_activity",
                "Recruiter Activity",
              ],

              [
                "interview_alert",
                "Interview Alerts",
              ],

              [
                "saved",
                "Saved",
              ],
            ].map(
              ([
                value,
                label,
              ]) => (
                <button
                  type="button"
                  key={value}
                  className={
                    activeType ===
                    value
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setActiveType(
                      value
                    )
                  }
                >
                  {label}

                  <span>
                    {counts[
                      value
                    ] || 0}
                  </span>
                </button>
              )
            )}
          </div>


          {/* FILTER BAR */}

          <div className="ja-filter-bar">
            <label className="ja-search-box">
              <FaMagnifyingGlass />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search alerts by job title, company, skills..."
              />
            </label>

            <label className="ja-select-box">
              <select
                value={location}
                onChange={(event) =>
                  setLocation(
                    event.target
                      .value
                  )
                }
              >
                <option value="">
                  All Locations
                </option>

                <option value="Bangalore">
                  Bangalore
                </option>

                <option value="Hyderabad">
                  Hyderabad
                </option>

                <option value="Pune">
                  Pune
                </option>

                <option value="Chennai">
                  Chennai
                </option>

                <option value="Mumbai">
                  Mumbai
                </option>

                <option value="Remote">
                  Remote
                </option>
              </select>

              <FaChevronDown />
            </label>

            <label className="ja-select-box">
              <select
                value={sort}
                onChange={(event) =>
                  setSort(
                    event.target
                      .value
                  )
                }
              >
                <option value="newest">
                  Sort: Newest
                </option>

                <option value="highest_match">
                  Highest Match
                </option>

                <option value="highest_salary">
                  Highest Salary
                </option>
              </select>

              <FaChevronDown />
            </label>

            <button
              type="button"
              className="ja-refresh-button"
              onClick={
                refreshAlerts
              }
              disabled={
                refreshing
              }
            >
              <FaRotate
                className={
                  refreshing
                    ? "ja-spinning"
                    : ""
                }
              />

              {refreshing
                ? "Analyzing"
                : "Refresh"}
            </button>
          </div>


          {/* ALERTS */}

          {loading ? (
            <div className="ja-empty-state">
              <span className="ja-loader" />

              <h2>
                Loading your job
                alerts
              </h2>
            </div>
          ) : alerts.length ===
            0 ? (
            <div className="ja-empty-state">
              <div>
                <FaBell />
              </div>

              <h2>
                No matching alerts
                found
              </h2>

              <p>
                Analyze active jobs
                against your verified
                profile to create real
                recommendations.
              </p>

              <button
                type="button"
                onClick={
                  refreshAlerts
                }
                disabled={
                  refreshing
                }
              >
                <FaRotate />

                Analyze Current Jobs
              </button>
            </div>
          ) : (
            <div className="ja-alert-list">
              {alerts.map(
                (alert) => (
                  <article
                    key={
                      alert._id
                    }
                    className={
                      alert.isRead
                        ? "ja-alert-card"
                        : "ja-alert-card unread"
                    }
                  >
                    <span className="ja-unread-dot" />

                    <CompanyLogo
                      job={
                        alert.job
                      }
                    />

                    <div className="ja-alert-information">
                      <span
                        className={`ja-alert-badge ${alert.type}`}
                      >
                        {getAlertLabel(
                          alert.type
                        )}
                      </span>

                      <h3>
                        {alert.job
                          .companyName ||
                          "Company"}
                      </h3>

                      <h2>
                        {alert.job
                          .title ||
                          "Job opportunity"}
                      </h2>

                      <p>
                        <FaLocationDot />

                        {alert.job
                          .location ||
                          "Location not provided"}

                        <span>•</span>

                        {alert.job
                          .employmentType ||
                          "Employment type not provided"}
                      </p>

                      <div className="ja-skill-tags">
                        {alert
                          .matchedSkills
                          .slice(
                            0,
                            5
                          )
                          .map(
                            (
                              skill
                            ) => (
                              <span
                                key={
                                  skill
                                }
                              >
                                {skill}
                              </span>
                            )
                          )}

                        {alert
                          .matchedSkills
                          .length >
                          5 && (
                          <span>
                            +
                            {alert
                              .matchedSkills
                              .length -
                              5}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="ja-match-column">
                      <div
                        className="ja-match-ring"
                        style={{
                          "--match":
                            `${alert.matchScore}%`,
                        }}
                      >
                        <span>
                          {
                            alert.matchScore
                          }
                          %
                        </span>
                      </div>

                      <small>
                        Match
                      </small>
                    </div>

                    <div className="ja-salary-column">
                      <strong>
                        {formatSalaryRange(
                          alert.job
                            .salaryMin,

                          alert.job
                            .salaryMax
                        )}
                      </strong>

                      <span>
                        Est. salary
                      </span>

                      {daysUntil(
                        alert.job
                          .closingDate
                      ) !==
                        null &&
                        daysUntil(
                          alert.job
                            .closingDate
                        ) <=
                          3 && (
                          <em>
                            Closes in{" "}
                            {Math.max(
                              daysUntil(
                                alert.job
                                  .closingDate
                              ),
                              0
                            )}{" "}
                            days
                          </em>
                        )}

                      <small>
                        {timeAgo(
                          alert.createdAt
                        )}
                      </small>
                    </div>

                    <button
                      type="button"
                      className={
                        alert.isSaved
                          ? "ja-save-button saved"
                          : "ja-save-button"
                      }
                      onClick={() =>
                        updateAlert(
                          alert._id,
                          "save"
                        )
                      }
                    >
                      <FaBookmark />
                    </button>

                    <button
                      type="button"
                      className="ja-more-button"
                      onClick={() =>
                        updateAlert(
                          alert._id,
                          "dismiss"
                        )
                      }
                      title="Dismiss alert"
                    >
                      <FaTrash />
                    </button>

                    <button
                      type="button"
                      className="ja-view-button"
                      onClick={() =>
                        openJob(alert)
                      }
                    >
                      View Job
                    </button>
                  </article>
                )
              )}
            </div>
          )}
        </div>


        {/* RIGHT PANEL */}

        <aside className="ja-right-panel">
          <section className="ja-side-card">
            <header>
              <h2>
                Alert Filters
              </h2>

              <button
                type="button"
                onClick={() =>
                  setActiveType(
                    "all"
                  )
                }
              >
                Clear All
              </button>
            </header>

            {[
              [
                "all",
                "All Alerts",
              ],

              [
                "high_match",
                "High Match",
              ],

              [
                "closing_soon",
                "Closing Soon",
              ],

              [
                "salary_upgrade",
                "Salary Upgrade",
              ],

              [
                "recruiter_activity",
                "Recruiter Activity",
              ],

              [
                "interview_alert",
                "Interview Alerts",
              ],

              [
                "saved",
                "Saved Alerts",
              ],
            ].map(
              ([
                value,
                label,
              ]) => (
                <button
                  type="button"
                  key={value}
                  className={
                    activeType ===
                    value
                      ? "ja-filter-option active"
                      : "ja-filter-option"
                  }
                  onClick={() =>
                    setActiveType(
                      value
                    )
                  }
                >
                  <span>
                    {label}
                  </span>

                  <strong>
                    {counts[
                      value
                    ] || 0}
                  </strong>
                </button>
              )
            )}
          </section>


          <section className="ja-side-card">
            <header>
              <h2>
                Real Insights
              </h2>
            </header>

            <div className="ja-insight-grid">
              <Insight
                label="Total Alerts"
                value={
                  summary
                    .totalAlerts ||
                  0
                }
              />

              <Insight
                label="High Match"
                value={
                  summary
                    .highMatchJobs ||
                  0
                }
              />

              <Insight
                label="Companies"
                value={
                  summary
                    .companiesHiring ||
                  0
                }
              />

              <Insight
                label="Saved"
                value={
                  summary
                    .savedAlerts ||
                  0
                }
              />
            </div>
          </section>


          <section className="ja-side-card">
            <header>
              <h2>
                Notification Channels
              </h2>
            </header>

            <Channel
              label="Email"
              active={
                dashboard
                  ?.notificationChannels
                  ?.email
              }
            />

            <Channel
              label="Push Notifications"
              active={
                dashboard
                  ?.notificationChannels
                  ?.push
              }
            />

            <Channel
              label="SMS Alerts"
              active={
                dashboard
                  ?.notificationChannels
                  ?.sms
              }
            />

            <Channel
              label="WhatsApp"
              active={
                dashboard
                  ?.notificationChannels
                  ?.whatsapp
              }
            />
          </section>
        </aside>
      </section>
    </div>
  );
}


/* =========================================================
   CHILD COMPONENTS
========================================================= */

function StatCard({
  icon,
  title,
  value,
  caption,
}) {
  return (
    <article className="ja-stat-card">
      <div>
        {icon}
      </div>

      <span>
        {title}
      </span>

      <strong>
        {value}
      </strong>

      <small>
        {caption}
      </small>
    </article>
  );
}


function CompanyLogo({
  job,
}) {
  const name =
    job?.companyName ||
    "Company";

  if (job?.companyLogo) {
    return (
      <div className="ja-company-logo">
        <img
          src={
            job.companyLogo
          }
          alt={name}
        />
      </div>
    );
  }

  return (
    <div className="ja-company-logo ja-company-initial">
      {name
        .charAt(0)
        .toUpperCase()}
    </div>
  );
}


function Insight({
  label,
  value,
}) {
  return (
    <div className="ja-insight">
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}


function Channel({
  label,
  active,
}) {
  return (
    <div className="ja-channel">
      <span>
        {label}
      </span>

      <strong
        className={
          active
            ? "active"
            : "inactive"
        }
      >
        {active
          ? "Active"
          : "Inactive"}
      </strong>
    </div>
  );
}