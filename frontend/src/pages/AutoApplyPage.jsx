import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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
  const [successMessage, setSuccessMessage] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [consent, setConsent] = useState(false);
  const [minimumMatchScore, setMinimumMatchScore] = useState(70);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [easyApplyOnly, setEasyApplyOnly] = useState(true);
  const [runningAutoApply, setRunningAutoApply] = useState(false);

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
      throw new Error(
        "Candidate ID is missing. Please log in again."
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/api/applications/candidate/${candidateId}`,
      {
        method: "GET",
        headers: authHeaders,
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Applications request failed with status ${response.status}`
      );
    }

    setApplications(normalizeApplications(data));
  };

  const loadMatchedJobs = async () => {
    if (!candidateId) {
      setMatchedJobs([]);
      throw new Error(
        "Candidate ID is missing. Please log in again."
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/api/jobs/recommended/${candidateId}`,
      {
        method: "GET",
        headers: authHeaders,
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Recommended jobs request failed with status ${response.status}`
      );
    }

    setMatchedJobs(normalizeJobs(data));
  };

  const loadEngineStatus = async () => {
    if (!candidateId) {
      setEngineEnabled(false);
      throw new Error(
        "Candidate ID is missing. Please log in again."
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/api/auto-apply/status/${candidateId}`,
      {
        method: "GET",
        headers: authHeaders,
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Auto Apply status request failed with status ${response.status}`
      );
    }

    setEngineEnabled(
      Boolean(
        data?.enabled ??
          data?.isEnabled ??
          data?.active ??
          false
      )
    );

    setConsent(Boolean(data?.consent ?? false));
    setRemoteOnly(Boolean(data?.remoteOnly ?? false));
    setEasyApplyOnly(Boolean(data?.easyApplyOnly ?? true));

    if (data?.minimumMatchScore !== undefined) {
      setMinimumMatchScore(Number(data.minimumMatchScore));
    }

    const backendLimit =
      data?.dailyLimit ??
      data?.settings?.dailyLimit;

    if (backendLimit !== undefined) {
      setDailyLimit(Number(backendLimit));
      localStorage.setItem(
        "autoApplyDailyLimit",
        String(backendLimit)
      );
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

      const requestNames = [
        "Applications",
        "Recommended Jobs",
        "Auto Apply Status",
      ];

      const failedMessages = results
        .map((result, index) => {
          if (result.status !== "rejected") {
            return null;
          }

          console.error(
            `${requestNames[index]} error:`,
            result.reason
          );

          return `${requestNames[index]}: ${
            result.reason?.message || "Request failed"
          }`;
        })
        .filter(Boolean);

      if (failedMessages.length > 0) {
        setError(failedMessages.join(" | "));
      }
    } catch (requestError) {
      console.error(
        "Dashboard loading error:",
        requestError
      );

      setError(
        requestError?.message ||
          "Unable to load Auto Apply dashboard."
      );
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
      setError("Candidate ID is missing. Please log in again.");
      return;
    }

    const nextValue = !engineEnabled;

    if (nextValue && !consent) {
      setError(
        "Please accept candidate consent in Engine Settings before enabling Auto Apply."
      );
      setSettingsOpen(true);
      return;
    }

    try {
      setSavingEngine(true);
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_BASE_URL}/api/auto-apply/status`,
        {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify({
            candidateId,
            enabled: nextValue,
            dailyLimit,
            consent,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Auto Apply API returned ${response.status}`
        );
      }

      setEngineEnabled(
        Boolean(data?.enabled ?? data?.isEnabled ?? nextValue)
      );

      if (data?.dailyLimit !== undefined) {
        setDailyLimit(Number(data.dailyLimit));
      }

      setSuccessMessage(
        nextValue
          ? "Auto Apply Engine has been activated."
          : "Auto Apply Engine has been paused."
      );
    } catch (requestError) {
      console.error(requestError);

      setError(
        requestError.message ||
          "Unable to update Auto Apply Engine."
      );
    } finally {
      setSavingEngine(false);
    }
  };

  const saveSettings = async () => {
    const safeLimit = Math.max(
      1,
      Math.min(Number(dailyLimit) || 1, 100)
    );

    const safeMatchScore = Math.max(
      0,
      Math.min(Number(minimumMatchScore) || 0, 100)
    );

    if (!candidateId) {
      setError("Candidate ID is missing. Please log in again.");
      return false;
    }

    try {
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_BASE_URL}/api/auto-apply/settings`,
        {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify({
            candidateId,
            dailyLimit: safeLimit,
            minimumMatchScore: safeMatchScore,
            remoteOnly,
            easyApplyOnly,
            consent,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Auto Apply settings API returned ${response.status}`
        );
      }

      setDailyLimit(Number(data?.dailyLimit ?? safeLimit));
      setMinimumMatchScore(
        Number(data?.minimumMatchScore ?? safeMatchScore)
      );
      setRemoteOnly(Boolean(data?.remoteOnly ?? remoteOnly));
      setEasyApplyOnly(
        Boolean(data?.easyApplyOnly ?? easyApplyOnly)
      );
      setConsent(Boolean(data?.consent ?? consent));

      localStorage.setItem(
        "autoApplyDailyLimit",
        String(data?.dailyLimit ?? safeLimit)
      );

      setSuccessMessage(
        "Auto Apply settings have been saved."
      );

      return true;
    } catch (requestError) {
      console.error(
        "Auto Apply settings update error:",
        requestError
      );

      setError(
        requestError.message ||
          "Unable to save Auto Apply settings."
      );

      return false;
    }
  };

  const runAutoApply = async () => {
    if (!candidateId) {
      setError("Candidate ID is missing. Please log in again.");
      return;
    }

    if (!engineEnabled) {
      setError(
        "Enable the Auto Apply Engine before running it."
      );
      return;
    }

    if (!consent) {
      setError(
        "Candidate consent is required before Auto Apply can run."
      );
      setSettingsOpen(true);
      return;
    }

    try {
      setRunningAutoApply(true);
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_BASE_URL}/api/jobs/auto-apply/${candidateId}`,
        {
          method: "POST",
          headers: authHeaders,
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Auto Apply request failed with status ${response.status}`
        );
      }

      setSuccessMessage(
        data?.appliedCount > 0
          ? `${data.appliedCount} applications were submitted successfully.`
          : data?.message ||
              "No new eligible jobs were available."
      );

      await loadDashboardData(true);
    } catch (requestError) {
      console.error(
        "Run Auto Apply error:",
        requestError
      );

      setError(
        requestError?.message ||
          "Unable to run Auto Apply."
      );
    } finally {
      setRunningAutoApply(false);
    }
  };

  const goTo = (path) => {
    navigate(path);
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

      {successMessage && (
        <div className="aae-success">
          <span>✓</span>
          <p>{successMessage}</p>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
          >
            Close
          </button>
        </div>
      )}

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
              onClick={() => setSettingsOpen(true)}
            >
              Engine Settings
            </button>

            <button
              type="button"
              className="aae-primary-button"
              onClick={runAutoApply}
              disabled={
                runningAutoApply ||
                refreshing ||
                savingEngine ||
                !engineEnabled
              }
            >
              {runningAutoApply
                ? "Running Auto Apply..."
                : engineEnabled
                ? "Run Auto Apply"
                : "Enable Engine First"}
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
            onClick={() => setSettingsOpen(true)}
          >
            Review Settings
          </button>

        </article>

      </section>

      {settingsOpen && (
        <div
          className="aae-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSettingsOpen(false);
            }
          }}
        >
          <section
            className="aae-settings-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auto-apply-settings-title"
          >
            <div className="aae-modal-header">
              <div>
                <p className="aae-eyebrow">AUTO APPLY SETTINGS</p>
                <h2 id="auto-apply-settings-title">
                  Control your automation
                </h2>
              </div>

              <button
                type="button"
                className="aae-modal-close"
                onClick={() => setSettingsOpen(false)}
                aria-label="Close settings"
              >
                ×
              </button>
            </div>

            <div className="aae-modal-setting-row">
              <div>
                <strong>Auto Apply Engine</strong>
                <p>
                  Enable or pause automatic applications for your
                  candidate profile.
                </p>
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

            <div className="aae-modal-limit">
              <div className="aae-modal-limit-heading">
                <div>
                  <strong>Daily application limit</strong>
                  <p>
                    Select how many real applications may be submitted
                    each day.
                  </p>
                </div>
                <strong>{dailyLimit}</strong>
              </div>

              <input
                type="range"
                min="1"
                max="100"
                value={dailyLimit}
                onChange={(event) =>
                  setDailyLimit(Number(event.target.value))
                }
              />

              <div className="aae-limit-footer">
                <span>1</span>
                <span>100</span>
              </div>
            </div>

            <div className="aae-modal-limit">
              <div className="aae-modal-limit-heading">
                <div>
                  <strong>Minimum match score</strong>
                  <p>
                    Only jobs meeting this score will be considered.
                  </p>
                </div>
                <strong>{minimumMatchScore}%</strong>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={minimumMatchScore}
                onChange={(event) =>
                  setMinimumMatchScore(
                    Number(event.target.value)
                  )
                }
              />

              <div className="aae-limit-footer">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="aae-modal-setting-row">
              <div>
                <strong>Remote jobs only</strong>
                <p>
                  Match only jobs marked as remote.
                </p>
              </div>

              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(event) =>
                  setRemoteOnly(event.target.checked)
                }
              />
            </div>

            <div className="aae-modal-setting-row">
              <div>
                <strong>Easy Apply jobs only</strong>
                <p>
                  Use only jobs that support direct applications.
                </p>
              </div>

              <input
                type="checkbox"
                checked={easyApplyOnly}
                onChange={(event) =>
                  setEasyApplyOnly(event.target.checked)
                }
              />
            </div>

            <label className="aae-consent-row">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) =>
                  setConsent(event.target.checked)
                }
              />

              <span>
                I authorize NoPromptJobs to submit job applications
                on my behalf using my saved candidate profile.
              </span>
            </label>

            <div className="aae-modal-actions">
              <button
                type="button"
                className="aae-secondary-button"
                onClick={() => setSettingsOpen(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="aae-primary-button"
                onClick={async () => {
                  const saved = await saveSettings();

                  if (saved) {
                    setSettingsOpen(false);
                  }
                }}
              >
                Save Settings
              </button>
            </div>
          </section>
        </div>
      )}

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