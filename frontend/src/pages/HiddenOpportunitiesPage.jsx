import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BellRing,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  Flame,
  IndianRupee,
  Lightbulb,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import "./HiddenOpportunitiesPage.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

function authConfig() {
  const token = localStorage.getItem("token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}

function numberOrZero(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function parseClosingDays(value) {
  if (typeof value === "number") return value;
  const match = String(value || "").match(/\d+/);
  return match ? Number(match[0]) : null;
}

function experienceText(job) {
  if (job.experience) return String(job.experience);
  if (job.experienceRange) return String(job.experienceRange);

  const minimum = job.minExperience ?? job.experienceMin;
  const maximum = job.maxExperience ?? job.experienceMax;

  if (minimum != null && maximum != null) return `${minimum}–${maximum} Yrs`;
  if (minimum != null) return `${minimum}+ Yrs`;
  return "Not specified";
}

function salaryText(job) {
  if (job.salary) return String(job.salary);

  const minimum = job.salaryMin;
  const maximum = job.salaryMax;

  if (minimum != null && maximum != null) return `₹${minimum}–${maximum} LPA`;
  if (minimum != null) return `₹${minimum}+ LPA`;
  return "Not disclosed";
}

function normalizeJob(job) {
  const company = job.companyName || job.company || "Company not disclosed";
  const closesIn = parseClosingDays(job.closesIn ?? job.timeLeft);

  return {
    id: job._id || job.id,
    title: job.role || job.title || job.jobTitle || "Role not specified",
    company,
    companyLogo: job.companyLogo || job.logoUrl || "",
    logo: company.slice(0, 1).toUpperCase(),
    location: job.location || "Location not specified",
    experience: experienceText(job),
    salary: salaryText(job),
    salaryMin: numberOrZero(job.salaryMin),
    salaryMax: numberOrZero(job.salaryMax),
    roleType: job.workMode || job.employmentType || job.roleType || "Not specified",
    skills: Array.isArray(job.requiredSkills)
      ? job.requiredSkills
      : Array.isArray(job.skills)
        ? job.skills
        : [],
    match: Math.max(0, Math.min(100, numberOrZero(job.aiMatch ?? job.match))),
    closesIn,
    timeLeft: job.timeLeft || (closesIn != null ? `${closesIn} days` : "Not specified"),
    description: job.description || "",
    opportunityType: job.opportunityType || "Hidden opportunity",
    referralRequested: Boolean(job.referralRequested),
    hasApplied: Boolean(job.hasApplied),
    raw: job,
  };
}

function MatchRing({ value, large = false }) {
  const safeValue = Math.max(0, Math.min(100, numberOrZero(value)));
  const degrees = Math.round((safeValue / 100) * 360);

  return (
    <div
      className={`match-ring ${large ? "match-ring--large" : ""}`}
      style={{ "--match-value": `${degrees}deg` }}
      aria-label={`${safeValue}% AI match`}
    >
      <div className="match-ring__center">
        <strong>{safeValue}%</strong>
        {large && <span>Career Fit</span>}
      </div>
    </div>
  );
}

function MetricCard({ metric }) {
  const Icon = metric.icon;

  return (
    <article className="metric-card">
      <div className={`metric-card__icon metric-card__icon--${metric.tone}`}>
        <Icon size={25} strokeWidth={2.2} />
      </div>

      <div className="metric-card__body">
        <span className="metric-card__label">{metric.label}</span>
        <strong className="metric-card__value">{metric.value}</strong>
        <span className={`metric-card__trend ${metric.warning ? "metric-card__trend--warning" : ""}`}>
          <TrendingUp size={12} />
          <small>{metric.note}</small>
        </span>
      </div>
    </article>
  );
}

function JobCard({ job, onViewRole }) {
  return (
    <article className="job-card">
      <div className="job-card__logo">
        {job.companyLogo ? (
          <img src={job.companyLogo} alt={`${job.company} logo`} />
        ) : (
          job.logo
        )}
      </div>

      <div className="job-card__main">
        <div className="job-card__heading">
          <h3>{job.title}</h3>
          <span className="verified-company">
            {job.company} <CheckCircle2 size={14} />
          </span>
        </div>

        <div className="job-card__meta">
          <span><MapPin size={14} />{job.location}</span>
          <span><BriefcaseBusiness size={14} />{job.experience}</span>
          <span><IndianRupee size={14} />{job.salary.replace(/^₹/, "")}</span>
        </div>

        <div className="skill-list" aria-label="Required skills">
          {job.skills.length > 0 ? (
            job.skills.slice(0, 6).map((skill) => <span key={skill}>{skill}</span>)
          ) : (
            <span>Skills not specified</span>
          )}
        </div>
      </div>

      <div className="job-card__match">
        <MatchRing value={job.match} />
        <span>AI Match</span>
      </div>

      <div className="job-card__actions">
        <button type="button" className="button button--outline" onClick={() => onViewRole(job)}>
          View Role <ArrowRight size={16} />
        </button>
        <span className="closing-text">
          <CalendarClock size={14} />
          {job.closesIn != null ? `Closing in ${job.closesIn} days` : job.timeLeft}
        </span>
      </div>
    </article>
  );
}

export default function HiddenOpportunitiesPage() {
  const navigate = useNavigate();
  const user = useMemo(readStoredUser, []);
  const candidateId = user?._id || user?.candidateId || user?.id;
  const candidateName = user?.name || user?.fullName || "Candidate";

  const [jobs, setJobs] = useState([]);
  const [serverStats, setServerStats] = useState({});
  const [query, setQuery] = useState("");
  const [roleType, setRoleType] = useState("All");
  const [location, setLocation] = useState("All");
  const [experience, setExperience] = useState("All");
  const [aiOnly, setAiOnly] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [actionName, setActionName] = useState("");
  const [notice, setNotice] = useState("");

  const fetchHiddenOpportunities = useCallback(async (isRefresh = false) => {
    if (!candidateId) {
      setError("Candidate login is required to load hidden opportunities.");
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");
      const response = await axios.get(
        `${API_BASE}/api/hidden-opportunities/candidate/${candidateId}`,
        authConfig()
      );

      const opportunities = Array.isArray(response.data?.opportunities)
        ? response.data.opportunities
        : [];

      setJobs(opportunities.map(normalizeJob));
      setServerStats(response.data?.stats || {});
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Failed to load hidden opportunities from the server."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [candidateId]);

  useEffect(() => {
    fetchHiddenOpportunities();
  }, [fetchHiddenOpportunities]);

  const locations = useMemo(
    () => [...new Set(jobs.map((job) => job.location).filter(Boolean))].sort(),
    [jobs]
  );

  const roleTypes = useMemo(
    () => [...new Set(jobs.map((job) => job.roleType).filter(Boolean))].sort(),
    [jobs]
  );

  const filteredJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return jobs.filter((job) => {
      const searchableText = [job.title, job.company, job.location, job.roleType, ...job.skills]
        .join(" ")
        .toLowerCase();

      const minimumExperience = Number.parseInt(job.experience, 10);
      const matchesExperience =
        experience === "All" ||
        (experience === "0–2 years" && minimumExperience <= 2) ||
        (experience === "3–5 years" && minimumExperience >= 3 && minimumExperience <= 5) ||
        (experience === "5+ years" && minimumExperience >= 5) ||
        Number.isNaN(minimumExperience);

      return (
        (!normalizedQuery || searchableText.includes(normalizedQuery)) &&
        (roleType === "All" || job.roleType === roleType) &&
        (location === "All" || job.location === location) &&
        matchesExperience &&
        (!aiOnly || job.match >= 80)
      );
    });
  }, [aiOnly, experience, jobs, location, query, roleType]);

  const calculatedStats = useMemo(() => {
    const salaries = jobs
      .map((job) => {
        if (job.salaryMin && job.salaryMax) return (job.salaryMin + job.salaryMax) / 2;
        return job.salaryMax || job.salaryMin || 0;
      })
      .filter((salary) => salary > 0);

    return {
      hiddenJobs: serverStats.hiddenJobs ?? jobs.length,
      closingSoon:
        serverStats.closingSoon ??
        serverStats.emergencyOpenings ??
        jobs.filter((job) => job.closesIn != null && job.closesIn <= 7).length,
      avgSalary:
        serverStats.avgSalary ??
        (salaries.length
          ? Math.round((salaries.reduce((sum, salary) => sum + salary, 0) / salaries.length) * 10) / 10
          : 0),
      recruiterInvites: serverStats.recruiterInvites ?? 0,
      bestMatch:
        serverStats.bestMatch ??
        jobs.reduce((highest, job) => Math.max(highest, job.match), 0),
      profileViews: serverStats.profileViews ?? 0,
    };
  }, [jobs, serverStats]);

  const metrics = useMemo(() => [
    {
      label: "Hidden Jobs",
      value: calculatedStats.hiddenJobs,
      note: "Live opportunities",
      icon: BriefcaseBusiness,
      tone: "blue",
    },
    {
      label: "Closing Soon",
      value: calculatedStats.closingSoon,
      note: "Within 7 days",
      icon: Flame,
      tone: "violet",
      warning: true,
    },
    {
      label: "Avg. Salary",
      value: `₹${calculatedStats.avgSalary} LPA`,
      note: "From live roles",
      icon: IndianRupee,
      tone: "green",
    },
    {
      label: "Recruiter Invites",
      value: calculatedStats.recruiterInvites,
      note: "Current invites",
      icon: Users,
      tone: "purple",
    },
    {
      label: "Best AI Match",
      value: `${calculatedStats.bestMatch}%`,
      note: "Current profile fit",
      icon: Target,
      tone: "orange",
    },
  ], [calculatedStats]);

  const topSkills = useMemo(() => {
    const counts = new Map();
    jobs.forEach((job) => {
      job.skills.forEach((skill) => counts.set(skill, (counts.get(skill) || 0) + 1));
    });

    return [...counts.entries()]
      .sort((first, second) => second[1] - first[1])
      .slice(0, 3)
      .map(([skill]) => skill);
  }, [jobs]);

  const bestJob = useMemo(
    () => jobs.reduce((best, job) => (!best || job.match > best.match ? job : best), null),
    [jobs]
  );

  function exportJobs() {
    if (filteredJobs.length === 0) {
      setNotice("There are no filtered opportunities to export.");
      return;
    }

    const headings = ["Role", "Company", "Location", "Experience", "Work Mode", "Salary", "AI Match"];
    const rows = filteredJobs.map((job) => [
      job.title,
      job.company,
      job.location,
      job.experience,
      job.roleType,
      job.salary,
      `${job.match}%`,
    ]);

    const csv = [headings, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "hidden-opportunities.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function showAllJobs() {
    setQuery("");
    setRoleType("All");
    setLocation("All");
    setExperience("All");
    setAiOnly(false);
    document.querySelector(".job-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function requestReferral(job) {
    try {
      setActionName("referral");
      setNotice("");
      const response = await axios.post(
        `${API_BASE}/api/hidden-opportunities/referral/${job.id}`,
        { candidateId },
        authConfig()
      );

      setNotice(response.data?.message || "Referral request submitted.");
      await fetchHiddenOpportunities(true);
      setSelectedJob((current) => current ? { ...current, referralRequested: true } : current);
    } catch (requestError) {
      setNotice(requestError.response?.data?.message || "Referral request failed.");
    } finally {
      setActionName("");
    }
  }

  async function applyConfidentially(job) {
    try {
      setActionName("apply");
      setNotice("");
      const response = await axios.post(
        `${API_BASE}/api/hidden-opportunities/apply/${job.id}`,
        { candidateId },
        authConfig()
      );

      setNotice(response.data?.message || "Application submitted successfully.");
      await fetchHiddenOpportunities(true);
      setSelectedJob((current) => current ? { ...current, hasApplied: true } : current);
    } catch (requestError) {
      setNotice(requestError.response?.data?.message || "Application failed.");
    } finally {
      setActionName("");
    }
  }

  return (
    <main className="hidden-opportunities-page">
      <header className="page-heading">
        <div>
          <div className="page-heading__eyebrow">
            <Sparkles size={15} /> AI-curated for {candidateName}
          </div>
          <h1>Hidden Opportunities <span aria-hidden="true">♛</span></h1>
          <p>Exclusive roles matched to your live candidate profile</p>
        </div>

        <div className="page-heading__actions">
          <button type="button" className="button button--ghost" onClick={() => fetchHiddenOpportunities(true)} disabled={refreshing}>
            <RefreshCw size={17} className={refreshing ? "spin" : ""} /> Refresh
          </button>
          <button type="button" className="button button--ghost" onClick={exportJobs}>
            <Download size={17} /> Export
          </button>
        </div>
      </header>

      {notice && (
        <div className="ho-notice" role="status">
          <span>{notice}</span>
          <button type="button" aria-label="Close message" onClick={() => setNotice("")}><X size={16} /></button>
        </div>
      )}

      <section className="filter-bar" aria-label="Opportunity filters">
        <label className="search-field">
          <Search size={19} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search live opportunities..." />
        </label>

        <label className="select-field">
          <span>Role Type</span>
          <select value={roleType} onChange={(event) => setRoleType(event.target.value)}>
            <option>All</option>
            {roleTypes.map((type) => <option key={type}>{type}</option>)}
          </select>
          <ChevronDown size={15} />
        </label>

        <label className="select-field">
          <span>Location</span>
          <select value={location} onChange={(event) => setLocation(event.target.value)}>
            <option>All</option>
            {locations.map((item) => <option key={item}>{item}</option>)}
          </select>
          <ChevronDown size={15} />
        </label>

        <label className="select-field">
          <span>Experience</span>
          <select value={experience} onChange={(event) => setExperience(event.target.value)}>
            <option>All</option>
            <option>0–2 years</option>
            <option>3–5 years</option>
            <option>5+ years</option>
          </select>
          <ChevronDown size={15} />
        </label>

        <label className="toggle-field">
          <span>AI Match Only</span>
          <input type="checkbox" checked={aiOnly} onChange={(event) => setAiOnly(event.target.checked)} />
          <span className="toggle-field__track" aria-hidden="true"><span /></span>
        </label>
      </section>

      {loading ? (
        <div className="ho-loading"><LoaderCircle className="spin" size={28} /> Loading real opportunities...</div>
      ) : error ? (
        <div className="ho-error" role="alert">
          <p>{error}</p>
          <button type="button" className="button button--outline" onClick={() => fetchHiddenOpportunities()}>Try Again</button>
        </div>
      ) : (
        <>
          <section className="metric-grid" aria-label="Hidden opportunity summary">
            {metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}
          </section>

          <section className="opportunity-layout">
            <div className="opportunity-panel panel">
              <div className="panel__heading">
                <h2>Top Hidden Opportunities</h2>
                <span className="verified-pill"><ShieldCheck size={14} /> Recruiter Verified</span>
              </div>

              <div className="job-list">
                {filteredJobs.length ? (
                  filteredJobs.map((job) => <JobCard key={job.id} job={job} onViewRole={setSelectedJob} />)
                ) : (
                  <div className="empty-state">
                    <Search size={28} />
                    <h3>No matching opportunities</h3>
                    <p>No database records match the selected filters.</p>
                  </div>
                )}
              </div>

              <button type="button" className="view-all-button" onClick={showAllJobs}>
                View All Hidden Opportunities <ArrowRight size={16} />
              </button>
            </div>

            <aside className="intelligence-column">
              <section className="intelligence-card panel">
                <div className="panel__heading">
                  <h2>AI Career Intelligence</h2>
                  <span className="beta-pill">LIVE</span>
                </div>

                <div className="intelligence-card__content">
                  <MatchRing value={calculatedStats.bestMatch} large />
                  <div className="insight-list">
                    <article className="insight-item">
                      <div className="insight-item__icon"><TrendingUp size={19} /></div>
                      <div>
                        <h3>{bestJob ? "Best Current Match" : "No Active Match"}</h3>
                        <p>
                          {bestJob
                            ? `${bestJob.title} at ${bestJob.company} is your highest live match at ${bestJob.match}%.`
                            : "No hidden opportunity is currently matched to your profile."}
                        </p>
                      </div>
                    </article>
                    <article className="insight-item">
                      <div className="insight-item__icon"><Lightbulb size={19} /></div>
                      <div>
                        <h3>Most Requested Skills</h3>
                        <p>
                          {topSkills.length
                            ? `${topSkills.join(", ")} appear most often in your live matched roles.`
                            : "Skill demand will appear when matched roles are available."}
                        </p>
                      </div>
                    </article>
                  </div>
                </div>

                <button type="button" className="text-button" onClick={() => navigate("/career-roadmap")}>
                  View Full Career Insights <ArrowRight size={15} />
                </button>
              </section>

              <section className="activity-card panel">
                <div className="panel__heading">
                  <h2>Recruiter Activity</h2>
                  <button type="button" className="text-button" onClick={() => navigate("/applications")}>
                    View All <ArrowRight size={14} />
                  </button>
                </div>

                <div className="activity-row">
                  <div className="activity-row__icon activity-row__icon--purple"><Eye size={19} /></div>
                  <div><strong>Profile Views</strong><span>Recruiters viewed your profile</span></div>
                  <div className="activity-row__stat"><strong>{calculatedStats.profileViews}</strong></div>
                </div>
                <div className="activity-row">
                  <div className="activity-row__icon activity-row__icon--green"><BellRing size={19} /></div>
                  <div><strong>Invitations</strong><span>Current recruiter invitations</span></div>
                  <div className="activity-row__stat"><strong>{calculatedStats.recruiterInvites}</strong></div>
                </div>

                <button type="button" className="button button--wide" onClick={() => navigate("/applications")}>
                  Go to Applications <ArrowRight size={16} />
                </button>
              </section>
            </aside>
          </section>
        </>
      )}

      {selectedJob && (
        <div className="ho-modal" role="dialog" aria-modal="true" aria-labelledby="hidden-role-title" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedJob(null);
        }}>
          <div className="ho-modal__card">
            <button type="button" className="ho-modal__close" aria-label="Close role details" onClick={() => setSelectedJob(null)}>
              <X size={20} />
            </button>

            <span className="verified-pill"><ShieldCheck size={14} /> {selectedJob.opportunityType}</span>
            <h2 id="hidden-role-title">{selectedJob.title}</h2>
            <h3>{selectedJob.company}</h3>
            <p>{selectedJob.description || "The recruiter has not added a public description for this confidential role."}</p>

            <div className="ho-modal__details">
              <div><span>Location</span><strong>{selectedJob.location}</strong></div>
              <div><span>Experience</span><strong>{selectedJob.experience}</strong></div>
              <div><span>Salary</span><strong>{selectedJob.salary}</strong></div>
              <div><span>AI match</span><strong>{selectedJob.match}%</strong></div>
            </div>

            <div className="ho-modal__actions">
              <button
                type="button"
                className="button button--ghost"
                disabled={selectedJob.referralRequested || actionName !== ""}
                onClick={() => requestReferral(selectedJob)}
              >
                {actionName === "referral" ? "Requesting..." : selectedJob.referralRequested ? "Referral Requested" : "Request Referral"}
              </button>
              <button
                type="button"
                className="button button--wide"
                disabled={selectedJob.hasApplied || actionName !== ""}
                onClick={() => applyConfidentially(selectedJob)}
              >
                {actionName === "apply" ? "Applying..." : selectedJob.hasApplied ? "Already Applied" : "Apply Confidentially"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}