import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaBriefcase,
  FaCheck,
  FaCheckCircle,
  FaClock,
  FaCrown,
  FaGraduationCap,
  FaImage,
  FaRobot,
  FaShieldAlt,
  FaStar,
  FaUserCheck,
  FaVideo,
} from "react-icons/fa";
import {
  HiOutlineBadgeCheck,
  HiOutlineDocumentText,
  HiOutlineGlobeAlt,
  HiOutlineSparkles,
} from "react-icons/hi";
import {
  MdAnalytics,
  MdOutlineSecurity,
  MdVerified,
} from "react-icons/md";


import "./TrustPassportPage.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const EMPTY_PASSPORT = {
  candidate: {
    name: "",
    role: "",
    profileImage: "",
    verified: false,
  },
  score: 0,
  rating: 0,
  rankPercentile: null,
  status: "Not Calculated",
  lastUpdated: null,
  nextRefreshAt: null,
  verificationSignals: [],
  breakdown: {
    profileCompleteness: 0,
    skillsMatch: 0,
    experienceQuality: 0,
    engagement: 0,
    verificationLevel: 0,
    activityScore: 0,
  },
  profileStrength: {
    profileCompleteness: 0,
    skillsMatch: 0,
    experienceQuality: 0,
    engagementScore: 0,
  },
  insights: [],
  recentActivity: [],
};

const clamp = (value, minimum = 0, maximum = 100) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return minimum;
  }

  return Math.min(maximum, Math.max(minimum, numericValue));
};

const formatDateTime = (value) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const formatRelativeTime = (value) => {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const difference = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(difference / 60000));

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);

  return `${days} day${days === 1 ? "" : "s"} ago`;
};

const getSignalIcon = (key = "") => {
  const normalizedKey = String(key).toLowerCase();

  if (normalizedKey.includes("resume")) {
    return <HiOutlineDocumentText />;
  }

  if (normalizedKey.includes("image") || normalizedKey.includes("photo")) {
    return <FaImage />;
  }

  if (normalizedKey.includes("video")) {
    return <FaVideo />;
  }

  if (normalizedKey.includes("employment")) {
    return <FaBriefcase />;
  }

  if (normalizedKey.includes("education")) {
    return <FaGraduationCap />;
  }

  if (normalizedKey.includes("skill")) {
    return <FaStar />;
  }

  if (normalizedKey.includes("online")) {
    return <HiOutlineGlobeAlt />;
  }

  if (
    normalizedKey.includes("background") ||
    normalizedKey.includes("identity")
  ) {
    return <MdOutlineSecurity />;
  }

  return <HiOutlineBadgeCheck />;
};

const getActivityIcon = (type = "") => {
  const normalizedType = String(type).toLowerCase();

  if (normalizedType.includes("resume")) {
    return <HiOutlineDocumentText />;
  }

  if (normalizedType.includes("image")) {
    return <FaImage />;
  }

  if (normalizedType.includes("video")) {
    return <FaVideo />;
  }

  if (normalizedType.includes("skill")) {
    return <FaStar />;
  }

  return <FaCheck />;
};

function LoadingSkeleton() {
  return (
    <div className="trust-loading" aria-label="Loading trust passport">
      <div className="trust-skeleton trust-skeleton-header" />

      <div className="trust-skeleton-grid">
        <div className="trust-skeleton trust-skeleton-large" />
        <div className="trust-skeleton trust-skeleton-large" />
      </div>

      <div className="trust-skeleton trust-skeleton-section" />

      <div className="trust-skeleton-grid trust-skeleton-grid-three">
        <div className="trust-skeleton trust-skeleton-card" />
        <div className="trust-skeleton trust-skeleton-card" />
        <div className="trust-skeleton trust-skeleton-card" />
      </div>
    </div>
  );
}

function ProgressRow({ label, value }) {
  const normalizedValue = clamp(value);

  return (
    <div className="trust-progress-row">
      <div className="trust-progress-header">
        <span>{label}</span>
        <strong>{Math.round(normalizedValue)}%</strong>
      </div>

      <div
        className="trust-progress-track"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={Math.round(normalizedValue)}
      >
        <span style={{ width: `${normalizedValue}%` }} />
      </div>
    </div>
  );
}

