import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaArrowLeft, FaBookOpen, FaChevronRight, FaDownload, FaExpand,
  FaFilePdf, FaHeart, FaPrint, FaRedo, FaSearch, FaShareAlt,
  FaSpinner, FaStar
} from "react-icons/fa";
import "./AIInterviewQuestionBankPage.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const ROLES = ["Data Engineer","Software Engineer","Frontend Developer","Backend Developer","Data Analyst","Machine Learning Engineer","DevOps Engineer","Cloud Engineer"];
const TYPES = ["Technical","Behavioral","Mixed","System Design"];

function readUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}
function getCandidateId() {
  const user = readUser();
  return String(
    user?.candidateId || user?.candidate?._id || user?.profile?.candidateId ||
    user?.data?.candidateId || user?.user?.candidateId || user?._id || user?.id ||
    localStorage.getItem("candidateId") || sessionStorage.getItem("candidateId") || ""
  ).trim();
}
function getToken() {
  return localStorage.getItem("token") || localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") || sessionStorage.getItem("token") || "";
}
function go(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
async function parseJson(response) {
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result?.message || `Request failed (${response.status})`);
  return result?.data ?? result;
}
function toQuery(values) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (String(value ?? "").trim()) params.set(key, String(value));
  });
  return params.toString();
}
function formatSize(bytes) {
  const number = Number(bytes);
  if (!number) return "Calculated on download";
  if (number < 1024 ** 2) return `${(number / 1024).toFixed(1)} KB`;
  return `${(number / 1024 ** 2).toFixed(1)} MB`;
}

