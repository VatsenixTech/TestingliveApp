import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./CareerRoadmapPage.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function CareerRoadmapPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const candidateId = user?._id || user?.candidateId || user?.id;
  const name = user?.name || user?.fullName || "Candidate";

  const [roadmap, setRoadmap] = useState(null);
  const [targetRole, setTargetRole] = useState(user?.role || user?.currentRole || "Data Engineer");
  const [durationMonths, setDurationMonths] = useState(12);
  const [currentLevel, setCurrentLevel] = useState("Beginner");
  const [activeTab, setActiveTab] = useState("Roadmap");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const allSkills = useMemo(() => {
    return (roadmap?.stages || []).flatMap((stage) =>
      (stage.skills || []).map((skill) => ({
        ...skill,
        stage: stage.title,
      }))
    );
  }, [roadmap]);

  const stats = {
    overallProgress: roadmap?.overallProgress || 0,
    skillsToLearn: allSkills.filter((s) => Number(s.progress || 0) < 100).length,
    projectCount: roadmap?.projects?.length || 0,
    estimatedTime: roadmap?.durationMonths || durationMonths,
    nextMilestone: roadmap?.nextMilestone?.title || "Not Available",
    nextMilestoneDays: roadmap?.nextMilestone?.dueInDays || 0,
  };

  function goTo(path) {
    window.location.href = path;
  }

  useEffect(() => {
    fetchRoadmap();
  }, [candidateId]);

  async function fetchRoadmap() {
    if (!candidateId) {
      setError("Candidate login required.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.get(`${API_BASE}/api/career-roadmap/${candidateId}`);
      const data = res.data.roadmap;

      setRoadmap(data || null);

      if (data) {
        setTargetRole(data.targetRole || targetRole);
        setCurrentLevel(data.currentLevel || currentLevel);
        setDurationMonths(data.durationMonths || durationMonths);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load career roadmap.");
    } finally {
      setLoading(false);
    }
  }

  async function generateRoadmap() {
    if (!candidateId) {
      alert("Please login again.");
      return;
    }

    try {
      setGenerating(true);

      const res = await axios.post(`${API_BASE}/api/career-roadmap/generate`, {
        candidateId,
        targetRole,
        currentLevel,
        durationMonths,
      });

      setRoadmap(res.data.roadmap);
      alert(res.data.message || "Career roadmap generated from your real profile data.");
    } catch (err) {
      alert(err.response?.data?.message || "Roadmap generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  async function updateProgress() {
    if (!roadmap?._id) return;

    try {
      const nextProgress = Math.min(100, Number(roadmap.overallProgress || 0) + 5);

      const res = await axios.patch(
        `${API_BASE}/api/career-roadmap/progress/${roadmap._id}`,
        { overallProgress: nextProgress }
      );

      setRoadmap(res.data.roadmap);
    } catch (err) {
      alert(err.response?.data?.message || "Progress update failed.");
    }
  }

  function downloadReport() {
    if (!roadmap) {
      alert("No roadmap available.");
      return;
    }

    const content = `
NoPromptJobs Career Roadmap Report

Candidate: ${name}
Target Role: ${roadmap.targetRole}
Current Level: ${roadmap.currentLevel}
Duration: ${roadmap.durationMonths} Months
Overall Progress: ${roadmap.overallProgress}%

Stages:
${(roadmap.stages || [])
  .map((s) => `Stage ${s.stageNo}: ${s.title} - ${s.timeline} - ${s.status} - ${s.progress}%`)
  .join("\n")}

Skills:
${allSkills.map((skill) => `${skill.name}: ${skill.progress}%`).join("\n")}

Projects:
${(roadmap.projects || []).map((p) => `${p.title} - ${p.status}`).join("\n")}

Milestones:
${(roadmap.milestones || []).map((m) => `${m.title} - ${m.dueInDays} days - ${m.status}`).join("\n")}
`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const file = document.createElement("a");

    file.href = url;
    file.download = "career-roadmap-report.txt";
    file.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="cr-page">
      <aside className="cr-sidebar">
        <div className="cr-logo">
          <img src="/logo.png" alt="NoPromptJobs" />
        </div>

        <nav className="cr-menu">
          <button onClick={() => goTo("/ultimate-dashboard")}>🏠 Dashboard</button>
          <button onClick={() => goTo("/resume-studio")}>📄 AI Resume Review</button>
          <button onClick={() => goTo("/services")}>🤖 AI Workspace</button>
          <button onClick={() => goTo("/skill-analyzer")}>📊 Skill Analyzer</button>
          <button className="active">🧭 Career Roadmap</button>
          <button onClick={() => goTo("/salary-predictor")}>💰 Salary Predictor</button>
          <button onClick={() => goTo("/job-alerts")}>🔔 Job Alerts</button>
          <button onClick={() => goTo("/saved-jobs")}>❤️ Saved Jobs</button>
          <button onClick={() => goTo("/hidden-opportunities")}>💎 Hidden Opportunities</button>
          <button onClick={() => goTo("/ai-interview-prep")}>🎤 AI Interview Prep</button>
          <button onClick={() => goTo("/ai-interview-prep?tab=Question%20Bank")}>📚 Question Bank</button>
          <button onClick={() => goTo("/applications")}>📂 Applications</button>
          <button onClick={() => goTo("/ai-interview-prep?tab=My%20Reports")}>📄 Reports</button>
          <button onClick={() => goTo("/trust-passport")}>🛡 Trust Passport</button>
          <button onClick={() => goTo("/settings")}>⚙ Settings</button>
        </nav>
      </aside>

      <section className="cr-main">
        <header className="cr-topbar">
          <div className="cr-search">
            <span>⌕</span>
            <input placeholder="Search roadmap skills, projects, resources..." />
            <b>⌘ K</b>
          </div>

          <button className="cr-ai" onClick={() => goTo("/services")}>
            ✨ AI Assistant
          </button>

          <div className="cr-user">
            <img src={user?.profileImageUrl || "/profile.png"} alt="Candidate" />
            <div>
              <h4>{name}</h4>
              <p>{roadmap?.targetRole || targetRole}</p>
            </div>
          </div>
        </header>

        <section className="cr-header">
          <div>
            <h1>Career Roadmap</h1>
            <p>Generated from your real candidate profile, skills and target role.</p>
          </div>

          <div className="cr-actions">
            <button onClick={fetchRoadmap}>⟳ Refresh</button>
            <button onClick={downloadReport}>⬇ Download Report</button>
          </div>
        </section>

        <section className="cr-controls">
          <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>
            <option>Data Engineer</option>
            <option>Frontend Developer</option>
            <option>Backend Developer</option>
            <option>Full Stack Developer</option>
            <option>DevOps Engineer</option>
            <option>Data Scientist</option>
            <option>Cybersecurity Analyst</option>
            <option>SAP Consultant</option>
          </select>

          <select value={durationMonths} onChange={(e) => setDurationMonths(Number(e.target.value))}>
            <option value={3}>Next 3 Months</option>
            <option value={6}>Next 6 Months</option>
            <option value={12}>Next 12 Months</option>
            <option value={18}>Next 18 Months</option>
          </select>

          <select value={currentLevel} onChange={(e) => setCurrentLevel(e.target.value)}>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>

          <button onClick={generateRoadmap} disabled={generating}>
            {generating ? "Generating..." : "Generate From My Profile"}
          </button>
        </section>

        {loading && <div className="cr-empty">Loading career roadmap...</div>}
        {error && !loading && <div className="cr-empty">{error}</div>}

        {!loading && !error && !roadmap && (
          <div className="cr-empty">
            No roadmap found for your profile. Select target role and click
            <b> Generate From My Profile</b>.
          </div>
        )}

        {!loading && !error && roadmap && (
          <>
            <section className="cr-stats">
              <article>
                <div className="cr-ring">{stats.overallProgress}%</div>
                <p>Overall Progress</p>
                <h2>{stats.overallProgress}%</h2>
                <small>Saved in MongoDB</small>
              </article>

              <article>
                <div>🧩</div>
                <p>Skills Remaining</p>
                <h2>{stats.skillsToLearn}</h2>
                <small>Based on your real profile gap</small>
              </article>

              <article>
                <div>🎁</div>
                <p>Project Milestones</p>
                <h2>{stats.projectCount}</h2>
                <small>From roadmap data</small>
              </article>

              <article>
                <div>⏱</div>
                <p>Estimated Time</p>
                <h2>{stats.estimatedTime} Months</h2>
                <small>Selected timeline</small>
              </article>

              <article>
                <div>🎯</div>
                <p>Next Milestone</p>
                <h2>{stats.nextMilestone}</h2>
                <small>In {stats.nextMilestoneDays} days</small>
              </article>
            </section>

            <section className="cr-layout">
              <section className="cr-center">
                <div className="cr-tabs">
                  {["Roadmap", "Skills", "Projects", "Resources", "Milestones", "Assessments"].map((tab) => (
                    <button
                      key={tab}
                      className={activeTab === tab ? "active" : ""}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {activeTab === "Roadmap" && (
                  <div className="cr-timeline">
                    {(roadmap.stages || []).map((stage) => (
                      <article className={`cr-stage stage-${stage.stageNo}`} key={stage._id || stage.stageNo}>
                        <div className="stage-left">
                          <span>{stage.stageNo}</span>
                          <b>STAGE {stage.stageNo}</b>
                          <p>{stage.timeline}</p>
                        </div>

                        <div className="stage-main">
                          <h3>{stage.title}</h3>
                          <p>{stage.subtitle}</p>

                          <div className="stage-skills">
                            {(stage.skills || []).map((skill) => (
                              <span key={skill.name}>
                                {skill.name}
                                <b>{skill.progress}%</b>
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="stage-status">
                          <small>{stage.status}</small>
                          <h2>{stage.progress}%</h2>
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                {activeTab === "Skills" && (
                  <div className="cr-grid">
                    {allSkills.map((skill) => (
                      <div className="cr-card" key={`${skill.stage}-${skill.name}`}>
                        <h3>{skill.name}</h3>
                        <p>{skill.stage}</p>
                        <div className="cr-progress">
                          <span style={{ width: `${skill.progress}%` }}></span>
                        </div>
                        <b>{skill.progress}% Completed</b>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "Projects" && (
                  <div className="cr-grid">
                    {(roadmap.projects || []).map((project) => (
                      <div className="cr-card" key={project._id || project.title}>
                        <h3>{project.title}</h3>
                        <p>{project.description}</p>
                        <span className="project-status">{project.status}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "Resources" && (
                  <div className="cr-grid">
                    {(roadmap.resources || []).map((resource) => (
                      <div className="cr-card" key={resource._id || resource.title}>
                        <h3>{resource.title}</h3>
                        <p>By {resource.provider}</p>
                        <b>⭐ {resource.rating || "-"}</b>
                        <button
                          onClick={() =>
                            resource.url
                              ? goTo(resource.url)
                              : alert("No resource URL saved for this item.")
                          }
                        >
                          Open Resource →
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "Milestones" && (
                  <div className="cr-grid">
                    {(roadmap.milestones || []).map((milestone) => (
                      <div className="cr-card" key={milestone._id || milestone.title}>
                        <h3>{milestone.title}</h3>
                        <p>Due in {milestone.dueInDays} days</p>
                        <span className="project-status">{milestone.status}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "Assessments" && (
                  <div className="cr-grid">
                    <div className="cr-card">
                      <h3>Skill Assessment</h3>
                      <p>Use your real skills to check readiness.</p>
                      <button onClick={() => goTo("/skill-analyzer")}>Start Assessment →</button>
                    </div>

                    <div className="cr-card">
                      <h3>Mock Interview</h3>
                      <p>Practice based on selected target role.</p>
                      <button onClick={() => goTo("/ai-interview-prep")}>Start Interview →</button>
                    </div>
                  </div>
                )}
              </section>

              <aside className="cr-right">
                <div className="cr-side-card goal">
                  <div className="side-head">
                    <h3>Your Career Goal</h3>
                    <button onClick={generateRoadmap}>Regenerate</button>
                  </div>

                  <h2>{roadmap.targetRole}</h2>
                  <p>Level: {roadmap.currentLevel}</p>
                  <p>Timeline: {roadmap.durationMonths} months</p>
                  <p>Progress: {roadmap.overallProgress}%</p>

                  <div className="cr-progress">
                    <span style={{ width: `${roadmap.overallProgress}%` }}></span>
                  </div>

                  <button onClick={updateProgress}>Update Progress</button>
                </div>

                <div className="cr-side-card">
                  <h3>Recommended for You</h3>

                  {(roadmap.resources || []).slice(0, 3).map((resource) => (
                    <div className="resource-row" key={resource._id || resource.title}>
                      <div>📘</div>
                      <section>
                        <b>{resource.title}</b>
                        <p>By {resource.provider}</p>
                        <small>⭐ {resource.rating || "-"}</small>
                      </section>
                    </div>
                  ))}

                  <button onClick={() => setActiveTab("Resources")}>View All Recommendations →</button>
                </div>

                <div className="cr-side-card">
                  <h3>Upcoming Milestones</h3>

                  {(roadmap.milestones || []).slice(0, 3).map((milestone) => (
                    <div className="milestone-row" key={milestone._id || milestone.title}>
                      <span></span>
                      <section>
                        <b>{milestone.title}</b>
                        <p>In {milestone.dueInDays} days</p>
                      </section>
                    </div>
                  ))}

                  <button onClick={() => setActiveTab("Milestones")}>View All Milestones →</button>
                </div>
              </aside>
            </section>
          </>
        )}
      </section>
    </main>
  );
}

export default CareerRoadmapPage;