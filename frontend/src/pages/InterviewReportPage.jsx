import { useMemo } from "react";
import {
  FaArrowLeft,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaComments,
  FaExclamationTriangle,
  FaRedo,
  FaStar,
} from "react-icons/fa";

import "./InterviewReportPage.css";

const getSessionIdFromPath = () =>
  decodeURIComponent(
    window.location.pathname
      .split("/")
      .filter(Boolean)[1] || ""
  );

export default function InterviewReportPage({
  sessionId: sessionIdProp,
}) {
  const sessionId =
    sessionIdProp || getSessionIdFromPath();

  const completedInterview = useMemo(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem(
          "completedInterviewSession"
        ) || "{}"
      );
    } catch {
      return {};
    }
  }, []);

  const session =
    completedInterview?.session || {};

  const report =
    completedInterview?.report || {};

  const transcript =
    completedInterview?.transcript || [];

  const elapsedSeconds = Number(
    completedInterview?.elapsedSeconds || 0
  );

  const elapsedMinutes = Math.max(
    0,
    Math.floor(elapsedSeconds / 60)
  );

  const candidateAnswers =
    transcript.filter(
      (message) =>
        message?.sender === "candidate"
    );

  const evidenceStatus =
    report.evidenceStatus ||
    (elapsedSeconds < 300 ||
    candidateAnswers.length < 3
      ? "insufficient"
      : "sufficient");

  const hasReliableScores =
    evidenceStatus === "sufficient";

  const scoreCards = [
    {
      label: "Overall Score",
      value: report.overallScore,
      icon: <FaStar />,
    },
    {
      label: "Technical",
      value: report.technicalScore,
      icon: <FaChartLine />,
    },
    {
      label: "Communication",
      value: report.communicationScore,
      icon: <FaComments />,
    },
    {
      label: "Confidence",
      value: report.confidenceScore,
      icon: <FaCheckCircle />,
    },
  ];

  const defaultImprovementAreas = [
    "Complete at least five minutes of the interview so the system has enough evidence.",
    "Answer at least three to five questions before ending the session.",
    "Use the STAR structure: situation, task, action, and result.",
    "Include specific tools, decisions, metrics, and measurable outcomes.",
    "Avoid very short answers; explain your individual contribution clearly.",
  ];

  const improvementAreas =
    report.improvementAreas?.length
      ? report.improvementAreas
      : defaultImprovementAreas;

  return (
    <main className="interview-report-page">
      <header className="interview-report-header">
        <div>
          <span className="report-success-label">
            <FaCheckCircle />
            Interview Completed
          </span>

          <h1>Your AI Interview Report</h1>

          <p>
            {session?.role || "Interview"} ·{" "}
            {session?.experienceLevel ||
              "Experience"}{" "}
            ·{" "}
            {session?.interviewType || "Mixed"}
          </p>
        </div>

        <div className="report-header-actions">
          <button
            type="button"
            onClick={() =>
              window.location.assign(
                "/ai-interview-prep"
              )
            }
          >
            <FaRedo />
            Practice Again
          </button>

          <button
            type="button"
            className="secondary"
            onClick={() => {
              window.close();

              window.setTimeout(() => {
                window.location.assign(
                  "/ai-interview-prep"
                );
              }, 100);
            }}
          >
            <FaArrowLeft />
            Close Report
          </button>
        </div>
      </header>

      {!hasReliableScores && (
        <section className="report-evidence-warning">
          <FaExclamationTriangle />

          <div>
            <strong>
              Not enough interview evidence for
              reliable scoring
            </strong>

            <p>
              This session lasted{" "}
              {elapsedMinutes || "less than one"}{" "}
              minute
              {elapsedMinutes === 1 ? "" : "s"} and
              included{" "}
              {candidateAnswers.length} answer
              {candidateAnswers.length === 1
                ? ""
                : "s"}
              . Scores are intentionally hidden
              rather than presenting misleading
              positive results.
            </p>
          </div>
        </section>
      )}

      <section className="report-meta-grid">
        <article>
          <FaClock />

          <div>
            <span>Duration Used</span>

            <strong>
              {elapsedMinutes < 1
                ? "< 1 minute"
                : `${elapsedMinutes} minute${
                    elapsedMinutes === 1
                      ? ""
                      : "s"
                  }`}
            </strong>
          </div>
        </article>

        <article>
          <FaComments />

          <div>
            <span>Answers Captured</span>
            <strong>
              {candidateAnswers.length}
            </strong>
          </div>
        </article>

        <article>
          <FaChartLine />

          <div>
            <span>Evaluation Reliability</span>

            <strong>
              {hasReliableScores
                ? "Sufficient"
                : "Insufficient"}
            </strong>
          </div>
        </article>
      </section>

      <section className="report-score-grid">
        {scoreCards.map((card) => (
          <article
            key={card.label}
            className={
              hasReliableScores
                ? ""
                : "score-unavailable"
            }
          >
            <span>{card.icon}</span>

            <div>
              <small>{card.label}</small>

              <strong>
                {hasReliableScores &&
                Number.isFinite(
                  Number(card.value)
                )
                  ? `${Math.round(
                      Number(card.value)
                    )}%`
                  : "Not scored"}
              </strong>
            </div>
          </article>
        ))}
      </section>

      <section className="report-content-grid">
        <article className="report-panel">
          <h2>Performance Summary</h2>

          <p>
            {report.summary ||
              (hasReliableScores
                ? "Your interview was evaluated from the recorded transcript."
                : "A genuine performance score requires a longer interview and multiple complete answers. The feedback below focuses on how to make your next attempt evaluable and stronger.")}
          </p>

          <div className="report-list-block">
            <h3>Strong Areas</h3>

            {hasReliableScores &&
            report.strongAreas?.length ? (
              <ul>
                {report.strongAreas.map(
                  (item) => (
                    <li key={item}>
                      {item}
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p>
                No strong area is confirmed yet
                because the available evidence is
                too limited.
              </p>
            )}
          </div>

          <div className="report-list-block">
            <h3>
              Priority Improvements
            </h3>

            <ul>
              {improvementAreas.map(
                (item) => (
                  <li key={item}>{item}</li>
                )
              )}
            </ul>
          </div>

          <div className="report-list-block">
            <h3>
              Recommended Answer Framework
            </h3>

            <ul>
              <li>
                Start with a direct one-sentence
                answer.
              </li>
              <li>
                Explain the project context and
                business problem.
              </li>
              <li>
                Describe your own actions and
                technical decisions.
              </li>
              <li>
                Mention tools, scale, time, cost,
                performance, or quality metrics.
              </li>
              <li>
                Finish with the measurable result
                and what you learned.
              </li>
            </ul>
          </div>
        </article>

        <article className="report-panel transcript-panel">
          <h2>Interview Transcript</h2>

          <div className="report-transcript">
            {transcript.length === 0 ? (
              <p className="empty-report">
                No transcript was recorded.
              </p>
            ) : (
              transcript.map(
                (message, index) => (
                  <div
                    key={`${message.sender}-${index}`}
                    className={`report-message ${message.sender}`}
                  >
                    <strong>
                      {message.sender ===
                      "candidate"
                        ? "You"
                        : "Takshvi"}
                    </strong>

                    <p>{message.text}</p>
                  </div>
                )
              )
            )}
          </div>
        </article>
      </section>
    </main>
  );
}