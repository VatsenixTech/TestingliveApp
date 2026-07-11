
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaArrowRight,
  FaCheck,
  FaCheckCircle,
  FaCloudUploadAlt,
  FaDownload,
  FaFileAlt,
  FaHistory,
  FaRobot,
  FaShieldAlt,
  FaSpinner,
  FaTrashAlt,
} from "react-icons/fa";
import {
  HiOutlineDocumentText,
  HiOutlineSparkles,
} from "react-icons/hi";
import {
  MdAnalytics,
  MdOutlineSecurity,
} from "react-icons/md";

import "./ResumeStudio.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const EMPTY_RESULT = {
  atsScore: 0,
  optimizedText: "",
  optimizedFileUrl: "",
  fileName: "",
  summary: {
    strengths: [],
    improvements: [],
    keywordsAdded: [],
  },
};

const getStoredToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("authToken") ||
  localStorage.getItem("accessToken") ||
  sessionStorage.getItem("token") ||
  "";

const normalizeRecentResume = (resume = {}, index = 0) => ({
  id: resume._id || resume.id || `resume-${index}`,
  fileName: resume.fileName || resume.originalName || "Resume",
  atsScore: Number(resume.atsScore || resume.score || 0),
  createdAt: resume.createdAt || resume.updatedAt || null,
  downloadUrl:
    resume.optimizedFileUrl ||
    resume.downloadUrl ||
    resume.fileUrl ||
    "",
});

