import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import "./CandidateSettings.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CandidateSettings() {
  const { candidateId } = useParams();

  const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const userId =
    candidateId || savedUser?._id || savedUser?.id || savedUser?.candidateId;

  const dashboardPath = userId ? `/dashboard/${userId}` : "/dashboard";

  const [activeTab, setActiveTab] = useState("Account");
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileImage, setProfileImage] = useState(
    savedUser?.profileImageUrl ||
      savedUser?.profileImage ||
      savedUser?.photo ||
      "/profile.png"
  );

  const [candidateName, setCandidateName] = useState(
    savedUser?.name || savedUser?.fullName || "VENKATESHA A"
  );

  const [candidateEmail] = useState(
    savedUser?.email || "venkateshisbm01@gmail.com"
  );

  const [candidateRole, setCandidateRole] = useState(
    savedUser?.currentRole || savedUser?.role || "Data Engineer"
  );

  const [candidateLocation, setCandidateLocation] = useState(
    savedUser?.location || savedUser?.city || "Bangalore"
  );

  const [darkMode, setDarkMode] = useState(false);
  const [accentColor, setAccentColor] = useState("purple");

  const [jobAlerts, setJobAlerts] = useState(true);
  const [appUpdates, setAppUpdates] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  const [deletePassword, setDeletePassword] = useState("");

  const initials = useMemo(() => {
    return candidateName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [candidateName]);

  const goTo = (path) => {
    window.location.href = path;
  };

  const logoutUser = () => {
    localStorage.clear();
    goTo("/candidate-login");
  };

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };

  const updatePassword = async () => {
    if (!userId) {
      alert("Candidate ID not found. Please login again.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      alert("Please enter new password and confirm password");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setPasswordLoading(true);

      const res = await fetch(
        `${API_URL}/api/candidates/${userId}/change-password`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to update password");
        return;
      }

      alert(data.message || "Password updated successfully");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      alert("Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setProfileImage(previewUrl);

    const updatedUser = {
      ...savedUser,
      profileImageUrl: previewUrl,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    alert("Profile photo updated locally");
  };

  const deleteProfilePhoto = () => {
    setProfileImage("/profile.png");

    const updatedUser = {
      ...savedUser,
      profileImageUrl: "",
      profileImage: "",
      photo: "",
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    alert("Profile photo removed");
  };

  const saveProfile = () => {
    const updatedUser = {
      ...savedUser,
      name: candidateName,
      currentRole: candidateRole,
      location: candidateLocation,
      profileImageUrl: profileImage,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    alert("Profile details saved");
  };

  const savePreferences = async () => {
    try {
      setLoading(true);

      const settingsPayload = {
        darkMode,
        accentColor,
        notifications: {
          jobAlerts,
          applicationUpdates: appUpdates,
          interviewReminders,
        },
        privacy: {
          profileVisible,
          showEmail,
          showPhone,
        },
      };

      localStorage.setItem("candidateSettings", JSON.stringify(settingsPayload));

      if (userId) {
        await fetch(`${API_URL}/api/candidates/${userId}/settings`, {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify(settingsPayload),
        }).catch(() => null);
      }

      alert("Settings saved successfully");
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!deletePassword.trim()) {
      alert("Please enter your password");
      return;
    }

    const ok = window.confirm(
      "Are you sure you want to permanently delete your account?"
    );

    if (!ok) return;

    try {
      setLoading(true);

      if (userId) {
        await fetch(`${API_URL}/api/candidates/${userId}`, {
          method: "DELETE",
          headers: authHeaders,
          body: JSON.stringify({ password: deletePassword }),
        }).catch(() => null);
      }

      localStorage.clear();
      alert("Account deleted");
      goTo("/candidate-login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="cs-page">
      <header className="cs-topbar">
        <button className="cs-back-btn" onClick={() => goTo(dashboardPath)}>
          ← Back to Dashboard
        </button>

        <img
          src="/logo.png"
          alt="NoPromptJobs"
          className="cs-logo"
          onClick={() => goTo(dashboardPath)}
        />

        <div className="cs-search">
          <input placeholder="Search jobs, companies, skills..." />
          <button onClick={() => goTo("/jobs")}>Search</button>
        </div>

        <button className="cs-icon-btn" onClick={() => goTo("/notifications")}>
          🔔 <b>3</b>
        </button>

        <div className="cs-profile-chip" onClick={() => goTo(`/profile/${userId}`)}>
          <img src={profileImage} alt="profile" />
          <div>
            <b>{candidateName}</b>
            <small>{candidateRole}</small>
          </div>
        </div>
      </header>

      <section className="cs-hero">
        <div>
          <h1>Settings</h1>
          <p>Manage your account, security, notifications and preferences.</p>
        </div>

        <div className="cs-status-card">
          <span>Account Status</span>
          <b>✅ Verified Candidate</b>
        </div>
      </section>

      <section className="cs-tabs">
        {["Account", "Security", "Notifications", "Privacy", "Subscription", "Activity"].map(
          (tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "Account" && "👤 "}
              {tab === "Security" && "🛡 "}
              {tab === "Notifications" && "🔔 "}
              {tab === "Privacy" && "🔒 "}
              {tab === "Subscription" && "💳 "}
              {tab === "Activity" && "⏱ "}
              {tab}
            </button>
          )
        )}
      </section>

      {activeTab === "Account" && (
        <section className="cs-grid">
          <div className="cs-card profile-card">
            <h2>Profile Information</h2>
            <p>Update your personal and professional details.</p>

            <div className="profile-flex">
              <div className="profile-img-wrap">
                <img src={profileImage} alt={candidateName} />
                <span>{initials}</span>
              </div>

              <div className="profile-info">
                <label>Full Name</label>
                <input value={candidateName} onChange={(e) => setCandidateName(e.target.value)} />

                <label>Email Address</label>
                <input value={candidateEmail} disabled />

                <label>Current Role</label>
                <input value={candidateRole} onChange={(e) => setCandidateRole(e.target.value)} />

                <label>Location</label>
                <input value={candidateLocation} onChange={(e) => setCandidateLocation(e.target.value)} />
              </div>
            </div>

            <div className="btn-row">
              <label className="outline-btn upload-btn">
                📷 Upload Photo
                <input type="file" accept="image/*" hidden onChange={handlePhotoUpload} />
              </label>

              <button className="outline-btn" onClick={deleteProfilePhoto}>
                🗑 Delete Photo
              </button>

              <button className="primary-btn" onClick={saveProfile}>
                💾 Save Profile
              </button>
            </div>
          </div>

          <AppearanceCard
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            accentColor={accentColor}
            setAccentColor={setAccentColor}
            savePreferences={savePreferences}
            loading={loading}
          />
        </section>
      )}

      {activeTab === "Security" && (
        <section className="cs-grid single">
          <div className="cs-card">
            <h2>Security Overview</h2>
            <p>Set or reset your account password.</p>

            <div className="security-list">
              <div className="password-reset-box">
                <h3>🔑 Set / Reset Password</h3>
                <p>
                  If your account was created using Google, you can set a password here
                  and later login using email and password.
                </p>

                <label>Current Password</label>
                <input
                  type="password"
                  placeholder="Required only if password already exists"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />

                <label>New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />

                <label>Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button
                  className="primary-btn"
                  onClick={updatePassword}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? "Saving Password..." : "Save Password"}
                </button>
              </div>

              <button onClick={() => alert("Two-factor authentication will be enabled soon")}>
                <span>🛡 Two-Factor Authentication</span>
                <b className="green-text">Enabled ›</b>
              </button>

              <button onClick={() => alert("Login sessions page coming soon")}>
                <span>💻 Login Sessions</span>
                <b>3 Active ›</b>
              </button>

              <button onClick={() => goTo(`/profile/${userId}`)}>
                <span>✅ Account Verification</span>
                <b className="green-text">Verified ›</b>
              </button>
            </div>
          </div>
        </section>
      )}

      {activeTab === "Notifications" && (
        <section className="cs-grid single">
          <div className="cs-card notification-card">
            <h2>Notification Preferences</h2>
            <p>Control what notifications you receive.</p>

            <NotifyToggle title="Job Alerts" text="Get notified about new job matches" value={jobAlerts} setValue={setJobAlerts} />
            <NotifyToggle title="Application Updates" text="Get updates on your applications" value={appUpdates} setValue={setAppUpdates} />
            <NotifyToggle title="Interview Reminders" text="Get reminders for interviews" value={interviewReminders} setValue={setInterviewReminders} />

            <button className="primary-btn" onClick={savePreferences}>
              {loading ? "Saving..." : "Save Notification Settings"}
            </button>
          </div>
        </section>
      )}

      {activeTab === "Privacy" && (
        <section className="cs-grid single">
          <div className="cs-card">
            <h2>Privacy Settings</h2>
            <p>Control your profile visibility.</p>

            <NotifyToggle title="Profile Visibility" text="Allow recruiters to see your profile" value={profileVisible} setValue={setProfileVisible} />
            <NotifyToggle title="Show Email" text="Show email to verified recruiters" value={showEmail} setValue={setShowEmail} />
            <NotifyToggle title="Show Phone" text="Show phone to verified recruiters" value={showPhone} setValue={setShowPhone} />

            <button className="primary-btn" onClick={savePreferences}>
              Save Privacy Settings
            </button>
          </div>
        </section>
      )}

      {activeTab === "Subscription" && (
        <section className="cs-grid single">
          <div className="cs-card">
            <h2>Subscription</h2>
            <p>Your current plan and upgrade options.</p>

            <div className="plan-box">
              <h3>Current Plan: Basic</h3>
              <p>Upgrade to unlock Auto Apply, Resume Studio and AI Interview Prep.</p>
            </div>

            <button className="primary-btn" onClick={() => goTo("/services")}>
              👑 Upgrade Plan
            </button>
          </div>
        </section>
      )}

      {activeTab === "Activity" && (
        <section className="cs-grid single">
          <div className="cs-card">
            <h2>Recent Activity</h2>
            <p>Your latest account activity.</p>

            <div className="activity-list">
              <p>✅ Profile viewed by recruiter</p>
              <p>✅ Settings page opened</p>
              <p>✅ Dashboard visited</p>
              <p>✅ Candidate profile verified</p>
            </div>

            <button className="primary-btn" onClick={logoutUser}>
              Logout
            </button>
          </div>
        </section>
      )}

      <section className="cs-card delete-card">
        <h2>Delete Account</h2>
        <p>Permanently delete your account and all data.</p>

        <div className="danger-box">
          ⚠ This action cannot be undone. Your applications, profile, resume and account data will be permanently deleted.
        </div>

        <input
          type="password"
          placeholder="Enter your password"
          value={deletePassword}
          onChange={(e) => setDeletePassword(e.target.value)}
        />

        <button className="delete-btn" onClick={deleteAccount}>
          Delete My Account Permanently
        </button>
      </section>
    </main>
  );
}

function AppearanceCard({
  darkMode,
  setDarkMode,
  accentColor,
  setAccentColor,
  savePreferences,
  loading,
}) {
  return (
    <div className="cs-card">
      <h2>Appearance</h2>
      <p>Customize your dashboard experience.</p>

      <div className="theme-buttons">
        <button className={!darkMode ? "selected" : ""} onClick={() => setDarkMode(false)}>
          ☀ Light Mode
        </button>
        <button className={darkMode ? "selected" : ""} onClick={() => setDarkMode(true)}>
          🌙 Dark Mode
        </button>
      </div>

      <h4>Accent Color</h4>
      <div className="color-row">
        {["purple", "blue", "green", "orange", "pink"].map((color) => (
          <button
            key={color}
            className={`${color} ${accentColor === color ? "active" : ""}`}
            onClick={() => setAccentColor(color)}
          />
        ))}
      </div>

      <button className="primary-btn" onClick={savePreferences}>
        {loading ? "Saving..." : "Save Preferences"}
      </button>
    </div>
  );
}

function NotifyToggle({ title, text, value, setValue }) {
  return (
    <div className="notify-line">
      <div>
        <h4>{title}</h4>
        <p>{text}</p>
      </div>

      <button className={`toggle ${value ? "on" : ""}`} onClick={() => setValue(!value)}>
        <i></i>
      </button>
    </div>
  );
}