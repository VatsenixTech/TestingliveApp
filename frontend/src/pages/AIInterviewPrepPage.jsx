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
    const localUser =
      localStorage.getItem("user");

    const sessionUser =
      sessionStorage.getItem("user");

    return JSON.parse(
      localUser ||
        sessionUser ||
        "{}"
    );
  } catch (error) {
    console.error(
      "Unable to read stored user:",
      error
    );

    return {};
  }
};

const getCandidateId = () => {
  const user = getStoredUser();

  const candidateId =
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
    localStorage.getItem(
      "candidateId"
    ) ||
    sessionStorage.getItem(
      "candidateId"
    ) ||
    "";

  return String(
    candidateId || ""
  ).trim();
};

const clamp = (value, min = 0, max = 100) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(max, Math.max(min, number));
};

export default function AIInterviewPrepPage() {
  const [activeView, setActiveView] = useState("main");
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

  if (activeView === "history") {
    return (
      <InterviewHistoryView
        onBack={() => setActiveView("main")}
        onOpenReports={() => setActiveView("reports")}
      />
    );
  }

  if (activeView === "questions") {
    return (
      <QuestionBankView
        onBack={() => setActiveView("main")}
      />
    );
  }

  if (activeView === "reports") {
    return (
      <InterviewReportsView
        onBack={() => setActiveView("main")}
      />
    );
  }

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
              onClick={() => setActiveView("history")}
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
          onClick={() => setActiveView("history")}
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
          onClick={() => setActiveView("questions")}
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
          onClick={() => setActiveView("reports")}
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



/* =========================================================
   SHARED API HELPER
========================================================= */

async function interviewApiGet(
  path,
  options = {}
) {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem(
      "authToken"
    ) ||
    localStorage.getItem(
      "accessToken"
    ) ||
    sessionStorage.getItem(
      "token"
    ) ||
    "";

  const candidateId =
    getCandidateId();

  if (
    !candidateId &&
    options.requireCandidate !== false
  ) {
    throw new Error(
      "Candidate ID is missing from your login session. Please log out and log in again."
    );
  }

  const separator =
    path.includes("?")
      ? "&"
      : "?";

  const finalPath =
    candidateId
      ? `${path}${separator}candidateId=${encodeURIComponent(
          candidateId
        )}`
      : path;

  console.log(
    "Interview API request:",
    `${API_BASE_URL}${finalPath}`
  );

  const response = await fetch(
    `${API_BASE_URL}${finalPath}`,
    {
      method: "GET",

      headers: {
        Accept:
          "application/json",

        "Content-Type":
          "application/json",

        ...(token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : {}),
      },
    }
  );

  const result =
    await response
      .json()
      .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result?.message ||
        result?.error ||
        `Request failed with status ${response.status}`
    );
  }

  return result?.data ?? result;
}
function AIInterviewReportsPage() {
  const [
    searchParams,
  ] = useSearchParams();

  const navigate =
    useNavigate();

  const sessionId =
    searchParams.get(
      "sessionId"
    );

  const [reports, setReports] =
    useState([]);

  const [
    selectedReport,
    setSelectedReport,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let active = true;

    const loadReports =
      async () => {
        try {
          setLoading(true);
          setError("");

          const endpoint =
            sessionId
              ? `/api/interview-prep/reports/${encodeURIComponent(
                  sessionId
                )}`
              : "/api/interview-prep/reports";

          const result =
            await interviewApiGet(
              endpoint
            );

          const reportList =
            Array.isArray(result)
              ? result
              : result?.reports
                ? result.reports
                : result?.items
                  ? result.items
                  : result
                    ? [result]
                    : [];

          if (active) {
            setReports(
              reportList
            );

            setSelectedReport(
              reportList[0] ||
                null
            );
          }
        } catch (
          requestError
        ) {
          if (active) {
            setError(
              requestError.message ||
                "Unable to load interview reports."
            );
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

    loadReports();

    return () => {
      active = false;
    };
  }, [sessionId]);

  const averageOverall =
    reports.length > 0
      ? Math.round(
          reports.reduce(
            (
              total,
              report
            ) =>
              total +
              Number(
                report.overallScore ??
                  report.averageScore ??
                  0
              ),
            0
          ) / reports.length
        )
      : 0;

  const bestScore =
    reports.length > 0
      ? Math.max(
          ...reports.map(
            (report) =>
              Number(
                report.overallScore ??
                  report.averageScore ??
                  0
              )
          )
        )
      : 0;

  return (
    <main className="premium-report-page">
      <section className="premium-report-hero">
        <div className="premium-report-heading">
          <button
            type="button"
            className="premium-back-button"
            onClick={() =>
              navigate(
                "/ai-interview-prep"
              )
            }
          >
            <FaArrowLeft />
            Back to Interview Prep
          </button>

          <span className="premium-report-eyebrow">
            <HiOutlineSparkles />
            AI Interview Intelligence
          </span>

          <h1>
            Interview Performance
            Reports
          </h1>

          <p>
            Review genuine interview
            results, communication
            performance, technical
            strength and improvement
            recommendations.
          </p>
        </div>

        <div className="premium-report-summary">
          <article>
            <span>
              Completed Reports
            </span>

            <strong>
              {reports.length}
            </strong>

            <small>
              Saved interview
              assessments
            </small>
          </article>

          <article>
            <span>
              Average Score
            </span>

            <strong>
              {averageOverall}%
            </strong>

            <small>
              Across all completed
              sessions
            </small>
          </article>

          <article>
            <span>
              Best Performance
            </span>

            <strong>
              {bestScore}%
            </strong>

            <small>
              Highest recorded score
            </small>
          </article>
        </div>
      </section>

      {loading && (
        <div className="premium-report-state">
          <div className="premium-report-loader" />

          <h2>
            Loading your reports
          </h2>

          <p>
            Retrieving real interview
            results from the backend.
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="premium-report-state premium-report-error">
          <FaChartLine />

          <h2>
            Unable to load reports
          </h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
          >
            Try Again
          </button>
        </div>
      )}

      {!loading &&
        !error &&
        reports.length === 0 && (
          <div className="premium-report-state premium-report-empty">
            <div className="premium-empty-icon">
              <FaFileAlt />
            </div>

            <h2>
              No completed reports yet
            </h2>

            <p>
              Complete an AI interview
              to generate your first
              detailed performance
              report.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/ai-interview-prep"
                )
              }
            >
              Start AI Interview
              <FaArrowRight />
            </button>
          </div>
        )}

      {!loading &&
        !error &&
        reports.length > 0 && (
          <section className="premium-report-layout">
            <aside className="premium-report-sidebar">
              <div className="premium-report-sidebar-heading">
                <div>
                  <span>
                    Interview History
                  </span>

                  <small>
                    {
                      reports.length
                    }{" "}
                    completed
                  </small>
                </div>
              </div>

              <div className="premium-report-session-list">
                {reports.map(
                  (
                    report,
                    index
                  ) => {
                    const reportId =
                      report._id ||
                      report.sessionId ||
                      index;

                    const active =
                      selectedReport ===
                      report;

                    return (
                      <button
                        type="button"
                        key={
                          reportId
                        }
                        className={
                          active
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          setSelectedReport(
                            report
                          )
                        }
                      >
                        <div className="premium-session-icon">
                          <FaRobot />
                        </div>

                        <div className="premium-session-info">
                          <strong>
                            {report.role ||
                              "AI Interview"}
                          </strong>

                          <span>
                            {report.interviewType ||
                              "Mixed"}{" "}
                            ·{" "}
                            {formatReportDate(
                              report.completedAt ||
                                report.createdAt
                            )}
                          </span>
                        </div>

                        <div className="premium-session-score">
                          {Math.round(
                            Number(
                              report.overallScore ??
                                report.averageScore ??
                                0
                            )
                          )}
                          %
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </aside>

            {selectedReport && (
              <ReportDetails
                report={
                  selectedReport
                }
              />
            )}
          </section>
        )}
    </main>
  );
}
function ReportDetails({
  report,
}) {
  const overallScore =
    Math.round(
      Number(
        report.overallScore ??
          report.averageScore ??
          0
      )
    );

  const technicalScore =
    report.technicalScore;

  const communicationScore =
    report.communicationScore;

  const confidenceScore =
    report.confidenceScore;

  const strongAreas =
    report.strongAreas || [];

  const improvementAreas =
    report.improvementAreas ||
    [];

  const summary =
    report.reportSummary ||
    report.feedback ||
    "Your detailed feedback will appear after the interview evaluation is completed.";

  return (
    <div className="premium-report-details">
      <div className="premium-report-main-card">
        <div className="premium-report-card-heading">
          <div>
            <span>
              Performance Overview
            </span>

            <h2>
              {report.role ||
                "AI Interview Report"}
            </h2>

            <p>
              {report.interviewType ||
                "Mixed"}{" "}
              Interview ·{" "}
              {report.experienceLevel ||
                "Experience level not set"}
            </p>
          </div>

          <div className="premium-report-status">
            <span />
            Completed
          </div>
        </div>

        <div className="premium-score-overview">
          <div
            className="premium-score-ring"
            style={{
              "--report-score":
                `${overallScore * 3.6}deg`,
            }}
          >
            <div>
              <strong>
                {overallScore}%
              </strong>

              <span>
                Overall Score
              </span>
            </div>
          </div>

          <div className="premium-score-message">
            <span>
              Performance Level
            </span>

            <h3>
              {getPerformanceLabel(
                overallScore
              )}
            </h3>

            <p>
              {getPerformanceMessage(
                overallScore
              )}
            </p>

            <div className="premium-report-meta">
              <div>
                <span>
                  Questions
                </span>

                <strong>
                  {report.questionsAttempted ||
                    0}
                  /
                  {report.questionCount ||
                    0}
                </strong>
              </div>

              <div>
                <span>
                  Completed
                </span>

                <strong>
                  {formatReportDate(
                    report.completedAt
                  )}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="premium-metric-grid">
        <MetricCard
          title="Technical Knowledge"
          score={
            technicalScore
          }
          icon={<FaBrain />}
          description="Role concepts, problem solving and practical knowledge."
        />

        <MetricCard
          title="Communication"
          score={
            communicationScore
          }
          icon={
            <HiOutlineChatAlt2 />
          }
          description="Clarity, structure and completeness of your answers."
        />

        <MetricCard
          title="Confidence"
          score={
            confidenceScore
          }
          icon={<FaMicrophone />}
          description="Consistency, participation and interview engagement."
        />
      </div>

      <div className="premium-report-insights-grid">
        <article className="premium-insight-card premium-summary-card">
          <div className="premium-insight-heading">
            <span>
              <FaRobot />
            </span>

            <div>
              <h3>
                AI Evaluation
                Summary
              </h3>

              <p>
                Analysis of your
                interview performance
              </p>
            </div>
          </div>

          <div className="premium-summary-content">
            {summary}
          </div>
        </article>

        <article className="premium-insight-card">
          <div className="premium-insight-heading">
            <span className="success">
              <FaStar />
            </span>

            <div>
              <h3>
                Strong Areas
              </h3>

              <p>
                Skills demonstrated
                during the interview
              </p>
            </div>
          </div>

          <div className="premium-chip-list">
            {strongAreas.length >
            0 ? (
              strongAreas.map(
                (area) => (
                  <span
                    key={area}
                    className="premium-chip success"
                  >
                    {area}
                  </span>
                )
              )
            ) : (
              <p className="premium-no-data">
                More interview evidence
                is required to identify
                strong areas.
              </p>
            )}
          </div>
        </article>

        <article className="premium-insight-card">
          <div className="premium-insight-heading">
            <span className="warning">
              <FaChartLine />
            </span>

            <div>
              <h3>
                Improvement Plan
              </h3>

              <p>
                Recommended areas for
                your next practice
              </p>
            </div>
          </div>

          <div className="premium-improvement-list">
            {improvementAreas.length >
            0 ? (
              improvementAreas.map(
                (
                  area,
                  index
                ) => (
                  <div key={area}>
                    <span>
                      {index + 1}
                    </span>

                    <p>{area}</p>
                  </div>
                )
              )
            ) : (
              <p className="premium-no-data">
                No improvement
                recommendations are
                available yet.
              </p>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  score,
  icon,
  description,
}) {
  const safeScore =
    score === null ||
    score === undefined
      ? null
      : Math.round(
          Number(score)
        );

  return (
    <article className="premium-metric-card">
      <div className="premium-metric-icon">
        {icon}
      </div>

      <div className="premium-metric-content">
        <div>
          <span>{title}</span>

          <strong>
            {safeScore === null
              ? "—"
              : `${safeScore}%`}
          </strong>
        </div>

        <div className="premium-metric-track">
          <span
            style={{
              width:
                safeScore === null
                  ? "0%"
                  : `${safeScore}%`,
            }}
          />
        </div>

        <p>{description}</p>
      </div>
    </article>
  );
}

function getPerformanceLabel(
  score
) {
  if (score >= 85) {
    return "Excellent";
  }

  if (score >= 70) {
    return "Strong Performance";
  }

  if (score >= 55) {
    return "Developing Well";
  }

  if (score > 0) {
    return "Needs More Practice";
  }

  return "Evaluation Pending";
}

function getPerformanceMessage(
  score
) {
  if (score >= 85) {
    return "You demonstrated excellent interview readiness with strong communication and role knowledge.";
  }

  if (score >= 70) {
    return "You showed good interview preparation. Focus on the improvement plan to reach an excellent level.";
  }

  if (score >= 55) {
    return "You have a good foundation, but your answers need more structure, detail and measurable results.";
  }

  if (score > 0) {
    return "Continue practicing complete answers and use practical project examples to improve your performance.";
  }

  return "Complete a longer interview session to receive a reliable performance evaluation.";
}

function formatReportDate(
  value
) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
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
function InterviewSubPageHeader({
  title,
  description,
  onBack,
}) {
  return (
    <div className="interview-subpage-header">
      <div>
        <span className="interview-subpage-eyebrow">
          AI INTERVIEW PREP
        </span>

        <h1>{title}</h1>

        <p>{description}</p>
      </div>

      <button
        type="button"
        className="interview-back-button"
        onClick={onBack}
      >
        Back to Interview Prep
      </button>
    </div>
  );
}

/* =========================================================
   REAL INTERVIEW HISTORY
========================================================= */

function InterviewHistoryView({
  onBack,
  onOpenReports,
}) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadHistory() {
      try {
        setLoading(true);
        setError("");

        const result = await interviewApiGet(
          "/api/interview-prep/sessions"
        );

        const items = Array.isArray(result)
          ? result
          : result?.sessions ||
            result?.history ||
            result?.items ||
            [];

        if (mounted) {
          setSessions(items);
        }
      } catch (requestError) {
        if (mounted) {
          setError(
            requestError.message ||
              "Unable to load interview history."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="interview-prep-page">
      <section className="interview-subpage-card">
        <InterviewSubPageHeader
          title="Interview History"
          description="Review all completed and active interview sessions."
          onBack={onBack}
        />

        {loading && (
          <div className="interview-page-state">
            Loading interview history...
          </div>
        )}

        {!loading && error && (
          <div className="interview-page-state error">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          sessions.length === 0 && (
            <div className="interview-page-state">
              <h2>No interview sessions yet</h2>
              <p>
                Complete your first AI interview and it will
                appear here automatically.
              </p>

              <button
                type="button"
                className="interview-primary-action"
                onClick={onBack}
              >
                Start an Interview
              </button>
            </div>
          )}

        {!loading &&
          !error &&
          sessions.length > 0 && (
            <div className="interview-record-grid">
              {sessions.map((session, index) => {
                const sessionId =
                  session?._id ||
                  session?.id ||
                  session?.sessionId ||
                  index;

                return (
                  <article
                    className="interview-record-card"
                    key={sessionId}
                  >
                    <span className="interview-status-badge">
                      {session?.status || "Completed"}
                    </span>

                    <h2>
                      {session?.role ||
                        "Interview Session"}
                    </h2>

                    <p>
                      {session?.interviewType || "Mixed"} ·{" "}
                      {session?.experienceLevel ||
                        "Experience not set"}
                    </p>

                    <strong>
                      {session?.averageScore == null
                        ? "Report pending"
                        : `${Math.round(
                            Number(
                              session.averageScore
                            )
                          )}%`}
                    </strong>

                    <button
                      type="button"
                      className="interview-primary-action"
                      onClick={onOpenReports}
                    >
                      View Report
                    </button>
                  </article>
                );
              })}
            </div>
          )}
      </section>
    </main>
  );
}

/* =========================================================
   REAL QUESTION BANK
========================================================= */

function QuestionBankView({ onBack }) {
  const [role, setRole] = useState("Data Engineer");
  const [type, setType] = useState("Technical");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadQuestions() {
      try {
        setLoading(true);
        setError("");

        const result = await interviewApiGet(
          `/api/interview-prep/questions?role=${encodeURIComponent(
            role
          )}&type=${encodeURIComponent(type)}`
        );

        const items = Array.isArray(result)
          ? result
          : result?.questions ||
            result?.items ||
            [];

        if (mounted) {
          setQuestions(items);
        }
      } catch (requestError) {
        if (mounted) {
          setError(
            requestError.message ||
              "Unable to load interview questions."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadQuestions();

    return () => {
      mounted = false;
    };
  }, [role, type]);

  return (
    <main className="interview-prep-page">
      <section className="interview-subpage-card">
        <InterviewSubPageHeader
          title="Question Bank"
          description="Practice real role-based questions returned by your backend."
          onBack={onBack}
        />

        <div className="interview-question-filters">
          <label>
            <span>Interview Role</span>

            <select
              value={role}
              onChange={(event) =>
                setRole(event.target.value)
              }
            >
              {ROLE_OPTIONS.map((option) => (
                <option
                  value={option}
                  key={option}
                >
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Interview Type</span>

            <select
              value={type}
              onChange={(event) =>
                setType(event.target.value)
              }
            >
              <option value="Technical">
                Technical
              </option>

              <option value="HR">HR</option>

              <option value="Mixed">Mixed</option>
            </select>
          </label>
        </div>

        {loading && (
          <div className="interview-page-state">
            Loading interview questions...
          </div>
        )}

        {!loading && error && (
          <div className="interview-page-state error">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          questions.length === 0 && (
            <div className="interview-page-state">
              No questions were returned by the backend.
            </div>
          )}

        {!loading &&
          !error &&
          questions.length > 0 && (
            <div className="interview-question-list">
              {questions.map((item, index) => (
                <article
                  key={
                    item?._id ||
                    item?.id ||
                    index
                  }
                >
                  <span>
                    Question {index + 1}
                  </span>

                  <h2>
                    {item?.question ||
                      item?.text ||
                      item?.title ||
                      "Interview question"}
                  </h2>

                  {item?.answerGuide && (
                    <p>{item.answerGuide}</p>
                  )}
                </article>
              ))}
            </div>
          )}
      </section>
    </main>
  );
}

/* =========================================================
   REAL REPORTS PAGE
========================================================= */

function InterviewReportsView({ onBack }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadReports() {
      try {
        setLoading(true);
        setError("");

        const result = await interviewApiGet(
          "/api/interview-prep/reports"
        );

        const items = Array.isArray(result)
          ? result
          : result?.reports ||
            result?.items ||
            [];

        if (mounted) {
          setReports(items);
        }
      } catch (requestError) {
        if (mounted) {
          setError(
            requestError.message ||
              "Unable to load interview reports."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadReports();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="interview-prep-page">
      <section className="interview-subpage-card">
        <InterviewSubPageHeader
          title="My Reports"
          description="Review real interview scores and feedback saved by your backend."
          onBack={onBack}
        />

        {loading && (
          <div className="interview-page-state">
            Loading interview reports...
          </div>
        )}

        {!loading && error && (
          <div className="interview-page-state error">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          reports.length === 0 && (
            <div className="interview-page-state">
              No interview reports are available yet.
            </div>
          )}

        {!loading &&
          !error &&
          reports.length > 0 && (
            <div className="interview-report-grid">
              {reports.map((report, index) => (
                <article
                  key={
                    report?._id ||
                    report?.id ||
                    index
                  }
                >
                  <h2>
                    {report?.role ||
                      report?.title ||
                      "Interview Report"}
                  </h2>

                  {[
                    [
                      "Overall",
                      report?.overallScore ??
                        report?.averageScore ??
                        0,
                    ],
                    [
                      "Technical",
                      report?.technicalScore ?? 0,
                    ],
                    [
                      "Communication",
                      report?.communicationScore ??
                        0,
                    ],
                    [
                      "Confidence",
                      report?.confidenceScore ??
                        0,
                    ],
                  ].map(([label, value]) => (
                    <div
                      className="interview-score-row"
                      key={label}
                    >
                      <span>{label}</span>

                      <strong>
                        {Math.round(
                          Number(value) || 0
                        )}
                        %
                      </strong>
                    </div>
                  ))}

                  {report?.feedback && (
                    <p>{report.feedback}</p>
                  )}
                </article>
              ))}
            </div>
          )}
      </section>
    </main>
  );
}