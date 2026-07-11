import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaArrowRight,
  FaBrain,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaFileAlt,
  FaHistory,
  FaMicrophone,
  FaRobot,
  FaStar,
  FaUsers,
} from "react-icons/fa";
import {
  HiOutlineChartBar,
  HiOutlineChatAlt2,
  HiOutlineSparkles,
} from "react-icons/hi";

import "./AIInterviewPrepPage.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const EMPTY_STATS = {
  completedSessions: 0,
  questionsAttempted: 0,
  averageScore: null,
  strongAreas: 0,
  needsImprovement: 0,
  completionPercent: 0,
};

const ROLE_OPTIONS = [
  "Data Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "DevOps Engineer",
  "Cybersecurity Analyst",
  "SAP Consultant",
  "HR Executive",
  "Product Manager",
];

const EXPERIENCE_OPTIONS = [
  "Fresher",
  "0-2 Years",
  "2-5 Years",
  "5-8 Years",
  "8+ Years",
];

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("authToken") ||
  localStorage.getItem("accessToken") ||
  sessionStorage.getItem("token") ||
  "";

const clamp = (value, min = 0, max = 100) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(max, Math.max(min, number));
};

export default function AIInterviewPrepPage() {
  const [role, setRole] = useState("Data Engineer");
  const [experienceLevel, setExperienceLevel] = useState("2-5 Years");
  const [interviewType, setInterviewType] = useState("Technical");
  const [questionCount, setQuestionCount] = useState(10);

  const [stats, setStats] = useState(EMPTY_STATS);
  const [loadingStats, setLoadingStats] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  const token = useMemo(() => getToken(), []);

  const loadStats = useCallback(async () => {
    try {
      setLoadingStats(true);

      if (!token) {
        setStats(EMPTY_STATS);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/interview-prep/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to load interview progress."
        );
      }

      const data = result.data || result;

      setStats({
        completedSessions: Number(data.completedSessions || 0),
        questionsAttempted: Number(data.questionsAttempted || 0),
        averageScore:
          data.averageScore === null ||
          data.averageScore === undefined
            ? null
            : Number(data.averageScore),
        strongAreas: Number(data.strongAreas || 0),
        needsImprovement: Number(data.needsImprovement || 0),
        completionPercent: clamp(data.completionPercent || 0),
      });
    } catch (requestError) {
      console.error("Interview progress error:", requestError);
      setStats(EMPTY_STATS);
    } finally {
      setLoadingStats(false);
    }
  }, [token]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const startInterview = async () => {
    try {
      setError("");

      if (!role.trim()) {
        throw new Error("Please select an interview role.");
      }

      if (!experienceLevel) {
        throw new Error("Please select your experience level.");
      }

      if (!token) {
        throw new Error(
          "Your login session is missing. Please log in again."
        );
      }

      setStarting(true);

      const response = await fetch(
        `${API_BASE_URL}/api/interview-prep/sessions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role,
            experienceLevel,
            interviewType,
            questionCount,
          }),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to start interview session."
        );
      }

      const data = result.data || result;
      const sessionId = data.sessionId || data._id || data.id;

      if (!sessionId) {
        throw new Error(
          "Interview session was created, but no session ID was returned."
        );
      }

      window.location.href = `/ai-interview?sessionId=${encodeURIComponent(
        sessionId
      )}`;
    } catch (requestError) {
      setError(
        requestError.message || "Unable to start interview session."
      );
    } finally {
      setStarting(false);
    }
  };

  return (
    <main className="interview-prep-page">
      <section className="interview-prep-hero">
        <div className="interview-prep-intro">
          <span className="interview-prep-eyebrow">
            <HiOutlineSparkles />
            AI Interview Prep
          </span>

          <h1>Practice. Prepare. Perform.</h1>

          <p>
            Takshvi is your AI interviewer. Get role-based questions,
            real-time feedback, communication analysis, and detailed
            performance reports.
          </p>

          <div className="interview-feature-list">
            <div>
              <span><FaBrain /></span>
              <div>
                <strong>Role-based Questions</strong>
                <p>Questions tailored to your target role.</p>
              </div>
            </div>

            <div>
              <span><HiOutlineChatAlt2 /></span>
              <div>
                <strong>Real-time Feedback</strong>
                <p>Instant AI feedback on every answer.</p>
              </div>
            </div>

            <div>
              <span><FaMicrophone /></span>
              <div>
                <strong>Voice &amp; Text Support</strong>
                <p>Speak naturally or type your responses.</p>
              </div>
            </div>

            <div>
              <span><FaFileAlt /></span>
              <div>
                <strong>Detailed Reports</strong>
                <p>Track confidence, English, and technical growth.</p>
              </div>
            </div>
          </div>
        </div>

        <article className="interview-progress-card">
          <div className="interview-progress-heading">
            <div>
              <span>Practice Session Progress</span>
              <small>
                {loadingStats
                  ? "Loading your progress..."
                  : `${stats.completedSessions} completed session${
                      stats.completedSessions === 1 ? "" : "s"
                    }`}
              </small>
            </div>

            <button
              type="button"
              onClick={() =>
                (window.location.href = "/interview-history")
              }
            >
              View History
              <FaArrowRight />
            </button>
          </div>

          <div className="interview-progress-content">
            <div
              className="interview-progress-ring"
              style={{
                "--progress-angle": `${stats.completionPercent * 3.6}deg`,
              }}
            >
              <div>
                <strong>{Math.round(stats.completionPercent)}%</strong>
                <span>Complete</span>
              </div>
            </div>

            <div className="interview-progress-stats">
              <div>
                <span>Questions Attempted</span>
                <strong>{stats.questionsAttempted}</strong>
              </div>

              <div>
                <span>Average Score</span>
                <strong>
                  {stats.averageScore === null
                    ? "—"
                    : `${Math.round(stats.averageScore)}%`}
                </strong>
              </div>

              <div>
                <span>Strong Areas</span>
                <strong>{stats.strongAreas}</strong>
              </div>

              <div>
                <span>Needs Improvement</span>
                <strong>{stats.needsImprovement}</strong>
              </div>
            </div>
          </div>

          <div className="interview-progress-tip">
            <FaStar />
            Practice regularly to improve confidence and performance.
          </div>
        </article>
      </section>

      <section className="interview-prep-grid">
        <article className="interview-setup-card">
          <div className="interview-section-heading">
            <div>
              <span>Start a New Interview Practice</span>
              <p>Configure a personalized session with Takshvi.</p>
            </div>
          </div>

          {error && <div className="interview-error">{error}</div>}

          <div className="interview-form-grid">
            <label>
              <span>Interview Role</span>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Experience Level</span>
              <select
                value={experienceLevel}
                onChange={(event) =>
                  setExperienceLevel(event.target.value)
                }
              >
                {EXPERIENCE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="interview-field-block">
            <span className="interview-field-label">Interview Type</span>

            <div className="interview-type-grid">
              {[
                {
                  value: "Technical",
                  label: "Technical",
                  text: "Coding and concepts",
                  icon: <FaBrain />,
                },
                {
                  value: "HR",
                  label: "HR",
                  text: "Behavioral and HR",
                  icon: <FaUsers />,
                },
                {
                  value: "Mixed",
                  label: "Mixed",
                  text: "Technical and HR",
                  icon: <HiOutlineSparkles />,
                },
              ].map((option) => (
                <button
                  type="button"
                  key={option.value}
                  className={
                    interviewType === option.value ? "active" : ""
                  }
                  onClick={() => setInterviewType(option.value)}
                >
                  <span>{option.icon}</span>
                  <div>
                    <strong>{option.label}</strong>
                    <small>{option.text}</small>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="interview-field-block">
            <span className="interview-field-label">
              Number of Questions
            </span>

            <div className="interview-question-count">
              {[5, 10, 15, 20].map((count) => (
                <button
                  type="button"
                  key={count}
                  className={questionCount === count ? "active" : ""}
                  onClick={() => setQuestionCount(count)}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="interview-start-button"
            disabled={starting}
            onClick={startInterview}
          >
            {starting ? "Starting Session..." : "Start Practice Session"}
            <FaArrowRight />
          </button>
        </article>

        <article className="interview-benefits-card">
          <div className="interview-section-heading">
            <div>
              <span>Why Practice with Takshvi?</span>
              <p>Built for serious interview preparation.</p>
            </div>
          </div>

          <div className="interview-benefits-content">
            <div className="interview-benefit-list">
              <div>
                <span><FaRobot /></span>
                <div>
                  <strong>AI-Powered Interviewing</strong>
                  <p>
                    Takshvi understands your responses and gives
                    meaningful feedback.
                  </p>
                </div>
              </div>

              <div>
                <span><FaUsers /></span>
                <div>
                  <strong>Build Real Confidence</strong>
                  <p>
                    Simulate real interview situations and reduce anxiety.
                  </p>
                </div>
              </div>

              <div>
                <span><HiOutlineChartBar /></span>
                <div>
                  <strong>Performance Analytics</strong>
                  <p>
                    Track technical, communication, and confidence scores.
                  </p>
                </div>
              </div>

              <div>
                <span><FaClock /></span>
                <div>
                  <strong>Available Anytime</strong>
                  <p>
                    Practice whenever you want, as often as you need.
                  </p>
                </div>
              </div>
            </div>

            <div className="interview-takshvi-visual">
              <div className="interview-robot-head">
                <span className="eye left" />
                <span className="eye right" />
                <span className="smile" />
              </div>

              <div className="interview-robot-body" />
              <div className="interview-robot-shadow" />
            </div>
          </div>
        </article>
      </section>

      <section className="interview-quick-actions">
        <button
          type="button"
          onClick={() =>
            (window.location.href = "/interview-history")
          }
        >
          <FaHistory />
          <span>
            <strong>Interview History</strong>
            <small>Review previous sessions and reports.</small>
          </span>
          <FaArrowRight />
        </button>

        <button
          type="button"
          onClick={() =>
            (window.location.href = "/question-bank")
          }
        >
          <FaFileAlt />
          <span>
            <strong>Question Bank</strong>
            <small>Explore role-based interview questions.</small>
          </span>
          <FaArrowRight />
        </button>

        <button
          type="button"
          onClick={() =>
            (window.location.href = "/interview-reports")
          }
        >
          <FaChartLine />
          <span>
            <strong>My Reports</strong>
            <small>Track your improvement over time.</small>
          </span>
          <FaArrowRight />
        </button>
      </section>
    </main>
  );
}