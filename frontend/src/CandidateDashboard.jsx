import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CandidateDashboard.css";

function CandidateDashboard() {
  const navigate = useNavigate();

  const user = useMemo(() => {
    return JSON.parse(localStorage.getItem("user")) || {};
  }, []);

  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState(user);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [resumeScore, setResumeScore] = useState(0);
  const [selectedRole, setSelectedRole] = useState("React Developer");
  const [skillsInput, setSkillsInput] = useState(user?.skills?.join(", ") || "");
  const [experienceInput, setExperienceInput] = useState(user?.experience || "");
  const [projectsInput, setProjectsInput] = useState(user?.projects || "");
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [profileRes, jobsRes, applicationsRes] = await Promise.all([
          fetch(`${API}/api/candidates/profile`, { headers }),
          fetch(`${API}/api/jobs/recommended`, { headers }),
          fetch(`${API}/api/applications/my-applications`, { headers }),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
          setSkillsInput(profileData?.skills?.join(", ") || "");
          setExperienceInput(profileData?.experience || "");
          setProjectsInput(profileData?.projects || "");
          setResumeScore(profileData?.resumeScore || 0);
        }

        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          setJobs(Array.isArray(jobsData) ? jobsData : jobsData.jobs || []);
        }

        if (applicationsRes.ok) {
          const appData = await applicationsRes.json();
          setApplications(Array.isArray(appData) ? appData : appData.applications || []);
        }
      } catch (error) {
        console.error("Dashboard loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [API, token]);

  const calculateResumeScore = () => {
    let score = 0;

    if (profile?.name) score += 10;
    if (profile?.email) score += 10;
    if (profile?.phone) score += 10;
    if (skillsInput.trim()) score += 20;
    if (experienceInput.trim()) score += 15;
    if (projectsInput.trim()) score += 15;
    if (profile?.resumeUrl) score += 20;

    setResumeScore(score);
  };

  const askCareerAI = () => {
    if (!aiQuestion.trim()) {
      setAiAnswer("Please enter your career question.");
      return;
    }

    setAiAnswer(
      `Based on your profile, focus on ${missingSkills.slice(0, 2).join(
        " and "
      ) || "advanced projects"} to improve your chances for ${selectedRole} roles.`
    );
  };

  const applyJob = async (jobId) => {
    try {
      const res = await fetch(`${API}/api/applications/apply/${jobId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert("Applied successfully");
      } else {
        alert("Already applied or failed to apply");
      }
    } catch (error) {
      alert("Something went wrong");
    }
  };

  const skills = skillsInput
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const missingSkills = ["TypeScript", "Redux", "System Design", "API Integration"].filter(
    (skill) => !skills.map((s) => s.toLowerCase()).includes(skill.toLowerCase())
  );

  if (loading) {
    return <div className="candidate-loading">Loading dashboard...</div>;
  }

  return (
    <div className="candidate-dashboard">
      <aside className="candidate-sidebar">
        <div className="candidate-profile-box">
          <img src={profile?.profileImage || "/logo.png"} alt="Profile" />
          <h3>{profile?.name || "Candidate"}</h3>
          <p>{profile?.email}</p>

          {profile?.isVerified ? (
            <span className="verified-badge">✅ Verified Candidate</span>
          ) : (
            <span className="pending-badge">Verification Pending</span>
          )}
        </div>

        <button>Dashboard</button>
        <button>AI Resume Builder</button>
        <button>Smart Apply</button>
        <button>Skill Gap</button>
        <button>Interview Prep</button>
        <button onClick={handleLogout}>Logout</button>
      </aside>

      <main className="candidate-main">
        <section className="candidate-hero">
          <div>
            <h1>Good Evening, {profile?.name || "Candidate"} 👋</h1>
            <p>Your AI-powered NoPromptJobs career dashboard.</p>
          </div>

          <div className="resume-score-circle">
            <strong>{resumeScore}%</strong>
            <span>Resume Score</span>
          </div>
        </section>

        <section className="candidate-stats">
          <div><h3>{jobs.length}</h3><p>Matched Jobs</p></div>
          <div><h3>{applications.length}</h3><p>Applied Jobs</p></div>
          <div><h3>{profile?.profileViews || 0}</h3><p>Profile Views</p></div>
          <div><h3>{profile?.recruiterInterest || 0}</h3><p>Recruiter Interest</p></div>
        </section>

        <section className="candidate-grid">
          <div className="candidate-card">
            <h2>AI Resume Builder</h2>
            <p>Create ATS-friendly resume using your real profile details.</p>

            <input value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} placeholder="Skills: React, Node, MongoDB" />
            <input value={experienceInput} onChange={(e) => setExperienceInput(e.target.value)} placeholder="Experience: Fresher / 2 years" />
            <textarea value={projectsInput} onChange={(e) => setProjectsInput(e.target.value)} placeholder="Projects" />

            <button onClick={calculateResumeScore}>Check Resume Score</button>

            <div className="progress-bar">
              <span style={{ width: `${resumeScore}%` }}></span>
            </div>
          </div>

          <div className="candidate-card">
            <h2>AI Skill Gap Analyzer</h2>

            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
              <option>React Developer</option>
              <option>Node.js Developer</option>
              <option>Java Developer</option>
              <option>Data Analyst</option>
              <option>Data Engineer</option>
            </select>

            <p>You are matched for <b>{selectedRole}</b> based on your profile.</p>

            <h4>Missing Skills</h4>
            {missingSkills.length > 0 ? (
              missingSkills.map((skill) => <span className="skill-tag" key={skill}>{skill}</span>)
            ) : (
              <p>No major missing skills found.</p>
            )}

            <h4>Suggested Topics</h4>
            <p>React hooks, REST API, authentication, frontend performance.</p>
          </div>
        </section>

        <section className="candidate-card">
          <h2>Recommended Jobs</h2>

          {jobs.length === 0 ? (
            <p>No recommended jobs found yet.</p>
          ) : (
            <div className="job-list">
              {jobs.map((job) => (
                <div className="job-card" key={job._id}>
                  <div>
                    <h3>{job.title}</h3>
                    <p>{job.companyName}</p>
                    <p>{job.location} • {job.jobType || "Full-Time"} • {job.salary || "Not disclosed"}</p>

                    {(job.skills || []).map((skill) => (
                      <span className="skill-tag" key={skill}>{skill}</span>
                    ))}
                  </div>

                  <div className="match-box">
                    <strong>{job.matchPercentage || 70}%</strong>
                    <span>Match</span>
                    <button onClick={() => applyJob(job._id)}>One-Click Apply</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="candidate-grid">
          <div className="candidate-card">
            <h2>AI Career Assistant</h2>
            <input
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder="Ask: How can I improve my profile?"
            />
            <button onClick={askCareerAI}>Ask AI</button>
            {aiAnswer && <p className="ai-answer">{aiAnswer}</p>}
          </div>

          <div className="candidate-card">
            <h2>Verification Center</h2>
            <div className="verify-row"><span>Identity Verification</span><b>{profile?.identityVerified ? "✅ Verified" : "❌ Pending"}</b></div>
            <div className="verify-row"><span>Education Verification</span><b>{profile?.educationVerified ? "✅ Verified" : "❌ Pending"}</b></div>
            <div className="verify-row"><span>Resume Verification</span><b>{profile?.resumeVerified ? "✅ Verified" : "❌ Pending"}</b></div>
            <button>Complete Verification</button>
          </div>
        </section>

        <section className="candidate-grid">
          <div className="candidate-card">
            <h2>Candidate Trust Passport</h2>
            <div className="verify-row"><span>Proxy Risk Shield</span><b>Clean</b></div>
            <div className="verify-row"><span>Documents Verified</span><b>{profile?.documentsVerified || "0/3"}</b></div>
            <div className="verify-row"><span>Project Proof Score</span><b>{profile?.projectProofScore || 0}/100</b></div>
            <div className="verify-row"><span>Recruiter Confidence</span><b>{profile?.recruiterConfidence || 0}/5</b></div>
          </div>

          <div className="candidate-card">
            <h2>Auto Apply Tracker</h2>
            <p>Total Auto Applied Jobs: {profile?.autoAppliedJobs || 0}</p>
            <p>Interview Calls: {profile?.interviewCalls || 0}</p>
            <p>Shortlisted: {profile?.shortlisted || 0}</p>
            <button>Manage Auto Apply</button>
          </div>
        </section>

        <section className="candidate-grid">
          <div className="candidate-card">
            <h2>Recruiter Activity</h2>
            <ul className="activity-list">
              <li>Recruiter viewed your profile</li>
              <li>Resume opened</li>
              <li>You were shortlisted</li>
              <li>Interview request received</li>
            </ul>
          </div>

          <div className="candidate-card">
            <h2>Interview Readiness</h2>
            <p>Communication Score: {profile?.communicationScore || 0}%</p>
            <p>Technical Score: {profile?.technicalScore || 0}%</p>
            <p>HR Score: {profile?.hrScore || 0}%</p>
            <button>Start AI Mock Interview</button>
          </div>
        </section>

        <section className="candidate-grid">
          <div className="candidate-card">
            <h2>Opportunity Hub</h2>
            <div className="opportunity-box">💼 Full-Time Jobs</div>
            <div className="opportunity-box">🚀 Startup Hiring</div>
            <div className="opportunity-box">🎓 Internships</div>
            <div className="opportunity-box">🌎 Freelance Projects</div>
          </div>

          <div className="candidate-card">
            <h2>Salary Predictor</h2>
            <p>Based on your current profile and skills:</p>
            <h3>{profile?.expectedSalary || "₹6 - ₹10 LPA"}</h3>
            <p>Improve skills and verification score to increase salary range.</p>
          </div>
        </section>

        <section className="candidate-grid">
          <div className="candidate-card">
            <h2>Interview Preparation Hub</h2>
            <p>🎯 Tell me about yourself.</p>
            <p>🎯 Explain your project.</p>
            <p>🎯 What are React hooks?</p>
            <p>🎯 How do you handle API errors?</p>

            <button>Start Mock Interview</button>
            <button>Practice Voice Answer</button>
          </div>

          <div className="candidate-card">
            <h2>Career Insights</h2>
            <p>Expected salary: {profile?.expectedSalary || "Update profile"}</p>
            <p>Notice period: {profile?.noticePeriod || "Not added"}</p>
            <p>Preferred location: {profile?.preferredLocation || "Not added"}</p>
            <p>Job preference: Full-Time / Internship / Freelance</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default CandidateDashboard;