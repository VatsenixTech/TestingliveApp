import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./CareerRoadmapPage.css";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const ICONS = {
  target: "◎",
  calendar: "▣",
  level: "▥",
  refresh: "↻",
  export: "⇩",
  search: "⌕",
  bell: "♟",
  message: "□",
  skill: "◇",
  project: "⌘",
  streak: "♨",
  milestone: "◉",
  check: "✓",
  resource: "▤",
  lock: "▣",
};

const asArray = (value) => (Array.isArray(value) ? value : []);
const number = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const clamp = (value) => Math.min(100, Math.max(0, number(value)));

function normalizeRoadmap(payload) {
  const source = payload?.roadmap || payload?.data?.roadmap || payload?.data || payload || {};
  const stages = asArray(source.stages || source.phases || source.roadmapStages).map(
    (stage, index) => ({
      ...stage,
      id: stage._id || stage.id || stage.stageId || String(index + 1),
      title: stage.title || stage.name || stage.stageName || `Stage ${index + 1}`,
      timeline:
        stage.timeline ||
        stage.duration ||
        (stage.startMonth && stage.endMonth
          ? `Months ${stage.startMonth}–${stage.endMonth}`
          : "Timeline not set"),
      progress: clamp(stage.progress ?? stage.completionPercentage),
      skills: asArray(stage.skills || stage.topics || stage.competencies).map((skill) =>
        typeof skill === "string"
          ? { name: skill, completed: false }
          : {
              ...skill,
              name: skill.name || skill.title || skill.skillName || "Skill",
              completed: Boolean(skill.completed || skill.isCompleted),
            }
      ),
      status: stage.status || (number(stage.progress) >= 100 ? "completed" : index === 0 ? "active" : "upcoming"),
    })
  );

  return {
    ...source,
    id: source._id || source.id,
    targetRole: source.targetRole || source.role || source.careerGoal || "",
    timeline: source.timeline || source.duration || (source.durationMonths ? `${source.durationMonths} Months` : ""),
    experienceLevel: source.experienceLevel || source.currentLevel || source.level || "",
    progress: clamp(source.progress ?? source.overallProgress),
    stages,
    milestones: asArray(source.milestones || source.upcomingMilestones).map((milestone) => ({
      ...milestone,
      dueIn: milestone.dueIn || (milestone.dueInDays != null ? `${milestone.dueInDays} days` : ""),
    })),
    resources: asArray(source.resources || source.recommendedResources),
  };
}

function ProgressRing({ value }) {
  const progress = clamp(value);
  return (
    <div
      className="cr-progress-ring"
      style={{ "--cr-progress": `${progress * 3.6}deg` }}
      aria-label={`${progress}% complete`}
    >
      <div>{progress}%</div>
    </div>
  );
}

function MetricCard({ icon, tone, label, value, suffix, note, progress }) {
  return (
    <article className="cr-metric-card">
      {label === "Overall Progress" ? (
        <ProgressRing value={progress} />
      ) : (
        <span className={`cr-metric-icon ${tone || "blue"}`}>{icon}</span>
      )}
      <div className="cr-metric-copy">
        <span>{label}</span>
        <strong>
          {value} {suffix && <small>{suffix}</small>}
        </strong>
        <p>{note}</p>
      </div>
      {typeof progress === "number" && label !== "Overall Progress" && (
        <div className="cr-mini-progress">
          <i style={{ width: `${clamp(progress)}%` }} />
        </div>
      )}
    </article>
  );
}

