import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaArrowLeft,
  FaArrowRight,
  FaBrain,
  FaCalendarAlt,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaFileAlt,
  FaFilter,
  FaHistory,
  FaPlayCircle,
  FaRobot,
  FaSearch,
  FaSpinner,
} from "react-icons/fa";

import "./AIInterviewHistoryPage.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

function getStoredUser() {
  try {
    return JSON.parse(
      localStorage.getItem("user") ||
        sessionStorage.getItem("user") ||
        "{}"
    );
  } catch {
    return {};
  }
}

function getCandidateId() {
  const user = getStoredUser();

  return String(
    user?.candidateId ||
      user?.candidate?._id ||
      user?.candidate?.id ||
      user?.profile?.candidateId ||
      user?.profile?._id ||
      user?.data?.candidateId ||
      user?.data?._id ||
      user?.user?.candidateId ||
      user?.user?._id ||
      user?._id ||
      user?.id ||
      localStorage.getItem("candidateId") ||
      sessionStorage.getItem("candidateId") ||
      ""
  ).trim();
}

function navigate(nextPath) {
  window.history.pushState(
    {},
    "",
    nextPath
  );

  window.dispatchEvent(
    new PopStateEvent("popstate")
  );
}

function formatDate(value) {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function normalizeStatus(value) {
  return String(
    value || "completed"
  )
    .trim()
    .toLowerCase();
}

function getStatusLabel(value) {
  const status = normalizeStatus(value);

  if (status === "in-progress") {
    return "In Progress";
  }

  if (status === "cancelled") {
    return "Cancelled";
  }

  return "Completed";
}

function getSessionId(session) {
  return String(
    session?._id ||
      session?.id ||
      session?.sessionId ||
      ""
  );
}

export default function AIInterviewHistoryPage({
  onBack,
}) {
  const [sessions, setSessions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const token = useMemo(
    () => getToken(),
    []
  );

  const candidateId = useMemo(
    () => getCandidateId(),
    []
  );

  const loadHistory =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        if (!candidateId) {
          throw new Error(
            "Candidate ID is missing. Please log out and log in again."
          );
        }

        const response = await fetch(
          `${API_BASE_URL}/api/interview-prep/sessions?candidateId=${encodeURIComponent(
            candidateId
          )}`,
          {
            headers: {
              Accept: "application/json",
              ...(token
                ? {
                    Authorization:
                      `Bearer ${token}`,
                  }
                : {}),
            },
          }
        );

        const result = await response
          .json()
          .catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            result?.message ||
              result?.error ||
              `Request failed with status ${response.status}`
          );
        }

        const data =
          result?.data ?? result;

        const items = Array.isArray(data)
          ? data
          : data?.sessions ||
            data?.history ||
            data?.items ||
            [];

        setSessions(items);
      } catch (requestError) {
        setError(
          requestError.message ||
            "Unable to load interview history."
        );
      } finally {
        setLoading(false);
      }
    }, [candidateId, token]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const filteredSessions =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      return sessions.filter(
        (session) => {
          const status =
            normalizeStatus(
              session?.status
            );

          const matchesStatus =
            statusFilter === "all" ||
            status === statusFilter;

          const searchableText = [
            session?.role,
            session?.interviewType,
            session?.experienceLevel,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            !normalizedSearch ||
            searchableText.includes(
              normalizedSearch
            );

          return (
            matchesStatus &&
            matchesSearch
          );
        }
      );
    }, [
      sessions,
      search,
      statusFilter,
    ]);

  const completedCount =
    sessions.filter(
      (session) =>
        normalizeStatus(
          session?.status
        ) === "completed"
    ).length;

  const inProgressCount =
    sessions.filter(
      (session) =>
        normalizeStatus(
          session?.status
        ) === "in-progress"
    ).length;

  const scoredSessions =
    sessions.filter(
      (session) =>
        session?.averageScore !==
          null &&
        session?.averageScore !==
          undefined
    );

  const averageScore =
    scoredSessions.length > 0
      ? Math.round(
          scoredSessions.reduce(
            (total, session) =>
              total +
              Number(
                session.averageScore ||
                  0
              ),
            0
          ) / scoredSessions.length
        )
      : null;

  function handleBack() {
    if (typeof onBack === "function") {
      onBack();
      return;
    }

    navigate(
      "/ai-interview-prep"
    );
  }

  function openReport(session) {
    const sessionId =
      getSessionId(session);

    if (!sessionId) {
      navigate(
        "/ai-interview-reports"
      );
      return;
    }

    navigate(
      `/ai-interview-reports?sessionId=${encodeURIComponent(
        sessionId
      )}`
    );
  }

  function continueSession(session) {
    const sessionId =
      getSessionId(session);

    if (!sessionId) {
      return;
    }

    window.open(
      `/ai-interview-session/${encodeURIComponent(
        sessionId
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <main className="aih-page">
      <section className="aih-hero">
        <div>
          <button
            type="button"
            className="aih-back-button"
            onClick={handleBack}
          >
            <FaArrowLeft />
            Back to Interview Prep
          </button>

          <span className="aih-eyebrow">
            <FaHistory />
            AI Interview History
          </span>

          <h1>
            Your Interview Journey
          </h1>

          <p>
            Review completed sessions,
            continue active interviews,
            and open detailed performance
            reports.
          </p>
        </div>

        <div className="aih-summary">
          <article>
            <FaCheckCircle />
            <span>Completed</span>
            <strong>
              {completedCount}
            </strong>
          </article>

          <article>
            <FaClock />
            <span>In Progress</span>
            <strong>
              {inProgressCount}
            </strong>
          </article>

          <article>
            <FaChartLine />
            <span>Average Score</span>
            <strong>
              {averageScore === null
                ? "—"
                : `${averageScore}%`}
            </strong>
          </article>
        </div>
      </section>

      <section className="aih-toolbar">
        <label className="aih-search">
          <FaSearch />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search by role, type or experience..."
          />
        </label>

        <label className="aih-filter">
          <FaFilter />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              All sessions
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="in-progress">
              In progress
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>
        </label>

        <button
          type="button"
          className="aih-refresh"
          onClick={loadHistory}
        >
          Refresh
        </button>
      </section>

      {loading && (
        <section className="aih-state">
          <FaSpinner className="aih-spin" />

          <h2>
            Loading interview history
          </h2>

          <p>
            Retrieving your interview
            sessions from the backend.
          </p>
        </section>
      )}

      {!loading && error && (
        <section className="aih-state aih-error">
          <FaFileAlt />

          <h2>
            Unable to load history
          </h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={loadHistory}
          >
            Try Again
          </button>
        </section>
      )}

      {!loading &&
        !error &&
        filteredSessions.length ===
          0 && (
          <section className="aih-state">
            <FaRobot />

            <h2>
              No matching sessions
            </h2>

            <p>
              Complete an AI interview
              or change your filters.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/ai-interview-prep"
                )
              }
            >
              Start an Interview
              <FaArrowRight />
            </button>
          </section>
        )}

      {!loading &&
        !error &&
        filteredSessions.length >
          0 && (
          <section className="aih-grid">
            {filteredSessions.map(
              (session, index) => {
                const sessionId =
                  getSessionId(
                    session
                  ) || index;

                const status =
                  normalizeStatus(
                    session?.status
                  );

                const score =
                  session?.averageScore;

                return (
                  <article
                    className="aih-card"
                    key={sessionId}
                  >
                    <div className="aih-card-top">
                      <span
                        className={`aih-status ${status}`}
                      >
                        {getStatusLabel(
                          status
                        )}
                      </span>

                      <span className="aih-date">
                        <FaCalendarAlt />

                        {formatDate(
                          session?.completedAt ||
                            session?.startedAt ||
                            session?.createdAt
                        )}
                      </span>
                    </div>

                    <div className="aih-role-row">
                      <span className="aih-role-icon">
                        <FaBrain />
                      </span>

                      <div>
                        <h2>
                          {session?.role ||
                            "AI Interview"}
                        </h2>

                        <p>
                          {session?.interviewType ||
                            "Mixed"}{" "}
                          ·{" "}
                          {session?.experienceLevel ||
                            "Experience not set"}
                        </p>
                      </div>
                    </div>

                    <div className="aih-metrics">
                      <div>
                        <span>
                          Questions
                        </span>

                        <strong>
                          {session?.questionsAttempted ||
                            0}
                          /
                          {session?.questionCount ||
                            0}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Score
                        </span>

                        <strong>
                          {score === null ||
                          score === undefined
                            ? "Pending"
                            : `${Math.round(
                                Number(
                                  score
                                )
                              )}%`}
                        </strong>
                      </div>
                    </div>

                    <div className="aih-actions">
                      {status ===
                      "in-progress" ? (
                        <button
                          type="button"
                          className="primary"
                          onClick={() =>
                            continueSession(
                              session
                            )
                          }
                        >
                          <FaPlayCircle />
                          Continue Interview
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="primary"
                          onClick={() =>
                            openReport(
                              session
                            )
                          }
                        >
                          <FaChartLine />
                          View Report
                        </button>
                      )}

                      <button
                        type="button"
                        className="secondary"
                        onClick={() =>
                          navigate(
                            "/ai-interview-question-bank"
                          )
                        }
                      >
                        Practice Questions
                      </button>
                    </div>
                  </article>
                );
              }
            )}
          </section>
        )}
    </main>
  );
}