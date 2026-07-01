import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FcGoogle } from "react-icons/fc";
import { FaLinkedinIn, FaFacebookF, FaMicrosoft } from "react-icons/fa";
import "./index.css";
import JobDetailsPage from "./pages/JobDetailsPage";
import AIInterviewPrepPage from "./pages/AIInterviewPrepPage";
import MobileCandidateDashboard from "./pages/MobileCandidateDashboard";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import ApplicationsPage from "./pages/ApplicationsPage";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import ResumeStudio from "./pages/ResumeStudio";
import SkillAnalyzerPage from "./pages/SkillAnalyzerPage";
import SalaryPredictorPage from "./pages/SalaryPredictorPage";
import HiddenOpportunitiesPage from "./pages/HiddenOpportunitiesPage";
import JobAlertsPage from "./pages/JobAlertsPage";
import CareerRoadmapPage from "./pages/CareerRoadmapPage";
import CandidateProfilePage from "./pages/CandidateProfilePage";
import CandidateSettings from "./pages/CandidateSettings";
import HelpChatWidget from "./components/HelpChatWidget";
import CandidateForgotPassword from "./pages/CandidateForgotPassword";
import PremiumTermsPage from "./pages/PremiumTermsPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import PremiumContactPage from "./pages/PremiumContactPage";
import "swiper/css";
import "swiper/css/navigation";





const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


function LandingPage() {
  return (
      <div className="np-home-page">
      <nav className="np-home-nav">
        <a href="/" className="np-home-brand">
          <div className="np-logo-icon">NP</div>

          <div className="np-brand-text">
            <h2>NOPROMPTJOBS.COM</h2>
            <p>SMART HIRING. REAL CAREERS.</p>
          </div>
        </a>
        <div className="np-home-links">
          <a href="/jobs">Jobs</a>
          <a href="/companies">Companies</a>
          <a href="/services">Services</a>
          <a href="/candidate-login">Candidate Login</a>
          <a href="/recruiter-login" className="np-employer-btn">
            For Employers
          </a>
        </div>
      </nav>

      <section className="np-hero">
        <div className="np-hero-left">
          <span className="np-hero-badge">
            🛡 Trusted Hiring Platform
          </span>

          <h1>
            Hire Genuinely.
            <br />
            Build Careers.
          </h1>

          <p>
            NoProxiesJobs.com helps companies hire verified candidates with
            identity proof, self-intro videos, project proof and smart match
            signals.
          </p>

          <div className="np-hero-actions">
            <button onClick={() => (window.location.href = "/candidate-email-verify")}>
              Get Started Now →
            </button>

            <button
              className="np-watch-btn"
              onClick={() => alert("Demo video coming soon")}
            >
              ▶ Watch Demo
            </button>
          </div>

          <div className="np-company-strip">
            <span>Trusted by growing hiring teams</span>

            <div>
              <b>TCS</b>
              <b>Infosys</b>
              <b>Wipro</b>
              <b>Capgemini</b>
              <b>HCL</b>
            </div>
          </div>
        </div>

        <div className="np-hero-right">
          <div className="np-trust-card">
            <div className="np-card-head">
              <h3>Candidate Trust Score</h3>
              <span>Excellent</span>
            </div>

            <div className="np-score-wrap">
              <div className="np-score-circle">
                <h2>96%</h2>
                <p>Trust Score</p>
              </div>

              <div className="np-check-list">
                <p>✅ PAN Verified</p>
                <p>✅ Aadhaar Last 4 Verified</p>
                <p>✅ Self Intro Uploaded</p>
                <p>✅ Project Proof Added</p>
                <p>✅ Resume Quality 91%</p>
              </div>
            </div>

            <div className="np-confidence">
              <span>Hiring Confidence</span>
              <b>High ↗</b>
            </div>
          </div>

          <div className="np-side-card">
            <h3>Recruiter Activity</h3>

            <div>
              <h2>182</h2>
              <p>Profiles Reviewed</p>
            </div>

            <div>
              <h2>43</h2>
              <p>Shortlisted</p>
            </div>
          </div>

          <div className="np-side-card">
            <h3>Top Skills in Demand</h3>

            <p>React.js <span>86%</span></p>
            <div className="np-mini-bar"><b style={{ width: "86%" }}></b></div>

            <p>Node.js <span>78%</span></p>
            <div className="np-mini-bar"><b style={{ width: "78%" }}></b></div>

            <p>Python <span>74%</span></p>
            <div className="np-mini-bar"><b style={{ width: "74%" }}></b></div>
          </div>
        </div>
      </section>

      <section className="np-feature-strip">
        <div>
          <span>🎥</span>
          <h3>Video Introductions</h3>
          <p>Watch candidate self-intro before shortlisting.</p>
        </div>

        <div>
          <span>📁</span>
          <h3>Project Proof System</h3>
          <p>Validate real-world work through project videos.</p>
        </div>

        <div>
          <span>🛡</span>
          <h3>Identity Verification</h3>
          <p>PAN and Aadhaar last 4 verification for trust.</p>
        </div>

        <div>
          <span>✨</span>
          <h3>Match Score</h3>
          <p>No-prompt powered matching for better hiring decisions.</p>
        </div>
      </section>

      <section className="np-role-section">
        <div className="np-role-card">
          <div className="np-role-icon candidate">👤</div>

          <div>
            <h2>I am a Candidate</h2>
            <p>
              Create your verified profile, showcase skills, upload videos and
              get discovered by genuine recruiters.
            </p>

            <div className="np-role-actions">
              <a href="/candidate-login">Candidate Login</a>
              <a href="/candidate-email-verify">Create Candidate Account</a>
            </div>
          </div>
        </div>

        <div className="np-role-card">
          <div className="np-role-icon recruiter">💼</div>

          <div>
            <h2>I am a Recruiter</h2>
            <p>
              Post jobs, find verified talent, shortlist smartly and hire with
              confidence.
            </p>

            <div className="np-role-actions recruiter-actions">
              <a href="/recruiter-login">Recruiter Login</a>
              <a href="/recruiter-register">Create Recruiter Account</a>
            </div>
          </div>
        </div>
      </section>

      <section className="np-bottom-trust">
        <span>✅ 100% Verified Profiles</span>
        <span>🔒 Secure & Private</span>
        <span>⚡ Smart Hiring Tools</span>
        <span>🎧 24/7 Human Support</span>
      </section>
    </div>
  );
}
function Register() {
  const [form,setForm]=useState({
    name:"",
    email:"",
    password:"",
    role:"candidate"
  });

  const handleChange=(e)=>{
    setForm({
      ...form,
      [e.target.name]:e.target.value
    });
  };

  const register=()=>{
    console.log(form);

    alert("Registered Successfully");

    window.location.href="/login";
  };

  return(
    <>
    <Navbar/>

    <div className="auth-box">

      <h1>Create Account</h1>

      <input
      name="name"
      placeholder="Name"
      onChange={handleChange}
      />

      <input
      name="email"
      placeholder="Email"
      onChange={handleChange}
      />

      <input
      name="password"
      type="password"
      placeholder="Password"
      onChange={handleChange}
      />

      <button onClick={register}>
      Register
      </button>

    </div>
    </>
  );
}
function CandidateLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(candidate));

      const candidateId = candidate?._id || candidate?.id || candidate?.candidateId;

      window.location.href = candidateId
        ? `/dashboard/${candidateId}`
        : "/dashboard";
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    try {
      setLoading(true);

      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();

      const response = await axios.post(`${API_URL}/api/candidates/firebase-login`, {
        token,
        provider: "google",
      });

      const candidate = response.data.candidate;
      const candidateId = candidate._id || candidate.id;

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(candidate));

      if (response.data?.isNewCandidate || !response.data?.hasPassword) {
        localStorage.setItem("candidateSetPasswordId", candidateId);
        localStorage.setItem("candidateSetPasswordEmail", candidate.email);
        window.location.href = "/candidate-set-password?mode=google";
      } else {
        window.location.href = `/dashboard/${candidateId}`;
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="candidate-login-elite">
      <section className="elite-left">
        <div className="elite-overlay"></div>

        <div className="elite-brand">
          <img src="/logo.png" alt="NoPrompt Jobs" />
          <div>
            
          </div>
        </div>

        <div className="elite-copy">
          <span className="elite-trust-badge">🛡 Trusted by verified professionals</span>

          <h1>
            Your Dream Job <br />
            is <b>Closer</b> Than <br />
            You Think
          </h1>

          <p>
            Join verified professionals finding the right opportunities and
            building successful careers every day.
          </p>

          <div className="elite-feature">
            <span>✓</span>
            <div>
              <h4>Verified Opportunities</h4>
              <p>All jobs are verified for your safety and career growth.</p>
            </div>
          </div>

          <div className="elite-feature">
            <span>⌕</span>
            <div>
              <h4>Smart Job Matching</h4>
              <p>AI-powered matching connects you with the right opportunities.</p>
            </div>
          </div>

          <div className="elite-feature">
            <span>↗</span>
            <div>
              <h4>Career Growth</h4>
              <p>Tools, resources and guidance to help you grow in your career.</p>
            </div>
          </div>
        </div>

        <div className="elite-photo-card">
          <img src="/images/candidate-login-woman.png" alt="Candidate working" />
        </div>

        <div className="elite-secure-card">
          <span>🔒</span>
          <div>
            <h4>Secure & Private</h4>
            <p>Your data is always safe and protected with us.</p>
          </div>
        </div>
      </section>

      <section className="elite-right">
        <div className="elite-login-card">
          <span className="elite-pill">👋 Welcome Back!</span>

          <h1>Candidate Login</h1>
          <p>Sign in to continue your career journey</p>

          {errorMsg && <div className="login-error-box">{errorMsg}</div>}

          <label>Email Address</label>
          <div className="elite-input">
            <span>✉</span>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              disabled={loading}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMsg("");
              }}
            />
          </div>

          <label>Password</label>
          <div className="elite-input">
            <span>🔒</span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              disabled={loading}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMsg("");
              }}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

          <div className="elite-options">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <a href="/candidate-forgot-password">Forgot password?</a>
          </div>

          <button className="elite-main-btn" onClick={loginCandidate} disabled={loading}>
            {loading ? "Signing in..." : "↪ Access Dashboard"}
          </button>

          <div className="elite-divider">
            <span></span>
            <p>or continue with</p>
            <span></span>
          </div>

          <div className="elite-socials">
            <button onClick={googleLogin} disabled={loading}>
              <FcGoogle /> Google
            </button>
            <button disabled>
              <FaLinkedinIn /> LinkedIn
            </button>
            <button disabled>
              <FaFacebookF /> Facebook
            </button>
          </div>

          <div className="elite-new-box">
            <h3>New to NoPrompt Jobs?</h3>
            <p>Create your verified account and start your journey</p>
            <a href="/candidate-email-verify">👥 Create New Account</a>
          </div>
        </div>

        <div className="elite-bottom-trust">
          <div>🔒 <b>Secure & Private</b></div>
          <div>🛡 <b>Trusted Platform</b></div>
          <div>✅ <b>100% Verified</b></div>
        </div>
      </section>
    </main>
  );
}
function CandidateEmailVerify() {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const googleLogin = async () => {
    try {
      setLoading(true);

      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();

      const response = await axios.post(
        `${API_URL}/api/candidates/firebase-login`,
        {
          token,
          provider: "google",
        }
      );

      if (!response.data?.success) {
        alert(response.data?.message || "Google login failed");
        return;
      }

      const candidate = response.data.candidate;

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(candidate));

      const candidateId = candidate._id || candidate.id;

if (response.data?.isNewCandidate || !response.data?.hasPassword) {
  localStorage.setItem("candidateSetPasswordId", candidateId);
  localStorage.setItem("candidateSetPasswordEmail", candidate.email);
  window.location.href = "/candidate-set-password?mode=google";
} else {
  window.location.href = `/dashboard/${candidateId}`;
}
    } catch (err) {
      console.log("GOOGLE LOGIN ERROR:", err);

      const message =
        err.response?.data?.message || err.message || "Google login failed";

      if (err.code === "auth/popup-blocked") {
        alert("Please allow popups for this website.");
        return;
      }

      if (message.toLowerCase().includes("account does not exist")) {
        alert("Account does not exist. Please create a new account.");
        return;
      }

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    const signupEmail = email.trim().toLowerCase();

    if (!signupEmail) return alert("Email is required");
    if (!signupEmail.includes("@")) return alert("Please enter a valid email");

    try {
      setLoading(true);

      const response = await axios.post(`${API_URL}/api/candidates/send-otp`, {
        email: signupEmail,
        mobile: mobile.trim(),
        method: "email",
      });

      localStorage.setItem("candidateSignupEmail", signupEmail);
      localStorage.setItem("candidateSignupMobile", mobile.trim());

      setOtpSent(true);
      alert(response.data?.message || "OTP sent to your email");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to send OTP";

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

      if (message.toLowerCase().includes("permanently deleted")) {
        alert("Account does not exist. Please create a new account.");
        return;
      }

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    const signupEmail = email.trim().toLowerCase();

    if (!signupEmail) return alert("Email is required");
    if (otp.length !== 6) return alert("Please enter 6 digit OTP");

    try {
      setLoading(true);

      const response = await axios.post(`${API_URL}/api/candidates/verify-otp`, {
        email: signupEmail,
        otp,
        method: "email",
      });

      localStorage.setItem("candidateSignupEmail", signupEmail);
      localStorage.setItem("candidateSignupMobile", mobile.trim());
      localStorage.setItem("candidateOtpVerified", "true");

      alert(response.data?.message || "Email verified successfully");
      window.location.href = "/candidate-set-password";
    } catch (error) {
      alert(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value, input) => {
    const digit = value.replace(/\D/g, "").slice(0, 1);
    const arr = otp.split("");

    arr[index] = digit;
    setOtp(arr.join("").slice(0, 6));

    if (digit && input.nextElementSibling) {
      input.nextElementSibling.focus();
    }
  };

  return (
    <main className="np-register-page">
      <section className="np-register-left">
        <div className="np-register-brand">
          <img
            src="/logo.png"
            alt="NoPromptJobs"
            className="np-premium-logo"
          />
        </div>

        <div className="np-register-copy">
          <span>🛡 Verified Hiring Network</span>

          <h1>
            Find the right <b>job opportunity</b>
          </h1>

          <p>
            Explore verified jobs from trusted companies and build a career
            you're proud of.
          </p>
        </div>

 <img
  className="login-woman-fixed"
  src="/images/login-woman.png"
  alt="Candidate working"
/>
      </section>

      <section className="np-register-right">
        <div className="np-register-card">
          <span className="np-register-badge">Candidate Onboarding</span>

          <h1>{otpSent ? "Verify your email" : "Create your account"}</h1>

          <p className="np-register-sub">
            {otpSent
              ? `We sent a 6-digit OTP to ${email}`
              : "Start with Google or email verification to create your profile."}
          </p>

          {!otpSent ? (
            <>
              <div className="np-login-options">
                <button
                  type="button"
                  className="np-social-btn"
                  onClick={googleLogin}
                  disabled={loading}
                >
                  <FcGoogle className="np-real-icon" />
                  <b>{loading ? "Please wait..." : "Continue with Google"}</b>
                  <i>→</i>
                </button>
              </div>

              <div className="np-register-divider">
                <span></span>
                <p>or continue with email</p>
                <span></span>
              </div>

              <label className="np-register-field">
                Email Address
                <div>
                  <span>✉</span>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    disabled={loading}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </label>

              <label className="np-register-field">
                Mobile Number (Optional)
                <div>
                  <span>IN +91</span>
                  <input
                    type="tel"
                    placeholder="Optional mobile number"
                    value={mobile}
                    disabled={loading}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </div>
              </label>

              <button
                type="button"
                className="np-register-primary"
                onClick={sendOtp}
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Create Account →"}
              </button>

              <p className="np-register-terms">
                By creating an account, you accept our{" "}
                <a href="/terms">Terms</a> and{" "}
                <a href="/privacy">Privacy Policy</a>.
              </p>
            </>
          ) : (
            <>
              <label className="np-otp-title">Enter OTP</label>

              <div className="np-premium-otp">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={otp[index] || ""}
                    disabled={loading}
                    onChange={(e) =>
                      handleOtpChange(index, e.target.value, e.target)
                    }
                  />
                ))}
              </div>

              <button
                type="button"
                className="np-register-primary"
                onClick={verifyOtp}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & continue →"}
              </button>
            </>
          )}

          <p className="np-register-signin">
            Already have an account? <a href="/candidate-login">Sign in</a>
          </p>
        </div>
      </section>
    </main>
  );
}
function CandidateSetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");

  const email = localStorage.getItem("candidateSignupEmail") || localStorage.getItem("candidateSetPasswordEmail");
  const candidateId = localStorage.getItem("candidateSetPasswordId");

  const setLoginPassword = async () => {
    if (!password || !confirmPassword) {
      return alert("Please enter password and confirm password");
    }

    if (password.length < 6) {
      return alert("Password must be at least 6 characters");
    }

    if (password !== confirmPassword) {
      return alert("Passwords do not match");
    }

    try {
      setLoading(true);

      const payload =
        mode === "google"
          ? { candidateId, password }
          : { email, password };

      const response = await axios.post(
        `${API_URL}/api/candidates/set-password`,
        payload
      );

      if (!response.data?.success) {
        alert(response.data?.message || "Failed to set password");
        return;
      }

      const candidate = response.data.candidate;

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(candidate));

      localStorage.removeItem("candidateSignupEmail");
      localStorage.removeItem("candidateSignupMobile");
      localStorage.removeItem("candidateOtpVerified");
      localStorage.removeItem("candidateSetPasswordId");
      localStorage.removeItem("candidateSetPasswordEmail");

      alert("Password set successfully");
      window.location.href = `/dashboard/${candidate._id || candidate.id}`;
    } catch (error) {
      alert(error.response?.data?.message || "Failed to set password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="np-register-page">
      <section className="np-register-right">
        <div className="np-register-card">
          <span className="np-register-badge">Secure Account</span>

          <h1>Set your password</h1>

          <p className="np-register-sub">
            Create a password so you can login using email and password also.
          </p>

          <label className="np-register-field">
            New Password
            <div>
              <span>🔐</span>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                disabled={loading}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </label>

          <label className="np-register-field">
            Confirm Password
            <div>
              <span>🔐</span>
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                disabled={loading}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </label>

          <button
            type="button"
            className="np-register-primary"
            onClick={setLoginPassword}
            disabled={loading}
          >
            {loading ? "Saving..." : "Set Password & Open Dashboard →"}
          </button>
        </div>
      </section>
    </main>
  );
}
function RecruiterLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginRecruiter = () => {
    const loginEmail = email.trim().toLowerCase();

    if (!loginEmail || !password) {
      alert("Please enter recruiter email and password");
      return;
    }

    localStorage.setItem(
      "user",
      JSON.stringify({
        email: loginEmail,
        role: "recruiter",
      })
    );

    window.location.href = "/recruiter-dashboard";
  };

  return (
    <div className="auth-page">
      <div className="auth-card recruiter-auth">
        <h1>Recruiter Login</h1>
        <p>Login to search verified candidates and manage hiring.</p>

        <input
          placeholder="Work Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={loginRecruiter}>Login as Recruiter</button>

        <a href="/recruiter-register">Create Recruiter Account</a>
        <a href="/">Back to Home</a>
      </div>
    </div>
  );
}

function CandidateRegister() {
  const email = localStorage.getItem("candidateSignupEmail");
  const otpVerified = localStorage.getItem("candidateOtpVerified") === "true";
  const passwordSet = localStorage.getItem("candidatePasswordSet") === "true";

  useEffect(() => {
    if (!email || !otpVerified || !passwordSet) {
      alert("Please verify your email and set password first");
      window.location.href = "/candidate-email-verify";
    }
  }, [email, otpVerified, passwordSet]);

  if (!email || !otpVerified || !passwordSet) {
    return <div className="loading">Checking verification...</div>;
  }

  return <CandidateUpload />;
}

function RecruiterRegister() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const registerRecruiter = () => {
    if (!form.name || !form.email || !form.company || !form.password) {
      alert("Please fill all details");
      return;
    }

    localStorage.setItem(
      "user",
      JSON.stringify({
        email: form.email,
        role: "recruiter",
        company: form.company,
      })
    );

    alert("Recruiter registered successfully");
    window.location.href = "/recruiter-dashboard";
  };

  return (
    <div className="auth-page">
      <div className="auth-card recruiter-auth">
        <h1>Create Recruiter Account</h1>

        <input name="name" placeholder="Recruiter Name" onChange={handleChange} />
        <input name="email" placeholder="Work Email" onChange={handleChange} />
        <input name="company" placeholder="Company Name" onChange={handleChange} />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <button onClick={registerRecruiter}>Create Recruiter Account</button>
        <a href="/recruiter-login">Already have account? Login</a>
      </div>
    </div>
  );
}

