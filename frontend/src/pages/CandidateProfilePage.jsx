import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiAward,
  FiBriefcase,
  FiCamera,
  FiCheck,
  FiChevronDown,
  FiEdit3,
  FiEye,
  FiFileText,
  FiFolder,
  FiLink,
  FiLogOut,
  FiMail,
  FiMapPin,
  FiPhone,
  FiPlay,
  FiPlus,
  FiSearch,
  FiSettings,
  FiShield,
  FiTrash2,
  FiUpload,
  FiUser,
  FiX,
} from "react-icons/fi";

import {
  deleteDocument,
  getProfile,
  sendEmailOtp,
  sendMobileOtp,
  updateProfile,
  uploadDocument,
  uploadProfileImage,
  verifyEmailOtp,
  verifyMobileOtp,
} from "../services/profileApi";

import "./CandidateProfilePage.css";

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const BACKEND_ORIGIN = String(RAW_API_BASE_URL)
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

function resolveDocumentUrl(fileUrl) {
  const value = String(fileUrl || "").trim();

  if (!value) return "";

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${BACKEND_ORIGIN}${value.startsWith("/") ? "" : "/"}${value}`;
}

function resolveProfileImageUrl(candidate, profile, cacheKey = "") {
  const rawValue =
    candidate?.profileImageUrl ||
    candidate?.profileImage ||
    candidate?.imageUrl ||
    candidate?.avatar ||
    profile?.profileImageUrl ||
    profile?.profileImage ||
    profile?.avatar ||
    "";

  const value = String(rawValue || "").trim().replace(/\\/g, "/");
  if (!value) return "";

  const absoluteUrl = /^https?:\/\//i.test(value)
    ? value
    : `${BACKEND_ORIGIN}${value.startsWith("/") ? "" : "/"}${value}`;

  if (!cacheKey) return absoluteUrl;
  return `${absoluteUrl}${absoluteUrl.includes("?") ? "&" : "?"}v=${cacheKey}`;
}


const emptySkill = {
  name: "",
  level: "Intermediate",
};

const emptyExperience = {
  company: "",
  role: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  description: "",
};

const emptyEducation = {
  degree: "",
  institute: "",
  year: "",
  status: "Completed",
};

const emptyProject = {
  title: "",
  description: "",
  skillsText: "",
  rating: 0,
  featured: false,
};

const emptyCertification = {
  name: "",
  issuer: "",
  issueDate: "",
  credentialUrl: "",
};

const NAVIGATION = [
  { id: "basic-info", label: "Basic Info", icon: FiUser },
  { id: "skills", label: "Skills", icon: FiLink },
  { id: "employment", label: "Employment", icon: FiBriefcase },
  { id: "education", label: "Education", icon: FiAward },
  { id: "projects", label: "Projects", icon: FiFolder },
  { id: "resume", label: "Resume", icon: FiFileText },
  { id: "certificates", label: "Certificates", icon: FiAward },
  { id: "intro-video", label: "Intro Video", icon: FiPlay },
];

function Modal({ title, children, onClose, width = "620px" }) {
  return (
    <div className="np-modal-backdrop" role="presentation">
      <div
        className="np-modal"
        style={{ "--modal-width": width }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="np-modal-header">
          <h3>{title}</h3>
          <button type="button" onClick={onClose} aria-label="Close">
            <FiX />
          </button>
        </div>
        <div className="np-modal-body">{children}</div>
      </div>
    </div>
  );
}

function VerificationStatus({ status }) {
  const normalized = status || "not_uploaded";

  const label = {
    verified: "Verified",
    pending: "Pending",
    rejected: "Rejected",
    not_uploaded: "Not uploaded",
  }[normalized];

  return (
    <span className={`np-status ${normalized}`}>
      {normalized === "verified" ? <FiCheck /> : <FiShield />}
      {label}
    </span>
  );
}

function CandidateProfilePage() {
  const navigate = useNavigate();
  const routeParams = useParams();

  const storedCandidate = (() => {
    try {
      return JSON.parse(localStorage.getItem("candidate") || "{}");
    } catch (storageError) {
      console.error("Invalid candidate data in localStorage:", storageError);
      return {};
    }
  })();

  /*
    Read candidate ID from React Router first.
    If the component is rendered outside a matching Route, read it directly
    from the browser URL: /profile/<candidateId>.
  */
  const pathnameSegments = window.location.pathname
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);

  const profileSegmentIndex = pathnameSegments.lastIndexOf("profile");

  const candidateIdFromUrl =
    profileSegmentIndex >= 0
      ? pathnameSegments[profileSegmentIndex + 1] || ""
      : pathnameSegments[pathnameSegments.length - 1] || "";

  const candidateIdCandidates = [
    routeParams.candidateId,
    routeParams.id,
    candidateIdFromUrl,
    storedCandidate._id,
    storedCandidate.id,
    localStorage.getItem("candidateId"),
  ];

  const candidateId =
    candidateIdCandidates.find((value) =>
      /^[a-fA-F0-9]{24}$/.test(String(value || "").trim())
    ) || "";

  console.log("PROFILE ID DEBUG:", {
    routeParams,
    pathname: window.location.pathname,
    candidateIdFromUrl,
    candidateId,
  });

  const [data, setData] = useState(null);
  const [activeSection, setActiveSection] = useState("basic-info");
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [profileImageVersion, setProfileImageVersion] = useState(Date.now());
  const [profileImageFailed, setProfileImageFailed] = useState(false);

  const [profileForm, setProfileForm] = useState({
    headline: "",
    location: "",
    phone: "",
    professionalSummary: "",
  });

  const [skillsDraft, setSkillsDraft] = useState([]);
  const [experienceDraft, setExperienceDraft] = useState([]);
  const [educationDraft, setEducationDraft] = useState([]);
  const [projectsDraft, setProjectsDraft] = useState([]);
  const [certificationsDraft, setCertificationsDraft] = useState([]);
  const [otp, setOtp] = useState("");
  const [mobile, setMobile] = useState("");
  const [selectedExperience, setSelectedExperience] = useState(null);

  const [settingsDraft, setSettingsDraft] = useState(() => {
    try {
      const savedSettings = JSON.parse(
        localStorage.getItem("candidateProfileSettings") || "{}"
      );

      return {
        emailNotifications: savedSettings.emailNotifications ?? true,
        jobAlerts: savedSettings.jobAlerts ?? true,
        applicationUpdates: savedSettings.applicationUpdates ?? true,
        profileVisible: savedSettings.profileVisible ?? true,
      };
    } catch {
      return {
        emailNotifications: true,
        jobAlerts: true,
        applicationUpdates: true,
        profileVisible: true,
      };
    }
  });

  const fileInputs = {
    profileImage: useRef(null),
    pan: useRef(null),
    aadhaar: useRef(null),
    resume: useRef(null),
    introVideo: useRef(null),
  };

  async function loadProfile() {
    if (!candidateId) {
      setError(`Candidate ID was not found. Current URL: ${window.location.pathname}`);
      setBusy(false);
      return;
    }

    try {
      setBusy(true);
      setError("");

      const response = await getProfile(candidateId);

      setData(response);
      setProfileForm({
        headline: response.profile?.headline || "",
        location: response.profile?.location || "",
        phone:
          response.profile?.phone ||
          response.candidate?.phone ||
          "",
        professionalSummary:
          response.profile?.professionalSummary || "",
      });

      setSkillsDraft(
        (response.profile?.skills || []).map((skill) => ({
          name: skill.name || "",
          level: skill.level || "Intermediate",
        }))
      );

      setExperienceDraft(
        (response.profile?.employment || []).map((item) => ({
          _id: item._id,
          company: item.company || "",
          role: item.role || "",
          startDate: item.startDate
            ? String(item.startDate).slice(0, 10)
            : "",
          endDate: item.endDate
            ? String(item.endDate).slice(0, 10)
            : "",
          isCurrent: Boolean(item.isCurrent),
          description: item.description || "",
        }))
      );

      setEducationDraft(
        (response.profile?.education || []).map((item) => ({
          _id: item._id,
          degree: item.degree || "",
          institute: item.institute || "",
          year: item.year || "",
          status: item.status || "Completed",
        }))
      );

      setProjectsDraft(
        (response.profile?.projects || []).map((item) => ({
          _id: item._id,
          title: item.title || "",
          description: item.description || "",
          skillsText: Array.isArray(item.skills)
            ? item.skills.join(", ")
            : "",
          rating: Number(item.rating || 0),
          featured: Boolean(item.featured),
        }))
      );

      setCertificationsDraft(
        (response.profile?.certifications || []).map((item) => ({
          _id: item._id,
          name: item.name || "",
          issuer: item.issuer || "",
          issueDate: item.issueDate
            ? String(item.issueDate).slice(0, 10)
            : "",
          credentialUrl: item.credentialUrl || "",
        }))
      );

      setMobile(response.candidate?.phone || "");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

 useEffect(() => {
  if (!candidateId) return;

  loadProfile();
}, [candidateId]);

  const verification = data?.profile?.verification || {};

  const completion = useMemo(() => {
    if (!data) return 0;

    const checks = [
      data.candidate?.name,
      data.profile?.headline,
      data.profile?.professionalSummary,
      data.profile?.location,
      data.profile?.skills?.length > 0,
      data.profile?.employment?.length > 0,
      data.profile?.education?.length > 0,
      data.profile?.documents?.some(
        (document) => document.docType === "resume"
      ),
      verification.emailVerified,
      verification.mobileVerified,
    ];

    return Math.round(
      (checks.filter(Boolean).length / checks.length) * 100
    );
  }, [data, verification]);

  const verificationComplete =
    verification.emailVerified &&
    verification.mobileVerified &&
    verification.panStatus === "verified" &&
    verification.aadhaarStatus === "verified";

  const profileDocuments = data?.profile?.documents || [];

  const profileImageUrl =
    profileImagePreview ||
    resolveProfileImageUrl(
      data?.candidate,
      data?.profile,
      profileImageVersion
    );

  function scrollToSection(sectionId) {
    setActiveSection(sectionId);

    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function openProfileEditor() {
    setModal("profile");
  }

  async function saveProfile(event) {
    event.preventDefault();

    try {
      setBusy(true);
      setError("");

      await updateProfile(candidateId, profileForm);
      setNotice("Profile updated successfully.");
      setModal(null);
      await loadProfile();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  function addSkillRow() {
    setSkillsDraft((current) => [...current, { ...emptySkill }]);
  }

  function updateSkillRow(index, key, value) {
    setSkillsDraft((current) =>
      current.map((skill, skillIndex) =>
        skillIndex === index
          ? { ...skill, [key]: value }
          : skill
      )
    );
  }

  function removeSkillRow(index) {
    setSkillsDraft((current) =>
      current.filter((_, skillIndex) => skillIndex !== index)
    );
  }

  async function saveSkills(event) {
    event.preventDefault();

    const cleaned = skillsDraft
      .filter((skill) => skill.name.trim())
      .map((skill) => ({
        name: skill.name.trim(),
        level: skill.level,
      }));

    try {
      setBusy(true);
      await updateProfile(candidateId, { skills: cleaned });
      setNotice("Skills updated successfully.");
      setModal(null);
      await loadProfile();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  function addExperienceRow() {
    setExperienceDraft((current) => [
      ...current,
      { ...emptyExperience },
    ]);
  }

  function updateExperienceRow(index, key, value) {
    setExperienceDraft((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [key]: value }
          : item
      )
    );
  }

  function removeExperienceRow(index) {
    setExperienceDraft((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  async function saveExperience(event) {
    event.preventDefault();

    const cleaned = experienceDraft
      .filter((item) => item.company.trim() || item.role.trim())
      .map((item) => ({
        ...item,
        company: item.company.trim(),
        role: item.role.trim(),
        endDate: item.isCurrent ? null : item.endDate || null,
        startDate: item.startDate || null,
      }));

    try {
      setBusy(true);
      await updateProfile(candidateId, {
        employment: cleaned,
      });
      setNotice("Employment updated successfully.");
      setModal(null);
      await loadProfile();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  function addEducationRow() {
    setEducationDraft((current) => [
      ...current,
      { ...emptyEducation },
    ]);
  }

  function updateEducationRow(index, key, value) {
    setEducationDraft((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    );
  }

  function removeEducationRow(index) {
    setEducationDraft((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  async function saveEducation(event) {
    event.preventDefault();

    const cleaned = educationDraft
      .filter((item) => item.degree.trim() || item.institute.trim())
      .map((item) => ({
        degree: item.degree.trim(),
        institute: item.institute.trim(),
        year: item.year.trim(),
        status: item.status || "Completed",
      }));

    try {
      setBusy(true);
      setError("");
      await updateProfile(candidateId, { education: cleaned });
      setNotice("Education updated successfully.");
      setModal(null);
      await loadProfile();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  function addProjectRow() {
    setProjectsDraft((current) => [
      ...current,
      { ...emptyProject },
    ]);
  }

  function updateProjectRow(index, key, value) {
    setProjectsDraft((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    );
  }

  function removeProjectRow(index) {
    setProjectsDraft((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  async function saveProjects(event) {
    event.preventDefault();

    const cleaned = projectsDraft
      .filter((item) => item.title.trim())
      .map((item) => ({
        title: item.title.trim(),
        description: item.description.trim(),
        skills: item.skillsText
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        rating: Math.max(0, Math.min(5, Number(item.rating || 0))),
        featured: Boolean(item.featured),
      }));

    try {
      setBusy(true);
      setError("");
      await updateProfile(candidateId, { projects: cleaned });
      setNotice("Projects updated successfully.");
      setModal(null);
      await loadProfile();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  function addCertificationRow() {
    setCertificationsDraft((current) => [
      ...current,
      { ...emptyCertification },
    ]);
  }

  function updateCertificationRow(index, key, value) {
    setCertificationsDraft((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    );
  }

  function removeCertificationRow(index) {
    setCertificationsDraft((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  async function saveCertifications(event) {
    event.preventDefault();

    const cleaned = certificationsDraft
      .filter((item) => item.name.trim())
      .map((item) => ({
        name: item.name.trim(),
        issuer: item.issuer.trim(),
        issueDate: item.issueDate || null,
        credentialUrl: item.credentialUrl.trim(),
      }));

    try {
      setBusy(true);
      setError("");
      await updateProfile(candidateId, { certifications: cleaned });
      setNotice("Certifications updated successfully.");
      setModal(null);
      await loadProfile();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function startEmailVerification() {
    try {
      setBusy(true);
      const response = await sendEmailOtp();
      setNotice(response.message);
      setOtp("");
      setModal("emailOtp");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function startMobileVerification() {
    try {
      setBusy(true);
      const response = await sendMobileOtp(mobile);
      setNotice(response.message);
      setOtp("");
      setModal("mobileOtp");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function confirmOtp(event) {
    event.preventDefault();

    try {
      setBusy(true);

      if (modal === "emailOtp") {
        await verifyEmailOtp(otp);
      } else {
        await verifyMobileOtp(otp);
      }

      setNotice("Verification completed successfully.");
      setOtp("");
      setModal(null);
      await loadProfile();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleProfileImageUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    const localPreviewUrl = URL.createObjectURL(file);
    setProfileImagePreview(localPreviewUrl);
    setProfileImageFailed(false);

    try {
      setBusy(true);
      setError("");

      const response = await uploadProfileImage(candidateId, file);

      const uploadedImage =
        response?.profileImageUrl ||
        response?.profileImage ||
        response?.candidate?.profileImageUrl ||
        response?.candidate?.profileImage ||
        response?.data?.profileImageUrl ||
        response?.data?.profileImage;

      if (uploadedImage) {
        setData((current) => ({
          ...current,
          candidate: {
            ...current?.candidate,
            profileImageUrl: uploadedImage,
          },
        }));
      }

      setNotice(
        response?.message || "Profile image updated successfully."
      );

      await loadProfile();
      setProfileImageVersion(Date.now());
      setProfileImagePreview("");
    } catch (requestError) {
      setProfileImagePreview("");
      setError(requestError.message || "Profile image upload failed.");
    } finally {
      URL.revokeObjectURL(localPreviewUrl);
      event.target.value = "";
      setBusy(false);
    }
  }

  async function handleUpload(event, docType) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setBusy(true);
      const response = await uploadDocument(
        candidateId,
        file,
        docType
      );
      setNotice(response.message);
      await loadProfile();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      event.target.value = "";
      setBusy(false);
    }
  }

  async function handleDeleteDocument(documentId) {
    const accepted = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!accepted) return;

    try {
      setBusy(true);
      await deleteDocument(candidateId, documentId);
      setNotice("Document deleted successfully.");
      await loadProfile();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  function handleImproveProfile() {
    const missing = [];

    if (!data.profile?.headline) missing.push("Add headline");
    if (!data.profile?.professionalSummary)
      missing.push("Add professional summary");
    if (!data.profile?.skills?.length) missing.push("Add skills");
    if (!data.profile?.employment?.length)
      missing.push("Add employment");
    if (!data.profile?.education?.length)
      missing.push("Add education");
    if (!data.profile?.projects?.length)
      missing.push("Add projects");
    if (!data.profile?.certifications?.length)
      missing.push("Add certifications");
    if (!verification.emailVerified)
      missing.push("Verify email");
    if (!verification.mobileVerified)
      missing.push("Verify mobile");
    if (!data.profile?.documents?.some((d) => d.docType === "resume"))
      missing.push("Upload resume");
    if (!data.profile?.documents?.some((d) => d.docType === "selfIntroVideo"))
      missing.push("Upload intro video");

    setNotice(
      missing.length
        ? `Next recommended action: ${missing[0]}`
        : "Your profile is already complete."
    );

    const nextMap = {
      "Add headline": "basic-info",
      "Add skills": "skills",
      "Add employment": "employment",
      "Add education": "education",
      "Add projects": "projects",
      "Add certifications": "certificates",
      "Verify email": "verification",
      "Verify mobile": "verification",
      "Upload resume": "resume",
      "Upload intro video": "intro-video",
    };

    if (missing[0] === "Add headline" || missing[0] === "Add professional summary") {
      openProfileEditor();
    } else if (missing[0] === "Add skills") {
      setModal("skills");
    } else if (missing[0] === "Add employment") {
      setModal("employment");
    } else if (missing[0] === "Add education") {
      if (!educationDraft.length) addEducationRow();
      setModal("education");
    } else if (missing[0] === "Add projects") {
      if (!projectsDraft.length) addProjectRow();
      setModal("projects");
    } else if (missing[0] === "Add certifications") {
      if (!certificationsDraft.length) addCertificationRow();
      setModal("certifications");
    } else if (missing[0] === "Verify email") {
      startEmailVerification();
    } else if (missing[0] === "Verify mobile") {
      document.getElementById("verification")?.scrollIntoView({
        behavior: "smooth",
      });
    } else if (nextMap[missing[0]]) {
      scrollToSection(nextMap[missing[0]]);
    }
  }

  function handleSettingToggle(settingName) {
    setSettingsDraft((current) => ({
      ...current,
      [settingName]: !current[settingName],
    }));
  }

  function saveSettings(event) {
    event.preventDefault();

    localStorage.setItem(
      "candidateProfileSettings",
      JSON.stringify(settingsDraft)
    );

    setNotice("Settings saved successfully.");
    setError("");
    setModal(null);
  }

function handleLogout() {
  const accepted = window.confirm(
    "Are you sure you want to log out?"
  );

  if (!accepted) return;

  [
    "candidate",
    "candidateId",
    "token",
    "authToken",
    "accessToken",
    "refreshToken",
    "user",
  ].forEach((key) => localStorage.removeItem(key));

  sessionStorage.clear();

  setData(null);
  setNotice("");
  setError("");

  navigate("/login", { replace: true });
}
if (!candidateId) {
  return null;
}

if (!data) {
  return (
    <div className="np-loading">
      {busy ? "Loading profile..." : error || "Profile unavailable"}
    </div>
  );
}

  return (
    <div className="np-page">
      <aside className="np-sidebar">
        <div className="np-brand">
          <div className="np-brand-clickable">
            <img
              className="np-brand-logo"
              src="/logo.png"
              alt="NoPrompt Jobs"
              onError={(event) => {
                event.currentTarget.style.display = "none";
                event.currentTarget.nextElementSibling.style.display = "grid";
              }}
            />

            <span className="np-brand-logo-fallback">N</span>
          </div>
        </div>

        <p className="np-sidebar-label">EDIT PROFILE</p>

        <nav>
          {NAVIGATION.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                className={
                  activeSection === item.id ? "active" : ""
                }
                onClick={() => scrollToSection(item.id)}
              >
                <Icon />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="np-sidebar-footer">
          <button
            type="button"
            onClick={() => setModal("settings")}
          >
            <FiSettings />
            Settings
          </button>
          <button type="button" onClick={handleLogout}>
            <FiLogOut />
            Logout
          </button>
        </div>
      </aside>

      <main className="np-main">
        <header className="np-header">
          <div className="np-header-spacer" aria-hidden="true" />

          <div className="np-header-actions">
            <button type="button" aria-label="Search">
              <FiSearch />
            </button>
            <button
              type="button"
              aria-label="Notifications"
              onClick={() =>
                setNotice("You have no new profile notifications.")
              }
            >
              🔔
            </button>
            <div className="np-user">
              <div className="np-user-avatar">
                {data.candidate.name?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <strong>{data.candidate.name}</strong>
                <span>{data.profile.headline || "Candidate"}</span>
              </div>
              <FiChevronDown />
            </div>
          </div>
        </header>

        {(notice || error) && (
  <div
    className={`np-alert ${
      error ? "error" : "success"
    }`}
  >
    <span>{error || notice}</span>

    <button
      type="button"
      onClick={() => {
        setNotice("");
        setError("");
      }}
    >
      <FiX />
    </button>
  </div>
)}
        <div className="np-content">
          <section className="np-primary-column">
            <article
              id="basic-info"
              className="np-card np-profile-overview"
            >
              <div className="np-card-header">
                <div>
                  <div className="np-title-line">
                    <h2>Profile Overview</h2>
                    {verificationComplete && (
                      <span className="np-mini-verified">
                        <FiCheck /> Verified
                      </span>
                    )}
                  </div>
                  <p>
                    Keep your profile updated to increase your visibility
                    to recruiters.
                  </p>
                </div>

                <button
                  type="button"
                  className="np-primary-button"
                  onClick={openProfileEditor}
                >
                  <FiEdit3 />
                  Edit Profile
                </button>
              </div>

              <div className="np-overview-body">
                <div className="np-profile-photo">
                  {profileImageUrl && !profileImageFailed ? (
                    <img
                      key={profileImageUrl}
                      src={profileImageUrl}
                      alt={`${data.candidate.name || "Candidate"} profile`}
                      onLoad={() => setProfileImageFailed(false)}
                      onError={() => {
                        console.error("Unable to load profile image:", profileImageUrl);
                        setProfileImageFailed(true);
                      }}
                    />
                  ) : (
                    <span>
                      {data.candidate.name?.slice(0, 2).toUpperCase() || "U"}
                    </span>
                  )}

                  <button
                    type="button"
                    aria-label="Upload profile image"
                    title="Upload profile image"
                    disabled={busy}
                    onClick={() =>
                      fileInputs.profileImage.current?.click()
                    }
                  >
                    <FiCamera />
                  </button>

                  <input
                    ref={fileInputs.profileImage}
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleProfileImageUpload}
                  />
                </div>

                <div className="np-profile-info">
                  <div className="np-name-line">
                    <h1>{data.candidate.name}</h1>
                    <span>
                      {data.profile.headline || "Add headline"}
                    </span>
                  </div>

                  <p>
                    <FiMapPin />
                    {data.profile.location || "Add your location"}
                  </p>

                  <div className="np-contact-line">
                    <p>
                      <FiMail />
                      {data.candidate.email}
                    </p>
                    <p>
                      <FiPhone />
                      {data.candidate.phone || "Add phone"}
                    </p>
                  </div>

                  {data.candidate.linkedinUrl && (
                    <a
                      href={data.candidate.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FiLink />
                      {data.candidate.linkedinUrl}
                    </a>
                  )}

                  <p>
                    Member since{" "}
                    {new Date(
                      data.candidate.createdAt
                    ).toLocaleDateString("en-IN", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </article>

            <article id="verification" className="np-card">
              <div className="np-card-header">
                <div>
                  <div className="np-title-line">
                    <h2>Identity Verification</h2>
                    {verificationComplete && (
                      <span className="np-mini-verified">
                        <FiCheck /> Verified
                      </span>
                    )}
                  </div>
                  <p>
                    Verification status comes from backend OTP and
                    document review.
                  </p>
                </div>

                <button
                  type="button"
                  className="np-outline-button"
                  onClick={() => setModal("documents")}
                >
                  <FiEye />
                  View Documents
                </button>
              </div>

              <div className="np-verification-grid">
                <div className="np-verification-item">
                  <FiMail />
                  <div>
                    <strong>Email Address</strong>
                    <VerificationStatus
                      status={
                        verification.emailVerified
                          ? "verified"
                          : "pending"
                      }
                    />
                    <p>{data.candidate.email}</p>
                    {!verification.emailVerified && (
                      <button
                        type="button"
                        onClick={startEmailVerification}
                        disabled={busy}
                      >
                        Send OTP
                      </button>
                    )}
                  </div>
                </div>

                <div className="np-verification-item">
                  <FiPhone />
                  <div>
                    <strong>Mobile Number</strong>
                    <VerificationStatus
                      status={
                        verification.mobileVerified
                          ? "verified"
                          : "pending"
                      }
                    />
                    <input
                      value={mobile}
                      onChange={(event) =>
                        setMobile(event.target.value)
                      }
                      placeholder="+919876543210"
                      disabled={verification.mobileVerified}
                    />
                    {!verification.mobileVerified && (
                      <button
                        type="button"
                        onClick={startMobileVerification}
                        disabled={busy}
                      >
                        Send OTP
                      </button>
                    )}
                  </div>
                </div>

                <div className="np-verification-item">
                  <FiShield />
                  <div>
                    <strong>PAN Card</strong>
                    <VerificationStatus
                      status={
                        verification.panStatus || "not_uploaded"
                      }
                    />
                    <button
                      type="button"
                      onClick={() => fileInputs.pan.current?.click()}
                    >
                      <FiUpload /> Upload PAN
                    </button>
                    <input
                      ref={fileInputs.pan}
                      type="file"
                      hidden
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={(event) =>
                        handleUpload(event, "pan")
                      }
                    />
                  </div>
                </div>

                <div className="np-verification-item">
                  <FiShield />
                  <div>
                    <strong>Aadhaar Card</strong>
                    <VerificationStatus
                      status={
                        verification.aadhaarStatus ||
                        "not_uploaded"
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        fileInputs.aadhaar.current?.click()
                      }
                    >
                      <FiUpload /> Upload Aadhaar
                    </button>
                    <input
                      ref={fileInputs.aadhaar}
                      type="file"
                      hidden
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={(event) =>
                        handleUpload(event, "aadhaar")
                      }
                    />
                  </div>
                </div>
              </div>
            </article>

            <div className="np-bottom-grid">
              <article id="skills" className="np-card np-compact-card">
                <div className="np-section-heading">
                  <h2>Top Skills</h2>
                  <button
                    type="button"
                    onClick={() => setModal("skills")}
                  >
                    Manage Skills
                  </button>
                </div>

                <div className="np-skills-grid">
                  {data.profile.skills?.length ? (
                    data.profile.skills.slice(0, 8).map((skill) => (
                      <div
                        className="np-skill"
                        key={`${skill.name}-${skill.level}`}
                      >
                        <strong>{skill.name}</strong>
                        <span>{skill.level}</span>
                      </div>
                    ))
                  ) : (
                    <p>No skills added yet.</p>
                  )}
                </div>

                <button
                  type="button"
                  className="np-text-button"
                  onClick={() => setModal("skills")}
                >
                  View all skills →
                </button>
              </article>

              <article
                id="employment"
                className="np-card np-compact-card"
              >
                <div className="np-section-heading">
                  <h2>Work Experience</h2>
                  <button
                    type="button"
                    onClick={() => {
                      if (!experienceDraft.length) {
                        addExperienceRow();
                      }
                      setModal("employment");
                    }}
                  >
                    <FiPlus /> Add Experience
                  </button>
                </div>

                <div className="np-experience-list">
                  {data.profile.employment?.length ? (
                    data.profile.employment.map((item) => (
                      <div
                        className="np-experience"
                        key={item._id}
                      >
                        <div className="np-company-logo">
                          {item.company?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <strong>{item.company}</strong>
                          <span>{item.role}</span>
                          <p>
                            {item.startDate
                              ? new Date(item.startDate).toLocaleDateString(
                                  "en-IN",
                                  {
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "Start date not added"}
                            {" — "}
                            {item.isCurrent
                              ? "Present"
                              : item.endDate
                              ? new Date(item.endDate).toLocaleDateString(
                                  "en-IN",
                                  {
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "End date not added"}
                          </p>
                          <button
                            type="button"
                            className="np-text-button"
                            onClick={() => {
                              setSelectedExperience(item);
                              setModal("experienceDetails");
                            }}
                          >
                            View Details →
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No employment added yet.</p>
                  )}
                </div>
              </article>
            </div>

            <article id="education" className="np-card np-compact-card">
              <div className="np-section-heading">
                <h2>Education</h2>
                <button
                  type="button"
                  onClick={() => {
                    if (!educationDraft.length) addEducationRow();
                    setModal("education");
                  }}
                >
                  <FiPlus /> Add / Edit Education
                </button>
              </div>

              <div className="np-record-list">
                {data.profile.education?.length ? (
                  data.profile.education.map((item) => (
                    <div className="np-record-item" key={item._id}>
                      <div className="np-record-icon">
                        <FiAward />
                      </div>
                      <div>
                        <strong>{item.degree || "Degree"}</strong>
                        <span>{item.institute || "Institute not added"}</span>
                        <p>
                          {item.year || "Year not added"} •{" "}
                          {item.status || "Completed"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="np-empty-state">
                    <FiAward />
                    <p>No education added yet.</p>
                    <button
                      type="button"
                      onClick={() => {
                        addEducationRow();
                        setModal("education");
                      }}
                    >
                      Add Education
                    </button>
                  </div>
                )}
              </div>
            </article>

            <article id="projects" className="np-card np-compact-card">
              <div className="np-section-heading">
                <h2>Projects</h2>
                <button
                  type="button"
                  onClick={() => {
                    if (!projectsDraft.length) addProjectRow();
                    setModal("projects");
                  }}
                >
                  <FiPlus /> Add / Edit Projects
                </button>
              </div>

              <div className="np-record-list">
                {data.profile.projects?.length ? (
                  data.profile.projects.map((item) => (
                    <div className="np-record-item" key={item._id}>
                      <div className="np-record-icon">
                        <FiFolder />
                      </div>
                      <div>
                        <div className="np-record-title-line">
                          <strong>{item.title}</strong>
                          {item.featured && (
                            <span className="np-featured-badge">Featured</span>
                          )}
                        </div>
                        <p>{item.description || "No description added."}</p>
                        {item.skills?.length > 0 && (
                          <div className="np-mini-tags">
                            {item.skills.map((skill) => (
                              <span key={skill}>{skill}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="np-empty-state">
                    <FiFolder />
                    <p>No projects added yet.</p>
                    <button
                      type="button"
                      onClick={() => {
                        addProjectRow();
                        setModal("projects");
                      }}
                    >
                      Add Project
                    </button>
                  </div>
                )}
              </div>
            </article>

            <article id="resume" className="np-card np-upload-card">
              <div>
                <h2>Resume</h2>
                <p>
                  Upload or replace your current resume. PDF is
                  recommended.
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputs.resume.current?.click()}
              >
                <FiUpload />
                Upload Resume
              </button>
              <input
                ref={fileInputs.resume}
                hidden
                type="file"
                accept=".pdf"
                onChange={(event) =>
                  handleUpload(event, "resume")
                }
              />
            </article>

            <article id="certificates" className="np-card np-compact-card">
              <div className="np-section-heading">
                <h2>Certifications</h2>
                <button
                  type="button"
                  onClick={() => {
                    if (!certificationsDraft.length) addCertificationRow();
                    setModal("certifications");
                  }}
                >
                  <FiPlus /> Add / Edit Certifications
                </button>
              </div>

              <div className="np-record-list">
                {data.profile.certifications?.length ? (
                  data.profile.certifications.map((item) => (
                    <div className="np-record-item" key={item._id}>
                      <div className="np-record-icon">
                        <FiAward />
                      </div>
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.issuer || "Issuer not added"}</span>
                        <p>
                          {item.issueDate
                            ? new Date(item.issueDate).toLocaleDateString("en-IN")
                            : "Issue date not added"}
                        </p>
                        {item.credentialUrl && (
                          <a
                            href={item.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View credential
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="np-empty-state">
                    <FiAward />
                    <p>No certifications added yet.</p>
                    <button
                      type="button"
                      onClick={() => {
                        addCertificationRow();
                        setModal("certifications");
                      }}
                    >
                      Add Certification
                    </button>
                  </div>
                )}
              </div>
            </article>

            <article
              id="intro-video"
              className="np-card np-upload-card"
            >
              <div>
                <h2>Intro Video</h2>
                <p>
                  Upload a short professional introduction video.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  fileInputs.introVideo.current?.click()
                }
              >
                <FiUpload />
                Upload Video
              </button>
              <input
                ref={fileInputs.introVideo}
                hidden
                type="file"
                accept="video/mp4,video/webm"
                onChange={(event) =>
                  handleUpload(event, "selfIntroVideo")
                }
              />
            </article>
          </section>

          <aside className="np-right-column">
            <article className="np-card np-completion-card">
              <div className="np-section-heading">
                <h2>Profile Completion</h2>
                <span>{completion}% Complete</span>
              </div>

              <div className="np-progress">
                <span style={{ width: `${completion}%` }} />
              </div>

              {[
                ["Basic Information", Boolean(data.profile.headline)],
                [
                  "Work Experience",
                  data.profile.employment?.length > 0,
                ],
                ["Skills", data.profile.skills?.length > 0],
                ["Education", data.profile.education?.length > 0],
                ["Projects", data.profile.projects?.length > 0],
                ["Certifications", data.profile.certifications?.length > 0],
                [
                  "Resume",
                  profileDocuments.some(
                    (document) => document.docType === "resume"
                  ),
                ],
                [
                  "Intro Video (Optional)",
                  profileDocuments.some(
                    (document) =>
                      document.docType === "selfIntroVideo"
                  ),
                ],
              ].map(([label, complete]) => (
                <div className="np-completion-row" key={label}>
                  <span className={complete ? "complete" : ""}>
                    {complete && <FiCheck />}
                  </span>
                  <strong>{label}</strong>
                  <small>
                    {complete ? "Completed" : "Add Now"}
                  </small>
                </div>
              ))}

              <button
                type="button"
                className="np-improve-button"
                onClick={handleImproveProfile}
              >
                🚀 Improve Profile
              </button>
            </article>

            <article className="np-card np-activity-card">
              <h2>Recent Activity</h2>

              {[
                {
                  title: "Profile updated",
                  date: data.profile.updatedAt,
                  active: true,
                },
                {
                  title: "Email verified",
                  date: verification.emailVerifiedAt,
                  active: verification.emailVerified,
                },
                {
                  title: "Mobile verified",
                  date: verification.mobileVerifiedAt,
                  active: verification.mobileVerified,
                },
                {
                  title: "PAN verified",
                  date: verification.panVerifiedAt,
                  active: verification.panStatus === "verified",
                },
                {
                  title: "Aadhaar verified",
                  date: verification.aadhaarVerifiedAt,
                  active: verification.aadhaarStatus === "verified",
                },
              ]
                .filter((item) => item.active)
                .map((item) => (
                  <div
                    className="np-activity-row"
                    key={item.title}
                  >
                    <span><FiCheck /></span>
                    <div>
                      <strong>{item.title}</strong>
                      <small>
                        {item.date
                          ? new Date(item.date).toLocaleDateString(
                              "en-IN"
                            )
                          : "Recently"}
                      </small>
                    </div>
                  </div>
                ))}

              <button
                type="button"
                className="np-text-button"
                onClick={() => setModal("activity")}
              >
                View All Activity →
              </button>
            </article>
          </aside>
        </div>
      </main>

      {modal === "profile" && (
        <Modal title="Edit Profile" onClose={() => setModal(null)}>
          <form className="np-form" onSubmit={saveProfile}>
            <label>
              Headline
              <input
                value={profileForm.headline}
                onChange={(event) =>
                  setProfileForm({
                    ...profileForm,
                    headline: event.target.value,
                  })
                }
                placeholder="Data Engineer"
                required
              />
            </label>

            <label>
              Location
              <input
                value={profileForm.location}
                onChange={(event) =>
                  setProfileForm({
                    ...profileForm,
                    location: event.target.value,
                  })
                }
                placeholder="Bangalore, Karnataka, India"
              />
            </label>

            <label>
              Phone number
              <input
                value={profileForm.phone}
                onChange={(event) =>
                  setProfileForm({
                    ...profileForm,
                    phone: event.target.value,
                  })
                }
                placeholder="+919876543210"
              />
              <small>
                Changing the phone number removes the previous verified
                status.
              </small>
            </label>

            <label>
              Professional summary
              <textarea
                rows="6"
                value={profileForm.professionalSummary}
                onChange={(event) =>
                  setProfileForm({
                    ...profileForm,
                    professionalSummary: event.target.value,
                  })
                }
              />
            </label>

            <button
              type="submit"
              className="np-primary-button"
              disabled={busy}
            >
              {busy ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </Modal>
      )}

      {modal === "skills" && (
        <Modal title="Manage Skills" onClose={() => setModal(null)}>
          <form className="np-form" onSubmit={saveSkills}>
            {skillsDraft.map((skill, index) => (
              <div className="np-inline-row" key={index}>
                <input
                  value={skill.name}
                  onChange={(event) =>
                    updateSkillRow(
                      index,
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="Skill name"
                />

                <select
                  value={skill.level}
                  onChange={(event) =>
                    updateSkillRow(
                      index,
                      "level",
                      event.target.value
                    )
                  }
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>Expert</option>
                </select>

                <button
                  type="button"
                  className="np-danger-icon"
                  onClick={() => removeSkillRow(index)}
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}

            <button
              type="button"
              className="np-outline-button"
              onClick={addSkillRow}
            >
              <FiPlus /> Add Skill
            </button>

            <button
              type="submit"
              className="np-primary-button"
              disabled={busy}
            >
              Save Skills
            </button>
          </form>
        </Modal>
      )}

      {modal === "employment" && (
        <Modal
          title="Manage Employment"
          onClose={() => setModal(null)}
          width="820px"
        >
          <form className="np-form" onSubmit={saveExperience}>
            {experienceDraft.map((item, index) => (
              <div className="np-employment-editor" key={index}>
                <div className="np-editor-heading">
                  <strong>Experience {index + 1}</strong>
                  <button
                    type="button"
                    onClick={() => removeExperienceRow(index)}
                  >
                    <FiTrash2 />
                  </button>
                </div>

                <div className="np-form-grid">
                  <label>
                    Company
                    <input
                      value={item.company}
                      onChange={(event) =>
                        updateExperienceRow(
                          index,
                          "company",
                          event.target.value
                        )
                      }
                      required
                    />
                  </label>

                  <label>
                    Role
                    <input
                      value={item.role}
                      onChange={(event) =>
                        updateExperienceRow(
                          index,
                          "role",
                          event.target.value
                        )
                      }
                      required
                    />
                  </label>

                  <label>
                    Start date
                    <input
                      type="date"
                      value={item.startDate}
                      onChange={(event) =>
                        updateExperienceRow(
                          index,
                          "startDate",
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    End date
                    <input
                      type="date"
                      value={item.endDate}
                      disabled={item.isCurrent}
                      onChange={(event) =>
                        updateExperienceRow(
                          index,
                          "endDate",
                          event.target.value
                        )
                      }
                    />
                  </label>
                </div>

                <label className="np-checkbox">
                  <input
                    type="checkbox"
                    checked={item.isCurrent}
                    onChange={(event) =>
                      updateExperienceRow(
                        index,
                        "isCurrent",
                        event.target.checked
                      )
                    }
                  />
                  I currently work here
                </label>

                <label>
                  Description
                  <textarea
                    rows="4"
                    value={item.description}
                    onChange={(event) =>
                      updateExperienceRow(
                        index,
                        "description",
                        event.target.value
                      )
                    }
                  />
                </label>
              </div>
            ))}

            <button
              type="button"
              className="np-outline-button"
              onClick={addExperienceRow}
            >
              <FiPlus /> Add Another Experience
            </button>

            <button
              type="submit"
              className="np-primary-button"
              disabled={busy}
            >
              Save Employment
            </button>
          </form>
        </Modal>
      )}

      {modal === "education" && (
        <Modal
          title="Manage Education"
          onClose={() => setModal(null)}
          width="820px"
        >
          <form className="np-form" onSubmit={saveEducation}>
            {educationDraft.map((item, index) => (
              <div className="np-employment-editor" key={index}>
                <div className="np-editor-heading">
                  <strong>Education {index + 1}</strong>
                  <button
                    type="button"
                    onClick={() => removeEducationRow(index)}
                    aria-label="Remove education"
                  >
                    <FiTrash2 />
                  </button>
                </div>

                <div className="np-form-grid">
                  <label>
                    Degree
                    <input
                      value={item.degree}
                      onChange={(event) =>
                        updateEducationRow(index, "degree", event.target.value)
                      }
                      placeholder="B.Tech / B.Sc / MBA"
                      required
                    />
                  </label>

                  <label>
                    Institute
                    <input
                      value={item.institute}
                      onChange={(event) =>
                        updateEducationRow(index, "institute", event.target.value)
                      }
                      placeholder="College or university"
                      required
                    />
                  </label>

                  <label>
                    Year
                    <input
                      value={item.year}
                      onChange={(event) =>
                        updateEducationRow(index, "year", event.target.value)
                      }
                      placeholder="2018 - 2022"
                    />
                  </label>

                  <label>
                    Status
                    <select
                      value={item.status}
                      onChange={(event) =>
                        updateEducationRow(index, "status", event.target.value)
                      }
                    >
                      <option>Completed</option>
                      <option>Pursuing</option>
                      <option>Discontinued</option>
                    </select>
                  </label>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="np-outline-button"
              onClick={addEducationRow}
            >
              <FiPlus /> Add Another Education
            </button>

            <button
              type="submit"
              className="np-primary-button"
              disabled={busy}
            >
              {busy ? "Saving..." : "Save Education"}
            </button>
          </form>
        </Modal>
      )}

      {modal === "projects" && (
        <Modal
          title="Manage Projects"
          onClose={() => setModal(null)}
          width="860px"
        >
          <form className="np-form" onSubmit={saveProjects}>
            {projectsDraft.map((item, index) => (
              <div className="np-employment-editor" key={index}>
                <div className="np-editor-heading">
                  <strong>Project {index + 1}</strong>
                  <button
                    type="button"
                    onClick={() => removeProjectRow(index)}
                    aria-label="Remove project"
                  >
                    <FiTrash2 />
                  </button>
                </div>

                <div className="np-form-grid">
                  <label>
                    Project title
                    <input
                      value={item.title}
                      onChange={(event) =>
                        updateProjectRow(index, "title", event.target.value)
                      }
                      placeholder="Customer Analytics Platform"
                      required
                    />
                  </label>

                  <label>
                    Skills
                    <input
                      value={item.skillsText}
                      onChange={(event) =>
                        updateProjectRow(index, "skillsText", event.target.value)
                      }
                      placeholder="PySpark, AWS, SQL"
                    />
                  </label>

                  <label>
                    Rating (0 to 5)
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={item.rating}
                      onChange={(event) =>
                        updateProjectRow(index, "rating", event.target.value)
                      }
                    />
                  </label>

                  <label className="np-checkbox">
                    <input
                      type="checkbox"
                      checked={item.featured}
                      onChange={(event) =>
                        updateProjectRow(index, "featured", event.target.checked)
                      }
                    />
                    Mark as featured
                  </label>
                </div>

                <label>
                  Description
                  <textarea
                    rows="5"
                    value={item.description}
                    onChange={(event) =>
                      updateProjectRow(index, "description", event.target.value)
                    }
                    placeholder="Explain the problem, your contribution and impact."
                  />
                </label>
              </div>
            ))}

            <button
              type="button"
              className="np-outline-button"
              onClick={addProjectRow}
            >
              <FiPlus /> Add Another Project
            </button>

            <button
              type="submit"
              className="np-primary-button"
              disabled={busy}
            >
              {busy ? "Saving..." : "Save Projects"}
            </button>
          </form>
        </Modal>
      )}

      {modal === "certifications" && (
        <Modal
          title="Manage Certifications"
          onClose={() => setModal(null)}
          width="820px"
        >
          <form className="np-form" onSubmit={saveCertifications}>
            {certificationsDraft.map((item, index) => (
              <div className="np-employment-editor" key={index}>
                <div className="np-editor-heading">
                  <strong>Certification {index + 1}</strong>
                  <button
                    type="button"
                    onClick={() => removeCertificationRow(index)}
                    aria-label="Remove certification"
                  >
                    <FiTrash2 />
                  </button>
                </div>

                <div className="np-form-grid">
                  <label>
                    Certification name
                    <input
                      value={item.name}
                      onChange={(event) =>
                        updateCertificationRow(index, "name", event.target.value)
                      }
                      placeholder="AWS Certified Data Engineer"
                      required
                    />
                  </label>

                  <label>
                    Issuing organization
                    <input
                      value={item.issuer}
                      onChange={(event) =>
                        updateCertificationRow(index, "issuer", event.target.value)
                      }
                      placeholder="Amazon Web Services"
                    />
                  </label>

                  <label>
                    Issue date
                    <input
                      type="date"
                      value={item.issueDate}
                      onChange={(event) =>
                        updateCertificationRow(
                          index,
                          "issueDate",
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    Credential URL
                    <input
                      type="url"
                      value={item.credentialUrl}
                      onChange={(event) =>
                        updateCertificationRow(
                          index,
                          "credentialUrl",
                          event.target.value
                        )
                      }
                      placeholder="https://..."
                    />
                  </label>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="np-outline-button"
              onClick={addCertificationRow}
            >
              <FiPlus /> Add Another Certification
            </button>

            <button
              type="submit"
              className="np-primary-button"
              disabled={busy}
            >
              {busy ? "Saving..." : "Save Certifications"}
            </button>
          </form>
        </Modal>
      )}

      {(modal === "emailOtp" || modal === "mobileOtp") && (
        <Modal
          title={
            modal === "emailOtp"
              ? "Verify Email"
              : "Verify Mobile"
          }
          onClose={() => setModal(null)}
        >
          <form className="np-form" onSubmit={confirmOtp}>
            <label>
              Verification code
              <input
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter OTP"
                required
              />
            </label>

            <button
              type="submit"
              className="np-primary-button"
              disabled={busy}
            >
              {busy ? "Verifying..." : "Verify"}
            </button>
          </form>
        </Modal>
      )}

      {modal === "documents" && (
        <Modal
          title="Your Documents"
          onClose={() => setModal(null)}
          width="760px"
        >
          <div className="np-document-list">
            {profileDocuments.length ? (
              profileDocuments.map((document) => (
                <div
                  className="np-document-row"
                  key={document._id}
                >
                  <FiFileText />
                  <div>
                    <strong>{document.fileName}</strong>
                    <span>{document.docType}</span>
                  </div>
                  <VerificationStatus
                    status={document.verificationStatus}
                  />
                  <a
                    href={resolveDocumentUrl(document.fileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteDocument(document._id)
                    }
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))
            ) : (
              <p>No documents uploaded yet.</p>
            )}
          </div>
        </Modal>
      )}

      {modal === "experienceDetails" && selectedExperience && (
        <Modal
          title="Experience Details"
          onClose={() => setModal(null)}
        >
          <div className="np-details">
            <h3>{selectedExperience.role}</h3>
            <strong>{selectedExperience.company}</strong>
            <p>{selectedExperience.description || "No description added."}</p>
            <button
              type="button"
              className="np-primary-button"
              onClick={() => {
                setModal("employment");
                setSelectedExperience(null);
              }}
            >
              Edit Experience
            </button>
          </div>
        </Modal>
      )}

      {modal === "settings" && (
        <Modal
          title="Profile Settings"
          onClose={() => setModal(null)}
          width="680px"
        >
          <form className="np-form np-settings-form" onSubmit={saveSettings}>
            <p className="np-settings-description">
              Manage your notifications, job preferences and profile privacy.
            </p>

            <div className="np-settings-list">
              {[
                {
                  key: "emailNotifications",
                  title: "Email notifications",
                  description:
                    "Receive important account and profile updates by email.",
                },
                {
                  key: "jobAlerts",
                  title: "Job alerts",
                  description:
                    "Receive alerts when new jobs match your profile.",
                },
                {
                  key: "applicationUpdates",
                  title: "Application updates",
                  description:
                    "Receive notifications when an application status changes.",
                },
                {
                  key: "profileVisible",
                  title: "Profile visibility",
                  description:
                    "Allow verified recruiters to discover your profile.",
                },
              ].map((setting) => (
                <div className="np-setting-row" key={setting.key}>
                  <div>
                    <strong>{setting.title}</strong>
                    <p>{setting.description}</p>
                  </div>

                  <button
                    type="button"
                    className={`np-toggle ${
                      settingsDraft[setting.key] ? "active" : ""
                    }`}
                    aria-pressed={settingsDraft[setting.key]}
                    aria-label={`Toggle ${setting.title}`}
                    onClick={() => handleSettingToggle(setting.key)}
                  >
                    <span />
                  </button>
                </div>
              ))}
            </div>

            <div className="np-settings-actions">
              <button
                type="button"
                className="np-outline-button"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>

              <button type="submit" className="np-primary-button">
                Save Settings
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === "activity" && (
        <Modal title="Profile Activity" onClose={() => setModal(null)}>
          <div className="np-details">
            <p>
              Profile last updated:{" "}
              {new Date(data.profile.updatedAt).toLocaleString("en-IN")}
            </p>
            <p>
              Email:{" "}
              {verification.emailVerified
                ? "Verified"
                : "Not verified"}
            </p>
            <p>
              Mobile:{" "}
              {verification.mobileVerified
                ? "Verified"
                : "Not verified"}
            </p>
            <p>PAN: {verification.panStatus || "Not uploaded"}</p>
            <p>
              Aadhaar:{" "}
              {verification.aadhaarStatus || "Not uploaded"}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default CandidateProfilePage;