function RadarChart({ breakdown }) {
  const values = [
    clamp(breakdown.profileCompleteness),
    clamp(breakdown.skillsMatch),
    clamp(breakdown.experienceQuality),
    clamp(breakdown.engagement),
    clamp(breakdown.verificationLevel),
    clamp(breakdown.activityScore),
  ];

  const center = 120;
  const maximumRadius = 76;
  const angles = [-90, -30, 30, 90, 150, 210];

  const getPoint = (angle, value) => {
    const radians = (angle * Math.PI) / 180;
    const radius = maximumRadius * (value / 100);

    return {
      x: center + Math.cos(radians) * radius,
      y: center + Math.sin(radians) * radius,
    };
  };

  const polygonPoints = angles
    .map((angle, index) => {
      const point = getPoint(angle, values[index]);
      return `${point.x},${point.y}`;
    })
    .join(" ");

  const gridLevels = [25, 50, 75, 100];

  return (
    <div className="trust-radar">
      <svg
        viewBox="0 0 240 240"
        className="trust-radar-svg"
        aria-label="Trust score breakdown radar chart"
      >
        <defs>
          <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3f7cff" />
            <stop offset="100%" stopColor="#9338ff" />
          </linearGradient>
        </defs>

        {gridLevels.map((level) => {
          const points = angles
            .map((angle) => {
              const point = getPoint(angle, level);
              return `${point.x},${point.y}`;
            })
            .join(" ");

          return (
            <polygon
              key={level}
              points={points}
              className="trust-radar-grid"
            />
          );
        })}

        {angles.map((angle) => {
          const point = getPoint(angle, 100);

          return (
            <line
              key={angle}
              x1={center}
              y1={center}
              x2={point.x}
              y2={point.y}
              className="trust-radar-line"
            />
          );
        })}

        <polygon
          points={polygonPoints}
          fill="url(#radarGradient)"
          className="trust-radar-result"
        />

        {angles.map((angle, index) => {
          const point = getPoint(angle, values[index]);

          return (
            <circle
              key={`${angle}-${index}`}
              cx={point.x}
              cy={point.y}
              r="4"
              className="trust-radar-point"
            />
          );
        })}
      </svg>
    </div>
  );
}

