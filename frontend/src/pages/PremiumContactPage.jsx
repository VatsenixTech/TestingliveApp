import { useState } from "react";
import axios from "axios";
import "./PremiumContactPage.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function PremiumContactPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const goTo = (path) => {
    window.location.href = path;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!form.fullName.trim()) return alert("Full name is required");
    if (!form.email.trim()) return alert("Email address is required");
    if (!form.subject.trim()) return alert("Subject is required");
    if (!form.message.trim()) return alert("Message is required");

    try {
      setLoading(true);

      await axios.post(`${API_URL}/api/contact`, form);

      alert("Your enquiry has been submitted successfully.");

      setForm({
        fullName: "",
        email: "",
        phone: "",
        company: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit enquiry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pc-page">
      <nav className="pc-nav">
        <button className="pc-brand" onClick={() => goTo("/")}>
          <img src="/logo.png" alt="NoPromptJobs" />
        </button>

        <div className="pc-links">
          <button onClick={() => goTo("/jobs")}>Jobs</button>
          <button onClick={() => goTo("/companies")}>Companies</button>
          <button onClick={() => goTo("/services")}>Services</button>
          <button onClick={() => goTo("/ai-interview-prep")}>
            AI Career Tools
          </button>
          <button onClick={() => goTo("/trust-passport")}>
            Trust Passport
          </button>
          <button onClick={() => goTo("/about")}>About Us</button>
        </div>

        <button className="pc-employer-btn" onClick={() => goTo("/recruiter-login")}>
          For Employers
        </button>
      </nav>

      <section className="pc-hero">
        <div className="pc-hero-left">
          <span className="pc-badge">🏢 Contact Vatsenix Software Pvt Ltd</span>

          <h1>Let’s build better hiring experiences together</h1>

          <p>
            Reach us for product support, recruiter onboarding, candidate
            assistance, partnerships, product demos and business enquiries.
          </p>

          <div className="pc-actions">
            <a href="mailto:support@vatsenix.com?subject=NoPromptJobs Enquiry">
              ✉ Email Us
            </a>

            <button type="button" onClick={() => goTo("/services")}>
              Explore Services →
            </button>
          </div>
        </div>

        <div className="pc-building-wrap">
          <img
            src="/images/contact-building.png"
            alt="Vatsenix Software Office"
          />
        </div>
      </section>

      <section className="pc-info-strip">
        <article>
          <span>📧</span>
          <div>
            <h3>Email</h3>
            <p>For product, support, hiring and business enquiries.</p>
            <a href="mailto:support@vatsenix.com">support@vatsenix.com</a>
          </div>
        </article>

        <article>
          <span>🏢</span>
          <div>
            <h3>Company</h3>
            <p>Vatsenix Software Pvt Ltd</p>
            <b>NoPromptJobs.com</b>
          </div>
        </article>

        <article>
          <span>📍</span>
          <div>
            <h3>Location</h3>
            <p>
              Unit 101, Oxford Towers, 139/88 HAL Old Airport Rd, Bangalore
              North, Bangalore, Karnataka, India, 560008
            </p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Unit%20101%20Oxford%20Towers%20139%2F88%20HAL%20Old%20Airport%20Rd%20Bangalore"
              target="_blank"
              rel="noreferrer"
            >
              Open in Google Maps
            </a>
          </div>
        </article>

        <article>
          <span>🕘</span>
          <div>
            <h3>Business Hours</h3>
            <p>Mon - Sat: 9:00 AM - 7:00 PM</p>
            <b>Sunday: Closed</b>
          </div>
        </article>
      </section>

      <section className="pc-form-section">
        <div className="pc-form-left">
          <span>Get in touch</span>
          <h2>Send us your enquiry</h2>
          <p>
            Our team will review your message and respond as soon as possible.
          </p>

          <ul>
            <li>Candidate account support</li>
            <li>Recruiter onboarding</li>
            <li>Business partnership</li>
            <li>Product demo request</li>
          </ul>
        </div>

        <form className="pc-form" onSubmit={sendMessage}>
          <div className="pc-two">
            <input
              name="fullName"
              type="text"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              disabled={loading}
            />

            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email Address"
              disabled={loading}
            />
          </div>

          <div className="pc-two">
            <input
              name="phone"
              type="text"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              disabled={loading}
            />

            <input
              name="company"
              type="text"
              value={form.company}
              onChange={handleChange}
              placeholder="Company / Role"
              disabled={loading}
            />
          </div>

          <input
            name="subject"
            type="text"
            value={form.subject}
            onChange={handleChange}
            placeholder="Subject"
            disabled={loading}
          />

          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Write your message..."
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Message →"}
          </button>
        </form>
      </section>

      <section className="pc-faq-section">
        <div>
          <span>Support Center</span>
          <h2>How can we help?</h2>
          <p>
            Choose the right support path for faster response from our team.
          </p>
        </div>

        <div className="pc-faq-grid">
          <article onClick={() => goTo("/candidate-login")}>
            <h3>Candidate Support</h3>
            <p>Profile, login, verification, resume and interview tools.</p>
          </article>

          <article onClick={() => goTo("/recruiter-login")}>
            <h3>Recruiter Support</h3>
            <p>Job posting, candidate search, applications and hiring plans.</p>
          </article>

          <article onClick={() => goTo("/services")}>
            <h3>Business Enquiries</h3>
            <p>Partnerships, product demos, enterprise plans and collaboration.</p>
          </article>
        </div>
      </section>

      <footer className="pc-footer">
        <div>
          <img src="/logo.png" alt="NoPromptJobs" />
          <p>
            NoPromptJobs is an AI-powered hiring intelligence platform by
            Vatsenix Software Pvt Ltd.
          </p>
        </div>

        <section>
          <h4>Company</h4>
          <button onClick={() => goTo("/about")}>About Us</button>
          <button onClick={() => goTo("/careers")}>Careers</button>
          <button onClick={() => goTo("/contact")}>Contact Us</button>
          <button onClick={() => goTo("/privacy")}>Privacy Policy</button>
        </section>

        <section>
          <h4>Services</h4>
          <button onClick={() => goTo("/resume-studio")}>Resume Studio</button>
          <button onClick={() => goTo("/ai-interview-prep")}>AI Interview Prep</button>
          <button onClick={() => goTo("/skill-analyzer")}>Skill Analyzer</button>
          <button onClick={() => goTo("/salary-predictor")}>Salary Predictor</button>
        </section>

        <section>
          <h4>For Employers</h4>
          <button onClick={() => goTo("/recruiter-login")}>Recruiter Login</button>
          <button onClick={() => goTo("/recruiter-post-job")}>Post a Job</button>
          <button onClick={() => goTo("/recruiter-search")}>Talent Search</button>
          <button onClick={() => goTo("/services")}>Hiring Solutions</button>
        </section>
      </footer>
    </main>
  );
}

export default PremiumContactPage;