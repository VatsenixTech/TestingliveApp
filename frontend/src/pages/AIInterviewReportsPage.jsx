import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  FaArrowLeft,
  FaBrain,
  FaCalendarAlt,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
  FaClipboardCheck,
  FaClock,
  FaCommentDots,
  FaDownload,
  FaExclamationTriangle,
  FaFileAlt,
  FaHistory,
  FaMicrophone,
  FaPrint,
  FaQuestionCircle,
  FaRobot,
  FaShareAlt,
  FaStar,
  FaTrophy,
} from "react-icons/fa";

import "./AIInterviewReportsPage.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

/* =========================================================
   AUTH HELPERS
========================================================= */

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

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

/* =========================================================
   API
========================================================= */

async function getInterviewReports() {
  const candidateId = getCandidateId();
  const token = getToken();

  if (!candidateId) {
    throw new Error(
      "Candidate ID is missing. Please log out and log in again."
    );
  }

  const url =
    `${API_BASE_URL}/api/interview-prep/reports` +
    `?candidateId=${encodeURIComponent(candidateId)}`;

  const response = await fetch(url, {
    method: "GET",

    headers: {
      Accept: "application/json",

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
  });

  const result = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "Unable to load interview reports."
    );
  }

  const data = result?.data ?? result;

  if (Array.isArray(data)) {
    return data;
  }

  return (
    data?.reports ||
    result?.reports ||
    data?.sessions ||
    []
  );
}

/* =========================================================
   VALUE HELPERS
========================================================= */

function safeNumber(value) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function getOverallScore(report) {
  return safeNumber(
    report?.overallScore ??
      report?.averageScore
  );
}

function formatPercent(value) {
  const number = safeNumber(value);

  return number === null
    ? "—"
    : `${Math.round(number)}%`;
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "Not available";
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

function formatTime(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "Not available";
  }

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function formatDuration(
  startedAt,
  completedAt
) {
  if (!startedAt || !completedAt) {
    return "Not available";
  }

  const start = new Date(
    startedAt
  ).getTime();

  const end = new Date(
    completedAt
  ).getTime();

  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    end < start
  ) {
    return "Not available";
  }

  const minutes = Math.max(
    1,
    Math.round(
      (end - start) / 60000
    )
  );

  return `${minutes} min`;
}

function getPerformanceLabel(score) {
  if (score === null) {
    return "Evaluation Pending";
  }

  if (score >= 85) {
    return "Excellent Performance";
  }

  if (score >= 70) {
    return "Strong Performance";
  }

  if (score >= 55) {
    return "Developing Well";
  }

  return "Needs More Practice";
}

function getPerformanceDescription(
  score
) {
  if (score === null) {
    return "The interview does not yet contain enough evaluated evidence to generate a reliable score.";
  }

  if (score >= 85) {
    return "You demonstrated excellent interview readiness with strong technical understanding and clear communication.";
  }

  if (score >= 70) {
    return "You showed strong preparation. Continue improving answer structure and real-world examples.";
  }

  if (score >= 55) {
    return "You have a good foundation, but your answers need more detail, structure and measurable outcomes.";
  }

  return "Continue practising complete answers with project examples, personal contributions and business impact.";
}

function getScoreClass(score) {
  if (score === null) {
    return "pending";
  }

  if (score >= 85) {
    return "excellent";
  }

  if (score >= 70) {
    return "strong";
  }

  if (score >= 55) {
    return "average";
  }

  return "low";
}

/* =========================================================
   PAGE
========================================================= */