const formatDate = (value) => {
  if (!value) return "Recently";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export default function ResumeStudio() {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [consent, setConsent] = useState(false);
  const [analysis, setAnalysis] = useState(EMPTY_RESULT);
  const [recentResumes, setRecentResumes] = useState([]);

  const [loadingRecent, setLoadingRecent] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const token = useMemo(() => getStoredToken(), []);

  const hasResumeInput =
    Boolean(selectedFile) || Boolean(resumeText.trim());

  const score = Math.max(
    0,
    Math.min(100, Number(analysis.atsScore || 0))
  );

  const loadRecentResumes = useCallback(async () => {
    try {
      setLoadingRecent(true);

      if (!token) {
        setRecentResumes([]);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/resume-studio/recent`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to load recent resumes."
        );
      }

      const items =
        result.data?.resumes ||
        result.resumes ||
        result.data ||
        [];

      setRecentResumes(
        Array.isArray(items)
          ? items.map(normalizeRecentResume)
          : []
      );
    } catch (requestError) {
      console.error("Recent resumes error:", requestError);
      setRecentResumes([]);
    } finally {
      setLoadingRecent(false);
    }
  }, [token]);

  useEffect(() => {
    loadRecentResumes();
  }, [loadRecentResumes]);

  const handleFile = (file) => {
    setError("");
    setSuccessMessage("");

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];

    const allowedExtensions = /\.(pdf|doc|docx|txt)$/i;

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.test(file.name)
    ) {
      setError("Please upload a PDF, DOC, DOCX, or TXT file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("The resume file must be smaller than 10 MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleAnalyze = async () => {
    try {
      setError("");
      setSuccessMessage("");

      if (!consent) {
        throw new Error(
          "Please accept the resume analysis consent."
        );
      }

      if (!hasResumeInput) {
        throw new Error(
          "Upload a resume or paste resume content first."
        );
      }

      if (!token) {
        throw new Error(
          "Your login session is missing. Please log in again."
        );
      }

      setAnalyzing(true);

      const formData = new FormData();

      if (selectedFile) {
        formData.append("resume", selectedFile);
      }

      if (resumeText.trim()) {
        formData.append("resumeText", resumeText.trim());
      }

      const response = await fetch(
        `${API_BASE_URL}/api/resume-studio/analyze`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to optimize your resume."
        );
      }

      const data = result.data || result;

      setAnalysis({
        atsScore: Number(data.atsScore || data.score || 0),
        optimizedText:
          data.optimizedText ||
          data.optimizedResume ||
          data.content ||
          "",
        optimizedFileUrl:
          data.optimizedFileUrl ||
          data.downloadUrl ||
          "",
        fileName:
          data.fileName ||
          data.originalName ||
          selectedFile?.name ||
          "Optimized Resume",
        summary: {
          strengths:
            data.summary?.strengths ||
            data.strengths ||
            [],
          improvements:
            data.summary?.improvements ||
            data.improvements ||
            [],
          keywordsAdded:
            data.summary?.keywordsAdded ||
            data.keywordsAdded ||
            [],
        },
      });

      setSuccessMessage(
        result.message || "Resume optimized successfully."
      );

      await loadRecentResumes();
    } catch (requestError) {
      setError(
        requestError.message || "Unable to optimize your resume."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const clearResume = () => {
    setSelectedFile(null);
    setResumeText("");
    setAnalysis(EMPTY_RESULT);
    setError("");
    setSuccessMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownload = () => {
    if (analysis.optimizedFileUrl) {
      window.open(analysis.optimizedFileUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (!analysis.optimizedText) {
      setError("No optimized resume is available to download.");
      return;
    }

    const blob = new Blob([analysis.optimizedText], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "optimized-resume.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <main className="resume-studio-page">
      <section className="resume-studio-heading">
        <div>
          <h1>Resume Studio</h1>
          <p>AI-powered ATS optimization and professional resume analysis.</p>
        </div>

        <button
          type="button"
          className="resume-upload-top-button"
          onClick={() => fileInputRef.current?.click()}
        >
          <FaCloudUploadAlt />
          Upload New Resume
        </button>
      </section>

      <section className="resume-hero-card">
        <div className="resume-hero-copy">
          <span className="resume-eyebrow">
            <HiOutlineSparkles />
            AI ATS Resume Optimizer
          </span>

          <h2>Build a recruiter-ready resume without changing your real experience.</h2>

          <p>
            Upload your resume and receive ATS-focused improvements while
            preserving your original qualifications, skills, and employment
            history.
          </p>

          <div className="resume-feature-pills">
            <span><FaRobot /> AI Powered</span>
            <span><FaCheckCircle /> ATS Optimized</span>
            <span><MdAnalytics /> Job Match Ready</span>
            <span><FaShieldAlt /> Secure Processing</span>
          </div>
        </div>

        <div className="resume-score-panel">
          <div
            className="resume-score-ring"
            style={{
              "--resume-score": `${score * 3.6}deg`,
            }}
          >
            <div>
              <strong>{Math.round(score)}</strong>
              <span>/100</span>
            </div>
          </div>

          <p>ATS Score</p>
          <strong>
            {score > 0 ? "ANALYSIS COMPLETE" : "READY TO ANALYZE"}
          </strong>
        </div>

        <div className="resume-trust-panel">
          <div className="resume-trust-icon">
            <MdOutlineSecurity />
          </div>

          <div>
            <h3>Trust &amp; Safety</h3>
            <ul>
              <li><FaCheck /> We only enhance existing information.</li>
              <li><FaCheck /> No fake data or made-up experience.</li>
              <li><FaCheck /> Candidate review is required.</li>
              <li><FaCheck /> Resume data stays linked to your profile.</li>
            </ul>
          </div>
        </div>
      </section>

      <label className="resume-consent-card">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
        />

        <span className="resume-consent-icon">
          <FaShieldAlt />
        </span>

        <span>
          By uploading your resume, you authorize NoPromptJobs to analyze,
          reformat, and optimize it using AI. Your original qualifications
          and experience will be preserved.
        </span>
      </label>

      {error && <div className="resume-message resume-error">{error}</div>}
      {successMessage && (
        <div className="resume-message resume-success">{successMessage}</div>
      )}

      <section className="resume-workflow-grid">
        <article className="resume-workflow-card resume-upload-card">
          <div className="resume-card-title">
            <span>1</span>
            <div>
              <h3>Upload Resume</h3>
              <p>Add your current resume or paste its content.</p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept=".pdf,.doc,.docx,.txt"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />

          <button
            type="button"
            className="resume-dropzone"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              handleFile(event.dataTransfer.files?.[0]);
            }}
          >
            <FaCloudUploadAlt />
            <strong>
              {selectedFile ? selectedFile.name : "Upload Resume"}
            </strong>
            <span>PDF, DOCX, DOC, or TXT up to 10 MB</span>
            <small>Choose File</small>
          </button>

          <div className="resume-or-divider"><span>OR</span></div>

          <textarea
            value={resumeText}
            onChange={(event) => setResumeText(event.target.value)}
            placeholder="Paste your resume content here..."
          />

          <button
            type="button"
            className="resume-primary-action"
            onClick={handleAnalyze}
            disabled={analyzing}
          >
            {analyzing ? (
              <>
                <FaSpinner className="resume-spin" />
                Analyzing Resume
              </>
            ) : (
              <>
                Improve Resume with AI
                <FaArrowRight />
              </>
            )}
          </button>

          <button
            type="button"
            className="resume-secondary-action"
            onClick={clearResume}
            disabled={analyzing}
          >
            <FaTrashAlt />
            Clear
          </button>
        </article>

        <article className="resume-workflow-card">
          <div className="resume-card-title">
            <span>2</span>
            <div>
              <h3>AI Analysis</h3>
              <p>Professional checks performed on your resume.</p>
            </div>
          </div>

          <div className="resume-analysis-list">
            {[
              "Extract Resume Information",
              "ATS Compatibility Check",
              "Keyword Review",
              "Formatting Review",
              "Content Improvement",
            ].map((item) => (
              <div key={item}>
                <HiOutlineDocumentText />
                <span>{item}</span>
                {analyzing ? (
                  <FaSpinner className="resume-spin" />
                ) : (
                  <FaCheckCircle />
                )}
              </div>
            ))}
          </div>
        </article>

        <article className="resume-workflow-card resume-output-card">
          <div className="resume-card-title">
            <span>3</span>
            <div>
              <h3>Optimized Resume</h3>
              <p>Review and download the improved version.</p>
            </div>
          </div>

          {analysis.optimizedText || analysis.optimizedFileUrl ? (
            <div className="resume-output-ready">
              <div className="resume-document-icon">
                <FaFileAlt />
              </div>

              <h4>{analysis.fileName || "Optimized Resume"}</h4>
              <p>Your ATS-ready resume is available for review.</p>

              {analysis.optimizedText && (
                <div className="resume-preview">
                  {analysis.optimizedText.slice(0, 900)}
                </div>
              )}

              <button
                type="button"
                className="resume-primary-action"
                onClick={handleDownload}
              >
                <FaDownload />
                Download Resume
              </button>
            </div>
          ) : (
            <div className="resume-output-empty">
              <div className="resume-document-icon">
                <FaFileAlt />
              </div>
              <h4>No optimized resume yet</h4>
              <p>
                Upload or paste resume content and click Improve Resume.
              </p>
              <button
                type="button"
                className="resume-primary-action"
                onClick={handleAnalyze}
                disabled={analyzing || !hasResumeInput}
              >
                Improve Resume
              </button>
            </div>
          )}
        </article>

        <article className="resume-workflow-card resume-rules-card">
          <section>
            <h3>What AI Can Do <FaCheckCircle /></h3>
            <ul className="resume-can-list">
              <li>Improve formatting and structure</li>
              <li>Rewrite bullet points professionally</li>
              <li>Correct grammar and spelling</li>
              <li>Optimize ATS keywords</li>
              <li>Remove ATS-unfriendly tables and icons</li>
              <li>Highlight skills already mentioned</li>
            </ul>
          </section>

          <section>
            <h3>What AI Will Not Do <span>×</span></h3>
            <ul className="resume-cannot-list">
              <li>Add fake companies</li>
              <li>Add fake experience</li>
              <li>Add false certifications</li>
              <li>Inflate years of experience</li>
              <li>Claim skills never mentioned</li>
              <li>Fabricate projects or achievements</li>
            </ul>
          </section>
        </article>
      </section>

      <section className="resume-bottom-grid">
        <article className="resume-bottom-card">
          <div className="resume-bottom-icon">
            <MdAnalytics />
          </div>

          <div>
            <h3>Resume Improvement Summary</h3>

            {analysis.summary.improvements.length > 0 ? (
              <ul>
                {analysis.summary.improvements
                  .slice(0, 4)
                  .map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
              </ul>
            ) : (
              <p>
                Upload your resume to receive detailed improvement
                suggestions.
              </p>
            )}
          </div>
        </article>

        <article className="resume-bottom-card resume-notice-card">
          <div className="resume-bottom-icon">
            <FaShieldAlt />
          </div>

          <div>
            <h3>AI Resume Optimization Notice</h3>
            <p>
              This tool improves formatting, language, and ATS compatibility.
              It does not invent, verify, or guarantee qualifications.
              Review the generated resume before using it.
            </p>
          </div>
        </article>

        <article className="resume-bottom-card">
          <div className="resume-bottom-icon">
            <FaHistory />
          </div>

          <div className="resume-recent-header">
            <div>
              <h3>Your Recent Resumes</h3>
              <p>
                {loadingRecent
                  ? "Loading resumes..."
                  : recentResumes.length === 0
                    ? "No resumes uploaded yet."
                    : `${recentResumes.length} resume${
                        recentResumes.length === 1 ? "" : "s"
                      } available.`}
              </p>
            </div>
          </div>

          {!loadingRecent && recentResumes.length > 0 && (
            <div className="resume-recent-list">
              {recentResumes.slice(0, 3).map((resume) => (
                <button
                  type="button"
                  key={resume.id}
                  onClick={() => {
                    if (resume.downloadUrl) {
                      window.open(
                        resume.downloadUrl,
                        "_blank",
                        "noopener,noreferrer"
                      );
                    }
                  }}
                >
                  <HiOutlineDocumentText />
                  <span>
                    <strong>{resume.fileName}</strong>
                    <small>
                      ATS {Math.round(resume.atsScore)}/100 ·{" "}
                      {formatDate(resume.createdAt)}
                    </small>
                  </span>
                  <FaArrowRight />
                </button>
              ))}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}