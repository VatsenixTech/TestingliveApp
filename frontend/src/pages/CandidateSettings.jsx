import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  FaBell,
  FaCheck,
  FaChevronRight,
  FaCircleCheck,
  FaCloudArrowUp,
  FaDatabase,
  FaEnvelope,
  FaGear,
  FaGlobe,
  FaKey,
  FaLink,
  FaLock,
  FaPalette,
  FaPhone,
  FaShieldHalved,
  FaTrashCan,
  FaUser,
  FaWallet,
} from "react-icons/fa6";
import "./CandidateSettings.css";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const EMPTY_PROFILE = {
  name: "",
  email: "",
  role: "",
  location: "",
  phone: "",
  timezone: "Asia/Kolkata",
  bio: "",
  profileImageUrl: "",
};

const EMPTY_PREFERENCES = {
  theme: "light",
  accentColor: "#316cf4",
  language: "English (US)",
  region: "India (IN)",
  emailNotifications: true,
  pushNotifications: true,
  jobAlerts: true,
  interviewReminders: true,
  marketingEmails: false,
  profileVisibility: true,
  recruiterMessages: true,
};

const SETTINGS_SECTIONS = [
  { id: "profile", label: "Profile", icon: FaUser },
  { id: "security", label: "Account & Security", icon: FaShieldHalved },
  { id: "notifications", label: "Notifications", icon: FaBell },
  { id: "privacy", label: "Privacy", icon: FaLock },
  { id: "subscription", label: "Subscription", icon: FaWallet },
  { id: "appearance", label: "Appearance", icon: FaPalette },
  { id: "integrations", label: "Integrations", icon: FaLink },
  { id: "data", label: "Data & Account", icon: FaDatabase },
];

const safeJson = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
};