export default function AIInterviewQuestionBankPage({ onBack }) {
  const [role, setRole] = useState("Data Engineer");
  const [type, setType] = useState("Technical");
  const [search, setSearch] = useState("");
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [zoom, setZoom] = useState(100);
  const frameRef = useRef(null);

  const candidateId = getCandidateId();
  const token = getToken();
  const query = useMemo(() => toQuery({ role, type, candidateId, search }), [role, type, candidateId, search]);
  const pdfUrl = `${API_BASE_URL}/api/interview-prep/question-bank/pdf?${query}&v=${refreshKey}`;
  const metadataUrl = `${API_BASE_URL}/api/interview-prep/question-bank/metadata?${query}`;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(metadataUrl, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      const data = await parseJson(response);
      setMetadata(data);
      setFavorite(localStorage.getItem(`qb-favorite:${role}:${type}`) === "true");
    } catch (requestError) {
      setError(requestError.message || "Unable to load Question Bank.");
    } finally {
      setLoading(false);
    }
  }, [metadataUrl, role, type, token]);

  useEffect(() => {
    const timer = window.setTimeout(load, 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  const back = () => typeof onBack === "function" ? onBack() : go("/ai-interview-prep");

  const download = () => {
    const a = document.createElement("a");
    a.href = `${pdfUrl}&download=1`;
    a.download = metadata?.fileName || `${role.replace(/\s+/g, "_")}_${type}_Interview_Questions.pdf`;
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const printPdf = () => {
    const win = window.open(pdfUrl, "_blank", "noopener,noreferrer");
    if (!win) return window.alert("Please allow pop-ups to print the PDF.");
    win.addEventListener("load", () => { win.focus(); win.print(); }, { once: true });
  };

  const sharePdf = async () => {
    try {
      const payload = {
        title: `${role} ${type} Interview Question Bank`,
        text: `Prepare with the ${role} ${type} interview question bank.`,
        url: pdfUrl
      };
      if (navigator.share) return await navigator.share(payload);
      await navigator.clipboard.writeText(pdfUrl);
      window.alert("PDF link copied.");
    } catch (shareError) {
      if (shareError?.name !== "AbortError") window.alert("Unable to share the PDF.");
    }
  };

  const toggleFavorite = () => {
    const next = !favorite;
    setFavorite(next);
    localStorage.setItem(`qb-favorite:${role}:${type}`, String(next));
  };

  return (
    <main className="qb-page">
      <section className="qb-header">
        <div>
          <div className="qb-breadcrumb">
            <span>AI INTERVIEW PREP</span><FaChevronRight/><strong>QUESTION BANK</strong>
          </div>
          <h1>{role} – {type} Questions</h1>
          <p>Study real questions collected from completed interview sessions and export them as a professional PDF.</p>
        </div>
        <div className="qb-header-actions">
          <button className="qb-btn qb-btn-secondary" onClick={back}><FaArrowLeft/>Back to Interview Prep</button>
          <button className="qb-btn qb-btn-primary" onClick={download} disabled={loading || !!error}><FaDownload/>Download PDF</button>
        </div>
      </section>

      <section className="qb-filter-bar">
        <label><span>Interview role</span><select value={role} onChange={e => setRole(e.target.value)}>{ROLES.map(v => <option key={v}>{v}</option>)}</select></label>
        <label><span>Interview type</span><select value={type} onChange={e => setType(e.target.value)}>{TYPES.map(v => <option key={v}>{v}</option>)}</select></label>
        <label className="qb-search-field"><span>Search questions</span><div><FaSearch/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="SQL, Spark, project..." /></div></label>
        <button className="qb-refresh-button" onClick={() => { setRefreshKey(v => v + 1); load(); }} title="Refresh"><FaRedo/></button>
      </section>

      {error ? (
        <section className="qb-error"><strong>Unable to load Question Bank</strong><p>{error}</p><button onClick={load}>Try again</button></section>
      ) : (
        <>
          <section className="qb-workspace">
            <article className="qb-pdf-card">
              <header className="qb-pdf-toolbar">
                <div className="qb-file-name"><FaFilePdf/><span>{metadata?.fileName || `${role.replace(/\s+/g, "_")}_Interview_Questions.pdf`}</span></div>
                <div className="qb-toolbar-controls">
                  <button onClick={() => setZoom(v => Math.max(70, v - 10))}>−</button>
                  <span>{zoom}%</span>
                  <button onClick={() => setZoom(v => Math.min(150, v + 10))}>+</button>
                  <button onClick={() => frameRef.current?.requestFullscreen?.()}><FaExpand/></button>
                  <button onClick={download}><FaDownload/></button>
                  <button onClick={printPdf}><FaPrint/></button>
                </div>
              </header>
              <div className="qb-pdf-stage" style={{ "--qb-zoom": zoom / 100 }}>
                {loading ? (
                  <div className="qb-loading"><FaSpinner/><strong>Preparing your PDF</strong><span>Collecting real questions from the backend.</span></div>
                ) : (
                  <iframe ref={frameRef} key={pdfUrl} title={`${role} ${type} Question Bank`} src={pdfUrl} className="qb-pdf-frame" />
                )}
              </div>
            </article>

            <aside className="qb-sidebar">
              <article className="qb-info-card">
                <header><FaBookOpen/><h2>Document Information</h2></header>
                <dl>
                  <div><dt>Role</dt><dd>{metadata?.role || role}</dd></div>
                  <div><dt>Type</dt><dd>{metadata?.type || type}</dd></div>
                  <div><dt>Total Questions</dt><dd>{metadata?.totalQuestions ?? 0}</dd></div>
                  <div><dt>Topics</dt><dd>{metadata?.topicCount ?? 0}</dd></div>
                  <div><dt>Pages</dt><dd>{metadata?.estimatedPages ?? 0}</dd></div>
                  <div><dt>File Size</dt><dd>{formatSize(metadata?.estimatedBytes)}</dd></div>
                  <div><dt>Last Updated</dt><dd>{metadata?.lastUpdated ? new Date(metadata.lastUpdated).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "Not available"}</dd></div>
                </dl>
              </article>
              <article className="qb-info-card">
                <header><FaStar/><h2>Quick Actions</h2></header>
                <div className="qb-quick-actions">
                  <button onClick={download}><FaDownload/><span><strong>Download PDF</strong><small>Save for offline practice</small></span></button>
                  <button onClick={sharePdf}><FaShareAlt/><span><strong>Share PDF</strong><small>Share with another candidate</small></span></button>
                  <button onClick={printPdf}><FaPrint/><span><strong>Print PDF</strong><small>Print for handwritten notes</small></span></button>
                  <button onClick={toggleFavorite}><FaHeart className={favorite ? "favorite" : ""}/><span><strong>{favorite ? "Remove Favorite" : "Add to Favorites"}</strong><small>Saved in this browser</small></span></button>
                </div>
              </article>
            </aside>
          </section>

          <section className="qb-summary-strip">
            <Metric icon={<FaFilePdf/>} value={metadata?.totalQuestions ?? 0} label="Questions" variant="purple"/>
            <Metric icon={<FaBookOpen/>} value={metadata?.topicCount ?? 0} label="Topics Covered" variant="green"/>
            <Metric icon={<FaStar/>} value={metadata?.difficultyCount ?? 0} label="Difficulty Levels" variant="orange"/>
            <Metric icon={<FaBookOpen/>} value={metadata?.relevanceScore ? `${metadata.relevanceScore}%` : "—"} label="Job Relevant" variant="blue"/>
          </section>
        </>
      )}
    </main>
  );
}

function Metric({ icon, value, label, variant }) {
  return <article className="qb-summary-metric"><div className={`qb-summary-icon ${variant}`}>{icon}</div><div><strong>{value}</strong><span>{label}</span></div></article>;
}
