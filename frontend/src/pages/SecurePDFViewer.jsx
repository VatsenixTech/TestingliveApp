import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  FaArrowRight,
  FaBriefcase,
  FaChartLine,
  FaCheckCircle,
  FaDownload,
  FaExclamationTriangle,
  FaFileAlt,
  FaGraduationCap,
  FaLightbulb,
  FaRedo,
  FaSearch,
  FaStar,
} from "react-icons/fa";

import {
  HiOutlineSparkles,
  HiOutlineTrendingUp,
} from "react-icons/hi";


import "./SkillAnalyzerPage.css";


/* =========================================================
   CONFIGURATION
========================================================= */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";


/* =========================================================
   AUTH HELPERS
========================================================= */

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}


function getStoredUser() {
  try {
    const raw =
      localStorage.getItem("user") ||
      localStorage.getItem("candidate");

    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}


/* =========================================================
   API HELPER
========================================================= */

async function apiRequest(path, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,

    headers: {
      ...(options.body instanceof FormData
        ? {}
        : {
            "Content-Type": "application/json",
          }),

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...(options.headers || {}),
    },
  });

  const contentType =
    response.headers.get("content-type") || "";

  const data = contentType.includes("application/json")
    ? await response.json()
    : {
        message: await response.text(),
      };

  if (!response.ok) {
    const requestError = new Error(
      data.message ||
        data.error ||
        `Request failed with status ${response.status}`
    );

    requestError.status = response.status;
    throw requestError;
  }

  return data;
}


/* =========================================================
   NORMALIZATION HELPERS
========================================================= */

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}


function safeNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}


function clamp(value, minimum = 0, maximum = 100) {
  return Math.min(
    maximum,
    Math.max(minimum, safeNumber(value))
  );
}


function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}


function getCandidateName(user, profile) {
  return (
    profile?.name ||
    profile?.fullName ||
    user?.name ||
    user?.fullName ||
    "Candidate"
  );
}


/* =========================================================
   NORMALIZE BACKEND RESPONSE
========================================================= */

function normalizeAnalyzerData(payload = {}) {
  const data =
    payload.data ||
    payload.analysis ||
    payload.result ||
    payload;

  return {
    overallScore: clamp(
      data.overallScore ??
        data.score ??
        data.skillScore
    ),

    status:
      data.status ||
      data.scoreLabel ||
      "Analysis pending",

    summary:
      data.summary ||
      data.aiInsight ||
      data.insight ||
      "",

    skillsAnalyzed: safeNumber(
      data.skillsAnalyzed ??
        safeArray(data.currentSkills).length
    ),

    strongSkills: safeArray(
      data.strongSkills ||
        data.strengths
    ),

    improvementSkills: safeArray(
      data.improvementSkills ||
        data.skillGaps ||
        data.gaps
    ),

    categoryBreakdown: safeArray(
      data.categoryBreakdown ||
        data.skillBreakdown
    ),

    recommendations: safeArray(
      data.recommendations ||
        data.nextSteps
    ),

    careerMatches: safeArray(
      data.careerMatches ||
        data.roleMatches
    ),

    recentAnalyses: safeArray(
      data.recentAnalyses ||
        data.history
    ),

    roadmap:
      data.roadmap ||
      null,

    lastAnalyzedAt:
      data.lastAnalyzedAt ||
      data.updatedAt ||
      null,
  };
}


/* =========================================================
   SCORE RING
========================================================= */

function ScoreRing({ value }) {
  const score = clamp(value);

  return (
    <div
      className="sa-score-ring"
      style={{
        "--score": `${score * 3.6}deg`,
      }}
    >
      <div className="sa-score-ring-inner">
        <strong>{Math.round(score)}%</strong>

        <span>
          {score >= 80
            ? "Excellent"
            : score >= 60
            ? "Good"
            : score >= 40
            ? "Developing"
            : "Needs Work"}
        </span>
      </div>
    </div>
  );
}


/* =========================================================
   PROGRESS BAR
========================================================= */

function ProgressBar({ value }) {
  return (
    <div className="sa-progress-track">
      <span
        className="sa-progress-fill"
        style={{
          width: `${clamp(value)}%`,
        }}
      />
    </div>
  );
}


