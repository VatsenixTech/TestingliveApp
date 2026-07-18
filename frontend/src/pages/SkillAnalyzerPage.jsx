import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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
  FaTrophy,
} from "react-icons/fa";

import {
  HiOutlineSparkles,
  HiOutlineTrendingUp,
} from "react-icons/hi";

import "./SkillAnalyzerPage.css";

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
    const raw =
      localStorage.getItem("user") ||
      localStorage.getItem("candidate");

    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getCandidateId(user = {}) {
  return (
    user.candidateId ||
    user._id ||
    user.id ||
    null
  );
}

async function apiRequest(path, options = {}) {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,
      headers: {
        ...(options.body instanceof FormData
          ? {}
          : {
              "Content-Type":
                "application/json",
            }),
        ...(token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : {}),
        ...(options.headers || {}),
      },
    }
  );

  const contentType =
    response.headers.get("content-type") || "";

  const data = contentType.includes(
    "application/json"
  )
    ? await response.json()
    : {
        message: await response.text(),
      };

  if (!response.ok) {
    const error = new Error(
      data.message ||
        data.error ||
        `Request failed with status ${response.status}`
    );

    error.status = response.status;
    throw error;
  }

  return data;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function clamp(
  value,
  minimum = 0,
  maximum = 100
) {
  return Math.min(
    maximum,
    Math.max(
      minimum,
      safeNumber(value)
    )
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

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function normalizeAnalyzerData(
  payload = {}
) {
  const data =
    payload.data ||
    payload.analysis ||
    payload.result ||
    payload;

  return {
    id:
      data._id ||
      data.id ||
      null,

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
        safeArray(
          data.currentSkills
        ).length
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
      data.createdAt ||
      null,
  };
}

function ScoreRing({
  value,
  compact = false,
}) {
  const score = clamp(value);

  return (
    <div
      className={
        compact
          ? "sa-score-ring compact"
          : "sa-score-ring"
      }
      style={{
        "--score":
          `${score * 3.6}deg`,
      }}
    >
      <div className="sa-score-ring-inner">
        <strong>
          {Math.round(score)}%
        </strong>

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

function ProgressBar({ value }) {
  return (
    <div className="sa-progress-track">
      <span
        className="sa-progress-fill"
        style={{
          width:
            `${clamp(value)}%`,
        }}
      />
    </div>
  );
}

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

function MetricCard({
  icon,
  label,
  value,
  helper,
  tone = "blue",
}) {
  return (
    <article
      className={`sa-kpi-card ${tone}`}
    >
      <div className="sa-kpi-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {helper && (
          <small>{helper}</small>
        )}
      </div>
    </article>
  );
}

export default function SkillAnalyzerPage() {
  const storedUser = useMemo(
    () => getStoredUser(),
    []
  );

  const candidateId = useMemo(
    () => getCandidateId(storedUser),
    [storedUser]
  );

  const [profile, setProfile] =
    useState(null);

  const [analysis, setAnalysis] =
    useState(
      normalizeAnalyzerData()
    );

  const [role, setRole] =
    useState("");

  const [
    skillsInput,
    setSkillsInput,
  ] = useState("");

  const [
    searchValue,
    setSearchValue,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    analyzing,
    setAnalyzing,
  ] = useState(false);

  const [
    exporting,
    setExporting,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const candidateName =
    profile?.name ||
    profile?.fullName ||
    storedUser?.name ||
    storedUser?.fullName ||
    "Candidate";

  const hasAnalysis =
    analysis.skillsAnalyzed > 0 ||
    analysis.overallScore > 0 ||
    analysis.strongSkills.length > 0 ||
    analysis.improvementSkills.length > 0;

  const candidateQuery = candidateId
    ? `?candidateId=${encodeURIComponent(candidateId)}`
    : "";

  const loadProfile =
    useCallback(async () => {
      if (!candidateId) {
        return;
      }

      try {
        const response =
          await apiRequest(
            `/api/candidates/me${candidateQuery}`
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

        const profileSkills =
          safeArray(
            candidate.skills
          )
            .map((skill) =>
              typeof skill === "string"
                ? skill
                : skill.name
            )
            .filter(Boolean);

        setSkillsInput(
          profileSkills.join(", ")
        );
      } catch (requestError) {
        console.error(
          "Profile loading error:",
          requestError
        );
      }
    }, [candidateId, candidateQuery]);

  const loadLatestAnalysis =
    useCallback(async () => {
      if (!candidateId) {
        throw new Error(
          "Candidate ID is missing. Please log out and log in again."
        );
      }

      try {
        const response =
          await apiRequest(
            `/api/skill-analyzer/me${candidateQuery}`
          );

        setAnalysis(
          normalizeAnalyzerData(
            response
          )
        );
      } catch (requestError) {
        if (
          requestError.status !== 404
        ) {
          throw requestError;
        }

        setAnalysis(
          normalizeAnalyzerData()
        );
      }
    }, [candidateId, candidateQuery]);

  useEffect(() => {
    async function initializePage() {
      setLoading(true);
      setError("");

      try {
        if (!candidateId) {
          throw new Error(
            "Candidate ID is missing. Please log out and log in again."
          );
        }

        await Promise.all([
          loadProfile(),
          loadLatestAnalysis(),
        ]);
      } catch (requestError) {
        setError(
          requestError.message
        );
      } finally {
        setLoading(false);
      }
    }

    initializePage();
  }, [
    candidateId,
    loadProfile,
    loadLatestAnalysis,
  ]);

  async function handleRefresh() {
    try {
      setRefreshing(true);
      setError("");

      await Promise.all([
        loadProfile(),
        loadLatestAnalysis(),
      ]);
    } catch (requestError) {
      setError(
        requestError.message
      );
    } finally {
      setRefreshing(false);
    }
  }

  async function handleAnalyzeSkills() {
    const skills = skillsInput
      .split(",")
      .map((skill) =>
        skill.trim()
      )
      .filter(Boolean);

    if (!candidateId) {
      setError(
        "Candidate ID is missing. Please log out and log in again."
      );
      return;
    }

    if (!role.trim()) {
      setError(
        "Please enter your target role."
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

      const response =
        await apiRequest(
          "/api/skill-analyzer/analyze",
          {
            method: "POST",
            body: JSON.stringify({
              candidateId,
              targetRole:
                role.trim(),
              skills,
            }),
          }
        );

      setAnalysis(
        normalizeAnalyzerData(
          response
        )
      );
    } catch (requestError) {
      setError(
        requestError.message
      );
    } finally {
      setAnalyzing(false);
    }
  }

  
  async function handleGenerateRoadmap() {
  if (!candidateId) {
    setError(
      "Candidate ID is missing. Please log out and log in again."
    );
    return;
  }

  if (
    analysis.improvementSkills
      .length === 0
  ) {
    setError(
      "Run a skill analysis first so the roadmap can use your real skill gaps."
    );
    return;
  }

  try {
    setError("");

    const response =
      await apiRequest(
        "/api/skill-analyzer/roadmap",
        {
          method: "POST",
          body: JSON.stringify({
            candidateId,
            targetRole: role,
            skillGaps:
              analysis.improvementSkills,
            analysisId:
              analysis.id,
          }),
        }
      );

    const roadmapId =
      response.roadmap?._id ||
      response.data?._id ||
      response._id ||
      "";

    if (roadmapId) {
      localStorage.setItem(
        "activeRoadmapId",
        roadmapId
      );
    }

    window.history.pushState(
      {},
      "",
      "/career-roadmap"
    );

    window.dispatchEvent(
      new PopStateEvent("popstate")
    );
  } catch (requestError) {
    console.error(
      "Generate roadmap error:",
      requestError
    );

    setError(
      requestError.message ||
        "Unable to generate roadmap."
    );
  }
}
  function handleLearnSkill(skill) {
    const skillName =
      typeof skill === "string"
        ? skill
        : skill.name ||
          skill.skill ||
          skill.title ||
          "Skill";

    window.location.assign(
      `/learning-path?skill=${encodeURIComponent(
        skillName
      )}`
    );
  }

  function handleMatchingJobs(
    roleName
  ) {
    const selectedRole =
      roleName || role;

    if (!selectedRole) {
      setError(
        "No matched role is available yet."
      );
      return;
    }

    window.location.assign(
      `/jobs?search=${encodeURIComponent(
        selectedRole
      )}`
    );
  }

  function handleOpenHistory(item) {
    const analysisId =
      item?._id || item?.id;

    if (!analysisId) {
      setError(
        "Analysis details are unavailable."
      );
      return;
    }

    window.location.assign(
      `/skill-analyzer/history/${analysisId}`
    );
  }

  async function handleExportReport() {
    if (!candidateId) {
      setError(
        "Candidate ID is missing. Please log out and log in again."
      );
      return;
    }

    if (!hasAnalysis) {
      setError(
        "Run a skill analysis before exporting a report."
      );
      return;
    }

    try {
      setExporting(true);
      setError("");

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/api/skill-analyzer/report${candidateQuery}`,
        {
          headers: token
            ? {
                Authorization:
                  `Bearer ${token}`,
              }
            : {},
        }
      );

      if (!response.ok) {
        const result =
          await response
            .json()
            .catch(() => ({}));

        throw new Error(
          result.message ||
            "Unable to export report."
        );
      }

      const blob =
        await response.blob();

      const url =
        window.URL.createObjectURL(
          blob
        );

      const anchor =
        document.createElement("a");

      anchor.href = url;
      anchor.download =
        "skill-analysis-report.pdf";

      document.body.appendChild(
        anchor
      );

      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(
        url
      );
    } catch (requestError) {
      setError(
        requestError.message
      );
    } finally {
      setExporting(false);
    }
  }

  const filteredStrongSkills =
    useMemo(() => {
      const query =
        searchValue
          .trim()
          .toLowerCase();

      if (!query) {
        return analysis.strongSkills;
      }

      return analysis.strongSkills.filter(
        (skill) => {
          const name =
            typeof skill === "string"
              ? skill
              : skill.name ||
                skill.skill ||
                "";

          return name
            .toLowerCase()
            .includes(query);
        }
      );
    }, [
      analysis.strongSkills,
      searchValue,
    ]);

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

  return (
    <div className="sa-page">
      <main className="sa-main">
        <section className="sa-dashboard-header">
          <div>
            <span className="sa-eyebrow">
              <HiOutlineSparkles />
              AI SKILL INTELLIGENCE
            </span>

            <h1>
              Hello, {candidateName} 👋
            </h1>

            <p>
              Your verified skill intelligence,
              career readiness, and personalized
              growth plan.
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
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <FaRedo />
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <button
              type="button"
              className="sa-primary-button"
              onClick={handleExportReport}
              disabled={
                exporting ||
                !hasAnalysis
              }
            >
              <FaDownload />
              {exporting
                ? "Exporting..."
                : "Export Report"}
            </button>
          </div>
        </section>

        {error && (
          <div className="sa-error-banner">
            <FaExclamationTriangle />
            <span>{error}</span>
            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              ×
            </button>
          </div>
        )}

        <section className="sa-kpi-grid">
          <MetricCard
            tone="purple"
            icon={<FaChartLine />}
            label="Overall Skill Score"
            value={`${Math.round(
              analysis.overallScore
            )}%`}
            helper={
              analysis.status ||
              "No analysis yet"
            }
          />

          <MetricCard
            tone="blue"
            icon={<FaGraduationCap />}
            label="Skills Analyzed"
            value={
              analysis.skillsAnalyzed
            }
            helper={
              analysis.lastAnalyzedAt
                ? `Updated ${formatDate(
                    analysis.lastAnalyzedAt
                  )}`
                : "Run your first analysis"
            }
          />

          <MetricCard
            tone="green"
            icon={<FaCheckCircle />}
            label="Strong Skills"
            value={
              analysis.strongSkills
                .length
            }
            helper="Verified strengths"
          />

          <MetricCard
            tone="orange"
            icon={
              <FaExclamationTriangle />
            }
            label="Skill Gaps"
            value={
              analysis
                .improvementSkills
                .length
            }
            helper="Development priorities"
          />

          <MetricCard
            tone="teal"
            icon={<FaTrophy />}
            label="Career Matches"
            value={
              analysis.careerMatches
                .length
            }
            helper="Matched opportunities"
          />
        </section>

        <section className="sa-analytics-grid">
          <article className="sa-card sa-score-overview">
            <div className="sa-card-header">
              <div>
                <span className="sa-card-kicker">
                  SKILL SCORE OVERVIEW
                </span>
                <h2>Career Readiness</h2>
                <p>
                  Your latest verified skill analysis.
                </p>
              </div>
              <FaChartLine />
            </div>

            <div className="sa-score-overview-body">
              <ScoreRing
                value={
                  analysis.overallScore
                }
              />

              <div className="sa-score-summary">
                {analysis.categoryBreakdown
                  .slice(0, 4)
                  .map(
                    (item, index) => {
                      const name =
                        item.name ||
                        item.skill ||
                        item.category ||
                        `Category ${index + 1}`;

                      const score =
                        clamp(
                          item.score ??
                            item.value ??
                            item.percentage
                        );

                      return (
                        <div
                          key={`${name}-${index}`}
                          className="sa-score-summary-item"
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

                {analysis.categoryBreakdown
                  .length === 0 && (
                  <EmptyState
                    icon={<FaChartLine />}
                    title="No score breakdown yet"
                    description="Run an analysis to generate category-level scores."
                  />
                )}
              </div>
            </div>

            <div className="sa-ai-summary">
              <HiOutlineSparkles />
              <p>
                {analysis.summary ||
                  "Your AI-generated career insight will appear here after the first analysis."}
              </p>
            </div>
          </article>

          <article className="sa-card sa-category-card">
            <div className="sa-card-header">
              <div>
                <span className="sa-card-kicker">
                  SKILL CATEGORY BREAKDOWN
                </span>
                <h2>Strength Matrix</h2>
                <p>
                  Performance by skill category.
                </p>
              </div>
              <HiOutlineTrendingUp />
            </div>

            {analysis.categoryBreakdown
              .length === 0 ? (
              <EmptyState
                icon={
                  <HiOutlineTrendingUp />
                }
                title="No category data yet"
                description="Complete your first skill analysis to unlock the strength matrix."
              />
            ) : (
              <div className="sa-category-list">
                {analysis.categoryBreakdown.map(
                  (item, index) => {
                    const name =
                      item.name ||
                      item.skill ||
                      item.category ||
                      "Skill Category";

                    const score =
                      clamp(
                        item.score ??
                          item.value ??
                          item.percentage
                      );

                    return (
                      <div
                        className="sa-category-row"
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

          <div className="sa-side-stack">
            <article className="sa-card">
              <div className="sa-card-header compact">
                <div>
                  <span className="sa-card-kicker">
                    VERIFIED STRENGTHS
                  </span>
                  <h2>Top Strengths</h2>
                </div>
                <FaStar />
              </div>

              {filteredStrongSkills
                .length === 0 ? (
                <EmptyState
                  icon={<FaStar />}
                  title="No strengths available"
                  description="Run an analysis to identify verified strengths."
                />
              ) : (
                <div className="sa-strength-list">
                  {filteredStrongSkills
                    .slice(0, 5)
                    .map(
                      (
                        skill,
                        index
                      ) => {
                        const name =
                          typeof skill === "string"
                            ? skill
                            : skill.name ||
                              skill.skill ||
                              "Skill";

                        const score =
                          typeof skill === "object"
                            ? clamp(
                                skill.score ??
                                  skill.value
                              )
                            : null;

                        return (
                          <button
                            type="button"
                            className="sa-strength-row"
                            key={`${name}-${index}`}
                            onClick={() =>
                              handleLearnSkill(skill)
                            }
                          >
                            <span className="sa-strength-icon">
                              <FaCheckCircle />
                            </span>

                            <div>
                              <strong>{name}</strong>
                              <small>
                                {score !== null
                                  ? `${Math.round(score)}% proficiency`
                                  : "Verified skill"}
                              </small>
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
              <div className="sa-card-header compact">
                <div>
                  <span className="sa-card-kicker">
                    HISTORY
                  </span>
                  <h2>Recent Analysis</h2>
                </div>
                <FaFileAlt />
              </div>

              {analysis.recentAnalyses
                .length === 0 ? (
                <EmptyState
                  icon={<FaFileAlt />}
                  title="No previous analyses"
                  description="Your completed assessments will appear here."
                />
              ) : (
                <div className="sa-history-list">
                  {analysis.recentAnalyses
                    .slice(0, 3)
                    .map(
                      (
                        item,
                        index
                      ) => (
                        <button
                          type="button"
                          className="sa-history-row"
                          key={
                            item._id ||
                            item.id ||
                            index
                          }
                          onClick={() =>
                            handleOpenHistory(item)
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

                          <ScoreRing
                            compact
                            value={
                              item.overallScore ??
                              item.score
                            }
                          />
                        </button>
                      )
                    )}
                </div>
              )}
            </article>
          </div>
        </section>

        <section className="sa-lower-grid">
          <article className="sa-card">
            <div className="sa-card-header compact">
              <div>
                <span className="sa-card-kicker">
                  AI ROADMAP
                </span>
                <h2>
                  Recommended Next Steps
                </h2>
              </div>
              <FaLightbulb />
            </div>

            {analysis.recommendations
              .length === 0 ? (
              <EmptyState
                icon={<FaLightbulb />}
                title="No recommendations yet"
                description="Run an analysis to generate personalized learning actions."
              />
            ) : (
              <div className="sa-recommendation-list">
                {analysis.recommendations
                  .slice(0, 4)
                  .map(
                    (
                      item,
                      index
                    ) => {
                      const title =
                        item.title ||
                        item.skill ||
                        item.name ||
                        "Recommendation";

                      return (
                        <button
                          type="button"
                          className="sa-recommendation-row"
                          key={
                            item._id ||
                            `${title}-${index}`
                          }
                          onClick={() =>
                            handleLearnSkill(item)
                          }
                        >
                          <span className="sa-recommendation-number">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <div>
                            <strong>{title}</strong>
                            <p>
                              {item.description ||
                                item.reason ||
                                "Open your personalized learning path."}
                            </p>
                          </div>

                          <span className="sa-priority-badge">
                            {item.priority ||
                              "Recommended"}
                          </span>

                          <FaArrowRight />
                        </button>
                      );
                    }
                  )}
              </div>
            )}
          </article>

          <article className="sa-card">
            <div className="sa-card-header compact">
              <div>
                <span className="sa-card-kicker">
                  CAREER OPPORTUNITIES
                </span>
                <h2>Career Matches</h2>
              </div>
              <FaBriefcase />
            </div>

            {analysis.careerMatches
              .length === 0 ? (
              <EmptyState
                icon={<FaBriefcase />}
                title="No career matches yet"
                description="Career matches will appear after your skill analysis."
              />
            ) : (
              <div className="sa-career-list">
                {analysis.careerMatches
                  .slice(0, 5)
                  .map(
                    (
                      match,
                      index
                    ) => {
                      const roleName =
                        match.role ||
                        match.name ||
                        match.title ||
                        "Career Role";

                      const score =
                        clamp(
                          match.score ??
                            match.matchPercentage
                        );

                      return (
                        <button
                          type="button"
                          className="sa-career-row"
                          key={
                            match._id ||
                            `${roleName}-${index}`
                          }
                          onClick={() =>
                            handleMatchingJobs(roleName)
                          }
                        >
                          <span className="sa-career-icon">
                            <FaBriefcase />
                          </span>

                          <div>
                            <strong>{roleName}</strong>
                            <small>
                              View matching jobs
                            </small>
                          </div>

                          <span className="sa-match-badge">
                            {Math.round(score)}% Match
                          </span>
                        </button>
                      );
                    }
                  )}
              </div>
            )}
          </article>
        </section>

        <section
          id="skill-analysis-form"
          className="sa-card sa-analysis-panel"
        >
          <div className="sa-analysis-copy">
            <span className="sa-card-kicker">
              RUN NEW ANALYSIS
            </span>

            <h2>
              Analyze your verified profile
              against a target role
            </h2>

            <p>
              Enter your real current skills.
              Results are calculated from
              role requirements stored in your
              backend.
            </p>
          </div>

          <div className="sa-analysis-fields">
            <label className="sa-field">
              <span>Target Role</span>
              <input
                type="text"
                value={role}
                placeholder="Example: Data Engineer"
                onChange={(event) =>
                  setRole(
                    event.target.value
                  )
                }
              />
            </label>

            <label className="sa-field">
              <span>Current Skills</span>
              <textarea
                rows="4"
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
                : "Run Skill Analysis"}

              {!analyzing && (
                <FaArrowRight />
              )}
            </button>
          </div>
        </section>

        <section className="sa-roadmap-banner">
          <div>
            <HiOutlineSparkles />

            <div>
              <span>
                AI CAREER ROADMAP
              </span>
              <strong>
                Build a personalized plan
                from your verified skill gaps
              </strong>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateRoadmap}
            disabled={
              analysis
                .improvementSkills
                .length === 0
            }
          >
            Generate Roadmap
            <FaArrowRight />
          </button>
        </section>
      </main>
    </div>
  );
}