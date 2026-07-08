import React, { useState } from "react";
import axios from "axios";
import { FcGoogle } from "react-icons/fc";

import {
  FaFacebookF,
  FaLinkedinIn,
  FaMicrosoft,
  FaShieldAlt,
  FaRobot,
  FaLock,
  FaCheck,
  FaSearch,
  FaArrowUp,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

import "./CandidateLogin.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CandidateLogin() {
  const [email, setEmail] = useState(
    localStorage.getItem("candidateRememberedEmail") || ""
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    !!localStorage.getItem("candidateRememberedEmail")
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loginCandidate = async () => {
    setErrorMsg("");

    if (!email.trim()) return setErrorMsg("Email is required");
    if (!password.trim()) return setErrorMsg("Password is required");

    try {
      setLoading(true);

      const response = await axios.post(`${API_URL}/api/candidates/login`, {
        email: email.trim().toLowerCase(),
        password,
      });

      const candidate = response.data.candidate || response.data.user;

      if (!candidate) {
        throw new Error("Candidate information was not returned");
      }

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(candidate));

      if (rememberMe) {
        localStorage.setItem(
          "candidateRememberedEmail",
          email.trim().toLowerCase()
        );
      } else {
        localStorage.removeItem("candidateRememberedEmail");
      }

      const candidateId = candidate._id || candidate.id || candidate.candidateId;

      window.location.href = candidateId
        ? `/dashboard/${candidateId}`
        : "/dashboard";
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message ||
          error.message ||
          "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = () => {
    setErrorMsg("");
    window.location.href = `${API_URL}/api/auth/google`;
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !loading) {
      loginCandidate();
    }
  };

  return (
    <main className="candidate-auth-page">
      <section className="candidate-auth-hero">
        <div className="auth-grid-pattern" />
        <div className="auth-orbit auth-orbit-one" />
        <div className="auth-orbit auth-orbit-two" />

        <header className="auth-brand auth-brand-large">
          <img
            src="/logo.png"
            alt="NoPrompt Jobs"
            className="auth-brand-logo-image"
          />
        </header>

        <div className="auth-hero-content">
          <div className="auth-copy">
            <div className="auth-trust-pill">
              <FaShieldAlt />
              <span>Built for trusted career opportunities</span>
            </div>

            <h1>
              Your Dream Job
              <span>
                is <strong>Closer</strong> Than
              </span>
              You Think
            </h1>

            <p className="auth-hero-description">
              Discover verified opportunities, prepare with intelligent career
              tools, and build your professional journey with confidence.
            </p>

            <div className="auth-features">
              <FeatureItem
                icon={<FaCheck />}
                title="Verified Opportunities"
                description="Explore trusted opportunities designed for genuine candidates and employers."
              />

              <FeatureItem
                icon={<FaSearch />}
                title="Smart Job Matching"
                description="Discover relevant opportunities with intelligent skill and career matching."
              />

              <FeatureItem
                icon={<FaArrowUp />}
                title="Career Growth"
                description="Prepare, practice and improve with tools designed to support your career journey."
              />
            </div>
          </div>

          <div className="auth-human-area">
            <div className="auth-human-glow" />
            <img
              className="auth-human-image"
              src="/images/candidate-professional.png"
              alt="Professional candidate using laptop"
            />
          </div>
        </div>

        <div className="auth-trust-metrics">
          <StartupValueItem
            icon={<FaShieldAlt />}
            title="Verified Hiring"
            description="Trusted opportunities & genuine talent"
          />

          <StartupValueItem
            icon={<FaRobot />}
            title="AI Career Tools"
            description="Smarter preparation for your career"
          />

          <StartupValueItem
            icon={<FaLock />}
            title="Privacy First"
            description="Your profile and data stay protected"
          />
        </div>
      </section>

      <section className="candidate-auth-form-side">
        <div className="auth-login-card">
          <div className="auth-welcome-pill">Welcome Back!</div>

          <div className="auth-login-heading">
            <h2>Candidate Login</h2>
            <p>Sign in to continue your career journey</p>
          </div>

          {errorMsg && <div className="auth-error-message">{errorMsg}</div>}

          <label className="auth-field-label" htmlFor="candidate-email">
            Email Address
          </label>

          <div className="auth-input-group">
            <FaEnvelope />
            <input
              id="candidate-email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email address"
              value={email}
              disabled={loading}
              onKeyDown={handleKeyDown}
              onChange={(event) => {
                setEmail(event.target.value);
                setErrorMsg("");
              }}
            />
          </div>

          <label className="auth-field-label" htmlFor="candidate-password">
            Password
          </label>

          <div className="auth-input-group">
            <FaLock />
            <input
              id="candidate-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              disabled={loading}
              onKeyDown={handleKeyDown}
              onChange={(event) => {
                setPassword(event.target.value);
                setErrorMsg("");
              }}
            />

            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="auth-login-options">
            <label className="auth-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              <span>Remember me</span>
            </label>

            <a href="/candidate-forgot-password">Forgot password?</a>
          </div>

          <button
            type="button"
            className="auth-primary-button"
            disabled={loading}
            onClick={loginCandidate}
          >
            {loading ? "Signing in..." : "↪ Access Dashboard"}
          </button>

          <div className="auth-divider">
            <span />
            <p>or continue with</p>
            <span />
          </div>

          <div className="auth-social-grid">
            <button type="button" onClick={googleLogin} disabled={loading}>
              <FcGoogle />
              <span>Google</span>
            </button>

            <button type="button" disabled>
              <FaLinkedinIn />
              <span>LinkedIn</span>
            </button>

            <button type="button" disabled>
              <FaMicrosoft />
              <span>Microsoft</span>
            </button>

            <button type="button" disabled>
              <FaFacebookF />
              <span>Facebook</span>
            </button>
          </div>

          <div className="auth-register-section">
            <h3>New to NoPrompt Jobs?</h3>
            <p>Create your verified account and start your career journey</p>
            <a href="/candidate-email-verify">
              Create New Account <span>→</span>
            </a>
          </div>
        </div>
      </section>

      <footer className="candidate-auth-footer">
        <p>© {new Date().getFullYear()} NoPrompt Jobs. All rights reserved.</p>

        <div>
          <span>
            <FaLock /> Privacy Protected
          </span>

          <span>
            <FaShieldAlt /> Security Focused
          </span>

          <span>
            <FaShieldAlt /> Trusted Hiring Platform
          </span>
        </div>
      </footer>
    </main>
  );
}

function FeatureItem({ icon, title, description }) {
  return (
    <div className="auth-feature">
      <div className="auth-feature-icon">{icon}</div>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

function StartupValueItem({ icon, title, description }) {
  return (
    <div className="auth-metric">
      <div className="auth-metric-icon">{icon}</div>
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    </div>
  );
}