/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  icon,
  title,
  description,
}) {
  return (
    <div className="sa-empty-state">
      <div className="sa-empty-icon">
        {icon}
      </div>

      <strong>{title}</strong>

      <p>{description}</p>
    </div>
  );
}


/* =========================================================
   MAIN PAGE
========================================================= */

export default function SkillAnalyzerPage() {
  const navigate = useNavigate();

  const storedUser = useMemo(
    () => getStoredUser(),
    []
  );


  /* =======================================================
     STATE
  ======================================================= */

  const [profile, setProfile] = useState(null);

  const [analysis, setAnalysis] = useState(
    normalizeAnalyzerData()
  );

  const [role, setRole] = useState("");

  const [skillsInput, setSkillsInput] =
    useState("");

  const [searchValue, setSearchValue] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [analyzing, setAnalyzing] =
    useState(false);

  const [exporting, setExporting] =
    useState(false);

  const [error, setError] =
    useState("");


  /* =======================================================
     COMPUTED USER DATA
  ======================================================= */

  const candidateName = getCandidateName(
    storedUser,
    profile
  );

  /* =======================================================
     LOAD PROFILE
  ======================================================= */

  const loadProfile = useCallback(async () => {
    try {
      const response = await apiRequest(
        "/api/candidates/me"
      );

      const candidate =
        response.candidate ||
        response.data ||
        response;

      setProfile(candidate);

      setRole(
        candidate.currentRole ||
          candidate.role ||
          candidate.jobTitle ||
          ""
      );

      const profileSkills = safeArray(
        candidate.skills
      )
        .map((skill) =>
          typeof skill === "string"
            ? skill
            : skill.name
        )
        .filter(Boolean);

      setSkillsInput(profileSkills.join(", "));
    } catch (requestError) {
      console.error(
        "Profile loading error:",
        requestError
      );
    }
  }, []);


  /* =======================================================
     LOAD LATEST ANALYSIS
  ======================================================= */

  const loadLatestAnalysis =
    useCallback(async () => {
      try {
        const response = await apiRequest(
          "/api/skill-analyzer/me"
        );

        setAnalysis(
          normalizeAnalyzerData(response)
        );
      } catch (requestError) {
        /*
          404 means candidate has never analyzed skills.
          Do not show fake values.
        */

        if (requestError.status !== 404) {
          console.error(
            "Skill analyzer loading error:",
            requestError
          );
        }
      }
    }, []);


  /* =======================================================
     INITIAL PAGE LOAD
  ======================================================= */

  useEffect(() => {
    async function initializePage() {
      setLoading(true);
      setError("");

      await Promise.all([
        loadProfile(),
        loadLatestAnalysis(),
      ]);

      setLoading(false);
    }

    initializePage();
  }, [loadProfile, loadLatestAnalysis]);


  /* =======================================================
     ANALYZE SKILLS
  ======================================================= */

  async function handleAnalyzeSkills() {
    const skills = skillsInput
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (!role.trim()) {
      setError(
        "Please enter or select your target role."
      );

      return;
    }

    if (skills.length === 0) {
      setError(
        "Please add at least one current skill."
      );

      return;
    }

    try {
      setAnalyzing(true);
      setError("");

      const response = await apiRequest(
        "/api/skill-analyzer/analyze",
        {
          method: "POST",

          body: JSON.stringify({
            targetRole: role.trim(),
            skills,
          }),
        }
      );

      setAnalysis(
        normalizeAnalyzerData(response)
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setAnalyzing(false);
    }
  }


  /* =======================================================
     CREATE ROADMAP
  ======================================================= */

  async function handleGenerateRoadmap() {
    try {
      setError("");

      await apiRequest(
        "/api/skill-analyzer/roadmap",
        {
          method: "POST",

          body: JSON.stringify({
            targetRole: role,

            skillGaps:
              analysis.improvementSkills,
          }),
        }
      );

      navigate("/career-roadmap");
    } catch (requestError) {
      setError(requestError.message);
    }
  }


  /* =======================================================
     LEARN SKILL
  ======================================================= */

  function handleLearnSkill(skill) {
    const skillName =
      typeof skill === "string"
        ? skill
        : skill.name ||
          skill.skill ||
          skill.title ||
          "Skill";

    navigate(
      `/learning-path?skill=${encodeURIComponent(
        skillName
      )}`
    );
  }


  /* =======================================================
     VIEW MATCHING JOBS
  ======================================================= */

  function handleMatchingJobs(roleName) {
    const selectedRole =
      roleName || role;

    navigate(
      `/jobs?search=${encodeURIComponent(
        selectedRole
      )}`
    );
  }


  /* =======================================================
     EXPORT REPORT
  ======================================================= */

  async function handleExportReport() {
    try {
      setExporting(true);
      setError("");

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/api/skill-analyzer/report`,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      );

      if (!response.ok) {
        const result = await response
          .json()
          .catch(() => ({}));

        throw new Error(
          result.message ||
            "Unable to export report."
        );
      }

      const blob = await response.blob();

      const url =
        window.URL.createObjectURL(blob);

      const anchor =
        document.createElement("a");

      anchor.href = url;

      anchor.download =
        "skill-analysis-report.pdf";

      document.body.appendChild(anchor);

      anchor.click();

      anchor.remove();

      window.URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setExporting(false);
    }
  }


  /* =======================================================
     FILTERED SKILLS
  ======================================================= */

  const filteredStrongSkills = useMemo(() => {
    const query =
      searchValue.trim().toLowerCase();

    if (!query) {
      return analysis.strongSkills;
    }

    return analysis.strongSkills.filter(
      (skill) => {
        const name =
          typeof skill === "string"
            ? skill
            : skill.name || skill.skill || "";

        return name
          .toLowerCase()
          .includes(query);
      }
    );
  }, [analysis.strongSkills, searchValue]);


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="sa-loading">
        <div className="sa-loader" />

        <strong>
          Loading your skill intelligence...
        </strong>
      </main>
    );
  }


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="sa-page">
      <main className="sa-main">

          {/* ===============================================
              PAGE HEADER
          =============================================== */}

          <section className="sa-page-header">

            <div>
              <span className="sa-eyebrow">
                <HiOutlineSparkles />

                AI SKILL INTELLIGENCE
              </span>

              <h1>
                Skill Analyzer
              </h1>

              <p>
                Understand your current strengths,
                identify skill gaps and build a
                personalized career roadmap from your
                verified profile data.
              </p>
            </div>


            <div className="sa-header-actions">

              <div className="sa-search-box">
                <FaSearch />

                <input
                  type="search"
                  placeholder="Search analyzed skills..."
                  value={searchValue}
                  onChange={(event) =>
                    setSearchValue(
                      event.target.value
                    )
                  }
                />
              </div>


              <button
                type="button"
                className="sa-secondary-button"
                onClick={loadLatestAnalysis}
              >
                <FaRedo />

                Refresh
              </button>


              <button
                type="button"
                className="sa-primary-button"
                onClick={handleExportReport}
                disabled={exporting}
              >
                <FaDownload />

                {exporting
                  ? "Exporting..."
                  : "Export Report"}
              </button>

            </div>

          </section>


          {/* ===============================================
              ERROR MESSAGE
          =============================================== */}

          {error && (
            <div className="sa-error-banner">
              <FaExclamationTriangle />

              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
              >
                ×
              </button>
            </div>
          )}


          {/* ===============================================
              HERO
          =============================================== */}

          <section className="sa-hero-card">

            <div className="sa-hero-score">

              <ScoreRing
                value={analysis.overallScore}
              />

            </div>


            <div className="sa-hero-content">

              <span className="sa-status-badge">
                AI Career Intelligence
              </span>

              <h2>
                {analysis.overallScore > 0
                  ? `${candidateName}, here is your current career readiness.`
                  : `${candidateName}, analyze your skills to unlock your career intelligence.`}
              </h2>

              <p>
                {analysis.summary ||
                  "Run your first analysis to compare your current skills with your target role requirements."}
              </p>


              <div className="sa-hero-buttons">

                <button
                  type="button"
                  className="sa-primary-button"
                  onClick={() =>
                    document
                      .getElementById(
                        "skill-analysis-form"
                      )
                      ?.scrollIntoView({
                        behavior: "smooth",
                      })
                  }
                >
                  Analyze Skill Gap

                  <FaArrowRight />
                </button>


                <button
                  type="button"
                  className="sa-dark-button"
                  onClick={handleGenerateRoadmap}
                  disabled={
                    analysis.improvementSkills
                      .length === 0
                  }
                >
                  AI Roadmap

                  <FaArrowRight />
                </button>

              </div>


              {analysis.lastAnalyzedAt && (
                <span className="sa-last-updated">
                  Last analyzed{" "}
                  {formatDate(
                    analysis.lastAnalyzedAt
                  )}
                </span>
              )}

            </div>


            <div className="sa-hero-metrics">

              <MetricCard
                icon={<FaChartLine />}
                label="Skills Analyzed"
                value={analysis.skillsAnalyzed}
              />

              <MetricCard
                icon={<FaCheckCircle />}
                label="Strong Skills"
                value={
                  analysis.strongSkills.length
                }
              />

              <MetricCard
                icon={
                  <FaExclamationTriangle />
                }
                label="Skill Gaps"
                value={
                  analysis.improvementSkills
                    .length
                }
              />

              <MetricCard
                icon={<HiOutlineTrendingUp />}
                label="Career Match"
                value={`${Math.round(
                  analysis.overallScore
                )}%`}
              />

            </div>

          </section>


          {/* ===============================================
              ANALYSIS WORKSPACE
          =============================================== */}

          <section className="sa-workspace-grid">

            <article
              id="skill-analysis-form"
              className="sa-card sa-analysis-card"
            >

              <div className="sa-card-header">

                <div>
                  <span className="sa-card-kicker">
                    CAREER PROFILE
                  </span>

                  <h2>
                    Analyze Your Current Skills
                  </h2>

                  <p>
                    Compare your actual skills with
                    your target role.
                  </p>
                </div>

                <FaGraduationCap />

              </div>


              <label className="sa-field">
                <span>Target Role</span>

                <input
                  type="text"
                  value={role}
                  placeholder="Example: Data Engineer"
                  onChange={(event) =>
                    setRole(event.target.value)
                  }
                />
              </label>


              <label className="sa-field">
                <span>Current Skills</span>

                <textarea
                  rows="7"
                  value={skillsInput}
                  placeholder="Python, PySpark, SQL, AWS..."
                  onChange={(event) =>
                    setSkillsInput(
                      event.target.value
                    )
                  }
                />
              </label>


              <button
                type="button"
                className="sa-primary-button sa-full-button"
                onClick={handleAnalyzeSkills}
                disabled={analyzing}
              >
                <HiOutlineSparkles />

                {analyzing
                  ? "Analyzing your skills..."
                  : "Analyze Skill Gap"}

                {!analyzing && <FaArrowRight />}
              </button>

            </article>


            {/* =============================================
                SKILL BREAKDOWN
            ============================================= */}

            <article className="sa-card">

              <div className="sa-card-header">

                <div>
                  <span className="sa-card-kicker">
                    PERFORMANCE
                  </span>

                  <h2>
                    Skill Strength Matrix
                  </h2>

                  <p>
                    Scores calculated from your latest
                    analysis.
                  </p>
                </div>

                <FaChartLine />

              </div>


              {analysis.categoryBreakdown.length ===
              0 ? (

                <EmptyState
                  icon={<FaChartLine />}
                  title="No skill analysis yet"
                  description="Analyze your skills to generate your real skill strength matrix."
                />

              ) : (

                <div className="sa-breakdown-list">

                  {analysis.categoryBreakdown.map(
                    (item, index) => {

                      const name =
                        item.name ||
                        item.skill ||
                        item.category ||
                        "Skill";

                      const score = clamp(
                        item.score ??
                          item.value ??
                          item.percentage
                      );

                      return (
                        <div
                          className="sa-breakdown-item"
                          key={
                            item._id ||
                            `${name}-${index}`
                          }
                        >

                          <div>
                            <strong>{name}</strong>

                            <span>
                              {Math.round(score)}%
                            </span>
                          </div>

                          <ProgressBar
                            value={score}
                          />

                        </div>
                      );
                    }
                  )}

                </div>

              )}

            </article>


            {/* =============================================
                TOP STRENGTHS
            ============================================= */}

            <article className="sa-card">

              <div className="sa-card-header">

                <div>
                  <span className="sa-card-kicker">
                    VERIFIED STRENGTHS
                  </span>

                  <h2>
                    Top Strengths
                  </h2>

                  <p>
                    Skills where your profile shows
                    stronger readiness.
                  </p>
                </div>

                <FaStar />

              </div>


              {filteredStrongSkills.length === 0 ? (

                <EmptyState
                  icon={<FaStar />}
                  title="No strengths available"
                  description="Complete an analysis to identify your strongest skills."
                />

              ) : (

                <div className="sa-strength-list">

                  {filteredStrongSkills.map(
                    (skill, index) => {

                      const name =
                        typeof skill === "string"
                          ? skill
                          : skill.name ||
                            skill.skill;

                      const score =
                        typeof skill === "object"
                          ? clamp(
                              skill.score ??
                                skill.value
                            )
                          : null;

                      return (
                        <div
                          className="sa-strength-item"
                          key={`${name}-${index}`}
                        >

                          <div className="sa-strength-icon">
                            <FaCheckCircle />
                          </div>

                          <div>
                            <strong>{name}</strong>

                            {score !== null && (
                              <span>
                                {Math.round(score)}%
                                proficiency
                              </span>
                            )}
                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              )}

            </article>

          </section>


          {/* ===============================================
              RECOMMENDATIONS + SKILL GAPS
          =============================================== */}

          <section className="sa-insight-grid">

            <article className="sa-card">

              <div className="sa-card-header">

                <div>
                  <span className="sa-card-kicker">
                    AI ROADMAP
                  </span>

                  <h2>
                    Recommended Next Steps
                  </h2>

                  <p>
                    Prioritized learning actions from
                    your analysis.
                  </p>
                </div>

                <FaLightbulb />

              </div>


              {analysis.recommendations.length ===
              0 ? (

                <EmptyState
                  icon={<FaLightbulb />}
                  title="No recommendations yet"
                  description="Run an analysis to generate personalized career recommendations."
                />

              ) : (

                <div className="sa-recommendation-list">

                  {analysis.recommendations.map(
                    (item, index) => {

                      const title =
                        item.title ||
                        item.skill ||
                        item.name ||
                        "Recommendation";

                      return (
                        <button
                          type="button"
                          className="sa-recommendation-card"
                          key={
                            item._id ||
                            `${title}-${index}`
                          }
                          onClick={() =>
                            handleLearnSkill(item)
                          }
                        >

                          <div className="sa-recommendation-number">
                            {String(
                              index + 1
                            ).padStart(2, "0")}
                          </div>

                          <div>
                            <strong>{title}</strong>

                            <p>
                              {item.description ||
                                item.reason ||
                                "Open your personalized learning path."}
                            </p>

                            <span>
                              {item.priority ||
                                "Recommended"}
                            </span>
                          </div>

                          <FaArrowRight />

                        </button>
                      );
                    }
                  )}

                </div>

              )}

            </article>


            <article className="sa-card">

              <div className="sa-card-header">

                <div>
                  <span className="sa-card-kicker">
                    OPPORTUNITY GAPS
                  </span>

                  <h2>
                    Skill Gap Analysis
                  </h2>

                  <p>
                    Missing or developing skills for
                    your target role.
                  </p>
                </div>

                <FaExclamationTriangle />

              </div>


              {analysis.improvementSkills.length ===
              0 ? (

                <EmptyState
                  icon={<FaExclamationTriangle />}
                  title="No skill gaps available"
                  description="Analyze your current skills to discover your real development opportunities."
                />

              ) : (

                <div className="sa-gap-list">

                  {analysis.improvementSkills.map(
                    (skill, index) => {

                      const name =
                        typeof skill === "string"
                          ? skill
                          : skill.name ||
                            skill.skill;

                      const priority =
                        typeof skill === "object"
                          ? skill.priority ||
                            skill.level ||
                            "Required"
                          : "Required";

                      return (
                        <div
                          className="sa-gap-item"
                          key={`${name}-${index}`}
                        >

                          <div>
                            <strong>{name}</strong>

                            <span>{priority}</span>
                          </div>


                          <button
                            type="button"
                            onClick={() =>
                              handleLearnSkill(skill)
                            }
                          >
                            Learn

                            <FaArrowRight />
                          </button>

                        </div>
                      );
                    }
                  )}

                </div>

              )}

            </article>

          </section>


          {/* ===============================================
              CAREER MATCHES
          =============================================== */}

          <section className="sa-bottom-grid">

            <article className="sa-card">

              <div className="sa-card-header">

                <div>
                  <span className="sa-card-kicker">
                    CAREER OPPORTUNITIES
                  </span>

                  <h2>
                    Career Matches
                  </h2>

                  <p>
                    Roles aligned with your current
                    skill profile.
                  </p>
                </div>

                <FaBriefcase />

              </div>


              {analysis.careerMatches.length === 0 ? (

                <EmptyState
                  icon={<FaBriefcase />}
                  title="No career matches yet"
                  description="Career matches will appear after your skill analysis."
                />

              ) : (

                <div className="sa-career-list">

                  {analysis.careerMatches.map(
                    (match, index) => {

                      const roleName =
                        match.role ||
                        match.name ||
                        match.title ||
                        "Career Role";

                      const score = clamp(
                        match.score ??
                          match.matchPercentage
                      );

                      return (
                        <button
                          type="button"
                          className="sa-career-card"
                          key={
                            match._id ||
                            `${roleName}-${index}`
                          }
                          onClick={() =>
                            handleMatchingJobs(
                              roleName
                            )
                          }
                        >

                          <div>
                            <strong>
                              {roleName}
                            </strong>

                            <span>
                              {Math.round(score)}%
                              match
                            </span>
                          </div>

                          <ProgressBar
                            value={score}
                          />

                          <small>
                            View matching jobs
                            <FaArrowRight />
                          </small>

                        </button>
                      );
                    }
                  )}

                </div>

              )}

            </article>


            {/* =============================================
                AI INSIGHT
            ============================================= */}

            <article className="sa-card sa-ai-insight-card">

              <div className="sa-ai-icon">
                <HiOutlineSparkles />
              </div>

              <span className="sa-card-kicker">
                AI CAREER INSIGHT
              </span>

              <h2>
                Personalized Guidance
              </h2>

              <p>
                {analysis.summary ||
                  "Complete your first analysis to receive personalized AI career guidance based on your actual profile and skills."}
              </p>


              <button
                type="button"
                className="sa-primary-button"
                onClick={handleGenerateRoadmap}
                disabled={
                  analysis.improvementSkills
                    .length === 0
                }
              >
                Build My Roadmap

                <FaArrowRight />
              </button>

            </article>


            {/* =============================================
                RECENT ANALYSES
            ============================================= */}

            <article className="sa-card">

              <div className="sa-card-header">

                <div>
                  <span className="sa-card-kicker">
                    HISTORY
                  </span>

                  <h2>
                    Recent Analyses
                  </h2>

                  <p>
                    Review your previous skill
                    assessments.
                  </p>
                </div>

                <FaFileAlt />

              </div>


              {analysis.recentAnalyses.length === 0 ? (

                <EmptyState
                  icon={<FaFileAlt />}
                  title="No previous analyses"
                  description="Your completed skill analyses will appear here."
                />

              ) : (

                <div className="sa-history-list">

                  {analysis.recentAnalyses
                    .slice(0, 5)
                    .map((item, index) => (

                      <button
                        type="button"
                        className="sa-history-item"
                        key={
                          item._id ||
                          index
                        }
                        onClick={() =>
                          navigate(
                            `/skill-analyzer/history/${
                              item._id
                            }`
                          )
                        }
                      >

                        <div>
                          <strong>
                            {item.targetRole ||
                              item.role ||
                              "Skill Analysis"}
                          </strong>

                          <span>
                            {formatDate(
                              item.createdAt ||
                                item.date
                            )}
                          </span>
                        </div>

                        <strong>
                          {Math.round(
                            clamp(
                              item.overallScore ??
                                item.score
                            )
                          )}
                          %
                        </strong>

                      </button>

                    ))}

                </div>

              )}

            </article>

          </section>

      </main>
    </div>
  );
}


/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
  icon,
  label,
  value,
}) {
  return (
    <div className="sa-metric-card">

      <div className="sa-metric-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>

        <strong>{value}</strong>
      </div>

    </div>
  );}