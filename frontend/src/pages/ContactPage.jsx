import React, { useMemo, useState } from "react";
import {
  FaArrowRight,
  FaBell,
  FaBriefcase,
  FaChevronDown,
  FaEnvelope,
  FaGlobe,
  FaHeadset,
  FaInstagram,
  FaLinkedinIn,
  FaLock,
  FaLocationDot,
  FaPaperPlane,
  FaPhone,
  FaPlay,
  FaShieldHalved,
  FaUsers,
  FaYoutube,
  FaXTwitter,
} from "react-icons/fa6";
import "./ContactPage.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function navigate(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

const supportCards = [
  [<FaHeadset />, "Customer Support", "Get help with your account or technical issues.", "support@nopromptjobs.com"],
  [<FaBriefcase />, "For Employers", "Looking to hire top talent? We can help.", "employers@nopromptjobs.com"],
  [<FaUsers />, "Partnerships", "Explore partnerships and collaboration opportunities.", "partnerships@nopromptjobs.com"],
  [<FaPlay />, "Media & Press", "For media inquiries and press-related questions.", "media@nopromptjobs.com"],
];

export default function ContactPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    subject: "Product Support",
    message: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const userName = user?.name || user?.fullName || "Venkatesh A";

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const fullName = form.fullName.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (!fullName) return setStatus({ type: "error", message: "Please enter your full name." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setStatus({ type: "error", message: "Please enter a valid email address." });
    }
    if (message.length < 10) {
      return setStatus({ type: "error", message: "Please enter at least 10 characters." });
    }

    try {
      setSubmitting(true);
      setStatus({ type: "", message: "" });
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, fullName, email, message }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.message || "Unable to send your message.");
      setStatus({ type: "success", message: "Thank you. Your message has been sent successfully." });
      setForm({ fullName: "", email: "", subject: "Product Support", message: "" });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Unable to send your message." });
    } finally {
      setSubmitting(false);
    }
  }

  function handleNewsletter(event) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail.trim())) {
      setStatus({ type: "error", message: "Please enter a valid newsletter email." });
      return;
    }
    setStatus({ type: "success", message: "You have joined the NoPromptJobs newsletter." });
    setNewsletterEmail("");
  }

  return (
    <main className="contact-page">
      <header className="contact-navbar">
        <button type="button" className="contact-brand" onClick={() => navigate("/")}>
          <span className="contact-brand-mark">N</span>
          <span className="contact-brand-text">NoPrompt<strong>Jobs</strong></span>
        </button>

        <label className="contact-search">
          <span>⌕</span>
          <input type="search" placeholder="Search jobs, companies..." />
        </label>

        <nav className="contact-nav-links">
          <button type="button" onClick={() => navigate("/ultimate-dashboard")}>Dashboard</button>
          <button type="button" onClick={() => navigate("/jobs")}>Jobs</button>
          <button type="button" onClick={() => navigate("/companies")}>Companies</button>
          <button type="button">Services</button>
          <button type="button">AI Tools <FaChevronDown /></button>
          <button type="button">Resources <FaChevronDown /></button>
          <button type="button" onClick={() => navigate("/pricing")}>Pricing</button>
        </nav>

        <div className="contact-navbar-actions">
          <button type="button" className="contact-notification-button" aria-label="Notifications">
            <FaBell /><span>3</span>
          </button>
          <button type="button" className="contact-user-menu">
            <span>{userName.charAt(0).toUpperCase()}</span>
            <strong>{userName}</strong>
            <FaChevronDown />
          </button>
        </div>
      </header>

      <section className="contact-hero">
        <div className="contact-intro">
          <span className="contact-eyebrow">CONTACT US</span>
          <h1>We&apos;d love to <span>hear</span> from you</h1>
          <p className="contact-intro-copy">
            Have questions, need support, or want to discuss how NoPromptJobs can help your business?
            Reach out to us and our team will respond as soon as possible.
          </p>

          <div className="contact-trust-list">
            <TrustItem icon="⚡" title="Quick Response" text="We typically respond within 24 hours." />
            <TrustItem icon={<FaShieldHalved />} title="Trusted Support" text="Your data is safe and always protected." />
            <TrustItem icon={<FaUsers />} title="Expert Help" text="Get assistance from our experienced team." />
          </div>
        </div>

        <aside className="contact-info-card">
          <h2>Contact Information</h2>
          <div className="contact-info-list">
            <InfoItem icon={<FaEnvelope />} title="Email Us"><a href="mailto:hello@nopromptjobs.com">hello@nopromptjobs.com</a></InfoItem>
            <InfoItem icon={<FaPhone />} title="Call Us"><a href="tel:+918123359827">+91  8123359827</a><small>Mon–Fri, 9:00 AM–6:00 PM IST</small></InfoItem>
            <InfoItem icon={<FaLocationDot />} title="Our Location"><p>HAL Road,Old Madras Road Bangalore  India</p></InfoItem>
            <InfoItem icon={<FaGlobe />} title="Website"><a href="https://nopromptjobs.com" target="_blank" rel="noreferrer">www.nopromptjobs.com</a></InfoItem>
          </div>
          <div className="contact-info-decoration" />
        </aside>

        <section className="contact-form-card">
          <header className="contact-form-heading">
            <span><FaEnvelope /></span>
            <div><h2>Send us a message</h2><p>Fill out the form below and we&apos;ll get back to you.</p></div>
          </header>

          {status.message && <div className={`contact-alert ${status.type}`}>{status.message}</div>}

          <form onSubmit={handleSubmit}>
            <div className="contact-form-grid">
              <label>Full Name<input type="text" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Enter your full name" /></label>
              <label>Email Address<input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter your email" /></label>
            </div>

            <label>Subject
              <select name="subject" value={form.subject} onChange={handleChange}>
                <option>Product Support</option><option>Employer Enquiry</option><option>Candidate Support</option>
                <option>Partnership</option><option>Media & Press</option><option>General Enquiry</option>
              </select>
            </label>

            <label>Message<textarea name="message" value={form.message} onChange={handleChange} placeholder="Type your message here..." rows="6" /></label>

            <div className="contact-form-footer">
              <p><FaLock /> We respect your privacy. Your information will never be shared.</p>
              <button type="submit" disabled={submitting}>{submitting ? "Sending..." : "Send Message"}<FaPaperPlane /></button>
            </div>
          </form>
        </section>
      </section>

      <section className="contact-support-grid">
        {supportCards.map(([icon, title, description, email]) => (
          <article key={title}><span>{icon}</span><div><h3>{title}</h3><p>{description}</p><a href={`mailto:${email}`}>{email}</a></div></article>
        ))}
      </section>

      <footer className="contact-footer">
        <section className="contact-footer-main">
          <div className="contact-footer-brand-column">
            <button type="button" className="contact-brand contact-footer-logo" onClick={() => navigate("/")}>
              <span className="contact-brand-mark">N</span><span className="contact-brand-text">NoPrompt<strong>Jobs</strong></span>
            </button>
            <p>Building verified, transparent, and intelligent hiring experiences.</p>
            <div className="contact-socials">
              <a href="https://linkedin.com" target="_blank" rel="noreferrer"><FaLinkedinIn /></a>
              <a href="https://x.com" target="_blank" rel="noreferrer"><FaXTwitter /></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer"><FaInstagram /></a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer"><FaYoutube /></a>
            </div>
          </div>

          <FooterColumn title="For Candidates" items={[["Browse Jobs","/jobs"],["Resume Studio","/resume-studio"],["Skill Analyzer","/skill-analyzer"],["Career Resources","/resources"]]} />
          <FooterColumn title="For Employers" items={[["Post a Job","/post-job"],["Browse Candidates","/recruiter-candidates"],["Pricing","/pricing"],["Employer Resources","/employer-resources"]]} />
          <FooterColumn title="Company" items={[["About Us","/about"],["How It Works","/how-it-works"],["Blog","/blog"],["Careers","/careers"]]} />
          <FooterColumn title="Legal" items={[["Privacy Policy","/privacy-policy"],["Terms of Service","/terms-and-conditions"],["Cookie Policy","/cookie-policy"],["Trust & Safety","/trust-and-safety"]]} />

          <div className="contact-newsletter">
            <h3>Stay Updated</h3>
            <p>Subscribe to our newsletter for the latest updates and career tips.</p>
            <form onSubmit={handleNewsletter}>
              <input type="email" value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} placeholder="Enter your email" />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </section>

        <section className="contact-footer-bottom">
          <p>© 2026 NoPromptJobs. All rights reserved.</p>
          <div>
            <button type="button" onClick={() => navigate("/privacy-policy")}>Privacy Policy</button><span>|</span>
            <button type="button" onClick={() => navigate("/terms-and-conditions")}>Terms of Service</button><span>|</span>
            <button type="button" onClick={() => navigate("/cookie-policy")}>Cookie Policy</button><span>|</span>
            <button type="button" onClick={() => navigate("/help-center")}>Help Center</button>
          </div>
          <button type="button" className="contact-language"><FaGlobe /> English <FaChevronDown /></button>
        </section>
      </footer>
    </main>
  );
}

function TrustItem({ icon, title, text }) {
  return <article><span>{icon}</span><div><strong>{title}</strong><p>{text}</p></div></article>;
}

function InfoItem({ icon, title, children }) {
  return <article><span>{icon}</span><div><strong>{title}</strong>{children}</div></article>;
}

function FooterColumn({ title, items }) {
  return <div className="contact-footer-column"><h3>{title}</h3>{items.map(([label, path]) => <button type="button" key={label} onClick={() => navigate(path)}>{label}</button>)}</div>;
}