function CareerRoadmapPage() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [savingStage, setSavingStage] = useState("");
  const [error, setError] = useState("");
  const [expandedStage, setExpandedStage] = useState("");
  const [form, setForm] = useState({
    targetRole: "",
    timeline: "12 Months",
    experienceLevel: "Advanced",
  });

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const candidateId = user?.candidateId || user?._id || user?.id || "";
  const goTo = (path) => { window.location.href = path; };

  const requestConfig = useMemo(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("candidateToken");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }, []);

  const loadRoadmap = useCallback(async ({ quiet = false } = {}) => {
    if (!candidateId) {
      goTo("/candidate-login");
      return;
    }

    try {
      if (!quiet) setLoading(true);
      setError("");
      const response = await axios.get(
        `${API_URL}/api/career-roadmap/${candidateId}`,
        requestConfig
      );
      const normalized = normalizeRoadmap(response.data);
      setRoadmap(normalized);
      setForm({
        targetRole: normalized.targetRole || user?.targetRole || user?.desiredRole || "",
        timeline: normalized.timeline || "12 Months",
        experienceLevel: normalized.experienceLevel || user?.experienceLevel || "Advanced",
      });
    } catch (requestError) {
      if (requestError.response?.status === 404) {
        setRoadmap(null);
        setForm((current) => ({
          ...current,
          targetRole: user?.targetRole || user?.desiredRole || "",
          experienceLevel: user?.experienceLevel || current.experienceLevel,
        }));
      } else {
        setError(requestError.response?.data?.message || "Unable to load your career roadmap.");
      }
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [candidateId, requestConfig, user]);

  useEffect(() => {
    loadRoadmap();
  }, [loadRoadmap]);

  const generateRoadmap = async () => {
    if (!form.targetRole.trim()) {
      setError("Please enter your target role before generating the roadmap.");
      return;
    }

    try {
      setGenerating(true);
      setError("");
      const response = await axios.post(
        `${API_URL}/api/career-roadmap/generate`,
        {
          candidateId,
          targetRole: form.targetRole.trim(),
          durationMonths: Number.parseInt(form.timeline, 10) || 12,
          currentLevel: form.experienceLevel,
        },
        requestConfig
      );
      setRoadmap(normalizeRoadmap(response.data));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Roadmap generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const updateStageProgress = async (stage) => {
    const roadmapId = roadmap?.id || roadmap?._id;
    if (!roadmapId) return;

    try {
      setSavingStage(stage.id);
      setError("");
      await axios.patch(
        `${API_URL}/api/career-roadmap/progress/${roadmapId}`,
        { overallProgress: Math.min(100, overallProgress + 5) },
        requestConfig
      );
      await loadRoadmap({ quiet: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not update this stage.");
    } finally {
      setSavingStage("");
    }
  };

  const exportPlan = () => {
    if (!roadmap) return;
    const blob = new Blob([JSON.stringify(roadmap, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(roadmap.targetRole || "career").replace(/\s+/g, "-").toLowerCase()}-roadmap.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const stages = roadmap?.stages || [];
  const completedSkills = stages.flatMap((stage) => stage.skills).filter((skill) => skill.completed).length;
  const totalSkills = stages.reduce((total, stage) => total + stage.skills.length, 0);
  const projects = asArray(roadmap?.projects);
  const completedProjects = projects.filter((project) => project.completed || project.isCompleted).length;
  const overallProgress = roadmap?.progress || (stages.length
    ? Math.round(stages.reduce((sum, stage) => sum + stage.progress, 0) / stages.length)
    : 0);

  const filteredStages = stages;

  const nextMilestone = roadmap?.milestones?.[0];
  return (
      <main className="career-roadmap-page">
        <section className="cr-shell">
          <div className="cr-content">
            <section className="cr-heading-row">
              <div>
                <div className="cr-title-line">
                  <h1>Career Roadmap</h1>
                  <span className="cr-ai-badge">✣ AI Personalized</span>
                </div>
                <p>Your personalized path to becoming a <strong>{roadmap?.targetRole || form.targetRole || "career professional"}</strong></p>
              </div>
              <div className="cr-heading-actions">
                <button type="button" onClick={generateRoadmap} disabled={generating}>
                  {ICONS.refresh} {generating ? "Generating..." : "Regenerate Roadmap"}
                </button>
                <button type="button" onClick={exportPlan} disabled={!roadmap}>{ICONS.export} Export Plan</button>
              </div>
            </section>

            {error && <div className="cr-error"><span>!</span>{error}<button onClick={() => setError("")}>×</button></div>}

            <section className="cr-controls">
              <label><span>{ICONS.target}</span><small>Target Role</small><input value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })} placeholder="e.g. Data Engineer" /></label>
              <label><span>{ICONS.calendar}</span><small>Timeline</small><select value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })}><option>6 Months</option><option>12 Months</option><option>18 Months</option><option>24 Months</option></select></label>
              <label><span>{ICONS.level}</span><small>Experience Level</small><select value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
            </section>

            {loading ? (
              <section className="cr-loading-grid">{Array.from({ length: 10 }).map((_, index) => <div key={index} />)}</section>
            ) : !roadmap || stages.length === 0 ? (
              <section className="cr-empty-state">
                <div className="cr-empty-icon">◎</div>
                <h2>Create your personalized career roadmap</h2>
                <p>We will analyze your real profile, skills and target role to build a practical learning plan.</p>
                <button onClick={generateRoadmap} disabled={generating}>{generating ? "Analyzing profile..." : "Generate From My Profile →"}</button>
              </section>
            ) : (
              <>
                <section className="cr-metrics">
                  <MetricCard label="Overall Progress" progress={overallProgress} value={overallProgress} note="Keep going! You're on track." />
                  <MetricCard icon={ICONS.skill} tone="green" label="Skills Completed" value={`${completedSkills}/${totalSkills}`} progress={totalSkills ? (completedSkills / totalSkills) * 100 : 0} note={`${totalSkills ? Math.round((completedSkills / totalSkills) * 100) : 0}% of skills mastered`} />
                  <MetricCard icon={ICONS.project} tone="purple" label="Projects" value={`${completedProjects}/${projects.length || roadmap?.projectCount || 0}`} progress={projects.length ? (completedProjects / projects.length) * 100 : 0} note="Portfolio projects completed" />
                  <MetricCard icon={ICONS.streak} tone="orange" label="Learning Streak" value={number(roadmap.learningStreak)} suffix="days" note="Build consistency every day" />
                  <MetricCard icon={ICONS.milestone} tone="blue" label="Next Milestone" value={nextMilestone?.title || nextMilestone?.name || "Not scheduled"} note={nextMilestone?.dueIn || nextMilestone?.dueDate || "Keep progressing"} />
                </section>

                <section className="cr-dashboard-grid">
                  <div className="cr-roadmap-list">
                    {filteredStages.length ? filteredStages.map((stage, index) => {
                      const expanded = expandedStage === stage.id;
                      const locked = stage.status === "locked";
                      return (
                        <article className={`cr-stage-card ${stage.status}`} key={stage.id}>
                          <div className="cr-stage-number">{index + 1}</div>
                          <div className="cr-stage-main">
                            <div className="cr-stage-title"><h3>{stage.title}</h3><span>{stage.status}</span><small>{stage.timeline}</small></div>
                            <div className="cr-stage-skills">
                              {stage.skills.slice(0, expanded ? undefined : 4).map((skill, skillIndex) => <span key={`${stage.id}-${skillIndex}`} className={skill.completed ? "done" : ""}>{skill.completed ? ICONS.check : "•"} {skill.name}</span>)}
                            </div>
                            <div className="cr-stage-progress"><i style={{ width: `${stage.progress}%` }} /></div>
                          </div>
                          <div className="cr-stage-status"><strong>{stage.progress}%</strong><small>Complete</small></div>
                          <div className="cr-stage-actions">
                            <button disabled={locked || savingStage === stage.id} onClick={() => updateStageProgress(stage)}>{locked ? `${ICONS.lock} Locked` : savingStage === stage.id ? "Saving..." : stage.progress > 0 ? "Continue Learning" : "Start Stage"}</button>
                            <button onClick={() => setExpandedStage(expanded ? "" : stage.id)}>{expanded ? "Hide Details" : "View Details"} →</button>
                          </div>
                        </article>
                      );
                    }) : <div className="cr-no-results">No roadmap stages are available.</div>}
                  </div>

                  <aside className="cr-right-column">
                    <article className="cr-side-card cr-goal-card"><h3>{ICONS.target} Your Career Goal</h3><div><span>On Track</span><strong>{roadmap.targetRole}</strong><p>{roadmap.goalDescription || `Build the skills and experience needed for ${roadmap.targetRole}.`}</p><small>{ICONS.calendar} Target Timeline: {roadmap.timeline}</small></div></article>
                    <article className="cr-side-card"><header><h3>⚑ Upcoming Milestones</h3><button onClick={() => goTo("/career-roadmap/milestones")}>View All</button></header>{roadmap.milestones.length ? roadmap.milestones.slice(0, 4).map((milestone, index) => <div className="cr-milestone" key={milestone._id || milestone.id || index}><i>{index + 1}</i><p><strong>{milestone.title || milestone.name}</strong><small>{milestone.description || milestone.subtitle || "Roadmap milestone"}</small></p><span>{milestone.dueIn || milestone.dueDate || "Upcoming"}</span></div>) : <p className="cr-side-empty">No milestones scheduled yet.</p>}</article>
                    <article className="cr-side-card"><header><h3>Recommended Resources</h3><button onClick={() => goTo("/resources")}>View All</button></header>{roadmap.resources.length ? roadmap.resources.slice(0, 3).map((resource, index) => <button className="cr-resource" key={resource._id || resource.id || index} onClick={() => resource.url && window.open(resource.url, "_blank", "noopener,noreferrer")}><i>{ICONS.resource}</i><p><strong>{resource.title || resource.name}</strong><small>{resource.provider || resource.source || "Learning resource"}</small></p><span>{resource.rating ? `${resource.rating} ★` : "Open →"}</span></button>) : <p className="cr-side-empty">Resources will appear after your roadmap is generated.</p>}</article>
                  </aside>
                </section>
              </>
            )}
          </div>
        </section>
      </main>
  );
}

export default CareerRoadmapPage;