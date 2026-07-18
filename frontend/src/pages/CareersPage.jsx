import React, { useMemo, useState } from "react";
import {
  FaArrowRight,
  FaBell,
  FaBriefcase,
  FaChevronDown,
  FaTimes,
  FaCheckCircle,
  FaEnvelope,
  FaUserCircle,
  FaMagic,
  FaFileAlt,
  FaGlobe,
  FaHeart,
  FaMapMarkerAlt,
  FaPlayCircle,
  FaRocket,
  FaShieldAlt,
  FaStar,
  FaUsers,
} from "react-icons/fa";
import "./CareersPage.css";

const JOBS = [
  {
    id: "senior-frontend-developer",
    title: "Senior Frontend Developer",
    department: "Engineering",
    location: "Bangalore, India",
    workplace: "Hybrid",
    type: "Full Time",
    posted: "May 18, 2025",
    featured: true,
    description:
      "Build amazing user experiences for our platform using React, TypeScript, and modern frontend technologies.",
  },
  {
    id: "ai-ml-engineer",
    title: "AI/ML Engineer",
    department: "Engineering",
    location: "Bangalore, India",
    workplace: "Hybrid",
    type: "Full Time",
    posted: "May 17, 2025",
    featured: false,
    description:
      "Work on cutting-edge AI solutions that power our intelligent matching and recommendation engine.",
  },
  {
    id: "talent-acquisition-executive",
    title: "Talent Acquisition Executive",
    department: "Human Resources",
    location: "Bangalore, India",
    workplace: "On-site",
    type: "Full Time",
    posted: "May 15, 2025",
    featured: false,
    description:
      "Help us build an exceptional team and deliver a transparent, candidate-first hiring experience.",
  },
  {
    id: "business-development-executive",
    title: "Business Development Executive",
    department: "Sales",
    location: "Bangalore, India",
    workplace: "Hybrid",
    type: "Full Time",
    posted: "May 12, 2025",
    featured: false,
    description:
      "Build partnerships and help employers discover a faster, fairer way to hire verified talent.",
  },
];

const BENEFITS = [
  {
    icon: <FaUsers />,
    title: "Meaningful Impact",
    text: "Your work helps thousands of people find better career opportunities.",
  },
  {
    icon: <FaRocket />,
    title: "Growth & Learning",
    text: "Continuous learning opportunities and career development support.",
  },
  {
    icon: <FaGlobe />,
    title: "Flexible Culture",
    text: "A hybrid work environment with flexibility that fits your lifestyle.",
  },
  {
    icon: <FaShieldAlt />,
    title: "Great Benefits",
    text: "Competitive salary, healthcare, and employee wellness programs.",
  },
  {
    icon: <FaHeart />,
    title: "Inclusive Team",
    text: "A diverse, collaborative, and supportive team environment.",
  },
];

