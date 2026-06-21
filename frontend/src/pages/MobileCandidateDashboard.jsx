import "./MobileCandidateDashboard.css";

function MobileCandidateDashboard() {
  return (
    <main className="mobile-dashboard">
      <div className="mobile-topbar">
        <button className="menu-btn">☰</button>
        <div className="mobile-search">🔍 Search jobs, skills, companies...</div>
        <button className="bell-btn">🔔<span>3</span></button>
      </div>

      <section className="mobile-hero-card">
        <div className="hero-profile">
          <div className="hero-avatar">V</div>
          <div>
            <p>Good evening,</p>
            <h1>Venkatesha A 👋</h1>
            <span>Your profile is strong. Keep going!</span>
            <button>View My Profile ›</button>
          </div>
        </div>

        <div className="trust-circle">
          <h2>100</h2>
          <p>Trust Score</p>
          <b>Excellent</b>
        </div>
      </section>

      <section className="shortcut-card">
        {[
          ["💼", "Jobs"],
          ["🏢", "Companies"],
          ["🛠️", "Services"],
          ["🛡️", "Verify"],
          ["🔖", "Saved"],
          ["📄", "Applications"],
        ].map((item) => (
          <div className="shortcut-item" key={item[1]}>
            <span>{item[0]}</span>
            <p>{item[1]}</p>
          </div>
        ))}
      </section>

      <h2 className="section-title">Quick Overview</h2>

      <section className="overview-grid">
        {[
          ["💼", "7", "Job Matches"],
          ["🚀", "0", "Auto Applied"],
          ["🔖", "5", "Saved Jobs"],
          ["👁️", "277", "Profile Views"],
        ].map((item) => (
          <div className="overview-card" key={item[2]}>
            <span>{item[0]}</span>
            <h2>{item[1]}</h2>
            <p>{item[2]}</p>
            <a>View all ›</a>
          </div>
        ))}
      </section>

      <section className="premium-banner">
        <div>
          <span>👑</span>
          <h2>Go Premium <b>PRO</b></h2>
          <p>Unlock hidden jobs, auto apply, and premium tools.</p>
        </div>
        <button>Upgrade Now ›</button>
      </section>

      <div className="section-row">
        <h2>Premium Career Tools</h2>
        <a>View all ›</a>
      </div>

      <section className="tools-grid">
        {[
          ["📋", "AI Resume Builder", "Create ATS friendly resume"],
          ["🧠", "AI Skill Analyzer", "Find your skill gaps"],
          ["🎙️", "Interview Prep Hub", "Mock interview practice"],
          ["🛡️", "Verification Center", "Build trust score"],
          ["💼", "Opportunity Hub", "Jobs and freelance work"],
          ["✨", "AI Career Assistant", "Roadmap and tips"],
        ].map((tool) => (
          <div className="tool-card-mobile" key={tool[1]}>
            <span>{tool[0]}</span>
            <div>
              <h3>{tool[1]}</h3>
              <p>{tool[2]}</p>
            </div>
            <b>›</b>
          </div>
        ))}
      </section>

      <section className="daily-tip">
        <span>✨</span>
        <div>
          <h3>Daily Tip</h3>
          <p>Update your skills regularly to stay ahead!</p>
        </div>
        <button>×</button>
      </section>

      <nav className="mobile-bottom-nav">
        <a className="active">🏠<span>Home</span></a>
        <a>💼<span>Jobs</span></a>
        <a className="plus">+</a>
        <a>🔔<span>Alerts</span></a>
        <a>👤<span>Profile</span></a>
      </nav>
    </main>
  );
}

export default MobileCandidateDashboard;