export default function TrustPassportPage() {
  const navigate = useNavigate();

  const [passport, setPassport] = useState(EMPTY_PASSPORT);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [showMethodology, setShowMethodology] = useState(false);

const openPage = useCallback((targetPath) => {
  if (!targetPath) {
    return;
  }

  window.location.href = targetPath;
}, []);

const getSignalActionPath = useCallback((signal = {}) => {
  const key = String(
    signal.key ||
    signal.label ||
    signal.name ||
    ""
  ).toLowerCase();

  if (key.includes("resume")) {
    return "/resume-studio";
  }

  if (key.includes("skill")) {
    return "/skill-analyzer";
  }

  if (key.includes("video")) {
    return "/ai-interview-prep";
  }

  if (
    key.includes("profile") ||
    key.includes("image") ||
    key.includes("photo") ||
    key.includes("employment") ||
    key.includes("education") ||
    key.includes("online") ||
    key.includes("identity") ||
    key.includes("background")
  ) {
    return "/profile";
  }

  return "/profile";
}, []);

  const token = useMemo(() => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("token") ||
      ""
    );
  }, []);

  const fetchTrustPassport = useCallback(
    async ({ forceRefresh = false } = {}) => {
      try {
        setError("");

        if (forceRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        if (!token) {
          throw new Error("Your login session is missing. Please log in again.");
        }

        const endpoint = forceRefresh
          ? `${API_BASE_URL}/api/trust-passport/refresh`
          : `${API_BASE_URL}/api/trust-passport/me`;

        const response = await fetch(endpoint, {
          method: forceRefresh ? "POST" : "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const result = await response.json().catch(() => ({}));

        if (response.status === 401) {
          localStorage.removeItem("token");
          throw new Error("Your session has expired. Please log in again.");
        }

        if (!response.ok) {
          throw new Error(
            result.message || "Unable to load your Trust Passport."
          );
        }

        setPassport({
          ...EMPTY_PASSPORT,
          ...(result.data || result),
          candidate: {
            ...EMPTY_PASSPORT.candidate,
            ...(result.data?.candidate || result.candidate),
          },
          breakdown: {
            ...EMPTY_PASSPORT.breakdown,
            ...(result.data?.breakdown || result.breakdown),
          },
          profileStrength: {
            ...EMPTY_PASSPORT.profileStrength,
            ...(result.data?.profileStrength || result.profileStrength),
          },
        });
      } catch (requestError) {
        console.error("Trust Passport error:", requestError);
        setError(requestError.message || "Unable to load Trust Passport.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchTrustPassport();
  }, [fetchTrustPassport]);

  const normalizedScore = clamp(passport.score);
  const normalizedRating =
    Number(passport.rating) || Number((normalizedScore / 10).toFixed(1));

  const scoreStatus = useMemo(() => {
    if (normalizedScore >= 90) {
      return "Exceptional";
    }

    if (normalizedScore >= 80) {
      return "Excellent";
    }

    if (normalizedScore >= 70) {
      return "Strong";
    }

    if (normalizedScore >= 55) {
      return "Good";
    }

    return "Needs Improvement";
  }, [normalizedScore]);

  const circumference = 2 * Math.PI * 86;
  const scoreOffset =
    circumference - (normalizedScore / 100) * circumference;

  const rankText =
    passport.rankPercentile !== null &&
    Number.isFinite(Number(passport.rankPercentile))
      ? `Top ${Math.max(
          1,
          Math.round(100 - Number(passport.rankPercentile))
        )}%`
      : "Rank calculating";

  return (
    <main className="trust-passport-page">
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <section className="trust-error-state">
              <div className="trust-error-icon">
                <FaShieldAlt />
              </div>

              <h2>Trust Passport could not be loaded</h2>
              <p>{error}</p>

              <div className="trust-error-actions">
                <button
                  type="button"
                  className="trust-primary-button"
                  onClick={() => fetchTrustPassport()}
                >
                  Try Again
                </button>

                <button
                  type="button"
                  className="trust-secondary-button"
                  onClick={() => navigate("/login")}
                >
                  Go to Login
                </button>
              </div>
            </section>
          ) : (
            <>
              <section className="trust-page-heading">
                <div>
                  <div className="trust-title-row">
                    <h1>Trust Passport</h1>

                    <MdVerified className="trust-title-verified" />

                    <span className="trust-ai-badge">
                      <HiOutlineSparkles />
                      AI Verified Credibility
                    </span>
                  </div>

                  <p>
                    Comprehensive AI analysis of your professional credibility
                    and trustworthiness.
                  </p>
                </div>

                <div className="trust-security-status">
                  <div className="trust-security-icon">
                    <FaShieldAlt />
                  </div>

                  <div>
                    <strong>Verified &amp; Secured</strong>
                    <span>
                      Last updated: {formatRelativeTime(passport.lastUpdated)}
                    </span>
                    <span>
                      Next refresh:{" "}
                      {passport.nextRefreshAt
                        ? formatDateTime(passport.nextRefreshAt)
                        : "Automatic"}
                    </span>
                  </div>

                 <button
  type="button"
  className="trust-refresh-button"
  disabled={refreshing}
  onClick={async () => {
    await fetchTrustPassport({
      forceRefresh: true,
    });
  }}
>
  {refreshing ? "Refreshing..." : "Refresh"}
</button>
                </div>
              </section>

              <section className="trust-score-layout">
                <article className="trust-score-hero">
                  <div className="trust-score-circle">
                    <svg viewBox="0 0 220 220">
                      <defs>
                        <linearGradient
                          id="trustScoreGradient"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#3e73ff" />
                          <stop offset="52%" stopColor="#8339ff" />
                          <stop offset="100%" stopColor="#33dbad" />
                        </linearGradient>
                      </defs>

                      <circle
                        className="trust-score-circle-background"
                        cx="110"
                        cy="110"
                        r="86"
                      />

                      <circle
                        className="trust-score-circle-progress"
                        cx="110"
                        cy="110"
                        r="86"
                        strokeDasharray={circumference}
                        strokeDashoffset={scoreOffset}
                      />
                    </svg>

                    <div className="trust-score-circle-content">
                      <div>
                        <strong>{normalizedRating.toFixed(1)}</strong>
                        <span>/10</span>
                      </div>

                      <p>
                        <FaStar />
                        {scoreStatus}
                      </p>
                    </div>
                  </div>

                  <div className="trust-score-summary">
                    <div className="trust-score-summary-heading">
                      <h2>Overall Trust Score</h2>

                      <span className="trust-rank-badge">
                        <FaUserCheck />
                        {rankText} of candidates
                      </span>
                    </div>

                    <p>
                      Your Trust Passport is calculated using verified profile,
                      resume, skill, experience, engagement and identity
                      signals.
                    </p>

                    <div className="trust-score-metrics">
                      <div>
                        <FaRobot />
                        <span>AI confidence</span>
                        <strong>
                          {normalizedScore >= 85
                            ? "Very High"
                            : normalizedScore >= 65
                            ? "High"
                            : "Developing"}
                        </strong>
                      </div>

                      <div>
                        <FaShieldAlt />
                        <span>Risk level</span>
                        <strong>
                          {normalizedScore >= 85
                            ? "Very Low"
                            : normalizedScore >= 65
                            ? "Low"
                            : "Review Required"}
                        </strong>
                      </div>

                      <div>
                        <MdAnalytics />
                        <span>Verification strength</span>
                        <strong>
                          {clamp(passport.breakdown.verificationLevel)}%
                        </strong>
                      </div>
                    </div>
                  </div>
                </article>

                <article className="trust-card trust-breakdown-card">
                  <div className="trust-card-heading">
                    <h2>Score Breakdown</h2>
                  </div>

                  <div className="trust-radar-layout">
                    <RadarChart breakdown={passport.breakdown} />

                    <div className="trust-radar-values">
                      <span>
                        Profile
                        <strong>
                          {Math.round(
                            clamp(passport.breakdown.profileCompleteness)
                          )}
                          /100
                        </strong>
                      </span>

                      <span>
                        Skills
                        <strong>
                          {Math.round(clamp(passport.breakdown.skillsMatch))}
                          /100
                        </strong>
                      </span>

                      <span>
                        Experience
                        <strong>
                          {Math.round(
                            clamp(passport.breakdown.experienceQuality)
                          )}
                          /100
                        </strong>
                      </span>

                      <span>
                        Engagement
                        <strong>
                          {Math.round(clamp(passport.breakdown.engagement))}
                          /100
                        </strong>
                      </span>

                      <span>
                        Verification
                        <strong>
                          {Math.round(
                            clamp(passport.breakdown.verificationLevel)
                          )}
                          /100
                        </strong>
                      </span>

                      <span>
                        Activity
                        <strong>
                          {Math.round(
                            clamp(passport.breakdown.activityScore)
                          )}
                          /100
                        </strong>
                      </span>
                    </div>
                  </div>
                </article>
              </section>

              <section className="trust-middle-layout">
                <article className="trust-card trust-verification-card">
                  <div className="trust-card-heading">
                    <div>
                      <h2>Verification Signals</h2>
                      <p>Signals used to calculate your credibility score.</p>
                    </div>

                    <button
                      type="button"
                      className="trust-link-button"
                      onClick={() => openPage("/profile")}
                    >
                      View Details
                      <FaArrowRight />
                    </button>
                  </div>

                  {passport.verificationSignals.length === 0 ? (
                    <div className="trust-empty-content">
                      <FaShieldAlt />
                      <p>
                        Verification signals will appear after your profile
                        information is submitted.
                      </p>

                      <button
                        type="button"
                        className="trust-primary-button"
                        onClick={() => openPage("/profile")}
                      >
                        Complete Profile
                      </button>
                    </div>
                  ) : (
                    <div className="trust-signals-grid">
                      {passport.verificationSignals.map((signal, index) => {
                        const verified =
                          signal.status === "verified" ||
                          signal.verified === true ||
                          signal.completed === true;

                        const actionPath = getSignalActionPath(signal);

                        return (
                          <button
                            type="button"
                            className="trust-signal-item trust-signal-button"
                            key={signal.key || signal._id || `signal-${index}`}
                            onClick={() => openPage(actionPath)}
                            title={`Open ${
                              signal.label ||
                              signal.name ||
                              "verification details"
                            }`}
                          >
                            <div
                              className={`trust-signal-icon trust-signal-icon-${
                                index % 6
                              }`}
                            >
                              {getSignalIcon(
                                signal.key || signal.label || signal.name
                              )}
                            </div>

                            <div className="trust-signal-text">
                              <strong>
                                {signal.label ||
                                  signal.name ||
                                  "Verification signal"}
                              </strong>
                              <span>
                                {signal.description ||
                                  "Candidate information analyzed"}
                              </span>
                            </div>

                            <span
                              className={`trust-signal-status ${
                                verified
                                  ? "trust-signal-verified"
                                  : "trust-signal-pending"
                              }`}
                            >
                              {verified ? (
                                <>
                                  Verified
                                  <FaCheckCircle />
                                </>
                              ) : (
                                <>
                                  Pending
                                  <FaClock />
                                </>
                              )}
                            </span>

                            <FaArrowRight className="trust-signal-arrow" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </article>

                <article className="trust-card trust-insights-card">
                  <div className="trust-card-heading">
                    <div>
                      <h2>AI Insights</h2>
                      <p>
                        Recommendations generated from your real profile and
                        verification data.
                      </p>
                    </div>
                  </div>

                  <div className="trust-insights-content">
                    <div className="trust-insight-list">
                      {passport.insights.length === 0 ? (
                        <div className="trust-empty-content">
                          <FaRobot />
                          <p>
                            AI insights will appear when enough profile data is
                            available.
                          </p>

                          <button
                            type="button"
                            className="trust-primary-button"
                            onClick={() => openPage("/profile")}
                          >
                            Improve Profile
                          </button>
                        </div>
                      ) : (
                        passport.insights.slice(0, 4).map((insight, index) => {
                          const insightText = String(
                            insight.title ||
                              insight.message ||
                              insight.description ||
                              ""
                          ).toLowerCase();

                          let insightPath = "/profile";

                          if (
                            insightText.includes("resume") ||
                            insightText.includes("ats")
                          ) {
                            insightPath = "/resume-studio";
                          } else if (
                            insightText.includes("skill") ||
                            insightText.includes("assessment")
                          ) {
                            insightPath = "/skill-analyzer";
                          } else if (
                            insightText.includes("video") ||
                            insightText.includes("interview")
                          ) {
                            insightPath = "/ai-interview-prep";
                          }

                          return (
                            <button
                              type="button"
                              className="trust-insight-item trust-insight-button"
                              key={insight._id || `insight-${index}`}
                              onClick={() => openPage(insightPath)}
                            >
                              <div
                                className={`trust-insight-icon trust-insight-icon-${
                                  index % 4
                                }`}
                              >
                                {index === 0 ? (
                                  <MdAnalytics />
                                ) : index === 1 ? (
                                  <FaStar />
                                ) : index === 2 ? (
                                  <FaCrown />
                                ) : (
                                  <HiOutlineSparkles />
                                )}
                              </div>

                              <div className="trust-insight-text">
                                <strong>
                                  {insight.title || "Profile insight"}
                                </strong>
                                <p>
                                  {insight.message ||
                                    insight.description ||
                                    "Complete your profile to improve recruiter confidence."}
                                </p>
                              </div>

                              <FaArrowRight className="trust-insight-arrow" />
                            </button>
                          );
                        })
                      )}
                    </div>

                    <div className="trust-shield-illustration">
                      <div className="trust-shield-glow" />
                      <FaShieldAlt />
                      <span />
                    </div>
                  </div>
                </article>
              </section>

              <section className="trust-bottom-layout">
                <article className="trust-card trust-strength-card">
                  <div className="trust-card-heading">
                    <h2>Profile Strength</h2>

                    <button
                      type="button"
                      className="trust-link-button"
                      onClick={() => openPage("/profile")}
                    >
                      Improve
                      <FaArrowRight />
                    </button>
                  </div>

                  <div className="trust-strength-content">
                    <div className="trust-mini-score">
                      <strong>
                        {Math.round(
                          clamp(
                            passport.profileStrength.profileCompleteness
                          )
                        )}
                        %
                      </strong>
                      <span>Complete</span>
                    </div>

                    <div className="trust-progress-list">
                      <ProgressRow
                        label="Profile Completeness"
                        value={passport.profileStrength.profileCompleteness}
                      />

                      <ProgressRow
                        label="Skills Match"
                        value={passport.profileStrength.skillsMatch}
                      />

                      <ProgressRow
                        label="Experience Quality"
                        value={passport.profileStrength.experienceQuality}
                      />

                      <ProgressRow
                        label="Engagement Score"
                        value={passport.profileStrength.engagementScore}
                      />
                    </div>
                  </div>

                  <div className="trust-strength-actions">
                    <button
                      type="button"
                      onClick={() => openPage("/profile")}
                    >
                      Complete Profile
                    </button>

                    <button
                      type="button"
                      onClick={() => openPage("/skill-analyzer")}
                    >
                      Verify Skills
                    </button>
                  </div>
                </article>

                <article className="trust-card trust-activity-card">
                  <div className="trust-card-heading">
                    <h2>Recent Activity</h2>
                  </div>

                  {passport.recentActivity.length === 0 ? (
                    <div className="trust-empty-content">
                      <FaClock />
                      <p>No recent verification activity is available.</p>
                    </div>
                  ) : (
                    <div className="trust-activity-list">
                      {passport.recentActivity
                        .slice(0, 4)
                        .map((activity, index) => (
                          <div
                            className="trust-activity-item"
                            key={activity._id || `activity-${index}`}
                          >
                            <div
                              className={`trust-activity-icon trust-activity-icon-${
                                index % 4
                              }`}
                            >
                              {getActivityIcon(
                                activity.type || activity.title
                              )}
                            </div>

                            <div className="trust-activity-details">
                              <strong>
                                {activity.title || "Profile updated"}
                              </strong>

                              {activity.description && (
                                <p>{activity.description}</p>
                              )}

                              <span>
                                {formatRelativeTime(
                                  activity.createdAt || activity.date
                                )}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  <button
                    type="button"
                    className="trust-full-width-button"
                    onClick={() => openPage("/trust-passport/activity")}
                  >
                    View All Activity
                    <FaArrowRight />
                  </button>
                </article>

                <article className="trust-card trust-rank-card">
                  <div className="trust-card-heading">
                    <h2>Compare Your Rank</h2>
                  </div>

                  <div className="trust-rank-highlight">
                    <FaCrown />

                    <div>
                      <strong>{rankText}</strong>
                      <span>Among verified candidates</span>
                    </div>
                  </div>

                  <div className="trust-rank-progress">
                    <span
                      style={{
                        width: `${
                          passport.rankPercentile !== null
                            ? clamp(passport.rankPercentile)
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  <div className="trust-rank-labels">
                    <span>Bottom 25%</span>
                    <span>Average</span>
                    <span>Top 25%</span>
                    <span>Top 5%</span>
                  </div>

                  <button
                    type="button"
                    className="trust-link-button trust-ranking-link"
                    onClick={() => setShowMethodology(true)}
                  >
                    How is ranking calculated?
                    <FaArrowRight />
                  </button>
                </article>
              </section>

              {showMethodology && (
                <div
                  className="trust-methodology-overlay"
                  role="presentation"
                  onClick={() => setShowMethodology(false)}
                >
                  <section
                    className="trust-methodology-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="trust-methodology-title"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="trust-methodology-header">
                      <div>
                        <span className="trust-methodology-badge">
                          <FaShieldAlt />
                          Trust Score Methodology
                        </span>

                        <h2 id="trust-methodology-title">
                          How your Trust Score is calculated
                        </h2>

                        <p>
                          Your score is calculated from your actual profile,
                          verification and platform activity.
                        </p>
                      </div>

                      <button
                        type="button"
                        className="trust-methodology-close"
                        onClick={() => setShowMethodology(false)}
                        aria-label="Close"
                      >
                        ×
                      </button>
                    </div>

                    <div className="trust-methodology-list">
                      <div>
                        <strong>Profile completeness</strong>
                        <span>20%</span>
                        <p>
                          Contact information, summary, resume, location,
                          profile image and career details.
                        </p>
                      </div>

                      <div>
                        <strong>Skills and assessments</strong>
                        <span>20%</span>
                        <p>
                          Skills, endorsements, assessments and supporting
                          project evidence.
                        </p>
                      </div>

                      <div>
                        <strong>Experience quality</strong>
                        <span>20%</span>
                        <p>
                          Employment history, dates, responsibilities and
                          verification evidence.
                        </p>
                      </div>

                      <div>
                        <strong>Verification signals</strong>
                        <span>25%</span>
                        <p>
                          Resume, identity, employment, education, image and
                          introduction-video verification.
                        </p>
                      </div>

                      <div>
                        <strong>Engagement</strong>
                        <span>10%</span>
                        <p>
                          Applications, interviews, recruiter activity and
                          profile updates.
                        </p>
                      </div>

                      <div>
                        <strong>Recent activity</strong>
                        <span>5%</span>
                        <p>
                          Recent platform login and candidate activity.
                        </p>
                      </div>
                    </div>

                    <div className="trust-methodology-total">
                      <span>Total score weighting</span>
                      <strong>100%</strong>
                    </div>

                    <button
                      type="button"
                      className="trust-primary-button"
                      onClick={() => setShowMethodology(false)}
                    >
                      Understood
                    </button>
                  </section>
                </div>
              )}
            </>
          )}
    </main>
  );
}