function navigate(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function CareersPage() {
  const [department, setDepartment] = useState("All Departments");
  const [location, setLocation] = useState("All Locations");
  const [employmentType, setEmploymentType] = useState("All Employment Types");
  const [openMenu, setOpenMenu] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showTalentModal, setShowTalentModal] = useState(false);
  const [talentEmail, setTalentEmail] = useState("");
  const [talentSubmitted, setTalentSubmitted] = useState(false);

  const filteredJobs = useMemo(() => {
    return JOBS.filter((job) => {
      const departmentMatch =
        department === "All Departments" || job.department === department;
      const locationMatch =
        location === "All Locations" || job.location === location;
      const typeMatch =
        employmentType === "All Employment Types" ||
        job.type === employmentType;

      return departmentMatch && locationMatch && typeMatch;
    });
  }, [department, location, employmentType]);

  const clearFilters = () => {
    setDepartment("All Departments");
    setLocation("All Locations");
    setEmploymentType("All Employment Types");
  };

  const openJob = (job) => {
    setSelectedJob(job);
    document.body.style.overflow = "hidden";
  };

  const closeJob = () => {
    setSelectedJob(null);
    document.body.style.overflow = "";
  };

  const openTalentNetwork = () => {
    setTalentSubmitted(false);
    setShowTalentModal(true);
    document.body.style.overflow = "hidden";
  };

  const closeTalentNetwork = () => {
    setShowTalentModal(false);
    document.body.style.overflow = "";
  };

  const submitTalentNetwork = (event) => {
    event.preventDefault();
    if (!talentEmail.trim()) return;
    localStorage.setItem("talentNetworkEmail", talentEmail.trim());
    setTalentSubmitted(true);
  };

  const applyForJob = (job) => {
    localStorage.setItem("careerJob", JSON.stringify(job));
    closeJob();
    navigate(`/contact?subject=${encodeURIComponent(`Application: ${job.title}`)}`);
  };

  return (
    <main className="careers-page">
      <header className="careers-navbar">
        <button
          type="button"
          className="careers-brand"
          onClick={() => navigate("/")}
        >
          <span className="careers-brand-mark">N</span>
          <span className="careers-brand-name">
            NoPrompt <strong>Jobs</strong>
          </span>
        </button>

        <nav className="careers-nav-links">
          <button type="button" onClick={() => navigate("/jobs")}>Find Jobs</button>
          <button type="button" onClick={() => navigate("/companies")}>Companies</button>
          <div className="careers-nav-dropdown">
            <button
              type="button"
              aria-expanded={openMenu === "ai"}
              onClick={() => setOpenMenu(openMenu === "ai" ? "" : "ai")}
            >
              AI Tools <FaChevronDown />
            </button>
            {openMenu === "ai" && (
              <div className="careers-dropdown-menu">
                <button type="button" onClick={() => navigate("/resume-studio")}><FaFileAlt /> Resume Studio</button>
                <button type="button" onClick={() => navigate("/skill-analyzer")}><FaMagic /> Skill Analyzer</button>
                <button type="button" onClick={() => navigate("/ai-interview-prep")}><FaUsers /> AI Interview Prep</button>
              </div>
            )}
          </div>
          <div className="careers-nav-dropdown">
            <button
              type="button"
              aria-expanded={openMenu === "resources"}
              onClick={() => setOpenMenu(openMenu === "resources" ? "" : "resources")}
            >
              Resources <FaChevronDown />
            </button>
            {openMenu === "resources" && (
              <div className="careers-dropdown-menu">
                <button type="button" onClick={() => navigate("/blog")}><FaFileAlt /> Career Blog</button>
                <button type="button" onClick={() => navigate("/help-center")}><FaCheckCircle /> Help Center</button>
                <button type="button" onClick={() => navigate("/how-it-works")}><FaRocket /> How It Works</button>
              </div>
            )}
          </div>
          <button type="button" onClick={() => navigate("/recruiter-login")}>For Employers</button>
        </nav>

        <div className="careers-nav-actions">
          <button
            type="button"
            className="careers-outline-button"
            onClick={() => navigate("/recruiter-post-job")}
          >
            Post a Job
          </button>
          <button
            type="button"
            className="careers-primary-button"
            onClick={() => navigate("/candidate-login")}
          >
            <FaRocket /> Get Hired Faster
          </button>
          <button
            type="button"
            className="careers-icon-button"
            aria-label="Notifications"
            onClick={() => navigate("/notifications")}
          ><FaBell /></button>
          <button
            type="button"
            className="careers-avatar"
            aria-label="Candidate profile"
            onClick={() => navigate("/profile")}
          >V</button>
        </div>
      </header>

      <section className="careers-hero">
        <div className="careers-hero-content">
          <div className="careers-breadcrumb">
            <button type="button" onClick={() => navigate("/")}>Home</button>
            <span>›</span>
            <strong>Careers</strong>
          </div>

          <div className="careers-hiring-pill"><FaRocket /> We&apos;re Hiring!</div>

          <h1>
            Build the Future of
            <span>Verified Hiring</span>
          </h1>

          <p>
            Join NoPrompt Jobs and help thousands of people find meaningful
            careers. We&apos;re building AI-powered solutions that make hiring
            fair, transparent, and stress-free.
          </p>

          <div className="careers-hero-actions">
            <button
              type="button"
              className="careers-primary-button careers-large-button"
              onClick={() =>
                document.getElementById("open-positions")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              View Open Positions <FaArrowRight />
            </button>

            <button
              type="button"
              className="careers-outline-button careers-large-button"
              onClick={() => navigate("/about")}
            >
              Learn More About Us <FaPlayCircle />
            </button>
          </div>
        </div>

        <div className="careers-stat-column">
          <StatCard icon={<FaUsers />} value="50+" label="Talented People" />
          <StatCard icon={<FaBriefcase />} value="10+" label="Open Positions" />
          <StatCard icon={<FaGlobe />} value="3" label="Countries" />
          <StatCard icon={<FaStar />} value="4.8/5" label="Employee Rating" />
        </div>

        <div className="careers-hero-image-card">
          <img
            src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=85"
            alt="Team members collaborating in a modern office"
          />
          <div className="careers-mission-card">
            <span><FaRocket /></span>
            <div>
              <strong>Our Mission</strong>
              <p>Empower people to build careers they love with confidence.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="careers-benefits-section">
        <h2>Why Work With Us</h2>
        <div className="careers-benefits-grid">
          {BENEFITS.map((benefit) => (
            <article key={benefit.title}>
              <span>{benefit.icon}</span>
              <div>
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="careers-content-grid" id="open-positions">
        <div className="careers-jobs-panel">
          <div className="careers-section-heading">
            <div>
              <h2>Open Positions</h2>
              <span>{filteredJobs.length}</span>
            </div>
          </div>

          <div className="careers-filters">
            <FilterSelect
              value={department}
              onChange={setDepartment}
              options={["All Departments", "Engineering", "Human Resources", "Sales"]}
            />
            <FilterSelect
              value={location}
              onChange={setLocation}
              options={["All Locations", "Bangalore, India"]}
            />
            <FilterSelect
              value={employmentType}
              onChange={setEmploymentType}
              options={["All Employment Types", "Full Time"]}
            />
            <button type="button" onClick={clearFilters}>Clear Filters</button>
          </div>

          <div className="careers-job-list">
            {filteredJobs.map((job) => (
              <article className="careers-job-card" key={job.id}>
                <span className="careers-job-icon"><FaBriefcase /></span>

                <div className="careers-job-main">
                  <div className="careers-job-title-row">
                    <h3>{job.title}</h3>
                    {job.featured && <span>Featured</span>}
                  </div>

                  <div className="careers-job-meta">
                    <span>{job.department}</span>
                    <span>•</span>
                    <span><FaMapMarkerAlt /> {job.location}</span>
                    <span>•</span>
                    <span>{job.workplace}</span>
                  </div>

                  <p>{job.description}</p>
                </div>

                <div className="careers-job-side">
                  <span className="careers-job-type">{job.type}</span>
                  <small>{job.posted}</small>
                  <button type="button" onClick={() => openJob(job)}>
                    View Details <FaArrowRight />
                  </button>
                </div>
              </article>
            ))}

            {filteredJobs.length === 0 && (
              <div className="careers-empty-state">
                <FaBriefcase />
                <h3>No matching roles found</h3>
                <p>Try clearing the current filters.</p>
                <button type="button" onClick={clearFilters}>Reset Filters</button>
              </div>
            )}
          </div>
        </div>

        <aside className="careers-sidebar">
          <article className="careers-side-card">
            <h3>Life at NoPrompt Jobs</h3>
            <p>
              We believe great work happens when amazing people feel valued,
              supported, and inspired.
            </p>
            <div className="careers-gallery">
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80" alt="Team collaboration" />
              <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80" alt="Team meeting" />
              <img src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=600&q=80" alt="Creative workplace" />
            </div>
            <button type="button" onClick={() => navigate("/about")}>View Our Culture <FaArrowRight /></button>
          </article>

          <article className="careers-side-card">
            <h3>Stay Updated</h3>
            <p>Get notified about new opportunities that match your skills and interests.</p>
            <button type="button" onClick={openTalentNetwork}>Join Our Talent Network <FaArrowRight /></button>
          </article>
        </aside>
      </section>

      <section className="careers-cta">
        <div>
          <span>Do not see your preferred role?</span>
          <h2>Send your profile and tell us how you can contribute.</h2>
        </div>
        <button
          type="button"
          className="careers-primary-button careers-large-button"
          onClick={() => navigate("/contact?subject=Career%20Application")}
        >
          Send Your Resume <FaArrowRight />
        </button>
      </section>

      <footer className="careers-footer">
        <div className="careers-footer-brand">
          <button type="button" className="careers-brand" onClick={() => navigate("/")}>
            <span className="careers-brand-mark">N</span>
            <span className="careers-brand-name">NoPrompt <strong>Jobs</strong></span>
          </button>
          <p>Building verified, transparent, and intelligent hiring experiences.</p>
        </div>

        <FooterColumn
          title="For Candidates"
          links={[
            ["Browse Jobs", "/jobs"],
            ["Resume Studio", "/resume-studio"],
            ["Skill Analyzer", "/skill-analyzer"],
          ]}
        />
        <FooterColumn
          title="Company"
          links={[
            ["About Us", "/about"],
            ["How It Works", "/how-it-works"],
            ["Contact", "/contact"],
          ]}
        />
        <FooterColumn
          title="Legal"
          links={[
            ["Privacy", "/privacy-policy"],
            ["Terms", "/terms-and-conditions"],
            ["Help Center", "/help-center"],
          ]}
        />
        <div className="careers-footer-bottom">
          <span>© {new Date().getFullYear()} NoPrompt Jobs. All rights reserved.</span>
          <div>
            <button type="button" onClick={() => navigate("/contact")}>Support</button>
            <button type="button" onClick={() => navigate("/candidate-register")}>Create Account</button>
          </div>
        </div>
      </footer>

      {selectedJob && (
        <div className="careers-modal-backdrop" role="presentation" onMouseDown={closeJob}>
          <section
            className="careers-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="career-job-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button type="button" className="careers-modal-close" onClick={closeJob} aria-label="Close job details">
              <FaTimes />
            </button>
            <span className="careers-modal-icon"><FaBriefcase /></span>
            <div className="careers-modal-heading">
              <span>{selectedJob.department}</span>
              <h2 id="career-job-title">{selectedJob.title}</h2>
              <p><FaMapMarkerAlt /> {selectedJob.location} · {selectedJob.workplace} · {selectedJob.type}</p>
            </div>
            <div className="careers-modal-body">
              <h3>About the role</h3>
              <p>{selectedJob.description}</p>
              <h3>What you will do</h3>
              <ul>
                <li>Own meaningful projects from planning to production.</li>
                <li>Collaborate with product, design, engineering and customer teams.</li>
                <li>Use data and user feedback to continuously improve outcomes.</li>
                <li>Help us build fair, transparent and verified hiring experiences.</li>
              </ul>
              <h3>What we are looking for</h3>
              <ul>
                <li>Strong communication, ownership and problem-solving skills.</li>
                <li>Relevant professional experience for this role.</li>
                <li>A product mindset and willingness to learn quickly.</li>
              </ul>
            </div>
            <div className="careers-modal-actions">
              <button type="button" className="careers-outline-button" onClick={closeJob}>Not Now</button>
              <button type="button" className="careers-primary-button" onClick={() => applyForJob(selectedJob)}>
                Apply for This Role <FaArrowRight />
              </button>
            </div>
          </section>
        </div>
      )}

      {showTalentModal && (
        <div className="careers-modal-backdrop" role="presentation" onMouseDown={closeTalentNetwork}>
          <section className="careers-modal careers-talent-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" className="careers-modal-close" onClick={closeTalentNetwork} aria-label="Close talent network form"><FaTimes /></button>
            {talentSubmitted ? (
              <div className="careers-success-state">
                <span><FaCheckCircle /></span>
                <h2>You are on the list!</h2>
                <p>We will share relevant opportunities with <strong>{talentEmail}</strong>.</p>
                <button type="button" className="careers-primary-button" onClick={closeTalentNetwork}>Done</button>
              </div>
            ) : (
              <>
                <span className="careers-modal-icon"><FaEnvelope /></span>
                <div className="careers-modal-heading">
                  <span>Talent Network</span>
                  <h2>Be the first to hear about new roles</h2>
                  <p>Share your email and we will notify you when a suitable opportunity opens.</p>
                </div>
                <form className="careers-talent-form" onSubmit={submitTalentNetwork}>
                  <label>
                    Email address
                    <input
                      type="email"
                      value={talentEmail}
                      onChange={(event) => setTalentEmail(event.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </label>
                  <button type="submit" className="careers-primary-button">Join Talent Network <FaArrowRight /></button>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

function StatCard({ icon, value, label }) {
  return (
    <article>
      <span>{icon}</span>
      <div>
        <strong>{value}</strong>
        <small>{label}</small>
      </div>
    </article>
  );
}

function FilterSelect({ value, onChange, options }) {
  return (
    <label>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <FaChevronDown />
    </label>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4>{title}</h4>
      {links.map(([label, path]) => (
        <button type="button" key={path} onClick={() => navigate(path)}>
          {label}
        </button>
      ))}
    </div>
  );
}