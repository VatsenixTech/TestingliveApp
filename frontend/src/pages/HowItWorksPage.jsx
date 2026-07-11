import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaBriefcase,
  FaCheckCircle,
  FaChevronDown,
  FaFileAlt,
  FaRobot,
  FaSearch,
  FaShieldAlt,
  FaUserCheck,
  FaUsers,
  FaChartLine,
} from "react-icons/fa";

import "./CompanyPages.css";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  jobs: "/jobs",
  howItWorks: "/how-it-works",
  aiWorkspace: "/ai-workspace",
  blog: "/blog",
  pricing: "/pricing",
  login: "/login",
  register: "/register",
  resumeStudio: "/resume-studio",
  applications: "/applications",
};

const journeySteps = [
  {
    number: "01",
    icon: FaUserCheck,
    title: "Create Your Verified Profile",
    description:
      "Build your candidate profile with skills, experience, education and identity verification.",
    className: "purple-step",
    route: ROUTES.register,
  },
  {
    number: "02",
    icon: FaSearch,
    title: "Discover Relevant Jobs",
    description:
      "Explore opportunities matched to your skills, experience, preferences and career goals.",
    className: "blue-step",
    route: ROUTES.jobs,
  },
  {
    number: "03",
    icon: FaRobot,
    title: "Prepare With AI Tools",
    description:
      "Improve your resume, analyse your skills and practise interviews using intelligent career tools.",
    className: "teal-step",
    route: ROUTES.aiWorkspace,
  },
  {
    number: "04",
    icon: FaBriefcase,
    title: "Connect With Employers",
    description:
      "Apply confidently, interact with verified employers and track your hiring progress.",
    className: "orange-step",
    route: ROUTES.applications,
  },
];

const platformBenefits = [
  {
    icon: FaShieldAlt,
    title: "Verified hiring network",
  },
  {
    icon: FaRobot,
    title: "AI-powered career tools",
  },
  {
    icon: FaUsers,
    title: "Trusted candidate profiles",
  },
];

const EMPTY_PLATFORM_STATS = {
  activeCandidates: null,
  verifiedEmployers: null,
  jobsMatched: null,
};

const EMPTY_CANDIDATE_SUMMARY = {
  fullName: "",
  role: "",
  trustScore: null,
  profileStrength: null,
  applicationsThisMonth: null,
  applicationTrend: [],
};

function readStoredUser() {
  try {
    const storedValue =
      localStorage.getItem("user") ||
      localStorage.getItem("candidate") ||
      localStorage.getItem("savedUser");

    return storedValue ? JSON.parse(storedValue) : null;
  } catch {
    return null;
  }
}

function getAuthToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

async function fetchJson(path, { signal, requiresAuth = false } = {}) {
  const token = getAuthToken();
  const headers = {
    Accept: "application/json",
  };

  if (requiresAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers,
    signal,
    credentials: "include",
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      responseText || `Request failed with status ${response.status}`,
    );
  }

  return response.json();
}

function firstDefined(...values) {
  return values.find(
    (value) => value !== undefined && value !== null && value !== "",
  );
}

function normalisePlatformStats(payload) {
  const source = payload?.data || payload?.stats || payload || {};

  return {
    activeCandidates: firstDefined(
      source.activeCandidates,
      source.candidateCount,
      source.totalCandidates,
      source.candidates,
    ),
    verifiedEmployers: firstDefined(
      source.verifiedEmployers,
      source.employerCount,
      source.totalEmployers,
      source.employers,
    ),
    jobsMatched: firstDefined(
      source.jobsMatched,
      source.matchedJobs,
      source.totalMatches,
      source.matches,
    ),
  };
}

