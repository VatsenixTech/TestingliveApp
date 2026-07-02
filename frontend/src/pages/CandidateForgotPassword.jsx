import { useState } from "react";
import axios from "axios";
import "./CandidateForgotPassword.css";

const API_URL =
  import.meta.env.VITE_API_URL || "https://nopromptjobs-backend.onrender.com";

function CandidateForgotPassword() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setMessage("Please enter your registered email.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await axios.post(
        `${API_URL}/api/candidates/forgot-password/send-otp`,
        { email: cleanEmail }
      );

      setEmail(cleanEmail);
      setStep("reset");
      setMessage(res.data.message || "OTP sent to your email.");
    } catch (error) {
      setMessage(
        error.response?.data?.message || error.message || "Failed to send OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      setMessage("Please enter OTP.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setMessage("Please enter and confirm your new password.");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await axios.post(
        `${API_URL}/api/candidates/forgot-password/reset-password`,
        {
          email,
          otp: otp.trim(),
          newPassword,
        }
      );

      alert(res.data.message || "Password reset successfully.");
      window.location.href = "/candidate-login";
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Password reset failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="fp-page">
      <header className="fp-header">
        <div className="fp-brand">
          <div className="fp-logo">NPJ</div>
          <div>
            <h2>NoPromptJobs</h2>
            <p>Verified Talent Intelligence Platform</p>
          </div>
        </div>

        <a href="/candidate-login" className="fp-login-link">
          Back to Login ↗
        </a>
      </header>

      <section className="fp-card">
        <div className="fp-lock">🔒</div>

        <h1>
          {step === "email" ? (
            <>
              Forgot <span>Password?</span>
            </>
          ) : (
            <>
              Reset <span>Password</span>
            </>
          )}
        </h1>

        <p className="fp-subtitle">
          {step === "email"
            ? "No worries! Enter your registered email address and we’ll send you a secure OTP to reset your password."
            : `Enter the OTP sent to ${email} and create your new password.`}
        </p>

        {step === "email" ? (
          <form onSubmit={handleSendOtp}>
            <label>Registered Email Address</label>

            <div className="fp-input-box">
              <span>✉️</span>
              <input
                type="email"
                placeholder="Enter registered email"
                value={email}
                disabled={loading}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setMessage("");
                }}
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Sending OTP..." : "✈ Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <label>Enter OTP</label>
            <div className="fp-input-box">
              <span>🔢</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength="6"
                placeholder="Enter 6 digit OTP"
                value={otp}
                disabled={loading}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""));
                  setMessage("");
                }}
              />
            </div>

            <label>New Password</label>
            <div className="fp-input-box">
              <span>🔐</span>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                disabled={loading}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setMessage("");
                }}
              />
            </div>

            <label>Confirm Password</label>
            <div className="fp-input-box">
              <span>🔐</span>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                disabled={loading}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setMessage("");
                }}
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <button
              type="button"
              className="fp-secondary-btn"
              disabled={loading}
              onClick={() => {
                setStep("email");
                setOtp("");
                setNewPassword("");
                setConfirmPassword("");
                setMessage("");
              }}
            >
              Change Email
            </button>
          </form>
        )}

        {message && <p className="fp-message">{message}</p>}

        <div className="fp-divider">
          <span></span>
          <p>or</p>
          <span></span>
        </div>

        <a href="/candidate-login" className="fp-back">
          Back to Login
        </a>
      </section>

      <section className="fp-features">
        <div>
          <strong>🛡 Secure & Encrypted</strong>
          <p>Your data is always safe</p>
        </div>

        <div>
          <strong>⚡ Quick & Easy</strong>
          <p>Reset in just a few steps</p>
        </div>

        <div>
          <strong>⏱ OTP Valid for 10 Min</strong>
          <p>For your security</p>
        </div>

        <div>
          <strong>🎧 Need Help?</strong>
          <p>Contact our support</p>
        </div>
      </section>

      <footer className="fp-footer">
        © 2026 NoPromptJobs.com | All Rights Reserved | Trusted by 50,000+
        Professionals
      </footer>
    </main>
  );
}

export default CandidateForgotPassword;