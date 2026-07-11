import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaBullhorn,
  FaCode,
  FaHeadset,
  FaUsers,
} from "react-icons/fa";
import "./CompanyPages.css";

const openings = [
  {
    icon: <FaBullhorn />,
    title: "Business Development Executive",
    department: "Sales",
    location: "Bangalore / Hybrid",
    type: "Full Time",
  },
  {
    icon: <FaUsers />,
    title: "Talent Acquisition Executive",
    department: "Human Resources",
    location: "Bangalore / Hybrid",
    type: "Full Time",
  },
  {
    icon: <FaHeadset />,
    title: "Candidate Success Executive",
    department: "Operations",
    location: "Bangalore",
    type: "Full Time",
  },
  {
    icon: <FaCode />,
    title: "Frontend Developer",
    department: "Engineering",
    location: "Bangalore / Remote",
    type: "Full Time",
  },
];

function CareersPage() {
  const handleApply = (role) => {
    const subject = encodeURIComponent(`Application for ${role}`);
    const body = encodeURIComponent(
      `Hello Vatsenix Team,\n\nI would like to apply for the ${role} position.\n\nName:\nPhone:\nExperience:\nCurrent Location:\n\nThank you.`
    );

    window.location.href = `mailto:careers@vatsenix.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="company-page">
      <header className="company-header">
        <Link to="/dashboard" className="company-brand">
          <img src="/logo.png" alt="NoPromptJobs" />
        </Link>

        <nav className="company-nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/about">About</Link>
          <Link to="/how-it-works">How It Works</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </header>

      <main>
        <section className="company-hero compact-company-hero">
          <div className="company-hero-badge">Careers at Vatsenix</div>

          <h1>
            Build the Future of <span>Verified Hiring</span>
          </h1>

          <p>
            Join a growing product company building trusted technology for
            candidates, recruiters and modern hiring teams.
          </p>
        </section>

        <section className="careers-section">
          <div className="section-heading">
            <span>Current opportunities</span>
            <h2>Open positions</h2>
          </div>

          <div className="jobs-list">
            {openings.map((job) => (
              <article className="career-card" key={job.title}>
                <div className="career-icon">{job.icon}</div>

                <div className="career-info">
                  <h3>{job.title}</h3>
                  <div className="career-meta">
                    <span>{job.department}</span>
                    <span>{job.location}</span>
                    <span>{job.type}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="career-apply-btn"
                  onClick={() => handleApply(job.title)}
                >
                  Apply Now
                  <FaArrowRight />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="company-cta">
          <div>
            <span>Do not see your preferred role?</span>
            <h2>Send your profile and tell us how you can contribute.</h2>
          </div>

          <a
            href="mailto:careers@vatsenix.com"
            className="primary-company-btn"
          >
            Send Your Resume
            <FaArrowRight />
          </a>
        </section>
      </main>
    </div>
  );
}

export default CareersPage;