function normaliseCandidateSummary(payload, storedUser) {
  const source = payload?.data || payload?.summary || payload || {};
  const user = source.user || source.candidate || storedUser || {};

  const trend = firstDefined(
    source.applicationTrend,
    source.applicationsTrend,
    source.monthlyApplicationTrend,
    [],
  );

  return {
    fullName: firstDefined(
      user.fullName,
      user.name,
      storedUser?.fullName,
      storedUser?.name,
      "",
    ),
    role: firstDefined(
      user.role,
      user.currentRole,
      user.jobTitle,
      storedUser?.role,
      "",
    ),
    trustScore: firstDefined(
      source.trustScore,
      user.trustScore,
      storedUser?.trustScore,
      null,
    ),
    profileStrength: firstDefined(
      source.profileStrength,
      source.profileCompletion,
      user.profileStrength,
      user.profileCompletion,
      null,
    ),
    applicationsThisMonth: firstDefined(
      source.applicationsThisMonth,
      source.monthlyApplications,
      source.applicationCountThisMonth,
      null,
    ),
    applicationTrend: Array.isArray(trend)
      ? trend
          .map((item) =>
            Number(
              typeof item === "number"
                ? item
                : firstDefined(item?.value, item?.count, item?.applications, 0),
            ),
          )
          .filter(Number.isFinite)
      : [],
  };
}

function formatMetric(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    notation: number >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(number);
}

function clampPercent(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return Math.max(0, Math.min(100, Math.round(number)));
}

