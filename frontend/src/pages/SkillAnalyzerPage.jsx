import { useEffect, useState } from "react";
import axios from "axios";
import "./SkillAnalyzerPage.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function SkillAnalyzerPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const candidateId = user?._id || user?.candidateId || user?.id;
  const candidateName = user?.name || user?.fullName || "Candidate";

  const [targetRole, setTargetRole] = useState("Data Engineer");
  const [currentSkills, setCurrentSkills] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    loadLatestAnalysis();
  }, []);

  async function loadLatestAnalysis() {
    if (!candidateId) return;

    try {
      const res = await axios.get(
        `${API_URL}/api/skill-analyzer/latest/${candidateId}`
      );

      if (res.data.latest) {
        setAnalysis(res.data.latest);
        setTargetRole(res.data.latest.targetRole || "Data Engineer");
        setCurrentSkills((res.data.latest.currentSkills || []).join(", "));
      }
    } catch (error) {
      console.log("Latest skill analysis error:", error);
    }
  }

  async function analyzeSkillGap() {
    if (!candidateId) {
      alert("Please login again.");
      window.location.href = "/candidate-login";
      return;
    }

    if (!currentSkills.trim()) {
      alert("Please enter your current skills.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_URL}/api/skill-analyzer/analyze`, {
        candidateId,
        candidateName,
        targetRole,
        currentSkills,
      });

      setAnalysis(res.data);
    } catch (error) {
      alert(error.response?.data?.message || "Skill analysis failed");
    } finally {
      setLoading(false);
    }
  }

  function exportReport() {
    if (!analysis) {
      alert("Please analyze skills first.");
      return;
    }

    const text = `
NoPromptJobs Skill Analyzer Report

Candidate: ${candidateName}
Target Role: ${targetRole}
Overall Score: ${analysis.overallScore}%

Strong Skills:
${(analysis.strongSkills || []).join(", ")}

Missing Skills:
${(analysis.missingSkills || []).join(", ")}

Roadmap:
${(analysis.roadmap || [])
  .map((r) => `${r.title} - ${r.level} - ${r.duration}`)
  .join("\n")}

Career Matches:
${(analysis.careerMatches || [])
  .map((r) => `${r.role}: ${r.match}%`)
  .join("\n")}

AI Insights:
${analysis.aiInsights}
`;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "skill-analyzer-report.txt";
    a.click();

    URL.revokeObjectURL(url);
  }

  function goTo(path) {
    window.location.href = path;
  }

  const score = analysis?.overallScore || 0;
  const strongSkills = analysis?.strongSkills || [];
  const missingSkills = analysis?.missingSkills || [];
  const roadmap = analysis?.roadmap || [];
  const careerMatches = analysis?.careerMatches || [];

  return (
    <main className="sa-page">
      <aside className="sa-sidebar">
        <div className="sa-brand">
  <img src="/logo.png" alt="NoPromptJobs" className="sa-logo" />
</div>
        <nav>
          <button className="active">✦ Skill Analyzer</button>
          <button onClick={() => goTo("/career-roadmap")}>
            ✧ AI Career Gap Roadmap
          </button>
          <button onClick={() => goTo("/ai-interview-prep")}>
            🎙 Live Interview
          </button>
          <button onClick={() => goTo("/question-bank")}>
            📚 Question Bank
          </button>
          <button onClick={() => goTo("/resume-studio")}>
            📄 Resume Studio
          </button>
          <button onClick={() => goTo("/settings")}>⚙ Settings</button>
        </nav>

        
        <div className="sa-profile">
          <span>{candidateName.slice(0, 2).toUpperCase()}</span>
          <div>
            <b>{candidateName}</b>
            <p>{targetRole}</p>
          </div>
        </div>
      </aside>

      <section className="sa-main">
        <header className="sa-topbar">
          <div>
            <h1>✧ Skill Analyzer</h1>
            <p>
              Discover your strengths, identify skill gaps and get your
              personalized career roadmap.
            </p>
          </div>

          <input placeholder="Search skills, roles or topics..." />

          <button onClick={exportReport}>⬇ Export Report</button>

          <div className="sa-avatar">
            {candidateName.slice(0, 2).toUpperCase()}
          </div>
        </header>

        <section className="sa-hero">
          <div className="sa-score-ring">
            <strong>{score}%</strong>
            <span>{score >= 75 ? "Good" : score > 0 ? "Needs Work" : "Ready"}</span>
          </div>

          <div>
            <h2>
              {score
                ? `You’re doing great, ${candidateName}! 👋`
                : `Analyze your skills, ${candidateName}`}
            </h2>
            <p>
              {score
                ? analysis.aiInsights
                : "Enter your skills and target role to generate your AI-powered skill roadmap."}
            </p>

            <div className="sa-hero-actions">
              <button onClick={analyzeSkillGap}>
                {loading ? "Analyzing..." : "Analyze Skill Gap"}
              </button>
              <button onClick={() => goTo("/career-roadmap")}>
                AI Roadmap →
              </button>
            </div>
          </div>

          <div className="sa-hero-art">
            <span>AI Powered</span>
            <div>📊</div>
          </div>
        </section>

        <section className="sa-grid">
          <div className="sa-card sa-input-card">
            <h2>Your Current Skills</h2>

            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            >
              <option>Data Engineer</option>
              <option>Frontend Developer</option>
              <option>Backend Developer</option>
              <option>DevOps</option>
              <option>Data Scientist</option>
            </select>

            <textarea
              value={currentSkills}
              onChange={(e) => setCurrentSkills(e.target.value)}
              placeholder="Example: Python, SQL, PySpark, Hadoop, AWS, Azure, Git..."
            />

            <button onClick={analyzeSkillGap} disabled={loading}>
              {loading ? "Analyzing Skill Gap..." : "Analyze Skill Gap →"}
            </button>
          </div>

          <div className="sa-card">
            <h2>At a Glance</h2>

            <div className="sa-glance-row">
              <span>Skills Analyzed</span>
              <b>{analysis?.currentSkills?.length || 0}</b>
            </div>

            <div className="sa-glance-row green">
              <span>Strong Skills</span>
              <b>{strongSkills.length}</b>
            </div>

            <div className="sa-glance-row orange">
              <span>Need Improvement</span>
              <b>{missingSkills.length}</b>
            </div>

            <div className="sa-glance-row blue">
              <span>Career Match</span>
              <b>{score}%</b>
            </div>
          </div>

          <div className="sa-card big">
            <h2>Skill Category Breakdown</h2>

            {strongSkills.length === 0 ? (
              <div className="sa-empty">Run analysis to see skill breakdown.</div>
            ) : (
              strongSkills.map((skill, index) => (
                <div className="sa-bar-row" key={skill}>
                  <p>
                    {skill} <b>{Math.max(90 - index * 5, 65)}%</b>
                  </p>
                  <div>
                    <span style={{ width: `${Math.max(90 - index * 5, 65)}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="sa-card">
            <h2>Top Strengths</h2>

            {strongSkills.length === 0 ? (
              <div className="sa-empty">No strengths analyzed yet.</div>
            ) : (
              strongSkills.slice(0, 6).map((skill) => (
                <div className="sa-list-row" key={skill}>
                  ✅ {skill}
                </div>
              ))
            )}
          </div>

          <div className="sa-card">
            <h2>Recommended Next Steps</h2>

            {roadmap.length === 0 ? (
              <div className="sa-empty">Roadmap will appear here.</div>
            ) : (
              roadmap.map((item) => (
                <div className="sa-roadmap-row" key={item.title}>
                  <b>{item.title}</b>
                  <p>{item.level} • {item.duration}</p>
                  <span>{item.priority}</span>
                </div>
              ))
            )}
          </div>
<div className="sa-card big">
  <h2>Skill Gap Analysis</h2>

  {missingSkills.length === 0 ? (
    <div className="sa-empty">No missing skills detected yet.</div>
  ) : (
    missingSkills.map((skill) => (
      <div className="sa-gap-row" key={skill}>
        <span>{skill}</span>
        <b>Required</b>

        <button
          onClick={() => {
            alert(
`🚀 Learning Center Coming Soon!

We are planning to launch NoPromptJobs Learning Center soon.

For now, you can start learning "${skill}" from:

✅ YouTube
✅ Google
✅ Official Documentation
✅ freeCodeCamp
✅ Microsoft Learn
✅ AWS Skill Builder
✅ Coursera

Soon, we will provide complete roadmaps, projects, interview questions, mock tests and AI mentor support inside NoPromptJobs.`
            );
          }}
        >
          Learn →
        </button>
      </div>
    ))
  )}
</div>
          <div className="sa-card">
            <h2>Career Matches</h2>

            {careerMatches.length === 0 ? (
              <div className="sa-empty">Career matches will appear here.</div>
            ) : (
              careerMatches.map((item) => (
                <div className="sa-match-row" key={item.role}>
                  <p>{item.role}</p>
                  <b>{item.match}%</b>
                  <div>
                    <span style={{ width: `${item.match}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="sa-card">
            <h2>AI Insights</h2>
            <p className="sa-insight">
              {analysis?.aiInsights ||
                "AI insights will appear after skill analysis."}
            </p>

            <button onClick={() => goTo("/jobs")}>View Matching Jobs →</button>
          </div>
        </section>
      </section>
    </main>
  );
}

export default SkillAnalyzerPage;