function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("All Jobs");
  const [locationFilter, setLocationFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [salaryFilter, setSalaryFilter] = useState("");
  const [jobAlertEnabled, setJobAlertEnabled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const sliderRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const candidateId =
    user?.candidateId ||
    user?._id ||
    user?.id ||
    "";

  const unreadCount =
    Number(user?.unreadMessages) ||
    Number(localStorage.getItem("unreadMessages")) ||
    6;

  const profileStrength =
    Number(user?.profileStrength) ||
    Number(localStorage.getItem("profileStrength")) ||
    90;

  const goTo = (path) => {
    window.location.href = path;
  };

  const handleSearch = () => {
    const q = searchText.trim();
    goTo(q ? `/jobs?search=${encodeURIComponent(q)}` : "/jobs");
  };

  const handleNotifications = () => {
    goTo("/notifications");
  };

  const handleMessages = () => {
    goTo("/messages");
  };

  const handleProfile = () => {
    goTo(candidateId ? `/profile/${candidateId}` : "/candidate-login");
  };

  const loadJobs = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/jobs`);
      const data = res.data.jobs || res.data.data || res.data || [];
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("JOBS LOAD ERROR:", err.response?.data || err.message);
      setJobs([]);
    }
  };

  useEffect(() => {
    loadJobs();
    setJobAlertEnabled(localStorage.getItem("jobAlertEnabled") === "true");
  }, []);

  const createJobAlert = () => {
    localStorage.setItem("jobAlertEnabled", "true");
    localStorage.setItem("lastJobCount", jobs.length);
    setJobAlertEnabled(true);
    alert("✅ Job alert created.");
  };

  const applyJob = async (jobId) => {
    if (!candidateId) {
      goTo("/candidate-login");
      return;
    }

    try {
      await axios.post(`${API_URL}/api/jobs/${jobId}/apply/${candidateId}`);
      alert("Applied successfully");
      loadJobs();
    } catch (err) {
      alert(err.response?.data?.message || "Apply failed");
    }
  };

  const saveJob = async (jobId) => {
    if (!candidateId) {
      goTo("/candidate-login");
      return;
    }

    try {
      await axios.post(`${API_URL}/api/jobs/${jobId}/save/${candidateId}`);
      alert("Job saved successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Save failed");
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const search = searchText.toLowerCase();

    const title = job.title || job.jobTitle || job.role || "";
    const company = job.company || job.companyName || "";
    const location = job.location || job.city || "";
    const jobType = job.workMode || job.jobType || job.employmentType || "";
    const experience = job.experience || job.experienceLevel || "";
    const salary = job.salary || job.package || "";

    const skillsText = Array.isArray(job.skills)
      ? job.skills.map((s) => (typeof s === "string" ? s : s?.name || "")).join(" ")
      : job.skills || "";

    return (
      (!search ||
        title.toLowerCase().includes(search) ||
        company.toLowerCase().includes(search) ||
        location.toLowerCase().includes(search) ||
        skillsText.toLowerCase().includes(search)) &&
      (!locationFilter || location.toLowerCase().includes(locationFilter.toLowerCase())) &&
      (!experienceFilter || experience.toLowerCase().includes(experienceFilter.toLowerCase())) &&
      (!jobTypeFilter || jobType.toLowerCase().includes(jobTypeFilter.toLowerCase())) &&
      (!salaryFilter || salary.toLowerCase().includes(salaryFilter.toLowerCase()))
    );
  });

  const recommendedJobs = filteredJobs.slice(0, 4);
  const latestJobs = filteredJobs.slice(4, 8);
  const savedJobs = filteredJobs.filter((j) => j.saved || j.isSaved);
  const appliedJobs = filteredJobs.filter((j) => j.applied || j.isApplied);

  const currentSliderJobs =
    activeTab === "Saved"
      ? savedJobs
      : activeTab === "Applied"
      ? appliedJobs
      : recommendedJobs;

  const companies = [
    ...new Set(jobs.map((j) => j.company || j.companyName).filter(Boolean)),
  ]
    .slice(0, 5)
    .map((name) => ({
      name,
      count: jobs.filter((j) => (j.company || j.companyName) === name).length,
    }));

  const renderJobCard = (job, index) => {
    const jobId = job._id || job.id;
    const title = job.title || job.jobTitle || job.role || "Untitled Job";
    const company = job.company || job.companyName || "Company";
    const location = job.location || job.city || "Location";
    const salary = job.salary || job.package || "Salary not disclosed";
    const experience = job.experience || job.experienceLevel || "0-2 Yrs";
    const workMode = job.workMode || job.jobType || job.employmentType || "Full-time";
    const skills = Array.isArray(job.skills) ? job.skills : [];

    return (
      <article className="fj-job-card" key={`${jobId || "job"}-${index}`}>
        <button className="fj-save" onClick={() => saveJob(jobId)}>♡</button>

        <div className="fj-company-logo">{company.charAt(0).toUpperCase()}</div>

        <h3>{title}</h3>
        <p>{company}</p>

        <div className="fj-meta">
          <span>⌖ {location}</span>
          <span>▣ {workMode}</span>
          <span>◷ {experience}</span>
        </div>

        <h4>{salary}</h4>
        <small>{65 + (index % 4) * 7}% match</small>

        <div className="fj-skills">
          {(skills.length ? skills : ["React", "Node.js", "AWS"])
            .slice(0, 3)
            .map((skill, i) => (
              <span key={i}>{typeof skill === "string" ? skill : skill?.name}</span>
            ))}
        </div>

        <button className="fj-apply" onClick={() => applyJob(jobId)}>
          Apply Now →
        </button>
      </article>
    );
  };

  return (
    <>
      <main className="fj-page">
        <CandidatePremiumSidebar
          candidateId={candidateId}
          unreadCount={unreadCount}
          profileStrength={profileStrength}
          goTo={goTo}
        />

        <section className="fj-main">
          <header className="npj-compact-topbar jobs-shared-topbar">
            <div className="npj-compact-search">
              <button type="button" className="search-btn" onClick={handleSearch}>
                ⌕
              </button>

              <input
                value={searchText}
                placeholder="Search jobs, companies, skills..."
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
            </div>

            <div className="npj-compact-userarea">
              <button type="button" onClick={handleNotifications}>
                🔔<b>{jobAlertEnabled ? "✓" : unreadCount}</b>
              </button>

              <button type="button" onClick={handleMessages}>✉</button>

              <div className="profile-dropdown-wrap">
                <div
                  className="npj-compact-user"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <img src={user?.profileImageUrl || "/profile.png"} alt="Candidate" />

                  <div>
                    <b>{user?.name || "VENKATESHA A"}</b>
                    <span>Candidate</span>
                  </div>

                  <small>⌄</small>
                </div>

                {showProfileMenu && (
                  <div className="profile-dropdown-menu">
                    <button onClick={handleProfile}>
                      <span>♙</span> My Profile
                    </button>

                    <button onClick={() => goTo(candidateId ? `/profile/${candidateId}?edit=true` : "/candidate-login")}>
                      <span>✎</span> Edit Profile
                    </button>

                    <button onClick={() => goTo("/settings")}>
                      <span>⚙</span> Settings
                    </button>

                    <button onClick={() => goTo("/help-center")}>
                      <span>?</span> Help Center
                    </button>

                    <hr />

                    <button
                      className="logout-menu-btn"
                      onClick={() => {
                        localStorage.clear();
                        goTo("/candidate-login");
                      }}
                    >
                      <span>↳</span> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <section className="fj-title">
            <div>
              <h1>Find Jobs</h1>
              <p>Discover roles that match your skills and preferences</p>
            </div>

            <button onClick={loadJobs}>Refresh jobs ↻</button>
          </section>

          <section className="fj-filter">
            <div>
              <span>⌕</span>
              <input
                value={searchText}
                placeholder="Search job title, skills or company"
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
              <option value="">Location</option>
              <option value="bangalore">Bangalore</option>
              <option value="hyderabad">Hyderabad</option>
              <option value="chennai">Chennai</option>
              <option value="remote">Remote</option>
            </select>

            <select value={experienceFilter} onChange={(e) => setExperienceFilter(e.target.value)}>
              <option value="">Experience</option>
              <option value="0">0 Years</option>
              <option value="1">1 Year</option>
              <option value="2">2 Years</option>
            </select>

            <select value={jobTypeFilter} onChange={(e) => setJobTypeFilter(e.target.value)}>
              <option value="">Job Type</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="full">Full-time</option>
            </select>

            <select value={salaryFilter} onChange={(e) => setSalaryFilter(e.target.value)}>
              <option value="">Salary</option>
              <option value="5">5 LPA+</option>
              <option value="10">10 LPA+</option>
            </select>

            <button
              onClick={() => {
                setSearchText("");
                setLocationFilter("");
                setExperienceFilter("");
                setJobTypeFilter("");
                setSalaryFilter("");
              }}
            >
              Reset
            </button>
          </section>

          <section className="fj-content">
            <section className="fj-left">
              <div className="fj-tabs">
                {[
                  ["All Jobs", filteredJobs.length],
                  ["Recommended", recommendedJobs.length],
                  ["Top Match", recommendedJobs.length],
                  ["Saved", savedJobs.length],
                  ["Applied", appliedJobs.length],
                ].map((tab) => (
                  <button
                    key={tab[0]}
                    className={activeTab === tab[0] ? "active" : ""}
                    onClick={() => setActiveTab(tab[0])}
                  >
                    {tab[0]} <b>{tab[1]}</b>
                  </button>
                ))}

                <select>
                  <option>Sort by: Most Recent</option>
                  <option>Sort by: Salary</option>
                  <option>Sort by: Match</option>
                </select>
              </div>

              <div className="fj-section-head">
                <h3>Recommended for you</h3>
                <button>View all</button>
              </div>

              <div className="fj-auto-scroll" ref={sliderRef}>
                <div className="fj-scroll-track">
                  {currentSliderJobs.length > 0 ? (
                    [...currentSliderJobs, ...currentSliderJobs, ...currentSliderJobs].map(renderJobCard)
                  ) : (
                    <div className="empty-premium-box">No recommended jobs found.</div>
                  )}
                </div>
              </div>

              <div className="fj-section-head">
                <h3>Latest Jobs</h3>
                <button>View all</button>
              </div>

              <div className="fj-horizontal">
                {latestJobs.length > 0 ? (
                  latestJobs.map(renderJobCard)
                ) : (
                  <div className="empty-premium-box">No jobs found.</div>
                )}
              </div>
            </section>

            <aside className="fj-right">
              <div className="fj-side-card">
                <h3>🔔 Job Alerts</h3>
                <p>Get notified about new jobs that match your preferences.</p>
                <button onClick={createJobAlert}>
                  {jobAlertEnabled ? "Alert Active ✓" : "Create Alert"}
                </button>
              </div>

              <div className="fj-side-card">
                <div className="fj-side-head">
                  <h3>Top Companies</h3>
                  <button onClick={() => goTo("/companies")}>View all</button>
                </div>

                {companies.map((company) => (
                  <div className="fj-company-line" key={company.name}>
                    <span>{company.name.charAt(0).toUpperCase()}</span>
                    <div>
                      <b>{company.name}</b>
                      <p>{company.count} open jobs</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="fj-side-card">
                <div className="fj-side-head">
                  <h3>Salary Insights</h3>
                  <button onClick={() => goTo("/services")}>View all</button>
                </div>

                <p>Average salary based on available jobs.</p>
                <h2>₹ 8.5 LPA</h2>
                <small>Market estimate</small>
              </div>
            </aside>
          </section>
        </section>
      </main>

      <PremiumFooter />
    </>
  );
}


function ServicesPage() {
  const scrollRef = useRef(null);
  const [search, setSearch] = useState("");

  const goTo = (path) => {
    window.location.href = path;
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const candidateId = user?.candidateId || user?._id || user?.id || "";

  const dashboardPath = candidateId
    ? `/dashboard/${candidateId}`
    : "/dashboard";

  const profilePath = candidateId
    ? `/profile/${candidateId}`
    : "/profile";

  const dashboardData = {
    name: user?.name || user?.fullName || "VENKATESHA A",
    aiMatchScore: user?.aiMatchScore || 90,
    applications: user?.applicationsCount || 0,
    interviews: user?.interviewsCount || 0,
    profileStrength: user?.profileStrength || 90,
    autoApply: user?.autoApplyCount || 0,
    recentActivity: user?.recentActivity || [
      "Recruiter viewed your profile",
      "Profile strength improved",
      "New jobs matched your skills",
    ],
  };

  const stats = [
    ["👥", dashboardData.applications, "Applications"],
    ["☑️", "7", "Live Jobs"],
    ["🏢", "6", "Hiring Companies"],
    ["⭐", `${dashboardData.profileStrength}%`, "Profile Strength"],
    ["☀️", "28", "Career Alerts"],
  ];

  const features = [
    {
      title: "Skill Intelligence",
      img: "/images/skill-intelligence.png",
      route: "/skill-assessment",
    },
    {
      title: "Auto Apply Engine",
      img: "/images/auto-apply.png",
      route: "/auto-apply",
    },
    {
      title: "Instant Job Alerts",
      img: "/images/job-alerts.png",
      route: "/job-alerts",
    },
    {
      title: "Hidden Opportunities",
      img: "/images/hidden-opportunities.png",
      route: "/jobs?type=hidden",
    },
    {
      title: "AI Match Score",
      img: "/images/match.png",
      route: "/jobs?sort=match",
    },
    {
      title: "Resume Studio",
      img: "/images/resume-studio.png",
      route: "/resume-studio",
    },
    {
      title: "AI Interview Prep",
      img: "/images/interview.png",
      route: "/ai-interview-prep",
    },
  ];

  useEffect(() => {
    const slider = scrollRef.current;
    if (!slider) return;

    let timer;

    const startAutoScroll = () => {
      timer = setInterval(() => {
        const isEnd =
          slider.scrollLeft >= slider.scrollWidth - slider.clientWidth - 10;

        slider.scrollTo({
          left: isEnd ? 0 : slider.scrollLeft + 380,
          behavior: "smooth",
        });
      }, 2600);
    };

    const stopAutoScroll = () => clearInterval(timer);

    startAutoScroll();

    slider.addEventListener("mouseenter", stopAutoScroll);
    slider.addEventListener("mouseleave", startAutoScroll);

    return () => {
      clearInterval(timer);
      slider.removeEventListener("mouseenter", stopAutoScroll);
      slider.removeEventListener("mouseleave", startAutoScroll);
    };
  }, []);

  const scrollFeatures = (dir) => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -380 : 380,
      behavior: "smooth",
    });
  };

  const searchNow = (e) => {
    if (e.key !== "Enter") return;

    const q = search.trim();

    if (!q) {
      goTo("/jobs");
      return;
    }

    const lower = q.toLowerCase();

    if (
      lower.includes("company") ||
      lower.includes("tcs") ||
      lower.includes("infosys") ||
      lower.includes("wipro") ||
      lower.includes("google") ||
      lower.includes("microsoft") ||
      lower.includes("amazon")
    ) {
      goTo(`/companies?search=${encodeURIComponent(q)}`);
      return;
    }

    if (lower.includes("resume")) {
      goTo("/resume-studio");
      return;
    }

    if (lower.includes("interview")) {
      goTo("/ai-interview-prep");
      return;
    }

    if (lower.includes("salary")) {
      goTo("/salary-predictor");
      return;
    }

    if (lower.includes("skill")) {
      goTo("/skill-assessment");
      return;
    }

    if (lower.includes("auto apply")) {
      goTo("/auto-apply");
      return;
    }

    goTo(`/jobs?search=${encodeURIComponent(q)}`);
  };

  return (
    <div className="services-page-v2">
      <header className="services-top-header">
        <img
          src="/logo.png"
          alt="NoPromptJobs"
          className="services-logo"
          onClick={() => goTo(dashboardPath)}
        />

        <input
          className="services-search-box"
          placeholder="🔍 Search jobs, companies, skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={searchNow}
        />

        <nav>
          <button onClick={() => goTo(dashboardPath)}>Dashboard</button>
          <button onClick={() => goTo("/jobs")}>Jobs</button>
          <button onClick={() => goTo("/companies")}>Companies</button>
          <button className="active" onClick={() => goTo("/services")}>
            Services
          </button>
          <button onClick={() => goTo("/notifications")}>
            Notifications <b>3</b>
          </button>
        </nav>

        <div className="services-profile-chip" onClick={() => goTo(profilePath)}>
          <span>V</span>
          <strong>{dashboardData.name}</strong>
          <small>⌄</small>
        </div>
      </header>

      <section className="services-hero-v2">
        <div className="hero-left-content">
          <span className="ai-badge">⚡ AI-POWERED CAREER INTELLIGENCE</span>

          <h1>
            Your <b>AI Co-Pilot</b> For <br />
            Smarter Job Search & <b>Career Growth</b>
          </h1>

          <p>
            Apply smarter, get noticed earlier, and land your dream role faster
            with the power of AI.
          </p>

          <div className="hero-btns">
            <button onClick={() => goTo("/ultimate-dashboard")}>
              👑 Ultimate Dashboard
            </button>

            <button
              className="ghost"
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Explore All Features →
            </button>
          </div>

          <div className="hero-checks">
            <span>✅ AI-Powered</span>
            <span>✅ Verified & Trusted</span>
            <span>✅ Privacy First</span>
            <span>✅ Secure & Reliable</span>
          </div>
        </div>

        <div className="services-dashboard-preview-card">
          <aside className="preview-side">
            <div className="preview-logo" onClick={() => goTo(dashboardPath)}>
              N
            </div>
            <button onClick={() => goTo(dashboardPath)}>Overview</button>
            <span onClick={() => goTo("/applications")}>Applications</span>
            <span onClick={() => goTo("/auto-apply")}>Auto Apply</span>
            <span onClick={() => goTo("/job-alerts")}>Alerts</span>
            <span onClick={() => goTo("/resume-studio")}>Resume</span>
            <span onClick={() => goTo("/ai-interview-prep")}>
              Interview Prep
            </span>
          </aside>

          <main className="preview-main">
            <div className="preview-head">
              <div>
                <h2>Welcome back, {dashboardData.name}! 👋</h2>
                <p>Smart career overview</p>
              </div>
              <b>♡ Verified</b>
            </div>

            <div className="preview-grid">
              <div>
                <p>AI Match Score</p>
                <h1>{dashboardData.aiMatchScore}</h1>
                <b>Excellent Match</b>
              </div>

              <div>
                <p>Applications</p>
                <div className="mini-two">
                  <section>
                    <h1>{dashboardData.applications}</h1>
                    <small>Applied</small>
                  </section>
                  <section>
                    <h1>{dashboardData.interviews}</h1>
                    <small>Interviewing</small>
                  </section>
                </div>
              </div>

              <div>
                <p>Profile Strength</p>
                <h1>{dashboardData.profileStrength}%</h1>
                <b>Strong</b>
              </div>

              <div>
                <p>Auto Apply</p>
                <h1>{dashboardData.autoApply}</h1>
                <b>Applied</b>
              </div>

              <div className="activity-box">
                <p>Recent Activity</p>
                {dashboardData.recentActivity.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          </main>
        </div>
      </section>

      <section className="services-stats-card">
        {stats.map((s) => (
          <div key={s[2]}>
            <span>{s[0]}</span>
            <h2>{s[1]}</h2>
            <p>{s[2]}</p>
          </div>
        ))}
      </section>

      <section className="services-title">
        <span>POWERFUL FEATURES</span>
        <h2>
          Everything NoPromptPro has,
          <br />
          plus your own AI trust layer
        </h2>
        <p>
          Powerful tools to automate, analyze and accelerate your career journey.
        </p>
      </section>

      <section id="features" className="feature-scroll-area">
        <button
          className="feature-arrow left"
          onClick={() => scrollFeatures("left")}
        >
          ←
        </button>

        <div className="services-feature-scroll" ref={scrollRef}>
          {features.map((f) => (
            <div className="service-feature-card" key={f.title}>
              <img
                src={f.img}
                alt={f.title}
                onError={(e) => {
                  e.currentTarget.src = "/images/resume-studio.png";
                }}
              />
              <h3>{f.title}</h3>
              <button onClick={() => goTo(f.route)}>Explore →</button>
            </div>
          ))}
        </div>

        <button
          className="feature-arrow right"
          onClick={() => scrollFeatures("right")}
        >
          →
        </button>
      </section>

      <section className="trust-passport-row">
        <div className="trust-dark-card">
          <h2>Candidate Trust Passport</h2>
          <p>
            Your verified identity and professional credibility that opens doors
            to better opportunities.
          </p>
          <button onClick={() => goTo("/trust-passport")}>
            Explore Trust Passport →
          </button>
        </div>

        <div className="trust-dark-card checks">
          <span>✅ Identity Verified</span>
          <span>✅ Resume Verified</span>
          <span>✅ Skill Certifications</span>
          <span>✅ LinkedIn Verification</span>
          <span>✅ Resume Tested</span>
          <span>✅ Real User Videos</span>
          <span>✅ Status Verification</span>
          <span>✅ Strong Role Intent</span>
        </div>
      </section>

      <section className="pricing-section">
        <div className="price-card">
          <h3>Basic</h3>
          <h2>₹0</h2>
          <p>For basic job seekers</p>
          <span>✓ Basic profile</span>
          <span>✓ Job alerts</span>
          <span>✓ Basic resume upload</span>
          <button onClick={() => goTo("/candidate-email-verify")}>
            Get Started
          </button>
        </div>

        <div className="price-card popular">
          <small>Most Popular</small>
          <h3>Pro</h3>
          <h2>₹899/month</h2>
          <p>For serious job seekers</p>
          <span>✓ Auto Apply</span>
          <span>✓ Job Alerts</span>
          <span>✓ AI Resume Studio</span>
          <span>✓ Trust Passport</span>
          <span>✓ Interview Practice</span>
          <span>✓ Salary Predictor</span>
          <button onClick={() => goTo("/payment/pro")}>Start Pro →</button>
        </div>

        <div className="price-card">
          <h3>Ultimate</h3>
          <h2>₹1999/month</h2>
          <p>For career accelerators</p>
          <span>✓ Everything in Pro</span>
          <span>✓ Priority recruiter visibility</span>
          <span>✓ AI Career Coach</span>
          <span>✓ Advanced insights</span>
          <button onClick={() => goTo("/ultimate-dashboard")}>
            👑 Ultimate Dashboard
          </button>
        </div>

        <div className="price-card dark">
          <h3>Ready to accelerate your career?</h3>
          <p>Use premium AI tools based on your real profile and live job data.</p>
          <button onClick={() => goTo("/ultimate-dashboard")}>
            👑 Ultimate Dashboard
          </button>
          <span>✅ Real-time career insights</span>
          <span>✅ Live job intelligence</span>
          <span>✅ Premium career tools</span>
        </div>
      </section>

      <footer className="services-footer-v2">
        <div>
          <img
            src="/logo.png"
            alt="NoPromptJobs"
            onClick={() => goTo(dashboardPath)}
          />
          <p>
            AI-powered platform to help you find better jobs, build skills and
            grow your career.
          </p>
        </div>

        <div>
          <h4>Platform</h4>
          <button onClick={() => goTo(dashboardPath)}>Dashboard</button>
          <button onClick={() => goTo("/jobs")}>Jobs</button>
          <button onClick={() => goTo("/companies")}>Companies</button>
          <button onClick={() => goTo("/services")}>Services</button>
        </div>

        <div>
          <h4>Tools</h4>
          <button onClick={() => goTo("/resume-studio")}>
            AI Resume Studio
          </button>
          <button onClick={() => goTo("/ai-interview-prep")}>
            Interview Prep
          </button>
          <button onClick={() => goTo("/skill-assessment")}>
            Skill Assessment
          </button>
          <button onClick={() => goTo("/salary-predictor")}>
            Salary Predictor
          </button>
        </div>

        <div>
          <h4>Company</h4>
          <button onClick={() => goTo("/about")}>About Us</button>
          <button onClick={() => goTo("/careers")}>Careers</button>
          <button onClick={() => goTo("/blog")}>Blog</button>
          <button onClick={() => goTo("/contact")}>Contact Us</button>
        </div>

        <div>
          <h4>Connect With Us</h4>
          <div className="footer-socials">
            <button onClick={() => window.open("https://facebook.com", "_blank")}>
              f
            </button>
            <button onClick={() => window.open("https://linkedin.com", "_blank")}>
              in
            </button>
            <button onClick={() => window.open("https://twitter.com", "_blank")}>
              x
            </button>
            <button onClick={() => window.open("https://instagram.com", "_blank")}>
              ig
            </button>
            <button onClick={() => window.open("https://youtube.com", "_blank")}>
              ▶
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const candidateId = user?.candidateId || user?._id || user?.id || "";

  const profileStrength =
    Number(user?.profileStrength) ||
    Number(localStorage.getItem("profileStrength")) ||
    90;

  const goTo = (path) => {
    window.location.href = path;
  };

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadNotifications = async () => {
    if (!candidateId) {
      goTo("/candidate-login");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.get(
        `${API_URL}/api/notifications/candidate/${candidateId}`,
        { headers: authHeaders() }
      );

      const data =
        res.data.notifications ||
        res.data.items ||
        res.data.data ||
        res.data ||
        [];

      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("NOTIFICATION LOAD ERROR:", err.response?.data || err.message);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [candidateId]);

  const unreadCount = notifications.filter((n) => !n.read && !n.isRead).length;

  const markAllAsRead = async () => {
    try {
      await axios.put(
        `${API_URL}/api/notifications/candidate/${candidateId}/read-all`,
        {},
        { headers: authHeaders() }
      );

      loadNotifications();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to mark all as read");
    }
  };

  const getType = (item) =>
    item.type || item.category || item.notificationType || "System";

  const filteredNotifications =
    activeTab === "All"
      ? notifications
      : activeTab === "Unread"
      ? notifications.filter((n) => !n.read && !n.isRead)
      : notifications.filter((n) =>
          getType(n).toLowerCase().includes(activeTab.toLowerCase())
        );

  const getIcon = (item) => {
    const type = getType(item).toLowerCase();

    if (type.includes("recruiter")) return "👁";
    if (type.includes("job")) return "💼";
    if (type.includes("application")) return "✉";
    if (type.includes("interview")) return "📅";
    if (type.includes("profile")) return "⭐";

    return "🔔";
  };

  const getColor = (item) => {
    const type = getType(item).toLowerCase();

    if (type.includes("recruiter")) return "purple";
    if (type.includes("job")) return "green";
    if (type.includes("application")) return "blue";
    if (type.includes("interview")) return "orange";
    if (type.includes("profile")) return "violet";

    return "sky";
  };

  const getTitle = (item) =>
    item.title || item.heading || item.subject || "Notification";

  const getText = (item) =>
    item.message || item.text || item.description || "You have a new update.";

  const getTime = (item) => {
    const date = item.createdAt || item.updatedAt || item.time;

    if (!date) return "Recently";

    return new Date(date).toLocaleString();
  };

  return (
    <>
      <main className="notifications-saas-page">
        <CandidatePremiumSidebar
          candidateId={candidateId}
          unreadCount={unreadCount}
          profileStrength={profileStrength}
          goTo={goTo}
        />

        <section className="notifications-saas-main">
          <header className="npj-compact-topbar">
            <div className="npj-compact-search">
              <button type="button" className="search-btn">⌕</button>
              <input placeholder="Search jobs, companies, skills..." />
            </div>

            <div className="npj-compact-userarea">
              <button type="button" onClick={() => goTo("/notifications")}>
                🔔{unreadCount > 0 && <b>{unreadCount}</b>}
              </button>

              <button type="button" onClick={() => goTo("/notifications")}>
                ✉
              </button>

              <div className="profile-dropdown-wrap">
                <div
                  className="npj-compact-user"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <img src={user?.profileImageUrl || "/profile.png"} alt="Candidate" />

                  <div>
                    <b>{user?.name || "VENKATESHA A"}</b>
                    <span>Candidate</span>
                  </div>

                  <small>⌄</small>
                </div>

                {showProfileMenu && (
                  <div className="profile-dropdown-menu">
                    <button onClick={() => goTo(`/profile/${candidateId}`)}>
                      <span>♙</span> My Profile
                    </button>

                    <button onClick={() => goTo(`/profile/${candidateId}?edit=true`)}>
                      <span>✎</span> Edit Profile
                    </button>

                    <button onClick={() => goTo("/candidate-settings")}>
                      <span>⚙</span> Settings
                    </button>

                    <button onClick={() => goTo("/help-center")}>
                      <span>?</span> Help Center
                    </button>

                    <hr />

                    <button
                      className="logout-menu-btn"
                      onClick={() => {
                        localStorage.clear();
                        goTo("/candidate-login");
                      }}
                    >
                      <span>↳</span> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <section className="notifications-layout">
            <section className="notifications-left">
              <section className="notifications-hero">
                <div>
                  <span>🔔 Notification Center</span>
                  <h1>Notifications</h1>
                  <p>
                    Stay updated with recruiter actions, job alerts, profile
                    updates and interview reminders.
                  </p>
                </div>

                <div className="notification-bell-art">
                  <div className="bell-glow"></div>
                  <div className="bell-main">🔔</div>
                  <b>{unreadCount}</b>
                </div>
              </section>

              <section className="notification-tabs">
                {[
                  ["All", notifications.length],
                  ["Unread", unreadCount],
                  ["Job", notifications.filter((n) => getType(n).toLowerCase().includes("job")).length],
                  ["Application", notifications.filter((n) => getType(n).toLowerCase().includes("application")).length],
                  ["Interview", notifications.filter((n) => getType(n).toLowerCase().includes("interview")).length],
                  ["Recruiter", notifications.filter((n) => getType(n).toLowerCase().includes("recruiter")).length],
                ].map((tab) => (
                  <button
                    className={activeTab === tab[0] ? "active" : ""}
                    key={tab[0]}
                    onClick={() => setActiveTab(tab[0])}
                  >
                    {tab[0]} <b>{tab[1]}</b>
                  </button>
                ))}

                <button className="mark-read" onClick={markAllAsRead}>
                  ✓ Mark all as read
                </button>

                <button className="filter-btn" onClick={loadNotifications}>
                  ↻ Refresh
                </button>
              </section>

              <section className="notification-list-premium">
                {loading ? (
                  <div className="empty-premium-box">Loading notifications...</div>
                ) : filteredNotifications.length > 0 ? (
                  filteredNotifications.map((item, index) => {
                    const isUnread = !item.read && !item.isRead;

                    return (
                      <article
                        className={`notification-row-premium ${
                          isUnread ? "unread" : ""
                        }`}
                        key={item._id || index}
                      >
                        <div className={`notification-icon ${getColor(item)}`}>
                          {getIcon(item)}
                        </div>

                        <section>
                          <h3>
                            {getTitle(item)}
                            {isUnread && <span>New</span>}
                          </h3>

                          <p>{getText(item)}</p>

                          <em>{getType(item)}</em>
                        </section>

                        <aside>
                          <time>{getTime(item)}</time>
                          {isUnread && <i></i>}
                        </aside>
                      </article>
                    );
                  })
                ) : (
                  <div className="empty-premium-box">
                    No notifications found.
                  </div>
                )}
              </section>
            </section>

            <aside className="notifications-right">
              <div className="notification-summary-card">
                <h3>Notification Summary</h3>

                <div>
                  <article>
                    <span>🔔</span>
                    <b>{unreadCount}</b>
                    <p>Unread</p>
                  </article>

                  <article>
                    <span>👁</span>
                    <b>{notifications.length}</b>
                    <p>This Week</p>
                  </article>

                  <article>
                    <span>✅</span>
                    <b>{notifications.length}</b>
                    <p>Total</p>
                  </article>

                  <article>
                    <span>🎯</span>
                    <b>{user?.profileViews || 0}</b>
                    <p>Profile Views</p>
                  </article>
                </div>
              </div>

              <div className="notification-settings-card">
                <h3>⚙ Notification Settings</h3>

                {[
                  ["Recruiter Activity", "Get notified when recruiters view your profile"],
                  ["Job Alerts", "Receive alerts for new job matches"],
                  ["Application Updates", "Get updates on application status"],
                  ["Interview Reminders", "Get reminders for scheduled interviews"],
                ].map((item) => (
                  <div className="notification-toggle-row" key={item[0]}>
                    <section>
                      <b>{item[0]}</b>
                      <p>{item[1]}</p>
                    </section>
                    <span></span>
                  </div>
                ))}

                <button onClick={() => goTo("/candidate-settings")}>
                  Manage all notification preferences →
                </button>
              </div>
            </aside>
          </section>
        </section>
      </main>

      <PremiumFooter />
    </>
  );
}

function TrustPassportPage() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const candidateId = user?.candidateId || user?._id || user?.id;

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [trustResult, setTrustResult] = useState(null);

  useEffect(() => {
    const loadCandidate = async () => {
      if (!candidateId) return;

      try {
        const res = await axios.get(`${API_URL}/api/candidates/${candidateId}`);
        setCandidate(res.data.candidate || res.data.data || res.data);
      } catch (err) {
        console.log(err.response?.data || err.message);
      }
    };

    loadCandidate();
  }, [candidateId]);

  const calculateLocalScore = () => {
    let score = 30;

    if (candidate?.resumeUrl) score += 15;
    if (candidate?.profileImageUrl) score += 10;
    if (candidate?.selfIntroVideoUrl) score += 15;
    if (candidate?.projectVideoUrl) score += 15;
    if (candidate?.skills?.length) score += 10;
    if (candidate?.profileSummary) score += 5;

    return Math.min(score, 100);
  };

  const analyzeTrustPassport = async () => {
    if (!candidate) {
      alert("Candidate profile not found");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_URL}/api/ai/trust-passport`, {
        candidate,
        localScore: calculateLocalScore(),
      });

      setTrustResult(res.data);
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("AI Trust Passport analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const score = trustResult?.trustScore || calculateLocalScore();

  return (
    <main className="trust-passport-page">
      <aside className="trust-passport-sidebar">
        <img src="/logo.png" alt="NoPromptJobs" />

        <h2>Trust Passport</h2>
        <p>AI verified candidate credibility</p>

        <button onClick={() => (window.location.href = "/ultimate-dashboard")}>
          ← Back to Ultimate
        </button>
      </aside>

      <section className="trust-passport-main">
        <section className="trust-passport-hero">
          <span>🛡 AI TRUST PASSPORT</span>

          <h1>Candidate credibility score based on real profile signals</h1>

          <p>
            AI checks resume, profile, skills, project proof, self-intro video
            and verification signals to calculate recruiter confidence.
          </p>
        </section>

        <section className="trust-score-grid">
          <div className="trust-score-card">
            <h2>Trust Score</h2>

            <div className="trust-score-circle">{score}%</div>

            <p>
              {score >= 85
                ? "Excellent recruiter confidence"
                : score >= 70
                ? "Good profile credibility"
                : "Profile needs improvement"}
            </p>

            <button onClick={analyzeTrustPassport} disabled={loading}>
              {loading ? "AI is analyzing..." : "Analyze Trust Passport →"}
            </button>
          </div>

          <div className="trust-check-card">
            <h2>Verification Signals</h2>

            <div className="trust-check-row">
              <span>Resume</span>
              <b>{candidate?.resumeUrl ? "✅ Added" : "❌ Missing"}</b>
            </div>

            <div className="trust-check-row">
              <span>Profile Image</span>
              <b>{candidate?.profileImageUrl ? "✅ Added" : "❌ Missing"}</b>
            </div>

            <div className="trust-check-row">
              <span>Self Intro Video</span>
              <b>{candidate?.selfIntroVideoUrl ? "✅ Added" : "❌ Missing"}</b>
            </div>

            <div className="trust-check-row">
              <span>Project Proof Video</span>
              <b>{candidate?.projectVideoUrl ? "✅ Added" : "❌ Missing"}</b>
            </div>

            <div className="trust-check-row">
              <span>Skills</span>
              <b>{candidate?.skills?.length ? "✅ Added" : "❌ Missing"}</b>
            </div>

            <div className="trust-check-row">
              <span>Profile Summary</span>
              <b>{candidate?.profileSummary ? "✅ Added" : "❌ Missing"}</b>
            </div>
          </div>
        </section>

        <section className="trust-ai-output">
          <h2>AI Recruiter Confidence Report</h2>

          {trustResult?.analysis ? (
            <pre>{trustResult.analysis}</pre>
          ) : (
            <div className="trust-empty-box">
              AI trust analysis will appear here.
            </div>
          )}
        </section>

        <PremiumFooter />
      </section>
    </main>
  );
}
function StaticInfoPage({ page }) {
  return (
    <>
      <Navbar />

      <main className="npj-static-page">
        <section className="npj-static-hero">
          <span>{page.badge}</span>
          <h1>{page.title}</h1>
          <p>{page.subtitle}</p>
        </section>

        <section className="npj-static-layout">
          <aside className="npj-static-sidebar">
            <h3>Company Pages</h3>

            <a href="/about">About Us</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms</a>
            <a href="/cookies">Cookie Policy</a>
            <a href="/refund">Refund Policy</a>
            <a href="/trust-safety">Trust & Safety</a>
            <a href="/faq">FAQ</a>
            <a href="/contact">Contact</a>
          </aside>

          <section className="npj-static-content">
            {page.sections.map((section, index) => (
              <article className="npj-static-card" key={index}>
                <h2>{section.title}</h2>

                {section.text && <p>{section.text}</p>}

                {section.list && (
                  <ul>
                    {section.list.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}

            <div className="npj-static-note">
              <b>Note:</b> This is a business-ready draft. For final legal
              compliance, please review with a legal professional.
            </div>
          </section>
        </section>
      </main>

      <PremiumFooter />
    </>
  );
}

function LegalCenterPage({ page }) {
  return (
    <>
      <Navbar />

      <main className="legal-center-page">
        <section className="legal-hero">
          <span>{page.badge}</span>
          <h1>{page.title}</h1>
          <p>{page.subtitle}</p>
        </section>

        <section className="legal-layout">
          <aside className="legal-sidebar">
            <h3>Legal Center</h3>
            <a href="/about">About Us</a>
            <a href="/terms">Terms & Conditions</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/refund">Refund Policy</a>
            <a href="/cookies">Cookie Policy</a>
            <a href="/candidate-terms">Candidate Terms</a>
            <a href="/employer-terms">Employer Terms</a>
            <a href="/ai-policy">AI Usage Policy</a>
            <a href="/trust-safety">Trust & Safety</a>
            <a href="/acceptable-use">Acceptable Use</a>
            <a href="/grievance">Grievance</a>
            <a href="/contact">Contact</a>
          </aside>

          <section className="legal-content">
            {page.sections.map((section, index) => (
              <article className="legal-card" key={index}>
                <h2>{section.title}</h2>

                {section.text && <p>{section.text}</p>}

                {section.list && (
                  <ul>
                    {section.list.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}

            <div className="legal-warning">
              <b>Legal Review Required:</b> This is an original business draft
              for NoPromptJobs. Before publishing, review with a qualified legal
              professional.
            </div>
          </section>
        </section>
      </main>

      <PremiumFooter />
    </>
  );
}

function getLegalPageData(path) {
  const pages = {
    "/about": {
      badge: "About NoPromptJobs",
      title: "Verified Hiring. Genuine Careers.",
      subtitle:
        "NoPromptJobs is an AI-powered hiring platform operated by Vatsenix Software Pvt Ltd.",
      sections: [
        {
          title: "Who We Are",
          text:
            "Vatsenix Software Pvt Ltd builds technology products for recruitment, career growth, verification and business automation. NoPromptJobs is our recruitment platform created for genuine candidates and trusted employers.",
        },
        {
          title: "Our Mission",
          text:
            "Our mission is to reduce fake profiles, proxy interviews and low-trust hiring by helping candidates prove their credibility and helping recruiters discover genuine talent.",
        },
        {
          title: "What NoPromptJobs Provides",
          list: [
            "Verified Candidate Trust Passport",
            "AI Interview Practice",
            "ATS Resume Studio",
            "Salary Predictor",
            "Hidden Job Opportunities",
            "Question Bank for interviews",
            "Skill Assessment and Career Tools",
            "Recruiter dashboard for verified hiring",
          ],
        },
      ],
    },

    "/terms": {
      badge: "Terms & Conditions",
      title: "Terms and Conditions",
      subtitle:
        "These terms govern your use of NoPromptJobs, a product of Vatsenix Software Pvt Ltd.",
      sections: [
        {
          title: "Purpose of the Platform",
          text:
            "NoPromptJobs is intended to support genuine job search, career development, candidate verification, recruiter discovery and trusted hiring workflows.",
        },
        {
          title: "Account Responsibility",
          list: [
            "You must provide accurate information.",
            "You are responsible for your login credentials.",
            "You must not create fake profiles or fake recruiter accounts.",
            "You must keep your profile, resume and company details updated.",
          ],
        },
        {
          title: "Candidate Responsibilities",
          list: [
            "Do not upload fake resumes or false experience.",
            "Do not use proxy interview methods.",
            "Do not misrepresent your skills, identity or employment history.",
            "Use AI tools for learning and preparation, not dishonest representation.",
          ],
        },
        {
          title: "Recruiter Responsibilities",
          list: [
            "Post only genuine job opportunities.",
            "Do not misuse candidate data.",
            "Do not charge candidates illegal processing fees.",
            "Use candidate information only for hiring purposes.",
          ],
        },
        {
          title: "No Employment Guarantee",
          text:
            "NoPromptJobs may improve job discovery, profile visibility and preparation, but we do not guarantee job offers, interview calls, salary outcomes or hiring decisions.",
        },
        {
          title: "Subscriptions and Payments",
          text:
            "Premium services may require payment. Pricing, features and availability may change. Payments are handled by third-party payment providers.",
        },
        {
          title: "Suspension or Termination",
          text:
            "We may suspend or terminate accounts involved in fake profiles, fraud, misuse, scraping, spam, harassment or violation of these terms.",
        },
      ],
    },

    "/privacy": {
      badge: "Privacy Policy",
      title: "Privacy Policy",
      subtitle:
        "This policy explains how we collect, use, store and protect information on NoPromptJobs.",
      sections: [
        {
          title: "Information We Collect",
          list: [
            "Name, email, mobile number and login details",
            "Resume, skills, experience, education and profile information",
            "Profile photo, self-introduction video and project proof",
            "Job applications, saved jobs and interview activity",
            "Recruiter actions, shortlists and communication records",
            "Device, browser, IP and usage analytics",
            "Payment and subscription status",
          ],
        },
        {
          title: "How We Use Information",
          list: [
            "To create and manage user accounts",
            "To match candidates with jobs and recruiters",
            "To power Trust Passport and profile quality signals",
            "To provide resume, interview, salary and career tools",
            "To send alerts, notifications and service updates",
            "To prevent fraud, fake profiles and misuse",
          ],
        },
        {
          title: "Sharing With Recruiters",
          text:
            "Candidate profile information may be shared with recruiters when a candidate applies to a job, is shortlisted, or chooses to make their profile discoverable.",
        },
        {
          title: "Third-Party Services",
          text:
            "We may use service providers for hosting, analytics, email delivery, payment processing, authentication and security. These providers process data only for platform operations.",
        },
        {
          title: "Your Choices",
          list: [
            "Update your profile information.",
            "Control profile visibility where settings are available.",
            "Request account deletion.",
            "Opt out of non-essential communications.",
          ],
        },
      ],
    },

    "/refund": {
      badge: "Refund Policy",
      title: "Refund and Cancellation Policy",
      subtitle:
        "This policy explains how refunds and cancellations work for paid NoPromptJobs services.",
      sections: [
        {
          title: "Digital Services",
          text:
            "NoPromptJobs premium plans provide digital tools such as AI interview practice, resume tools, salary insights, job alerts and career features.",
        },
        {
          title: "Refund Eligibility",
          list: [
            "Duplicate payment may be reviewed for refund.",
            "Payment failure with no service activation may be reviewed.",
            "Technical issues may be reviewed case by case.",
            "Used or activated digital services are generally non-refundable.",
          ],
        },
        {
          title: "Cancellation",
          text:
            "If recurring plans are introduced, users may cancel future renewals where subscription management is available.",
        },
        {
          title: "Billing Support",
          text: "For payment help, contact hello@vatsenix.com.",
        },
      ],
    },

    "/cookies": {
      badge: "Cookie Policy",
      title: "Cookie Policy",
      subtitle:
        "This policy explains how cookies and similar technologies may be used.",
      sections: [
        {
          title: "Use of Cookies",
          text:
            "Cookies help us maintain login sessions, improve platform performance, remember preferences and understand product usage.",
        },
        {
          title: "Cookie Types",
          list: [
            "Essential cookies for login and security",
            "Analytics cookies for performance improvement",
            "Preference cookies for saved settings",
            "Marketing cookies where applicable",
          ],
        },
        {
          title: "Managing Cookies",
          text:
            "You can manage cookies in your browser settings. Some features may not work properly if essential cookies are disabled.",
        },
      ],
    },

    "/candidate-terms": {
      badge: "Candidate Terms",
      title: "Candidate Terms",
      subtitle:
        "These terms apply to candidates using NoPromptJobs career tools.",
      sections: [
        {
          title: "Genuine Profile Requirement",
          list: [
            "Your name, experience, skills and resume must be truthful.",
            "You must not upload another person's resume as your own.",
            "You must not claim fake employment history.",
            "You must not misuse AI to misrepresent your abilities.",
          ],
        },
        {
          title: "Trust Passport",
          text:
            "Trust Passport is a profile credibility feature. It is not a government identity certificate and does not guarantee employment.",
        },
        {
          title: "AI Interview Practice",
          text:
            "AI interview practice is for learning and preparation. Feedback, scores and suggestions are informational and may not reflect actual employer decisions.",
        },
      ],
    },

    "/employer-terms": {
      badge: "Employer Terms",
      title: "Employer and Recruiter Terms",
      subtitle:
        "These terms apply to companies, recruiters and hiring teams.",
      sections: [
        {
          title: "Genuine Hiring Requirement",
          list: [
            "Post only real job openings.",
            "Do not post misleading compensation, role or company information.",
            "Do not collect money from candidates unlawfully.",
            "Do not use NoPromptJobs for spam or mass scraping.",
          ],
        },
        {
          title: "Candidate Data Usage",
          text:
            "Recruiters may use candidate information only for legitimate hiring activities and must protect candidate data from unauthorized access or misuse.",
        },
        {
          title: "Company Responsibility",
          text:
            "Employers are responsible for verifying their own job descriptions, hiring decisions, interview process and employment offers.",
        },
      ],
    },

    "/ai-policy": {
      badge: "AI Usage Policy",
      title: "AI Usage Policy",
      subtitle:
        "This policy explains how AI features should be used on NoPromptJobs.",
      sections: [
        {
          title: "AI Features",
          list: [
            "AI Interview Practice",
            "ATS Resume Studio",
            "Salary Predictor",
            "Skill Gap Analyzer",
            "AI Match Score",
            "Career Roadmap Suggestions",
          ],
        },
        {
          title: "AI Output Limitations",
          text:
            "AI-generated suggestions are informational and may contain errors. Users should review, edit and verify all AI-generated content before relying on it.",
        },
        {
          title: "Prohibited AI Misuse",
          list: [
            "Generating fake experience",
            "Creating misleading resumes",
            "Impersonating another person",
            "Using AI to deceive recruiters",
          ],
        },
      ],
    },

    "/trust-safety": {
      badge: "Trust & Safety",
      title: "Trust and Safety Policy",
      subtitle:
        "NoPromptJobs is designed to create safer and more genuine hiring workflows.",
      sections: [
        {
          title: "Prohibited Conduct",
          list: [
            "Fake candidate profiles",
            "Proxy interviews",
            "Fake job postings",
            "Harassment or abusive communication",
            "Spam, scraping or automated misuse",
            "Uploading harmful or illegal content",
          ],
        },
        {
          title: "Security Checks",
          text:
            "We may use automated and manual checks to detect suspicious activity, fake profiles, unusual login behavior and misuse.",
        },
        {
          title: "Action We May Take",
          list: [
            "Limit feature access",
            "Remove content",
            "Suspend or terminate accounts",
            "Request additional verification",
            "Report unlawful activity where required",
          ],
        },
      ],
    },

    "/acceptable-use": {
      badge: "Acceptable Use",
      title: "Acceptable Use Policy",
      subtitle:
        "This policy explains what users can and cannot do on NoPromptJobs.",
      sections: [
        {
          title: "You Must Not",
          list: [
            "Scrape, crawl or copy platform data without permission",
            "Reverse engineer or attack platform systems",
            "Upload viruses or harmful code",
            "Send spam or unsolicited bulk messages",
            "Post abusive, obscene, defamatory or unlawful content",
            "Misuse candidate or recruiter information",
          ],
        },
      ],
    },

    "/grievance": {
      badge: "Grievance Redressal",
      title: "Grievance Redressal Policy",
      subtitle:
        "Users may contact us for complaints, privacy concerns, account issues or policy violations.",
      sections: [
        {
          title: "How to Contact Us",
          text:
            "Send your concern to hello@vatsenix.com with your registered email address, issue details, screenshots if available and relevant account information.",
        },
        {
          title: "Types of Complaints",
          list: [
            "Fake job posting",
            "Fake candidate profile",
            "Payment or subscription issue",
            "Privacy or data request",
            "Harassment or misuse",
            "Technical account issue",
          ],
        },
      ],
    },

    "/contact": {
      badge: "Contact",
      title: "Contact Vatsenix Software Pvt Ltd",
      subtitle:
        "Reach us for product, support, hiring or business enquiries.",
      sections: [
        {
          title: "Email",
          text: "hello@vatsenix.com",
        },
        {
          title: "Location",
          text: "Hyderabad, Telangana, India",
        },
        {
          title: "Product",
          text: "NoPromptJobs.com",
        },
      ],
    },
  };

  return pages[path];
}
function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const candidateId =
    user?.candidateId ||
    user?._id ||
    user?.id ||
    "";

  const unreadCount =
    Number(user?.unreadMessages) ||
    Number(localStorage.getItem("unreadMessages")) ||
    6;

  const profileStrength =
    Number(user?.profileStrength) ||
    Number(localStorage.getItem("profileStrength")) ||
    90;

  const goTo = (path) => {
    window.location.href = path;
  };

  const loadSavedJobs = async () => {
    if (!candidateId) {
      goTo("/candidate-login");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.get(
        `${API_URL}/api/candidates/${candidateId}/saved-jobs`
      );

      const data =
        res.data.savedJobs ||
        res.data.jobs ||
        res.data.data ||
        res.data ||
        [];

      setSavedJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("SAVED JOBS LOAD ERROR:", err.response?.data || err.message);
      setSavedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const applyJob = async (jobId) => {
    if (!candidateId) return goTo("/candidate-login");

    try {
      await axios.post(`${API_URL}/api/jobs/${jobId}/apply/${candidateId}`);
      alert("Applied successfully");
      loadSavedJobs();
    } catch (err) {
      alert(err.response?.data?.message || "Apply failed");
    }
  };

  const removeSavedJob = async (jobId) => {
    try {
      await axios.delete(
        `${API_URL}/api/candidates/${candidateId}/saved-jobs/${jobId}`
      );

      loadSavedJobs();
    } catch (err) {
      alert(err.response?.data?.message || "Remove saved job failed");
    }
  };

  useEffect(() => {
    loadSavedJobs();
  }, []);

  return (
  <>
    <main className="saved-jobs-page">
      <CandidatePremiumSidebar
        candidateId={candidateId}
        unreadCount={unreadCount}
        profileStrength={profileStrength}
        goTo={goTo}
      />

      <section className="saved-jobs-main">
        <header className="npj-compact-topbar">
          <div className="npj-compact-search">
            <button type="button" className="search-btn">⌕</button>
            <input placeholder="Search saved jobs, companies, skills..." />
          </div>

          <div className="npj-compact-userarea">
            <button type="button">🔔<b>{unreadCount}</b></button>
            <button type="button">✉</button>

            <div
              className="npj-compact-user"
              onClick={() =>
                goTo(candidateId ? `/profile/${candidateId}` : "/candidate-login")
              }
            >
              <img src={user?.profileImageUrl || "/profile.png"} alt="Candidate" />
              <div>
                <b>{user?.name || "VENKATESHA A"}</b>
                <span>Candidate</span>
              </div>
              <small>⌄</small>
            </div>
          </div>
        </header>

        <section className="saved-hero saved-hero-premium">
          <div className="saved-hero-text">
            <span>💾 Saved Opportunities</span>
            <h1>Jobs you saved for later</h1>
            <p>
              Save interesting roles before applying. Review them anytime and
              apply when you are ready.
            </p>
          </div>

          <div className="saved-hero-art">
            <div className="saved-paper-plane">✈</div>
            <div className="saved-clipboard">💜</div>
            <div className="saved-folder">🗂</div>
            <div className="saved-spark s1">✦</div>
            <div className="saved-spark s2">✧</div>
            <div className="saved-spark s3">✦</div>
          </div>

          <button onClick={() => goTo("/jobs")}>Find More Jobs →</button>
        </section>

        <section className="saved-stats saved-stats-premium">
          <article>
            <div className="saved-stat-icon purple">💜</div>
            <section>
              <b>{savedJobs.length}</b>
              <p>Saved Jobs</p>
            </section>
            <em></em>
          </article>

          <article>
            <div className="saved-stat-icon orange">⚡</div>
            <section>
              <b>{savedJobs.length}</b>
              <p>Apply Later</p>
            </section>
            <em></em>
          </article>

          <article>
            <div className="saved-stat-icon green">🛡</div>
            <section>
              <b>Verified</b>
              <p>Trusted Roles</p>
            </section>
            <em></em>
          </article>
        </section>

        {loading ? (
          <div className="empty-premium-box">Loading saved jobs...</div>
        ) : savedJobs.length > 0 ? (
          <section className="saved-jobs-grid">
            {savedJobs.map((job, index) => {
              const realJob = job.job || job;
              const jobId = realJob._id || realJob.id || job.jobId;

              const title =
                realJob.title ||
                realJob.jobTitle ||
                realJob.role ||
                "Untitled Job";

              const company =
                realJob.company ||
                realJob.companyName ||
                "Company";

              const location =
                realJob.location ||
                realJob.city ||
                "Location not added";

              const salary =
                realJob.salary ||
                realJob.package ||
                "Salary not disclosed";

              return (
                <article className="saved-job-card" key={jobId || index}>
                  <div className="saved-job-top">
                    <div>{company.charAt(0).toUpperCase()}</div>
                    <span>{88 + (index % 8)}% Match</span>
                  </div>

                  <h3>{title}</h3>
                  <p>{company}</p>

                  <div className="saved-job-meta">
                    <span>📍 {location}</span>
                    <span>💰 {salary}</span>
                    <span>⚡ {realJob.workMode || "Full-time"}</span>
                  </div>

                  <div className="saved-job-actions">
                    <button onClick={() => applyJob(jobId)}>Apply Now →</button>
                    <button onClick={() => removeSavedJob(jobId)}>
                      Remove
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <section className="saved-empty saved-empty-premium">
            <div className="saved-empty-art">
              <div className="empty-box">💜</div>
              <div className="empty-doc d1">📄</div>
              <div className="empty-doc d2">📄</div>
              <div className="empty-heart h1">♥</div>
              <div className="empty-heart h2">♥</div>
            </div>

            <div>
              <h2>No saved jobs yet</h2>
              <p>
                When you find an interesting job, click the heart/save button.
                It will appear here before you apply.
              </p>
              <button onClick={() => goTo("/jobs")}>Browse Jobs →</button>
            </div>
          </section>
        )}
      </section>
    </main>

    <PremiumFooter />
  </>
);
}

function App() {
  const path = window.location.pathname;

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) document.body.className = savedTheme;
  }, []);

  const withChat = (page) => (
    <>
      {page}
      <HelpChatWidget />
    </>
  );

  if (path === "/terms") {
    return withChat(<PremiumTermsPage />);
  }

  if (path === "/privacy") {
    return withChat(<PrivacyPolicy />);
  }

  if (path === "/contact") {
    return withChat(<PremiumContactPage />);
  }

  const legalPage = getLegalPageData(path);

  if (legalPage) {
    return withChat(<LegalCenterPage page={legalPage} />);
  }

  if (path === "/") return <LandingPage />;
  if (path === "/login") return <LandingPage />;
  if (path === "/register") return <LandingPage />;

  if (path === "/candidate-login") return <CandidateLogin />;
  if (path === "/candidate-email-verify") return <CandidateEmailVerify />;
  if (path === "/candidate-set-password") return <CandidateSetPassword />;
  if (path === "/candidate-forgot-password") return <CandidateForgotPassword />;
  if (path === "/forgot-password") return <CandidateForgotPassword />;
  if (path === "/candidate-register") return <CandidateRegister />;
  if (path === "/candidate") return <CandidateUpload />;

  if (path === "/mobile-dashboard") return <MobileCandidateDashboard />;

  if (
    path === "/profile" ||
    path.startsWith("/profile/") ||
    path === "/candidate-profile" ||
    path.startsWith("/candidate-profile/")
  ) {
    return <CandidateProfilePage />;
  }

  if (path.startsWith("/dashboard/")) return withChat(<CandidateDashboard />);

  if (path === "/companies") return <CompaniesPage />;

  if (path === "/jobs") return <JobsPage />;
  if (path.startsWith("/jobs/")) return <JobDetailsPage />;

  if (path === "/services") return <ServicesPage />;
  if (path === "/applications") return <ApplicationsPage />;
  if (path === "/notifications") return <NotificationsPage />;
  if (path === "/job-alerts") return <JobAlertsPage />;
  if (path === "/interview-alerts") return <InterviewAlertsPage />;

  if (path === "/resume-studio") {
    return (
      <UltimateDashboard>
        <ResumeStudio />
      </UltimateDashboard>
    );
  }

  if (path === "/skill-analyzer") return <SkillAnalyzerPage />;
  if (path === "/trust-passport") return <TrustPassportPage />;
  if (path === "/hidden-opportunities") return <HiddenOpportunitiesPage />;
  if (path === "/ai-interview-prep") return <AIInterviewPrepPage />;
  if (path === "/salary-predictor") return <SalaryPredictorPage />;
  if (path === "/career-roadmap") return <CareerRoadmapPage />;

  if (path === "/settings") return withChat(<CandidateSettings />);
  if (path === "/candidate-settings") return withChat(<CandidateSettings />);
  if (path === "/saved-jobs") return <SavedJobsPage />;

  if (path === "/recruiter-login") return <RecruiterLogin />;
  if (path === "/recruiter-register") return <RecruiterRegister />;
  if (path === "/recruiter-dashboard") return <RecruiterDashboard />;
  if (path === "/recruiter-post-job") return <RecruiterPostJobPage />;
  if (path === "/recruiter-search") return <RecruiterTalentSearch />;
  if (path === "/recruiter-shortlisted") return <RecruiterShortlistedPage />;
  if (path === "/recruiter-applications") return <RecruiterApplicationsPage />;
  if (path === "/recruiter-reports") return <RecruiterReportsPage />;
  if (path === "/recruiter-profile") return <RecruiterProfilePage />;
  if (path === "/company-profile") return <CompanyProfilePage />;
  if (path === "/recruiter-settings") return <RecruiterSettingsPage />;
  if (path === "/recruiter-notifications") return <RecruiterNotificationsPage />;

  if (path.startsWith("/recruiter-candidate-profile/")) {
    return <RecruiterCandidateProfile />;
  }

  if (path.startsWith("/recruiter-job-details/")) {
    return <RecruiterJobDetailsPage />;
  }

  if (path === "/recruiter-ai-assistant") return <RecruiterAIAssistantPage />;
  if (path === "/recruiter-interviews") return <RecruiterInterviewStagesPage />;
  if (path === "/recruiter-screening") return <RecruiterScreeningPage />;
  if (path === "/recruiter-team") return <RecruiterTeamPage />;
  if (path === "/recruiter-billing") return <RecruiterBillingPage />;

  if (path === "/ultimate-dashboard") return <UltimateDashboard />;

  return <LandingPage />;
}

function Navbar({
  searchText = "",
  setSearchText = () => {},
  handleSearch = () => {},
}) {
  const [showMenu, setShowMenu] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const path = window.location.pathname;

  const recruiterPages = [
    "/recruiter-dashboard",
    "/recruiter-post-job",
    "/recruiter-search",
    "/recruiter-shortlisted",
    "/recruiter-applications",
    "/recruiter-reports",
    "/recruiter-profile",
    "/company-profile",
    "/recruiter-settings",
    "/recruiter-notifications",
    "/recruiter-ai-assistant",
    "/recruiter-interviews",
    "/recruiter-screening",
    "/recruiter-team",
    "/recruiter-billing",
  ];

  const isRecruiterPage =
    recruiterPages.includes(path) ||
    path.startsWith("/recruiter-candidate-profile/") ||
    path.startsWith("/recruiter-job-details/");

  const dashboardIdFromUrl = path.startsWith("/dashboard/")
    ? path.split("/").pop()
    : null;

  const candidateId =
    user?.candidateId || user?._id || user?.id || dashboardIdFromUrl;

  const candidateDashboardLink = candidateId
    ? `/dashboard/${candidateId}`
    : "/candidate-login";

  const goDashboard = (e) => {
    if (e) e.preventDefault();

    if (candidateId) {
      window.location.href = `/dashboard/${candidateId}`;
    } else {
      window.location.href = "/candidate-login";
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };
  const goProfile = () => {
    if (candidateId) {
      window.location.href = `/profile/${candidateId}`;
    } else if (isRecruiterPage) {
      window.location.href = "/recruiter-profile";
    } else {
      window.location.href = "/candidate-login";
    }
  };

if (user?.role === "recruiter") {
  return (
    <header className="premium-header recruiter-premium-header">
      <a
        href="/recruiter-dashboard"
        className="premium-logo"
        onClick={() => (window.location.href = "/recruiter-dashboard")}
      >
        <img src="/logo.png" alt="NoPrompt Jobs" />
      </a>

      <nav className="premium-nav recruiter-premium-nav">
        <a href="/recruiter-dashboard" className="active">▦ Dashboard</a>
        <a href="/recruiter-post-job">💼 Post Job</a>
        <a href="/recruiter-search">🔎 Search</a>
        <a href="/recruiter-shortlisted">⭐ Shortlisted</a>
        <a href="/recruiter-applications">📄 Applications</a>
        <a href="/recruiter-reports">📊 Reports</a>
      </nav>

      <div className="premium-profile-wrap">
        <button
          type="button"
          className="premium-bell"
          onClick={() => (window.location.href = "/recruiter-notifications")}
        >
          🔔 <span>5</span>
        </button>

        <button
          type="button"
          className="premium-profile"
          onClick={() => setShowMenu(!showMenu)}
        >
          <span className="avatar-circle">
            {user?.name?.charAt(0)?.toUpperCase() ||
              user?.email?.charAt(0)?.toUpperCase() ||
              "R"}
          </span>

          <span className="premium-user-text">
            {user?.name || "Recruiter"}
            <small>{user?.company || "Tech Solutions Inc."}</small>
          </span>

          <b>⌄</b>
        </button>

        {showMenu && (
          <div className="profile-dropdown premium-dropdown">
            <button onClick={() => (window.location.href = "/recruiter-profile")}>
              👤 Recruiter Profile
            </button>
            <button onClick={() => (window.location.href = "/company-profile")}>
              🏢 Company Profile
            </button>
            <button onClick={() => (window.location.href = "/recruiter-settings")}>
              ⚙️ Settings
            </button>
            <button className="logout-btn" onClick={logout}>
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
return (
  <header className="candidate-pro-header">
    <a href={candidateDashboardLink} className="candidate-pro-logo" onClick={goDashboard}>
      <img src="/logo.png" alt="NoPrompt Jobs" />
    </a>

    <div className="candidate-pro-search">
      <span>🔍</span>
      <input
        placeholder="Search jobs, companies..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      />
    </div>

    <nav className="candidate-pro-nav">
      <a className="active" href={candidateDashboardLink} onClick={goDashboard}>Dashboard</a>
      <a href="/jobs">Jobs</a>
      <a href="/companies">Companies</a>
      <a href="/services">Services</a>
      <a href="/notifications">Notifications <b>3</b></a>
    </nav>

    <div className="candidate-pro-profile-wrap">
      <button
        type="button"
        className="candidate-pro-profile"
        onClick={() => setShowMenu(!showMenu)}
      >
        <span>
          {user?.name?.charAt(0)?.toUpperCase() ||
            user?.email?.charAt(0)?.toUpperCase() ||
            "V"}
        </span>

        <strong>{user?.name || "VENKATESHA A"}</strong>
        <small>⌄</small>
      </button>

      {showMenu && (
        <div className="profile-dropdown premium-dropdown">
          <button type="button" onClick={goDashboard}>🏠 Dashboard</button>
          <button type="button" onClick={goProfile}>👤 View Profile</button>
          <button type="button" onClick={goProfile}>✏️ Modify Profile</button>
          <button type="button" onClick={() => (window.location.href = "/services")}>
            🚀 NoPromptJobs Pro
          </button>
          <button type="button" onClick={() => (window.location.href = "/candidate-settings")}>
            ⚙️ Settings
          </button>
          <button type="button" className="logout-btn" onClick={logout}>
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  </header>
);}
function CandidateUpload() {
  const [form, setForm] = useState({
    name: "",
    email: localStorage.getItem("candidateSignupEmail") || "",
    phone: "",
    location: "",

    profileHeadline: "",
    profileSummary: "",
    selfIntro: "",

    currentRole: "",
    currentCompany: "",
    experienceYears: "",
    experienceMonths: "",

    currentSalary: "",
    expectedSalary: "",
    noticePeriod: "",
    preferredLocation: "",
    workMode: "",
    jobType: "",
    employmentType: "",

    gender: "",
    dateOfBirth: "",
    maritalStatus: "",
    address: "",

    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",

    projectTitle: "",
    projectDomain: "",
    projectTools: "",
    projectExplanation: "",
    projectLink: "",
  });

  const [skills, setSkills] = useState([
    { name: "", rating: "", years: "", lastUsed: "" },
  ]);

  const [employment, setEmployment] = useState([
    {
      jobTitle: "",
      company: "",
      employmentType: "",
      startDate: "",
      endDate: "",
      currentlyWorking: true,
      description: "",
      noticePeriod: "",
    },
  ]);

  const [education, setEducation] = useState([
    {
      degree: "",
      specialization: "",
      college: "",
      startYear: "",
      endYear: "",
      educationType: "",
    },
  ]);

  const [projects, setProjects] = useState([
    {
      title: "",
      domain: "",
      tools: "",
      description: "",
      link: "",
    },
  ]);

  const [languages, setLanguages] = useState("");
  const [certifications, setCertifications] = useState("");

  const [files, setFiles] = useState({
    profileImage: null,
    resume: null,
    selfIntroVideo: null,
    projectVideo: null,
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const updateArray = (setter, array, index, e) => {
    const updated = [...array];

    updated[index][e.target.name] =
      e.target.value;

    setter(updated);
  };

  const handleFileChange = (e) => {
    setFiles({
      ...files,
      [e.target.name]: e.target.files[0],
    });
  };

  const submitForm = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter your name");
      return;
    }

    if (!form.email.trim() && !form.phone.trim()) {
      alert("Please enter email or mobile number");
      return;
    }

    const data = new FormData();

    Object.keys(form).forEach((key) => {
      data.append(key, form[key]);
    });

    data.append("skills", JSON.stringify(skills));
    data.append("employment", JSON.stringify(employment));
    data.append("education", JSON.stringify(education));
    data.append("projects", JSON.stringify(projects));

    data.append(
      "languages",
      JSON.stringify(
        languages
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean)
      )
    );

    data.append(
      "certifications",
      JSON.stringify(
        certifications
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean)
      )
    );

    Object.keys(files).forEach((key) => {
      if (files[key]) {
        data.append(key, files[key]);
      }
    });

    try {
      const res = await axios.post(
        `${API_URL}/api/candidates`,
        data
      );

      const candidate = res.data.candidate || res.data.data || res.data;

      localStorage.setItem(
        "user",
        JSON.stringify({
          name: candidate.name || form.name,
          email: candidate.email || form.email,
          role: "candidate",
          candidateId: candidate._id,
        })
      );

      localStorage.removeItem("candidateSignupEmail");
      localStorage.removeItem("candidateOtpVerified");
      localStorage.removeItem("candidatePasswordSet");

      alert("Candidate profile created successfully");

      window.location.href =
        `/dashboard/${candidate._id}`;

    } catch (err) {
      console.log(err.response?.data || err.message);

      alert(
        err.response?.data?.error ||
        "Upload failed"
      );
    }
  };
  return (
    <>
      <Navbar />

      <div className="page-shell">
        <aside className="sidebar">
                    <img
            src="/logo.png"
            alt="NoProxiesJobs"
            className="sidebar-logo"
          />

          <h3>NoProxiesJobs Profile</h3>
          <a>Basic Details</a>
          <a>Skills</a>
          <a>Employment</a>
          <a>Education</a>
          <a>Projects</a>
          <a>Resume & Videos</a>
        </aside>

        <main className="content">
          <section className="hero-box">
            <h1>Create Your Talent Profile</h1>
            <p>
              Build a recruiter-ready profile with resume, skills, projects,
              GitHub, videos and career details.
            </p>
          </section>

          <form className="form-card grid" onSubmit={submitForm}>
            <h2 className="full">Basic Details</h2>

            <input name="name" placeholder="Full Name" onChange={handleChange} />
            <input
              name="email"
              placeholder="Email"
              value={form.email}
              readOnly
            />
            <input name="phone" placeholder="Phone" onChange={handleChange} />
            <input name="location" placeholder="Current Location" onChange={handleChange} />

            <input name="profileHeadline" placeholder="Resume Headline" onChange={handleChange} />
            <input name="currentRole" placeholder="Current Role" onChange={handleChange} />
            <input name="currentCompany" placeholder="Current Company" onChange={handleChange} />
            <input name="experienceYears" type="number" placeholder="Experience Years" onChange={handleChange} />
            <input name="experienceMonths" type="number" placeholder="Experience Months" onChange={handleChange} />

            <textarea
              name="profileSummary"
              className="full"
              placeholder="Profile Summary"
              onChange={handleChange}
            />

            <textarea
              name="selfIntro"
              className="full"
              placeholder="Self Introduction"
              onChange={handleChange}
            />

            <h2 className="full">Career Preferences</h2>

            <input name="currentSalary" placeholder="Current Salary" onChange={handleChange} />
            <input name="expectedSalary" placeholder="Expected Salary" onChange={handleChange} />
            <input name="noticePeriod" placeholder="Notice Period" onChange={handleChange} />
            <input name="preferredLocation" placeholder="Preferred Location" onChange={handleChange} />
            <input name="workMode" placeholder="Remote / Hybrid / Onsite" onChange={handleChange} />
            <input name="jobType" placeholder="Permanent / Contract" onChange={handleChange} />
            <input name="employmentType" placeholder="Full-time / Part-time" onChange={handleChange} />

            <h2 className="full">Skills</h2>

            <div className="full">
              {skills.map((skill, index) => (
                <div className="row-4" key={index}>
                  <input name="name" placeholder="Skill e.g Python" onChange={(e) => updateArray(setSkills, skills, index, e)} />
                  <input name="rating" type="number" placeholder="Rating / 5" onChange={(e) => updateArray(setSkills, skills, index, e)} />
                  <input name="years" type="number" placeholder="Years" onChange={(e) => updateArray(setSkills, skills, index, e)} />
                  <input name="lastUsed" placeholder="Last Used" onChange={(e) => updateArray(setSkills, skills, index, e)} />
                </div>
              ))}

              <button
                type="button"
                className="small-btn"
                onClick={() =>
                  setSkills([...skills, { name: "", rating: "", years: "", lastUsed: "" }])
                }
              >
                + Add Skill
              </button>
            </div>

            <h2 className="full">Employment</h2>

            <div className="full">
              {employment.map((job, index) => (
                <div className="sub-card" key={index}>
                  <div className="grid">
                    <input name="jobTitle" placeholder="Job Title" onChange={(e) => updateArray(setEmployment, employment, index, e)} />
                    <input name="company" placeholder="Company" onChange={(e) => updateArray(setEmployment, employment, index, e)} />
                    <input name="employmentType" placeholder="Employment Type" onChange={(e) => updateArray(setEmployment, employment, index, e)} />
                    <input name="startDate" placeholder="Start Date" onChange={(e) => updateArray(setEmployment, employment, index, e)} />
                    <input name="endDate" placeholder="End Date / Present" onChange={(e) => updateArray(setEmployment, employment, index, e)} />
                    <input name="noticePeriod" placeholder="Notice Period" onChange={(e) => updateArray(setEmployment, employment, index, e)} />
                    <textarea name="description" className="full" placeholder="Work Description" onChange={(e) => updateArray(setEmployment, employment, index, e)} />
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="small-btn"
                onClick={() =>
                  setEmployment([
                    ...employment,
                    {
                      jobTitle: "",
                      company: "",
                      employmentType: "",
                      startDate: "",
                      endDate: "",
                      currentlyWorking: true,
                      description: "",
                      noticePeriod: "",
                    },
                  ])
                }
              >
                + Add Employment
              </button>
            </div>

            <h2 className="full">Education</h2>

            <div className="full">
              {education.map((edu, index) => (
                <div className="row-3" key={index}>
                  <input name="degree" placeholder="Degree" onChange={(e) => updateArray(setEducation, education, index, e)} />
                  <input name="specialization" placeholder="Specialization" onChange={(e) => updateArray(setEducation, education, index, e)} />
                  <input name="college" placeholder="College" onChange={(e) => updateArray(setEducation, education, index, e)} />
                  <input name="startYear" placeholder="Start Year" onChange={(e) => updateArray(setEducation, education, index, e)} />
                  <input name="endYear" placeholder="End Year" onChange={(e) => updateArray(setEducation, education, index, e)} />
                  <input name="educationType" placeholder="Full-time / Part-time" onChange={(e) => updateArray(setEducation, education, index, e)} />
                </div>
              ))}

              <button
                type="button"
                className="small-btn"
                onClick={() =>
                  setEducation([
                    ...education,
                    {
                      degree: "",
                      specialization: "",
                      college: "",
                      startYear: "",
                      endYear: "",
                      educationType: "",
                    },
                  ])
                }
              >
                + Add Education
              </button>
            </div>

            <h2 className="full">Projects</h2>

            <input name="projectTitle" placeholder="Main Project Title" onChange={handleChange} />
            <input name="projectDomain" placeholder="Domain" onChange={handleChange} />
            <input name="projectTools" placeholder="Tools Used" onChange={handleChange} />
            <input name="projectLink" placeholder="Project / GitHub Link" onChange={handleChange} />
            <textarea name="projectExplanation" className="full" placeholder="Project Explanation" onChange={handleChange} />

            <div className="full">
              {projects.map((project, index) => (
                <div className="sub-card" key={index}>
                  <div className="grid">
                    <input name="title" placeholder="Project Title" onChange={(e) => updateArray(setProjects, projects, index, e)} />
                    <input name="domain" placeholder="Project Domain" onChange={(e) => updateArray(setProjects, projects, index, e)} />
                    <input name="tools" placeholder="Tools" onChange={(e) => updateArray(setProjects, projects, index, e)} />
                    <input name="link" placeholder="Project Link" onChange={(e) => updateArray(setProjects, projects, index, e)} />
                    <textarea name="description" className="full" placeholder="Project Description" onChange={(e) => updateArray(setProjects, projects, index, e)} />
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="small-btn"
                onClick={() =>
                  setProjects([...projects, { title: "", domain: "", tools: "", description: "", link: "" }])
                }
              >
                + Add Project
              </button>
            </div>

            <h2 className="full">Links & Personal Details</h2>

            <input name="githubUrl" placeholder="GitHub URL" onChange={handleChange} />
            <input name="linkedinUrl" placeholder="LinkedIn URL" onChange={handleChange} />
            <input name="portfolioUrl" placeholder="Portfolio URL" onChange={handleChange} />
            <input placeholder="Languages comma separated" onChange={(e) => setLanguages(e.target.value)} />
            <input placeholder="Certifications comma separated" onChange={(e) => setCertifications(e.target.value)} />
            <input name="gender" placeholder="Gender" onChange={handleChange} />
            <input name="dateOfBirth" placeholder="Date of Birth" onChange={handleChange} />
            <input name="maritalStatus" placeholder="Marital Status" onChange={handleChange} />
            <textarea name="address" className="full" placeholder="Address" onChange={handleChange} />

            <h2 className="full">Resume, Photo & Videos</h2>

            <FileInput label="Profile Image" name="profileImage" accept="image/*" onChange={handleFileChange} />
            <FileInput label="Resume" name="resume" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
            <FileInput label="Self Introduction Video" name="selfIntroVideo" accept="video/*" onChange={handleFileChange} />
            <FileInput label="Project Explanation Video" name="projectVideo" accept="video/*" onChange={handleFileChange} />

            <button className="submit-btn full" type="submit">
              Save Candidate Profile
            </button>
          </form>
        </main>
      </div>
    </>
  );
}

function FileInput({ label, name, accept, onChange }) {
  return (
    <div className="file-box">
      <label>{label}</label>
      <input type="file" name={name} accept={accept} onChange={onChange} />
    </div>
  );
}function ProfileSection({
  id,
  title,
  actionText = "Add New",
  onEdit,
  children,
}) {
  return (
    <section className="modern-profile-section" id={id}>
      <div className="section-top">
        <h2>{title}</h2>

        <button
          type="button"
          className="section-edit-btn"
          onClick={onEdit}
        >
          ➕ {actionText}
        </button>
      </div>

      <div className="section-content">
        {children}
      </div>
    </section>
  );
}

// function CandidateProfile() {
//   const [candidate, setCandidate] = useState(null);
//   const [jobs, setJobs] = useState([]);
//   const [searchText, setSearchText] = useState("");

//   const [activity, setActivity] = useState([]);
//   const [interviewAlerts, setInterviewAlerts] = useState([]);

//   const [editOpen, setEditOpen] = useState(false);
//   const [editTitle, setEditTitle] = useState("");
//   const [editIndex, setEditIndex] = useState(null);
//   const [editData, setEditData] = useState({});

//   const id = window.location.pathname.split("/").pop();

//   const loadCandidate = async () => {
//     try {
//       await axios.patch(`${API_URL}/api/candidates/${id}/view`);
//       const res = await axios.get(`${API_URL}/api/candidates/${id}`);
//       setCandidate(res.data.candidate || res.data.data || res.data);
//     } catch (err) {
//       console.log(err.response?.data || err.message);
//     }
//   };

//   useEffect(() => {
//     loadCandidate();
//   }, [id]);

//   if (!candidate) {
//     return <div className="loading">Loading profile...</div>;
//   }

//   const updateCandidate = async (payload) => {
//     const res = await axios.patch(`${API_URL}/api/candidates/${id}`, payload);
//     setCandidate(res.data.candidate || res.data.data || res.data);
//   };

//   const openEdit = (title, data = {}, index = null) => {
//     setEditTitle(title);
//     setEditData(data);
//     setEditIndex(index);
//     setEditOpen(true);
//   };

//   const deleteArrayItem = async (section, index) => {
//     if (!window.confirm("Delete this item?")) return;

//     const updated = [...(candidate[section] || [])];
//     updated.splice(index, 1);

//     await updateCandidate({ [section]: updated });
//   };

//   const saveEdit = async () => {
//     try {
//       let payload = {};

//       if (editTitle === "Basic Info") {
//         payload = editData;
//       }

//       if (editTitle === "Professional Summary") {
//         payload = {
//           profileSummary: editData.profileSummary,
//         };
//       }

//       if (editTitle === "Videos") {
//         const data = new FormData();

//         if (editData.selfIntroVideo) {
//           data.append("selfIntroVideo", editData.selfIntroVideo);
//         }

//         if (editData.projectVideo) {
//           data.append("projectVideo", editData.projectVideo);
//         }

//         const res = await axios.patch(
//           `${API_URL}/api/candidates/${id}/videos`,
//           data
//         );

//         setCandidate(res.data.candidate || res.data.data || res.data);
//         setEditOpen(false);
//         alert("Videos updated successfully");
//         return;
//       }

//       if (editTitle === "Candidate Identity") {
//         payload = {
//           panNumber: editData.panNumber || "",
//           aadhaarLast4: editData.aadhaarLast4 || "",
//           identityStatus: "Pending Verification",
//         };
//       }

//       if (editTitle === "Key Skills") {
//         payload = {
//           skills: editData.skillsText
//             .split(",")
//             .map((skill) => ({
//               name: skill.trim(),
//               years: 0,
//               rating: 0,
//             }))
//             .filter((skill) => skill.name),
//         };
//       }

//       if (editTitle === "Employment") {
//         const updated = [...(candidate.employment || [])];

//         const item = {
//           company: editData.company || "",
//           role: editData.role || "",
//           years: Number(editData.years || 0),
//           months: Number(editData.months || 0),
//         };

//         if (editIndex !== null) {
//           updated[editIndex] = item;
//         } else {
//           updated.push(item);
//         }

//         payload = {
//           employment: updated,
//           currentCompany: item.company,
//           currentRole: item.role,
//           experienceYears: item.years,
//           experienceMonths: item.months,
//         };
//       }

//       if (editTitle === "Education") {
//         const updated = [...(candidate.education || [])];

//         const item = {
//           degree: editData.degree || "",
//           college: editData.college || "",
//           year: editData.year || "",
//         };

//         if (editIndex !== null) {
//           updated[editIndex] = item;
//         } else {
//           updated.push(item);
//         }

//         payload = { education: updated };
//       }

//       if (editTitle === "Projects") {
//         const updated = [...(candidate.projects || [])];

//         const item = {
//           title: editData.title || "",
//           domain: editData.domain || "",
//           tools: editData.tools || "",
//           description: editData.description || "",
//           link: editData.link || "",
//         };

//         if (editIndex !== null) {
//           updated[editIndex] = item;
//         } else {
//           updated.push(item);
//         }

//         payload = { projects: updated };
//       }

//       if (editTitle === "Personal Details") {
//         payload = editData;
//       }

//       await updateCandidate(payload);

//       setEditOpen(false);
//       setEditIndex(null);
//       setEditTitle("");
//       setEditData({});
//       alert("Updated successfully");
//     } catch (err) {
//       console.log(err.response?.data || err.message);
//       alert("Update failed");
//     }
//   };

//   const uploadProfileImage = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const data = new FormData();
//     data.append("profileImage", file);

//     const res = await axios.patch(
//       `${API_URL}/api/candidates/${id}/profile-image`,
//       data
//     );

//     setCandidate(res.data.candidate || res.data.data || res.data);
//   };

//   const uploadResume = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const data = new FormData();
//     data.append("resume", file);

//     const res = await axios.patch(
//       `${API_URL}/api/candidates/${id}/resume`,
//       data
//     );

//     setCandidate(res.data.candidate || res.data.data || res.data);
//   };

//   const score =
//     40 +
//     (candidate.resumeUrl ? 15 : 0) +
//     (candidate.profileImageUrl ? 10 : 0) +
//     (candidate.skills?.length ? 15 : 0) +
//     (candidate.profileSummary ? 10 : 0) +
//     (candidate.selfIntroVideoUrl ? 10 : 0);

//   return (
//     <>
//       <Navbar />

//       <div className="candidate-command-page">
//         <aside className="candidate-command-left">
//           <div className="candidate-glass-card candidate-id-card">
//             <div className="candidate-photo-ring">
//               <label>
//                 {candidate.profileImageUrl ? (
//                   <img src={candidate.profileImageUrl} alt="profile" />
//                 ) : (
//                   <span>{candidate.name?.charAt(0) || "C"}</span>
//                 )}

//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={uploadProfileImage}
//                   hidden
//                 />
//               </label>
//             </div>

//             <h2>{candidate.name}</h2>
//             <p>{candidate.currentRole || "Candidate"}</p>
//             <span className="verified-badge">Verified Candidate</span>

//             <button
//               onClick={() =>
//                 openEdit("Basic Info", {
//                   name: candidate.name || "",
//                   currentRole: candidate.currentRole || "",
//                   currentCompany: candidate.currentCompany || "",
//                   phone: candidate.phone || "",
//                   location: candidate.location || "",
//                   noticePeriod: candidate.noticePeriod || "",
//                 })
//               }
//             >
//               Edit Profile
//             </button>
//           </div>

//           <div className="candidate-glass-card trust-passport">
//             <h3>🛡 Trust Passport</h3>
//             <p><span>Proxy Risk Shield</span><b>Clean</b></p>
//             <p><span>Identity</span><b>Verified</b></p>
//             <p><span>Resume</span><b>{candidate.resumeUrl ? "Added" : "Missing"}</b></p>
//             <p><span>Video Intro</span><b>{candidate.selfIntroVideoUrl ? "Added" : "Missing"}</b></p>
//             <p><span>Project Proof</span><b>92/100</b></p>
//           </div>

//           <div className="candidate-glass-card profile-score-card">
//             <h3>Profile Strength</h3>
//             <h1>{Math.min(score, 100)}%</h1>
//             <div className="score-bar">
//               <span style={{ width: `${Math.min(score, 100)}%` }}></span>
//             </div>
//             <p>Complete missing sections to improve recruiter confidence.</p>
//           </div>
//         </aside>

//         <main className="candidate-command-main">
//           <section className="candidate-premium-hero">
//             <div>
//               <span className="hero-badge">Career Command Center</span>
//               <h1>Welcome back, {candidate.name} 👋</h1>
//               <p>
//                 Build a verified profile, prove your project work, improve trust score
//                 and attract genuine recruiters.
//               </p>

//               <div className="hero-action-row">
//                 <button
//                   onClick={() =>
//                     openEdit("Professional Summary", {
//                       profileSummary: candidate.profileSummary || "",
//                     })
//                   }
//                 >
//                   Improve Summary
//                 </button>

//                 <button onClick={() => document.getElementById("resumeUpload")?.click()}>
//                   Update Resume
//                 </button>
//               </div>
//             </div>

//             <div className="trust-orbit">
//               <h2>{Math.min(score + 10, 100)}</h2>
//               <span>/100</span>
//               <p>Talent Signal</p>
//             </div>
//           </section>

//           <section className="candidate-metrics-row">
//             <div>
//               <span>Search Appearances</span>
//               <h2>{candidate.profileViews || 0}</h2>
//               <p>Recruiter visibility</p>
//             </div>

//             <div>
//               <span>Shortlisted</span>
//               <h2>{candidate.shortlisted ? "Yes" : "No"}</h2>
//               <p>Hiring interest</p>
//             </div>

//             <div>
//               <span>Recruiter Notes</span>
//               <h2>{candidate.recruiterNotes?.length || 0}</h2>
//               <p>Private recruiter actions</p>
//             </div>

//             <div>
//               <span>Resume Score</span>
//               <h2>{Math.min(score, 100)}</h2>
//               <p>Profile quality</p>
//             </div>
//           </section>

//           <ProfileSection
//             id="summary"
//             title="Professional Summary"
//             actionText="Modify Summary"
//             onEdit={() =>
//               openEdit("Professional Summary", {
//                 profileSummary: candidate.profileSummary || "",
//               })
//             }
//           >
//             <p className="premium-text">
//               {candidate.profileSummary ||
//                 "Add a powerful summary explaining your experience, projects, skills and career goal."}
//             </p>
//           </ProfileSection>

//           <ProfileSection
//             id="skills"
//             title="Key Skills"
//             actionText="Add / Modify Skills"
//             onEdit={() =>
//               openEdit("Key Skills", {
//                 skillsText:
//                   candidate.skills
//                     ?.map((s) => (typeof s === "string" ? s : s.name))
//                     .join(", ") || "",
//               })
//             }
//           >
//             <div className="premium-chip-wrap">
//               {Array.isArray(candidate.skills) && candidate.skills.length > 0 ? (
//                 candidate.skills.map((skill, i) => (
//                   <span key={skill?._id || i}>
//                     {typeof skill === "string" ? skill : skill?.name || "Skill"}
//                   </span>
//                 ))
//               ) : (
//                 <p>No skills added</p>
//               )}
//             </div>
//           </ProfileSection>

//           <div className="candidate-two-grid">
//             <ProfileSection
//               id="employment"
//               title="Employment"
//               actionText="Add Employment"
//               onEdit={() =>
//                 openEdit("Employment", {
//                   company: "",
//                   role: "",
//                   years: "",
//                   months: "",
//                 })
//               }
//             >
//               {candidate.employment?.length ? (
//                 candidate.employment.map((emp, i) => (
//                   <div className="premium-item-card" key={i}>
//                     <div>
//                       <h3>{emp.company || "Company not added"}</h3>
//                       <p>{emp.role || "Role not added"}</p>
//                       <small>{emp.years || 0} Years {emp.months || 0} Months</small>
//                     </div>

//                     <div>
//                       <button
//                         onClick={() =>
//                           openEdit(
//                             "Employment",
//                             {
//                               company: emp.company || "",
//                               role: emp.role || "",
//                               years: emp.years || "",
//                               months: emp.months || "",
//                             },
//                             i
//                           )
//                         }
//                       >
//                         Edit
//                       </button>

//                       <button
//                         className="delete-btn"
//                         onClick={() => deleteArrayItem("employment", i)}
//                       >
//                         Delete
//                       </button>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <p>No employment added</p>
//               )}
//             </ProfileSection>

//             <ProfileSection
//               id="education"
//               title="Education"
//               actionText="Add Education"
//               onEdit={() =>
//                 openEdit("Education", {
//                   degree: "",
//                   college: "",
//                   year: "",
//                 })
//               }
//             >
//               {candidate.education?.length ? (
//                 candidate.education.map((edu, i) => (
//                   <div className="premium-item-card" key={i}>
//                     <div>
//                       <h3>{edu.degree || "Degree not added"}</h3>
//                       <p>{edu.college || "College not added"}</p>
//                       <small>{edu.year || "Year not added"}</small>
//                     </div>

//                     <div>
//                       <button
//                         onClick={() =>
//                           openEdit(
//                             "Education",
//                             {
//                               degree: edu.degree || "",
//                               college: edu.college || "",
//                               year: edu.year || "",
//                             },
//                             i
//                           )
//                         }
//                       >
//                         Edit
//                       </button>

//                       <button
//                         className="delete-btn"
//                         onClick={() => deleteArrayItem("education", i)}
//                       >
//                         Delete
//                       </button>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <p>No education added</p>
//               )}
//             </ProfileSection>
//           </div>

//           <ProfileSection
//             id="projects"
//             title="Project Proof"
//             actionText="Add Project"
//             onEdit={() =>
//               openEdit("Projects", {
//                 title: "",
//                 domain: "",
//                 tools: "",
//                 description: "",
//                 link: "",
//               })
//             }
//           >
//             {candidate.projects?.length ? (
//               candidate.projects.map((project, i) => (
//                 <div className="premium-item-card project-proof-card" key={i}>
//                   <div>
//                     <h3>{project.title || "Project not added"}</h3>
//                     <p>{project.description || "No description added"}</p>
//                     <small>{project.tools || "Tools not added"}</small>
//                   </div>

//                   <div>
//                     <button
//                       onClick={() =>
//                         openEdit(
//                           "Projects",
//                           {
//                             title: project.title || "",
//                             domain: project.domain || "",
//                             tools: project.tools || "",
//                             description: project.description || "",
//                             link: project.link || "",
//                           },
//                           i
//                         )
//                       }
//                     >
//                       Edit
//                     </button>

//                     <button
//                       className="delete-btn"
//                       onClick={() => deleteArrayItem("projects", i)}
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <p>No projects added</p>
//             )}
//           </ProfileSection>

//           <div className="candidate-two-grid">
//             <ProfileSection
//               id="resume"
//               title="Resume"
//               actionText={candidate.resumeUrl ? "Update Resume" : "Upload Resume"}
//               onEdit={() => document.getElementById("resumeUpload")?.click()}
//             >
//               {candidate.resumeUrl ? (
//                 <a href={candidate.resumeUrl} target="_blank" rel="noreferrer">
//                   Download Resume
//                 </a>
//               ) : (
//                 <p>No resume uploaded</p>
//               )}

//               <input
//                 id="resumeUpload"
//                 type="file"
//                 accept=".pdf,.doc,.docx"
//                 hidden
//                 onChange={uploadResume}
//               />
//             </ProfileSection>

//             <ProfileSection
//               id="videos"
//               title="Self Intro & Project Videos"
//               actionText="Upload Videos"
//               onEdit={() =>
//                 openEdit("Videos", {
//                   selfIntroVideo: null,
//                   projectVideo: null,
//                 })
//               }
//             >
//               <p>
//                 Self Intro Video:{" "}
//                 <b>{candidate.selfIntroVideoUrl ? "Added" : "Missing"}</b>
//               </p>

//               <p>
//                 Project Explanation Video:{" "}
//                 <b>{candidate.projectVideoUrl ? "Added" : "Missing"}</b>
//               </p>

//               {candidate.selfIntroVideoUrl && (
//                 <video controls width="100%">
//                   <source src={candidate.selfIntroVideoUrl} />
//                 </video>
//               )}

//               {candidate.projectVideoUrl && (
//                 <video controls width="100%">
//                   <source src={candidate.projectVideoUrl} />
//                 </video>
//               )}
//             </ProfileSection>

//             <ProfileSection
//               id="identity"
//               title="Candidate Identity"
//               actionText="Add / Verify Identity"
//               onEdit={() =>
//                 openEdit("Candidate Identity", {
//                   panNumber: candidate.panNumber || "",
//                   aadhaarLast4: candidate.aadhaarLast4 || "",
//                 })
//               }
//             >
//               <p>
//                 PAN:{" "}
//                 <b>
//                   {candidate.panNumber
//                     ? `*****${candidate.panNumber.slice(-4)}`
//                     : "Not added"}
//                 </b>
//               </p>

//               <p>
//                 Aadhaar:{" "}
//                 <b>
//                   {candidate.aadhaarLast4
//                     ? `XXXX XXXX ${candidate.aadhaarLast4}`
//                     : "Not added"}
//                 </b>
//               </p>

//               <p>
//                 Status: <b>{candidate.identityStatus || "Not verified"}</b>
//               </p>
//             </ProfileSection>

//             <ProfileSection
//               id="personal"
//               title="Personal Details"
//               actionText="Modify Details"
//               onEdit={() =>
//                 openEdit("Personal Details", {
//                   gender: candidate.gender || "",
//                   dateOfBirth: candidate.dateOfBirth || "",
//                   maritalStatus: candidate.maritalStatus || "",
//                   address: candidate.address || "",
//                 })
//               }
//             >
//               <p>Gender: {candidate.gender || "Not added"}</p>
//               <p>DOB: {candidate.dateOfBirth || "Not added"}</p>
//               <p>Marital: {candidate.maritalStatus || "Not added"}</p>
//               <p>Address: {candidate.address || "Not added"}</p>
//             </ProfileSection>
//           </div>
//         </main>

//         <aside className="candidate-command-right">
//           <div className="candidate-glass-card">
//             <h3>Recruiter Confidence</h3>
//             <h1>4.7/5</h1>
//             <p>Based on profile proof, skills and activity.</p>
//           </div>

//           <div className="candidate-glass-card">
//             <h3>Missing Boosters</h3>
//             {!candidate.selfIntroVideoUrl && <p>⚠️ Add self intro video</p>}
//             {!candidate.projectVideoUrl && <p>⚠️ Add project explanation video</p>}
//             {!candidate.certifications?.length && <p>⚠️ Add certifications</p>}
//           </div>

//           <div className="candidate-pro-dark">
//             <h3>👑 NoPrompt Pro</h3>
//             <p>Stand out from normal job portals.</p>
//             <ul>
//               <li>Resume Optimization</li>
//               <li>Mock Interview Practice</li>
//               <li>Priority Recruiter Visibility</li>
//               <li>Auto Apply With Consent</li>
//             </ul>
//             <button onClick={() => (window.location.href = "/services")}>
//               Explore Pro
//             </button>
//           </div>
//         </aside>
//       </div>

//       {editOpen && (
//         <div className="modal-overlay">
//           <div className="edit-modal">
//             <h2>
//               {editIndex !== null ? "Edit" : "Add"} {editTitle}
//             </h2>

//             {editTitle === "Videos" ? (
//               <>
//                 <label>Self Introduction Video</label>
//                 <input
//                   type="file"
//                   accept="video/*"
//                   onChange={(e) =>
//                     setEditData({
//                       ...editData,
//                       selfIntroVideo: e.target.files[0],
//                     })
//                   }
//                 />

//                 <label>Project Explanation Video</label>
//                 <input
//                   type="file"
//                   accept="video/*"
//                   onChange={(e) =>
//                     setEditData({
//                       ...editData,
//                       projectVideo: e.target.files[0],
//                     })
//                   }
//                 />
//               </>
//             ) : editTitle === "Professional Summary" ? (
//               <textarea
//                 value={editData.profileSummary || ""}
//                 placeholder="Write professional summary"
//                 onChange={(e) =>
//                   setEditData({
//                     ...editData,
//                     profileSummary: e.target.value,
//                   })
//                 }
//               />
//             ) : (
//               Object.keys(editData).map((key) => (
//                 <input
//                   key={key}
//                   value={editData[key] || ""}
//                   placeholder={key}
//                   onChange={(e) =>
//                     setEditData({
//                       ...editData,
//                       [key]: e.target.value,
//                     })
//                   }
//                 />
//               ))
//             )}

//             <div className="modal-actions">
//               <button onClick={saveEdit}>Save</button>
//               <button onClick={() => setEditOpen(false)}>Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );


function CandidatePremiumSidebar({
  candidateId,
  unreadCount = 0,
  profileStrength = 90,
  goTo,
}) {
  return (
    <aside className="npj-glass-sidebar npj-unified-sidebar">
      <div className="npj-glass-logo-wrap">
        <img src="/logo.png" alt="NoPromptJobs" />
      </div>

      <nav className="npj-glass-menu">
        <p className="npj-menu-label">Overview</p>

        <button onClick={() => goTo(`/dashboard/${candidateId}`)}>
          <span>▦</span>
          <b>Dashboard</b>
        </button>

        <p className="npj-menu-label">Main</p>

        <button onClick={() => goTo("/jobs")}>
          <span>⌕</span>
          <b>Find Jobs</b>
        </button>

        <button onClick={() => goTo("/companies")}>
          <span>▥</span>
          <b>Companies</b>
        </button>

        <button onClick={() => goTo("/applications")}>
          <span>▤</span>
          <b>Applications</b>
        </button>

        <button onClick={() => goTo("/saved-jobs")}>
          <span>♡</span>
          <b>Saved Jobs</b>
        </button>

        <button onClick={() => goTo("/notifications")}>
          <span>✉</span>
          <b>Messages</b>
          {unreadCount > 0 && <em>{unreadCount}</em>}
        </button>

        <p className="npj-menu-label">CARRER Tools</p>

        <button onClick={() => goTo("/services")}>
          <span>◫</span>
          <b>Resume Studio</b>
        </button>

        <button onClick={() => goTo("/services")}>
          <span>◉</span>
          <b>AI Interview Prep</b>
        </button>

        <button onClick={() => goTo("/services")}>
          <span>◎</span>
          <b>Skill Assessment</b>
        </button>

        <button onClick={() => goTo("/services")}>
          <span>◔</span>
          <b>Salary Predictor</b>
        </button>

        <button onClick={() => goTo("/services")}>
          <span>▣</span>
          <b>Trust Passport</b>
          <i>{profileStrength}%</i>
        </button>

        <button onClick={() => goTo("/services")}>
          <span>🔗</span>
          <b>Career Tools</b>
          <small>›</small>
        </button>

        <p className="npj-menu-label">Account</p>

        <button onClick={() => goTo("/settings")}>
          <span>⚙</span>
          <b>Settings</b>
        </button>

        <button
          onClick={() => {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            goTo("/candidate-login");
          }}
        >
          <span>↳</span>
          <b>Logout</b>
        </button>
      </nav>
    </aside>
  );
}
function CandidateDashboard() {
  const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const [candidate, setCandidate] = useState(savedUser || null);
  const [jobs, setJobs] = useState([]);
  const [interviewDrawer, setInterviewDrawer] = useState(false);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const dashboardJobsRef = useRef(null);
  

  const candidateId =
    window.location.pathname.split("/").pop() ||
    savedUser?._id ||
    savedUser?.id ||
    savedUser?.candidateId;

  const goTo = (path) => {
    window.location.href = path;
  };

  const handleSearch = () => {
    const query = searchText.trim();

    if (!query) {
      goTo("/jobs");
      return;
    }

    goTo(`/jobs?search=${encodeURIComponent(query)}`);
  };

  const handleNotifications = () => {
    goTo("/notifications");
  };

  const handleProfileViews = () => {
    goTo(candidateId ? `/profile/${candidateId}/views` : "/candidate-login");
  };

  const handleProfile = () => {
  goTo(candidateId ? `/profile/${candidateId}` : "/candidate-login");
};

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const safeArray = (res, keys = []) => {
    for (const key of keys) {
      if (Array.isArray(res?.data?.[key])) return res.data[key];
    }

    if (Array.isArray(res?.data?.data)) return res.data.data;
    if (Array.isArray(res?.data)) return res.data;

    return [];
  };

  const getCandidateName = () =>
    candidate?.name || savedUser?.name || savedUser?.fullName || "Candidate";

  const getProfileImage = () =>
    candidate?.profileImageUrl ||
    candidate?.photoUrl ||
    candidate?.profilePhoto ||
    savedUser?.profileImageUrl ||
    "/profile.png";

  const calcProfileStrength = (c = {}) => {
    const score =
      30 +
      (c.name ? 5 : 0) +
      (c.email ? 5 : 0) +
      (c.mobile ? 5 : 0) +
      (c.resumeUrl ? 15 : 0) +
      (c.profileImageUrl || c.photoUrl ? 10 : 0) +
      (Array.isArray(c.skills) && c.skills.length ? 15 : 0) +
      (c.profileSummary ? 10 : 0) +
      (c.selfIntroVideoUrl ? 5 : 0);

    return Math.min(score, 100);
  };

  const profileStrength = calcProfileStrength(candidate || {});
  const unreadCount = notifications.filter((n) => !n.read && !n.isRead).length;

  const loadDashboard = async () => {
    if (!candidateId) {
      goTo("/candidate-login");
      return;
    }

    try {
      setLoading(true);

      const [candidateRes, jobsRes, appsRes, notifyRes, interviewRes, savedRes] =
        await Promise.allSettled([
          axios.get(`${API_URL}/api/candidates/${candidateId}`, {
            headers: authHeaders(),
          }),
          axios.get(`${API_URL}/api/jobs`, {
            headers: authHeaders(),
          }),
          axios.get(`${API_URL}/api/applications/candidate/${candidateId}`, {
            headers: authHeaders(),
          }),
          axios.get(`${API_URL}/api/notifications/candidate/${candidateId}`, {
            headers: authHeaders(),
          }),
          axios.get(`${API_URL}/api/candidates/${candidateId}/interviews`, {
            headers: authHeaders(),
          }),
          axios.get(`${API_URL}/api/candidates/${candidateId}/saved-jobs`, {
            headers: authHeaders(),
          }),
        ]);

      if (candidateRes.status === "fulfilled") {
        const data =
          candidateRes.value.data?.candidate ||
          candidateRes.value.data?.data ||
          candidateRes.value.data;

        setCandidate(data);
        localStorage.setItem("user", JSON.stringify(data));
      }

      if (jobsRes.status === "fulfilled") {
        setJobs(safeArray(jobsRes.value, ["jobs", "items", "results"]));
      }

      if (appsRes.status === "fulfilled") {
        setApplications(
          safeArray(appsRes.value, ["applications", "items", "results"])
        );
      } else if (Array.isArray(candidate?.applications)) {
        setApplications(candidate.applications);
      }

      if (notifyRes.status === "fulfilled") {
        setNotifications(
          safeArray(notifyRes.value, ["notifications", "items", "results"])
        );
      }

      if (interviewRes.status === "fulfilled") {
        setInterviews(
          safeArray(interviewRes.value, ["interviews", "items", "results"])
        );
      }

      if (savedRes.status === "fulfilled") {
        setSavedJobs(
          safeArray(savedRes.value, ["savedJobs", "jobs", "items", "results"])
        );
      }
    } catch (err) {
      console.log("DASHBOARD LOAD ERROR:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [candidateId]);

  useEffect(() => {
    const slider = dashboardJobsRef.current;
    if (!slider) return;

    let autoTimer;
    let resumeTimer;
    let isDown = false;
    let startX = 0;
    let startScrollLeft = 0;

    const startAutoScroll = () => {
      clearInterval(autoTimer);

      autoTimer = setInterval(() => {
        if (!slider || isDown) return;

        slider.scrollLeft += 1;

        if (slider.scrollLeft >= slider.scrollWidth / 2) {
          slider.scrollLeft = 0;
        }
      }, 18);
    };

    const stopAutoScroll = () => {
      clearInterval(autoTimer);
      clearTimeout(resumeTimer);
    };

    const resumeAutoScroll = () => {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(startAutoScroll, 1200);
    };

    const handleMouseDown = (e) => {
      isDown = true;
      stopAutoScroll();
      slider.classList.add("dragging");
      startX = e.pageX - slider.offsetLeft;
      startScrollLeft = slider.scrollLeft;
    };

    const handleMouseMove = (e) => {
      if (!isDown) return;

      e.preventDefault();

      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2;

      slider.scrollLeft = startScrollLeft - walk;
    };

    const handleMouseUp = () => {
      if (!isDown) return;

      isDown = false;
      slider.classList.remove("dragging");
      resumeAutoScroll();
    };

    const handleWheel = (e) => {
      e.preventDefault();
      stopAutoScroll();

      slider.scrollLeft += e.deltaY;

      resumeAutoScroll();
    };

    slider.addEventListener("mousedown", handleMouseDown);
    slider.addEventListener("mousemove", handleMouseMove);
    slider.addEventListener("mouseup", handleMouseUp);
    slider.addEventListener("mouseleave", handleMouseUp);
    slider.addEventListener("wheel", handleWheel, { passive: false });

    startAutoScroll();

    return () => {
      clearInterval(autoTimer);
      clearTimeout(resumeTimer);

      slider.removeEventListener("mousedown", handleMouseDown);
      slider.removeEventListener("mousemove", handleMouseMove);
      slider.removeEventListener("mouseup", handleMouseUp);
      slider.removeEventListener("mouseleave", handleMouseUp);
      slider.removeEventListener("wheel", handleWheel);
    };
  }, [jobs, searchText]);

  const applyJob = async (jobId) => {
    if (!candidateId) return goTo("/candidate-login");
    if (!jobId) return alert("Job id missing");

    try {
      setApplyingJobId(jobId);

      await axios.post(
        `${API_URL}/api/jobs/${jobId}/apply/${candidateId}`,
        {},
        { headers: authHeaders() }
      );

      await loadDashboard();
      alert("Applied successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Apply failed");
    } finally {
      setApplyingJobId(null);
    }
  };

  const saveJob = async (jobId) => {
    if (!candidateId) return goTo("/candidate-login");
    if (!jobId) return alert("Job id missing");

    try {
      await axios.post(
        `${API_URL}/api/candidates/${candidateId}/saved-jobs/${jobId}`,
        {},
        { headers: authHeaders() }
      );

      await loadDashboard();
    } catch (err) {
      alert(err.response?.data?.message || "Save job failed");
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const q = searchText.trim().toLowerCase();

    if (!q) return true;

    const skillsText = Array.isArray(job.skills)
      ? job.skills
          .map((s) => (typeof s === "string" ? s : s?.name || ""))
          .join(" ")
      : job.skills || "";

    return [
      job.title,
      job.jobTitle,
      job.role,
      job.company,
      job.companyName,
      job.location,
      job.city,
      job.workMode,
      job.jobType,
      job.employmentType,
      job.description,
      skillsText,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  const appliedCount = applications.length;

  const underReviewCount = applications.filter((a) =>
    `${a.status || ""}`.toLowerCase().includes("review")
  ).length;

  const rejectedCount = applications.filter((a) =>
    `${a.status || ""}`.toLowerCase().includes("reject")
  ).length;

  const offerCount = applications.filter((a) =>
    `${a.status || ""}`.toLowerCase().includes("offer")
  ).length;

  const dashboardJobs = filteredJobs.slice(0, 8);

  const companiesCount = new Set(
    jobs.map((job) => job.company || job.companyName).filter(Boolean)
  ).size;

  const tools = [
    ["📄", "Resume Builder", "Create ATS resume", "/resume-studio"],
    ["💎", "AI Resume Review", "Get AI feedback", "/resume-studio"],
    ["🎯", "Skill Assessment", "Test skills", "/skill-assessment"],
    ["📈", "Salary Predictor", "Know your worth", "/salary-predictor"],
    ["🔔", "Job Alerts", "New jobs", "/notifications"],
  ];

 if (loading) return <div className="loading">Loading Dashboard...</div>;

return (
  <>
    <main className="npj-compact-page">
      <aside className="npj-glass-sidebar">
        <div className="npj-sidebar-bg-orb orb-one"></div>
        <div className="npj-sidebar-bg-orb orb-two"></div>

        <div className="npj-glass-logo-wrap">
          <img src="/logo.png" alt="NoPromptJobs" />
        </div>

        <nav className="npj-glass-menu">
          <p className="npj-menu-label">Overview</p>

          <button className="active" onClick={() => goTo(`/dashboard/${candidateId}`)}>
            <span>▦</span>
            <b>Dashboard</b>
          </button>

          <p className="npj-menu-label">Main</p>

          {[
            ["⌕", "Find Jobs", "/jobs"],
            ["▥", "Companies", "/companies"],
            ["▤", "Applications", "/services"],
            ["♡", "Saved Jobs", "/saved-jobs"],
            ["👁", "Profile Views", candidateId ? `/profile/${candidateId}/views` : "/candidate-login"],
          ].map((item) => (
            <button key={item[1]} onClick={() => goTo(item[2])}>
              <span>{item[0]}</span>
              <b>{item[1]}</b>
              {item[1] === "Profile Views" && (
                <small>›</small>
              )}
            </button>
          ))}

          <p className="npj-menu-label">AI Tools</p>

{[
  ["◫", "Resume Studio"],
  ["◉", "AI Interview Prep"],
  ["◎", "Skill Assessment"],
  ["◔", "Salary Predictor"],
  ["▣", "Trust Passport"],
  ["🔗", "Career Tools"],
].map((item) => (
  <button key={item[1]} onClick={() => goTo("/services")}>
    <span>{item[0]}</span>
    <b>{item[1]}</b>
    {item[1] === "Trust Passport" && <i>{profileStrength}%</i>}
    {item[1] === "Career Tools" && <small>›</small>}
  </button>
))}

          <p className="npj-menu-label">Account</p>

          <button onClick={() => goTo("/settings")}>
            <span>⚙</span>
            <b>Settings</b>
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("user");
              localStorage.removeItem("token");
              goTo("/candidate-login");
            }}
          >
            <span>↳</span>
            <b>Logout</b>
          </button>
        </nav>

       
      </aside>

      <section className="npj-compact-main">
        <header className="npj-compact-topbar">
          <div className="npj-compact-search">
            <button type="button" className="search-btn" onClick={handleSearch}>
              ⌕
            </button>

            <input
              value={searchText}
              placeholder="Search jobs, companies, skills..."
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
          </div>

          <div className="npj-compact-userarea">
            <button type="button" onClick={handleNotifications}>
              🔔{unreadCount > 0 && <b>{unreadCount}</b>}
            </button>

            <button
              type="button"
              onClick={handleProfileViews}
              title="Profile Views"
              className="npj-top-profile-view-btn"
            >
              👁
            </button>

            <div className="profile-dropdown-wrap">
              <div
                className="npj-compact-user"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <img src={getProfileImage()} alt={getCandidateName()} />
                <div>
                  <b>{getCandidateName()}</b>
                  <span>Candidate</span>
                </div>
                <small>⌄</small>
              </div>

              {showProfileMenu && (
                <div className="profile-dropdown-menu">
                  <button onClick={handleProfile}>
                    <span>♙</span> My Profile
                  </button>

                  <button
                    onClick={() =>
                      goTo(candidateId ? `/profile/${candidateId}?edit=true` : "/candidate-login")
                    }
                  >
                    <span>✎</span> Edit Profile
                  </button>

                  <button onClick={() => goTo("/settings")}>
                    <span>⚙</span> Settings
                  </button>

                  <button onClick={() => goTo("/help-center")}>
                    <span>?</span> Help Center
                  </button>

                  <hr />

                  <button
                    className="logout-menu-btn"
                    onClick={() => {
                      localStorage.removeItem("user");
                      localStorage.removeItem("token");
                      goTo("/candidate-login");
                    }}
                  >
                    <span>↳</span> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="npj-compact-grid">
          <section className="npj-compact-hero">
            <div className="hero-profile">
              <img src={getProfileImage()} alt={getCandidateName()} />

              <div>
                <h1>
                  Good Evening,
                  <br />
                  {getCandidateName()} 👋
                </h1>

                <p>
                  Your profile is {profileStrength}% complete. Complete your
                  profile to get better job matches.
                </p>

                <button onClick={handleProfile}>Complete Profile →</button>
              </div>
            </div>

            <div className="compact-score">
              <h2>{profileStrength}%</h2>
              <span>Profile Strength</span>
              <small>● {profileStrength >= 80 ? "Strong" : "Improve"}</small>
            </div>

            <div className="compact-stats">
              <div>
                <b>{appliedCount}</b>
                <span>Applications</span>
              </div>
              <div>
                <b>{interviews.length}</b>
                <span>Interviews</span>
              </div>
              <div>
                <b>{offerCount}</b>
                <span>Offers</span>
              </div>
              <div>
                <b>{savedJobs.length}</b>
                <span>Saved Jobs</span>
              </div>
            </div>
          </section>

          <section className="compact-card dream-card">
            <h3>Find Your Dream Job</h3>
            <p>Explore verified opportunities from trusted companies.</p>

            <input
              value={searchText}
              placeholder="Job title, keyword or company"
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />

            <input placeholder="Location" />
            <button onClick={handleSearch}>Search Jobs</button>
          </section>

          <section className="compact-card activity-card">
            <div className="card-head">
              <h3>Application Activity</h3>
              <a href="/applications">View All →</a>
            </div>

            {[
              ["Applied", appliedCount, "green"],
              ["Under Review", underReviewCount, "orange"],
              ["Interview Scheduled", interviews.length, "blue"],
              ["Offers", offerCount, "teal"],
              ["Rejected", rejectedCount, "red"],
            ].map((item) => (
              <div className="activity-line" key={item[0]}>
                <span className={`dot ${item[2]}`}></span>
                <p>{item[0]}</p>
                <b>{item[1]}</b>
              </div>
            ))}
          </section>

          <section className="compact-card jobs-card unique-jobs-carousel">
            <div className="card-head">
              <div>
                <h3>Recommended Jobs for You</h3>
                <p>Fresh roles matched with your profile and activity.</p>
              </div>

              <a href="/jobs">View All Jobs →</a>
            </div>

            <div className="compact-job-grid" ref={dashboardJobsRef}>
              {dashboardJobs.length > 0 ? (
                [...dashboardJobs, ...dashboardJobs, ...dashboardJobs].map(
                  (job, index) => {
                    const jobId = job._id || job.id;
                    const title =
                      job.title || job.jobTitle || job.role || "Untitled Job";
                    const company = job.company || job.companyName || "Company";
                    const location =
                      job.location || job.city || "Location not added";
                    const salary =
                      job.salary || job.package || "Salary not disclosed";

                    return (
                      <article
                        className="compact-job unique-job-card premium-saas-job"
                        key={`${jobId || "job"}-${index}`}
                      >
                        <div className="premium-job-topline">
                          <div className="premium-company-mark">
                            {company.charAt(0).toUpperCase()}
                          </div>

                          <button
                            type="button"
                            className="premium-save-btn"
                            onClick={() => saveJob(jobId)}
                          >
                            ♡
                          </button>
                        </div>

                        <div className="premium-job-match">
                          <span>AI Match</span>
                          <b>{88 + (index % 7)}%</b>
                        </div>

                        <h3>{title}</h3>
                        <p className="premium-company-name">{company}</p>

                        <div className="premium-job-meta">
                          <span>📍 {location}</span>
                          <span>⚡ {job.workMode || "Remote"}</span>
                        </div>

                        <div className="premium-job-tags">
                          <em>
                            {job.jobType || job.employmentType || "Full-time"}
                          </em>
                          <em>Verified</em>
                        </div>

                        <footer className="premium-job-footer">
                          <div>
                            <small>Package</small>
                            <b>{salary}</b>
                          </div>

                          <button
                            type="button"
                            disabled={applyingJobId === jobId}
                            onClick={() => applyJob(jobId)}
                          >
                            {applyingJobId === jobId
                              ? "Applying..."
                              : "Apply →"}
                          </button>
                        </footer>
                      </article>
                    );
                  }
                )
              ) : (
                <p>No jobs available from backend.</p>
              )}
            </div>
          </section>

          <section className="compact-card interview-card">
            <div className="card-head">
              <h3>Upcoming Interviews</h3>

              <button
                type="button"
                className="interview-view-btn"
                onClick={() => setInterviewDrawer(true)}
              >
                View All →
              </button>
            </div>

            {interviews.length > 0 ? (
              interviews.slice(0, 3).map((item, index) => {
                const interviewDate = new Date(
                  item.date || item.interviewDate || item.scheduledAt || Date.now()
                );

                return (
                  <div className="interview-line" key={item._id || index}>
                    <div>
                      <span>
                        {interviewDate
                          .toLocaleString("en", { month: "short" })
                          .toUpperCase()}
                      </span>
                      <b>{interviewDate.getDate()}</b>
                    </div>

                    <section>
                      <h4>
                        {item.round ||
                          item.title ||
                          item.jobTitle ||
                          "Interview Scheduled"}
                      </h4>
                      <p>{item.company || item.companyName || "Company"}</p>
                    </section>

                    <small>{item.time || item.interviewTime || "Time not added"}</small>
                  </div>
                );
              })
            ) : (
              <p>No interview scheduled yet.</p>
            )}
          </section>

          <section className="quick-tools">
            {tools.map((item) => (
              <div key={item[1]} onClick={() => goTo(item[3])}>
                <span>{item[0]}</span>
                <section>
                  <h3>{item[1]}</h3>
                  <p>{item[2]}</p>
                </section>
              </div>
            ))}
          </section>

          <section className="compact-card market-card">
            <div className="card-head">
              <h3>Job Market Insights</h3>
              <button onClick={loadDashboard}>Refresh</button>
            </div>

            <div>
              <article>
                <span>Active Jobs</span>
                <b>{jobs.length}</b>
                <p>Live backend</p>
              </article>

              <article>
                <span>Companies Hiring</span>
                <b>{companiesCount}</b>
                <p>From jobs</p>
              </article>

              <article>
                <span>Applications</span>
                <b>{appliedCount}</b>
                <p>Your data</p>
              </article>

              <article>
                <span>Alerts</span>
                <b>{notifications.length}</b>
                <p>Notifications</p>
              </article>
            </div>
          </section>

          <section className="compact-card skills-card">
            <div className="card-head">
              <h3>Your Skills</h3>
              <a href="/skill-assessment">Improve →</a>
            </div>

            <div>
              {(candidate?.skills?.length ? candidate.skills : []).map((skill, i) => (
                <span key={i}>
                  {typeof skill === "string" ? skill : skill?.name}
                </span>
              ))}

              {!candidate?.skills?.length && <p>No skills added yet.</p>}
            </div>
          </section>

          <section className="compact-card recent-card">
            <div className="card-head">
              <h3>Recent Applications</h3>
              <a href="/applications">View All →</a>
            </div>

            {applications.length > 0 ? (
              applications.slice(0, 3).map((app, index) => (
                <div className="recent-line" key={app._id || index}>
                  <span>💼</span>

                  <section>
                    <h4>{app.jobTitle || app.job?.title || "Applied Job"}</h4>
                    <p>
                      {app.company ||
                        app.companyName ||
                        app.job?.company ||
                        "Company"}
                    </p>
                  </section>

                  <div>
                    <b>{app.status || "Applied"}</b>
                    <small>
                      {app.createdAt
                        ? new Date(app.createdAt).toLocaleDateString()
                        : "Recently"}
                    </small>
                  </div>
                </div>
              ))
            ) : (
              <p>No applications found.</p>
            )}
          </section>
        </section>
      </section>
    </main>

    {interviewDrawer && (
      <div
        className="interview-drawer-overlay"
        role="presentation"
        onClick={() => setInterviewDrawer(false)}
      >
        <aside
          className="interview-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Interview notifications"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="interview-drawer-head">
            <div>
              <span className="interview-drawer-kicker">Interview Center</span>
              <h2>Interview Notifications</h2>
              <p>Small updates for scheduled, rescheduled, cancelled and completed interviews.</p>
            </div>

            <button
              type="button"
              aria-label="Close interview notifications"
              onClick={() => setInterviewDrawer(false)}
            >
              ×
            </button>
          </div>

          <div className="interview-drawer-summary">
            <article>
              <b>{interviews.length}</b>
              <span>Total Updates</span>
            </article>

            <article>
              <b>
                {
                  interviews.filter((item) =>
                    `${item.status || ""}`.toLowerCase().includes("schedule")
                  ).length
                }
              </b>
              <span>Scheduled</span>
            </article>

            <article>
              <b>
                {
                  interviews.filter((item) =>
                    `${item.status || ""}`.toLowerCase().includes("reschedule")
                  ).length
                }
              </b>
              <span>Rescheduled</span>
            </article>
          </div>

          <div className="interview-drawer-list">
            {interviews.length > 0 ? (
              interviews.map((item, index) => {
                const status = `${item.status || "scheduled"}`.toLowerCase();
                const interviewDate = new Date(
                  item.date || item.interviewDate || item.scheduledAt || Date.now()
                );

                const icon =
                  status.includes("reschedule")
                    ? "🟡"
                    : status.includes("cancel")
                    ? "🔴"
                    : status.includes("complete")
                    ? "🟢"
                    : "🎙️";

                const title =
                  status.includes("reschedule")
                    ? "Interview Rescheduled"
                    : status.includes("cancel")
                    ? "Interview Cancelled"
                    : status.includes("complete")
                    ? "Interview Completed"
                    : "Interview Scheduled";

                return (
                  <div className="interview-notice" key={item._id || index}>
                    <span>{icon}</span>

                    <section>
                      <div className="interview-notice-title">
                        <h3>{title}</h3>
                        <small>
                          {interviewDate.toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </small>
                      </div>

                      <p>
                        {item.company || item.companyName || "Company"} •{" "}
                        {item.round || item.title || item.jobTitle || "Interview"} •{" "}
                        {item.time || item.interviewTime || "Time not added"}
                      </p>
                    </section>
                  </div>
                );
              })
            ) : (
              <div className="interview-notice empty">
                <span>🎙️</span>

                <section>
                  <h3>No interview scheduled yet</h3>
                  <p>
                    When recruiters schedule, reschedule or cancel an interview,
                    the notification will appear here.
                  </p>
                </section>
              </div>
            )}
          </div>
        </aside>
      </div>
    )}

    <PremiumFooter />
  </>
);
}
function PremiumFooter() {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const goTo = (path) => {
    window.location.href = path;
  };

  const comingSoon = (name) => {
    alert(`${name} coming soon`);
  };

  const subscribe = async () => {
    if (!email.trim()) return alert("Please enter your email");

    try {
      setSubscribing(true);

      await axios.post(`${API_URL}/api/subscribers`, {
        email: email.trim(),
        source: "candidate-dashboard-footer",
      });

      alert("Subscribed successfully");
      setEmail("");
    } catch (error) {
      alert(error.response?.data?.message || "Subscription saved soon");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="npj-premium-footer">
      <div className="footer-brand">
        <img src="/logo.png" alt="NoPromptJobs" />
        <p>
          A Vatsenix Software Pvt Ltd product for genuine candidates and trusted employers.
        </p>

        <div className="footer-socials">
          <button onClick={() => comingSoon("LinkedIn")}>in</button>
          <button onClick={() => comingSoon("X")}>X</button>
          <button onClick={() => comingSoon("YouTube")}>▶</button>
          <button onClick={() => comingSoon("Facebook")}>f</button>
        </div>
      </div>

      <div className="footer-col">
        <h3>Services</h3>
        {["Resume Studio", "AI Interview Prep", "Skill Assessment", "Salary Predictor", "Trust Passport", "Career Tools"].map((item) => (
          <button key={item} onClick={() => goTo("/services")}>{item}</button>
        ))}
      </div>

      <div className="footer-col">
        <h3>Employers</h3>
        {["Recruiter Login", "Post a Job", "Hiring Solutions", "Employer Dashboard"].map((item) => (
          <button key={item} onClick={() => goTo("/recruiter-login")}>{item}</button>
        ))}
      </div>

      <div className="footer-col">
        <h3>Company</h3>
        <button onClick={() => goTo("/about")}>About Us</button>
        <button onClick={() => goTo("/services")}>Services</button>
        <button onClick={() => goTo("/products")}>Products</button>
        <button onClick={() => goTo("/contact")}>Contact Us</button>
        <button onClick={() => goTo("/privacy-policy")}>Privacy Policy</button>
        <button onClick={() => goTo("/terms-and-conditions")}>Terms & Conditions</button>
      </div>

      <div className="footer-subscribe">
        <h3>Stay updated</h3>
        <p>Get job alerts and career tips.</p>

        <input
          value={email}
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button onClick={subscribe} disabled={subscribing}>
          {subscribing ? "Subscribing..." : "Subscribe"}
        </button>

        <small>🔒 We respect your privacy.</small>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Vatsenix Software Pvt. Ltd. All rights reserved.</p>
        <div>
          <button onClick={() => goTo("/privacy-policy")}>Privacy Policy</button>
          <button onClick={() => goTo("/terms-and-conditions")}>Terms & Conditions</button>
          <button onClick={() => goTo("/sitemap")}>Sitemap</button>
        </div>
      </div>
    </footer>
  );
}function TalentInsightPanel({ candidate, score }) {
  const searchAppearances = candidate.profileViews || 0;

  const recruiterActions =
    (candidate.shortlisted ? 1 : 0) +
    (candidate.recruiterNotes?.length || 0);

  return (
    <aside className="talent-panel">
      <div className="panel-top">
        <div className="mini-score">
          <span>{score}%</span>
        </div>

        <div>
          <h3>Talent Signal</h3>
          <p>Profile visibility dashboard</p>
        </div>
      </div>

      <div className="insight-grid">
        <div className="insight-box blue">
          <h2>{searchAppearances}</h2>
          <p>Search Appearances</p>
        </div>

        <div className="insight-box purple">
          <h2>{recruiterActions}</h2>
          <p>Recruiter Actions</p>
        </div>

        <div className="insight-box green">
          <h2>{candidate.shortlisted ? "Yes" : "No"}</h2>
          <p>Shortlisted</p>
        </div>

        <div className="insight-box orange">
          <h2>{candidate.recruiterNotes?.length || 0}</h2>
          <p>Recruiter Notes</p>
        </div>
      </div>

      <div className="ai-card">
        <h4> Profile Match</h4>
        <p>
          Optimized for <b>{candidate.currentRole || "technology roles"}</b>
        </p>

        <div className="ai-bar">
          <div style={{ width: `${score}%` }}></div>
        </div>
      </div>

      <button className="panel-btn">Improve Visibility</button>
    </aside>
  );
}


function JobPostForm() {
  const [job, setJob] = useState({
    title: "",
    company: "",
    location: "",
    workMode: "",
    employmentType: "",
    department: "",
    experienceMin: "",
    experienceMax: "",
    salary: "",
    currency: "INR",
    skills: "",
    description: "",
    noticePeriod: "",
    preferredLocations: "",
    genderPreference: "No Preference",
    education: "",
    postedBy: "recruiter",
  });

  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const postJob = async (e) => {
    e.preventDefault();

    if (!job.title || !job.company || !job.location || !job.skills) {
      alert("Please fill Job Title, Company, Location and Skills");
      return;
    }

    try {
      await axios.post(`${API_URL}/api/jobs`, {
        ...job,
        skills: job.skills.split(",").map((s) => s.trim()).filter(Boolean),
        experienceMin: Number(job.experienceMin || 0),
        experienceMax: Number(job.experienceMax || 0),
      });

      alert("Job posted successfully");
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert(err.response?.data?.error || "Job posting failed");
    }
  };

  return (
    <form className="clean-job-form" onSubmit={postJob}>
      <input name="title" value={job.title} placeholder="Job Title" onChange={handleChange} />
      <input name="company" value={job.company} placeholder="Company Name" onChange={handleChange} />
      <input name="location" value={job.location} placeholder="Location" onChange={handleChange} />
      <input name="skills" value={job.skills} placeholder="Skills e.g. React, Node" onChange={handleChange} />
      <textarea name="description" value={job.description} placeholder="Job Description" onChange={handleChange} />
      <button type="submit">Post Job</button>
    </form>
  );
}
function RecruiterAdvancedSidebar() {
  const goTo = (path) => {
    window.location.href = path;
  };

  return (
  <aside className="advanced-recruiter-sidebar">

    <div className="sidebar-title">
      <span>Recruiter Suite</span>
    </div>
        <div className="advanced-menu-group">
        <span>Advanced Tools</span>

        <button onClick={() => goTo("/recruiter-ai-assistant")}>
          🤖 Job Assistant <b>New</b>
        </button>

        <button onClick={() => goTo("/recruiter-reports")}>
          📈 Talent Insights
        </button>

        <button onClick={() => goTo("/recruiter-post-job")}>
          📋 Job Templates
        </button>

        <button onClick={() => goTo("/company-profile")}>
          🎨 Company Branding
        </button>

        <button onClick={() => goTo("/recruiter-interviews")}>
          🎯 Interview Stages
        </button>

        <button onClick={() => goTo("/recruiter-screening")}>
          🧪 Screening Questions
        </button>
      </div>

      <div className="advanced-menu-group">
        <span>Management</span>

        <button onClick={() => goTo("/recruiter-post-job")}>
          📁 Saved Drafts <b>2</b>
        </button>

        <button onClick={() => goTo("/recruiter-reports")}>
          📊 Job Analytics
        </button>

        <button onClick={() => goTo("/recruiter-team")}>
          👥 Team Members
        </button>

        <button onClick={() => goTo("/recruiter-notifications")}>
          🔔 Notifications <b>5</b>
        </button>
      </div>

      <div className="advanced-menu-group">
        <span>Account</span>

        <button onClick={() => goTo("/company-profile")}>
          🏢 Company Profile
        </button>

        <button onClick={() => goTo("/recruiter-billing")}>
          💳 Billing & Plan
        </button>

        <button onClick={() => goTo("/recruiter-settings")}>
          ⚙️ Settings
        </button>
      </div>

      <div className="advanced-pro-card">
        <h3>👑 NoProxy Talent Pro</h3>
        <p>Unlock hiring tools and reach verified candidates faster.</p>

        <button onClick={() => goTo("/recruiter-billing")}>
          Upgrade Now →
        </button>
      </div>
    </aside>
  );
}
function InterviewAlertsPage() {
  const [interviewAlerts, setInterviewAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const candidateId = user?._id || user?.id || user?.candidateId;

  useEffect(() => {
    const loadInterviewAlerts = async () => {
      try {
        if (!candidateId) {
          setInterviewAlerts([]);
          return;
        }

        const res = await axios.get(
          `${API_URL}/api/candidates/${candidateId}/interviews`
        );

        setInterviewAlerts(res.data.interviews || res.data.data || []);
      } catch (error) {
        console.log("INTERVIEW ALERTS ERROR:", error.response?.data || error.message);
        setInterviewAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    loadInterviewAlerts();
  }, [candidateId]);

  return (
    <>
      <Navbar />

      <main className="interview-alerts-page">
        <section className="interview-alerts-hero">
          <div>
            <span>🎤 Interview Center</span>
            <h1>Interview Alerts</h1>
            <p>Track scheduled interviews, recruiter calls and hiring rounds.</p>
          </div>

          <h2>{interviewAlerts.length}</h2>
        </section>

        <section className="interview-alerts-card">
          {loading ? (
            <p>Loading interview alerts...</p>
          ) : interviewAlerts.length > 0 ? (
            interviewAlerts.map((item, index) => (
              <div className="interview-alert-row" key={item._id || index}>
                <div className="interview-icon">🎤</div>

                <div>
                  <h3>{item.round || item.title || item.jobTitle || "Interview Scheduled"}</h3>
                  <p>{item.company || item.companyName || "Company not added"}</p>
                  <small>
                    {item.date || item.interviewDate || "Date not added"} •{" "}
                    {item.time || item.interviewTime || "Time not added"}
                  </small>
                </div>

                <span className="interview-status">
                  {item.status || "Scheduled"}
                </span>
              </div>
            ))
          ) : (
            <div className="empty-interview-box">
              <h2>No interview scheduled yet</h2>
              <p>When recruiters schedule an interview, it will appear here.</p>

              <button onClick={() => (window.location.href = "/jobs")}>
                Explore Jobs
              </button>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
function ProFeaturesPage() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const pendingPlan = localStorage.getItem("pendingPlan");

  const activateProForTesting = () => {
    const updatedUser = {
      ...user,
      plan: "Pro",
      subscriptionStatus: "active",
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    localStorage.removeItem("pendingPlan");

    alert("Pro activated successfully");
    window.location.reload();
  };

  const isPro =
    user?.subscriptionStatus === "active" ||
    user?.plan === "Pro" ||
    user?.plan === "Ultimate";

  const features = [
    {
      title: "Auto Apply Engine",
      desc: "Automatically apply to matching jobs.",
      path: "/feature/auto-apply",
      icon: "⚡",
    },
    {
      title: "Instant Job Alerts",
      desc: "Get instant job alerts based on your profile.",
      path: "/feature/job-alerts",
      icon: "🔔",
    },
    {
      title: " Resume Studio",
      desc: "Create ATS-ready resumes with AI.",
      path: "/feature/resume-studio",
      icon: "📄",
    },
    {
      title: "Match Score",
      desc: "Know your job match percentage.",
      path: "/feature/ai-match-score",
      icon: "🎯",
    },
    {
      title: "Trust Passport",
      desc: "Verify identity, resume, projects and skills.",
      path: "/feature/trust-passport",
      icon: "🛡",
    },
    {
      title: "Interview Practice",
      desc: "Practice HR and technical interviews.",
      path: "/feature/interview-prep",
      icon: "🎤",
    },
    {
      title: "Salary Predictor",
      desc: "Predict your salary growth range.",
      path: "/feature/salary-predictor",
      icon: "💰",
    },
    {
      title: "Skill Intelligence",
      desc: "Find missing skills and career roadmap.",
      path: "/feature/skill-intelligence",
      icon: "🧠",
    },
  ];

  return (
    <>
      <Navbar />

      <main className="pro-features-page">
        <section className="pro-features-hero">
          <span>NoPromptJobs Pro</span>

          <h1>
            Unlock Your Career Workspace
          </h1>

          <p>
            Access all premium tools after subscription.
          </p>

          {!isPro && pendingPlan && (
            <button onClick={activateProForTesting}>
              I Completed Payment - Activate Pro
            </button>
          )}

          {!isPro && !pendingPlan && (
            <button
              onClick={() => {
                localStorage.setItem("pendingPlan", "Pro");
                window.open("https://rzp.io/rzp/wBgr5eag", "_blank");
              }}
            >
              Subscribe to Pro →
            </button>
          )}
        </section>

        <section className="pro-features-grid">
          {features.map((feature) => (
            <article
              className={`pro-feature-work-card ${!isPro ? "locked" : ""}`}
              key={feature.title}
            >
              <div className="pro-feature-icon">{feature.icon}</div>

              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>

              <button
                onClick={() => {
                  if (!isPro) {
                    alert("Please activate Pro subscription first.");
                    return;
                  }

                  window.location.href = feature.path;
                }}
              >
                {isPro ? "Open Feature →" : "Locked 🔒"}
              </button>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
function RecruiterDashboard() {
  const [stats, setStats] = useState({
    totalCandidates: 0,
    shortlisted: 0,
    jobsPosted: 0,
    applications: 0,
  });

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  const recruiterName =
    user?.name || user?.email?.split("@")[0] || "Recruiter";

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const candidatesRes = await axios.get(`${API_URL}/api/candidates`);
      const jobsRes = await axios.get(`${API_URL}/api/jobs`);

      const candidateList = candidatesRes.data || [];
      const jobList = jobsRes.data || [];

      const appliedCandidates = candidateList.filter((c) => c.applied === true);
      const shortlistedCandidates = candidateList.filter(
        (c) => c.shortlisted === true
      );

      setStats({
        totalCandidates: candidateList.length,
        shortlisted: shortlistedCandidates.length,
        jobsPosted: jobList.length,
        applications: appliedCandidates.length,
      });

      setCandidates(candidateList.slice(0, 5));
      setJobs(jobList.slice(0, 5));
      setApplications(appliedCandidates.slice(0, 5));
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Dashboard data loading failed");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Candidates",
      value: stats.totalCandidates,
      icon: "👥",
      trend: "+18%",
      text: "Live candidate database",
      color: "violet",
    },
    {
      title: "Shortlisted",
      value: stats.shortlisted,
      icon: "⭐",
      trend: "+9%",
      text: "Ready for recruiter review",
      color: "amber",
    },
    {
      title: "Jobs Posted",
      value: stats.jobsPosted,
      icon: "💼",
      trend: "+12%",
      text: "Active job listings",
      color: "green",
    },
    {
      title: "Applications",
      value: stats.applications,
      icon: "📄",
      trend: "+6%",
      text: "Incoming applications",
      color: "blue",
    },
  ];

  return (
    <>
      <Navbar />

      <div className="saas-dashboard">
        <RecruiterAdvancedSidebar />

        <main className="saas-main">
          <section className="saas-top">
            <div>
              <h1>Welcome back, {recruiterName} 👋</h1>
              <p>Here is what is happening with your hiring today.</p>
            </div>

            <div className="saas-actions">
              <button className="saas-search">Search candidates, jobs...</button>
              <button className="saas-outline">Export Report</button>
              <button
                className="saas-primary"
                onClick={() => (window.location.href = "/recruiter-post-job")}
              >
                + Post New Job
              </button>
            </div>
          </section>

          <section className="saas-stats">
            {statCards.map((item) => (
              <div className={`saas-stat ${item.color}`} key={item.title}>
                <div className="saas-stat-icon">{item.icon}</div>

                <div className="saas-stat-content">
                  <p>{item.title}</p>
                  <h2>{loading ? "..." : item.value}</h2>
                  <small>{item.text}</small>
                </div>

                <div className="saas-trend">
                  <b>{item.trend}</b>
                  <span>vs last month</span>
                </div>
              </div>
            ))}
          </section>

          <section className="saas-grid">
            <div className="saas-panel pipeline-panel">
              <div className="saas-panel-head">
                <div>
                  <h2>Hiring Pipeline</h2>
                  <p>Candidate movement across recruitment stages</p>
                </div>

                <button onClick={() => (window.location.href = "/recruiter-shortlisted")}>
                  View Pipeline →
                </button>
              </div>

              <div className="pipeline-row">
                <PipelineItem label="Sourced" value={stats.totalCandidates} percent="92%" />
                <PipelineItem label="Shortlisted" value={stats.shortlisted} percent="64%" />
                <PipelineItem label="Interview" value="0" percent="38%" />
                <PipelineItem label="Offered" value="0" percent="18%" />
                <PipelineItem label="Hired" value="0" percent="8%" />
              </div>
            </div>

            <div className="saas-panel ai-panel">
              <div className="saas-panel-head">
                <h2> Insights</h2>
                <button>View All</button>
              </div>

              <div className="ai-list">
                <div>⚡ Improve job posts with skill-based keywords.</div>
                <div>🎯 Shortlist verified project candidates first.</div>
                <div>📈 Add salary range to improve applications.</div>
                <div>🛡 Prefer candidates with trust verification.</div>
              </div>
            </div>
          </section>

          <section className="saas-grid">
            <div className="saas-panel jobs-panel">
              <div className="saas-panel-head">
                <div>
                  <h2>Recent Job Posts</h2>
                  <p>Latest jobs posted by your company</p>
                </div>

                <button onClick={() => (window.location.href = "/recruiter-post-job")}>
                  View All Jobs →
                </button>
              </div>

              <div className="saas-table">
                <div className="saas-table-head">
                  <span>Job Title</span>
                  <span>Location</span>
                  <span>Work Mode</span>
                  <span>Status</span>
                  <span>Applications</span>
                  <span>Action</span>
                </div>

                {jobs.length ? (
                  jobs.map((job) => (
                    <div className="saas-table-row" key={job._id}>
                      <span>
                        <b>{job.title || job.jobTitle}</b>
                        <small>{job.company || "NoProxyJobs"}</small>
                      </span>

                      <span>{job.location || "Not added"}</span>
                      <span>{job.workMode || "Hybrid"}</span>

                      <span>
                        <em>{job.status || "Active"}</em>
                      </span>

                      <span>{job.applications?.length || 0}</span>

                      <button
                        onClick={() =>
                          (window.location.href = `/recruiter-job-details/${job._id}`)
                        }
                      >
                        View
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="saas-empty">No jobs posted yet.</div>
                )}
              </div>
            </div>

            <div className="saas-panel candidates-panel">
              <div className="saas-panel-head">
                <h2>Top Candidates</h2>
                <button onClick={() => (window.location.href = "/recruiter-search")}>
                  View All →
                </button>
              </div>

              {candidates.length ? (
                candidates.map((candidate) => (
                  <div className="saas-candidate" key={candidate._id}>
                    <div className="candidate-avatar">
                      {candidate.profileImageUrl ? (
                        <img src={candidate.profileImageUrl} alt={candidate.name} />
                      ) : (
                        candidate.name?.charAt(0) || "C"
                      )}
                    </div>

                    <div>
                      <h4>{candidate.name || "Candidate"}</h4>
                      <p>{candidate.currentRole || "Job seeker"}</p>
                      <small>{candidate.location || "India"}</small>
                    </div>

                    <strong>92%</strong>

                    <button
                      onClick={() =>
                        (window.location.href = `/recruiter-candidate-profile/${candidate._id}`)
                      }
                    >
                      View
                    </button>
                  </div>
                ))
              ) : (
                <div className="saas-empty">No candidates found.</div>
              )}
            </div>
          </section>

          <section className="saas-bottom">
            <div className="saas-panel">
              <h2>Recruiter Performance</h2>

              <div className="performance-grid">
                <Performance label="Profile Completion" value="88%" />
                <Performance label="Job Visibility" value="76%" />
                <Performance label="Candidate Response" value="64%" />
              </div>
            </div>

            <div className="saas-panel quick-panel">
              <h2>Quick Actions</h2>

              <div className="quick-grid">
                <button onClick={() => (window.location.href = "/recruiter-post-job")}>
                  ➕ Post Job
                </button>
                <button onClick={() => (window.location.href = "/recruiter-search")}>
                  🔍 Find Candidates
                </button>
                <button onClick={() => (window.location.href = "/recruiter-shortlisted")}>
                  ⭐ Shortlisted
                </button>
                <button onClick={() => (window.location.href = "/recruiter-applications")}>
                  📄 Applications
                </button>
              </div>
            </div>
          </section>

          <PremiumFooter />
        </main>
      </div>
    </>
  );
}

function PipelineItem({ label, value, percent }) {
  return (
    <div className="pipeline-item">
      <h3>{value}</h3>
      <p>{label}</p>
      <span>{percent}</span>
      <div className="pipeline-track">
        <div style={{ width: percent }}></div>
      </div>
    </div>
  );
}

function Performance({ label, value }) {
  return (
    <div className="performance-card">
      <p>{label}</p>
      <h3>{value}</h3>
      <div className="performance-track">
        <div style={{ width: value }}></div>
      </div>
    </div>
  );
}
function RecruiterPostJobPage() {
  const [job, setJob] = useState({
    title: "",
    company: "",
    location: "",
    workMode: "Hybrid",
    employmentType: "Full-time",
    experience: "",
    salary: "",
    skills: "",
    description: "",
    responsibilities: "",
    requirements: "",
    benefits: "",
  });

  const [posting, setPosting] = useState(false);

  const handleChange = (e) => {
    setJob({
      ...job,
      [e.target.name]: e.target.value,
    });
  };

  const postJob = async (e) => {
    e.preventDefault();

    if (!job.title || !job.company || !job.location || !job.description) {
      alert("Please fill Job Title, Company, Location and Description");
      return;
    }

    try {
      setPosting(true);

      await axios.post(`${API_URL}/api/jobs`, {
        ...job,
        skills: job.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        status: "Active",
      });

      alert("Job posted successfully");
      window.location.href = "/recruiter-dashboard";
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Job post failed");
    } finally {
      setPosting(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="postjob-saas-layout">
        <RecruiterAdvancedSidebar />

        <main className="postjob-saas-main">
          <section className="postjob-saas-hero">
            <div>
              <span className="postjob-badge">💼 Recruiter Workspace</span>
              <h1>Post a Premium Job Opening</h1>
              <p>
                Create a complete job post with role details, compensation,
                skills, requirements and candidate-facing preview.
              </p>
            </div>

            <div className="postjob-hero-actions">
              <button className="draft-btn" onClick={() => alert("Draft saved")}>
                Save Draft
              </button>
              <button className="publish-btn" onClick={postJob}>
                {posting ? "Publishing..." : "Publish Job"}
              </button>
            </div>
          </section>

          <section className="postjob-stats-row">
            <div>
              <span>Draft Jobs</span>
              <h2>2</h2>
              <p>Saved job templates</p>
            </div>

            <div>
              <span>Active Jobs</span>
              <h2>Live</h2>
              <p>Visible to candidates</p>
            </div>

            <div>
              <span>Reach Estimate</span>
              <h2>1.2k</h2>
              <p>Matching candidates</p>
            </div>

            <div>
              <span> Quality</span>
              <h2>92%</h2>
              <p>Job post strength</p>
            </div>
          </section>

          <div className="postjob-content-grid">
            <form className="postjob-form-card" onSubmit={postJob}>
              <div className="form-section-title">
                <h2>Job Information</h2>
                <p>Basic role details candidates will see first.</p>
              </div>

              <div className="postjob-grid">
                <label>
                  Job Title
                  <input
                    name="title"
                    value={job.title}
                    placeholder="e.g. Senior React Developer"
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Company Name
                  <input
                    name="company"
                    value={job.company}
                    placeholder="e.g. NoPromptJobs"
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Location
                  <input
                    name="location"
                    value={job.location}
                    placeholder="e.g. Bengaluru, India"
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Work Mode
                  <select name="workMode" value={job.workMode} onChange={handleChange}>
                    <option>Remote</option>
                    <option>Hybrid</option>
                    <option>On-site</option>
                  </select>
                </label>

                <label>
                  Employment Type
                  <select
                    name="employmentType"
                    value={job.employmentType}
                    onChange={handleChange}
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </label>

                <label>
                  Experience
                  <input
                    name="experience"
                    value={job.experience}
                    placeholder="e.g. 2 - 5 years"
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Salary Range
                  <input
                    name="salary"
                    value={job.salary}
                    placeholder="e.g. ₹6 LPA - ₹12 LPA"
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Required Skills
                  <input
                    name="skills"
                    value={job.skills}
                    placeholder="React, Node, MongoDB"
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="form-section-title">
                <h2>Job Description</h2>
                <p>Add clear details to improve application quality.</p>
              </div>

              <label>
                Overview
                <textarea
                  name="description"
                  value={job.description}
                  placeholder="Write a professional role overview..."
                  onChange={handleChange}
                />
              </label>

              <label>
                Responsibilities
                <textarea
                  name="responsibilities"
                  value={job.responsibilities}
                  placeholder="Mention key responsibilities..."
                  onChange={handleChange}
                />
              </label>

              <label>
                Requirements
                <textarea
                  name="requirements"
                  value={job.requirements}
                  placeholder="Mention must-have skills and experience..."
                  onChange={handleChange}
                />
              </label>

              <label>
                Benefits
                <textarea
                  name="benefits"
                  value={job.benefits}
                  placeholder="Mention benefits, growth, work culture..."
                  onChange={handleChange}
                />
              </label>

              <div className="postjob-bottom-actions">
                <button type="button" className="draft-btn">
                  Save as Draft
                </button>

                <button type="submit" className="publish-btn">
                  {posting ? "Publishing..." : "Publish Job"}
                </button>
              </div>
            </form>

            <aside className="postjob-right-panel">
              <div className="postjob-ai-card">
                <h2>✨ Job Quality</h2>
                <div className="quality-circle">92%</div>
                <p>Strong job post. Add salary and benefits for better applications.</p>

                <ul>
                  <li>✅ Clear job title</li>
                  <li>✅ Skills added</li>
                  <li>✅ Candidate-friendly description</li>
                  <li>⚠️ Add interview process</li>
                </ul>
              </div>

              <div className="job-preview-card">
                <h2>Live Candidate Preview</h2>

                <div className="preview-job-card">
                  <span>Verified Job</span>
                  <h3>{job.title || "Job Title"}</h3>
                  <p>{job.company || "Company Name"}</p>
                  <small>
                    {job.location || "Location"} • {job.workMode}
                  </small>

                  <h4>{job.salary || "Salary not disclosed"}</h4>

                  <div className="preview-skills">
                    {job.skills ? (
                      job.skills.split(",").slice(0, 5).map((skill, i) => (
                        <b key={i}>{skill.trim()}</b>
                      ))
                    ) : (
                      <>
                        <b>React</b>
                        <b>Node</b>
                        <b>MongoDB</b>
                      </>
                    )}
                  </div>

                  <button>Candidate View</button>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </>
  );
}function RecruiterTalentSearch() {
  const [filters, setFilters] = useState({
    keyword: "",
    skill: "",
    minExp: "",
    maxExp: "",
    location: "",
    role: "",
    company: "",
    workMode: "",
    noticePeriod: "",
    jobType: "",
  });

  const [candidates, setCandidates] = useState([]);
  const [note, setNote] = useState("");

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const search = async () => {
    try {
      const res = await axios.get(`${API_URL}/search/filter`, {
        params: filters,
      });
      setCandidates(res.data);
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Search failed");
    }
  };

  const shortlist = async (id) => {
    await axios.patch(`${API_URL}/api/candidates/${id}/shortlist`);
    search();
  };

  const addNote = async (id) => {
    if (!note.trim()) return alert("Enter note");

    await axios.post(`${API_URL}/api/candidates/${id}/notes`, { note });
    setNote("");
    alert("Note added");
  };

  return (
    <>
      <Navbar />

      <div className="talent-search-layout">
        <RecruiterAdvancedSidebar />

        <main className="talent-search-main">
          <section className="talent-search-hero">
            <div>
              <h1> Talent Search Command Center</h1>
              <p>
                Search verified candidates with skills, role, experience,
                location and hiring intent.
              </p>
            </div>

            <div className="search-ai-badges">
              <span>🛡 Verified Talent</span>
              <span>⚡ Fast Shortlist</span>
              <span>🤖 AI Match</span>
            </div>
          </section>

          <section className="advanced-filter-panel">
            <div className="filter-header">
              <div>
                <h2>Smart Candidate Filters</h2>
                <p>Use precise filters to find genuine matching candidates.</p>
              </div>

              <button onClick={search}>Search Candidates</button>
            </div>

            <div className="advanced-filter-grid">
              <label>
                Keyword / Role
                <input
                  name="keyword"
                  placeholder="Data Engineer, React Developer..."
                  onChange={handleChange}
                />
              </label>

              <label>
                Primary Skill
                <input
                  name="skill"
                  placeholder="Python, React, Java..."
                  onChange={handleChange}
                />
              </label>

              <label>
                Min Experience
                <input
                  name="minExp"
                  type="number"
                  placeholder="2"
                  onChange={handleChange}
                />
              </label>

              <label>
                Max Experience
                <input
                  name="maxExp"
                  type="number"
                  placeholder="6"
                  onChange={handleChange}
                />
              </label>

              <label>
                Location
                <input
                  name="location"
                  placeholder="Bangalore, Hyderabad..."
                  onChange={handleChange}
                />
              </label>

              <label>
                Current Company
                <input
                  name="company"
                  placeholder="Infosys, TCS..."
                  onChange={handleChange}
                />
              </label>

              <label>
                Work Mode
                <select name="workMode" onChange={handleChange}>
                  <option value="">Any</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Onsite">Onsite</option>
                </select>
              </label>

              <label>
                Notice Period
                <input
                  name="noticePeriod"
                  placeholder="Immediate, 15 days..."
                  onChange={handleChange}
                />
              </label>
            </div>

            <div className="filter-chip-row">
              <span>Suggested:</span>
              <button type="button">Python</button>
              <button type="button">React</button>
              <button type="button">Data Engineer</button>
              <button type="button">Immediate Joiner</button>
              <button type="button">Verified Resume</button>
            </div>
          </section>

          <section className="talent-results-head">
            <div>
              <h2>Matching Candidates</h2>
              <p>
                {candidates.length
                  ? `${candidates.length} real candidates found`
                  : "Run search to view verified candidates"}
              </p>
            </div>

            <div className="result-sort-box">
              <span>Sort by:</span>
              <button>Best Match</button>
              <button>Experience</button>
              <button>Recently Active</button>
            </div>
          </section>

          <section className="advanced-candidate-results">
            {candidates.length ? (
              candidates.map((candidate) => (
                <div className="advanced-candidate-card" key={candidate._id}>
                  <div className="candidate-left-block">
                    <div className="candidate-photo-mini">
                      {candidate.profileImageUrl ? (
                        <img src={candidate.profileImageUrl} alt="candidate" />
                      ) : (
                        <span>{candidate.name?.charAt(0) || "C"}</span>
                      )}
                    </div>

                    <div>
                      <div className="candidate-title-line">
                        <h2>{candidate.name}</h2>
                        <span className="verified-pill">Verified</span>
                      </div>

                      <p>
                        {candidate.currentRole || "Candidate"} at{" "}
                        {candidate.currentCompany || "Company not added"}
                      </p>

                      <p>
                        {candidate.experienceYears || 0} yrs •{" "}
                        {candidate.location || "Location not added"} •{" "}
                        {candidate.noticePeriod || "Notice not added"}
                      </p>

                      <div className="candidate-skill-pills">
                        {candidate.skills?.slice(0, 5).map((s, i) => (
                          <span key={i}>{s.name}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="candidate-score-block">
                    <div className="match-circle">
                      <span>92%</span>
                    </div>
                    <p>AI Match</p>
                  </div>

                  <div className="candidate-action-block">
                    <a href={`/profile/${candidate._id}`}>View Profile</a>

                    {candidate.resumeUrl && (
                      <a href={candidate.resumeUrl} target="_blank" rel="noreferrer">
                        Resume
                      </a>
                    )}

                    <button onClick={() => shortlist(candidate._id)}>
                      {candidate.shortlisted ? "Remove Shortlist" : "Shortlist"}
                    </button>

                    <textarea
                      placeholder="Private recruiter note..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />

                    <button onClick={() => addNote(candidate._id)}>
                      Save Note
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-talent-state">
                <h2>Start your candidate search</h2>
                <p>
                  Use filters above to discover verified candidates with strong
                  match scores.
                </p>
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}
function RecruiterShortlistedPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [notes, setNotes] = useState({});
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    loadShortlistedCandidates();
  }, []);

    

    const loadShortlistedCandidates = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/candidates`);

        const shortlistedOnly = res.data.filter(
          (candidate) => candidate.shortlisted === true
        );

        setCandidates(shortlistedOnly);
      } catch (err) {
        console.log(err.response?.data || err.message);
        alert("Failed to load shortlisted candidates");
      }
    };
  const filtered =
    activeTab === "All"
      ? candidates
      : candidates.filter((candidate) => candidate.status === activeTab);

  const countStatus = (status) =>
    candidates.filter((candidate) => candidate.status === status).length;

  const openProfile = (candidate) => {
  window.location.href = `/recruiter-candidate-profile/${candidate._id}`;
};

  const saveNote = async (candidate) => {
    if (!notes[candidate._id]?.trim()) {
      alert("Please enter note");
      return;
    }

    try {
      await axios.post(`${API_URL}/${candidate._id}/notes`, {
        note: notes[candidate._id],
      });

      alert("Note saved");
      setNotes({ ...notes, [candidate._id]: "" });
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Note save failed");
    }
  };

  const moveNextStage = (candidate) => {
    const stages = ["In Review", "Interview", "Offered", "Rejected"];
    const currentIndex = stages.indexOf(candidate.status || "In Review");
    const nextStage = stages[(currentIndex + 1) % stages.length];

    setCandidates((prev) =>
      prev.map((item) =>
        item._id === candidate._id
          ? { ...item, status: nextStage }
          : item
      )
    );
  };

  return (
    <>
      <Navbar />

      <div className="shortlisted-layout">
        <RecruiterAdvancedSidebar />

        <main className="shortlisted-main">
          <section className="shortlisted-hero">
            <div>
              <h1>✨ Shortlisted Candidates</h1>
              <p>Manage verified candidates selected by your hiring team.</p>
            </div>

            <div className="shortlisted-summary">
              <button onClick={() => setActiveTab("All")}>
                <span>Total Shortlisted</span>
                <h2>{candidates.length}</h2>
              </button>

              <button onClick={() => setActiveTab("In Review")}>
                <span>In Review</span>
                <h2>{countStatus("In Review")}</h2>
              </button>

              <button onClick={() => setActiveTab("Interview")}>
                <span>Interview</span>
                <h2>{countStatus("Interview")}</h2>
              </button>

              <button onClick={() => setActiveTab("Offered")}>
                <span>Offered</span>
                <h2>{countStatus("Offered")}</h2>
              </button>

              <button onClick={() => setActiveTab("Rejected")}>
                <span>Rejected</span>
                <h2>{countStatus("Rejected")}</h2>
              </button>
            </div>
          </section>

          <section className="shortlisted-tabs">
            {["All", "In Review", "Interview", "Offered", "Rejected"].map(
              (tab) => (
                <button
                  key={tab}
                  className={activeTab === tab ? "active" : ""}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              )
            )}
          </section>

          <section className="shortlisted-list">
            {filtered.map((candidate) => (
              <div className="shortlisted-card" key={candidate._id}>
                <div className="shortlisted-profile">
                  <div className="shortlisted-avatar">
                    {candidate.name?.charAt(0) || "C"}
                    <span>✓</span>
                  </div>

                  <div>
                    <div className="shortlisted-title">
                      <h2>{candidate.name}</h2>
                      <span className="verified-pill">Verified</span>
                      <span className="match-pill">92% Match</span>
                    </div>

                    <p>
                      {candidate.currentRole || "Candidate"} •{" "}
                      {candidate.experienceYears || 0} Years •{" "}
                      {candidate.location || "Location not added"}
                    </p>

                    <div className="shortlisted-skills">
                      {candidate.skills?.map((skill, i) => (
                        <span key={i}>{skill.name || skill}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="shortlisted-job-info">
                  <span>Applied for</span>
                  <h3>{candidate.currentRole || "Candidate"}</h3>

                  <p>Status</p>
                  <h4>{candidate.status || "In Review"}</h4>
                </div>

                <div className="shortlisted-actions">
                  <button onClick={() => openProfile(candidate)}>
                    👁 View Profile
                  </button>

                  <button onClick={() => moveNextStage(candidate)}>
                    🎯 Move Next Stage
                  </button>

                  <textarea
                    placeholder="Add recruiter note..."
                    value={notes[candidate._id] || ""}
                    onChange={(e) =>
                      setNotes({
                        ...notes,
                        [candidate._id]: e.target.value,
                      })
                    }
                  />

                  <button onClick={() => saveNote(candidate)}>
                    💬 Add Note
                  </button>
                </div>
              </div>
            ))}
          </section>
        </main>
      </div>
    </>
  );
}
function RecruiterApplicationsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    loadApplications();
  }, []);

    

    const loadApplications = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/candidates`);

        const appliedCandidates = res.data.filter(
          (candidate) => candidate.applied === true
        );

        setApplications(appliedCandidates);
      } catch (err) {
        console.log(err.response?.data || err.message);
        alert("Failed to load applications");
      }
    };
  const filtered =
    activeTab === "All"
      ? applications
      : applications.filter((app) => app.status === activeTab);

  const countStatus = (status) =>
    applications.filter((app) => app.status === status).length;

  const openProfile = (candidate) => {
    window.location.href = `/recruiter-candidate-profile/${candidate._id}`;
  };
  

  const shortlistCandidate = async (candidate) => {
    try {
      await axios.patch(
        `${API_URL}/api/candidates/${candidate._id}`,
        { shortlisted: true }
      );

      alert("Candidate shortlisted");
      loadApplications();
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Shortlist failed");
    }
  };

    

    const moveInterview = async (candidate) => {
      try {
        await axios.patch(
          `${API_URL}/api/candidates/${candidate._id}`,
          { status: "Interview" }
        );

        alert("Moved to interview");
        loadApplications();
      } catch (err) {
        console.log(err.response?.data || err.message);
        alert("Update failed");
      }
    };

      

    const rejectApplication = async (candidate) => {
      try {
        await axios.patch(
          `${API_URL}/api/candidates/${candidate._id}`,
          { status: "Rejected" }
        );

        alert("Application rejected");
        loadApplications();
      } catch (err) {
        console.log(err.response?.data || err.message);
        alert("Reject failed");
      }
    };

  return (
    <>
      <Navbar />

      <div className="applications-layout">
        <RecruiterAdvancedSidebar />

        <main className="applications-main">
          <section className="applications-hero">
            <div>
              <h1>📄 Applications</h1>
              <p>
                Review applicants, shortlist candidates and move them into hiring
                stages.
              </p>
            </div>

            <div className="applications-summary">
              <button onClick={() => setActiveTab("All")}>
                <span>Total Applications</span>
                <h2>{applications.length}</h2>
              </button>

              <button onClick={() => setActiveTab("Applied")}>
                <span>New Applied</span>
                <h2>{countStatus("Applied")}</h2>
              </button>

              <button onClick={() => setActiveTab("Screening")}>
                <span>Screening</span>
                <h2>{countStatus("Screening")}</h2>
              </button>

              <button onClick={() => setActiveTab("Interview")}>
                <span>Interview</span>
                <h2>{countStatus("Interview")}</h2>
              </button>
            </div>
          </section>

          <section className="applications-tabs">
            {["All", "Applied", "Screening", "Interview"].map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </section>

          <section className="applications-list">
            {filtered.length ? (
              filtered.map((app) => (
                <div className="application-card" key={app._id}>
                  <div className="application-profile">
                    <div className="application-avatar">
                      {app.name?.charAt(0) || "C"}
                    </div>

                    <div>
                      <h2>{app.name}</h2>
                      <p>
                        {app.currentRole || "Candidate"} •{" "}
                        {app.experienceYears || 0} Years •{" "}
                        {app.location || "Location not added"}
                      </p>

                      <div className="application-skills">
                        {app.skills?.map((skill, i) => (
                          <span key={i}>{skill.name || skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="application-job">
                    <span>Applied For</span>
                    <h3>{app.currentRole || "Job Role"}</h3>
                    <p>{app.status || "Applied"}</p>
                  </div>

                  <div className="application-score">
                    <h2>92%</h2>
                    <p>AI Match</p>
                  </div>

                  <div className="application-actions">
                    <button onClick={() => openProfile(app)}>
                      👁 View Profile
                    </button>

                    <button onClick={() => shortlistCandidate(app)}>
                      ⭐ Shortlist
                    </button>

                    <button onClick={() => moveInterview(app)}>
                      🎯 Move Interview
                    </button>

                    <button
                      className="reject-btn"
                      onClick={() => rejectApplication(app)}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-box">
                No applications found.
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}
function UltimateDashboard({ children = null }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const candidateId = user?.candidateId || user?._id || user?.id || "";
  const name = user?.name || user?.fullName || "Candidate";

  const [aiQuestion, setAiQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    resumeScore: 0,
    jobMatchScore: 0,
    trustScore: 0,
    applications: [],
    autoApply: [],
    jobs: [],
    hiddenJobs: [],
    savedJobs: [],
    notifications: [],
    interviews: [],
  });

  const goTo = (path) => {
    window.location.href = path;
  };

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const getArray = (res, keys = []) => {
    if (res.status !== "fulfilled") return [];
    const body = res.value?.data;

    for (const key of keys) {
      if (Array.isArray(body?.[key])) return body[key];
    }

    if (Array.isArray(body?.data)) return body.data;
    if (Array.isArray(body)) return body;

    return [];
  };

  const getObject = (res, keys = []) => {
    if (res.status !== "fulfilled") return {};
    const body = res.value?.data;

    for (const key of keys) {
      if (body?.[key] && typeof body[key] === "object") return body[key];
    }

    if (body?.data && typeof body.data === "object") return body.data;
    if (body && typeof body === "object") return body;

    return {};
  };

  const loadUltimateRealData = async () => {
    if (!candidateId) {
      goTo("/candidate-login");
      return;
    }

    try {
      setLoading(true);
      const headers = authHeaders();

      const [
        candidateRes,
        applicationsRes,
        jobsRes,
        hiddenJobsRes,
        savedJobsRes,
        notificationsRes,
        autoApplyRes,
        interviewsRes,
      ] = await Promise.allSettled([
        axios.get(`${API_URL}/api/candidates/${candidateId}`, { headers }),
        axios.get(`${API_URL}/api/applications/candidate/${candidateId}`, { headers }),
        axios.get(`${API_URL}/api/jobs`, { headers }),
        axios.get(`${API_URL}/api/jobs/hidden`, { headers }),
        axios.get(`${API_URL}/api/jobs/saved/${candidateId}`, { headers }),
        axios.get(`${API_URL}/api/notifications/candidate/${candidateId}`, { headers }),
        axios.get(`${API_URL}/api/auto-apply/candidate/${candidateId}`, { headers }),
        axios.get(`${API_URL}/api/interviews/candidate/${candidateId}`, { headers }),
      ]);

      const candidate = getObject(candidateRes, ["candidate", "user"]);

      const applications = getArray(applicationsRes, ["applications", "items", "results"]);
      const jobs = getArray(jobsRes, ["jobs", "items", "results"]);
      const hiddenJobs = getArray(hiddenJobsRes, ["jobs", "hiddenJobs", "items", "results"]);
      const savedJobs = getArray(savedJobsRes, ["jobs", "savedJobs", "items", "results"]);
      const notifications = getArray(notificationsRes, ["notifications", "items", "results"]);
      const autoApply = getArray(autoApplyRes, ["applications", "autoApply", "autoApplications", "items", "results"]);
      const directInterviews = getArray(interviewsRes, ["interviews", "items", "results"]);

      const interviewApplications = applications.filter((app) =>
        String(app.status || app.applicationStatus || "")
          .toLowerCase()
          .includes("interview")
      );

      setData({
        resumeScore: Number(candidate.resumeScore || candidate.atsScore || 0),
        jobMatchScore: Number(candidate.jobMatchScore || candidate.aiMatchScore || 0),
        trustScore: Number(candidate.trustScore || candidate.profileStrength || 0),
        applications,
        autoApply,
        jobs,
        hiddenJobs,
        savedJobs,
        notifications,
        interviews: directInterviews.length ? directInterviews : interviewApplications,
      });
    } catch (error) {
      console.log("ULTIMATE REAL DATA ERROR:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUltimateRealData();
  }, [candidateId]);

  const jobAlerts = data.notifications.filter((n) =>
    String(n.type || n.category || n.notificationType || "")
      .toLowerCase()
      .includes("job")
  );

  const stats = [
    ["💼", "Resume Score", `${data.resumeScore}%`, "ATS Optimized"],
    ["👤", "Job Match Score", `${data.jobMatchScore}%`, "High Fit Roles"],
    ["🛡", "Trust Score", `${data.trustScore}%`, "Verified Profile"],
    ["💼", "Applications", data.applications.length, "Active Applications"],
    ["🚀", "Auto Apply", data.autoApply.length, "Applications Sent"],
  ];

  const tools = [
    ["⚡", "Auto Apply Engine", "Smart Apply to Jobs", "/auto-apply"],
    ["📄", "Resume Studio", "Build ATS Resume", "/resume-studio"],
    ["🎯", "Match Score", "Check Job Fit", "/jobs"],
    ["🧠", "Skill Gap Analyzer", "Find Missing Skills", "/skill-analyzer"],
    ["🎤", "Interview Prep Hub", "Practice Interviews", "/ai-interview-prep"],
    ["💰", "Salary Predictor", "Predict Salary Range", "/salary-predictor"],
    ["🛡", "Trust Passport", "Verify Your Profile", "/trust-passport"],
    ["🔔", "Instant Job Alerts", "Real-time Alerts", "/job-alerts"],
    ["💎", "Hidden Opportunities", "Exclusive Jobs", "/hidden-opportunities"],
  ];

return (
  <main className="ultimate-pro-page">
    <aside className="ultimate-pro-sidebar">
      <div className="ultimate-brand ultimate-brand-big">
        <img
          src="/logo.png"
          alt="NoPromptJobs"
          className="ultimate-brand-logo-big"
        />
      </div>

      <nav className="ultimate-menu ultimate-menu-top-gap">
        <button
          className={!children ? "active" : ""}
          onClick={() => goTo("/ultimate-dashboard")}
        >
          🏠 Dashboard
        </button>

        <button onClick={() => goTo("/applications")}>
          ▣ Applications <b>{data.applications.length}</b>
        </button>

        <button onClick={() => goTo("/services")}>
          🤖 AI Workspace
        </button>

        <button
          className={children ? "active" : ""}
          onClick={() => goTo("/resume-studio")}
        >
          📄 Resume Studio
        </button>

        <button onClick={() => window.open("/ai-interview-prep", "_blank")}>
  🎤 AI Interview Prep
</button>

        <button onClick={() => goTo("/skill-analyzer")}>
          📊 Skill Analyzer
        </button>

        <button onClick={() => goTo("/salary-predictor")}>
          💰 Salary Predictor
        </button>

        <button onClick={() => goTo("/job-alerts")}>
          🔔 Job Alerts <b>{jobAlerts.length}</b>
        </button>

        <button onClick={() => goTo("/saved-jobs")}>
          ❤️ Saved Jobs <b>{data.savedJobs.length}</b>
        </button>

        <button onClick={() => goTo("/hidden-opportunities")}>
          💎 Hidden Opportunities <b>{data.hiddenJobs.length}</b>
        </button>

        <button onClick={() => goTo("/career-roadmap")}>
          🧭 Career Roadmap
        </button>

        <button
          onClick={() =>
            goTo(candidateId ? `/profile/${candidateId}` : "/candidate-login")
          }
        >
          👤 Profile
        </button>

        <button onClick={() => goTo("/settings")}>
          ⚙ Settings
        </button>
      </nav>
    </aside>

    <section className="ultimate-pro-main">
      <header className="ultimate-pro-topbar">
        <button className="menu-btn">☰</button>

        <div className="ultimate-search">
          <span>⌕</span>
          <input placeholder="Search jobs, companies, skills..." />
          <b>⌘ K</b>
        </div>

        <button className="ai-btn" onClick={() => goTo("/services")}>
          ✨ AI Assistant
        </button>

        <button className="icon-btn" onClick={() => goTo("/notifications")}>
          🔔 <b>{jobAlerts.length}</b>
        </button>

        <button className="icon-btn" onClick={() => goTo("/interview-alerts")}>
          💬 <b>{data.interviews.length}</b>
        </button>

        <div
          className="ultimate-user"
          onClick={() =>
            goTo(candidateId ? `/profile/${candidateId}` : "/candidate-login")
          }
        >
          <img src={user?.profileImageUrl || "/profile.png"} alt="Candidate" />

          <div>
            <h4>{name}</h4>
            <p>Verified Candidate 💙</p>
          </div>

          <span>⌄</span>
        </div>
      </header>

      {children ? (
        <section className="ultimate-dashboard-child-content">
          {children}
        </section>
      ) : (
        <>
          <section className="ultimate-stats-row">
            {stats.map((item) => (
              <article className="ultimate-stat-card" key={item[1]}>
                <div className="stat-icon">{item[0]}</div>

                <div>
                  <p>{item[1]}</p>
                  <h2>{loading ? "..." : item[2]}</h2>
                  <small>{item[3]}</small>
                </div>

                <i></i>
              </article>
            ))}
          </section>

          <section className="ultimate-dashboard-grid">
            <section
              className="ultimate-workspace-card ultimate-workspace-clickable"
              onDoubleClick={() => goTo("/services")}
            >
              <div className="section-head">
                <div>
                  <h2>Workspace</h2>
                  <p>Powerful tools to supercharge your career</p>
                </div>

                <button onClick={() => goTo("/services")}>
                  View All Tools →
                </button>
              </div>

              <div className="ultimate-tool-grid">
                {tools.map((tool) => (
                  <button
                    key={tool[1]}
                    className="ultimate-tool-card"
                    onClick={() => goTo(tool[3])}
                  >
                    <span>{tool[0]}</span>

                    <div>
                      <h3>{tool[1]}</h3>
                      <p>{tool[2]}</p>
                    </div>

                    <em>›</em>
                  </button>
                ))}
              </div>
            </section>

            <section className="ultimate-right-column">
              <div className="ultimate-career-card">
                <h2>Career Assistant</h2>
                <p>Ask anything about your career</p>

                <div className="assistant-input">
                  <input
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    placeholder="Example: How can I become a Data Engineer in 6 months?"
                  />

                  <button onClick={() => goTo("/services")}>➤</button>
                </div>

                <div className="assistant-tags">
                  <button onClick={() => goTo("/resume-studio")}>
                    Improve my resume
                  </button>

                  <button onClick={() => goTo("/jobs")}>
                    Find high paying jobs
                  </button>

                  <button onClick={() => goTo("/ai-interview-prep")}>
                    Interview tips
                  </button>

                  <button onClick={() => goTo("/services")}>
                    Skill roadmap
                  </button>
                </div>
              </div>

              <div className="ultimate-insight-row">
                <div className="application-overview-card">
                  <div className="section-head compact">
                    <h2>Application Overview</h2>

                    <button onClick={() => goTo("/applications")}>
                      View Analytics →
                    </button>
                  </div>

                  <div className="donut-layout">
                    <div className="donut-chart">
                      <div>
                        <h3>{data.applications.length}</h3>
                        <p>Total</p>
                      </div>
                    </div>

                    <div className="donut-list">
                      <p>
                        <span className="blue"></span> Applications{" "}
                        <b>{data.applications.length}</b>
                      </p>

                      <p>
                        <span className="green"></span> Interviews{" "}
                        <b>{data.interviews.length}</b>
                      </p>

                      <p>
                        <span className="purple"></span> Job Alerts{" "}
                        <b>{jobAlerts.length}</b>
                      </p>

                      <p>
                        <span className="orange"></span> Hidden Jobs{" "}
                        <b>{data.hiddenJobs.length}</b>
                      </p>

                      <p>
                        <span className="pink"></span> Saved Jobs{" "}
                        <b>{data.savedJobs.length}</b>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="upcoming-card">
                  <div className="section-head compact">
                    <h2>Upcoming</h2>

                    <button onClick={() => goTo("/interview-alerts")}>
                      View All →
                    </button>
                  </div>

                  {data.interviews.slice(0, 3).length === 0 ? (
                    <div className="ultimate-empty-box">
                      No upcoming interviews
                    </div>
                  ) : (
                    data.interviews.slice(0, 3).map((item, index) => (
                      <div className="upcoming-row" key={item._id || index}>
                        <span>📅</span>

                        <div>
                          <h4>
                            {item.title ||
                              item.round ||
                              item.interviewType ||
                              "Interview"}
                          </h4>

                          <p>
                            {item.company ||
                              item.companyName ||
                              item.job?.company ||
                              "Company"}
                          </p>
                        </div>

                        <b>
                          {item.date
                            ? new Date(item.date).toLocaleDateString()
                            : "-"}
                        </b>

                        <small>{item.time || "-"}</small>
                      </div>
                    ))
                  )}

                  <button
                    className="calendar-btn"
                    onClick={() => goTo("/interview-alerts")}
                  >
                    + Add to Calendar
                  </button>
                </div>
              </div>
            </section>
          </section>

          <section className="ultimate-roadmap-card">
            <div className="section-head">
              <div>
                <h2>Your Roadmap</h2>
                <p>Personalized steps to achieve your dream career</p>
              </div>

              <button onClick={() => goTo("/career-roadmap")}>
                View Full Roadmap →
              </button>
            </div>

            <div className="roadmap-line">
              {[
                [
                  "✅",
                  "Step 1",
                  "Improve Resume Score",
                  data.resumeScore >= 80 ? "Completed" : "Pending",
                ],
                [
                  "🛡",
                  "Step 2",
                  "Complete Trust Passport",
                  data.trustScore >= 80 ? "Completed" : "In Progress",
                ],
                [
                  "💼",
                  "Step 3",
                  "Apply to Match Jobs",
                  data.applications.length > 0 ? "In Progress" : "Pending",
                ],
                [
                  "👥",
                  "Step 4",
                  "Practice Interviews",
                  data.interviews.length > 0 ? "In Progress" : "Upcoming",
                ],
                ["⭐", "Step 5", "Ace Interviews", "Upcoming"],
              ].map((step) => (
                <article key={step[1]}>
                  <span>{step[0]}</span>
                  <small>{step[1]}</small>
                  <h3>{step[2]}</h3>
                  <p>{step[3]}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      <UltimatePremiumFooter />
    </section>
  </main>
);}
function UltimatePremiumFooter() {
  const goTo = (path) => {
    window.location.href = path;
  };

  return (
    <footer className="ultimate-footer">
      <div className="ultimate-footer-grid">
        <div>
          <div className="footer-brand">
            <div className="ultimate-logo">NP</div>
            <div>
              <h3>NOPROMPTJOBS.COM</h3>
              <p>SMART HIRING. REAL CAREERS.</p>
            </div>
          </div>

          <p>
            Connecting verified talent with trusted opportunities through smart
            technology and real insights.
          </p>

          <div className="footer-socials">
            <button>in</button>
            <button>X</button>
            <button>f</button>
            <button>◎</button>
            <button>▶</button>
          </div>
        </div>

        <div>
          <h4>FOR CANDIDATES</h4>
          <button onClick={() => goTo("/jobs")}>Browse Jobs</button>
          <button onClick={() => goTo("/resume-studio")}>Resume Studio</button>
          <button onClick={() => goTo("/ai-interview-prep")}>AI Interview Prep</button>
          <button onClick={() => goTo("/skill-analyzer")}>Skill Analyzer</button>
          <button onClick={() => goTo("/salary-predictor")}>Salary Predictor</button>
        </div>

        <div>
          <h4>FOR EMPLOYERS</h4>
          <button onClick={() => goTo("/recruiter-post-job")}>Post a Job</button>
          <button onClick={() => goTo("/recruiter-search")}>Search Candidates</button>
          <button onClick={() => goTo("/recruiter-login")}>Recruiter Login</button>
          <button onClick={() => goTo("/pricing")}>Pricing Plans</button>
          <button onClick={() => goTo("/company-profile")}>Company Branding</button>
        </div>

        <div>
          <h4>COMPANY</h4>
          <button onClick={() => goTo("/about")}>About Us</button>
          <button onClick={() => goTo("/how-it-works")}>How It Works</button>
          <button onClick={() => goTo("/blog")}>Blog</button>
          <button onClick={() => goTo("/careers")}>Careers</button>
          <button onClick={() => goTo("/contact")}>Contact Us</button>
        </div>

        <div>
          <h4>STAY UPDATED</h4>
          <p>Get latest jobs and career insights straight to your inbox.</p>

          <div className="footer-subscribe">
            <input placeholder="Enter your email" />
            <button>Subscribe</button>
          </div>

          <div className="store-buttons">
            <span>▶ Google Play</span>
            <span> App Store</span>
          </div>
        </div>
      </div>

      <div className="ultimate-footer-bottom">
        <p>© 2026 NoPromptJobs.com. All rights reserved.</p>
        <span>🛡 Secure & Verified Platform</span>
        <span>🌐 ISO 27001 Certified</span>
        <span>🇮🇳 Made with ❤️ in India</span>
      </div>
    </footer>
  );
}
function SettingsPage() {
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <>
      <Navbar />

      <main className="settings-saas-page">
        <section className="settings-saas-hero">
          <div>
            <span>⚙️ Candidate Control Center</span>
            <h1>Account Settings</h1>
            <p>
              Manage your profile security, notification preferences,
              subscription, privacy and account experience.
            </p>
          </div>

          <div className="settings-profile-card">
            <div className="settings-avatar">
              {(user.name || user.email || "V").charAt(0).toUpperCase()}
            </div>
            <h3>{user.name || "VENKATESHA A"}</h3>
            <p>{user.email || "venkateshisbm01@gmail.com"}</p>
            <b>✅ Verified Candidate</b>
          </div>
        </section>

        <section className="settings-layout">
          <aside className="settings-left-panel">
            <button className="active">👤 Account</button>
            <button>🔒 Security</button>
            <button>🔔 Notifications</button>
            <button>🛡 Privacy</button>
            <button>💳 Subscription</button>
            <button onClick={logout} className="danger">🚪 Logout</button>
          </aside>

          <section className="settings-main-panel">
            <div className="settings-panel-header">
              <div>
                <h2>Account Preferences</h2>
                <p>Update how your NoPromptJobs account works.</p>
              </div>
              <button>Save Changes</button>
            </div>

            <div className="settings-card-grid">
              <div className="saas-setting-card">
                <div className="setting-icon">🌙</div>
                <h3>Appearance</h3>
                <p>Choose your dashboard theme and visual preference.</p>
                <div className="setting-action-row">
                  <span>Dark Mode</span>
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <b></b>
                  </label>
                </div>
              </div>

              <div className="saas-setting-card">
                <div className="setting-icon">🔐</div>
                <h3>Password & Security</h3>
                <p>Change password and protect your account access.</p>
                <button>Change Password</button>
              </div>

              <div className="saas-setting-card">
                <div className="setting-icon">🔔</div>
                <h3>Job Notifications</h3>
                <p>Control job alerts, recruiter views and interview reminders.</p>
                <button>Manage Alerts</button>
              </div>

              <div className="saas-setting-card">
                <div className="setting-icon">🛡</div>
                <h3>Profile Privacy</h3>
                <p>Manage recruiter visibility and public profile access.</p>
                <button>Privacy Settings</button>
              </div>

              <div className="saas-setting-card wide">
                <div className="setting-icon">💎</div>
                <h3>NoPromptJobs Pro</h3>
                <p>
                  Upgrade to unlock auto apply,  resume studio, salary
                  predictor, hidden opportunities and premium recruiter reach.
                </p>
                <button onClick={() => (window.location.href = "/services")}>
                  View Plans
                </button>
              </div>

              <div className="saas-setting-card wide danger-zone">
                <div className="setting-icon">⚠️</div>
                <h3>Logout Zone</h3>
                <p>Logout from this device or manage account deletion later.</p>
                <button onClick={logout}>Logout Account</button>
              </div>
            </div>
          </section>
        </section>
      </main>
    </>
  );
}function RecruiterSettingsPage(){

const setTheme=(theme)=>{

localStorage.setItem(
"theme",
theme
);

document.body.className=theme;

};

return(

<>
<Navbar/>

<div className="applications-layout">

<RecruiterAdvancedSidebar/>

<main className="applications-main">

<div className="report-card">

<h1>⚙ Settings</h1>

<p>Change appearance and recruiter preferences</p>

<button
onClick={()=>setTheme("theme-light")}
>
☀ Light
</button>

<button
onClick={()=>setTheme("theme-dark")}
>
🌙 Dark
</button>

<button
onClick={()=>setTheme("theme-soft")}
>
🎨 Soft
</button>

</div>

</main>
</div>
</>

);

}
function RecruiterProfilePage() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <>
      <Navbar />

      <div className="applications-layout">
        <RecruiterAdvancedSidebar />

        <main className="applications-main">
          <section className="applications-hero">
            <div>
              <h1>👤 Recruiter Profile</h1>
              <p>Manage recruiter identity, contact details and hiring role.</p>
            </div>
          </section>

          <section className="profile-settings-grid">
            <div className="profile-settings-card">
              <h2>Recruiter Details</h2>

              <label>
                Full Name
                <input defaultValue="Recruiter" />
              </label>

              <label>
                Work Email
                <input defaultValue={user?.email || ""} />
              </label>

              <label>
                Designation
                <input defaultValue="HR Manager" />
              </label>

              <label>
                Phone Number
                <input placeholder="Enter phone number" />
              </label>

              <button onClick={() => alert("Recruiter profile saved")}>
                Save Profile
              </button>
            </div>

            <div className="profile-settings-card">
              <h2>Hiring Access</h2>

              <p>✅ Can post jobs</p>
              <p>✅ Can shortlist candidates</p>
              <p>✅ Can view applications</p>
              <p>✅ Can manage interview stages</p>

              <button onClick={() => alert("Access settings coming soon")}>
                Manage Access
              </button>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

function CompanyProfilePage() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <>
      <Navbar />

      <div className="applications-layout">
        <RecruiterAdvancedSidebar />

        <main className="applications-main">
          <section className="applications-hero">
            <div>
              <h1>🏢 Company Profile</h1>
              <p>Manage company branding, hiring details and verification.</p>
            </div>
          </section>

          <section className="profile-settings-grid">
            <div className="profile-settings-card">
              <h2>Company Details</h2>

              <label>
                Company Name
                <input defaultValue={user?.company || "Tech Solutions Inc."} />
              </label>

              <label>
                Industry
                <input defaultValue="Information Technology" />
              </label>

              <label>
                Company Website
                <input placeholder="https://company.com" />
              </label>

              <label>
                Company Location
                <input placeholder="Bangalore, India" />
              </label>

              <textarea placeholder="Company description"></textarea>

              <button onClick={() => alert("Company profile saved")}>
                Save Company
              </button>
            </div>

            <div className="profile-settings-card">
              <h2>Company Verification</h2>

              <p>✅ Work email verified</p>
              <p>⚠️ GST / CIN not uploaded</p>
              <p>⚠️ Company logo missing</p>
              <p>✅ Recruiter account active</p>

              <button onClick={() => alert("Verification upload coming soon")}>
                Upload Verification
              </button>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
function RecruiterNotificationsPage() {
  const notifications = [
    {
      id: 1,
      title: "New Application Received",
      message: "Cheluvaraju applied for Data Engineer role.",
      time: "5 minutes ago",
      type: "application",
    },
    {
      id: 2,
      title: "Candidate Shortlisted",
      message: "A candidate was moved to shortlisted pipeline.",
      time: "20 minutes ago",
      type: "shortlist",
    },
    {
      id: 3,
      title: "Interview Reminder",
      message: "Technical round pending for Frontend Developer candidate.",
      time: "1 hour ago",
      type: "interview",
    },
    {
      id: 4,
      title: "Job Visibility Improved",
      message: "Your Data Engineer job received 42 profile views today.",
      time: "Today",
      type: "job",
    },
  ];

  return (
    <>
      <Navbar />

      <div className="applications-layout">
        <RecruiterAdvancedSidebar />

        <main className="applications-main">
          <section className="applications-hero">
            <div>
              <h1>🔔 Notifications</h1>
              <p>Track recruiter alerts, applications, interviews and hiring updates.</p>
            </div>
          </section>

          <section className="notification-list-page">
            {notifications.map((item) => (
              <div className="notification-card-pro" key={item.id}>
                <div className="notification-icon-pro">
                  {item.type === "application" && "📄"}
                  {item.type === "shortlist" && "⭐"}
                  {item.type === "interview" && "🎯"}
                  {item.type === "job" && "💼"}
                </div>

                <div>
                  <h3>{item.title}</h3>
                  <p>{item.message}</p>
                  <span>{item.time}</span>
                </div>

                <button onClick={() => alert(item.title)}>
                  View
                </button>
              </div>
            ))}
          </section>
        </main>
      </div>
    </>
  );
}
  

    function RecruiterJobDetailsPage() {
      const [job, setJob] = useState(null);
      const id = window.location.pathname.split("/").pop();

      useEffect(() => {
        const loadJob = async () => {
          try {
            const res = await axios.get(`${API_URL}/api/jobs/${id}`);
            setJob(res.data);
          } catch (err) {
            console.log(err.response?.data || err.message);
            alert("Job details loading failed");
          }
        };

        loadJob();
      }, [id]);

  if (!job) {
    return <div className="loading">Loading job details...</div>;
  }

  return (
    <>
      <Navbar />

      <div className="applications-layout">
        <RecruiterAdvancedSidebar />

        <main className="applications-main">
          <section className="applications-hero">
            <div>
              <h1>{job.title}</h1>
              <p>{job.company} • {job.location}</p>
            </div>

            <button onClick={() => window.location.href = "/recruiter-dashboard"}>
              Back to Dashboard
            </button>
          </section>

          <div className="report-card">
            <h2>Job Details</h2>
            <p><b>Work Mode:</b> {job.workMode || "Not added"}</p>
            <p><b>Experience:</b> {job.experienceMin || 0} - {job.experienceMax || 0} years</p>
            <p><b>Salary:</b> {job.salary || "Not added"}</p>
            <p><b>Skills:</b> {job.skills?.join(", ") || "Not added"}</p>
            <p><b>Description:</b> {job.description || "Not added"}</p>
          </div>
        </main>
      </div>
    </>
  );
}
function RecruiterScreeningPage() {

const questions=[

{
role:"Data Engineer",
items:[
"Explain your recent project.",
"What is PySpark?",
"Difference between SQL and NoSQL?",
"How do you optimize ETL pipelines?"
]
},

{
role:"Frontend Developer",
items:[
"Explain React lifecycle",
"What is useEffect?",
"Difference between state and props?",
"How do you improve performance?"
]
},

{
role:"Java Developer",
items:[
"Difference between JVM and JDK?",
"What is Spring Boot?",
"Explain multithreading",
"What is dependency injection?"
]
}

];

return(
<>

<Navbar/>

<div className="applications-layout">

<RecruiterAdvancedSidebar/>

<main className="applications-main">

<section className="applications-hero">

<div>

<h1>🧪 HR Screening Questions</h1>

<p>
Create and manage recruiter screening templates.
</p>

</div>

</section>

<div className="interview-stage-grid">

{questions.map((q,index)=>(

<div
className="stage-card"
key={index}
>

<h2>{q.role}</h2>

<div className="screen-question-list">

{q.items.map((item,i)=>(

<div
className="question-box"
key={i}
>

✅ {item}

</div>

))}

</div>

<button
onClick={()=>
alert(
`${q.role} template copied`
)
}
>
Copy Questions
</button>

</div>

))}

</div>

</main>

</div>

</>

)

}
function RecruiterAIAssistantPage() {
  const [jobText, setJobText] = useState("");
  const [result, setResult] = useState("");

  const generateAI = () => {
    if (!jobText.trim()) {
      alert("Please enter job title or description");
      return;
    }

    setResult(`
Job Description:
We are looking for a skilled ${jobText} who can work with modern tools, solve business problems, and deliver high-quality results.

Responsibilities:
• Understand business requirements
• Work with team members and stakeholders
• Build scalable and reliable solutions
• Maintain documentation and best practices

Required Skills:
• Strong technical knowledge
• Good communication skills
• Problem-solving ability
• Project experience

Recruiter Screening Questions:
1. Explain your recent project.
2. What tools did you use?
3. How do you handle production issues?
4. Why are you looking for change?
    `);
  };

  return (
    <>
      <Navbar />

      <div className="applications-layout">
        <RecruiterAdvancedSidebar />

        <main className="applications-main">
          <section className="applications-hero">
            <div>
              <h1>🤖 AI Job Assistant</h1>
              <p>Create better job descriptions, skills and screening questions.</p>
            </div>
          </section>

          <div className="ai-assistant-card">
            <h2>Generate Job Content</h2>

            <textarea
              placeholder="Enter role name or rough job description..."
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
            />

            <button onClick={generateAI}>
              Generate with AI
            </button>
          </div>

          {result && (
            <div className="ai-output-card">
              <h2>AI Generated Output</h2>
              <pre>{result}</pre>

              <button onClick={() => navigator.clipboard.writeText(result)}>
                Copy Content
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
function RecruiterInterviewStagesPage() {
  const stages = [
    {
      title: "Application Received",
      count: 18,
      color: "#3b82f6"
    },
    {
      title: "Screening",
      count: 10,
      color: "#8b5cf6"
    },
    {
      title: "Technical Interview",
      count: 6,
      color: "#14b8a6"
    },
    {
      title: "HR Round",
      count: 3,
      color: "#f59e0b"
    },
    {
      title: "Selected",
      count: 2,
      color: "#22c55e"
    }
  ];

  return (
  <>
    <Navbar />

    <div className="applications-layout">
      <RecruiterAdvancedSidebar />

      <main className="applications-main">

        <section className="applications-hero">
          <div>
            <h1>🎯 Interview Pipeline</h1>

            <p>
              Track candidate movement across hiring stages.
            </p>
          </div>
        </section>

        <div className="interview-stage-grid">
          {stages.map((stage, index) => (

            <div
              className="stage-card"
              key={index}
              style={{
                borderTop: `4px solid ${stage.color}`
              }}
            >
              <h3>{stage.title}</h3>

              <h1>{stage.count}</h1>

              <button
                onClick={() =>
                  window.location.href =
                  "/recruiter-applications"
                }
              >
                View Candidates →
              </button>

            </div>

          ))}
        </div>

        <div className="report-card">

          <h2>Hiring Flow</h2>

          <div className="pipeline-flow">

            <span>Applied</span>

            <span>→</span>

            <span>Screening</span>

            <span>→</span>

            <span>Technical</span>

            <span>→</span>

            <span>HR</span>

            <span>→</span>

            <span>Offer</span>

          </div>

        </div>

      </main>
    </div>
  </>
);}
function RecruiterTeamPage() {
  const [team, setTeam] = useState([
    {
      name: "Recruiter Admin",
      role: "Hiring Manager",
      email: "admin@company.com",
      access: "Full Access",
    },
    {
      name: "HR Executive",
      role: "Recruiter",
      email: "hr@company.com",
      access: "Candidate Access",
    },
  ]);

  const inviteMember = () => {
    const name = prompt("Enter member name:");
    if (!name) return;

    const email = prompt("Enter member email:");
    if (!email) return;

    const role = prompt("Enter role:", "Recruiter");
    if (!role) return;

    const access = prompt(
      "Enter access:",
      "Candidate Access"
    );

    setTeam([
      ...team,
      {
        name,
        role,
        email,
        access: access || "Candidate Access",
      },
    ]);

    alert("Team member invited");
  };

  const editMember = (index) => {
    const current = team[index];

    const name = prompt("Edit name:", current.name);
    if (!name) return;

    const role = prompt("Edit role:", current.role);
    if (!role) return;

    const email = prompt("Edit email:", current.email);
    if (!email) return;

    const access = prompt("Edit access:", current.access);
    if (!access) return;

    const updated = [...team];

    updated[index] = {
      name,
      role,
      email,
      access,
    };

    setTeam(updated);

    alert("Member updated");
  };

  const removeMember = (index) => {
    const confirmDelete = window.confirm(
      "Remove this team member?"
    );

    if (!confirmDelete) return;

    const updated = team.filter((_, i) => i !== index);

    setTeam(updated);
  };

  return (
    <>
      <Navbar />

      <div className="applications-layout">
        <RecruiterAdvancedSidebar />

        <main className="applications-main">
          <section className="applications-hero">
            <div>
              <h1>👥 Team Members</h1>
              <p>
                Manage HR users, recruiter roles and hiring access.
              </p>
            </div>

            <button onClick={inviteMember}>
              + Invite Member
            </button>
          </section>

          <section className="applications-list">
            {team.length ? (
              team.map((member, index) => (
                <div className="application-card" key={index}>
                  <div className="application-profile">
                    <div className="application-avatar">
                      {member.name?.charAt(0) || "T"}
                    </div>

                    <div>
                      <h2>{member.name}</h2>
                      <p>{member.role}</p>
                    </div>
                  </div>

                  <div className="application-job">
                    <span>Email</span>
                    <h3>{member.email}</h3>
                  </div>

                  <div className="application-score">
                    <h2>{member.access}</h2>
                    <p>Permission</p>
                  </div>

                  <div className="application-actions">
                    <button onClick={() => editMember(index)}>
                      ✏️ Edit
                    </button>

                    <button
                      className="reject-btn"
                      onClick={() => removeMember(index)}
                    >
                      ❌ Remove
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-box">
                No team members added.
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}
function RecruiterBillingPage() {
  const plans = [
    {
      name: "Free",
      price: "₹0",
      tag: "Starter",
      desc: "For testing basic hiring tools",
      features: [
        "Post 1 job",
        "Basic candidate search",
        "Limited shortlist access",
        "Basic dashboard",
      ],
      current: true,
    },
    {
      name: "Growth",
      price: "₹4,999",
      tag: "Most Popular",
      desc: "For startups hiring regularly",
      features: [
        "Post 10 jobs",
        "Advanced candidate filters",
        "Shortlist pipeline",
        "Applications dashboard",
        "Recruiter notes",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "₹14,999",
      tag: "Premium",
      desc: "For companies with full hiring teams",
      features: [
        "Unlimited jobs",
        "Team members",
        "Interview stages",
        "AI Job Assistant",
        "Premium visibility",
        "Priority support",
      ],
    },
  ];

  return (
    <>
      <Navbar />

      <div className="billing-saas-layout">
        <RecruiterAdvancedSidebar />

        <main className="billing-saas-main">
          <section className="billing-hero-premium">
            <div>z
              <span className="billing-badge">👑 NO Proxy Talent Pro</span>
              <h1>Billing & Plans</h1>
              <p>
                Upgrade your hiring workspace with advanced search, hiring tools,
                interview pipeline and premium recruiter features.
              </p>
            </div>

            <div className="current-plan-card">
              <small>CURRENT PLAN</small>
              <h2>Free</h2>
              <p>No payment yet</p>
            </div>
          </section>

          <section className="billing-stats-row">
            <div>
              <span>Jobs Posted</span>
              <h2>7</h2>
              <p>Used this month</p>
            </div>

            <div>
              <span>Candidate Searches</span>
              <h2>142</h2>
              <p>Search activity</p>
            </div>

            <div>
              <span>Shortlists</span>
              <h2>18</h2>
              <p>Candidates saved</p>
            </div>

            <div>
              <span>Plan Health</span>
              <h2>Free</h2>
              <p>Upgrade recommended</p>
            </div>
          </section>

          <section className="plans-grid-premium">
            {plans.map((plan) => (
              <div
                className={`plan-card-premium ${
                  plan.popular ? "popular-plan" : ""
                } ${plan.current ? "current-plan" : ""}`}
                key={plan.name}
              >
                <div className="plan-top">
                  <div>
                    <h2>{plan.name}</h2>
                    <p>{plan.desc}</p>
                  </div>

                  <span>{plan.tag}</span>
                </div>

                <div className="plan-price">
                  <h1>{plan.price}</h1>
                  <small>/month</small>
                </div>

                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>✅ {feature}</li>
                  ))}
                </ul>

                <button className={plan.current ? "current-btn" : "upgrade-btn"}>
                  {plan.current ? "Current Plan" : "Pay & Activate"}
                </button>
              </div>
            ))}
          </section>

          <section className="billing-bottom-grid">
            <div className="billing-panel">
              <h2>Invoice & Payment</h2>

              <div className="billing-info-row">
                <span>Next billing date</span>
                <b>Not active</b>
              </div>

              <div className="billing-info-row">
                <span>Payment method</span>
                <b>Not added</b>
              </div>

              <div className="billing-info-row">
                <span>Billing status</span>
                <b className="green-text">Free Plan</b>
              </div>
            </div>

            <div className="billing-panel">
              <h2>Usage Summary</h2>

              <UsageBar label="Jobs Posted" value="45%" text="7 used" />
              <UsageBar label="Candidate Searches" value="70%" text="142 searches" />
              <UsageBar label="Shortlists" value="30%" text="18 candidates" />
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

function UsageBar({ label, value, text }) {
  return (
    <div className="usage-box">
      <div>
        <b>{label}</b>
        <span>{text}</span>
      </div>

      <div className="usage-track">
        <span style={{ width: value }}></span>
      </div>
    </div>
  );
}
function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

const candidateId =
  user?.candidateId ||
  user?._id ||
  user?.id ||
  "";

const unreadCount =
  Number(user?.unreadMessages) ||
  Number(localStorage.getItem("unreadMessages")) ||
  6;

const profileStrength =
  Number(user?.profileStrength) ||
  Number(localStorage.getItem("profileStrength")) ||
  90;

const goTo = (path) => {
  window.location.href = path;
};

const openProfile = () => {
  if (candidateId) {
    window.location.href = `/profile/${candidateId}`;
  } else {
    window.location.href = "/candidate-login";
  }
};
  const loadCompanies = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/jobs`);
      const data = res.data.jobs || res.data.data || res.data || [];
      const jobList = Array.isArray(data) ? data : [];

      setJobs(jobList);

      const grouped = {};

      jobList.forEach((job) => {
        const companyName = job.company || job.companyName || "Unknown Company";

        if (!grouped[companyName]) {
          grouped[companyName] = {
            name: companyName,
            location: job.location || job.city || "India",
            industry: job.industry || job.department || "Technology",
            jobs: 0,
            logo: companyName.charAt(0).toUpperCase(),
          };
        }

        grouped[companyName].jobs += 1;
      });

      setCompanies(Object.values(grouped));
    } catch (err) {
      console.log("COMPANIES LOAD ERROR:", err.response?.data || err.message);
      setCompanies([]);
      setJobs([]);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const filteredCompanies = companies.filter((company) => {
    const search = searchText.toLowerCase();

    return (
      (!search ||
        company.name.toLowerCase().includes(search) ||
        company.industry.toLowerCase().includes(search) ||
        company.location.toLowerCase().includes(search)) &&
      (!industryFilter ||
        company.industry.toLowerCase().includes(industryFilter.toLowerCase())) &&
      (!locationFilter ||
        company.location.toLowerCase().includes(locationFilter.toLowerCase()))
    );
  });

  const totalLocations = new Set(
    companies.map((c) => c.location).filter(Boolean)
  ).size;

  const totalIndustries = new Set(
    companies.map((c) => c.industry).filter(Boolean)
  ).size;

  return (
    <>
      <main className="companies-saas-page">
        <CandidatePremiumSidebar
          candidateId={candidateId}
          unreadCount={unreadCount}
          profileStrength={profileStrength}
          goTo={goTo}
        />

        <section className="companies-saas-main">
          <header className="npj-compact-topbar companies-topbar">
            <div className="npj-compact-search">
              <button type="button" className="search-btn">
                ⌕
              </button>

              <input
                value={searchText}
                placeholder="Search companies, industries..."
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <div className="npj-compact-userarea">
              <button type="button">🔔{unreadCount > 0 && <b>{unreadCount}</b>}</button>
              <button type="button">✉</button>

              <div className="company-profile-wrapper">

  <div
    className="npj-compact-user"
    onClick={() => setShowProfileMenu(!showProfileMenu)}
    style={{ cursor: "pointer" }}
  >
    <img
      src={user?.profileImageUrl || "/profile.png"}
      alt="Candidate"
    />

    <div>
      <b>{user?.name || "VENKATESHA A"}</b>
      <span>Candidate</span>
    </div>

    <small>⌄</small>
  </div>

  {showProfileMenu && (

    <div className="profile-dropdown">

      <div
        onClick={() =>
          window.location.href = `/profile/${candidateId}`
        }
      >
        👤 My Profile
      </div>

      <div
        onClick={() =>
          window.location.href = `/profile/${candidateId}`
        }
      >
        ✏ Edit Profile
      </div>

      <div
        onClick={() =>
          window.location.href = "/candidate-settings"
        }
      >
        ⚙ Settings
      </div>

      <div>
        ❓ Help Center
      </div>

      <hr />

      <div
        onClick={() => {
          localStorage.removeItem("user");
          window.location.href = "/";
        }}
      >
        ↳ Logout
      </div>

    </div>

  )}

</div>
            </div>
          </header>

          <section className="companies-hero-premium companies-hero-visual">
  <div className="companies-hero-left">
    <span>🛡 Verified Employer Network</span>

    <h1>Explore companies hiring genuine talent</h1>

    <p>
      Discover trusted employers, active openings, company insights and
      verified hiring opportunities.
    </p>

    <div className="companies-hero-stats">
      <b>🏢 {companies.length} Companies</b>
      <b>💼 {jobs.length} Active Jobs</b>
      <b>📍 {totalLocations} Locations</b>
    </div>
  </div>

  <div className="companies-hero-art">
    <div className="city-bg"></div>
    <div className="hero-badge top-rated">⭐ Top Rated</div>
    <div className="hero-badge hiring">👥 Actively Hiring</div>
    <div className="magnifier">⌕</div>
    <div className="person one">👩‍💼</div>
    <div className="person two">👨‍💼</div>
    <div className="shield">✅</div>
  </div>
</section>

<section className="companies-filter-premium">
  <input
    value={searchText}
    placeholder="Search companies by name, industry or location"
    onChange={(e) => setSearchText(e.target.value)}
  />

  <select
    value={industryFilter}
    onChange={(e) => setIndustryFilter(e.target.value)}
  >
    <option value="">All Industries</option>
    <option value="technology">Technology</option>
    <option value="data">Data</option>
    <option value="finance">Finance</option>
    <option value="consulting">Consulting</option>
  </select>

  <select
    value={locationFilter}
    onChange={(e) => setLocationFilter(e.target.value)}
  >
    <option value="">All Locations</option>
    <option value="bangalore">Bangalore</option>
    <option value="hyderabad">Hyderabad</option>
    <option value="chennai">Chennai</option>
    <option value="remote">Remote</option>
  </select>

  <button
    onClick={() => {
      setSearchText("");
      setIndustryFilter("");
      setLocationFilter("");
    }}
  >
    Reset
  </button>
</section>

<section className="companies-layout-premium">
  <section className="companies-left-premium">
    <div className="company-section-head">
      <div>
        <h3>🏢 Top Companies</h3>
        <p>Discover top employers with exciting job opportunities.</p>
      </div>

      <button onClick={() => goTo("/jobs")}>View All →</button>
    </div>

    <div className="companies-scroll-wrapper">
      <div className="companies-auto-track">
        {[...filteredCompanies, ...filteredCompanies, ...filteredCompanies].map(
          (company, index) => (
            <article
              className="company-premium-card company-scroll-card"
              key={`${company.name}-${index}`}
            >
              <div className="company-card-top">
                <div className="company-logo-premium">
                  {company.logo}
                </div>

                <span>{88 + (index % 8)}% Match</span>
              </div>

              <h3>{company.name}</h3>
              <p>{company.industry}</p>

              <div className="company-meta-premium">
                <span>📍 {company.location}</span>
                <span>💼 {company.jobs} open jobs</span>
              </div>

              <div className="company-tags-premium">
                <em>Verified</em>
                <em>Actively Hiring</em>
              </div>

              <button onClick={() => goTo(`/jobs?search=${company.name}`)}>
                View Jobs →
              </button>
            </article>
          )
        )}
      </div>
    </div>

    <section className="why-company-grid">
      <article>
        <span>🛡</span>
        <h4>Verified Employers</h4>
        <p>All companies are verified for genuine job openings.</p>
      </article>

      <article>
        <span>📅</span>
        <h4>Active Opportunities</h4>
        <p>New jobs added regularly from trusted companies.</p>
      </article>

      <article>
        <span>👥</span>
        <h4>Company Insights</h4>
        <p>Get insights on company culture and job trends.</p>
      </article>

      <article>
        <span>✅</span>
        <h4>Easy Applications</h4>
        <p>Apply directly to companies with one click.</p>
      </article>
    </section>
  </section>

  <aside className="companies-right-premium">
    <div className="company-insight-card">
      <h3>📊 Company Insights</h3>

      <div>
        <article>
          <span>🏢</span>
          <b>{companies.length}</b>
          <p>Total Companies</p>
        </article>

        <article>
          <span>💼</span>
          <b>{jobs.length}</b>
          <p>Active Jobs</p>
        </article>

        <article>
          <span>🌍</span>
          <b>{totalLocations}</b>
          <p>Locations</p>
        </article>

        <article>
          <span>📈</span>
          <b>{totalIndustries}</b>
          <p>Industries</p>
        </article>
      </div>
    </div>

    <div className="company-insight-card top-industries-card">
      <h3>🏙 Top Industries</h3>

      {[...new Set(companies.map((c) => c.industry))]
        .slice(0, 5)
        .map((industry, index) => (
          <div className="industry-progress" key={industry}>
            <div>
              <span>{industry}</span>
              <b>{companies.filter((c) => c.industry === industry).length} Companies</b>
            </div>

            <em>
              <i style={{ width: `${85 - index * 12}%` }}></i>
            </em>
          </div>
        ))}
    </div>
  </aside>
</section>
        </section>
      </main>

      <PremiumFooter />
    </>
  );
}
function RecruiterSearch() {
  const [filters, setFilters] = useState({
    keyword: "",
    skill: "",
    minExp: "",
    maxExp: "",
    location: "",
    role: "",
    company: "",
    workMode: "",
    noticePeriod: "",
    jobType: "",
  });

  const [candidates, setCandidates] = useState([]);
  const [note, setNote] = useState("");

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const search = async () => {
    const res = await axios.get(`${API_URL}/search/filter`, {
      params: filters,
    });
    setCandidates(res.data);
  };

  const shortlist = async (id) => {
    await axios.patch(`${API_URL}/api/candidates/${id}/shortlist`);
    search();
  };

  const addNote = async (id) => {
    if (!note.trim()) return alert("Enter note");

    await axios.post(`${API_URL}/api/candidates/${id}/notes`, { note });
    setNote("");
    alert("Note added");
  };

  return (
    <>
      <Navbar />

      <div className="recruiter-shell">
        <section className="hero-box">
          <h1>Recruiter Dashboard</h1>
          <p>Post jobs, search verified candidates, shortlist and add notes.</p>
        </section>

        <JobPostForm />

        <section className="filter-card">
          <input name="keyword" placeholder="Keyword: Data Engineer, Python..." onChange={handleChange} />
          <input name="skill" placeholder="Skill" onChange={handleChange} />
          <input name="minExp" type="number" placeholder="Min Exp" onChange={handleChange} />
          <input name="maxExp" type="number" placeholder="Max Exp" onChange={handleChange} />
          <input name="location" placeholder="Location" onChange={handleChange} />
          <input name="role" placeholder="Role" onChange={handleChange} />
          <input name="company" placeholder="Company" onChange={handleChange} />
          <input name="workMode" placeholder="Remote / Hybrid / Onsite" onChange={handleChange} />
          <input name="noticePeriod" placeholder="Notice Period" onChange={handleChange} />
          <input name="jobType" placeholder="Job Type" onChange={handleChange} />

          <button onClick={search}>Search Candidates</button>
        </section>

        <section className="results">
          {candidates.map((candidate) => (
            <div className="candidate-card" key={candidate._id}>
              <div>
                <h2>{candidate.name}</h2>
                <p>{candidate.currentRole} at {candidate.currentCompany}</p>
                <p>
                  {candidate.experienceYears} yrs • {candidate.location} •{" "}
                  {candidate.noticePeriod}
                </p>
                <p>{candidate.skills?.map((s) => s.name).join(", ")}</p>

                <a href={`/profile/${candidate._id}`}>View Full Profile</a>

                {candidate.resumeUrl && (
                  <a href={candidate.resumeUrl} target="_blank" rel="noreferrer">
                    Download Resume
                  </a>
                )}
              </div>

              <div className="action-box">
                <button onClick={() => shortlist(candidate._id)}>
                  {candidate.shortlisted ? "Remove Shortlist" : "Shortlist"}
                </button>

                <textarea
                  placeholder="Add recruiter note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />

                <button onClick={() => addNote(candidate._id)}>Add Note</button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}

export default App;