function buildChartPoints(values, width = 184, height = 54) {
  if (!Array.isArray(values) || values.length < 2) {
    return "";
  }

  const numericValues = values.map(Number).filter(Number.isFinite);

  if (numericValues.length < 2) {
    return "";
  }

  const minimum = Math.min(...numericValues);
  const maximum = Math.max(...numericValues);
  const range = maximum - minimum || 1;

  return numericValues
    .map((value, index) => {
      const x = (index / (numericValues.length - 1)) * width;
      const y = height - ((value - minimum) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function MetricSkeleton() {
  return <span className="premium-skeleton premium-skeleton-number" />;
}

function HowItWorksPage() {
  const [platformStats, setPlatformStats] = useState(EMPTY_PLATFORM_STATS);
  const [candidateSummary, setCandidateSummary] = useState(
    EMPTY_CANDIDATE_SUMMARY,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [dataWarning, setDataWarning] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const storedUser = readStoredUser();

    async function loadLiveData() {
      setIsLoading(true);
      setDataWarning("");

      const platformStatsEndpoint =
        import.meta.env.VITE_PLATFORM_STATS_ENDPOINT ||
        "/api/public/platform-stats";

      const candidateSummaryEndpoint =
        import.meta.env.VITE_CANDIDATE_SUMMARY_ENDPOINT ||
        "/api/candidates/me/summary";

      const [platformResult, candidateResult] = await Promise.allSettled([
        fetchJson(platformStatsEndpoint, {
          signal: controller.signal,
        }),
        fetchJson(candidateSummaryEndpoint, {
          signal: controller.signal,
          requiresAuth: true,
        }),
      ]);

      if (platformResult.status === "fulfilled") {
        setPlatformStats(normalisePlatformStats(platformResult.value));
      }

      if (candidateResult.status === "fulfilled") {
        setCandidateSummary(
          normaliseCandidateSummary(candidateResult.value, storedUser),
        );
      } else {
        setCandidateSummary(
          normaliseCandidateSummary({}, storedUser),
        );
      }

      if (
        platformResult.status === "rejected" &&
        candidateResult.status === "rejected" &&
        !controller.signal.aborted
      ) {
        setDataWarning(
          "Live dashboard information is temporarily unavailable. Navigation and career tools are still available.",
        );
      }

      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }

    loadLiveData();

    return () => controller.abort();
  }, []);

  const profileStrength = clampPercent(candidateSummary.profileStrength);
  const trustScore = clampPercent(candidateSummary.trustScore);

  const applicationChartPoints = useMemo(
    () => buildChartPoints(candidateSummary.applicationTrend),
    [candidateSummary.applicationTrend],
  );

  const metricItems = [
    {
      icon: FaUsers,
      value: platformStats.activeCandidates,
      label: "Active Candidates",
    },
    {
      icon: FaShieldAlt,
      value: platformStats.verifiedEmployers,
      label: "Verified Employers",
    },
    {
      icon: FaChartLine,
      value: platformStats.jobsMatched,
      label: "Jobs Matched",
    },
  ];

  return (
    <div className="premium-how-page">
      <header className="premium-public-header">
        <Link to={ROUTES.home} className="premium-public-brand">
          <img src="/logo.png" alt="NoPromptJobs" />

          <div className="premium-brand-copy">
            <strong>NoPromptJobs</strong>
            <span>Verified Hiring Platform</span>
          </div>
        </Link>

        <nav className="premium-public-nav" aria-label="Main navigation">
          <Link to={ROUTES.dashboard}>Dashboard</Link>
          <Link to={ROUTES.jobs}>Jobs</Link>
          <Link className="active-public-link" to={ROUTES.howItWorks}>
            How It Works
          </Link>

          <Link className="nav-dropdown-link" to={ROUTES.aiWorkspace}>
            AI Tools
            <FaChevronDown aria-hidden="true" />
          </Link>

          <Link className="nav-dropdown-link" to={ROUTES.blog}>
            Resources
            <FaChevronDown aria-hidden="true" />
          </Link>

          <Link to={ROUTES.pricing}>Pricing</Link>
        </nav>

        <div className="premium-header-actions">
          <Link to={ROUTES.login} className="premium-login-btn">
            Login
          </Link>

          <Link to={ROUTES.register} className="premium-get-started-btn">
            Get Started
            <FaArrowRight aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main>
        <section className="premium-how-hero">
          <div className="premium-hero-glow premium-glow-one" />
          <div className="premium-hero-glow premium-glow-two" />

          <div className="premium-hero-content">
            <div className="premium-eyebrow">
              <FaCheckCircle aria-hidden="true" />
              Simple • Smart • Verified
            </div>

            <h1>
              How <span className="premium-gradient-text">NoPromptJobs</span>
              <br />
              Works
            </h1>

            <p>
              Create a verified profile, discover suitable jobs, prepare with
              intelligent career tools and connect with trusted employers.
            </p>

            <div className="premium-hero-buttons">
              <Link to={ROUTES.jobs} className="premium-primary-btn">
                Explore Jobs
                <FaArrowRight aria-hidden="true" />
              </Link>

              <Link to={ROUTES.resumeStudio} className="premium-secondary-btn">
                <FaFileAlt aria-hidden="true" />
                Improve Resume
              </Link>
            </div>

            <div className="premium-benefit-row">
              {platformBenefits.map(({ icon: Icon, title }) => (
                <div className="premium-benefit-item" key={title}>
                  <span>
                    <Icon aria-hidden="true" />
                  </span>
                  <p>{title}</p>
                </div>
              ))}
            </div>

            {dataWarning && (
              <p className="premium-data-warning" role="status">
                {dataWarning}
              </p>
            )}
          </div>

          <div className="premium-hero-visual">
            <div className="visual-orbit visual-orbit-one" />
            <div className="visual-orbit visual-orbit-two" />
            <div className="visual-dot visual-dot-one" />
            <div className="visual-dot visual-dot-two" />

            <div className="premium-human-frame">
              <img
                className="premium-human-image"
                src="/images/how-it-works-hero.png"
                alt="Candidate using the NoPromptJobs platform"
              />
            </div>

            <div className="premium-live-card candidate-live-card">
              <div className="premium-live-card-label">
                <FaUserCheck aria-hidden="true" />
                Candidate Profile
              </div>

              <strong>
                {candidateSummary.fullName || "Your verified profile"}
              </strong>

              <span>
                {candidateSummary.role ||
                  "Complete your profile to improve job matching"}
              </span>

              <Link to={ROUTES.dashboard}>
                Open Dashboard
                <FaArrowRight aria-hidden="true" />
              </Link>
            </div>

            <div className="premium-live-card trust-live-card">
              <div>
                <span>Trust Score</span>
                {isLoading ? (
                  <MetricSkeleton />
                ) : (
                  <strong>{trustScore === null ? "—" : `${trustScore}/100`}</strong>
                )}
              </div>

              <Link to="/trust-score" aria-label="Open trust score">
                <FaArrowRight aria-hidden="true" />
              </Link>
            </div>

            <div className="premium-live-card profile-live-card">
              <div>
                <span>Profile Strength</span>
                {isLoading ? (
                  <MetricSkeleton />
                ) : (
                  <strong>
                    {profileStrength === null ? "—" : `${profileStrength}%`}
                  </strong>
                )}
              </div>

              <div
                className="premium-progress-ring"
                style={{
                  "--progress": `${profileStrength ?? 0}%`,
                }}
                aria-label={
                  profileStrength === null
                    ? "Profile strength unavailable"
                    : `Profile strength ${profileStrength}%`
                }
              >
                <span>{profileStrength === null ? "—" : profileStrength}</span>
              </div>
            </div>

            <div className="premium-live-card applications-live-card">
              <div className="applications-live-header">
                <div>
                  <span>Applications</span>
                  <small>This month</small>
                </div>

                {isLoading ? (
                  <MetricSkeleton />
                ) : (
                  <strong>
                    {formatMetric(candidateSummary.applicationsThisMonth)}
                  </strong>
                )}
              </div>

              {applicationChartPoints ? (
                <svg
                  className="applications-live-chart"
                  viewBox="0 0 184 58"
                  role="img"
                  aria-label="Application trend"
                >
                  <polyline points={applicationChartPoints} />
                </svg>
              ) : (
                <div className="applications-empty-chart">
                  Application trend appears after you start applying.
                </div>
              )}

              <Link to={ROUTES.applications}>
                View Applications
                <FaArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="premium-journey-section">
          <div className="premium-section-heading">
            <span>Your Journey, Simplified</span>
            <h2>Your Career Journey in 4 Simple Steps</h2>
            <p>
              Each step opens the relevant NoPromptJobs tool or application
              page.
            </p>
          </div>

          <div className="premium-steps-grid">
            {journeySteps.map(
              ({
                number,
                icon: Icon,
                title,
                description,
                className,
                route,
              }) => (
                <article
                  className={`premium-step-card ${className}`}
                  key={number}
                >
                  <div className="premium-step-card-top">
                    <div className="premium-step-icon">
                      <Icon aria-hidden="true" />
                    </div>
                    <span className="premium-step-number">{number}</span>
                  </div>

                  <div className="premium-step-content">
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>

                  <Link
                    to={route}
                    className="premium-step-arrow"
                    aria-label={`Open ${title}`}
                  >
                    <FaArrowRight aria-hidden="true" />
                  </Link>
                </article>
              ),
            )}
          </div>
        </section>

        <section className="premium-growth-cta">
          <div className="cta-grid-pattern" />

          <div className="premium-cta-heading">
            <div className="premium-cta-badge">
              <FaCheckCircle aria-hidden="true" />
              Ready to Get Started?
            </div>

            <h2>
              Build trust. Improve your skills.
              <br />
              Find better opportunities.
            </h2>
          </div>

          <div className="premium-metrics">
            {metricItems.map(({ icon: Icon, value, label }) => (
              <div className="premium-metric" key={label}>
                <span>
                  <Icon aria-hidden="true" />
                </span>

                <div>
                  {isLoading ? (
                    <MetricSkeleton />
                  ) : (
                    <strong>{formatMetric(value)}</strong>
                  )}
                  <p>{label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="premium-cta-action">
            <Link to={ROUTES.register} className="premium-primary-btn">
              Create Your Profile
              <FaArrowRight aria-hidden="true" />
            </Link>

            <p>Create an account to start your verified career journey.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default HowItWorksPage;
