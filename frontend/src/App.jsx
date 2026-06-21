import { useEffect, useState } from "react";
import axios from "axios";
import "./index.css";
import JobDetailsPage from "./pages/JobDetailsPage";
import AIInterviewPrepPage from "./pages/AIInterviewPrepPage";
import MobileCandidateDashboard from "./pages/MobileCandidateDashboard";

const API_URL = import.meta.env.VITE_API_URL;


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
              <span>AI Hiring Confidence</span>
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
          <h3>AI Match Score</h3>
          <p>AI-powered matching for better hiring decisions.</p>
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

    if (!email.trim()) {
      setErrorMsg("Email is required");
      return;
    }

    if (!password.trim()) {
      setErrorMsg("Password is required");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${API_URL}/api/candidates/login`, {
        email: email.trim().toLowerCase(),
        password,
      });

      console.log("LOGIN RESPONSE:", response.data);

      const candidate = response.data.candidate || response.data.user;

      localStorage.setItem("user", JSON.stringify(candidate));

      const candidateId =
        candidate?._id ||
        candidate?.id ||
        candidate?.candidateId;

      window.location.href = candidateId
        ? `/dashboard/${candidateId}`
        : "/candidate";
    } catch (error) {
      console.log("LOGIN ERROR:", error.response?.data || error.message);

      setErrorMsg(
        error.response?.data?.message ||
          "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="candidate-login-pro">
      <section className="cl-left">
        <div className="cl-bg-glow cl-glow-one"></div>
        <div className="cl-bg-glow cl-glow-two"></div>

        <div className="cl-company-header">
          <img
            src="/logo.png"
            alt="NoPromptJobs"
            className="company-logo"
          />
        </div>

        <div className="cl-copy">
          <div>
            <h1>Candidate Trust Passport</h1>
            <p>Your verified identity. Your career credibility.</p>
          </div>

          <span className="cl-status">🏅 Excellent</span>
        </div>

        <div className="cl-trust-image">
          <img
            src="/images/trust-passport-login.png"
            alt="Candidate Trust Passport"
          />
        </div>
      </section>

      <section className="cl-right">
        <div className="cl-login-card">
          <span className="cl-pill">Candidate Portal</span>

          <h1>Continue Your Career Journey</h1>

          <p>
            Access your verified profile, AI tools, interview preparation and
            opportunities—all in one place.
          </p>

          {errorMsg && (
            <div className="login-error-box">
              {errorMsg}
            </div>
          )}

          <label>
            Email Address
            <div className="cl-input">
              <span>✉</span>

              <input
                type="email"
                placeholder="candidate@example.com"
                value={email}
                disabled={loading}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMsg("");
                }}
              />
            </div>
          </label>

          <label>
            Password
            <div className="cl-input">
              <span>🔒</span>

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                disabled={loading}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg("");
                }}
              />

              <button
                type="button"
                className="password-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </label>

          <div className="cl-options">
            <label>
              <input type="checkbox" />
              Remember me
            </label>

            <a href="/candidate-forgot-password">
              Forgot password?
            </a>
          </div>

          <button
            type="button"
            className="cl-main-btn"
            disabled={loading}
            onClick={loginCandidate}
          >
            {loading
              ? "Signing you in..."
              : "Access Candidate Dashboard →"}
          </button>

          <div className="cl-new-box">
            <p>New candidate?</p>

            <a href="/candidate-email-verify">
              Create Verified Account
            </a>
          </div>

          <a className="cl-back" href="/">
            ← Back to website
          </a>
        </div>
      </section>
    </main>
  );
}function CandidateEmailVerify() {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const features = [
    {
      img: "/images/ai-resume-builder.png",
      title: "AI Resume Builder",
      text: "Create ATS-optimized resumes instantly.",
    },
    {
      img: "/images/project-proof.png",
      title: "Project Verification",
      text: "Show real project proof and skills.",
    },
    {
      img: "/images/trust-passport.png",
      title: "Trust Passport",
      text: "Global standard trust profile.",
    },
    {
      img: "/images/ai-match-score.png",
      title: "AI Match Score",
      text: "Get matched with the best job opportunities.",
    },
  ];

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

      console.log("OTP RESPONSE:", response.data);

      localStorage.setItem("candidateSignupEmail", signupEmail);
      localStorage.setItem("candidateSignupMobile", mobile.trim());

      setOtpSent(true);
      alert(response.data?.message || "OTP sent to your email");
    } catch (error) {
      console.log("SEND OTP ERROR:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to send OTP");
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

      console.log("VERIFY OTP RESPONSE:", response.data);

      localStorage.setItem("candidateSignupEmail", signupEmail);
      localStorage.setItem("candidateSignupMobile", mobile.trim());
      localStorage.setItem("candidateOtpVerified", "true");

      alert(response.data?.message || "Email verified successfully");
      window.location.href = "/candidate-set-password";
    } catch (error) {
      console.log("VERIFY OTP ERROR:", error.response?.data || error.message);
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
    <main className="np-premium-auth">
      <div className="np-ball np-ball-one"></div>
      <div className="np-ball np-ball-two"></div>
      <div className="np-ball np-ball-three"></div>

      <section className="np-premium-left">
        <div className="np-premium-brand">
          <img src="/logo.png" alt="NoPromptJobs" />
          <div>
            <h2>NOPROMPTJOBS.COM</h2>
            <p>Verified Talent Intelligence Platform</p>
          </div>
        </div>

        <div className="np-premium-hero">
          <span>🛡 AI-Verified Hiring Network</span>

          <h1>
            Create your <b>account</b>
          </h1>

          <p>
            Build your verified profile with real proof, identity signals,
            project evidence and recruiter-ready trust score.
          </p>
        </div>

        <div className="np-center-shield">
          <div className="np-shield-stage"></div>
          <div className="np-shield-icon">✓</div>
        </div>

        <div className="np-premium-features">
          {features.map((item) => (
            <div className="np-feature-card" key={item.title}>
              <img src={item.img} alt={item.title} />
              <div>
                <h4>{item.title}</h4>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="np-premium-stats">
          <div>
            <h3>95%</h3>
            <p>Profile trust score</p>
          </div>
          <div>
            <h3>4.8/5</h3>
            <p>Recruiter confidence</p>
          </div>
          <div>
            <h3>10K+</h3>
            <p>Verified candidates</p>
          </div>
        </div>
      </section>

      <section className="np-premium-right">
        <div className="np-form-panel">
          <span className="np-form-badge">Candidate Onboarding</span>

          <h1>{otpSent ? "Verify your email" : "Create your account"}</h1>

          <p className="np-form-subtitle">
            {otpSent
              ? `We sent a 6-digit OTP to ${email}`
              : "Start with email verification to create your profile."}
          </p>

          <button
            type="button"
            className="np-google-premium"
            disabled={loading}
            onClick={() => alert("Google login coming soon")}
          >
            <b>G</b> Continue with Google
          </button>

          <div className="np-premium-divider">
            <span></span>
            <p>or continue with email</p>
            <span></span>
          </div>

          {!otpSent ? (
            <>
              <label className="np-premium-field">
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

              <label className="np-premium-field">
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
                className="np-premium-primary"
                onClick={sendOtp}
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Create Account →"}
              </button>
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
                    onKeyDown={(e) => {
                      if (
                        e.key === "Backspace" &&
                        !otp[index] &&
                        e.target.previousElementSibling
                      ) {
                        e.target.previousElementSibling.focus();
                      }
                    }}
                  />
                ))}
              </div>

              <button
                type="button"
                className="np-premium-primary"
                onClick={verifyOtp}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & continue →"}
              </button>

              <div className="np-action-buttons">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                  }}
                >
                  Change email
                </button>

                <button type="button" disabled={loading} onClick={sendOtp}>
                  Resend OTP
                </button>
              </div>
            </>
          )}

          <p className="np-premium-signin">
            Already have an account? <a href="/candidate-login">Sign in</a>
          </p>
        </div>

        <div className="np-form-security">
          <span>🔒 Secure & Encrypted</span>
          <span>🛡 Verified Platform</span>
          <span>🔐 Privacy First</span>
        </div>
      </section>
    </main>
  );
}
function CandidateSetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const email = localStorage.getItem("candidateSignupEmail");
  const otpVerified = localStorage.getItem("candidateOtpVerified") === "true";

  useEffect(() => {
    if (!email || !otpVerified) {
      alert("Please verify your email first");
      window.location.href = "/candidate-email-verify";
    }
  }, [email, otpVerified]);

  const savePassword = async () => {
    if (!password || !confirmPassword) {
      alert("Please enter password and confirm password");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await axios.post(`${API_URL}/api/candidates/set-password`, {
        email,
        password,
      });

      localStorage.setItem("candidatePasswordSet", "true");

      alert("Password set successfully. Now complete your candidate profile.");
      window.location.href = "/candidate-register";
    } catch (err) {
      console.log("Set Password Error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to set password");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Set Candidate Password</h1>
        <p>Your verified email: {email}</p>

        <input
          type="password"
          placeholder="Create Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button onClick={savePassword}>Save Password</button>
        <a href="/candidate-email-verify">Back to Email Verification</a>
      </div>
    </div>
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
  const [activeTab, setActiveTab] = useState("Applied");
  const [searchText, setSearchText] = useState("");

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const candidateId = user?.candidateId || user?._id || user?.id;

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/jobs`);
        const allJobs = res.data.jobs || res.data.data || res.data || [];
        setJobs(Array.isArray(allJobs) ? allJobs : []);
      } catch (err) {
        console.log(err.response?.data || err.message);
      }
    };

    loadJobs();
  }, []);

  const applyJob = async (jobId) => {
    if (!candidateId) {
      alert("Please login as candidate");
      window.location.href = "/candidate-login";
      return;
    }

    try {
      await axios.post(`${API_URL}/api/jobs/${jobId}/apply/${candidateId}`);
      alert("Applied successfully");
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Apply failed");
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (!searchText.trim()) return true;

    const search = searchText.toLowerCase();

    const skillsText = Array.isArray(job.skills)
      ? job.skills
          .map((skill) =>
            typeof skill === "string" ? skill : skill?.name || ""
          )
          .join(" ")
      : job.skills || "";

    return (
      job.title?.toLowerCase().includes(search) ||
      job.jobTitle?.toLowerCase().includes(search) ||
      job.role?.toLowerCase().includes(search) ||
      job.company?.toLowerCase().includes(search) ||
      job.companyName?.toLowerCase().includes(search) ||
      job.location?.toLowerCase().includes(search) ||
      job.city?.toLowerCase().includes(search) ||
      skillsText.toLowerCase().includes(search)
    );
  });

  const tabs = ["Applied", "Recommended", "Top Match", "Invites", "Saved"];

  return (
    <>
      <Navbar />

      <main className="jobs-premium-page">
        <section className="jobs-premium-hero">
          <div>
            <span className="jobs-premium-pill">✨ AI Job Discovery</span>
            <h1>Recommended jobs for you</h1>
            <p>
              Curated roles based on your skills, experience, trust score and recruiter activity.
            </p>
          </div>

          <div className="jobs-live-box">
            <h2>{filteredJobs.length}</h2>
            <p>Live Jobs</p>
          </div>
        </section>

        <section className="jobs-search-card">
          <input
            type="text"
            placeholder="Search jobs, skills, companies, location..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <span>🔍</span>
        </section>

        <section className="jobs-panel">
          <div className="jobs-panel-head">
            <div>
              <h2>Jobs matching your profile</h2>
              <p>{filteredJobs.length} opportunities available</p>
            </div>

            <button onClick={() => setSearchText("")}>View all →</button>
          </div>

          <div className="job-tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                <span>
                  {tab === "Applied"
                    ? filteredJobs.length
                    : tab === "Recommended"
                    ? 71
                    : tab === "Top Match"
                    ? 10
                    : tab === "Invites"
                    ? 8
                    : 15}
                </span>
              </button>
            ))}
          </div>

          <div className="premium-jobs-list">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job, index) => (
                <article className="premium-job-row" key={job._id || job.id || index}>
                  <div className="job-company-avatar">
                    {(job.company || job.companyName || "N").charAt(0).toUpperCase()}
                  </div>

                  <div className="job-main-info">
                    <div className="job-title-row">
                      <h3>
                        {job.title || job.jobTitle || job.role || "Untitled Job"}
                      </h3>
                      <span>{index + 1}d ago</span>
                    </div>

                    <p className="job-company-name">
                      {job.company || job.companyName || "Company not added"}
                    </p>

                    <p className="job-location-line">
                      📍 {job.location || job.city || "Location not added"} •{" "}
                      {job.workMode || job.jobType || job.employmentType || "Full-Time"}
                    </p>

                    <div className="job-tags">
                      {Array.isArray(job.skills) && job.skills.length > 0 ? (
                        job.skills.slice(0, 5).map((skill, i) => (
                          <span key={i}>
                            {typeof skill === "string" ? skill : skill?.name || "Skill"}
                          </span>
                        ))
                      ) : (
                        <span>Verified</span>
                      )}
                    </div>
                  </div>

                  <div className="job-action-box">
                    <span className="match-badge">90% Match</span>
                    <button onClick={() => applyJob(job._id || job.id)}>
                      Apply Now
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="jobs-empty-box">
                No jobs found for "{searchText}"
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}function ServicesPage() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const candidateId = user?.candidateId || user?._id || user?.id;

  const RAZORPAY_PRO_LINK = "https://rzp.io/rzp/wBgr5eag";
  const ULTIMATE_PAYMENT_LINK = "https://rzp.io/rzp/gT6RQiD";

  const [selectedFeature, setSelectedFeature] = useState(null);

  const isUltimateUser = () => {
    const savedUser = JSON.parse(localStorage.getItem("user")) || {};

    return (
      savedUser?.plan === "Ultimate" ||
      savedUser?.subscriptionStatus === "active" ||
      localStorage.getItem("plan") === "Ultimate"
    );
  };

  // Razorpay Payment
  const openPayment = (plan) => {
    if (isUltimateUser()) {
      window.open(
        "/ultimate-dashboard",
        "NoPromptUltimateDashboard",
        "width=1600,height=950,left=80,top=40"
      );
      return;
    }

    localStorage.setItem("pendingPlan", plan);

    const paymentLink =
      plan === "Ultimate"
        ? ULTIMATE_PAYMENT_LINK
        : RAZORPAY_PRO_LINK;

    window.open(paymentLink, "_blank", "noopener,noreferrer");
  };

  // Temporary testing code
  /*
  const openPayment = () => {
    const user = JSON.parse(localStorage.getItem("user")) || {};

    localStorage.setItem(
      "user",
      JSON.stringify({
        ...user,
        plan: "Ultimate",
        subscriptionStatus: "active",
      })
    );

    localStorage.setItem("plan", "Ultimate");
    localStorage.setItem("subscriptionStatus", "active");

    window.open(
      "/ultimate-dashboard",
      "NoPromptUltimateDashboard",
      "width=1600,height=950,left=80,top=40"
    );
  };
  */

  const goUltimateDashboard = () => {
    window.open(
      "/ultimate-dashboard",
      "NoPromptUltimateDashboard",
      "width=1600,height=950,left=80,top=40"
    );
  };

  const goProfile = () => {
    window.location.href = candidateId
      ? `/profile/${candidateId}`
      : "/candidate-login";
  };

  const startFreePlan = () => {
    window.location.href = candidateId
      ? `/profile/${candidateId}`
      : "/candidate-email-verify";
  };

  const openFeatureDetails = (feature) => {
    setSelectedFeature(feature);
  };

  const closeFeatureDetails = () => {
    setSelectedFeature(null);
  };

  const featureDetails = {
    "Auto Apply Engine": {
      steps: [
        "AI reads your profile, skills and preferred role.",
        "System finds matching jobs from backend.",
        "Candidate gives permission before auto apply.",
        "Applications are tracked inside dashboard.",
      ],
      benefits: [
        "Save time",
        "Apply faster",
        "Never miss matching jobs",
        "Track all applications",
      ],
    },
    "Instant Job Alerts": {
      steps: [
        "AI monitors newly posted jobs.",
        "Matches jobs with your skills.",
        "Sends instant alerts.",
        "Candidate can apply immediately.",
      ],
      benefits: [
        "Early access to jobs",
        "Better response chance",
        "Personalized alerts",
      ],
    },
    "Hidden Opportunities": {
      steps: [
        "System identifies recruiter-only roles.",
        "AI checks your profile eligibility.",
        "Matching hidden jobs appear in your dashboard.",
        "You can apply before public competition increases.",
      ],
      benefits: [
        "Access exclusive jobs",
        "Less competition",
        "Better recruiter visibility",
      ],
    },
    "AI Match Score": {
      steps: [
        "AI compares your profile with job description.",
        "Checks skills, experience, location and role fit.",
        "Generates match percentage.",
        "Shows best-fit jobs first.",
      ],
      benefits: [
        "Know your hiring chance",
        "Apply to right jobs",
        "Improve weak areas",
      ],
    },
    "AI Resume Studio": {
      steps: [
        "Upload or create your resume.",
        "AI checks ATS score, keywords and structure.",
        "System recommends improvements.",
        "Download recruiter-ready resume.",
      ],
      benefits: [
        "Better ATS score",
        "Professional resume",
        "More interview chances",
      ],
    },
    "Trust Passport": {
      steps: [
        "Verify identity, resume, skills and project proof.",
        "System builds a trust profile.",
        "Recruiters see verified signals.",
        "Your profile stands out from normal candidates.",
      ],
      benefits: [
        "Higher recruiter confidence",
        "Proof-based profile",
        "Better credibility",
      ],
    },
    "AI Interview Prep": {
      steps: [
        "Select role and interview type.",
        "Practice HR and technical questions.",
        "AI gives feedback.",
        "Improve before real interviews.",
      ],
      benefits: [
        "Better confidence",
        "Role-based preparation",
        "Interview readiness",
      ],
    },
    "Skill Intelligence": {
      steps: [
        "AI reads your current skills.",
        "Compares with market demand.",
        "Shows missing skills and salary impact.",
        "Creates learning roadmap.",
      ],
      benefits: [
        "Clear skill roadmap",
        "Salary growth insights",
        "Career planning",
      ],
    },
  };

  const featureCards = [
    {
      img: "pro/auto-apply.png",
      tag: "AUTO APPLY ENGINE",
      title: "Auto Apply Engine",
      desc: "Automatically apply to high-match jobs while you focus on interviews.",
    },
    {
      img: "pro/job-alerts.png",
      tag: "INSTANT JOB ALERTS",
      title: "Instant Job Alerts",
      desc: "Get real-time job alerts before others apply and stay one step ahead.",
    },
    {
      img: "pro/hidden-opportunities.png",
      tag: "HIDDEN OPPORTUNITIES",
      title: "Hidden Opportunities",
      desc: "Unlock recruiter-only jobs you won’t find anywhere else.",
    },
    {
      img: "pro/ai-match-score.png",
      tag: "AI MATCH SCORE",
      title: "AI Match Score",
      desc: "Know your chances of getting hired before you even apply.",
    },
    {
      img: "pro/resume-studio.png",
      tag: "AI RESUME STUDIO",
      title: "AI Resume Studio",
      desc: "Build ATS-ready, recruiter-friendly resumes that get more interviews.",
    },
    {
      img: "pro/trust-passport.png",
      tag: "TRUST PASSPORT",
      title: "Trust Passport",
      desc: "Verify your identity, resume, projects and skills with smart verification.",
    },
    {
      img: "/pro/interview-prep.png",
      tag: "AI INTERVIEW PREP",
      title: "AI Interview Prep",
      desc: "Practice HR and technical interviews and improve with AI feedback.",
    },
    {
      img: "pro/skill-intelligence.png",
      tag: "SKILL INTELLIGENCE",
      title: "Skill Intelligence",
      desc: "Track in-demand skills, salary insights and market trends in real-time.",
    },
  ];

 return (
  <>
    <Navbar />

    <main className="pro-saas-page">
      <section className="pro-hero">
        <div className="pro-hero-left">
          <span className="hero-pill">
            ⚡ AI-POWERED CAREER INTELLIGENCE
          </span>

          <h1>
            Your <span>AI Co-Pilot</span> For Smarter Job Search &{" "}
            <span>Career Growth</span>
          </h1>

          <p>
            Apply smarter, get noticed earlier, and land your dream role
            faster with the power of AI.
          </p>

          <div className="hero-actions">

            {/*
            {isUltimateUser() ? (
              <button onClick={goUltimateDashboard}>
                👑 Ultimate Dashboard
              </button>
            ) : (
              <button onClick={() => openPayment("Ultimate")}>
                ⚡ Upgrade to Pro
              </button>
            )}
            */}

            {/* Temporary Testing Button */}
            <button
              onClick={() => {
                const user =
                  JSON.parse(localStorage.getItem("user")) || {};

                localStorage.setItem(
                  "user",
                  JSON.stringify({
                    ...user,
                    plan: "Ultimate",
                    subscriptionStatus: "active",
                  })
                );

                localStorage.setItem("plan", "Ultimate");
                localStorage.setItem(
                  "subscriptionStatus",
                  "active"
                );

                window.location.href = "/ultimate-dashboard";
              }}
            >
              👑 Open Ultimate Dashboard
            </button>

            <button
              onClick={() => {
                const section =
                  document.getElementById("all-features");

                if (section) {
                  section.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }
              }}
            >
              Explore All Features →
            </button>

          </div>

            <div className="hero-trust-row">
              <span>✅ AI-Powered</span>
              <span>✅ Verified & Trusted</span>
              <span>✅ Privacy First</span>
              <span>✅ Secure & Reliable</span>
            </div>
          </div>

          <div className="pro-dashboard-preview">
            <aside className="dash-sidebar">
              <div className="dash-logo">N</div>
              <p className="active">Overview</p>
              <p>Applications</p>
              <p>Auto Apply</p>
              <p>Alerts</p>
              <p>Resume</p>
              <p>Interview Prep</p>
            </aside>

            <section className="dash-main">
              <div className="dash-head">
                <div>
                  <h3>Welcome back, Venkatesha! 👋</h3>
                  <small>Smart career overview</small>
                </div>

                <div className="trust-chip">🛡 Verified</div>
              </div>

              <div className="dash-grid">
                <div className="dash-card score-card">
                  <p>AI Match Score</p>
                  <h2>92</h2>
                  <span>Excellent Match</span>
                </div>

                <div className="dash-card applications">
                  <div>
                    <p>Applications</p>
                    <h3>24</h3>
                    <small>Applied</small>
                  </div>

                  <div>
                    <h3>12</h3>
                    <small>Interviewing</small>
                  </div>
                </div>

                <div className="dash-card strength">
                  <p>Profile Strength</p>
                  <h2>82%</h2>
                  <span>Strong</span>
                </div>

                <div className="dash-card auto">
                  <p>Auto Apply</p>
                  <h2>125</h2>
                  <span>Applied</span>
                </div>

                <div className="dash-card activity">
                  <p>Recent Activity</p>
                  <span>Applied for Senior Data Engineer</span>
                  <span>Interview scheduled - Tech Mahindra</span>
                  <span>Profile viewed by 5 recruiters</span>
                </div>
              </div>
            </section>
          </div>
        </section>

        <section className="pro-stats-strip">
          <div>👥 <b>100K+</b><span>Active Professionals</span></div>
          <div>☑️ <b>3M+</b><span>Jobs Analysed Daily</span></div>
          <div>🏢 <b>500+</b><span>Top Companies</span></div>
          <div>⭐ <b>98%</b><span>User Satisfaction</span></div>
          <div>🌟 <b>4.8/5</b><span>Average Rating</span></div>
        </section>

        <section id="all-features" className="pro-feature-section">
          <div className="pro-section-title">
            <span>POWERFUL FEATURES</span>

            <h2>Everything NoPromptPro has, plus your own AI trust layer</h2>

            <p>
              8 powerful tools to automate, analyze and accelerate your career
              journey.
            </p>
          </div>

          <div className="pro-feature-grid">
            {featureCards.map((item) => (
              <article className="pro-feature-card" key={item.title}>
                <span className="feature-tag">+ {item.tag}</span>

                <img
                  src={item.img}
                  alt={item.title}
                  className="feature-image"
                />

                <button
                  className="feature-btn"
                  onClick={() => openFeatureDetails(item)}
                >
                  Explore →
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="pro-bottom-grid">
          <div className="trust-passport-banner">
            <div>
              <h2>Candidate Trust Passport</h2>

              <p>
                Your verified identity and professional credibility that opens
                doors to better opportunities.
              </p>

              <button onClick={goProfile}>Explore Trust Passport →</button>
            </div>

            <div className="trust-list">
              <span>✅ Identity Verified</span>
              <span>✅ Resume Verified</span>
              <span>✅ Skill Certifications</span>
              <span>✅ LinkedIn Verification</span>
              <span>✅ Resume Tested</span>
              <span>✅ Real User Videos</span>
              <span>✅ Status Verification</span>
              <span>✅ Strong Role Intent</span>
            </div>
          </div>

          <div className="career-roadmap-card">
            <h3>From profile gap to interview-ready candidate</h3>

            <div className="roadmap-flow">
              {[
                "Current Skills",
                "Skill Gaps",
                "Projects",
                "Certifications",
                "Mock Interviews",
                "Target Salary",
              ].map((x) => (
                <div key={x}>
                  🎯<span>{x}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pricing-cta-grid">
          <div className="price-card">
            <h3>Basic</h3>
            <h2>₹0</h2>
            <p>For basic job seekers</p>

            <span>✓ Basic profile</span>
            <span>✓ Job alerts</span>
            <span>✓ Basic resume upload</span>

            <button onClick={startFreePlan}>Get Started</button>
          </div>

          <div className="price-card popular">
            <b>Most Popular</b>

            <h3>Pro</h3>
            <h2>₹899/month</h2>
            <p>For serious job seekers</p>

            <span>✓ Auto Apply</span>
            <span>✓ Job Alerts</span>
            <span>✓ AI Resume Studio</span>
            <span>✓ Trust Passport</span>
            <span>✓ Interview Practice</span>
            <span>✓ Salary Predictor</span>

            {isUltimateUser() ? (
              <button onClick={goUltimateDashboard}>
                👑 Ultimate Dashboard
              </button>
            ) : (
              <button onClick={() => openPayment("Ultimate")}>
                Start Pro →
              </button>
            )}
          </div>

          <div className="price-card">
            <h3>Ultimate</h3>
            <h2>₹1999/month</h2>
            <p>For career accelerators</p>

            <span>✓ Everything in Pro</span>
            <span>✓ Priority recruiter visibility</span>
            <span>✓ AI Career Coach</span>
            <span>✓ Advanced insights</span>

            {isUltimateUser() ? (
              <button onClick={goUltimateDashboard}>
                👑 Ultimate Dashboard
              </button>
            ) : (
              <button onClick={() => openPayment("Ultimate")}>
                Upgrade to Ultimate →
              </button>
            )}
          </div>

          <div className="final-pro-cta">
            <h2>Ready to accelerate your career?</h2>

            <p>Join 100K+ professionals who are already ahead.</p>

            {isUltimateUser() ? (
              <button onClick={goUltimateDashboard}>
                👑 Ultimate Dashboard
              </button>
            ) : (
              <button onClick={() => openPayment("Ultimate")}>
                Upgrade to Pro →
              </button>
            )}

            <ul>
              <li>✅ 7-Day Free Trial</li>
              <li>✅ No Credit Card Required</li>
              <li>✅ 24/7 Priority Support</li>
            </ul>
          </div>
        </section>

        {selectedFeature && (
          <div className="feature-premium-overlay">
            <div className="feature-premium-page">
              <button
                className="feature-close-btn"
                onClick={closeFeatureDetails}
              >
                ×
              </button>

              <section className="feature-premium-hero">
                <div className="feature-left-panel">
                  <button
                    className="back-feature-btn"
                    onClick={closeFeatureDetails}
                  >
                    ← Back to all features
                  </button>

                  <span className="feature-pill">
                    ⚡ {selectedFeature.tag}
                  </span>

                  <h1>{selectedFeature.title}</h1>

                  <p>{selectedFeature.desc}</p>

                  <div className="feature-mini-benefits">
                    {(featureDetails[selectedFeature.title]?.benefits || [
                      "Save time",
                      "Apply faster",
                      "Improve visibility",
                      "Track progress",
                    ]).map((item, index) => (
                      <div key={index}>
                        <span>
                          {index === 0 && "⚡"}
                          {index === 1 && "🎯"}
                          {index === 2 && "🛡"}
                          {index === 3 && "📈"}
                        </span>

                        <p>{item}</p>
                      </div>
                    ))}
                  </div>

                  <div className="feature-actions">
                    {isUltimateUser() ? (
                      <button onClick={goUltimateDashboard}>
                        👑 Open Ultimate Dashboard
                      </button>
                    ) : (
                      <button onClick={() => openPayment("Ultimate")}>
                        Start Using Feature →
                      </button>
                    )}

                    <button onClick={closeFeatureDetails}>
                      Back to Services
                    </button>
                  </div>
                </div>

                <div className="feature-right-preview">
                  <img
                    src={selectedFeature.img}
                    alt={selectedFeature.title}
                  />
                </div>
              </section>

              <section className="feature-bottom-grid">
                <div className="feature-how-card">
                  <h2>How it works</h2>

                  <div className="feature-steps-row">
                    {(featureDetails[selectedFeature.title]?.steps || [
                      "AI analyzes your profile.",
                      "System finds suitable career opportunities.",
                      "You take action from dashboard.",
                      "Progress is tracked automatically.",
                    ]).map((step, index) => (
                      <div className="feature-step-item" key={index}>
                        <div className="step-icon">
                          {index === 0 && "🤖"}
                          {index === 1 && "🎯"}
                          {index === 2 && "🚀"}
                          {index === 3 && "📈"}
                        </div>

                        <small>
                          Step {String(index + 1).padStart(2, "0")}
                        </small>

                        <h3>
                          {index === 0 && "Profile Analysis"}
                          {index === 1 && "Smart Matching"}
                          {index === 2 && "Take Action"}
                          {index === 3 && "Track Results"}
                        </h3>

                        <p>{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="feature-benefit-card">
                  <h2>Key Benefits</h2>

                  <div className="benefit-grid">
                    {(featureDetails[selectedFeature.title]?.benefits || [
                      "Save time",
                      "Improve visibility",
                      "Better job matching",
                      "Track applications",
                    ]).map((benefit, index) => (
                      <div className="benefit-item" key={index}>
                        <span>
                          {index === 0 && "📈"}
                          {index === 1 && "🖥"}
                          {index === 2 && "🎯"}
                          {index === 3 && "💎"}
                        </span>

                        <div>
                          <h3>{benefit}</h3>

                          <p>
                            Improve your career workflow with smarter
                            AI-powered automation.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
function NotificationsPage() {
  const notifications = [
    {
      icon: "👀",
      title: "Recruiter viewed your profile",
      desc: "Your profile was opened by a recruiter.",
      time: "2h ago",
    },
    {
      icon: "💼",
      title: "New matching jobs available",
      desc: "Fresh jobs are available based on your skills.",
      time: "Today",
    },
    {
      icon: "⭐",
      title: "Trust score improved",
      desc: "Your profile strength increased after recent updates.",
      time: "Yesterday",
    },
    {
      icon: "🎤",
      title: "Interview preparation pending",
      desc: "Complete your mock interview practice.",
      time: "2d ago",
    },
  ];

  return (
    <>
      <Navbar />

      <div className="notifications-page">
        <section className="notifications-hero">
          <h1>Notifications</h1>
          <p>Track recruiter actions, job alerts, profile updates and interview reminders.</p>
        </section>

        <div className="notification-list-page">
          {notifications.map((item, i) => (
            <div className="notification-row" key={i}>
              <div className="notification-icon">{item.icon}</div>

              <div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>

              <span>{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
function ResumeStudioPage() {
  const [selectedTemplate, setSelectedTemplate] = useState("Modern ATS");
  const [resumeText, setResumeText] = useState("");
  const [optimizedResume, setOptimizedResume] = useState("");
  const [loading, setLoading] = useState(false);

  const templates = [
    {
      name: "Modern ATS",
      role: "Software Developer",
      score: "94%",
    },
    {
      name: "Data Engineer",
      role: "Python / SQL / Cloud",
      score: "91%",
    },
    {
      name: "Business Analyst",
      role: "Analytics / Reporting",
      score: "89%",
    },
  ];

  const improveResume = async () => {
    if (!resumeText.trim()) {
      alert("Please paste your current resume content");
      return;
    }

    try {
      setLoading(true);
      setOptimizedResume("");

      const response = await axios.post(`${API_URL}/api/ai/resume-analyze`, {
        resumeText,
        template: selectedTemplate,
      });

      setOptimizedResume(response.data.optimizedResume);
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("AI resume analysis failed. Check backend and Ollama.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="resume-studio-page">
   <aside className="resume-ultimate-sidebar">
  <div className="resume-side-brand">
    <img src="/logo.png" alt="NoPromptJobs" />
    <div>
      <h2>NoPromptJobs</h2>
      <span>ULTIMATE</span>
    </div>
  </div>

  <div className="resume-side-title">AI Workspace</div>

  <nav className="resume-side-nav">
    <a onClick={() => (window.location.href = "/ultimate-dashboard")}>
      ⌂ Dashboard
    </a>

    <a className="active">
      ✨ AI Resume Studio <b>Premium</b>
      <small>Build ATS-ready resumes</small>
    </a>

    <a onClick={() => (window.location.href = "/ai-interview-prep")}>
      🎤 Interview Prep
    </a>

    <a onClick={() => (window.location.href = "/skill-analyzer")}>
      🧠 Skill Analyzer
    </a>

    <a onClick={() => (window.location.href = "/trust-passport")}>
      🛡 Trust Passport
    </a>

    <a onClick={() => (window.location.href = "/salary-predictor")}>
      💼 Salary Predictor
    </a>
  </nav>

  <div className="resume-access-card">
    <span>👑</span>
    <h3>Ultimate Access</h3>
    <p>All 9 AI tools unlocked</p>
    <b>● Active</b>

    <button onClick={() => (window.location.href = "/ultimate-dashboard")}>
      View All Tools →
    </button>
  </div>

  <div className="resume-credit-card">
    <p>AI Credits</p>
    <h3>Unlimited ∞</h3>
    <div></div>
    <small>Resets on 18 Aug, 2026</small>
  </div>
</aside>

      <section className="resume-studio-main">
        <div className="resume-studio-hero">
          <span>📄 PREMIUM RESUME BUILDER</span>

          <h1>Create ATS optimized resumes using AI</h1>

          <p>
            Select a resume style, paste your current resume, and generate an
            improved ATS-friendly resume using local AI.
          </p>
        </div>

        <section className="resume-template-grid">
          {templates.map((item) => (
            <div
              key={item.name}
              className={
                selectedTemplate === item.name
                  ? "resume-template-card active"
                  : "resume-template-card"
              }
              onClick={() => setSelectedTemplate(item.name)}
            >
              <h3>{item.name}</h3>
              <p>{item.role}</p>
              <b>ATS Score {item.score}</b>
            </div>
          ))}
        </section>

        <section className="resume-workspace">
          <div className="resume-input-card">
            <h2>Your Current Resume</h2>

            <textarea
              placeholder="Paste your current resume here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />

            <button onClick={improveResume} disabled={loading}>
              {loading ? "AI is improving resume..." : "Improve ATS Resume →"}
            </button>
          </div>

          <div className="resume-output-card">
            <h2>Improved ATS Resume</h2>

            {optimizedResume ? (
              <pre>{optimizedResume}</pre>
            ) : (
              <div className="resume-empty-box">
                Your AI optimized ATS resume will appear here.
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function SkillAnalyzerPage() {
  const [currentSkills, setCurrentSkills] = useState("");
  const [targetRole, setTargetRole] = useState("Data Engineer");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState("");

  const analyzeSkills = async () => {
    if (!currentSkills.trim()) {
      alert("Please enter your current skills");
      return;
    }

    try {
      setLoading(true);
      setAnalysis("");

      const response = await axios.post(`${API_URL}/api/ai/skill-analyze`, {
        currentSkills,
        targetRole,
      });

      setAnalysis(response.data.analysis);
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("AI Skill Analyzer failed. Check backend and Ollama.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="skill-ai-page">
      <aside className="skill-ai-sidebar">
        <img src="/logo.png" alt="NoPromptJobs" />
        <h2>Skill Analyzer</h2>
        <p>AI Career Gap Roadmap</p>

        <button onClick={() => (window.location.href = "/ultimate-dashboard")}>
          ← Back to Ultimate
        </button>
      </aside>

      <section className="skill-ai-main">
        <div className="skill-ai-hero">
          <span>🧠 AI SKILL GAP ANALYZER</span>
          <h1>Find your missing skills and build a career roadmap</h1>
          <p>
            Enter your current skills and target role. AI will identify missing
            skills, priority topics, projects and learning roadmap.
          </p>
        </div>

        <section className="skill-ai-grid">
          <div className="skill-input-card">
            <h2>Your Current Skills</h2>

            <input
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Target Role e.g Data Engineer"
            />

            <textarea
              value={currentSkills}
              onChange={(e) => setCurrentSkills(e.target.value)}
              placeholder="Example: Python, SQL, PySpark, Hadoop, Azure, Git..."
            />

            <button onClick={analyzeSkills} disabled={loading}>
              {loading ? "AI is analyzing skills..." : "Analyze Skill Gap →"}
            </button>
          </div>

          <div className="skill-output-card">
            <h2>AI Skill Roadmap</h2>

            {analysis ? (
              <pre>{analysis}</pre>
            ) : (
              <div className="skill-empty-box">
                Your AI skill gap analysis will appear here.
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
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
      </section>
    </main>
  );
}
function SalaryPredictorPage() {

  const [role, setRole] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const predictSalary = async () => {

    if (!role || !skills || !experience) {
      alert("Please fill all fields");
      return;
    }

    try {

      setLoading(true);

      const response = await axios.post(
        `${API_URL}/api/ai/salary-predict`,
        {
          role,
          skills,
          experience
        }
      );

      setResult(response.data.analysis);

    } catch (err) {

      console.log(err);

      alert("Salary prediction failed");

    } finally {

      setLoading(false);

    }
  };

  return (
    <main className="salary-page">

      <aside className="salary-sidebar">

        <img src="/logo.png" alt="" />

        <h2>Salary Predictor</h2>

        <button
          onClick={() =>
            (window.location.href="/ultimate-dashboard")
          }
        >
          ← Back
        </button>

      </aside>

      <section className="salary-main">

        <div className="salary-card">

          <h1>AI Salary Predictor</h1>

          <input
            placeholder="Target Role"
            value={role}
            onChange={(e)=>setRole(e.target.value)}
          />

          <textarea
            placeholder="Skills"
            value={skills}
            onChange={(e)=>setSkills(e.target.value)}
          />

          <input
            placeholder="Years of Experience"
            value={experience}
            onChange={(e)=>setExperience(e.target.value)}
          />

          <button onClick={predictSalary}>

            {loading
              ? "AI Predicting..."
              : "Predict Salary →"}

          </button>

        </div>

        <div className="salary-output">

          <h2>Predicted Salary Report</h2>

          {result ? (
            <pre>{result}</pre>
          ) : (
            <div>
              AI salary prediction will appear here
            </div>
          )}

        </div>

      </section>

    </main>
  );
}
function HiddenOpportunitiesPage() {

  const opportunities = [
    {
      company: "Google",
      salary: "45 LPA",
      type: "Recruiter Private",
      location: "Bangalore",
      confidence: "96%"
    },
    {
      company: "Microsoft",
      salary: "38 LPA",
      type: "Hidden Opening",
      location: "Hyderabad",
      confidence: "94%"
    },
    {
      company: "Amazon",
      salary: "42 LPA",
      type: "Premium Referral",
      location: "Chennai",
      confidence: "92%"
    }
  ];

  return (
    <main className="hidden-page">

      <aside className="hidden-sidebar">

        <img src="/logo.png" />

        <h2>Hidden Opportunities</h2>

        <button
          onClick={() =>
            (window.location.href = "/ultimate-dashboard")
          }
        >
          ← Back
        </button>

      </aside>


      <section className="hidden-main">

        <div className="hidden-hero">

          <span>💎 PREMIUM ACCESS</span>

          <h1>
            Hidden Opportunities Workspace
          </h1>

          <p>
            Access recruiter-only openings, referrals,
            confidential positions and premium hiring campaigns.
          </p>

        </div>

        <div className="hidden-stats">

          <div className="hidden-stat-card">
            <h2>24</h2>
            <p>Private Jobs</p>
          </div>

          <div className="hidden-stat-card">
            <h2>9</h2>
            <p>Referral Openings</p>
          </div>

          <div className="hidden-stat-card">
            <h2>17</h2>
            <p>High Salary Jobs</p>
          </div>

          <div className="hidden-stat-card">
            <h2>96%</h2>
            <p>Match Accuracy</p>
          </div>

        </div>

        <div className="premium-jobs-grid">

          {opportunities.map((item,index)=>(

            <div
              className="premium-job-card"
              key={index}
            >

              <span className="premium-tag">
                {item.type}
              </span>

              <h2>{item.company}</h2>

              <h3>{item.salary}</h3>

              <p>{item.location}</p>

              <div className="confidence">

                Match Score

                <b>{item.confidence}</b>

              </div>

              <button>
                Unlock Opportunity →
              </button>

            </div>

          ))}

        </div>

      </section>

    </main>
  );
}
function App() {
  const path = window.location.pathname;

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      document.body.className = savedTheme;
    }
  }, []);

  if (path === "/") return <LandingPage />;

  if (path === "/login") return <LandingPage />;
  if (path === "/register") return <LandingPage />;

  if (path === "/candidate-login") return <CandidateLogin />;
  if (path === "/candidate-email-verify") return <CandidateEmailVerify />;
  if (path === "/candidate-set-password") return <CandidateSetPassword />;
  if (path === "/recruiter-login") return <RecruiterLogin />;

  if (path === "/candidate-register") return <CandidateRegister />;
  if (path === "/recruiter-register") return <RecruiterRegister />;

  if (path === "/candidate") return <CandidateUpload />;
  if (path === "/mobile-dashboard") return <MobileCandidateDashboard />;


  if (path.startsWith("/dashboard/")) return <CandidateDashboard />;

  if (path === "/companies") return <CompaniesPage />;

  if (path.startsWith("/profile/")) return <CandidateProfile />;

  if (path.startsWith("/recruiter-candidate-profile/"))
    return <RecruiterCandidateProfile />;

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
  if (path === "/ultimate-dashboard") return <UltimateDashboard />;

  if (path.startsWith("/recruiter-job-details/"))
    return <RecruiterJobDetailsPage />;

  if (path === "/recruiter-ai-assistant") return <RecruiterAIAssistantPage />;
  if (path === "/recruiter-interviews") return <RecruiterInterviewStagesPage />;
  if (path === "/recruiter-screening") return <RecruiterScreeningPage />;
  if (path === "/recruiter-team") return <RecruiterTeamPage />;
  if (path === "/recruiter-billing") return <RecruiterBillingPage />;
  if (path.startsWith("/jobs/")) return <JobDetailsPage />;
  if (path === "/jobs") return <JobsPage />;
  if (path === "/services") return <ServicesPage />;
  if (path === "/notifications") return <NotificationsPage />;
  if (path === "/resume-studio") return <ResumeStudioPage />;
  if (path === "/skill-analyzer") return <SkillAnalyzerPage />;
  if (path === "/trust-passport") return <TrustPassportPage />;
  if (path === "/salary-predictor")
  return <SalaryPredictorPage />;
  if (path === "/hidden-opportunities")
  return <HiddenOpportunitiesPage />;
  if (path === "/ai-interview-prep")
  return <AIInterviewPrepPage />;
  if (path === "/settings") return <SettingsPage />;
  if (path === "/candidate-settings") return <SettingsPage />;


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

  if (isRecruiterPage) {
    return (
      <div className="topbar recruiter-topbar">
        <div
          className="recruiter-navbar-brand"
          onClick={() => (window.location.href = "/recruiter-dashboard")}
        >
          <div className="recruiter-logo-box">
            <img src="/logo.png" alt="NoPrompt Jobs" />
          </div>
        </div>

        <div className="recruiter-nav-tabs">
          <a href="/recruiter-dashboard">Dashboard</a>
          <a href="/recruiter-post-job">Post Job</a>
          <a href="/recruiter-search">Search Candidates</a>
          <a href="/recruiter-shortlisted">Shortlisted</a>
          <a href="/recruiter-applications">Applications</a>
          <a href="/recruiter-reports">Reports</a>
        </div>

        <div className="recruiter-profile-wrap">
          <button
            type="button"
            className="recruiter-bell"
            onClick={() => (window.location.href = "/recruiter-notifications")}
          >
            🔔 <span>5</span>
          </button>

          <button
            type="button"
            className="profile-menu-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            <span className="profile-avatar">
              {user?.name?.charAt(0)?.toUpperCase() ||
                user?.email?.charAt(0)?.toUpperCase() ||
                "R"}
            </span>

            <span>
              {user?.name || "Recruiter"}
              <small>{user?.company || "Tech Solutions Inc."}</small>
            </span>

            <b>⌄</b>
          </button>

          {showMenu && (
            <div className="profile-dropdown">
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
      </div>
    );
  }

  return (
    <div className="topbar candidate-topbar">
      <a href={candidateDashboardLink} className="brand" onClick={goDashboard}>
        <img src="/logo.png" alt="NoPrompt Jobs" className="site-logo" />
      </a>

      <div className="candidate-search-wrap">
  <input
    className="top-search"
    placeholder="Search jobs, skills, companies..."
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    }}
  />

  <span
    className="search-icon"
    onClick={handleSearch}
  >
    🔍
  </span>
</div>
      <div className="nav-menu candidate-nav-menu">
        <a href={candidateDashboardLink} onClick={goDashboard}>
          Dashboard
        </a>

        <a href="/jobs">💼 Jobs</a>
        <a href="/companies">🏢 Companies</a>
        <a href="/services">🛠 Services</a>

        <a href="/notifications" className="notification-link">
          🔔 Notifications
          <span className="notify-badge">3</span>
        </a>
      </div>

      <div className="profile-menu-wrap">
        <button
          type="button"
          className="profile-menu-btn"
          onClick={() => setShowMenu(!showMenu)}
        >
          <span className="profile-avatar">
            {user?.name?.charAt(0)?.toUpperCase() ||
              user?.email?.charAt(0)?.toUpperCase() ||
              "U"}
          </span>

          <span className="profile-label">{user?.name || "Dashboard"}</span>

          <b>⌄</b>
        </button>

        {showMenu && (
          <div className="profile-dropdown premium-dropdown">
            <div className="dropdown-user-top">
              <div className="dropdown-avatar">
                {user?.name?.charAt(0)?.toUpperCase() ||
                  user?.email?.charAt(0)?.toUpperCase() ||
                  "U"}
              </div>

              <div>
                <h3>{user?.name || "Candidate"}</h3>
                <p>{user?.email || "candidate@noproxiesjobs.com"}</p>
                <span>✅ Verified Candidate</span>
              </div>
            </div>

            <button type="button" onClick={goDashboard}>
              🏠 Dashboard
            </button>

            <button type="button" onClick={goProfile}>
              👤 View Profile
            </button>

            <button type="button" onClick={goProfile}>
              ✏️ Modify Profile
            </button>

            <button
              type="button"
              onClick={() => (window.location.href = "/services")}
            >
              🚀 NoPromptJobs Pro
            </button>

            <button
              type="button"
              onClick={() => (window.location.href = "/candidate-settings")}
            >
              ⚙️ Settings
            </button>

            <button type="button" className="logout-btn" onClick={logout}>
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
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

function CandidateProfile() {
  const [candidate, setCandidate] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({});

  const id = window.location.pathname.split("/").pop();

  const loadCandidate = async () => {
    try {
      await axios.patch(`${API_URL}/api/candidates/${id}/view`);
      const res = await axios.get(`${API_URL}/api/candidates/${id}`)
      setCandidate(res.data.candidate || res.data.data || res.data);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    loadCandidate();
  }, [id]);

  if (!candidate) {
    return <div className="loading">Loading profile...</div>;
  }

  const updateCandidate = async (payload) => {
    const res = await axios.patch(`${API_URL}/api/candidates/${id}`, payload)
    setCandidate(res.data.candidate);
  };

  const openEdit = (title, data = {}, index = null) => {
    setEditTitle(title);
    setEditData(data);
    setEditIndex(index);
    setEditOpen(true);
  };

  const deleteArrayItem = async (section, index) => {
    if (!window.confirm("Delete this item?")) return;

    const updated = [...(candidate[section] || [])];
    updated.splice(index, 1);

    await updateCandidate({
      [section]: updated,
    });
  };

  const saveEdit = async () => {
    try {
      let payload = {};

      if (editTitle === "Basic Info") {
        payload = editData;
      }

      if (editTitle === "Professional Summary") {
        payload = {
          profileSummary: editData.profileSummary,
        };
      }
              if (editTitle === "Videos") {
          const data = new FormData();

          if (editData.selfIntroVideo) {
            data.append("selfIntroVideo", editData.selfIntroVideo);
          }

          if (editData.projectVideo) {
            data.append("projectVideo", editData.projectVideo);
          }

          const res = await axios.patch(
            `${API_URL}/api/candidates/${id}/videos`,
            data
          );

          setCandidate(res.data.candidate);
          setEditOpen(false);
          alert("Videos updated successfully");
          return;
        }

        if (editTitle === "Candidate Identity") {
          payload = {
            panNumber: editData.panNumber || "",
            aadhaarLast4: editData.aadhaarLast4 || "",
            identityStatus: "Pending Verification",
          };
        }

      if (editTitle === "Key Skills") {
        payload = {
          skills: editData.skillsText
            .split(",")
            .map((skill) => ({
              name: skill.trim(),
              years: 0,
              rating: 0,
            }))
            .filter((skill) => skill.name),
        };
      }

      if (editTitle === "Employment") {
        const updated = [...(candidate.employment || [])];

        const item = {
          company: editData.company || "",
          role: editData.role || "",
          years: Number(editData.years || 0),
          months: Number(editData.months || 0),
        };

        if (editIndex !== null) {
          updated[editIndex] = item;
        } else {
          updated.push(item);
        }

        payload = {
          employment: updated,
          currentCompany: item.company,
          currentRole: item.role,
          experienceYears: item.years,
          experienceMonths: item.months,
        };
      }

      if (editTitle === "Education") {
        const updated = [...(candidate.education || [])];

        const item = {
          degree: editData.degree || "",
          college: editData.college || "",
          year: editData.year || "",
        };

        if (editIndex !== null) {
          updated[editIndex] = item;
        } else {
          updated.push(item);
        }

        payload = {
          education: updated,
        };
      }

      if (editTitle === "Projects") {
        const updated = [...(candidate.projects || [])];

        const item = {
          title: editData.title || "",
          domain: editData.domain || "",
          tools: editData.tools || "",
          description: editData.description || "",
          link: editData.link || "",
        };

        if (editIndex !== null) {
          updated[editIndex] = item;
        } else {
          updated.push(item);
        }

        payload = {
          projects: updated,
        };
      }

      if (editTitle === "Personal Details") {
        payload = editData;
      }

      await updateCandidate(payload);

      setEditOpen(false);
      setEditIndex(null);
      alert("Updated successfully");
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Update failed");
    }
  };

  const uploadProfileImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("profileImage", file);

    const res = await axios.patch(
      `${API_URL}/api/candidates/${id}/profile-image`,
      data
    );

    setCandidate(res.data.candidate);
  };

  const uploadResume = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("resume", file);

    const res = await axios.patch(
      `${API_URL}/api/candidates/${id}/resume`,
      data
    );

    setCandidate(res.data.candidate);
  };

  const score =
    40 +
    (candidate.resumeUrl ? 15 : 0) +
    (candidate.profileImageUrl ? 10 : 0) +
    (candidate.skills?.length ? 15 : 0) +
    (candidate.profileSummary ? 10 : 0) +
    (candidate.selfIntroVideoUrl ? 10 : 0);

 return (
  <>
    <Navbar />

    <div className="candidate-command-page">
      <aside className="candidate-command-left">
        <div className="candidate-glass-card candidate-id-card">
          <div className="candidate-photo-ring">
            <label>
              {candidate.profileImageUrl ? (
                <img src={candidate.profileImageUrl} alt="profile" />
              ) : (
                <span>{candidate.name?.charAt(0) || "C"}</span>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={uploadProfileImage}
                hidden
              />
            </label>
          </div>

          <h2>{candidate.name}</h2>
          <p>{candidate.currentRole || "Candidate"}</p>
          <span className="verified-badge">Verified Candidate</span>

          <button onClick={() => openEdit("Basic Info", {
            name: candidate.name || "",
            currentRole: candidate.currentRole || "",
            currentCompany: candidate.currentCompany || "",
            phone: candidate.phone || "",
            location: candidate.location || "",
            noticePeriod: candidate.noticePeriod || "",
          })}>
            Edit Profile
          </button>
        </div>

        <div className="candidate-glass-card trust-passport">
          <h3>🛡 Trust Passport</h3>
          <p><span>Proxy Risk Shield</span><b>Clean</b></p>
          <p><span>Identity</span><b>Verified</b></p>
          <p><span>Resume</span><b>{candidate.resumeUrl ? "Added" : "Missing"}</b></p>
          <p><span>Video Intro</span><b>{candidate.selfIntroVideoUrl ? "Added" : "Missing"}</b></p>
          <p><span>Project Proof</span><b>92/100</b></p>
        </div>

        <div className="candidate-glass-card profile-score-card">
          <h3>Profile Strength</h3>
          <h1>{Math.min(score, 100)}%</h1>
          <div className="score-bar">
            <span style={{ width: `${Math.min(score, 100)}%` }}></span>
          </div>
          <p>Complete missing sections to improve recruiter confidence.</p>
        </div>
      </aside>

      <main className="candidate-command-main">
        <section className="candidate-premium-hero">
          <div>
            <span className="hero-badge">Career Command Center</span>
            <h1>Welcome back, {candidate.name} 👋</h1>
            <p>
              Build a verified profile, prove your project work, improve trust score
              and attract genuine recruiters.
            </p>

            <div className="hero-action-row">
              <button onClick={() => openEdit("Professional Summary", {
                profileSummary: candidate.profileSummary || "",
              })}>
                Improve Summary
              </button>

              <button onClick={() => document.getElementById("resumeUpload")?.click()}>
                Update Resume
              </button>
            </div>
          </div>

          <div className="trust-orbit">
            <h2>{Math.min(score + 10, 100)}</h2>
            <span>/100</span>
            <p>Talent Signal</p>
          </div>
        </section>

        <section className="candidate-metrics-row">
          <div>
            <span>Search Appearances</span>
            <h2>{candidate.profileViews || 0}</h2>
            <p>Recruiter visibility</p>
          </div>

          <div>
            <span>Shortlisted</span>
            <h2>{candidate.shortlisted ? "Yes" : "No"}</h2>
            <p>Hiring interest</p>
          </div>

          <div>
            <span>Recruiter Notes</span>
            <h2>{candidate.recruiterNotes?.length || 0}</h2>
            <p>Private recruiter actions</p>
          </div>

          <div>
            <span>Resume Score</span>
            <h2>{Math.min(score, 100)}</h2>
            <p>Profile quality</p>
          </div>
        </section>

        <ProfileSection
          id="summary"
          title="Professional Summary"
          actionText="Modify Summary"
          onEdit={() =>
            openEdit("Professional Summary", {
              profileSummary: candidate.profileSummary || "",
            })
          }
        >
          <p className="premium-text">
            {candidate.profileSummary ||
              "Add a powerful summary explaining your experience, projects, skills and career goal."}
          </p>
        </ProfileSection>

        <ProfileSection
          id="skills"
          title="Key Skills"
          actionText="Add / Modify Skills"
          onEdit={() =>
            openEdit("Key Skills", {
              skillsText:
                candidate.skills
                  ?.map((s) => (typeof s === "string" ? s : s.name))
                  .join(", ") || "",
            })
          }
        >
                <div className="premium-chip-wrap">
          {Array.isArray(candidate.skills) && candidate.skills.length > 0 ? (
            candidate.skills.map((skill, i) => (
              <span key={skill?._id || i}>
                {typeof skill === "string"
                  ? skill
                  : skill?.name || "Skill"}
              </span>
            ))
            ) : (
              <p>No skills added</p>
            )}
          </div>
        </ProfileSection>

        <div className="candidate-two-grid">
          <ProfileSection
            id="employment"
            title="Employment"
            actionText="Add Employment"
            onEdit={() =>
              openEdit("Employment", {
                company: "",
                role: "",
                years: "",
                months: "",
              })
            }
          >
            {candidate.employment?.length ? (
              candidate.employment.map((emp, i) => (
                <div className="premium-item-card" key={i}>
                  <div>
                    <h3>{emp.company || "Company not added"}</h3>
                    <p>{emp.role || "Role not added"}</p>
                    <small>{emp.years || 0} Years {emp.months || 0} Months</small>
                  </div>

                  <div>
                    <button onClick={() =>
                      openEdit("Employment", {
                        company: emp.company || "",
                        role: emp.role || "",
                        years: emp.years || "",
                        months: emp.months || "",
                      }, i)
                    }>
                      Edit
                    </button>

                    <button className="delete-btn" onClick={() => deleteArrayItem("employment", i)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No employment added</p>
            )}
          </ProfileSection>

          <ProfileSection
            id="education"
            title="Education"
            actionText="Add Education"
            onEdit={() =>
              openEdit("Education", {
                degree: "",
                college: "",
                year: "",
              })
            }
          >
            {candidate.education?.length ? (
              candidate.education.map((edu, i) => (
                <div className="premium-item-card" key={i}>
                  <div>
                    <h3>{edu.degree || "Degree not added"}</h3>
                    <p>{edu.college || "College not added"}</p>
                    <small>{edu.year || "Year not added"}</small>
                  </div>

                  <div>
                    <button onClick={() =>
                      openEdit("Education", {
                        degree: edu.degree || "",
                        college: edu.college || "",
                        year: edu.year || "",
                      }, i)
                    }>
                      Edit
                    </button>

                    <button className="delete-btn" onClick={() => deleteArrayItem("education", i)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No education added</p>
            )}
          </ProfileSection>
        </div>

        <ProfileSection
          id="projects"
          title="Project Proof"
          actionText="Add Project"
          onEdit={() =>
            openEdit("Projects", {
              title: "",
              domain: "",
              tools: "",
              description: "",
              link: "",
            })
          }
        >
          {candidate.projects?.length ? (
            candidate.projects.map((project, i) => (
              <div className="premium-item-card project-proof-card" key={i}>
                <div>
                  <h3>{project.title || "Project not added"}</h3>
                  <p>{project.description || "No description added"}</p>
                  <small>{project.tools || "Tools not added"}</small>
                </div>

                <div>
                  <button onClick={() =>
                    openEdit("Projects", {
                      title: project.title || "",
                      domain: project.domain || "",
                      tools: project.tools || "",
                      description: project.description || "",
                      link: project.link || "",
                    }, i)
                  }>
                    Edit
                  </button>

                  <button className="delete-btn" onClick={() => deleteArrayItem("projects", i)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No projects added</p>
          )}
        </ProfileSection>

        <div className="candidate-two-grid">
          <ProfileSection
            id="resume"
            title="Resume"
            actionText={candidate.resumeUrl ? "Update Resume" : "Upload Resume"}
            onEdit={() => document.getElementById("resumeUpload")?.click()}
          >
            {candidate.resumeUrl ? (
              <a href={candidate.resumeUrl} target="_blank" rel="noreferrer">
                Download Resume
              </a>
            ) : (
              <p>No resume uploaded</p>
            )}

            <input
              id="resumeUpload"
              type="file"
              accept=".pdf,.doc,.docx"
              hidden
              onChange={uploadResume}
            />
          </ProfileSection>
          <div className="candidate-two-grid">
            <ProfileSection
              id="videos"
              title="Self Intro & Project Videos"
              actionText="Upload Videos"
              onEdit={() =>
                openEdit("Videos", {
                  selfIntroVideo: null,
                  projectVideo: null,
                })
              }
            >
              <p>
                Self Intro Video:{" "}
                <b>{candidate.selfIntroVideoUrl ? "Added" : "Missing"}</b>
              </p>

              <p>
                Project Explanation Video:{" "}
                <b>{candidate.projectVideoUrl ? "Added" : "Missing"}</b>
              </p>

              {candidate.selfIntroVideoUrl && (
                <video controls width="100%">
                  <source src={candidate.selfIntroVideoUrl} />
                </video>
              )}

              {candidate.projectVideoUrl && (
                <video controls width="100%">
                  <source src={candidate.projectVideoUrl} />
                </video>
              )}
            </ProfileSection>

            <ProfileSection
              id="identity"
              title="Candidate Identity"
              actionText="Add / Verify Identity"
              onEdit={() =>
                openEdit("Candidate Identity", {
                  panNumber: candidate.panNumber || "",
                  aadhaarLast4: candidate.aadhaarLast4 || "",
                })
              }
            >
              <p>
                PAN:{" "}
                <b>
                  {candidate.panNumber
                    ? `*****${candidate.panNumber.slice(-4)}`
                    : "Not added"}
                </b>
              </p>

              <p>
                Aadhaar:{" "}
                <b>
                  {candidate.aadhaarLast4
                    ? `XXXX XXXX ${candidate.aadhaarLast4}`
                    : "Not added"}
                </b>
              </p>

              <p>
                Status:{" "}
                <b>{candidate.identityStatus || "Not verified"}</b>
              </p>
            </ProfileSection>
          </div>
          <ProfileSection
            id="personal"
            title="Personal Details"
            actionText="Modify Details"
            onEdit={() =>
              openEdit("Personal Details", {
                gender: candidate.gender || "",
                dateOfBirth: candidate.dateOfBirth || "",
                maritalStatus: candidate.maritalStatus || "",
                address: candidate.address || "",
              })
            }
          >
            <p>Gender: {candidate.gender || "Not added"}</p>
            <p>DOB: {candidate.dateOfBirth || "Not added"}</p>
            <p>Marital: {candidate.maritalStatus || "Not added"}</p>
            <p>Address: {candidate.address || "Not added"}</p>
          </ProfileSection>
        </div>
      </main>

      <aside className="candidate-command-right">
        <div className="candidate-glass-card">
          <h3>Recruiter Confidence</h3>
          <h1>4.7/5</h1>
          <p>Based on profile proof, skills and activity.</p>
        </div>

        <div className="candidate-glass-card">
          <h3>Missing Boosters</h3>
          {!candidate.selfIntroVideoUrl && <p>⚠️ Add self intro video</p>}
          {!candidate.projectVideoUrl && <p>⚠️ Add project explanation video</p>}
          {!candidate.certifications?.length && <p>⚠️ Add certifications</p>}
        </div>

        <div className="candidate-pro-dark">
          <h3>👑 NoPompt Pro</h3>
          <p>Stand out from normal job portals.</p>
          <ul>
            <li>AI Resume Optimization</li>
            <li>Mock Interview Practice</li>
            <li>Priority Recruiter Visibility</li>
            <li>Auto Apply With Consent</li>
          </ul>
          <button onClick={() => window.location.href = "/services"}>
            Explore Pro
          </button>
        </div>
      </aside>
    </div>

    {editOpen && (
      <div className="modal-overlay">
        <div className="edit-modal">
          <h2>{editIndex !== null ? "Edit" : "Add"} {editTitle}</h2>

          {editTitle === "Videos" ? (
  <>
          <label>Self Introduction Video</label>

          <input
            type="file"
            accept="video/*"
            onChange={(e) =>
              setEditData({
                ...editData,
                selfIntroVideo: e.target.files[0],
              })
            }
          />

          <label>Project Explanation Video</label>

          <input
            type="file"
            accept="video/*"
            onChange={(e) =>
              setEditData({
                ...editData,
                projectVideo: e.target.files[0],
              })
            }
          />
        </>
      ) : (
        Object.keys(editData).map((key) => (
          <input
            key={key}
            value={editData[key] || ""}
            placeholder={key}
            onChange={(e) =>
              setEditData({
                ...editData,
                [key]: e.target.value,
              })
            }
          />
        ))
      )}

                <div className="modal-actions">
                  <button onClick={saveEdit}>Save</button>
                  <button onClick={() => setEditOpen(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </>
      );}


function CandidateDashboard() {
  const [candidate, setCandidate] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [searchText, setSearchText] = useState("");

  const candidateId = window.location.pathname.split("/").pop();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const candidateRes = await axios.get(
          `${API_URL}/api/candidates/${candidateId}`
        );

        setCandidate(
          candidateRes.data.candidate ||
            candidateRes.data.data ||
            candidateRes.data
        );

        const jobsRes = await axios.get(`${API_URL}/api/jobs`);

        const allJobs = jobsRes.data.jobs || jobsRes.data.data || jobsRes.data || [];

        console.log("ALL JOBS:", allJobs);

        setJobs(Array.isArray(allJobs) ? allJobs : []);
      } catch (err) {
        console.log("DASHBOARD LOAD ERROR:", err.response?.data || err.message);
      }
    };

    if (candidateId) loadDashboard();
  }, [candidateId]);

  const applyJob = async (jobId) => {
    try {
      await axios.post(`${API_URL}/api/jobs/${jobId}/apply/${candidateId}`);
      alert("Applied Successfully");
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Apply failed");
    }
  };

  const autoApply = async () => {
    try {
      if (!window.confirm("Auto apply matching jobs?")) return;

      const res = await axios.post(
        `${API_URL}/api/jobs/auto-apply/${candidateId}`
      );

      alert(`Applied ${res.data.appliedCount || 0} jobs`);
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Auto apply failed");
    }
  };

  if (!candidate) {
    return <div className="loading">Loading Dashboard...</div>;
  }

  const score =
    40 +
    (candidate.resumeUrl ? 15 : 0) +
    (candidate.profileImageUrl ? 10 : 0) +
    (candidate.skills?.length ? 15 : 0) +
    (candidate.profileSummary ? 10 : 0) +
    (candidate.selfIntroVideoUrl ? 10 : 0);

  const filteredJobs = jobs.filter((job) => {
    if (!searchText.trim()) return true;

    const search = searchText.toLowerCase();

    const skillsText = Array.isArray(job.skills)
      ? job.skills
          .map((skill) =>
            typeof skill === "string" ? skill : skill?.name || ""
          )
          .join(" ")
      : job.skills || "";

    return (
      job.title?.toLowerCase().includes(search) ||
      job.jobTitle?.toLowerCase().includes(search) ||
      job.role?.toLowerCase().includes(search) ||
      job.company?.toLowerCase().includes(search) ||
      job.companyName?.toLowerCase().includes(search) ||
      job.location?.toLowerCase().includes(search) ||
      job.city?.toLowerCase().includes(search) ||
      job.workMode?.toLowerCase().includes(search) ||
      job.jobType?.toLowerCase().includes(search) ||
      job.employmentType?.toLowerCase().includes(search) ||
      job.description?.toLowerCase().includes(search) ||
      skillsText.toLowerCase().includes(search)
    );
  });

  const handleSearch = () => {
    document
      .getElementById("jobs")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Navbar
  searchText={searchText}
  setSearchText={setSearchText}
  handleSearch={handleSearch}
/>

      <div className="premium-dashboard target-saas-dashboard">
        <aside className="premium-left">
          <div className="premium-profile-card">
            <div className="premium-avatar">
              {candidate.profileImageUrl ? (
                <img src={candidate.profileImageUrl} alt="profile" />
              ) : (
                <span>{candidate.name?.charAt(0) || "N"}</span>
              )}
            </div>

            <h2>{candidate.name}</h2>
            <span className="verified-badge">Verified Candidate ✓</span>
            <p>{candidate.currentRole || "Candidate"}</p>
            <p>@ {candidate.currentCompany || "Company not added"}</p>
            <p>📍 {candidate.location || "Location not added"}</p>

            <a href={`/profile/${candidate._id}`} className="premium-main-btn">
              Improve Profile
            </a>
          </div>

          <div className="premium-ai-left-panel">
            <div className="premium-ai-head">
              <span>👑</span>
              <div>
                <h3>Premium Career Tools</h3>
                <p>AI-powered career growth panel</p>
              </div>
            </div>

            <button onClick={() => (window.location.href = `/profile/${candidate._id}`)}>
              <b>📝 AI Resume Builder</b>
              <span>Create ATS resume with keywords</span>
            </button>

            <button onClick={() => (window.location.href = "/services")}>
              <b>🧠 AI Skill Gap Analyzer</b>
              <span>Python, AWS, SQL, System Design</span>
            </button>

            <button onClick={() => (window.location.href = "/services")}>
              <b>🎤 Interview Preparation Hub</b>
              <span>HR and technical mock practice</span>
            </button>

            <button onClick={() => (window.location.href = `/profile/${candidate._id}`)}>
              <b>🛡 Verification Center</b>
              <span>PAN, Aadhaar, resume and video proof</span>
            </button>

            <button onClick={autoApply}>
              <b>🤖 Auto Apply Tracker</b>
              <span>{candidate.autoAppliedCount || 0} jobs auto applied</span>
            </button>

            <button onClick={() => (window.location.href = "/jobs")}>
              <b>💼 Opportunity Hub</b>
              <span>Jobs, internships and freelance work</span>
            </button>

            <button onClick={() => (window.location.href = "/services")}>
              <b>✨ AI Career Assistant</b>
              <span>Roadmap, resume tips and career plan</span>
            </button>
          </div>
        </aside>

        <main className="premium-center">
          <section className="premium-hero saas-hero-glass">
            <div>
              <h1>Good Evening, {candidate.name} 👋</h1>
              <p>
                Your profile is getting stronger. Improve trust score and attract
                genuine recruiters.
              </p>

              <div className="hero-actions">
                <a href="/services">AI Career Assistant</a>
                <a href={`/profile/${candidate._id}`}>View My Profile</a>
              </div>
            </div>

            <div className="trust-meter clean-trust-meter">
              <div className="trust-score-number">{Math.min(score + 10, 100)}</div>
              <div className="trust-score-total">/100</div>
              <div className="trust-score-label">Trust Score</div>
              <div className="trust-score-status">Excellent</div>
            </div>
          </section>

          
          <section className="metric-row">
            <div>
              <span>Job Matches</span>
              <h2>{filteredJobs.length}</h2>
              <p>{searchText ? `Results for "${searchText}"` : "Live backend jobs"}</p>
            </div>

            <div>
              <span>Auto Applied</span>
              <h2>{candidate.autoAppliedCount || 0}</h2>
              <p>Active</p>
            </div>

            <div>
              <span>Shortlisted</span>
              <h2>{candidate.shortlisted ? 1 : 0}</h2>
              <p>Recruiter interest</p>
            </div>

            <div>
              <span>Interviews</span>
              <h2>{candidate.interviews?.length || 0}</h2>
              <p>Upcoming</p>
            </div>

            <div>
              <span>Salary Predictor</span>
              <h2>{candidate.expectedSalary || "₹6 - ₹10 LPA"}</h2>
              <p>Based on profile</p>
            </div>
          </section>

          <section className="premium-card jobs-result-section" id="jobs">
            <div className="premium-section-head">
              <h2>Recommended Jobs for You</h2>
              <span>{filteredJobs.length} matches</span>
            </div>

            {filteredJobs.length > 0 ? (
              <div className="premium-job-grid">
                {filteredJobs.map((job) => (
                  <div className="premium-job-card" key={job._id || job.id}>
                    <div className="job-top">
                      <h3>
                        {job.title ||
                          job.jobTitle ||
                          job.role ||
                          "Untitled Job"}
                      </h3>
                      <span>90% Match</span>
                    </div>

                    <p className="job-company">
                      {job.company || job.companyName || "Company not added"}
                    </p>

                    <p>
                      {job.location || job.city || "Location not added"} •{" "}
                      {job.workMode ||
                        job.jobType ||
                        job.employmentType ||
                        "Full-Time"}
                    </p>

                    <h4>{job.salary || job.package || "Salary not disclosed"}</h4>

                    <div className="job-tags">
                      {Array.isArray(job.skills) && job.skills.length > 0 ? (
                        job.skills.slice(0, 4).map((skill, i) => (
                          <span key={skill._id || i}>
                            {typeof skill === "string"
                              ? skill
                              : skill?.name || "Skill"}
                          </span>
                        ))
                      ) : (
                        <span>No skills added</span>
                      )}
                    </div>

                    <button onClick={() => applyJob(job._id || job.id)}>
                      Apply Now
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-premium-box">
                {searchText
                  ? `No jobs found for "${searchText}"`
                  : "No backend jobs found. Ask recruiter to post jobs first."}
              </div>
            )}
          </section>

          <section className="feature-grid">
            <div className="premium-card">
              <h2>Salary Predictor</h2>
              <p>Based on your current profile and skills:</p>
              <h2>{candidate.expectedSalary || "₹6 - ₹10 LPA"}</h2>
              <p>
                Add resume, project proof and verification to improve salary range.
              </p>
            </div>
          </section>
        </main>

        <aside className="premium-right">
          <div className="premium-card">
            <div className="premium-section-head">
              <h3>Recruiter Activity</h3>
              <a href="#">View All →</a>
            </div>

            <div className="activity-item">
              <b>Recruiter viewed your profile</b>
              <span>2h ago</span>
            </div>

            <div className="activity-item">
              <b>You were shortlisted</b>
              <span>5h ago</span>
            </div>

            <div className="activity-item">
              <b>Resume opened</b>
              <span>1d ago</span>
            </div>
          </div>

          <div className="premium-card">
            <div className="premium-section-head">
              <h3>Interview Alerts</h3>
              <a href="#">View All →</a>
            </div>

            <div className="activity-item">
              <b>Technical Round</b>
              <span>No schedule yet</span>
            </div>

            <div className="activity-item">
              <b>HR Round</b>
              <span>No schedule yet</span>
            </div>
          </div>

          <div className="passport-card right-premium-card">
            <h3>Candidate Trust Passport</h3>

            <div>
              <span>Proxy Risk Shield</span>
              <b>Clean</b>
            </div>

            <div>
              <span>Identity Verified</span>
              <b>{candidate.identityStatus || "Pending"}</b>
            </div>

            <div>
              <span>Resume Verified</span>
              <b>{candidate.resumeUrl ? "Added" : "Missing"}</b>
            </div>

            <div>
              <span>Project Proof</span>
              <b>{candidate.projectVideoUrl ? "Added" : "Missing"}</b>
            </div>

            <div>
              <span>Self Intro Video</span>
              <b>{candidate.selfIntroVideoUrl ? "Added" : "Missing"}</b>
            </div>

            <div>
              <span>Recruiter Confidence</span>
              <b>4.7/5</b>
            </div>
          </div>

          <div className="resume-strength-card right-premium-card">
            <h3>Resume Strength</h3>
            <h2>{Math.min(score, 100)}/100</h2>

            <div className="green-progress">
              <span style={{ width: `${Math.min(score, 100)}%` }}></span>
            </div>

            <p>Add resume, projects, videos and skills to improve.</p>

            <a href={`/profile/${candidate._id}`}>Optimize Resume →</a>
          </div>

          <div className="premium-card">
            <h3>Career Growth Insights</h3>
            <div className="career-chip">Data Engineering</div>
            <div className="career-chip">AWS</div>
            <div className="career-chip">Python</div>
            <p>Data Engineer roles are high in demand in your location.</p>
          </div>
        </aside>
      </div>
    </>
  );
}
function TalentInsightPanel({ candidate, score }) {
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
        <h4>AI Profile Match</h4>
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
          🤖 AI Job Assistant <b>New</b>
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
        <p>Unlock AI hiring tools and reach verified candidates faster.</p>

        <button onClick={() => goTo("/recruiter-billing")}>
          Upgrade Now →
        </button>
      </div>
    </aside>
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
      title: "AI Resume Studio",
      desc: "Create ATS-ready resumes with AI.",
      path: "/feature/resume-studio",
      icon: "📄",
    },
    {
      title: "AI Match Score",
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
            Unlock Your AI Career Workspace
          </h1>

          <p>
            Access all premium AI tools after subscription.
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
                <h2>AI Insights</h2>
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
              <span>AI Quality</span>
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
                <h2>✨ AI Job Quality</h2>
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
              <h1>AI Talent Search Command Center</h1>
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
function UltimateDashboard() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const name = user?.name || "Venkatesha A";

  const [activeTool, setActiveTool] = useState(null);
  const [aiQuestion, setAiQuestion] = useState("");
  const [autoApplyConsent, setAutoApplyConsent] = useState(
    localStorage.getItem("autoApplyConsent") === "true"
  );
  const [autoApplyLoading, setAutoApplyLoading] = useState(false);
  const [autoApplyResult, setAutoApplyResult] = useState(null);

  const candidateId = user?.candidateId || user?._id || user?.id;

  const stats = [
    ["📄", "Resume Score", "92%", "ATS Optimized", "+14% this week"],
    ["🎯", "Job Match Score", "90%", "High Fit Roles", "+22% this week"],
    ["🛡", "Trust Score", "96%", "Verified Profile", "+8% this week"],
    ["💼", "Applications", "28", "Active Applications", "+5 new today"],
    ["⚡", "Auto Apply", "124", "Applications Sent", "+18 this week"],
  ];

  const tools = [
    ["⚡", "Auto Apply Engine", "Smart Apply to Jobs"],
    ["📄", "AI Resume Studio", "Build ATS Resume"],
    ["🎯", "AI Match Score", "Check Job Fit"],
    ["🧠", "Skill Gap Analyzer", "Find Missing Skills"],
    ["🎤", "Interview Prep Hub", "Practice Interviews"],
    ["💰", "Salary Predictor", "Predict Salary Range"],
    ["🛡", "Trust Passport", "Verify Your Profile"],
    ["🔔", "Instant Job Alerts", "Real-time Alerts"],
    ["💎", "Hidden Opportunities", "Exclusive Jobs"],
  ];

  const goToJobs = () => {
    window.location.href = "/jobs";
  };

  const goToProfile = () => {
    window.location.href = candidateId ? `/profile/${candidateId}` : "/candidate-login";
  };

  const goToNotifications = () => {
    window.location.href = "/notifications";
  };

  const scrollToWorkspace = () => {
    document
      .getElementById("ultimate-ai-workspace")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const openToolModal = (toolName) => {
    setActiveTool(toolName);
  };

  const generateAIAnswer = () => {
    if (!aiQuestion.trim()) {
      alert("Please enter your career question");
      return;
    }

    alert("AI answer frontend is ready. Backend AI API will be connected next.");
  };

  const giveAutoApplyConsent = () => {
    if (!candidateId) {
      alert("Please login as candidate");
      window.location.href = "/candidate-login";
      return;
    }

    localStorage.setItem("autoApplyConsent", "true");
    setAutoApplyConsent(true);
    alert("Consent saved. Auto Apply is enabled.");
  };

  const startAutoApply = async () => {
    if (!candidateId) {
      alert("Please login as candidate");
      window.location.href = "/candidate-login";
      return;
    }

    if (!autoApplyConsent) {
      alert("Please give consent first.");
      return;
    }

    try {
      setAutoApplyLoading(true);

      const res = await axios.post(
        `${API_URL}/api/auto-apply/run/${candidateId}`
      );

      setAutoApplyResult(res.data);

      alert(
        res.data?.message ||
          `Auto Apply completed. ${res.data?.appliedCount || 0} jobs applied.`
      );
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert(err.response?.data?.message || "Auto Apply failed");
    } finally {
      setAutoApplyLoading(false);
    }
  };

  const toolActions = {
  "Auto Apply Engine": () => openToolModal("Auto Apply Engine"),

  "AI Resume Studio": () => {
    window.location.href = "/resume-studio";
  },

  "AI Match Score": goToJobs,

 "Skill Gap Analyzer": () => {
  window.location.href = "/skill-analyzer";
},

  "Interview Prep Hub": () => {
    window.location.href = "/interview-prep";
  },

  "Salary Predictor": () => {
    window.location.href = "/salary-predictor";
  },

  "Trust Passport": () => {
    window.location.href = "/trust-passport";
  },

  "Instant Job Alerts": goToNotifications,

  "Hidden Opportunities": () => {
  window.location.href = "/hidden-opportunities";
},
};
return (
  <main className="ultimate-dark-page">
    <aside className="ultimate-sidebar">
      <div className="ultimate-brand">
        <img src="/logo.png" alt="NoPromptJobs" />
        <div>
          <h2>NoPromptJobs</h2>
          <span>ULTIMATE</span>
        </div>
      </div>

      <nav>
        <a className="active" onClick={scrollToWorkspace}>⌂ Dashboard</a>
        <a onClick={scrollToWorkspace}>✦ AI Workspace</a>
        <a onClick={goToJobs}>▣ Applications <b>28</b></a>
        <a onClick={() => openToolModal("Auto Apply Engine")}>⚡ Auto Apply <b>124</b></a>
        <a onClick={() => openToolModal("Premium Job Alerts")}>
  🔔 Job Alerts <b>12</b>
</a>
        <a onClick={() => (window.location.href = "/resume-studio")}>📄 Resume Studio</a>
        <a onClick={() => (window.location.href = "/ai-interview-prep")}>🎤 Interview Prep</a>
        <a onClick={() => (window.location.href = "/skill-analyzer")}>▦ Skill Analyzer</a>
        <a onClick={() => (window.location.href = "/trust-passport")}>🛡 Trust Passport</a>
        <a onClick={() => (window.location.href = "/salary-predictor")}>💼 Salary Predictor</a>
        <a onClick={goToJobs}>💎 Hidden Opportunities</a>
        <a onClick={() => openToolModal("Career Roadmap")}>📊 Career Roadmap</a>
      </nav>

      <div className="ultimate-plan-box">
        <span>👑</span>
        <p>Upgrade Status</p>
        <h3>Ultimate Plan</h3>
        <b>Active</b>
        <small>Valid till 17 Jul, 2026</small>
      </div>
    </aside>

    <section className="ultimate-main">
      <div className="ultimate-top-search">
        <input placeholder="Search jobs, skills, companies..." />
        <button onClick={() => openToolModal("AI Career Assistant")}>
          ✦ AI Assistant
        </button>
        <span onClick={goToNotifications}>🔔</span>
        <div className="ultimate-avatar">{name.charAt(0).toUpperCase()}</div>
      </div>

      <section className="ultimate-hero-dark">
        <div>
          <p>Welcome back, {name}! 👋</p>
          <h1>
            Your <span>Ultimate</span>
            <br />
            AI Career Command Center
          </h1>
          <p>
            All premium AI tools, insights and opportunities — powered to
            accelerate your career.
          </p>

          <div className="ultimate-hero-buttons">
            <button onClick={scrollToWorkspace}>Launch AI Workspace →</button>
            <button className="ghost" onClick={scrollToWorkspace}>
              Explore All Tools
            </button>
          </div>
        </div>

        <div className="ultimate-access-card">
          <div className="crown">👑</div>
          <h2>Ultimate Access</h2>
          <p>All 9 AI Tools Unlocked</p>
          <span>● Active</span>
        </div>
      </section>

      <section className="ultimate-stats-row">
        {stats.map((item) => (
          <div className="ultimate-stat-card" key={item[1]}>
            <div className="stat-icon">{item[0]}</div>
            <p>{item[1]}</p>
            <h2>{item[2]}</h2>
            <span>{item[3]}</span>
            <b>↑ {item[4]}</b>
          </div>
        ))}
      </section>

      <section className="ultimate-grid-layout">
        <div className="ultimate-panel large" id="ultimate-ai-workspace">
          <div className="panel-head">
            <div>
              <h2>AI Workspace</h2>
              <p>Powerful AI tools to supercharge your career</p>
            </div>
            <button onClick={scrollToWorkspace}>View All Tools →</button>
          </div>

          <div className="ultimate-tool-grid">
            {tools.map((tool) => (
              <button
                className="ultimate-tool-mini"
                key={tool[1]}
                onClick={toolActions[tool[1]]}
              >
                <span>{tool[0]}</span>
                <div>
                  <h4>{tool[1]}</h4>
                  <p>{tool[2]}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="ultimate-panel">
          <h2>AI Career Assistant</h2>
          <p>Ask anything about your career</p>

          <div className="ultimate-ai-input">
            <input
              placeholder="Example: How can I become a Data Engineer in 6 months?"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
            />
            <button onClick={generateAIAnswer}>➤</button>
          </div>

          <div className="quick-tags">
            <button onClick={() => setAiQuestion("How can I improve my resume?")}>
              Improve my resume
            </button>
            <button onClick={() => setAiQuestion("Find high paying jobs for my profile")}>
              Find high paying jobs
            </button>
            <button onClick={() => setAiQuestion("Give me interview preparation tips")}>
              Interview tips
            </button>
            <button onClick={() => setAiQuestion("Create my skill roadmap")}>
              Skill roadmap
            </button>
          </div>
        </div>

        <div className="ultimate-panel">
          <div className="panel-head">
            <div>
              <h2>Your AI Roadmap</h2>
              <p>Personalized steps to achieve your dream career</p>
            </div>
            <button onClick={() => openToolModal("Career Roadmap")}>
              View Full Roadmap →
            </button>
          </div>

          <div className="roadmap-dark">
            <div className="done">✓ Step 1 <b>Improve Resume Score</b></div>
            <div>▣ Step 2 <b>Complete Trust Passport</b></div>
            <div>✦ Step 3 <b>Apply to 90% Match Jobs</b></div>
            <div>◉ Step 4 <b>Practice Interviews</b></div>
          </div>
        </div>

        <div className="ultimate-panel">
          <h2>Recent Activity</h2>
          <div className="activity-dark">
            ✦ Auto applied to 15 new jobs <span>2 min ago</span>
          </div>
          <div className="activity-dark">
            ↻ Resume score improved to 92% <span>1 hour ago</span>
          </div>
        </div>

        <div className="ultimate-panel">
          <h2>Top Job Matches</h2>
          <div className="job-match-dark" onClick={goToJobs}>
            <div>💼</div>
            <div>
              <h4>Senior Data Engineer</h4>
              <p>Tech Mahindra</p>
            </div>
            <b>95% Match</b>
          </div>
        </div>

        <div className="ultimate-panel">
          <h2>Skills Analysis</h2>
          <div className="skill-circle">86%</div>
          <p>In Demand: 28</p>
          <p>Good: 12</p>
          <p>Need Improvement: 4</p>
          <button
            className="skills-action-btn"
            onClick={() => openToolModal("Skills Analysis")}
          >
            View Details →
          </button>
        </div>
      </section>

      {activeTool && (
        <div className="ultimate-modal-overlay">
          <div className="ultimate-tool-modal">
            <button className="modal-close" onClick={() => setActiveTool(null)}>
              ×
            </button>

{activeTool === "Premium Job Alerts" ? (
  <div className="premium-alerts-box">
    <div className="auto-premium-icon">🔔</div>

    <h3>Premium Job Alerts</h3>
    <h4>AI-powered instant opportunity tracking</h4>

    <div className="premium-alerts-grid">
      {[
        {
          icon: "🚀",
          title: "High-match Data Engineer role found",
          desc: "96% match • Bangalore • 2 min ago",
          action: () => {
            setActiveTool(null);
            window.location.href = "/jobs";
          },
        },

        {
          icon: "💎",
          title: "Hidden recruiter-only opportunity",
          desc: "Private opening • Premium access",
          action: () => {
            setActiveTool(null);
            window.location.href = "/hidden-opportunities";
          },
        },

        {
          icon: "⚡",
          title: "Fast apply window closing soon",
          desc: "Apply within 24 hours",
          action: () => {
            setActiveTool("Auto Apply Engine");
          },
        },

        {
          icon: "🎯",
          title: "Salary upgraded match",
          desc: "₹10–18 LPA role matched",
          action: () => {
            setActiveTool(null);
            window.location.href = "/salary-predictor";
          },
        },
      ].map((item) => (
        <div className="premium-alert-card" key={item.title}>
          <span>{item.icon}</span>

          <div>
            <h5>{item.title}</h5>
            <p>{item.desc}</p>
          </div>

          <button onClick={item.action}>
            View →
          </button>
        </div>
      ))}
    </div>
  </div>
): activeTool === "Auto Apply Engine" ? (
  <div className="auto-apply-premium-box">
    <div className="auto-premium-icon">🚀</div>

    <h3>Auto Apply Engine</h3>
    <h4>One-Time Auto Apply Consent</h4>

    <p>
      Give permission once. NoPromptJobs will automatically apply for
      suitable and recommended jobs based on your skills, profile,
      location, experience and job preference.
    </p>

    <div className="auto-consent-premium-card">
      <div className="auto-shield-card">
        <span>🛡</span>
      </div>

      <label className="auto-consent-premium-check">
        <input
          type="checkbox"
          checked={autoApplyConsent}
          onChange={(e) => {
            setAutoApplyConsent(e.target.checked);
            localStorage.setItem("autoApplyConsent", e.target.checked);
          }}
        />

        <div>
          <b>
            I allow NoPromptJobs to auto-apply for suitable jobs on
            my behalf.
          </b>
          <small>
            Your data is safe and secure. You can pause or stop
            anytime.
          </small>
        </div>
      </label>
    </div>

    {!autoApplyConsent ? (
      <button className="auto-premium-btn" onClick={giveAutoApplyConsent}>
        Give Consent →
      </button>
    ) : (
      <button
        className="auto-premium-btn"
        onClick={startAutoApply}
        disabled={autoApplyLoading}
      >
        {autoApplyLoading
          ? "Applying to suitable jobs..."
          : "Start Auto Apply Now →"}
      </button>
    )}

    {autoApplyResult && (
      <div className="auto-success-premium">
        <span>✅</span>
        <div>
          <h2>{autoApplyResult.appliedCount || 0}</h2>
          <p>Jobs Applied Successfully</p>
          <small>
            Matched Jobs: {autoApplyResult.totalMatchedJobs || 0}
          </small>
        </div>
      </div>
    )}
  </div>
) : (
  <>
    <h2>{activeTool}</h2>
    <p>
      This feature is unlocked in Ultimate Plan. Frontend flow is
      ready. Backend AI API connection will be added step by step.
    </p>
    <button onClick={() => setActiveTool(null)}>
      Continue Setup →
    </button>
  </>
)}
          </div>
        </div>
      )}
    </section>
  </main>
);}
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
                  Upgrade to unlock auto apply, AI resume studio, salary
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
                Upgrade your hiring workspace with advanced search, AI hiring tools,
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

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/companies`);
        setCompanies(res.data);
      } catch (err) {
        console.log(err.response?.data || err.message);
      }
    };

    loadCompanies();
  }, []);

  return (
    <>
      <Navbar />

      <div className="companies-page">
        <section className="companies-hero">
          <h1>Companies Hiring Now</h1>
          <p>Explore companies with active job postings.</p>
          <h2>{companies.length}</h2>
        </section>

        {companies.length > 0 ? (
          <div className="all-company-grid">
            {companies.map((company, index) => (
              <div className="all-company-card" key={index}>
                <h2>{company.company}</h2>
                <p>{company.openings || 0} active jobs</p>
                <span>{company.location || "Location not added"}</span>
                <a href="/jobs">View Jobs</a>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-premium-box">
            No companies found. Companies will appear after recruiters post jobs.
          </div>
        )}
      </div>
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