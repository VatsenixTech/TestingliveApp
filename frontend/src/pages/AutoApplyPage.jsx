import React, { useEffect, useMemo, useState } from "react";
import "./AutoApplyPage.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

function normalizeApplications(data) {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.applications)) {
    return data.applications;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function normalizeJobs(data) {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.jobs)) {
    return data.jobs;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function getStatus(application) {
  return String(
    application?.status ||
      application?.applicationStatus ||
      application?.stage ||
      "applied"
  )
    .trim()
    .toLowerCase();
}

function AutoApplyPage() {
  const user = getStoredUser();

  const candidateId =
    user?.candidateId ||
    user?._id ||
    user?.id ||
    "";

  const candidateName =
    user?.name ||
    user?.fullName ||
    user?.firstName ||
    "Candidate";

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    "";

  const [applications, setApplications] = useState([]);
  const [matchedJobs, setMatchedJobs] = useState([]);

  const [engineEnabled, setEngineEnabled] = useState(false);

  const [dailyLimit, setDailyLimit] = useState(() => {
    return Number(localStorage.getItem("autoApplyDailyLimit")) || 25;
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingEngine, setSavingEngine] = useState(false);
  const [error, setError] = useState("");

  const authHeaders = useMemo(() => {
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }, [token]);

  const loadApplications = async () => {
    if (!candidateId) {
      setApplications([]);
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/api/applications/candidate/${candidateId}`,
      {
        headers: authHeaders,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Applications API returned ${response.status}`
      );
    }

    const data = await response.json();

    setApplications(normalizeApplications(data));
  };

  const loadMatchedJobs = async () => {
    if (!candidateId) {
      setMatchedJobs([]);
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/api/jobs/recommended/${candidateId}`,
      {
        headers: authHeaders,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Recommended Jobs API returned ${response.status}`
      );
    }

    const data = await response.json();

    setMatchedJobs(normalizeJobs(data));
  };

  const loadEngineStatus = async () => {
    if (!candidateId) {
      setEngineEnabled(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auto-apply/status/${candidateId}`,
        {
          headers: authHeaders,
        }
      );

      if (!response.ok) return;

      const data = await response.json();

      setEngineEnabled(
        Boolean(
          data?.enabled ??
            data?.isEnabled ??
            data?.active ??
            false
        )
      );

      const backendLimit =
        data?.dailyLimit ??
        data?.settings?.dailyLimit;

      if (backendLimit !== undefined) {
        setDailyLimit(Number(backendLimit));
      }
    } catch (requestError) {
      console.error("Engine status error:", requestError);
    }
  };

  const loadDashboardData = async (showRefreshState = false) => {
    try {
      setError("");

      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const results = await Promise.allSettled([
        loadApplications(),
        loadMatchedJobs(),
        loadEngineStatus(),
      ]);

      const failedRequests = results.filter(
        (result) => result.status === "rejected"
      );

      if (failedRequests.length > 0) {
        console.error(
          "Auto Apply dashboard request errors:",
          failedRequests
        );

        setError(
          "Some dashboard information could not be loaded. Check your backend routes and try Refresh."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [candidateId]);

  const stats = useMemo(() => {
    const total = applications.length;

    const applied = applications.filter((item) =>
      ["applied", "submitted"].includes(getStatus(item))
    ).length;

    const queued = applications.filter((item) =>
      ["queued", "in queue", "pending"].includes(getStatus(item))
    ).length;

    const interview = applications.filter((item) =>
      ["interview", "interviewing", "interview scheduled"].includes(
        getStatus(item)
      )
    ).length;

    const offered = applications.filter((item) =>
      ["offer", "offered", "hired"].includes(getStatus(item))
    ).length;

    const rejected = applications.filter((item) =>
      ["rejected", "declined"].includes(getStatus(item))
    ).length;

    const successful = interview + offered;

    const successRate =
      total > 0
        ? Math.round((successful / total) * 100)
        : 0;

    return {
      total,
      applied,
      queued,
      interview,
      offered,
      rejected,
      successRate,
    };
  }, [applications]);

  const todayApplications = useMemo(() => {
    const today = new Date().toDateString();

    return applications.filter((application) => {
      const dateValue =
        application?.appliedAt ||
        application?.createdAt ||
        application?.updatedAt;

      if (!dateValue) return false;

      const applicationDate = new Date(dateValue);

      if (Number.isNaN(applicationDate.getTime())) {
        return false;
      }

      return applicationDate.toDateString() === today;
    }).length;
  }, [applications]);

  const remainingDailyApplications = Math.max(
    dailyLimit - todayApplications,
    0
  );

  const progress =
    dailyLimit > 0
      ? Math.min(
          Math.round(
            (todayApplications / dailyLimit) * 100
          ),
          100
        )
      : 0;

  const toggleEngine = async () => {
    if (!candidateId) {
      setError(
        "Candidate ID is missing. Please log in again."
      );

      return;
    }

    const nextValue = !engineEnabled;

    try {
      setSavingEngine(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/auto-apply/status`,
        {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify({
            candidateId,
            enabled: nextValue,
            dailyLimit,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Auto Apply API returned ${response.status}`
        );
      }

      setEngineEnabled(nextValue);
    } catch (requestError) {
      console.error(requestError);

      setError(
        "Unable to update Auto Apply Engine. Check the backend API."
      );
    } finally {
      setSavingEngine(false);
    }
  };

  const saveDailyLimit = async (newLimit) => {
    const safeLimit = Math.max(
      1,
      Math.min(Number(newLimit) || 1, 100)
    );

    setDailyLimit(safeLimit);

    localStorage.setItem(
      "autoApplyDailyLimit",
      String(safeLimit)
    );

    if (!candidateId) return;

    try {
      await fetch(
        `${API_BASE_URL}/api/auto-apply/settings`,
        {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify({
            candidateId,
            dailyLimit: safeLimit,
          }),
        }
      );
    } catch (requestError) {
      console.error(
        "Daily limit update error:",
        requestError
      );
    }
  };

  const goTo = (path) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const recentApplications = useMemo(() => {
    return [...applications]
      .sort((first, second) => {
        const firstDate = new Date(
          first?.updatedAt ||
            first?.createdAt ||
            first?.appliedAt ||
            0
        ).getTime();

        const secondDate = new Date(
          second?.updatedAt ||
            second?.createdAt ||
            second?.appliedAt ||
            0
        ).getTime();

        return secondDate - firstDate;
      })
      .slice(0, 5);
  }, [applications]);

  if (loading) {
    return (
      <section className="aae-page">
        <div className="aae-loading">
          <span className="aae-spinner" />

          <h2>Loading Auto Apply Engine</h2>

          <p>Connecting to your live application data...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="aae-page">

      {error && (
        <div className="aae-error">
          <span>!</span>

          <p>{error}</p>

          <button
            type="button"
            onClick={() => loadDashboardData(true)}
          >
            Retry
          </button>
        </div>
      )}

      <section className="aae-hero">

        <div className="aae-hero-copy">

          <p className="aae-eyebrow">
            AUTO APPLY INTELLIGENCE
          </p>

          <h1>
            Your Auto Apply Engine
            <br />
            is ready to work for you.
          </h1>

          <p className="aae-description">
            Track applications, control automation and review
            matching opportunities from one premium workspace.
          </p>

          <div className="aae-hero-actions">

            <button
              type="button"
              className="aae-primary-button"
              onClick={() => goTo("/applications")}
            >
              View All Applications
              <span>→</span>
            </button>

            <button
              type="button"
              className="aae-secondary-button"
              onClick={() => goTo("/settings")}
            >
              Engine Settings
            </button>

          </div>

        </div>

        <article className="aae-engine-card">

          <div className="aae-engine-card-top">

            <div>

              <p className="aae-card-label">
                ENGINE STATUS
              </p>

              <h2>
                {engineEnabled
                  ? "Active & Running"
                  : "Engine Paused"}
              </h2>

              <p>
                {engineEnabled
                  ? "Your automated application workflow is enabled."
                  : "Turn on the engine when you are ready to automate applications."}
              </p>

            </div>

            <span
              className={`aae-live-indicator ${
                engineEnabled ? "active" : ""
              }`}
            >
              <i />

              {engineEnabled ? "LIVE" : "PAUSED"}
            </span>

          </div>

          <div className="aae-engine-visual">

            <div className="aae-rocket">
              🚀
            </div>

            <button
              type="button"
              className={`aae-switch ${
                engineEnabled ? "enabled" : ""
              }`}
              onClick={toggleEngine}
              disabled={savingEngine}
            >
              <span />

              {savingEngine
                ? "SAVING"
                : engineEnabled
                ? "ON"
                : "OFF"}
            </button>

          </div>

          <div className="aae-progress-row">

            <div className="aae-progress">

              <span
                style={{
                  width: `${progress}%`,
                }}
              />

            </div>

            <strong>
              {todayApplications}/{dailyLimit}
            </strong>

          </div>

          <p className="aae-engine-footer">
            {remainingDailyApplications} applications remaining
            today
          </p>

        </article>

      </section>

      <section className="aae-metrics">

        <MetricCard
          icon="➤"
          title="Applications Sent"
          value={stats.total}
          helper="Live backend records"
          tone="green"
        />

        <MetricCard
          icon="◷"
          title="In Queue"
          value={stats.queued}
          helper="Waiting for processing"
          tone="blue"
        />

        <MetricCard
          icon="↗"
          title="Success Rate"
          value={`${stats.successRate}%`}
          helper="Interview and offer progress"
          tone="purple"
        />

        <MetricCard
          icon="◎"
          title="Daily Limit"
          value={dailyLimit}
          helper={`${remainingDailyApplications} remaining`}
          tone="orange"
        />

        <MetricCard
          icon="♢"
          title="Matched Jobs"
          value={matchedJobs.length}
          helper="Live recommendations"
          tone="teal"
        />

      </section>

      <section className="aae-dashboard-grid">

        <article className="aae-panel aae-performance-panel">

          <div className="aae-panel-heading">

            <div>
              <h2>Auto Apply Performance</h2>

              <p>
                Application activity from your live records
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadDashboardData(true)}
              disabled={refreshing}
              className="aae-small-button"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

          </div>

          <div className="aae-chart">

            <div className="aae-chart-lines">

              <span />

              <span />

              <span />

              <span />

            </div>

            <div className="aae-bars">

              {[
                stats.applied,
                stats.queued,
                stats.interview,
                stats.offered,
                stats.rejected,
                stats.total,
                todayApplications,
              ].map((value, index) => {

                const maximum = Math.max(
                  stats.total,
                  1
                );

                const height = Math.max(
                  14,
                  Math.round(
                    (value / maximum) * 150
                  )
                );

                return (
                  <div
                    className="aae-bar-column"
                    key={index}
                  >
                    <div
                      className="aae-bar"
                      style={{
                        height: `${height}px`,
                      }}
                    />

                    <span>
                      {index + 1}
                    </span>
                  </div>
                );
              })}

            </div>

          </div>

        </article>

        <article className="aae-panel">

          <div className="aae-panel-heading">

            <div>
              <h2>Top Matched Jobs</h2>

              <p>
                Recommended opportunities for your profile
              </p>
            </div>

            <button
              type="button"
              className="aae-text-button"
              onClick={() => goTo("/jobs")}
            >
              View All
            </button>

          </div>

          <div className="aae-job-list">

            {matchedJobs.length === 0 ? (

              <EmptyState
                icon="⌕"
                title="No recommendations yet"
                description="Matching jobs will appear here when your backend returns recommendations."
                buttonLabel="Browse Jobs"
                onClick={() => goTo("/jobs")}
              />

            ) : (

              matchedJobs.slice(0, 4).map((job) => (

                <button
                  type="button"
                  className="aae-job-item"
                  key={job?._id || job?.id}
                  onClick={() =>
                    goTo(
                      `/jobs/${job?._id || job?.id}`
                    )
                  }
                >

                  <div className="aae-company-logo">

                    {String(
                      job?.company?.name ||
                        job?.company ||
                        "J"
                    )
                      .charAt(0)
                      .toUpperCase()}

                  </div>

                  <div className="aae-job-info">

                    <strong>
                      {job?.title ||
                        job?.jobTitle ||
                        "Job Opportunity"}
                    </strong>

                    <span>
                      {job?.company?.name ||
                        job?.company ||
                        "Company"}
                    </span>

                  </div>

                  <span className="aae-match-badge">
                    {job?.matchScore
                      ? `${job.matchScore}% Match`
                      : "Recommended"}
                  </span>

                  <span className="aae-arrow">
                    →
                  </span>

                </button>

              ))

            )}

          </div>

        </article>

        <article className="aae-panel">

          <div className="aae-panel-heading">

            <div>
              <h2>Recent Activity</h2>

              <p>
                Latest changes in your application pipeline
              </p>
            </div>

          </div>

          <div className="aae-activity-list">

            {recentApplications.length === 0 ? (

              <EmptyState
                icon="✓"
                title="No recent activity"
                description="Your application activity will appear here automatically."
                buttonLabel="Explore Jobs"
                onClick={() => goTo("/jobs")}
              />

            ) : (

              recentApplications.map((application) => (

                <div
                  className="aae-activity-item"
                  key={
                    application?._id ||
                    application?.id
                  }
                >

                  <span className="aae-activity-icon">
                    ✓
                  </span>

                  <div>

                    <strong>
                      {application?.job?.title ||
                        application?.jobTitle ||
                        "Application updated"}
                    </strong>

                    <p>
                      {application?.company?.name ||
                        application?.company ||
                        getStatus(application)}
                    </p>

                  </div>

                </div>

              ))

            )}

          </div>

        </article>

      </section>

      <section className="aae-bottom-grid">

        <article className="aae-panel">

          <div className="aae-panel-heading">

            <div>
              <h2>Application Status</h2>

              <p>
                Distribution of your live application records
              </p>
            </div>

          </div>

          <div className="aae-status-content">

            <div
              className="aae-donut"
              style={{
                background:
                  stats.total > 0
                    ? `conic-gradient(
                        #22c55e 0 ${
                          (stats.applied / stats.total) *
                          100
                        }%,
                        #3b82f6 ${
                          (stats.applied / stats.total) *
                          100
                        }% ${
                          ((stats.applied +
                            stats.queued) /
                            stats.total) *
                          100
                        }%,
                        #7c3aed ${
                          ((stats.applied +
                            stats.queued) /
                            stats.total) *
                          100
                        }% ${
                          ((stats.applied +
                            stats.queued +
                            stats.interview) /
                            stats.total) *
                          100
                        }%,
                        #f59e0b ${
                          ((stats.applied +
                            stats.queued +
                            stats.interview) /
                            stats.total) *
                          100
                        }% ${
                          ((stats.applied +
                            stats.queued +
                            stats.interview +
                            stats.offered) /
                            stats.total) *
                          100
                        }%,
                        #ef4444 0 100%
                      )`
                    : "#edf1fb",
              }}
            >

              <div>

                <strong>{stats.total}</strong>

                <span>Total</span>

              </div>

            </div>

            <div className="aae-status-list">

              <StatusRow
                color="green"
                label="Applied"
                value={stats.applied}
              />

              <StatusRow
                color="blue"
                label="In Queue"
                value={stats.queued}
              />

              <StatusRow
                color="purple"
                label="Interview"
                value={stats.interview}
              />

              <StatusRow
                color="orange"
                label="Offered"
                value={stats.offered}
              />

              <StatusRow
                color="red"
                label="Rejected"
                value={stats.rejected}
              />

            </div>

          </div>

        </article>

        <article className="aae-panel">

          <div className="aae-panel-heading">

            <div>
              <h2>Daily Application Limit</h2>

              <p>
                Control the maximum number of automated applications
              </p>
            </div>

          </div>

          <div className="aae-limit-card">

            <div>

              <strong>{dailyLimit}</strong>

              <span>applications per day</span>

            </div>

            <input
              type="range"
              min="1"
              max="100"
              value={dailyLimit}
              onChange={(event) =>
                setDailyLimit(
                  Number(event.target.value)
                )
              }
              onMouseUp={(event) =>
                saveDailyLimit(
                  Number(event.currentTarget.value)
                )
              }
              onTouchEnd={(event) =>
                saveDailyLimit(
                  Number(event.currentTarget.value)
                )
              }
            />

            <div className="aae-limit-footer">

              <span>1</span>

              <span>100</span>

            </div>

          </div>

        </article>

        <article className="aae-panel aae-security-panel">

          <div className="aae-security-icon">
            ♢
          </div>

          <h2>Secure & Controlled</h2>

          <p>
            Your automation preferences remain under your control.
          </p>

          <div className="aae-security-list">

            <span>✓ Candidate-controlled engine</span>

            <span>✓ Configurable daily limits</span>

            <span>✓ Live application tracking</span>

            <span>✓ Backend-connected records</span>

          </div>

          <button
            type="button"
            className="aae-secondary-button"
            onClick={() => goTo("/settings")}
          >
            Review Settings
          </button>

        </article>

      </section>

    </section>
  );
}

function MetricCard({
  icon,
  title,
  value,
  helper,
  tone,
}) {
  return (
    <article className="aae-metric-card">

      <span
        className={`aae-metric-icon ${tone}`}
      >
        {icon}
      </span>

      <div>

        <p>{title}</p>

        <strong>{value}</strong>

        <span>{helper}</span>

      </div>

    </article>
  );
}

function StatusRow({
  color,
  label,
  value,
}) {
  return (
    <div className="aae-status-row">

      <span
        className={`aae-status-dot ${color}`}
      />

      <p>{label}</p>

      <strong>{value}</strong>

    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  buttonLabel,
  onClick,
}) {
  return (
    <div className="aae-empty">

      <span>{icon}</span>

      <strong>{title}</strong>

      <p>{description}</p>

      <button
        type="button"
        onClick={onClick}
      >
        {buttonLabel}
      </button>

    </div>
  );
}

export default AutoApplyPage;