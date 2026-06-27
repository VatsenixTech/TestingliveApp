import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ResumeStudio.css";

const API_BASE = "http://localhost:5000/api/resume-studio";

function ResumeStudio() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [atsScore, setAtsScore] = useState(0);
  const [breakdown, setBreakdown] = useState(null);
  const [optimizedText, setOptimizedText] = useState("");
  const [resumeId, setResumeId] = useState(null);
  const [recentResumes, setRecentResumes] = useState([]);
  const [improvements, setImprovements] = useState([]);
  const [warnings, setWarnings] = useState([]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const candidateId = user?._id || user?.candidateId || user?.id;
  const candidateName = user?.name || user?.fullName || "Candidate";
  const email = user?.email || "";

  useEffect(() => {
    if (candidateId) {
      fetchRecentResumes();
    }
  }, [candidateId]);

  async function fetchRecentResumes() {
    try {
      const res = await axios.get(`${API_BASE}/recent/${candidateId}`);
      setRecentResumes(res.data.resumes || []);
    } catch (error) {
      console.error("RECENT RESUME ERROR:", error);
    }
  }

  async function handleAnalyze() {
    if (!candidateId) {
      alert("Candidate login required");
      return;
    }

    if (!selectedFile && !resumeText.trim()) {
      alert("Please upload resume or paste resume content");
      return;
    }

    if (!consent) {
      alert("Please accept consent before using AI Resume Optimizer");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("candidateId", candidateId);
      formData.append("candidateName", candidateName);
      formData.append("email", email);
      formData.append("resumeText", resumeText);
      formData.append("consent", String(consent));

      if (selectedFile) {
        formData.append("resume", selectedFile);
      }

      const res = await axios.post(`${API_BASE}/analyze-optimize`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAtsScore(res.data.atsScore || 0);
      setBreakdown(res.data.breakdown || null);
      setOptimizedText(res.data.optimizedText || "");
      setResumeId(res.data.resumeId || null);
      setImprovements(res.data.improvements || []);
      setWarnings(res.data.warnings || []);

      fetchRecentResumes();
    } catch (error) {
      console.error("RESUME ANALYZE ERROR:", error);
      alert(error.response?.data?.message || "Resume optimization failed");
    } finally {
      setLoading(false);
    }
  }

  function downloadResume(id) {
    const finalResumeId = id || resumeId;

    if (!finalResumeId) {
      alert("No optimized resume available to download");
      return;
    }

    window.open(`${API_BASE}/download/${finalResumeId}`, "_blank");
  }

  async function deleteResume(id) {
    if (!id) return;

    const confirmDelete = window.confirm("Do you want to delete this resume?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE}/${id}`);

      if (resumeId === id) {
        clearResumeStudio();
      }

      fetchRecentResumes();
    } catch (error) {
      console.error("DELETE RESUME ERROR:", error);
      alert(error.response?.data?.message || "Failed to delete resume");
    }
  }

  function clearResumeStudio() {
    setSelectedFile(null);
    setResumeText("");
    setConsent(false);
    setAtsScore(0);
    setBreakdown(null);
    setOptimizedText("");
    setResumeId(null);
    setImprovements([]);
    setWarnings([]);
  }

  return (
    <div className="rs-page">
      <main className="rs-main">
        <section className="rs-hero">
          <div>
            <h1>AI ATS Resume Optimizer</h1>
            <p>
              Upload your resume and get an ATS-friendly, professionally
              optimized version while preserving your original information.
            </p>

            <div className="rs-tags">
              <span>🧠 AI Powered</span>
              <span>✅ ATS Optimized</span>
              <span>🎯 Job Match Ready</span>
              <span>🛡 Secure Processing</span>
            </div>
          </div>

          <div className="rs-score-card">
            <div className="rs-score">
              {atsScore || 0}
              <small>/100</small>
            </div>
            <p>ATS Score</p>
            <strong>{atsScore >= 90 ? "Outstanding" : "Ready to Analyze"}</strong>
          </div>

          <div className="rs-trust">
            <h3>Trust & Safety</h3>
            <p>✅ We only enhance existing information.</p>
            <p>✅ No fake data or made-up experience.</p>
            <p>✅ Candidate review is required.</p>
            <p>✅ Resume data stays linked to your profile.</p>
          </div>
        </section>

        <section className="rs-consent">
          <label>
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span>
              By uploading your resume, you authorize NoPromptJobs to analyze,
              reformat, and optimize it using AI. The optimized resume will
              preserve your original qualifications and experience. You are
              responsible for reviewing the final document before using it.
            </span>
          </label>
        </section>

        <section className="rs-grid">
          <div className="rs-card">
            <h2>1. Upload Resume</h2>

            <label className="rs-upload">
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
              <div>
                <div className="upload-icon">☁️</div>
                <h3>Upload Resume</h3>
                <p>PDF, DOCX or TXT supported</p>
                <button type="button">Choose File</button>
              </div>
            </label>

            {selectedFile && (
              <div className="rs-file">📄 {selectedFile.name}</div>
            )}

            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Or paste your resume content here..."
            />

            <button className="rs-primary" onClick={handleAnalyze} disabled={loading}>
              {loading ? "Analyzing Resume..." : "Improve Resume with AI →"}
            </button>

            <button className="rs-secondary" onClick={clearResumeStudio}>
              Clear
            </button>
          </div>

          <div className="rs-card">
            <h2>2. AI Analysis</h2>

            <div className="rs-process">
              <p>✅ Extract Resume Information</p>
              <p>✅ ATS Compatibility Check</p>
              <p>✅ Keyword Review</p>
              <p>✅ Formatting Review</p>
              <p>✅ Content Improvement</p>
            </div>

            {breakdown && (
              <div className="rs-breakdown">
                <h3>Score Breakdown</h3>

                {Object.entries(breakdown).map(([key, value]) => (
                  <div key={key} className="rs-row">
                    <span>{key.replace(/([A-Z])/g, " $1")}</span>
                    <strong>{value}/100</strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rs-card optimized">
            <h2>3. Optimized Resume</h2>

            {!optimizedText ? (
              <div className="rs-empty">
                <span>✨</span>
                <h3>No optimized resume yet</h3>
                <p>Upload or paste resume content and click Improve Resume.</p>
              </div>
            ) : (
              <>
                <pre>{optimizedText}</pre>

                <button className="rs-primary" onClick={() => downloadResume()}>
                  Download ATS Resume
                </button>
              </>
            )}
          </div>

          <div className="rs-card">
            <h2>What AI Can Do ✅</h2>
            <ul className="green">
              <li>Improve formatting and structure</li>
              <li>Rewrite bullet points professionally</li>
              <li>Correct grammar and spelling</li>
              <li>Optimize ATS keywords</li>
              <li>Remove ATS-unfriendly tables/icons</li>
              <li>Highlight skills already mentioned</li>
            </ul>

            <h2>What AI Will Not Do ❌</h2>
            <ul className="red">
              <li>Add fake companies</li>
              <li>Add fake experience</li>
              <li>Add false certifications</li>
              <li>Inflate years of experience</li>
              <li>Claim skills never mentioned</li>
              <li>Fabricate projects or achievements</li>
            </ul>
          </div>
        </section>

        <section className="rs-bottom">
          <div className="rs-card">
            <h2>Resume Improvement Summary</h2>

            {improvements.length === 0 && warnings.length === 0 ? (
              <p>No analysis yet.</p>
            ) : (
              <>
                {improvements.map((item, index) => (
                  <p key={`improvement-${index}`}>✅ {item}</p>
                ))}

                {warnings.map((item, index) => (
                  <p key={`warning-${index}`}>⚠️ {item}</p>
                ))}
              </>
            )}
          </div>

          <div className="rs-card notice">
            <h2>AI Resume Optimization Notice</h2>
            <p>
              This tool improves formatting, language, and ATS compatibility
              while preserving the information provided by you.
            </p>
            <p>
              It does not verify, invent, or guarantee qualifications. Please
              review the generated resume carefully before submitting it to
              employers.
            </p>
          </div>

          <div className="rs-card">
            <h2>Your Recent Resumes</h2>

            {recentResumes.length === 0 ? (
              <p>No resumes uploaded yet.</p>
            ) : (
              recentResumes.map((resume) => (
                <div className="rs-recent" key={resume._id}>
                  <div>
                    <strong>{resume.originalFileName}</strong>
                    <small>
                      {new Date(resume.createdAt).toLocaleString()}
                    </small>
                  </div>

                  <span>{resume.atsScore}/100</span>

                  <div className="rs-actions">
                    <button onClick={() => downloadResume(resume._id)}>
                      Download
                    </button>
                    <button onClick={() => deleteResume(resume._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default ResumeStudio;