export default function AIInterviewReportsPage({ onBack } = {}) {
  const [reports, setReports] =
    useState([]);

  const [
    selectedReportId,
    setSelectedReportId,
  ] = useState(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    return params.get("sessionId") || "";
  });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("All Roles");

  const loadReports =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const reportList =
          await getInterviewReports();

        const sortedReports = [
          ...reportList,
        ].sort((a, b) => {
          const firstDate =
            new Date(
              b.completedAt ||
                b.createdAt ||
                0
            ).getTime();

          const secondDate =
            new Date(
              a.completedAt ||
                a.createdAt ||
                0
            ).getTime();

          return (
            firstDate - secondDate
          );
        });

        setReports(sortedReports);

        if (sortedReports.length > 0) {
          setSelectedReportId((currentId) => {
            const currentExists =
              currentId &&
              sortedReports.some(
                (report) =>
                  String(
                    report._id ||
                      report.sessionId
                  ) === currentId
              );

            if (currentExists) {
              return currentId;
            }

            return String(
              sortedReports[0]._id ||
                sortedReports[0].sessionId
            );
          });
        }
      } catch (requestError) {
        setError(
          requestError.message ||
            "Unable to load interview reports."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const availableRoles =
    useMemo(() => {
      return [
        "All Roles",
        ...new Set(
          reports
            .map(
              (report) =>
                report?.role
            )
            .filter(Boolean)
        ),
      ];
    }, [reports]);

  const filteredReports =
    useMemo(() => {
      if (
        roleFilter === "All Roles"
      ) {
        return reports;
      }

      return reports.filter(
        (report) =>
          report.role === roleFilter
      );
    }, [reports, roleFilter]);

  const selectedReport =
    useMemo(() => {
      return (
        reports.find(
          (report) =>
            String(
              report._id ||
                report.sessionId
            ) === selectedReportId
        ) ||
        filteredReports[0] ||
        null
      );
    }, [
      reports,
      selectedReportId,
      filteredReports,
    ]);

  const summaryStats =
    useMemo(() => {
      const completed = reports.filter(
        (report) =>
          report.status ===
          "completed"
      );

      const validScores = completed
        .map(getOverallScore)
        .filter(
          (score) => score !== null
        );

      const averageScore =
        validScores.length > 0
          ? Math.round(
              validScores.reduce(
                (total, score) =>
                  total + score,
                0
              ) /
                validScores.length
            )
          : null;

      const bestScore =
        validScores.length > 0
          ? Math.max(
              ...validScores
            )
          : null;

      const questionsAnswered =
        completed.reduce(
          (total, report) =>
            total +
            Number(
              report.questionsAttempted ||
                0
            ),
          0
        );

      return {
        completed:
          completed.length,
        averageScore,
        bestScore,
        questionsAnswered,
      };
    }, [reports]);

  const trendData =
    useMemo(() => {
      return reports
        .filter(
          (report) =>
            getOverallScore(
              report
            ) !== null
        )
        .slice()
        .reverse()
        .map(
          (report, index) => ({
            name:
              report.role ||
              `Interview ${index + 1}`,

            score:
              Math.round(
                getOverallScore(
                  report
                )
              ),

            date: formatDate(
              report.completedAt ||
                report.createdAt
            ),
          })
        );
    }, [reports]);

  function handlePrint() {
    window.print();
  }

  async function handleShare() {
    const shareData = {
      title:
        "AI Interview Report",

      text: selectedReport
        ? `${selectedReport.role} interview report: ${formatPercent(
            getOverallScore(
              selectedReport
            )
          )}`
        : "AI Interview Report",

      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(
          shareData
        );

        return;
      }

      await navigator.clipboard.writeText(
        window.location.href
      );

      window.alert(
        "Report link copied."
      );
    } catch (shareError) {
      console.error(
        "Share error:",
        shareError
      );
    }
  }

  function handleDownload() {
    window.print();
  }

  if (loading) {
    return (
      <main className="reports-page">
        <PageLoading />
      </main>
    );
  }

  if (error) {
    return (
      <main className="reports-page">
        <PageError
          message={error}
          onRetry={loadReports}
        />
      </main>
    );
  }

  return (
    <main className="reports-page">
      <section className="reports-heading-section">
        <div>
          <button
            type="button"
            className="reports-back-button"
            onClick={() => {
              if (typeof onBack === "function") {
                onBack();
                return;
              }

              window.location.assign(
                "/ai-interview-prep"
              );
            }}
          >
            <FaArrowLeft />

            Back to Interview Prep
          </button>

          <span className="reports-eyebrow">
            AI INTERVIEW PREP
          </span>

          <h1>My Reports</h1>

          <p>
            Review genuine AI interview
            results, performance
            patterns and actionable
            improvement recommendations.
          </p>
        </div>

        <button
          type="button"
          className="reports-download-top"
          disabled={!selectedReport}
          onClick={handleDownload}
        >
          <FaDownload />
          Download Report
        </button>
      </section>

      <section className="reports-stat-grid">
        <SummaryCard
          icon={<FaCalendarAlt />}
          label="Completed Interviews"
          value={
            summaryStats.completed
          }
          note="Saved assessments"
          variant="purple"
        />

        <SummaryCard
          icon={<FaClipboardCheck />}
          label="Average Score"
          value={formatPercent(
            summaryStats.averageScore
          )}
          note="Across completed reports"
          variant="blue"
        />

        <SummaryCard
          icon={<FaTrophy />}
          label="Best Score"
          value={formatPercent(
            summaryStats.bestScore
          )}
          note="Highest performance"
          variant="green"
        />

        <SummaryCard
          icon={<FaQuestionCircle />}
          label="Questions Answered"
          value={
            summaryStats.questionsAnswered
          }
          note="Across all interviews"
          variant="orange"
        />
      </section>

      {reports.length === 0 ? (
        <EmptyReports />
      ) : (
        <>
          <section className="reports-main-layout">
            <aside className="reports-history-panel">
              <div className="reports-panel-title">
                <div>
                  <h2>
                    Interview History
                  </h2>

                  <span>
                    {
                      filteredReports.length
                    }{" "}
                    reports
                  </span>
                </div>

                <select
                  value={roleFilter}
                  onChange={(event) =>
                    setRoleFilter(
                      event.target.value
                    )
                  }
                >
                  {availableRoles.map(
                    (role) => (
                      <option
                        key={role}
                        value={role}
                      >
                        {role}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="reports-history-list">
                {filteredReports.map(
                  (report) => (
                    <ReportHistoryItem
                      key={
                        report._id ||
                        report.sessionId
                      }
                      report={report}
                      active={
                        String(
                          report._id ||
                            report.sessionId
                        ) ===
                        selectedReportId
                      }
                      onClick={() => {
                        const reportId = String(
                          report._id ||
                            report.sessionId
                        );

                        setSelectedReportId(reportId);

                        const nextUrl = new URL(
                          window.location.href
                        );

                        nextUrl.searchParams.set(
                          "sessionId",
                          reportId
                        );

                        window.history.replaceState(
                          {},
                          "",
                          nextUrl
                        );
                      }}
                    />
                  )
                )}
              </div>
            </aside>

            <section className="reports-content-panel">
              {selectedReport && (
                <ReportContent
                  report={selectedReport}
                  onPrint={handlePrint}
                  onShare={handleShare}
                  onDownload={
                    handleDownload
                  }
                />
              )}
            </section>
          </section>

          {trendData.length > 1 && (
            <section className="reports-trend-card">
              <div className="reports-section-heading">
                <div>
                  <span>
                    PERFORMANCE TREND
                  </span>

                  <h2>
                    Interview Progress
                  </h2>
                </div>

                <p>
                  Scores from your
                  completed interview
                  history.
                </p>
              </div>

              <div className="reports-trend-chart">
                <ResponsiveContainer
                  width="100%"
                  height={290}
                >
                  <AreaChart
                    data={trendData}
                    margin={{
                      top: 20,
                      right: 20,
                      left: 0,
                      bottom: 10,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="scoreGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#6c4df6"
                          stopOpacity={0.34}
                        />

                        <stop
                          offset="100%"
                          stopColor="#6c4df6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="#e8ebf5"
                    />

                    <XAxis
                      dataKey="date"
                      tick={{
                        fill: "#7d86a5",
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      domain={[0, 100]}
                      tick={{
                        fill: "#7d86a5",
                        fontSize: 11,
                      }}
                    />

                    <Tooltip />

                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#6c4df6"
                      strokeWidth={3}
                      fill="url(#scoreGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  icon,
  label,
  value,
  note,
  variant,
}) {
  return (
    <article className="reports-stat-card">
      <div
        className={`reports-stat-icon ${variant}`}
      >
        {icon}
      </div>

      <div>
        <span>{label}</span>

        <strong>{value}</strong>

        <small>{note}</small>
      </div>
    </article>
  );
}

/* =========================================================
   HISTORY ITEM
========================================================= */

function ReportHistoryItem({
  report,
  active,
  onClick,
}) {
  const score =
    getOverallScore(report);

  return (
    <button
      type="button"
      className={`reports-history-item ${
        active ? "active" : ""
      }`}
      onClick={onClick}
    >
      <div>
        <strong>
          {report.role ||
            "AI Interview"}
        </strong>

        <span>
          {report.interviewType ||
            "Mixed"}{" "}
          Interview
        </span>

        <small>
          {formatDate(
            report.completedAt ||
              report.createdAt
          )}
          {" · "}
          {formatTime(
            report.completedAt ||
              report.createdAt
          )}
        </small>
      </div>

      <div
        className={`reports-history-score ${getScoreClass(
          score
        )}`}
      >
        {formatPercent(score)}
      </div>

      <span className="reports-completed-label">
        <FaCheck />
        Completed
      </span>
    </button>
  );
}

/* =========================================================
   REPORT CONTENT
========================================================= */

function ReportContent({
  report,
  onPrint,
  onShare,
  onDownload,
}) {
  const overallScore =
    getOverallScore(report);

  const radarData = [
    {
      subject:
        "Technical Knowledge",
      score:
        safeNumber(
          report.technicalScore
        ) || 0,
      fullMark: 100,
    },
    {
      subject: "Communication",
      score:
        safeNumber(
          report.communicationScore
        ) || 0,
      fullMark: 100,
    },
    {
      subject: "Confidence",
      score:
        safeNumber(
          report.confidenceScore
        ) || 0,
      fullMark: 100,
    },
    {
      subject: "Overall",
      score:
        overallScore || 0,
      fullMark: 100,
    },
  ];

  const metricList = [
    {
      title:
        "Technical Knowledge",
      score:
        report.technicalScore,
      icon: <FaBrain />,
      description:
        "Role knowledge, concepts and practical problem-solving.",
    },
    {
      title: "Communication",
      score:
        report.communicationScore,
      icon: <FaCommentDots />,
      description:
        "Clarity, structure and completeness of your answers.",
    },
    {
      title: "Confidence",
      score:
        report.confidenceScore,
      icon: <FaMicrophone />,
      description:
        "Participation, consistency and interview engagement.",
    },
    {
      title: "Overall Score",
      score: overallScore,
      icon: <FaTrophy />,
      description:
        "Combined performance across the completed interview.",
    },
  ];

  return (
    <>
      <article className="reports-overview-card">
        <header className="reports-report-header">
          <div>
            <div className="reports-title-row">
              <h2>
                {report.role ||
                  "AI Interview"}
              </h2>

              <span>
                {report.interviewType ||
                  "Mixed"}{" "}
                Interview
              </span>
            </div>

            <div className="reports-report-meta">
              <span>
                <FaCalendarAlt />

                {formatDate(
                  report.completedAt ||
                    report.createdAt
                )}
              </span>

              <span>
                <FaClock />

                {formatTime(
                  report.completedAt ||
                    report.createdAt
                )}
              </span>

              <span>
                <FaHistory />

                {formatDuration(
                  report.startedAt,
                  report.completedAt
                )}
              </span>
            </div>
          </div>

          <div className="reports-actions">
            <button
              type="button"
              onClick={onShare}
            >
              <FaShareAlt />
              Share
            </button>

            <button
              type="button"
              onClick={onPrint}
            >
              <FaPrint />
              Print
            </button>

            <button
              type="button"
              className="primary"
              onClick={onDownload}
            >
              <FaDownload />
              Download PDF
            </button>
          </div>
        </header>

        <div className="reports-performance-grid">
          <div className="reports-score-section">
            <div
              className={`reports-score-circle ${getScoreClass(
                overallScore
              )}`}
              style={{
                "--score-angle":
                  `${
                    (overallScore || 0) *
                    3.6
                  }deg`,
              }}
            >
              <div>
                <strong>
                  {formatPercent(
                    overallScore
                  )}
                </strong>

                <span>
                  Overall Score
                </span>
              </div>
            </div>

            <div className="reports-score-message">
              <span>
                PERFORMANCE LEVEL
              </span>

              <h3>
                {getPerformanceLabel(
                  overallScore
                )}
              </h3>

              <p>
                {getPerformanceDescription(
                  overallScore
                )}
              </p>

              <div className="reports-rating">
                {[
                  1,
                  2,
                  3,
                  4,
                  5,
                ].map((star) => (
                  <FaStar
                    key={star}
                    className={
                      overallScore &&
                      star <=
                        Math.ceil(
                          overallScore /
                            20
                        )
                        ? "active"
                        : ""
                    }
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="reports-radar-section">
            <span className="reports-card-label">
              PERFORMANCE OVERVIEW
            </span>

            <ResponsiveContainer
              width="100%"
              height={280}
            >
              <RadarChart
                data={radarData}
                outerRadius="72%"
              >
                <PolarGrid
                  stroke="#e3e7f2"
                />

                <PolarAngleAxis
                  dataKey="subject"
                  tick={{
                    fill: "#687493",
                    fontSize: 11,
                  }}
                />

                <Radar
                  name="Your Score"
                  dataKey="score"
                  stroke="#704ff7"
                  fill="#704ff7"
                  fillOpacity={0.24}
                  strokeWidth={2}
                />

                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </article>

      <section className="reports-metric-grid">
        {metricList.map(
          (metric) => (
            <MetricCard
              key={metric.title}
              {...metric}
            />
          )
        )}
      </section>

      <section className="reports-insight-grid">
        <article className="reports-insight-card reports-ai-summary">
          <InsightHeading
            icon={<FaRobot />}
            title="AI Summary"
            subtitle="Performance evaluation"
          />

          <p>
            {report.reportSummary ||
              report.feedback ||
              "The completed interview does not yet contain a written report summary."}
          </p>
        </article>

        <article className="reports-insight-card">
          <InsightHeading
            icon={<FaCheck />}
            title="Strengths"
            subtitle="Skills demonstrated"
            variant="success"
          />

          <div className="reports-chip-list">
            {Array.isArray(
              report.strongAreas
            ) &&
            report.strongAreas
              .length > 0 ? (
              report.strongAreas.map(
                (area) => (
                  <span
                    key={area}
                    className="reports-chip success"
                  >
                    <FaCheck />
                    {area}
                  </span>
                )
              )
            ) : (
              <EmptyText text="No strengths have been identified yet." />
            )}
          </div>
        </article>

        <article className="reports-insight-card">
          <InsightHeading
            icon={
              <FaExclamationTriangle />
            }
            title="Areas to Improve"
            subtitle="Recommended actions"
            variant="warning"
          />

          <div className="reports-improvement-list">
            {Array.isArray(
              report.improvementAreas
            ) &&
            report.improvementAreas
              .length > 0 ? (
              report.improvementAreas.map(
                (area, index) => (
                  <div key={area}>
                    <span>
                      {index + 1}
                    </span>

                    <p>{area}</p>
                  </div>
                )
              )
            ) : (
              <EmptyText text="No improvement recommendations are available." />
            )}
          </div>
        </article>
      </section>

      <article className="reports-timeline-card">
        <div className="reports-section-heading">
          <div>
            <span>
              SESSION DETAILS
            </span>

            <h2>
              Interview Timeline
            </h2>
          </div>
        </div>

        <div className="reports-timeline-grid">
          <TimelineItem
            label="Interview Started"
            value={`${formatDate(
              report.startedAt
            )} · ${formatTime(
              report.startedAt
            )}`}
          />

          <TimelineItem
            label="Interview Completed"
            value={`${formatDate(
              report.completedAt
            )} · ${formatTime(
              report.completedAt
            )}`}
          />

          <TimelineItem
            label="Duration"
            value={formatDuration(
              report.startedAt,
              report.completedAt
            )}
          />

          <TimelineItem
            label="Questions Answered"
            value={`${
              report.questionsAttempted ||
              0
            } / ${
              report.questionCount || 0
            }`}
          />
        </div>
      </article>

      <QuestionsSection
        questions={
          report.questions || []
        }
      />
    </>
  );
}

/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
  title,
  score,
  icon,
  description,
}) {
  const number = safeNumber(score);

  return (
    <article className="reports-metric-card">
      <div className="reports-metric-heading">
        <span>{icon}</span>

        <strong>
          {formatPercent(number)}
        </strong>
      </div>

      <h3>{title}</h3>

      <div className="reports-progress-track">
        <span
          style={{
            width:
              number === null
                ? "0%"
                : `${Math.min(
                    100,
                    Math.max(
                      0,
                      number
                    )
                  )}%`,
          }}
        />
      </div>

      <p>{description}</p>
    </article>
  );
}

/* =========================================================
   QUESTIONS
========================================================= */

function QuestionsSection({
  questions,
}) {
  const [openQuestion, setOpenQuestion] =
    useState("");

  return (
    <article className="reports-questions-card">
      <div className="reports-section-heading">
        <div>
          <span>
            QUESTIONS &amp; FEEDBACK
          </span>

          <h2>
            Interview Answers
          </h2>
        </div>

        <p>
          {questions.length} saved
          questions
        </p>
      </div>

      {questions.length === 0 ? (
        <EmptyText text="No saved question-level feedback is available for this interview." />
      ) : (
        <div className="reports-question-list">
          {questions.map(
            (question, index) => {
              const questionId =
                String(
                  question._id ||
                    index
                );

              const isOpen =
                openQuestion ===
                questionId;

              return (
                <div
                  className="reports-question-item"
                  key={questionId}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenQuestion(
                        isOpen
                          ? ""
                          : questionId
                      )
                    }
                  >
                    <span>
                      {index + 1}
                    </span>

                    <strong>
                      {question.question ||
                        "Interview question"}
                    </strong>

                    <div>
                      <small>
                        {formatPercent(
                          question.overallScore
                        )}
                      </small>

                      {isOpen ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="reports-question-content">
                      <section>
                        <span>
                          YOUR ANSWER
                        </span>

                        <p>
                          {question.answer ||
                            "No answer was saved."}
                        </p>
                      </section>

                      <section>
                        <span>
                          AI FEEDBACK
                        </span>

                        <p>
                          {question.feedback ||
                            "No question-level feedback is available."}
                        </p>
                      </section>

                      <div className="reports-question-scores">
                        <ScoreBadge
                          label="Technical"
                          value={
                            question.technicalScore
                          }
                        />

                        <ScoreBadge
                          label="Communication"
                          value={
                            question.communicationScore
                          }
                        />

                        <ScoreBadge
                          label="Confidence"
                          value={
                            question.confidenceScore
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      )}
    </article>
  );
}

function ScoreBadge({
  label,
  value,
}) {
  return (
    <div>
      <span>{label}</span>

      <strong>
        {formatPercent(value)}
      </strong>
    </div>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function InsightHeading({
  icon,
  title,
  subtitle,
  variant = "",
}) {
  return (
    <header className="reports-insight-heading">
      <span
        className={variant}
      >
        {icon}
      </span>

      <div>
        <h3>{title}</h3>

        <p>{subtitle}</p>
      </div>
    </header>
  );
}

function TimelineItem({
  label,
  value,
}) {
  return (
    <div className="reports-timeline-item">
      <span>{label}</span>

      <strong>{value}</strong>
    </div>
  );
}

function EmptyText({ text }) {
  return (
    <p className="reports-empty-text">
      {text}
    </p>
  );
}

function PageLoading() {
  return (
    <section className="reports-page-state">
      <div className="reports-loader" />

      <h1>
        Loading Interview Reports
      </h1>

      <p>
        Retrieving real interview
        results from your backend.
      </p>
    </section>
  );
}

function PageError({
  message,
  onRetry,
}) {
  return (
    <section className="reports-page-state error">
      <FaExclamationTriangle />

      <h1>
        Unable to Load Reports
      </h1>

      <p>{message}</p>

      <button
        type="button"
        onClick={onRetry}
      >
        Try Again
      </button>
    </section>
  );
}

function EmptyReports() {
  return (
    <section className="reports-page-state">
      <FaFileAlt />

      <h1>
        No Completed Reports Yet
      </h1>

      <p>
        Complete an AI interview to
        generate your first genuine
        performance report.
      </p>

      <button
        type="button"
        onClick={() =>
          window.location.assign(
            "/ai-interview-prep"
          )
        }
      >
        Start AI Interview
      </button>
    </section>
  );
}