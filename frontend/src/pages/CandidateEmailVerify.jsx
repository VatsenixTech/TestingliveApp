import { useState } from "react";
import axios from "axios";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from "firebase/auth";

import { auth, googleProvider } from "../firebase";
import "./CandidateEmailVerify.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function CandidateEmailVerify() {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const googleLogin = async () => {
    try {
      setLoading(true);

      const result = await signInWithPopup(auth, googleProvider);
      const firebaseToken = await result.user.getIdToken();

      const response = await axios.post(
        `${API_URL}/api/auth/google`,
        {},
        {
          headers: {
            Authorization: `Bearer ${firebaseToken}`,
          },
        }
      );

      if (!response.data?.success) {
        alert(response.data?.message || "Google login failed");
        return;
      }

      const candidate = response.data.candidate;
      const candidateId = candidate?._id || candidate?.id;

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(candidate));

      if (
        response.data?.isNewCandidate ||
        !response.data?.hasPassword
      ) {
        localStorage.setItem(
          "candidateSetPasswordId",
          candidateId || ""
        );

        localStorage.setItem(
          "candidateSetPasswordEmail",
          candidate?.email || ""
        );

        window.location.href =
          "/candidate-set-password?mode=google";
      } else {
        window.location.href = `/dashboard/${candidateId}`;
      }
    } catch (error) {
      console.error("Google login error:", error);

      if (error.code === "auth/popup-blocked") {
        alert("Please allow popups for this website.");
        return;
      }

      if (error.code === "auth/popup-closed-by-user") {
        alert("Google sign-in was cancelled.");
        return;
      }

      alert(
        error.response?.data?.message ||
          error.message ||
          "Google login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    const signupEmail = email.trim().toLowerCase();
    const signupMobile = mobile.trim();

    if (!signupEmail) {
      alert("Email is required");
      return;
    }

    if (!signupEmail.includes("@")) {
      alert("Please enter a valid email");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/api/candidates/send-otp`,
        {
          email: signupEmail,
          mobile: signupMobile,
          method: "email",
        }
      );

      localStorage.setItem(
        "candidateSignupEmail",
        signupEmail
      );

      localStorage.setItem(
        "candidateSignupMobile",
        signupMobile
      );

      setOtpSent(true);

      alert(
        response.data?.message ||
          "OTP sent successfully to your email"
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to send OTP";

      if (
        message.toLowerCase().includes("already registered") ||
        message.toLowerCase().includes("please login")
      ) {
        alert("Account already exists. Redirecting to login.");

        window.location.href = `/candidate-login?email=${encodeURIComponent(
          signupEmail
        )}`;

        return;
      }

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    const signupEmail = email.trim().toLowerCase();
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      alert("Please enter the complete 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/api/candidates/verify-otp`,
        {
          email: signupEmail,
          otp: otpValue,
          method: "email",
        }
      );

      localStorage.setItem(
        "candidateSignupEmail",
        signupEmail
      );

      localStorage.setItem(
        "candidateSignupMobile",
        mobile.trim()
      );

      localStorage.setItem(
        "candidateOtpVerified",
        "true"
      );

      alert(
        response.data?.message ||
          "Email verified successfully"
      );

      window.location.href = "/candidate-set-password";
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Invalid or expired OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value, element) => {
    const digit = value.replace(/\D/g, "").slice(0, 1);

    const updatedOtp = [...otp];
    updatedOtp[index] = digit;

    setOtp(updatedOtp);

    if (digit && element.nextElementSibling) {
      element.nextElementSibling.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (
      event.key === "Backspace" &&
      !otp[index] &&
      event.currentTarget.previousElementSibling
    ) {
      event.currentTarget.previousElementSibling.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();

    const pastedValue = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedValue) return;

    const pastedOtp = Array(6).fill("");

    pastedValue.split("").forEach((digit, index) => {
      pastedOtp[index] = digit;
    });

    setOtp(pastedOtp);
  };

  const changeEmail = () => {
    setOtp(["", "", "", "", "", ""]);
    setOtpSent(false);
  };

  return (
    <main className="candidate-register-page">
      <section className="candidate-register-left">
        <a
          href="/"
          className="candidate-register-brand"
          aria-label="NoPromptJobs home"
        >
          <img
            src="/logo.png"
            alt="NoPromptJobs"
            className="candidate-register-logo"
          />
        </a>

        <div className="candidate-register-content">
          <div className="candidate-register-text-area">
            <div className="candidate-dream-badge">
              ✨ Your Dream Job, Without Limits
            </div>

            <h1 className="candidate-register-title">
              Find the right
              <br />
              opportunity
              <br />
              <span>
                faster <b>⚡</b>
              </span>
            </h1>

            <p className="candidate-register-description">
              Join a verified network of top companies and
              skilled professionals. Your dream job is just
              one step away.
            </p>

            <div className="candidate-feature-grid">
              <article className="candidate-feature-card">
                <span>🤖</span>
                <h3>AI Matching</h3>
                <p>Smart job recommendations</p>
              </article>

              <article className="candidate-feature-card">
                <span>🛡️</span>
                <h3>Verified Jobs</h3>
                <p>Only trusted companies</p>
              </article>

              <article className="candidate-feature-card">
                <span>📄</span>
                <h3>ATS Resume</h3>
                <p>Beat ATS with ease</p>
              </article>

              <article className="candidate-feature-card">
                <span>📈</span>
                <h3>Career Growth</h3>
                <p>Track and improve</p>
              </article>
            </div>
          </div>

          <div className="candidate-visual-area">
            <div className="candidate-visual-glow"></div>

            <div className="candidate-visual-circle circle-one"></div>
            <div className="candidate-visual-circle circle-two"></div>

            <div className="candidate-target-icon">◎</div>
            <div className="candidate-plane-icon">➤</div>

            <img
              src="/candidate-onboarding-visual.png"
              alt="Candidate searching for jobs online"
              className="candidate-hero"
                 />
          </div>
        </div>
      </section>

      <section className="candidate-register-right">
        <div className="candidate-register-card">
          <div className="candidate-card-pattern"></div>

          <span className="candidate-onboarding-badge">
            👤 Candidate Onboarding
          </span>

          <h2>
            {otpSent
              ? "Verify your email"
              : "Create your account"}
          </h2>

          <p className="candidate-register-subtitle">
            {otpSent
              ? `We sent a 6-digit OTP to ${email}`
              : "Start with Google or email verification to create your profile."}
          </p>

          {!otpSent ? (
            <>
              <button
                type="button"
                className="candidate-google-button"
                onClick={googleLogin}
                disabled={loading}
              >
                <span className="candidate-google-icon">
                  <FcGoogle />
                </span>

                <strong>
                  {loading
                    ? "Please wait..."
                    : "Continue with Google"}
                </strong>

                <span className="candidate-button-arrow">
                  →
                </span>
              </button>

              <div className="candidate-divider">
                <span></span>
                <p>or continue with email</p>
                <span></span>
              </div>

              <label className="candidate-form-label">
                Email Address

                <div className="candidate-input-wrapper">
                  <span className="candidate-input-prefix">
                    ✉
                  </span>

                  <input
                    type="email"
                    value={email}
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={loading}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                  />
                </div>
              </label>

              <label className="candidate-form-label">
                Mobile Number (Optional)

                <div className="candidate-input-wrapper">
                  <span className="candidate-input-prefix candidate-country-code">
                    IN +91
                  </span>

                  <input
                    type="tel"
                    value={mobile}
                    placeholder="Enter mobile number"
                    autoComplete="tel"
                    disabled={loading}
                    maxLength={10}
                    onChange={(event) =>
                      setMobile(
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10)
                      )
                    }
                  />
                </div>
              </label>

              <button
                type="button"
                className="candidate-primary-button"
                onClick={sendOtp}
                disabled={loading}
              >
                {loading
                  ? "Sending OTP..."
                  : "Create Account →"}
              </button>

              <p className="candidate-register-terms">
                By creating an account, you accept our{" "}
                <a href="/terms">Terms of Service</a> and{" "}
                <a href="/privacy">Privacy Policy</a>.
              </p>
            </>
          ) : (
            <>
              <label className="candidate-otp-heading">
                Enter the 6-digit OTP
              </label>

              <div
                className="candidate-otp-grid"
                onPaste={handleOtpPaste}
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    value={digit}
                    inputMode="numeric"
                    maxLength={1}
                    disabled={loading}
                    aria-label={`OTP digit ${index + 1}`}
                    onChange={(event) =>
                      handleOtpChange(
                        index,
                        event.target.value,
                        event.target
                      )
                    }
                    onKeyDown={(event) =>
                      handleOtpKeyDown(index, event)
                    }
                  />
                ))}
              </div>

              <button
                type="button"
                className="candidate-primary-button"
                onClick={verifyOtp}
                disabled={loading}
              >
                {loading
                  ? "Verifying..."
                  : "Verify & continue →"}
              </button>

              <button
                type="button"
                className="candidate-change-email"
                onClick={changeEmail}
                disabled={loading}
              >
                Change email address
              </button>
            </>
          )}

          <p className="candidate-signin-text">
            Already have an account?{" "}
            <a href="/candidate-login">Sign in</a>
          </p>
        </div>
      </section>
    </main>
  );
}

export default CandidateEmailVerify;