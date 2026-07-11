import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaFileAlt,
  FaMicrophone,
  FaChartLine,
  FaRobot,
  FaBookOpen,
} from "react-icons/fa";

import "./AIWorkspacePage.css";

const aiTools = [
  {
    title: "Resume Studio",
    description:
      "Improve your resume, optimize ATS compatibility and prepare role-specific resumes.",
    icon: FaFileAlt,
    route: "/resume-studio",
  },

  {
    title: "AI Interview Prep",
    description:
      "Practice role-based interviews with AI recruiter simulations and receive performance insights.",
    icon: FaMicrophone,
    route: "/ai-interview-prep",
  },

  {
    title: "Skill Analyzer",
    description:
      "Analyze your technical skills, identify skill gaps and receive personalized improvement recommendations.",
    icon: FaRobot,
    route: "/skill-analyzer",
  },

  {
    title: "Salary Predictor",
    description:
      "Estimate your salary potential based on skills, experience, role and market data.",
    icon: FaChartLine,
    route: "/salary-predictor",
  },

  {
    title: "Question Bank",
    description:
      "Access role-based interview questions for Data Engineering, SAP, DevOps, Cybersecurity and other domains.",
    icon: FaBookOpen,
    route: "/question-bank",
  },
];

function AIWorkspacePage() {
  return (
    <div className="ai-workspace-page">
      <section className="ai-workspace-hero">
        <div>
          <span className="ai-workspace-badge">
            <FaRobot />

            AI CAREER INTELLIGENCE
          </span>

          <h1>
            Your AI-Powered
            <span> Career Workspace</span>
          </h1>

          <p>
            Improve your resume, analyze your skills, practice interviews,
            prepare with role-based questions and make better career decisions
            from one intelligent workspace.
          </p>

          <Link to="/resume-studio" className="ai-workspace-primary-btn">
            Start With Resume Studio

            <FaArrowRight />
          </Link>
        </div>
      </section>

      <section className="ai-tools-section">
        <div className="ai-tools-heading">
          <span>CAREER INTELLIGENCE TOOLS</span>

          <h2>Everything You Need to Prepare and Grow</h2>

          <p>
            Select a career tool to continue.
          </p>
        </div>

        <div className="ai-tools-grid">
          {aiTools.map(({ title, description, icon: Icon, route }) => (
            <Link
              to={route}
              className="ai-tool-card"
              key={title}
            >
              <div className="ai-tool-icon">
                <Icon />
              </div>

              <div className="ai-tool-content">
                <h3>{title}</h3>

                <p>{description}</p>
              </div>

              <div className="ai-tool-arrow">
                <FaArrowRight />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AIWorkspacePage;