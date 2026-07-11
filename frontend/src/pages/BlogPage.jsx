import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaBriefcase,
  FaFileAlt,
  FaMicrophone,
  FaChartLine,
} from "react-icons/fa";
import "./CompanyPages.css";

const articles = [
  {
    icon: <FaFileAlt />,
    category: "Resume",
    title: "How to Create an ATS-Friendly Resume",
    description:
      "Learn how to structure your resume, use relevant keywords and clearly present your professional experience.",
  },
  {
    icon: <FaMicrophone />,
    category: "Interview",
    title: "How to Answer Technical Interview Questions",
    description:
      "Use a clear structure, explain your thought process and support your answers with practical examples.",
  },
  {
    icon: <FaBriefcase />,
    category: "Job Search",
    title: "How to Find Genuine Job Opportunities",
    description:
      "Understand how verified employers, clear job descriptions and trusted platforms can improve your job search.",
  },
  {
    icon: <FaChartLine />,
    category: "Career Growth",
    title: "Skills That Help Candidates Grow Faster",
    description:
      "Identify technical, communication and problem-solving skills that can strengthen your long-term career.",
  },
];

function BlogPage() {
  return (
    <div className="company-page">
      <header className="company-header">
        <Link to="/dashboard" className="company-brand">
          <img src="/logo.png" alt="NoPromptJobs" />
        </Link>

        <nav className="company-nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/jobs">Jobs</Link>
          <Link to="/how-it-works">How It Works</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </header>

      <main>
        <section className="company-hero compact-company-hero">
          <div className="company-hero-badge">Career Knowledge Centre</div>

          <h1>
            NoPromptJobs <span>Career Blog</span>
          </h1>

          <p>
            Practical guidance for resume preparation, interview readiness,
            job searching, career development and professional growth.
          </p>
        </section>

        <section className="blog-section">
          <div className="section-heading">
            <span>Latest career resources</span>
            <h2>Learn, prepare and grow</h2>
          </div>

          <div className="blog-grid">
            {articles.map((article) => (
              <article className="blog-card" key={article.title}>
                <div className="blog-icon">{article.icon}</div>
                <span className="article-category">{article.category}</span>
                <h3>{article.title}</h3>
                <p>{article.description}</p>

                <button
                  type="button"
                  className="article-link"
                  onClick={() =>
                    window.alert("The complete article will be available soon.")
                  }
                >
                  Read Article
                  <FaArrowRight />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="company-cta">
          <div>
            <span>Prepare for your next opportunity</span>
            <h2>Use our career tools to improve your job readiness.</h2>
          </div>

          <Link to="/ai-interview-prep" className="primary-company-btn">
            Practice Interview
            <FaArrowRight />
          </Link>
        </section>
      </main>
    </div>
  );
}

export default BlogPage;