import { useEffect, useState } from "react";
import "./AboutPage.css";

const productLinks = [
  ["Trust Passport", "/trust-passport", "✓"],
  ["AI Resume Studio", "/resume-studio", "▤"],
  ["Interview Practice", "/ai-interview-prep", "◉"],
  ["Skill Intelligence", "/skill-analyzer", "✦"],
  ["Salary Insights", "/salary-predictor", "▥"],
  ["Hidden Opportunities", "/hidden-opportunities", "♢"],
];

const metrics = [
  ["10K+", "Career profiles", "♙"],
  ["500+", "Hiring partners", "▦"],
  ["92%", "Verified matches", "◇"],
  ["24/7", "AI career support", "◌"],
];

const valueCards = [
  {
    icon: "✓",
    title: "Prove your credibility",
    text: "Build a verified profile with identity, skills, experience and education backed by our Trust Passport.",
  },
  {
    icon: "◎",
    title: "Discover better-fit roles",
    text: "AI matches you with opportunities that fit your skills, goals and potential—not just keywords.",
  },
  {
    icon: "♙",
    title: "Hire with confidence",
    text: "Employers get credible candidates, meaningful trust signals and insights for better hiring decisions.",
  },
];

function goTo(path) {
  window.location.href = path;
}

function AboutPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("about-menu-open", mobileOpen);
    return () => document.body.classList.remove("about-menu-open");
  }, [mobileOpen]);

  return (
    <main className="about-page">
      <header className="about-header">
        <button className="about-logo" onClick={() => goTo("/")} aria-label="NoPromptJobs home">
          <img src="/logo.png" alt="NoPromptJobs" />
        </button>

        <button
          className="about-menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={mobileOpen ? "about-nav open" : "about-nav"}>
          <button onClick={() => goTo("/services")}>Product <span>⌄</span></button>
          <button onClick={() => goTo("/jobs")}>For Candidates <span>⌄</span></button>
          <button onClick={() => goTo("/employer-login")}>For Employers <span>⌄</span></button>
          <button onClick={() => goTo("/blog")}>Resources <span>⌄</span></button>
          <button className="active" onClick={() => goTo("/about")}>Company</button>
        </nav>

        <div className="about-header-actions">
          <button className="sign-in" onClick={() => goTo("/candidate-login")}>Sign in</button>
          <button className="primary-button small" onClick={() => goTo("/candidate-register")}>Get started <span>→</span></button>
        </div>
      </header>

      <section className="about-hero about-container">
        <div className="about-hero-copy">
          <span className="about-eyebrow">◇ &nbsp;Built for trusted careers</span>
          <h1>Verified hiring.<br /><strong>Genuine careers.</strong></h1>
          <p>
            NoPromptJobs connects credible candidates with trusted employers
            using verification and AI—so real talent gets real opportunities.
          </p>
          <div className="about-hero-actions">
            <button className="primary-button" onClick={() => goTo("/jobs")}>Explore NoPromptJobs <span>→</span></button>
            <button className="secondary-button" onClick={() => goTo("/how-it-works")}><span className="play">▷</span> Meet our platform</button>
          </div>
        </div>

        <div className="about-hero-visual" aria-label="Verified candidate matching illustration">
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <span className="visual-dot dot-one" />
          <span className="visual-dot dot-two" />

          <article className="candidate-proof-card">
            <div className="candidate-head">
              <div className="candidate-avatar">AM<span>✓</span></div>
              <div><b>Arjun Mehta</b><small>Full Stack Developer</small><em>⌖ Bengaluru, India</em></div>
            </div>
            {["Identity Verified", "Skills Verified", "Experience Verified", "Education Verified"].map((item) => (
              <div className="verification-row" key={item}><span>◇</span>{item}<b>✓</b></div>
            ))}
            <div className="trust-score"><span>Trust Score</span><b>98%</b></div>
          </article>

          <div className="shield-mark">✓</div>

          <article className="match-card">
            <small>Top Match</small><b>Backend Engineer</b><span>⌖ Bengaluru, India</span><em>92% Match</em>
          </article>

          <article className="recruiter-card">
            <small>Recruiter</small><b>TechNova Solutions</b>
            <div className="avatar-stack"><i>A</i><i>N</i><i>K</i><i>+32</i></div>
            <span>▣ Actively hiring</span>
          </article>
        </div>
      </section>

      <section className="about-metrics about-container">
        {metrics.map(([number, label, icon]) => (
          <article key={label}><span>{icon}</span><div><b>{number}</b><small>{label}</small></div></article>
        ))}
      </section>

      <section className="about-values about-container">
        <div className="about-mission">
          <span>WHY WE EXIST</span>
          <h2>Hiring should reward<br />real talent—not noise.</h2>
          <p>We reduce fake profiles, proxy interviews and low-trust hiring so candidates can prove their credibility and recruiters can discover genuine talent faster.</p>
        </div>

        <div className="value-grid">
          {valueCards.map((card) => (
            <article key={card.title}>
              <span>{card.icon}</span>
              <div><h3>{card.title}</h3><p>{card.text}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-platform about-container">
        <h2>One platform. Every career milestone.</h2>
        <div className="platform-links">
          {productLinks.map(([label, path, icon]) => (
            <button key={label} onClick={() => goTo(path)}><span>{icon}</span>{label}</button>
          ))}
        </div>
      </section>

      <section className="about-story about-container">
        <span className="india-mark">🇮🇳</span>
        <div>
          <h3>A Vatsenix Software product, built in India for the future of work.</h3>
          <p>We build ethical, AI-powered products that make careers more transparent, fair and rewarding for everyone.</p>
        </div>
        <div className="city-art" aria-hidden="true">▥▦▥▦▤▥▦</div>
      </section>

      <section className="about-cta">
        <div className="cta-icon">↗</div>
        <div><h2>Ready to build a career that stands out?</h2><p>Join verified professionals and trusted employers on NoPromptJobs.</p></div>
        <div className="cta-actions">
          <button onClick={() => goTo("/jobs")}>Explore NoPromptJobs <span>→</span></button>
          <button onClick={() => goTo("/candidate-register")}>Create your profile <span>→</span></button>
        </div>
      </section>
    </main>
  );
}

export default AboutPage;