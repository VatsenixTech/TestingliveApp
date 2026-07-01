import "./PrivacyPolicy.css";

function PrivacyPolicy() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const candidateId =
    user?._id ||
    user?.id ||
    user?.candidateId ||
    "6a0dde8a5f9dc6857d4c0798";

  const dashboardPath = `/dashboard/${candidateId}`;

  const glanceItems = [
    ["👤", "User Control", "You control your profile, privacy settings and preferences."],
    ["🛡️", "Data Protection", "We use secure systems to protect your personal information."],
    ["🚫", "No Selling Data", "We do not sell your personal information to third parties."],
    ["👁️", "Transparency", "We clearly explain what data we collect and why."],
    ["🗑️", "Right to Delete", "You can request deletion of your data anytime."],
    ["📥", "Data Access", "You can request access to your information anytime."],
  ];

  const collectLeft = [
    "Personal Information: Name, email, mobile number, date of birth and location.",
    "Profile Information: Resume, skills, experience, education and certifications.",
    "Usage Data: Pages visited, features used, time spent and browser information.",
    "Job Activity: Jobs viewed, applications, saved jobs and search history.",
    "Communication: Messages, notifications, feedback and recruiter interaction.",
  ];

  const collectRight = [
    "Payment & Subscription: Transaction details, payment status and plan information.",
    "Device & Security: IP address, device ID and login activity for safety.",
    "Third-Party Data: Resume parsers, skill assessments and approved partners.",
  ];

  const usageItems = [
    ["⚙️", "Provide & Maintain Services"],
    ["👥", "Match You With Jobs & Recruiters"],
    ["📈", "Improve Platform Performance"],
    ["🏢", "Communicate Important Updates"],
    ["✅", "Ensure Security & Prevent Fraud"],
    ["📊", "Analytics & Platform Enhancement"],
  ];

  return (
    <main className="privacy-page">
      <nav className="privacy-nav">
        <a href="/" className="privacy-brand">
          <img src="/logo.png" alt="NoPromptJobs" />
        </a>

        <div className="privacy-search">
          <span>🔍</span>
          <input placeholder="Search jobs, companies..." />
        </div>

        <div className="privacy-links">
          <a className="active" href={dashboardPath}>
            Dashboard
          </a>

          <a href="/jobs">Jobs</a>
          <a href="/companies">Companies</a>
          <a href="/services">Services</a>

          <a href="/notifications">
            Notifications <b>3</b>
          </a>
        </div>

        <a className="privacy-user" href={dashboardPath}>
          <span>V</span>
          <strong>{user?.name || "VENKATESHA A"}</strong>
          <small>⌄</small>
        </a>
      </nav>

      <section className="privacy-hero">
        <h1>Privacy Policy</h1>

        <p>
          Your privacy is important to us. This policy explains how NoPromptJobs
          collects, uses, protects and manages your information.
        </p>

        <div className="privacy-meta">
          <span>📅 Effective Date: 01 July 2026</span>
          <span>🛡️ Last Updated: 01 July 2026</span>
          <span>🌐 Applies To: All Users</span>
        </div>
      </section>

      <section className="privacy-visual">
        <div>
          <span>🔐 Privacy-first platform</span>

          <h2>Your profile data stays protected</h2>

          <p>
            NoPromptJobs protects candidate, recruiter, job activity, payment and
            device information with enterprise-grade security and privacy
            controls.
          </p>
        </div>

        <img
          src="/images/privacy-security.png"
          alt="Privacy and Data Security"
        />
      </section>

      <section className="privacy-card">
        <h2>📋 At a Glance</h2>

        <div className="glance-grid">
          {glanceItems.map((item) => (
            <div className="glance-card" key={item[1]}>
              <div>{item[0]}</div>
              <h3>{item[1]}</h3>
              <p>{item[2]}</p>
            </div>
          ))}
        </div>

        <div className="policy-section">
          <h2>🗂️ Information We Collect</h2>

          <p>
            We collect information to provide better services and improve your
            experience on NoPromptJobs.
          </p>

          <div className="policy-two-col">
            <ul>
              {collectLeft.map((text) => (
                <li key={text}>✔ {text}</li>
              ))}
            </ul>

            <div>
              <ul>
                {collectRight.map((text) => (
                  <li key={text}>✔ {text}</li>
                ))}
              </ul>

              <div className="privacy-note">
                🛡️ We only collect data that is necessary to provide and improve
                our services and comply with legal obligations.
              </div>
            </div>
          </div>
        </div>

        <div className="policy-section">
          <h2>⚙️ How We Use Your Information</h2>

          <p>
            We use collected information only for legitimate platform purposes.
          </p>

          <div className="usage-grid">
            {usageItems.map((item) => (
              <div className="usage-item" key={item[1]}>
                <span>{item[0]}</span>
                <strong>{item[1]}</strong>
              </div>
            ))}
          </div>

          <div className="privacy-footer-note">
            🔒 We do not use your data for advertising purposes outside
            NoPromptJobs without your explicit consent.
          </div>
        </div>

        <div className="policy-section">
          <h2>🤝 Sharing With Recruiters</h2>

          <p>
            Candidate profile information may be shared with recruiters only when
            a candidate applies for a job, is shortlisted, or chooses to make the
            profile discoverable.
          </p>
        </div>

        <div className="policy-section">
          <h2>📩 Contact</h2>

          <p>
            For privacy-related questions, contact us at{" "}
            <strong>support@nopromptjobs.com</strong>.
          </p>
        </div>
      </section>
    </main>
  );
}

export default PrivacyPolicy;