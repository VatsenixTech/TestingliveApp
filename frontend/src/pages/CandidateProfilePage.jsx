import { useEffect, useState } from "react";
import axios from "axios";
import "./CandidateProfilePage.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

function CandidateProfilePage() {
  const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const routePath = window.location.pathname;
  const pathCandidateId = routePath.startsWith("/profile/")
    ? routePath.split("/profile/")[1]?.split("?")[0]?.split("/")[0]
    : routePath.startsWith("/candidate-profile/")
    ? routePath.split("/candidate-profile/")[1]?.split("?")[0]?.split("/")[0]
    : "";

  const candidateId =
    pathCandidateId ||
    savedUser?._id ||
    savedUser?.candidateId ||
    savedUser?.id;

  const [candidate, setCandidate] = useState({});
  const [profile, setProfile] = useState(null);
  const [calculated, setCalculated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modal, setModal] = useState(null);
  const [activeEditor, setActiveEditor] = useState("skills");
  const [selectedFile, setSelectedFile] = useState(null);
  const [consent, setConsent] = useState(false);

  const [basicForm, setBasicForm] = useState({ headline: "", location: "", phone: "" });
  const [summaryForm, setSummaryForm] = useState("");
  const [skillsForm, setSkillsForm] = useState([]);
  const [newSkill, setNewSkill] = useState({ name: "", level: "Intermediate" });
  const [employmentForm, setEmploymentForm] = useState([]);
  const [newEmployment, setNewEmployment] = useState({
    company: "",
    role: "",
    startDate: "",
    endDate: "",
    isCurrent: true,
    description: "",
  });
  const [educationForm, setEducationForm] = useState([]);
  const [newEducation, setNewEducation] = useState({ degree: "", institute: "", year: "" });
  const [projectsForm, setProjectsForm] = useState([]);
  const [newProject, setNewProject] = useState({ title: "", description: "", skills: "" });

  function goTo(path) {
    window.location.href = path;
  }

  const getSkillName = (skill) => {
    if (!skill) return "Skill";

    if (typeof skill === "string") {
      const nameMatch =
        skill.match(/name:\s*'([^']+)'/) ||
        skill.match(/name:\s*"([^"]+)"/) ||
        skill.match(/name:\s*([^,}]+)/);

      if (nameMatch?.[1]) return nameMatch[1].trim();
      return skill.trim();
    }

    if (typeof skill === "object") {
      if (typeof skill.name === "string") return getSkillName(skill.name);
      if (skill.skill) return String(skill.skill);
      if (skill.title) return String(skill.title);
    }

    return "Skill";
  };

  const getSkillLevel = (skill) => {
    if (!skill || typeof skill === "string") return "Intermediate";

    return (
      skill.level ||
      skill.ratingLabel ||
      skill.proficiency ||
      skill.expertise ||
      "Intermediate"
    );
  };

  const getSkillKey = (skill, index) => skill?._id || `${getSkillName(skill)}-${index}`;

  const maskPan = (value) => {
    if (!value) return "";
    const clean = String(value).replace(/\s/g, "");
    return clean.length >= 4 ? `******${clean.slice(-4)}` : "******";
  };

  const maskAadhaar = (value) => {
    if (!value) return "";
    const digits = String(value).replace(/\D/g, "");
    return digits.length >= 4 ? `**** **** ${digits.slice(-4)}` : "**** ****";
  };

  async function fetchProfile() {
    if (!candidateId) {
      alert("Candidate login required");
      goTo("/candidate-login");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.get(`${API_BASE}/api/candidate-profile/${candidateId}`);

      setCandidate(res.data.candidate || {});
      setProfile(res.data.profile || null);
      setCalculated(res.data.calculated || null);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId]);

  const skills = profile?.skills || [];
  const employment = profile?.employment || [];
  const education = profile?.education || [];
  const projects = profile?.projects || [];
  const documents = profile?.documents || [];

  const resumeDoc = documents.find((d) => d.docType === "resume");
  const panDoc = documents.find((d) => d.docType === "pan");
  const aadhaarDoc = documents.find((d) => d.docType === "aadhaar");
  const selfIntroVideo = documents.find((d) => d.docType === "selfIntroVideo");
  const projectVideo = documents.find((d) => d.docType === "projectVideo");

  const profileStrength = calculated?.profileStrength || 0;
  const rating = calculated?.profileRating || 0;
  const breakdown = calculated?.ratingBreakdown || {};

  const panMasked =
    profile?.identity?.panMasked ||
    profile?.panMasked ||
    (profile?.panNumber ? maskPan(profile.panNumber) : "");

  const aadhaarMasked =
    profile?.identity?.aadhaarMasked ||
    profile?.aadhaarMasked ||
    (profile?.aadhaarNumber ? maskAadhaar(profile.aadhaarNumber) : "");

  async function updateProfile(payload) {
    try {
      setSaving(true);

      const res = await axios.patch(
        `${API_BASE}/api/candidate-profile/${candidateId}`,
        payload
      );

      setProfile(res.data.profile);
      setModal(null);
      fetchProfile();
    } catch (error) {
      alert(error.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  function openManager(section = "skills") {
    setActiveEditor(section);

    setBasicForm({
      headline: profile?.headline || candidate?.role || "",
      location: profile?.location || "",
      phone: profile?.phone || "",
    });

    setSummaryForm(profile?.professionalSummary || "");

    setSkillsForm(
      skills.map((s) => ({
        _id: s?._id,
        name: getSkillName(s),
        level: getSkillLevel(s),
      }))
    );

    setNewSkill({ name: "", level: "Intermediate" });

    setEmploymentForm(
      employment.map((e) => ({
        _id: e?._id,
        company: e?.company || "",
        role: e?.role || "",
        description: e?.description || "",
        startDate: e?.startDate ? String(e.startDate).slice(0, 10) : "",
        endDate: e?.endDate ? String(e.endDate).slice(0, 10) : "",
        isCurrent: Boolean(e?.isCurrent),
      }))
    );

    setNewEmployment({
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      isCurrent: true,
      description: "",
    });

    setEducationForm(
      education.map((e) => ({
        _id: e?._id,
        degree: e?.degree || "",
        institute: e?.institute || "",
        year: e?.year || "",
        status: e?.status || "Completed",
      }))
    );

    setNewEducation({ degree: "", institute: "", year: "" });

    setProjectsForm(
      projects.map((p) => ({
        _id: p?._id,
        title: p?.title || "",
        description: p?.description || "",
        skills: Array.isArray(p?.skills) ? p.skills.join(", ") : "",
        featured: Boolean(p?.featured),
        rating: p?.rating || 4.5,
      }))
    );

    setNewProject({ title: "", description: "", skills: "" });
    setModal("manager");
  }

  function openUpload(type) {
    setSelectedFile(null);
    setConsent(false);
    setModal(type);
  }

  function updateSkill(index, field, value) {
    setSkillsForm((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function removeSkill(index) {
    setSkillsForm((prev) => prev.filter((_, i) => i !== index));
  }

  function addSkill() {
    if (!newSkill.name.trim()) return alert("Please enter skill name");
    setSkillsForm((prev) => [...prev, { name: newSkill.name.trim(), level: newSkill.level }]);
    setNewSkill({ name: "", level: "Intermediate" });
  }

  function updateArray(setter, index, field, value) {
    setter((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function removeArrayItem(setter, index) {
    setter((prev) => prev.filter((_, i) => i !== index));
  }

  function addEmployment() {
    if (!newEmployment.company.trim() || !newEmployment.role.trim()) {
      return alert("Please enter company and role");
    }

    setEmploymentForm((prev) => [
      ...prev,
      {
        company: newEmployment.company.trim(),
        role: newEmployment.role.trim(),
        startDate: newEmployment.startDate || "",
        endDate: newEmployment.isCurrent ? "" : newEmployment.endDate || "",
        isCurrent: Boolean(newEmployment.isCurrent),
        description: newEmployment.description || "",
      },
    ]);

    setNewEmployment({
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      isCurrent: true,
      description: "",
    });
  }

  function addEducation() {
    if (!newEducation.degree.trim() || !newEducation.institute.trim()) {
      return alert("Please enter degree and institute");
    }

    setEducationForm((prev) => [
      ...prev,
      { ...newEducation, degree: newEducation.degree.trim(), institute: newEducation.institute.trim(), status: "Completed" },
    ]);
    setNewEducation({ degree: "", institute: "", year: "" });
  }

  function addProject() {
    if (!newProject.title.trim()) return alert("Please enter project title");

    setProjectsForm((prev) => [
      ...prev,
      {
        title: newProject.title.trim(),
        description: newProject.description,
        skills: newProject.skills,
        featured: prev.length === 0,
        rating: 4.5,
      },
    ]);
    setNewProject({ title: "", description: "", skills: "" });
  }

  async function saveManager() {
    const payload = {};

    if (activeEditor === "basic") {
      payload.headline = basicForm.headline;
      payload.location = basicForm.location;
      payload.phone = basicForm.phone;
    }

    if (activeEditor === "summary") {
      payload.professionalSummary = summaryForm;
    }

    if (activeEditor === "skills") {
      payload.skills = skillsForm
        .filter((s) => s.name?.trim())
        .map((s) => ({ name: s.name.trim(), level: s.level || "Intermediate" }));
    }

    if (activeEditor === "employment") {
      payload.employment = employmentForm
        .filter((e) => e.company?.trim() && e.role?.trim())
        .map((e) => ({
          company: e.company.trim(),
          role: e.role.trim(),
          description: e.description || "",
          isCurrent: Boolean(e.isCurrent),
          startDate: e.startDate ? new Date(e.startDate) : undefined,
          endDate: !e.isCurrent && e.endDate ? new Date(e.endDate) : undefined,
        }));
    }

    if (activeEditor === "education") {
      payload.education = educationForm
        .filter((e) => e.degree?.trim() && e.institute?.trim())
        .map((e) => ({
          degree: e.degree,
          institute: e.institute,
          year: e.year || "",
          status: e.status || "Completed",
        }));
    }

    if (activeEditor === "project") {
      payload.projects = projectsForm
        .filter((p) => p.title?.trim())
        .map((p) => ({
          title: p.title,
          description: p.description || "",
          skills: String(p.skills || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          featured: Boolean(p.featured),
          rating: p.rating || 4.5,
        }));
    }

    return updateProfile(payload);
  }

  async function uploadDocument() {
    if (!selectedFile) return alert("Please choose a file");
    if (!consent) return alert("Please accept consent before upload");

    const docTypeMap = {
      uploadResume: "resume",
      uploadPan: "pan",
      uploadAadhaar: "aadhaar",
      uploadSelfIntro: "selfIntroVideo",
      uploadProjectVideo: "projectVideo",
    };

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("docType", docTypeMap[modal]);
      formData.append("consentAccepted", "true");
      formData.append(
        "consentText",
        "I confirm this document belongs to me and I authorize NoPromptJobs to upload, store, mask and use it only for profile verification, recruiter trust scoring and fraud prevention. Only last 4 digits should be shown."
      );

      const res = await axios.post(
        `${API_BASE}/api/candidate-profile/${candidateId}/upload-document`,
        formData,
      
      );

      alert(res.data.message || "Uploaded successfully");
      setModal(null);
      setSelectedFile(null);
      setConsent(false);
      fetchProfile();
    } catch (error) {
      alert(error.response?.data?.message || "Upload failed");
    } finally {
      setSaving(false);
    }
  }

  async function deleteDocument(documentId) {
    if (!window.confirm("Delete this uploaded file?")) return;

    try {
      const res = await axios.delete(
        `${API_BASE}/api/candidate-profile/${candidateId}/document/${documentId}`
      );

      setProfile(res.data.profile);
      fetchProfile();
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    }
  }

  if (loading) return <div className="cp-loading">Loading candidate profile...</div>;
  const isProfileViewsPage =
  window.location.pathname.includes("/views");
if (isProfileViewsPage) {
  return (
    <ProfileViewsAnalytics
      candidateId={candidateId}
      goTo={goTo}
      candidate={candidate}
      profile={profile}
      savedUser={savedUser}
      profileStrength={profileStrength}
      rating={rating}
      breakdown={breakdown}
    />
  );
}
  const uploadTitle = {
    uploadResume: "Upload Resume",
    uploadPan: "Upload PAN Card",
    uploadAadhaar: "Upload Aadhaar Card",
    uploadSelfIntro: "Upload Self Intro Video",
    uploadProjectVideo: "Upload Project Video",
  };

  return (
    <main className="cp-page">
      <header className="cp-header cp-header-final">

    <div
        
  className="cp-brand"
  onClick={() => goTo(`/dashboard/${candidateId}`)}
>
    

        <img src="/logo.png" alt="" />

    </div>

    <div className="cp-search">

        <span>⌕</span>

        <input
            placeholder="Search jobs, companies, skills..."
        />

        

    </div>

    <button
        className="cp-job-btn"
        onClick={()=>goTo("/jobs")}
    >
        🎯 Job Matches
    </button>

    <button
        className="cp-icon"
        onClick={()=>goTo("/notifications")}
    >
        🔔
        <b>3</b>
    </button>

<button
    className="cp-icon"
    onClick={() => goTo(`/profile/${candidateId}/views`)}
    title="Profile Views"
>
    👁
    <b>{profile?.metrics?.profileViews || 0}</b>
</button>

    <div className="cp-user cp-user-final" onClick={() => openManager("basic")}>

        <img
            src={
                candidate?.profileImageUrl ||
                savedUser?.profileImageUrl ||
                "/profile.png"
            }
            alt=""
        />

        <section>

            <h4>{candidate?.name}</h4>

            <p>
                {candidate?.role || profile?.headline}
                <span> ✔</span>
            </p>

        </section>

        <span className="cp-user-arrow">⌄</span>

    </div>

</header>

      <section className="cp-shell">
        <aside className="cp-left-card">
          <div className="cp-photo-wrap">
            <img src={candidate?.profileImageUrl || savedUser?.profileImageUrl || "/profile.png"} alt="Candidate" />
            <span>✓</span>
          </div>

          <h1>{candidate?.name}</h1>
          <p className="cp-role">{candidate?.role || profile?.headline}</p>

          <div className="cp-contact">
            <p>📍 {profile?.location || "Location not added"}</p>
            <p>✉ {candidate?.email || "Email not added"}</p>
            <p>☎ {profile?.phone || "Phone not added"}</p>
          </div>

          <span className="verified-pill">Verified Candidate</span>
          <button onClick={() => openManager("basic")}>✎ Edit Profile</button>
          
          <button
  className="outline"
  onClick={() => goTo(`/profile/${candidateId}/views`)}
>
  👁 View Public Profile
</button>

          <div className="cp-strength">
            <h3>Profile Strength</h3>

            <div className="cp-ring small" style={{ "--value": profileStrength }}>
              <strong>{profileStrength}%</strong>
              <small>Complete</small>
            </div>

            <p>{profileStrength >= 80 ? "Great job! Your profile looks strong." : "Complete missing sections to improve recruiter confidence."}</p>

            <div className="check-grid">
              <span>✅ Basic Information</span>
              <span>{skills.length ? "✅" : "⚠️"} Skills & Experience</span>
              <span>{projects.length ? "✅" : "⚠️"} Projects</span>
              <span>{selfIntroVideo ? "✅" : "⚠️"} Add Intro Video</span>
            </div>
          </div>
        </aside>

        <section className="cp-main">
          <section className="cp-hero-card">
            <div className="summary-block">
              <h3>❝ Professional Summary</h3>
              <p>{profile?.professionalSummary || "Professional summary not added yet."}</p>

              <div className="skill-pills">
                {skills.slice(0, 6).map((skill, index) => (
                  <span key={getSkillKey(skill, index)}>{getSkillName(skill)}</span>
                ))}
                {skills.length > 6 && <span>+{skills.length - 6}</span>}
              </div>

              <button onClick={() => openManager("summary")}>▣ Update Summary</button>
              <button className="outline-white" onClick={() => openUpload("uploadResume")}>↥ Upload Resume</button>
            </div>

            <div className="rating-block">
              <div className="cp-ring" style={{ "--value": rating * 10 }}>
                <strong>{rating || 0}</strong>
                <small>/10</small>
              </div>

              <h3>Profile Rating</h3>
              <b>{rating >= 8 ? "Excellent" : rating >= 5 ? "Good" : "Needs Improvement"}</b>
              <p>Calculated from resume, skills, profile completeness, project proof and activity.</p>
            </div>

            <div className="score-list">
              <p>⭐ Resume Quality <b>{breakdown.resumeQuality || 0}</b></p>
              <p>⭐ Skills Match <b>{breakdown.skillsMatch || 0}</b></p>
              <p>⭐ Profile Completeness <b>{breakdown.profileCompleteness || 0}</b></p>
              <p>⭐ Project Impact <b>{breakdown.projectImpact || 0}</b></p>
              <p>⭐ Activity Score <b>{breakdown.activityScore || 0}</b></p>
              <button onClick={() => alert("Rating is calculated using profile completion, resume score, skills, projects and recruiter activity.")}>
                ⓘ How is this calculated?
              </button>
            </div>
          </section>

     <section className="cp-stats">
  {[
    ["👁", "Search Appearances", profile?.metrics?.searchAppearances || 0, "This Month", null],
    ["★", "Shortlisted By Recruiters", profile?.metrics?.shortlistedByRecruiters || 0, "Total", null],
    ["▣", "Interview Invites", profile?.metrics?.interviewInvites || 0, "Total", "/interview-alerts"],
    ["💼", "Applications", profile?.metrics?.applications || 0, "Active", "/applications"],
    ["👥", "Profile Views", profile?.metrics?.profileViews || 0, "Total", null],
  ].map((item) => (
    <article
      className="cp-stat"
      key={item[1]}
      onClick={() => {
        if (item[4]) goTo(item[4]);
      }}
      style={{ cursor: item[4] ? "pointer" : "default" }}
    >
      <div>{item[0]}</div>
      <section>
        <p>{item[1]}</p>
        <h2>{item[2]}</h2>
        <small>{item[3]}</small>
      </section>
    </article>
  ))}
</section>

          <section className="cp-grid">
            <div className="cp-card skills">
              <div className="card-head">
                <h3>Key Skills</h3>
                <button onClick={() => openManager("skills")}>+ Add / Modify Skills</button>
              </div>

              <div className="skill-table">
                {skills.length === 0 ? (
                  <p>No skills added yet.</p>
                ) : (
                  skills.slice(0, 10).map((skill, index) => {
                    const level = getSkillLevel(skill);

                    return (
                      <span key={getSkillKey(skill, index)}>
                        {getSkillName(skill)}
                        <b className={String(level).toLowerCase()}>{level}</b>
                      </span>
                    );
                  })
                )}
              </div>

              <button className="link-btn" onClick={() => openManager("skills")}>
                View All Skills ({skills.length}) →
              </button>
            </div>

            <div className="cp-card">
              <div className="card-head">
                <h3>Experience</h3>
                <button onClick={() => openManager("employment")}>+ Add Experience</button>
              </div>

              {employment.length === 0 ? (
                <p>No employment added yet.</p>
              ) : (
                employment.slice(0, 2).map((job) => (
                  <div className="experience-row" key={job._id || `${job.company}-${job.role}`}>
                    <h4>{job.company}</h4>
                    <p>{job.role}</p>
                    <small>
                      {job.startDate
                        ? new Date(job.startDate).toLocaleDateString()
                        : "Start date not added"}{" "}
                      -{" "}
                      {job.isCurrent
                        ? "Present"
                        : job.endDate
                        ? new Date(job.endDate).toLocaleDateString()
                        : "End date not added"}
                    </small>
                    <small>{job.description}</small>
                    {job.isCurrent && <b>Current</b>}
                  </div>
                ))
              )}
            </div>

            <div className="cp-card">
              <div className="card-head">
                <h3>Education</h3>
                <button onClick={() => openManager("education")}>+ Add Education</button>
              </div>

              {education.length === 0 ? (
                <p>No education added yet.</p>
              ) : (
                education.map((edu) => (
                  <div className="education-row" key={edu._id || edu.degree}>
                    <h4>{edu.degree}</h4>
                    <p>{edu.institute}</p>
                    <span>{edu.year}</span>
                    <b>{edu.status}</b>
                  </div>
                ))
              )}
            </div>

            <div className="cp-card">
              <div className="card-head">
                <h3>Project Proof</h3>
                <button onClick={() => openManager("project")}>+ Add Project</button>
              </div>

              {projects.length === 0 ? (
                <p>No project proof added yet.</p>
              ) : (
                projects.slice(0, 2).map((project) => (
                  <div className="project-row" key={project._id || project.title}>
                    <h4>{project.title} {project.featured && <span>Featured</span>}</h4>
                    <p>{project.description}</p>
                    <small>{(project.skills || []).join(", ")}</small>
                    <b>⭐ {project.rating || "-"}</b>
                  </div>
                ))
              )}
            </div>

            <div className="cp-card resume">
              <div className="card-head">
                <h3>Resume</h3>
                <button onClick={() => openUpload("uploadResume")}>+ Update Resume</button>
              </div>

              {resumeDoc ? (
                <div className="file-row">
                  <span>📄</span>
                  <section>
                    <b>{resumeDoc.fileName}</b>
                    <p>Uploaded on {new Date(resumeDoc.uploadedAt).toLocaleDateString()}</p>
                  </section>
                  <button onClick={() => window.open(`${API_BASE}${resumeDoc.fileUrl}`, "_blank")}>Open</button>
                  <button onClick={() => deleteDocument(resumeDoc._id)}>Delete</button>
                </div>
              ) : (
                <p>No resume uploaded.</p>
              )}
            </div>

            <div className="cp-card">
              <div className="card-head">
                <h3>Self Intro & Videos</h3>
                <button onClick={() => openUpload("uploadSelfIntro")}>+ Upload Video</button>
              </div>

              <div className="video-row">
                <button>▶</button>
                <section>
                  <b>Self Intro Video</b>
                  <p>{selfIntroVideo ? `Uploaded ${new Date(selfIntroVideo.uploadedAt).toLocaleDateString()}` : "Missing"}</p>
                </section>
              </div>

              <div className="video-row">
                <button onClick={() => openUpload("uploadProjectVideo")}>▶</button>
                <section>
                  <b>Project Explanation</b>
                  <p>{projectVideo ? `Uploaded ${new Date(projectVideo.uploadedAt).toLocaleDateString()}` : "Missing"}</p>
                </section>
              </div>
            </div>

            <div className="cp-card verification">
              <div className="card-head">
                <h3>Identity & Verification</h3>
                <span>{profile?.verification?.panVerified || profile?.verification?.aadhaarVerified ? "Verified" : "Pending"}</span>
              </div>

              <p>{profile?.verification?.emailVerified ? "✅" : "⚠️"} Email Verified</p>
              <p>{profile?.verification?.mobileVerified ? "✅" : "⚠️"} Mobile Verified</p>

              <p>
                {profile?.verification?.panVerified ? "✅" : "⚠️"} PAN{" "}
                {panMasked || (panDoc ? "Uploaded - verification pending" : "Not uploaded")}
              </p>

              <p>
                {profile?.verification?.aadhaarVerified ? "✅" : "⚠️"} Aadhaar{" "}
                {aadhaarMasked || (aadhaarDoc ? "Uploaded - verification pending" : "Not uploaded")}
              </p>

              <button onClick={() => openUpload("uploadPan")}>Upload PAN</button>
              <button onClick={() => openUpload("uploadAadhaar")}>Upload Aadhaar</button>
            </div>
          </section>
        </section>
      </section>

      <footer className="cp-footer">
        <img src="/logo.png" alt="NoPromptJobs" />
        <p>© 2026 Vatsenix Software Pvt Ltd. NoPromptJobs candidate profile intelligence platform.</p>
        <div>
          <button onClick={() => goTo("/privacy")}>Privacy</button>
          <button onClick={() => goTo("/terms")}>Terms</button>
          <button onClick={() => goTo("/contact")}>Contact</button>
        </div>
      </footer>

      {modal === "manager" && (
        <div className="cp-modal cp-manager-modal">
          <div className="cp-manager-card">
            <button className="close" onClick={() => setModal(null)}>×</button>

            <aside className="manager-side">
              <h4>EDIT SECTIONS</h4>

              {[
                ["skills", "⌘", "Skills"],
                ["employment", "💼", "Employment"],
                ["education", "🎓", "Education"],
                ["project", "📁", "Projects"],
                ["resume", "📄", "Resume"],
                ["basic", "👤", "Basic Info"],
                ["summary", "💬", "Professional Summary"],
                ["video", "▶", "Self Intro & Videos"],
              ].map((item) => (
                <button
                  key={item[0]}
                  className={activeEditor === item[0] ? "active" : ""}
                  onClick={() => {
                    if (item[0] === "resume") return openUpload("uploadResume");
                    if (item[0] === "video") return openUpload("uploadSelfIntro");
                    setActiveEditor(item[0]);
                  }}
                >
                  <span>{item[1]}</span>
                  {item[2]}
                </button>
              ))}

              <div className="manager-tip">
                <b>💡 How it works?</b>
                <p>Update your profile sections. Changes are saved to Database and reflected immediately.</p>
              </div>
            </aside>

            <section className="manager-main">
              {activeEditor === "skills" && (
                <>
                  <div className="manager-head">
                    <div className="manager-icon">⌘</div>
                    <div>
                      <h2>Manage Skills</h2>
                      <p>Add your key skills and proficiency level.</p>
                    </div>
                  </div>

                  <h3>Your Skills ({skillsForm.length})</h3>

                  <div className="manager-list">
                    {skillsForm.map((skill, index) => (
                      <div className="manager-row" key={`${skill.name}-${index}`}>
                        <span className="skill-logo">{skill.name?.[0]?.toUpperCase() || "S"}</span>

                        <input
                          value={skill.name}
                          onChange={(e) => updateSkill(index, "name", e.target.value)}
                          placeholder="Skill name"
                        />

                        <select value={skill.level} onChange={(e) => updateSkill(index, "level", e.target.value)}>
                          {LEVELS.map((level) => <option key={level}>{level}</option>)}
                        </select>

                        <button className="delete-btn" onClick={() => removeSkill(index)}>🗑</button>
                      </div>
                    ))}
                  </div>

                  <div className="manager-add-box">
                    <h3>Add New Skill</h3>
                    <div className="manager-add-grid">
                      <input
                        value={newSkill.name}
                        onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                        placeholder="e.g. React, AWS, Machine Learning"
                      />
                      <select value={newSkill.level} onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}>
                        {LEVELS.map((level) => <option key={level}>{level}</option>)}
                      </select>
                      <button onClick={addSkill}>+ Add Skill</button>
                    </div>
                  </div>
                </>
              )}

              {activeEditor === "basic" && (
                <>
                  <ManagerTitle icon="👤" title="Basic Profile" text="Update your headline, location and mobile number." />
                  <div className="field-grid">
                    <label>Headline<input value={basicForm.headline} onChange={(e) => setBasicForm({ ...basicForm, headline: e.target.value })} /></label>
                    <label>Location<input value={basicForm.location} onChange={(e) => setBasicForm({ ...basicForm, location: e.target.value })} /></label>
                    <label>Phone<input value={basicForm.phone} onChange={(e) => setBasicForm({ ...basicForm, phone: e.target.value })} /></label>
                  </div>
                </>
              )}

              {activeEditor === "summary" && (
                <>
                  <ManagerTitle icon="💬" title="Professional Summary" text="Write your recruiter-facing professional summary." />
                  <textarea className="manager-textarea" value={summaryForm} onChange={(e) => setSummaryForm(e.target.value)} />
                </>
              )}

              {activeEditor === "employment" && (
                <>
                  <ManagerTitle
                    icon="💼"
                    title="Manage Employment"
                    text="Add, edit or remove your work experience. Company and role are mandatory."
                  />

                  <div className="manager-list">
                    {employmentForm.map((job, index) => (
                      <div className="manager-employment-card" key={job._id || index}>
                        <div className="manager-employment-grid">
                          <label>
                            Company
                            <input
                              value={job.company}
                              onChange={(e) =>
                                updateArray(setEmploymentForm, index, "company", e.target.value)
                              }
                              placeholder="Example: Capgemini"
                            />
                          </label>

                          <label>
                            Role / Designation
                            <input
                              value={job.role}
                              onChange={(e) =>
                                updateArray(setEmploymentForm, index, "role", e.target.value)
                              }
                              placeholder="Example: Data Engineer"
                            />
                          </label>

                          <label>
                            Start Date
                            <input
                              type="date"
                              value={job.startDate || ""}
                              onChange={(e) =>
                                updateArray(setEmploymentForm, index, "startDate", e.target.value)
                              }
                            />
                          </label>

                          <label>
                            End Date
                            <input
                              type="date"
                              value={job.endDate || ""}
                              disabled={job.isCurrent}
                              onChange={(e) =>
                                updateArray(setEmploymentForm, index, "endDate", e.target.value)
                              }
                            />
                          </label>
                        </div>

                        <label className="manager-check">
                          <input
                            type="checkbox"
                            checked={Boolean(job.isCurrent)}
                            onChange={(e) => {
                              updateArray(setEmploymentForm, index, "isCurrent", e.target.checked);
                              if (e.target.checked) {
                                updateArray(setEmploymentForm, index, "endDate", "");
                              }
                            }}
                          />
                          I currently work here
                        </label>

                        <label>
                          Description
                          <textarea
                            className="manager-small-textarea"
                            value={job.description}
                            onChange={(e) =>
                              updateArray(setEmploymentForm, index, "description", e.target.value)
                            }
                            placeholder="Describe your responsibilities, tools, projects and impact"
                          />
                        </label>

                        <button
                          className="delete-btn manager-remove-wide"
                          onClick={() => removeArrayItem(setEmploymentForm, index)}
                        >
                          🗑 Remove Employment
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="manager-add-box">
                    <h3>Add New Employment</h3>

                    <div className="manager-employment-grid">
                      <label>
                        Company
                        <input
                          value={newEmployment.company}
                          onChange={(e) =>
                            setNewEmployment({ ...newEmployment, company: e.target.value })
                          }
                          placeholder="Example: Capgemini"
                        />
                      </label>

                      <label>
                        Role / Designation
                        <input
                          value={newEmployment.role}
                          onChange={(e) =>
                            setNewEmployment({ ...newEmployment, role: e.target.value })
                          }
                          placeholder="Example: Data Engineer"
                        />
                      </label>

                      <label>
                        Start Date
                        <input
                          type="date"
                          value={newEmployment.startDate}
                          onChange={(e) =>
                            setNewEmployment({ ...newEmployment, startDate: e.target.value })
                          }
                        />
                      </label>

                      <label>
                        End Date
                        <input
                          type="date"
                          value={newEmployment.endDate}
                          disabled={newEmployment.isCurrent}
                          onChange={(e) =>
                            setNewEmployment({ ...newEmployment, endDate: e.target.value })
                          }
                        />
                      </label>
                    </div>

                    <label className="manager-check">
                      <input
                        type="checkbox"
                        checked={Boolean(newEmployment.isCurrent)}
                        onChange={(e) =>
                          setNewEmployment({
                            ...newEmployment,
                            isCurrent: e.target.checked,
                            endDate: e.target.checked ? "" : newEmployment.endDate,
                          })
                        }
                      />
                      I currently work here
                    </label>

                    <label>
                      Description
                      <textarea
                        className="manager-small-textarea"
                        value={newEmployment.description}
                        onChange={(e) =>
                          setNewEmployment({ ...newEmployment, description: e.target.value })
                        }
                        placeholder="Example: Built ETL pipelines using PySpark, SQL and Azure Data Factory"
                      />
                    </label>

                    <button onClick={addEmployment}>+ Add Employment</button>
                  </div>
                </>
              )}

              {activeEditor === "education" && (
                <>
                  <ManagerTitle icon="🎓" title="Manage Education" text="Add, edit or remove your education details." />
                  <div className="manager-list">
                    {educationForm.map((edu, index) => (
                      <div className="manager-row three" key={index}>
                        <input value={edu.degree} onChange={(e) => updateArray(setEducationForm, index, "degree", e.target.value)} placeholder="Degree" />
                        <input value={edu.institute} onChange={(e) => updateArray(setEducationForm, index, "institute", e.target.value)} placeholder="Institute" />
                        <input value={edu.year} onChange={(e) => updateArray(setEducationForm, index, "year", e.target.value)} placeholder="Year" />
                        <button className="delete-btn" onClick={() => removeArrayItem(setEducationForm, index)}>🗑</button>
                      </div>
                    ))}
                  </div>
                  <div className="manager-add-box">
                    <h3>Add New Education</h3>
                    <div className="manager-add-grid three">
                      <input value={newEducation.degree} onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })} placeholder="Degree" />
                      <input value={newEducation.institute} onChange={(e) => setNewEducation({ ...newEducation, institute: e.target.value })} placeholder="Institute" />
                      <input value={newEducation.year} onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })} placeholder="Year" />
                      <button onClick={addEducation}>+ Add</button>
                    </div>
                  </div>
                </>
              )}

              {activeEditor === "project" && (
                <>
                  <ManagerTitle icon="📁" title="Manage Projects" text="Add, edit or remove project proof." />
                  <div className="manager-list">
                    {projectsForm.map((project, index) => (
                      <div className="manager-row three" key={index}>
                        <input value={project.title} onChange={(e) => updateArray(setProjectsForm, index, "title", e.target.value)} placeholder="Project title" />
                        <input value={project.description} onChange={(e) => updateArray(setProjectsForm, index, "description", e.target.value)} placeholder="Description" />
                        <input value={project.skills} onChange={(e) => updateArray(setProjectsForm, index, "skills", e.target.value)} placeholder="Skills" />
                        <button className="delete-btn" onClick={() => removeArrayItem(setProjectsForm, index)}>🗑</button>
                      </div>
                    ))}
                  </div>
                  <div className="manager-add-box">
                    <h3>Add New Project</h3>
                    <div className="manager-add-grid three">
                      <input value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} placeholder="Project title" />
                      <input value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} placeholder="Description" />
                      <input value={newProject.skills} onChange={(e) => setNewProject({ ...newProject, skills: e.target.value })} placeholder="Skills comma separated" />
                      <button onClick={addProject}>+ Add</button>
                    </div>
                  </div>
                </>
              )}

              <div className="manager-bottom">
                <div className="manager-note">💡 Be honest and accurate. Recruiters use this data for verified matching.</div>
                <div>
                  <button className="ghost-btn" onClick={() => setModal(null)}>Cancel</button>
                  <button onClick={saveManager} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {["uploadResume", "uploadPan", "uploadAadhaar", "uploadSelfIntro", "uploadProjectVideo"].includes(modal) && (
        <div className="cp-modal">
          <div className="cp-modal-card cp-upload-card">
            <button className="close" onClick={() => setModal(null)}>×</button>
            <h2>{uploadTitle[modal]}</h2>
            <p>Secure upload with candidate consent. PAN/Aadhaar will be masked and only last 4 digits will be visible.</p>

            <input
              type="file"
              accept={
                modal === "uploadResume"
                  ? ".pdf,.doc,.docx"
                  : modal.includes("Video")
                  ? "video/mp4,video/webm"
                  : ".pdf,.png,.jpg,.jpeg,.webp"
              }
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />

            <label className="consent-box">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>
                I confirm this file/document belongs to me and I authorize NoPromptJobs to upload, store, mask and use it for verification, recruiter trust scoring and career opportunities.
              </span>
            </label>

            <button onClick={uploadDocument} disabled={saving}>
              {saving ? "Uploading..." : "Upload With My Consent"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function ManagerTitle({ icon, title, text }) {
  return (
    <div className="manager-head">
      <div className="manager-icon">{icon}</div>
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
    </div>
  );
}



function ProfileViewsAnalytics({
  candidateId,
  goTo,
  candidate,
  profile,
  savedUser,
  profileStrength,
  rating,
  breakdown,
}) 
 {const profileImage =
  candidate?.profileImageUrl ||
  profile?.profileImageUrl ||
  savedUser?.profileImageUrl ||
  "/profile.png";

const candidateName =
  candidate?.name ||
  savedUser?.name ||
  "Candidate";

const candidateRole =
  candidate?.role ||
  profile?.headline ||
  savedUser?.role ||
  "Professional";
  const [viewsData, setViewsData] = useState({
    totalViews: 0,
    uniqueRecruiters: 0,
    companiesViewed: 0,
    shortlistedViews: 0,
    lastViewed: null,
    recentViews: [],
    topCompanies: [],
    trend: [],
    heatmap: [],
    experienceLevels: [],
    insights: [],
  });

  const [viewsLoading, setViewsLoading] = useState(true);

  useEffect(() => {
    async function fetchViews() {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${API_BASE}/api/profile-views/candidate/${candidateId}/analytics`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setViewsData(res.data);
      } catch (error) {
        console.error("Profile views error:", error);
      } finally {
        setViewsLoading(false);
      }
    }

    if (candidateId) fetchViews();
  }, [candidateId]);

  if (viewsLoading) {
    return <div className="cp-loading">Loading profile analytics...</div>;
  }

  const trend = viewsData.trend || [];
  const maxTrend = Math.max(...trend.map((x) => x.count || 0), 1);

  return (
    <main className="pvx-page">
      <aside className="pvx-sidebar">
        <img className="pvx-logo" src="/logo.png" alt="NoPromptJobs" />

        <div className="pvx-user-card">
          <img
  src={profileImage}
  alt={candidateName}
  onError={(e) => {
    e.currentTarget.src = "/profile.png";
  }}
/>
          <span>✓</span>
          <h3>{candidateName}</h3>
          <p>{candidateRole}</p>
          <b>Verified Candidate</b>
        </div>

        <nav className="pvx-nav">
          <button onClick={() => goTo(`/dashboard/${candidateId}`)}>
  ⌘ Dashboard
</button>
          <button onClick={() => goTo("/applications")}>▣ Applications</button>
          <button onClick={() => goTo("/auto-apply")}>↗ Auto Apply</button>
          <button onClick={() => goTo("/job-alerts")}>🔔 Job Alerts</button>
          <button onClick={() => goTo("/ai-workspace")}>✦ AI Workspace</button>
          <button onClick={() => goTo("/resume-studio")}>📄 Resume Studio</button>
          <button onClick={() => goTo("/question-bank")}>▣ Question Bank</button>
          <button onClick={() => goTo("/trust-passport")}>ⓘ Trust Passport</button>
          <button className="active">👁 Profile Views</button>
        </nav>

        <div className="pvx-bottom">
          <button onClick={() => goTo("/settings")}>⚙ Settings</button>
          <button className="logout" onClick={() => goTo("/candidate-login")}>↪ Logout</button>
        </div>
      </aside>

      <section className="pvx-main">
        <header className="pvx-topbar">
          <button className="pvx-back" onClick={() => goTo(`/profile/${candidateId}`)}>
            ← Back to Profile
          </button>

          <div className="pvx-mini-user">
            <span>☼</span>
            <img
  src={profileImage}
  alt={candidateName}
  onError={(e) => {
    e.currentTarget.src = "/profile.png";
  }}
/>
            <section>
              <h4>VENKATESHA A</h4>
              <p>Data Engineer ✓</p>
            </section>
            <b>⌄</b>
          </div>
        </header>

        <section className="pvx-title">
          <div>
            <h1>Profile View Analytics ↗</h1>
            
          </div>

          <button onClick={() => window.print()}>⇩ Export Report</button>
        </section>

        <section className="pvx-kpis">
          <PVXKpi icon="👁" title="Total Profile Views" value={viewsData.totalViews || 0} />
          <PVXKpi icon="👥" title="Unique Recruiters" value={viewsData.uniqueRecruiters || 0} />
          <PVXKpi icon="🏢" title="Companies Viewed" value={viewsData.companiesViewed || 0} />
          <PVXKpi icon="⭐" title="Shortlisted Views" value={viewsData.shortlistedViews || 0} />
          <PVXKpi
            icon="📅"
            title="Last Viewed"
            value={viewsData.lastViewed ? new Date(viewsData.lastViewed).toLocaleDateString() : "No views"}
          />
        </section>

        <section className="pvx-grid">
          <article className="pvx-card pvx-chart-card">
            <div className="pvx-card-head">
              <h3>Profile Views Trend</h3>
              <button>Last 30 Days⌄</button>
            </div>

            <div className="pvx-chart">
              <div className="pvx-axis">
                <span>4</span>
                <span>3</span>
                <span>2</span>
                <span>1</span>
                <span>0</span>
              </div>

              <div className="pvx-bars">
                {trend.length === 0
                  ? Array.from({ length: 30 }).map((_, i) => (
                      <span key={i} style={{ height: "4px" }} />
                    ))
                  : trend.map((item) => (
                      <span
                        key={item.date}
                        title={`${item.date}: ${item.count} views`}
                        style={{
                          height: `${Math.max(((item.count || 0) / maxTrend) * 100, 4)}%`,
                        }}
                      />
                    ))}
              </div>
            </div>
          </article>

          <article className="pvx-card">
            <div className="pvx-card-head">
              <h3>Top Companies Viewing You</h3>
            </div>

            {viewsData.topCompanies?.length ? (
              <div className="pvx-list">
                {viewsData.topCompanies.map((c) => (
                  <div key={c.companyName}>
                    <span>{c.companyName?.[0] || "C"}</span>
                    <b>{c.companyName}</b>
                    <small>{c.views} views</small>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pvx-empty">
                <div>🏢🔍</div>
                <p>No company views yet.</p>
              </div>
            )}
          </article>

          <article className="pvx-card">
            <div className="pvx-card-head">
              <h3>Recent Recruiter Activity</h3>
            </div>

            {viewsData.recentViews?.length ? (
              <div className="pvx-activity">
                {viewsData.recentViews.map((view) => (
                  <div key={view._id}>
                    <img src={view.recruiterPhoto || "/profile.png"} alt="" />
                    <section>
                      <b>{view.recruiterName}</b>
                      <p>{view.companyName}</p>
                    </section>
                    <small>{new Date(view.viewedAt).toLocaleDateString()}</small>
                    <button onClick={() => alert(view.recruiterEmail || "Email not available")}>
                      👁
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pvx-empty">
                <div>👥</div>
                <p>No recruiter has viewed your profile yet.</p>
              </div>
            )}
          </article>

          <article className="pvx-card pvx-heat-card">
            <h3>Weekly Activity Heatmap</h3>

            <div className="pvx-heat-grid">
              {Array.from({ length: 35 }).map((_, i) => {
                const count = viewsData.heatmap?.[i]?.count || 0;
                return (
                  <span
                    key={i}
                    className={`level-${Math.min(count + 1, 5)}`}
                    title={viewsData.heatmap?.[i]?.date || ""}
                  />
                );
              })}
            </div>

            <div className="pvx-heat-label">
              <small>Low Activity</small>
              <div><i /><i /><i /><i /><i /></div>
              <small>High Activity</small>
            </div>
          </article>

          <article className="pvx-card">
            <h3>Profile Views by Experience Level</h3>

            <div className="pvx-donut">
              <strong>{viewsData.totalViews || 0}</strong>
              <small>Total</small>
            </div>

            <div className="pvx-exp-list">
              {(viewsData.experienceLevels || []).map((item) => (
                <div key={item.label}>
                  <span>{item.label.split(" ")[0]}</span>
                  <b>{item.label}</b>
                  <small>{item.count}</small>
                </div>
              ))}
            </div>
          </article>

          <article className="pvx-card pvx-ai">
            <h3>✨ AI Insights</h3>

            {(viewsData.insights || []).length ? (
              viewsData.insights.map((item, index) => (
                <p key={index}>{item}</p>
              ))
            ) : (
              <p>No recruiter views yet. Improve your resume, skills and profile completeness.</p>
            )}
          </article>
        </section>
      </section>
    </main>
  );
}

function PVXKpi({ icon, title, value }) {
  return (
    <article className="pvx-kpi">
      <div>{icon}</div>
      <section>
        <p>{title}</p>
        <h2>{value}</h2>
      </section>
    </article>
  );
}export default CandidateProfilePage;
