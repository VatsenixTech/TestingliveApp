import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaArrowRight,
  FaBrain,
  FaChartLine,
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

const INTERVIEW_DURATION_MINUTES = 30;
const INTERNAL_MAX_QUESTIONS = 20;

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

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

const clamp = (value, min = 0, max = 100) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(max, Math.max(min, number));
};

export default function AIInterviewPrepPage() {
  const [role, setRole] = useState("Data Engineer");
  const [experienceLevel, setExperienceLevel] = useState("2-5 Years");
  const [interviewType, setInterviewType] = useState("Technical");

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
    if (starting) {
      return;
    }

    setError("");

    /*
     * Perform only synchronous validation before opening the window.
     * The new window must be created directly from the button click,
     * before any fetch/await, otherwise Chrome may block it.
     */
    if (!role.trim()) {
      setError("Please select an interview role.");
      return;
    }

    if (!experienceLevel) {
      setError("Please select your experience level.");
      return;
    }

    if (!token) {
      setError(
        "Your login session is missing. Please log in again."
      );
      return;
    }

    const savedUser = getStoredUser();

    const candidateId =
      savedUser?.candidateId ||
      savedUser?._id ||
      savedUser?.id;

    if (!candidateId) {
      setError(
        "Candidate ID was not found. Please log out and log in again."
      );
      return;
    }

    /*
     * IMPORTANT:
     * Open the interview window immediately before the API request.
     */
    const interviewWindow = window.open(
      "",
      "_blank"
    );

    if (!interviewWindow) {
      setError(
        "The interview window was blocked by your browser. Please allow pop-ups for localhost:5173 and try again."
      );
      return;
    }

    const popupOpenedAt = Date.now();
    const minimumLoadingTime = 1400;

    try {
      interviewWindow.focus();
    } catch {
      // Some browsers do not allow programmatic focus.
    }

    /*
     * Display a premium loading screen in the new interview window
     * while the backend creates the session.
     */
    interviewWindow.document.open();
    interviewWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Preparing AI Interview</title>

          <style>
            * {
              box-sizing: border-box;
            }

            html,
            body {
              margin: 0;
              min-height: 100%;
            }

            body {
              min-height: 100vh;
              padding: 24px;

              display: flex;
              align-items: center;
              justify-content: center;

              color: #ffffff;

              font-family:
                Inter,
                ui-sans-serif,
                system-ui,
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                sans-serif;

              background:
                radial-gradient(
                  circle at 16% 12%,
                  rgba(105, 218, 255, 0.25),
                  transparent 31%
                ),
                radial-gradient(
                  circle at 85% 10%,
                  rgba(181, 91, 255, 0.28),
                  transparent 34%
                ),
                linear-gradient(
                  135deg,
                  #071642,
                  #1d43be 55%,
                  #7236e9
                );
            }

            .preparing-card {
              width: min(440px, 100%);
              padding: 48px 34px;

              text-align: center;

              background:
                rgba(255, 255, 255, 0.13);

              border:
                1px solid
                rgba(255, 255, 255, 0.25);

              border-radius: 28px;

              box-shadow:
                0 32px 90px
                rgba(0, 0, 0, 0.3);

              backdrop-filter: blur(24px);
            }

            .robot {
              width: 88px;
              height: 88px;
              margin: 0 auto 22px;

              display: grid;
              place-items: center;

              color: #72f3f7;
              background:
                rgba(7, 22, 66, 0.84);

              border:
                7px solid
                rgba(255, 255, 255, 0.14);

              border-radius: 26px;

              font-size: 42px;

              box-shadow:
                0 18px 40px
                rgba(0, 0, 0, 0.2);
            }

            .loader {
              width: 50px;
              height: 50px;
              margin: 0 auto 22px;

              border:
                5px solid
                rgba(255, 255, 255, 0.24);

              border-top-color: #ffffff;
              border-radius: 50%;

              animation:
                interviewLoader
                780ms
                linear
                infinite;
            }

            h1 {
              margin: 0 0 12px;

              font-size: 27px;
              line-height: 1.2;
            }

            p {
              margin: 0;

              color:
                rgba(255, 255, 255, 0.8);

              font-size: 14px;
              line-height: 1.7;
            }

            .details {
              margin-top: 22px;
              padding: 13px 15px;

              color:
                rgba(255, 255, 255, 0.88);

              background:
                rgba(255, 255, 255, 0.09);

              border:
                1px solid
                rgba(255, 255, 255, 0.13);

              border-radius: 14px;

              font-size: 12px;
              font-weight: 700;
            }

            @keyframes interviewLoader {
              to {
                transform: rotate(360deg);
              }
            }
          </style>
        </head>

        <body>
          <main class="preparing-card">
            <div class="robot">🤖</div>
            <div class="loader"></div>

            <h1>Preparing Your Interview</h1>

            <p>
              Takshvi is creating your personalized 30-minute
              ${interviewType} interview for the ${role} role.
            </p>

            <div class="details">
              Please keep this window open.
            </div>
          </main>
        </body>
      </html>
    `);
    interviewWindow.document.close();

    try {
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
            candidateId,
            role,
            experienceLevel,
            interviewType,
            durationMinutes:
              INTERVIEW_DURATION_MINUTES,

            /*
             * Kept internally because the existing MongoDB
             * schema requires questionCount.
             */
            questionCount:
              INTERNAL_MAX_QUESTIONS,
          }),
        }
      );

      const result = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to start interview session."
        );
      }

      const session =
        result.session ||
        result.data?.session ||
        result.data ||
        result;

      const sessionId =
        session?.sessionId ||
        session?._id ||
        session?.id;

      if (!sessionId) {
        throw new Error(
          "Interview session was created, but no session ID was returned."
        );
      }

      const activeSession = {
        ...session,
        sessionId,
        role,
        experienceLevel,
        interviewType,
        durationMinutes:
          INTERVIEW_DURATION_MINUTES,
      };

      /*
       * Save to both stores:
       * - sessionStorage supports the current preparation tab.
       * - localStorage is available to the newly opened interview tab.
       */
      sessionStorage.setItem(
        "activeInterviewSession",
        JSON.stringify(activeSession)
      );

      localStorage.setItem(
        "activeInterviewSession",
        JSON.stringify(activeSession)
      );

      localStorage.setItem(
        "activeInterviewSessionId",
        String(sessionId)
      );

      const interviewUrl =
        `${window.location.origin}` +
        `/ai-interview-session/` +
        `${encodeURIComponent(sessionId)}`;

      /*
       * Keep the preparation screen visible briefly so the user can
       * clearly see that the new interview window has opened.
       */
      const elapsedLoadingTime =
        Date.now() - popupOpenedAt;

      const remainingLoadingTime =
        Math.max(
          0,
          minimumLoadingTime - elapsedLoadingTime
        );

      if (remainingLoadingTime > 0) {
        await new Promise((resolve) => {
          window.setTimeout(
            resolve,
            remainingLoadingTime
          );
        });
      }

      if (
        !interviewWindow ||
        interviewWindow.closed
      ) {
        throw new Error(
          "The interview window was closed before the session finished preparing."
        );
      }

      /*
       * Replace the loading screen with the real interview page.
       */
      interviewWindow.location.replace(
        interviewUrl
      );

      try {
        interviewWindow.focus();
      } catch {
        // Some browsers do not allow programmatic focus.
      }
    } catch (requestError) {
      console.error(
        "Start interview error:",
        requestError
      );

      setError(
        requestError.message ||
          "Unable to start interview session."
      );

      if (
        interviewWindow &&
        !interviewWindow.closed
      ) {
        interviewWindow.document.open();
        interviewWindow.document.write(`
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
              />
              <title>Interview Error</title>

              <style>
                body {
                  min-height: 100vh;
                  margin: 0;
                  padding: 24px;

                  display: grid;
                  place-content: center;

                  color: #17214a;
                  background: #f4f7ff;

                  font-family:
                    Inter,
                    Arial,
                    sans-serif;

                  text-align: center;
                }

                .error-card {
                  width: min(460px, 100%);
                  padding: 34px;

                  background: #ffffff;
                  border:
                    1px solid
                    rgba(206, 48, 78, 0.2);

                  border-radius: 22px;

                  box-shadow:
                    0 24px 60px
                    rgba(48, 65, 130, 0.14);
                }

                h1 {
                  margin: 0 0 12px;
                  color: #a91f3c;
                }

                p {
                  color: #6e7797;
                  line-height: 1.65;
                }

                button {
                  min-height: 44px;
                  margin-top: 12px;
                  padding: 0 18px;

                  color: #ffffff;
                  background: #5e4cf0;

                  border: 0;
                  border-radius: 12px;

                  font-weight: 800;
                  cursor: pointer;
                }
              </style>
            </head>

            <body>
              <div class="error-card">
                <h1>Unable to Start Interview</h1>

                <p>
                  ${String(
                    requestError.message ||
                      "Unable to create the interview session."
                  ).replace(/[<>&"]/g, "")}
                </p>

                <button onclick="window.close()">
                  Close Window
                </button>
              </div>
            </body>
          </html>
        `);

        interviewWindow.document.close();
      }
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
            Join a continuous 30-minute AI interview with Takshvi.
            Answer naturally, receive follow-up questions, and get a
            detailed report after the session.
          </p>

          <div className="interview-feature-list">
            <div>
              <span><FaBrain /></span>
              <div>
                <strong>Adaptive Role-Based Interview</strong>
                <p>Questions change based on your role and answers.</p>
              </div>
            </div>

            <div>
              <span><HiOutlineChatAlt2 /></span>
              <div>
                <strong>Natural Follow-up Questions</strong>
                <p>Takshvi continues the conversation like a recruiter.</p>
              </div>
            </div>

            <div>
              <span><FaMicrophone /></span>
              <div>
                <strong>Voice &amp; Text Support</strong>
                <p>Speak naturally or type when voice is unavailable.</p>
              </div>
            </div>

            <div>
              <span><FaFileAlt /></span>
              <div>
                <strong>Detailed Performance Report</strong>
                <p>Review technical, communication, and confidence scores.</p>
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
              onClick={() => window.location.assign("/interview-history")}
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
              <span>Start a 30-Minute AI Interview</span>
              <p>
                Takshvi will continuously ask role-based and follow-up
                questions throughout the session.
              </p>
            </div>
          </div>

          {error && (
            <div className="interview-error" role="alert">
              {error}
            </div>
          )}

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
                  text: "Role concepts and scenarios",
                  icon: <FaBrain />,
                },
                {
                  value: "HR",
                  label: "HR",
                  text: "Behavioral and workplace",
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

          <div className="interview-duration-banner">
            <FaClock />
            <div>
              <strong>30-minute continuous interview</strong>
              <span>
                Includes introductions, adaptive questions, follow-ups,
                and final performance analysis.
              </span>
            </div>
          </div>

          <button
            type="button"
            className="interview-start-button"
            disabled={starting}
            onClick={startInterview}
          >
            {starting
              ? "Preparing Your Interview..."
              : "Enter AI Interview Room"}
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
                    meaningful follow-up questions.
                  </p>
                </div>
              </div>

              <div>
                <span><FaUsers /></span>
                <div>
                  <strong>Build Real Confidence</strong>
                  <p>
                    Simulate a complete recruiter conversation for
                    thirty minutes.
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
                  <strong>Real Interview Duration</strong>
                  <p>
                    Stay in one continuous interview until the timer ends.
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
          onClick={() => window.location.assign("/interview-history")}
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
          onClick={() => window.location.assign("/question-bank")}
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
          onClick={() => window.location.assign("/interview-reports")}
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