const getPayload = (response, keys = []) => {
  const body = response?.data || {};
  for (const key of keys) {
    if (body?.[key] && typeof body[key] === "object") return body[key];
  }
  return body?.data && typeof body.data === "object" ? body.data : body;
};

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`cs-toggle ${checked ? "on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );
}

function SettingRow({ title, description, checked, onChange }) {
  return (
    <div className="cs-setting-row">
      <div>
        <strong>{title}</strong>
        <small>{description}</small>
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} />
    </div>
  );
}

function CandidateSettings() {
  const storedUser = useMemo(() => safeJson("user"), []);
  const candidateId = storedUser?.candidateId || storedUser?._id || storedUser?.id || "";
  const fileInputRef = useRef(null);

  const [activeSection, setActiveSection] = useState("profile");
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [initialProfile, setInitialProfile] = useState(EMPTY_PROFILE);
  const [preferences, setPreferences] = useState(EMPTY_PREFERENCES);
  const [subscription, setSubscription] = useState(null);
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [lastSaved, setLastSaved] = useState("");
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  const authConfig = useCallback(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("candidateToken");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }, []);

  const showSuccess = (text) => {
    setError("");
    setMessage(text);
    setLastSaved(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    window.setTimeout(() => setMessage(""), 3500);
  };

  const showError = (requestError, fallback) => {
    setMessage("");
    setError(requestError?.response?.data?.message || fallback);
  };

  const loadSettings = useCallback(async () => {
    if (!candidateId) {
      window.location.assign("/candidate-login");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const config = authConfig();
      const [profileResult, settingsResult, subscriptionResult] = await Promise.allSettled([
        axios.get(`${API_URL}/api/candidates/${candidateId}`, config),
        axios.get(`${API_URL}/api/candidates/${candidateId}/settings`, config),
        axios.get(`${API_URL}/api/subscriptions/candidate/${candidateId}`, config),
      ]);

      if (profileResult.status === "fulfilled") {
        const candidate = getPayload(profileResult.value, ["candidate", "user", "profile"]);
        const normalizedProfile = {
          name: candidate.name || candidate.fullName || "",
          email: candidate.email || "",
          role: candidate.role || candidate.currentRole || candidate.targetRole || "",
          location: candidate.location || candidate.city || "",
          phone: candidate.phone || candidate.phoneNumber || "",
          timezone: candidate.timezone || "Asia/Kolkata",
          bio: candidate.bio || candidate.about || candidate.summary || "",
          profileImageUrl: candidate.profileImageUrl || candidate.profileImage || "",
        };
        setProfile(normalizedProfile);
        setInitialProfile(normalizedProfile);
      }

      if (settingsResult.status === "fulfilled") {
        const settings = getPayload(settingsResult.value, ["settings", "preferences"]);
        setPreferences((current) => ({ ...current, ...settings }));
        setIntegrations(Array.isArray(settings.integrations) ? settings.integrations : []);
      }

      if (subscriptionResult.status === "fulfilled") {
        setSubscription(getPayload(subscriptionResult.value, ["subscription", "plan"]));
      }
    } catch (requestError) {
      showError(requestError, "Unable to load your settings.");
    } finally {
      setLoading(false);
    }
  }, [authConfig, candidateId]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme;
    document.documentElement.style.setProperty("--candidate-accent", preferences.accentColor);
    localStorage.setItem("theme", preferences.theme);
  }, [preferences.theme, preferences.accentColor]);

  const updatePreference = (key, value) => {
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      setError("");
      const config = authConfig();
      let response;
      try {
        response = await axios.patch(`${API_URL}/api/candidates/${candidateId}`, profile, config);
      } catch (patchError) {
        if (![404, 405].includes(patchError.response?.status)) throw patchError;
        response = await axios.put(`${API_URL}/api/candidates/${candidateId}`, profile, config);
      }
      const updated = getPayload(response, ["candidate", "user", "profile"]);
      const nextProfile = { ...profile, ...updated };
      setProfile(nextProfile);
      setInitialProfile(nextProfile);
      localStorage.setItem("user", JSON.stringify({ ...storedUser, ...updated, name: nextProfile.name, email: nextProfile.email }));
      showSuccess("Profile changes saved successfully.");
    } catch (requestError) {
      showError(requestError, "Unable to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      setError("");
      const config = authConfig();
      try {
        await axios.patch(`${API_URL}/api/candidates/${candidateId}/settings`, preferences, config);
      } catch (settingsError) {
        if (![404, 405].includes(settingsError.response?.status)) throw settingsError;
        await axios.put(`${API_URL}/api/candidates/${candidateId}/preferences`, preferences, config);
      }
      showSuccess("Preferences saved successfully.");
    } catch (requestError) {
      showError(requestError, "Unable to save your preferences.");
    } finally {
      setSaving(false);
    }
  };

  const uploadPhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
      setError("Choose a JPG, PNG or WebP image smaller than 2 MB.");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      setUploading(true);
      const config = authConfig();
      config.headers = { ...config.headers, "Content-Type": "multipart/form-data" };
      let response;
      try {
        response = await axios.post(`${API_URL}/api/candidates/${candidateId}/profile-photo`, formData, config);
      } catch (photoError) {
        if (![404, 405].includes(photoError.response?.status)) throw photoError;
        response = await axios.post(`${API_URL}/api/candidates/${candidateId}/photo`, formData, config);
      }
      const result = getPayload(response, ["candidate", "profile"]);
      const imageUrl = result.profileImageUrl || result.profileImage || result.url;
      if (imageUrl) setProfile((current) => ({ ...current, profileImageUrl: imageUrl }));
      showSuccess("Profile photo updated.");
    } catch (requestError) {
      showError(requestError, "Unable to upload the profile photo.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const changePassword = async () => {
    if (!passwordForm.currentPassword || passwordForm.newPassword.length < 8) {
      setError("Enter your current password and a new password of at least 8 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("The new password and confirmation do not match.");
      return;
    }

    try {
      setSaving(true);
      await axios.post(
        `${API_URL}/api/candidates/${candidateId}/change-password`,
        { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword },
        authConfig()
      );
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showSuccess("Password changed successfully.");
    } catch (requestError) {
      showError(requestError, "Unable to change your password.");
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    if (!deletePassword) {
      setError("Enter your password to confirm account deletion.");
      return;
    }
    try {
      setSaving(true);
      const config = authConfig();
      await axios.delete(`${API_URL}/api/candidates/${candidateId}`, {
        ...config,
        data: { password: deletePassword },
      });
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("candidateToken");
      window.location.assign("/");
    } catch (requestError) {
      showError(requestError, "Account deletion could not be completed.");
      setSaving(false);
    }
  };

  const completedProfileFields = [profile.profileImageUrl, profile.name, profile.email, profile.role, profile.location, profile.phone, profile.bio].filter(Boolean).length;
  const profileCompletion = Math.round((completedProfileFields / 7) * 100);

  if (loading) {
    return <div className="cs-loading"><div /><div /><div /><div /></div>;
  }

  return (
    <main className="candidate-settings-page">
      <header className="cs-page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your profile, security and preferences</p>
        </div>
        <div className="cs-header-status">
          <span><FaShieldHalved /> Account secure</span>
          <small><FaCircleCheck /> {lastSaved ? `Last saved at ${lastSaved}` : "All changes are synchronized"}</small>
        </div>
      </header>

      {(message || error) && (
        <div className={`cs-toast ${error ? "error" : "success"}`}>
          {error ? "!" : <FaCheck />} <span>{error || message}</span>
          <button type="button" onClick={() => { setError(""); setMessage(""); }}>×</button>
        </div>
      )}

      <div className="cs-layout">
        <aside className="cs-section-nav">
          {SETTINGS_SECTIONS.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" className={activeSection === id ? "active" : ""} onClick={() => setActiveSection(id)}>
              <Icon /><span>{label}</span><FaChevronRight />
            </button>
          ))}
        </aside>

        <section className="cs-section-content">
          {activeSection === "profile" && (
            <>
              <div className="cs-profile-grid">
                <article className="cs-card cs-profile-card">
                  <div className="cs-card-title"><h2>Profile Settings</h2><p>Update your personal and professional information.</p></div>
                  <div className="cs-profile-body">
                    <div className="cs-photo-column">
                      <div className="cs-avatar">
                        {profile.profileImageUrl ? <img src={profile.profileImageUrl} alt={profile.name || "Candidate"} /> : <span>{(profile.name || profile.email || "C").charAt(0).toUpperCase()}</span>}
                        <i><FaCheck /></i>
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadPhoto} hidden />
                      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}><FaCloudArrowUp /> {uploading ? "Uploading..." : "Change photo"}</button>
                      <small>JPG, PNG or WebP<br />Maximum 2 MB</small>
                    </div>

                    <div className="cs-form-grid">
                      <label><span>Full name</span><input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></label>
                      <label><span>Email address</span><div className="cs-input-icon"><FaEnvelope /><input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></div></label>
                      <label><span>Current role</span><input value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value })} /></label>
                      <label><span>Location</span><input value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} /></label>
                      <label><span>Phone number</span><div className="cs-input-icon"><FaPhone /><input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div></label>
                      <label><span>Time zone</span><select value={profile.timezone} onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}><option value="Asia/Kolkata">(GMT+05:30) Asia/Kolkata</option><option value="Europe/London">(GMT+00:00) Europe/London</option><option value="America/New_York">(GMT-05:00) America/New York</option><option value="Asia/Singapore">(GMT+08:00) Asia/Singapore</option></select></label>
                      <label className="wide"><span>About you</span><textarea rows="3" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell recruiters about your experience and career goals" /></label>
                      <div className="cs-form-actions wide"><button className="primary" type="button" onClick={saveProfile} disabled={saving}><FaCircleCheck /> {saving ? "Saving..." : "Save Changes"}</button><button type="button" onClick={() => setProfile(initialProfile)} disabled={saving}>Cancel</button></div>
                    </div>
                  </div>
                </article>

                <article className="cs-card cs-completion-card">
                  <div className="cs-card-title"><h2>Profile completion</h2><p>Complete your profile to increase visibility.</p></div>
                  <div className="cs-completion-body">
                    <div className="cs-progress-ring" style={{ "--profile-progress": `${profileCompletion * 3.6}deg` }}><span><strong>{profileCompletion}%</strong><small>Complete</small></span></div>
                    <div className="cs-checklist">
                      {[['Photo', Boolean(profile.profileImageUrl)], ['Contact details', Boolean(profile.email && profile.phone)], ['Career preferences', Boolean(profile.role && profile.location)], ['About & resume', Boolean(profile.bio)]].map(([label, done]) => <div key={label} className={done ? "done" : ""}><i>{done ? <FaCheck /> : "•"}</i><span>{label}</span><FaChevronRight /></div>)}
                    </div>
                  </div>
                </article>
              </div>

              <div className="cs-bottom-grid">
                <article className="cs-card cs-compact-card"><h3><FaGlobe /> Language & Region</h3><div className="cs-two-fields"><label><span>Language</span><select value={preferences.language} onChange={(e) => updatePreference("language", e.target.value)}><option>English (US)</option><option>English (UK)</option><option>Hindi</option><option>Kannada</option></select></label><label><span>Region</span><select value={preferences.region} onChange={(e) => updatePreference("region", e.target.value)}><option>India (IN)</option><option>United States (US)</option><option>United Kingdom (UK)</option><option>Singapore (SG)</option></select></label></div><button className="cs-row-link" onClick={() => setActiveSection("appearance")}>Formats, date and time preferences <FaChevronRight /></button></article>
                <article className="cs-card cs-compact-card"><h3><FaEnvelope /> Communication Preferences</h3><SettingRow title="Email notifications" description="Receive important account updates" checked={preferences.emailNotifications} onChange={(value) => updatePreference("emailNotifications", value)} /><SettingRow title="Marketing emails" description="Receive product and career updates" checked={preferences.marketingEmails} onChange={(value) => updatePreference("marketingEmails", value)} /><button className="cs-save-small" onClick={savePreferences} disabled={saving}>Save preferences</button></article>
                <article className="cs-card cs-danger-collapsed"><button type="button" onClick={() => setActiveSection("data")}><span><FaShieldHalved /><b>Danger Zone</b><small>Manage account deletion and your data</small></span><FaChevronRight /></button></article>
              </div>
            </>
          )}

          {activeSection === "security" && <section className="cs-card cs-detail-panel"><div className="cs-card-title"><h2>Account & Security</h2><p>Protect your account with a strong password.</p></div><div className="cs-security-form"><label><span>Current password</span><input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} /></label><label><span>New password</span><input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} /></label><label><span>Confirm new password</span><input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} /></label><button className="primary" onClick={changePassword} disabled={saving}><FaKey /> Change password</button></div></section>}

          {activeSection === "notifications" && <section className="cs-card cs-detail-panel"><div className="cs-card-title"><h2>Notification Preferences</h2><p>Choose which updates you want to receive.</p></div>{[['emailNotifications','Email notifications','Important account and application updates'],['pushNotifications','Push notifications','Real-time updates in your browser'],['jobAlerts','Job alerts','New roles matching your profile'],['interviewReminders','Interview reminders','Reminders before scheduled interviews'],['recruiterMessages','Recruiter messages','Messages and profile activity from recruiters'],['marketingEmails','Product updates','Occasional career tips and platform updates']].map(([key,title,description]) => <SettingRow key={key} title={title} description={description} checked={Boolean(preferences[key])} onChange={(value) => updatePreference(key,value)} />)}<button className="primary cs-panel-save" onClick={savePreferences} disabled={saving}>Save notification settings</button></section>}

          {activeSection === "privacy" && <section className="cs-card cs-detail-panel"><div className="cs-card-title"><h2>Privacy Controls</h2><p>Control how your profile and career information are shared.</p></div><SettingRow title="Profile visibility" description="Allow verified recruiters to discover your profile" checked={preferences.profileVisibility} onChange={(value) => updatePreference("profileVisibility",value)} /><SettingRow title="Recruiter messages" description="Allow recruiters to contact you about relevant roles" checked={preferences.recruiterMessages} onChange={(value) => updatePreference("recruiterMessages",value)} /><button className="primary cs-panel-save" onClick={savePreferences} disabled={saving}>Save privacy settings</button></section>}

          {activeSection === "subscription" && <section className="cs-card cs-detail-panel"><div className="cs-card-title"><h2>Subscription</h2><p>Manage your current NoPromptJobs plan.</p></div>{subscription ? <div className="cs-plan-card"><span>Current plan</span><h3>{subscription.name || subscription.plan || "Active plan"}</h3><p>{subscription.description || "Your subscription is active."}</p><div><small>Status</small><b>{subscription.status || "Active"}</b></div><button onClick={() => window.location.assign("/pricing")}>Manage subscription</button></div> : <div className="cs-empty-panel"><FaWallet /><h3>No subscription details available</h3><p>Review available plans and choose the one that fits your career goals.</p><button onClick={() => window.location.assign("/pricing")}>View plans</button></div>}</section>}

          {activeSection === "appearance" && <section className="cs-card cs-detail-panel"><div className="cs-card-title"><h2>Appearance</h2><p>Customize your dashboard experience.</p></div><div className="cs-theme-options">{['light','dark','system'].map((theme) => <button key={theme} className={preferences.theme === theme ? "active" : ""} onClick={() => updatePreference("theme",theme)}>{theme === 'light' ? '☀' : theme === 'dark' ? '☾' : '▣'} {theme.charAt(0).toUpperCase()+theme.slice(1)}</button>)}</div><h3>Accent color</h3><div className="cs-colors">{['#6d3df5','#316cf4','#17b997','#ff902c','#e7258b'].map((color) => <button key={color} aria-label={`Use ${color} accent`} className={preferences.accentColor === color ? "active" : ""} style={{ background:color }} onClick={() => updatePreference("accentColor",color)} />)}</div><button className="primary cs-panel-save" onClick={savePreferences} disabled={saving}>Save appearance</button></section>}

          {activeSection === "integrations" && <section className="cs-card cs-detail-panel"><div className="cs-card-title"><h2>Integrations</h2><p>Manage services connected to your NoPromptJobs account.</p></div>{integrations.length ? integrations.map((integration,index) => <div className="cs-integration" key={integration.id || integration.name || index}><i><FaLink /></i><span><strong>{integration.name || integration.provider}</strong><small>{integration.description || "Connected service"}</small></span><b>{integration.connected === false ? "Disconnected" : "Connected"}</b></div>) : <div className="cs-empty-panel"><FaLink /><h3>No integrations connected</h3><p>Your connected career and productivity services will appear here.</p></div>}</section>}

          {activeSection === "data" && <section className="cs-card cs-detail-panel"><div className="cs-card-title"><h2>Data & Account</h2><p>Download your information or permanently close your account.</p></div><button className="cs-data-row" onClick={() => window.open(`${API_URL}/api/candidates/${candidateId}/export`,"_blank")}><span><FaDatabase /><b>Download my data</b><small>Export a copy of your profile and application information</small></span><FaChevronRight /></button><div className="cs-danger-zone"><div><FaTrashCan /><span><h3>Delete account</h3><p>This permanently deletes your profile and associated candidate data.</p></span></div>{!deleteOpen ? <button onClick={() => setDeleteOpen(true)}>Manage account deletion</button> : <div className="cs-delete-confirm"><p>Enter your password to confirm this permanent action.</p><input type="password" placeholder="Current password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} /><div><button onClick={() => { setDeleteOpen(false); setDeletePassword(""); }}>Cancel</button><button onClick={deleteAccount} disabled={saving}>Delete account permanently</button></div></div>}</div></section>}
        </section>
      </div>
    </main>
  );
}

export default CandidateSettings;