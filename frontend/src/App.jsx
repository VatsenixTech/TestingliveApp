import { useEffect, useState } from "react";
import axios from "axios";
import "./index.css";

const API_URL = import.meta.env.VITE_API_URL;


function LandingPage() {
  return (
    <div className="np-home-page">
      <nav className="np-home-nav">
        <a href="/" className="np-home-brand">
          <img src="/logo.png" alt="NoProxiesJobs" />

          <div>
            <h2>NOPROXIESJOBS.COM</h2>
            <span>Smart Solutions. Real Results.</span>
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
            🛡 Trusted AI Hiring Platform
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

  const loginCandidate = async () => {
    const loginEmail = email.trim().toLowerCase();

    if (!loginEmail || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/candidates/login`, {
        email: loginEmail,
        password,
      });

      const candidate = res.data.candidate || res.data.data || res.data;

      if (!candidate?._id) {
        alert("Candidate profile not found. Please create profile.");
        window.location.href = "/candidate-email-verify";
        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          name: candidate.name || "",
          email: candidate.email || loginEmail,
          role: "candidate",
          candidateId: candidate._id,
        })
      );

      window.location.href = `/dashboard/${candidate._id}`;
    } catch (err) {
      console.log("Candidate Login Error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Login failed. Please check email and password.");
    }
  };

  return (
    <>
      <div className="auth-page">
        <div className="auth-card">
          <h1>Candidate Login</h1>
          <p>Login to manage your verified talent profile.</p>

          <input
            placeholder="Candidate Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={loginCandidate}>Login as Candidate</button>

          <a href="/candidate-email-verify">Create Candidate Account</a>
          <a href="/">Back to Home</a>
        </div>
      </div>
    </>
  );
}

function CandidateEmailVerify() {
  const [email, setEmail] = useState(localStorage.getItem("candidateSignupEmail") || "");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    const signupEmail = email.trim().toLowerCase();

    if (!signupEmail) {
      alert("Please enter your Gmail/email");
      return;
    }

    try {
      setLoading(true);

      await axios.post(`${API_URL}/api/candidates/send-otp`, {
        email: signupEmail,
      });

      localStorage.setItem("candidateSignupEmail", signupEmail);
      setOtpSent(true);
      alert("OTP sent to your email");
    } catch (err) {
      console.log("Send OTP Error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    const signupEmail = email.trim().toLowerCase();

    if (!signupEmail || !otp.trim()) {
      alert("Please enter email and OTP");
      return;
    }

    try {
      setLoading(true);

      await axios.post(`${API_URL}/api/candidates/verify-otp`, {
        email: signupEmail,
        otp: otp.trim(),
      });

      localStorage.setItem("candidateSignupEmail", signupEmail);
      localStorage.setItem("candidateOtpVerified", "true");

      alert("Email verified successfully");
      window.location.href = "/candidate-set-password";
    } catch (err) {
      console.log("Verify OTP Error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Verify Candidate Email</h1>
        <p>Enter your email. We will send an OTP before profile registration.</p>

        <input
          placeholder="Candidate Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={otpSent}
        />

        {!otpSent ? (
          <button onClick={sendOtp} disabled={loading}>
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        ) : (
          <>
            <input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button onClick={verifyOtp} disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button type="button" onClick={() => setOtpSent(false)}>
              Change Email
            </button>
          </>
        )}

        <a href="/candidate-login">Already have account? Login</a>
        <a href="/">Back to Home</a>
      </div>
    </div>
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

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/jobs`
        );

        setJobs(res.data);

      } catch (err) {
        console.log(
          err.response?.data || err.message
        );
      }
    };

    loadJobs();

  }, []);

  const applyJob = async (jobId) => {
    if (!user?.candidateId) {
      alert("Please login as candidate");

      window.location.href =
        "/candidate-login";

      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/jobs/${jobId}/apply/${user.candidateId}`
      );

      alert("Applied successfully");

    } catch (err) {
      console.log(
        err.response?.data || err.message
      );

      alert("Apply failed");
    }
  };
  return (
  <>
    <Navbar />

    <div className="jobs-page">
      <section className="jobs-hero">
        <div>
          <h1>Jobs Matching Your Talent</h1>
          <p>Explore real jobs posted by recruiters on NoProxy Talent.</p>
        </div>

        <div className="jobs-count-box">
          <h2>{jobs.length}</h2>
          <span>Live Jobs</span>
        </div>
      </section>

      {jobs.length > 0 ? (
        <div className="all-jobs-grid">
          {jobs.map((job) => (
            <div className="all-job-card" key={job._id}>
              <div className="job-top">
                <h3>{job.title || "Job title not added"}</h3>
                <span>Verified</span>
              </div>

              <p className="job-company">
                {job.company || "Company not added"}
              </p>

              <p>
                {job.location || "Location not added"} •{" "}
                {job.workMode || "Work mode not added"}
              </p>

              <h4>{job.salary || "Salary not disclosed"}</h4>

              <div className="job-tags">
                {Array.isArray(job.skills) && job.skills.length > 0 ? (
                  job.skills.slice(0, 5).map((skill, i) => (
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

              <button onClick={() => applyJob(job._id)}>
                Apply Now
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-premium-box">
          No jobs available yet. Jobs will appear after recruiters post them.
        </div>
      )}
    </div>
  </>
);
}
function ServicesPage() {
  const [showProDetails, setShowProDetails] = useState(false);

  return (
    <>
      <Navbar />

      <div className="services-page">
        <section className="services-hero">
          <div>
            <h1>NoProxy Candidate Services</h1>
            <p>
              Premium tools to improve profile strength, interview confidence,
              and recruiter response.
            </p>
          </div>
        </section>

        <div className="services-grid">
          <div className="service-card-pro">
            <h2>📝 AI Resume Preparation</h2>
            <p>Improve ATS score, keywords, achievements and recruiter visibility.</p>
            <button onClick={() => setShowProDetails(true)}>View Details</button>
          </div>

          <div className="service-card-pro">
            <h2>🎤 Mock Interview</h2>
            <p>Practice technical, HR, project explanation and communication rounds.</p>
            <button onClick={() => setShowProDetails(true)}>View Details</button>
          </div>

          <div className="service-card-pro">
            <h2>🚀 Profile Boost</h2>
            <p>Improve search appearance and stand out as a verified candidate.</p>
            <button onClick={() => setShowProDetails(true)}>View Details</button>
          </div>

          <div className="service-card-pro">
            <h2>🧭 Career Guidance</h2>
            <p>Get roadmap suggestions based on role, skills, and market demand.</p>
            <button onClick={() => setShowProDetails(true)}>View Details</button>
          </div>

          <div className="service-card-pro">
            <h2>🤖 Auto Apply With Consent</h2>
            <p>Apply only to matching jobs after candidate approval and consent.</p>
            <button onClick={() => setShowProDetails(true)}>View Details</button>
          </div>

          <div className="service-card-pro">
            <h2>🛡 NoProxy Verification</h2>
            <p>Face check, project proof, intro video and genuine candidate trust badge.</p>
            <button onClick={() => setShowProDetails(true)}>View Details</button>
          </div>
        </div>

        {showProDetails && (
          <div className="modal-overlay">
            <div className="edit-modal">
              <h2>NoProxy Pro Package</h2>
              <p>✅ AI Resume Optimization</p>
              <p>✅ Mock Interview Practice</p>
              <p>✅ Career Guidance</p>
              <p>✅ Profile Boost</p>
              <p>✅ Auto Apply With Consent</p>
              <p>✅ Genuine Candidate Verification</p>

              <button onClick={() => alert("Payment integration coming soon")}>
                Buy NoProxy Pro
              </button>

              <button onClick={() => setShowProDetails(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
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

  if (path.startsWith("/recruiter-job-details/"))
    return <RecruiterJobDetailsPage />;

  if (path === "/recruiter-ai-assistant") return <RecruiterAIAssistantPage />;
  if (path === "/recruiter-interviews") return <RecruiterInterviewStagesPage />;
  if (path === "/recruiter-screening") return <RecruiterScreeningPage />;
  if (path === "/recruiter-team") return <RecruiterTeamPage />;
  if (path === "/recruiter-billing") return <RecruiterBillingPage />;
  if (path === "/jobs") return <JobsPage />;
  if (path === "/services") return <ServicesPage />;
  if (path === "/notifications") return <NotificationsPage />;

  return <LandingPage />;
}
function Navbar() {
  const [showMenu, setShowMenu] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
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

  const candidateDashboardLink = user?.candidateId
    ? `/dashboard/${user.candidateId}`
    : "/candidate-login";

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const goProfile = () => {
    if (user?.candidateId) {
      window.location.href = `/profile/${user.candidateId}`;
    } else if (isRecruiterPage) {
      window.location.href = "/recruiter-profile";
    } else {
      window.location.href = "/candidate-login";
    }
  };

  if (isRecruiterPage) {
    return (
      <div className="topbar recruiter-topbar">
         <a href="/recruiter-dashboard" className="brand recruiter-brand recruiter-brand-empty">
          </a>

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
    <a href={candidateDashboardLink} className="brand">
      <img 
        src="/logo.png"
        alt="NoProxiesJobs" 
        className="site-logo"
       />

      <div className="brand-name">
        <h2>NOPROXIESJOBS.COM</h2>
        <small>SMART SOLUTIONS. REAL RESULTS.</small>
      </div>
    </a>

    <div className="candidate-search-wrap">
      <input
        className="top-search"
        placeholder="Search jobs, skills, companies..."
      />
      <span>⌕</span>
    </div>

    <div className="nav-menu candidate-nav-menu">
      <a href={candidateDashboardLink}>Dashboard</a>
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

        <span className="profile-label">
          {user?.name || "Dashboard"}
        </span>

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

          <button
            type="button"
            onClick={() => (window.location.href = candidateDashboardLink)}
          >
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
            🚀 NoProxiesJobs Pro
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
          <h3>👑 NoProxy Pro</h3>
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
  const [showProDetails, setShowProDetails] = useState(false);

  const candidateId = window.location.pathname.split("/").pop();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const candidateRes = await axios.get(
          `${API_URL}/api/candidates/${candidateId}`
        );

        setCandidate(candidateRes.data.candidate || candidateRes.data.data || candidateRes.data);

        const jobsRes = await axios.get(
          `${API_URL}/api/jobs/recommended/${candidateId}`
        );

        setJobs(jobsRes.data);

      } catch (err) {
        console.log(err.response?.data || err.message);
      }
    };

    if (candidateId) loadDashboard();

  }, [candidateId]);

  const applyJob = async (jobId) => {
    try {
      await axios.post(
        `${API_URL}/api/jobs/${jobId}/apply/${candidateId}`
      );

      alert("Applied Successfully");

    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Apply failed");
    }
  };

  const autoApply = async () => {
    try {
      if (!window.confirm("Auto apply matching jobs?"))
        return;

      const res = await axios.post(
        `${API_URL}/api/jobs/auto-apply/${candidateId}`
      );

      alert(
        `Applied ${res.data.appliedCount} jobs`
      );

    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Auto apply failed");
    }
  };

  if (!candidate) {
    return (
      <div className="loading">
        Loading Dashboard...
      </div>
    );
  }

  const score =
    40 +
    (candidate.resumeUrl ? 15 : 0) +
    (candidate.profileImageUrl ? 10 : 0) +
    (candidate.skills?.length ? 15 : 0) +
    (candidate.profileSummary ? 10 : 0) +
    (candidate.selfIntroVideoUrl ? 10 : 0);

  const companies = [
    ...new Map(
      jobs
        .filter((job) => job.company)
        .map((job) => [
          job.company,
          {
            company: job.company,
            location: job.location,
            workMode: job.workMode,
            openings: jobs.filter(
              (j) => j.company === job.company
            ).length,
            skills: job.skills || [],
          },
        ])
    ).values(),
  ];
return (
  <>
    <Navbar />

    <div className="premium-dashboard">
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

        <div className="passport-card">
          <h3>Candidate Trust Passport</h3>

          <div><span>Proxy Risk Shield</span><b>Clean</b></div>
          <div><span>Identity Verified</span><b>Verified</b></div>
          <div><span>Documents Verified</span><b>3/3</b></div>
          <div><span>Project Proof Score</span><b>92/100</b></div>

          <div>
            <span>Self Intro Video</span>
            <b>{candidate.selfIntroVideoUrl ? "88/100" : "Missing"}</b>
          </div>

          <div><span>Recruiter Confidence</span><b>4.7/5</b></div>
        </div>

        <div className="resume-strength-card">
          <h3>Resume Strength</h3>
          <h2>{Math.min(score, 100)}/100</h2>

          <div className="green-progress">
            <span style={{ width: `${Math.min(score, 100)}%` }}></span>
          </div>

          <p>Your resume looks good. Add measurable achievements to improve.</p>

          <a href={`/profile/${candidate._id}`}>Optimize Resume →</a>
        </div>
      </aside>

      <main className="premium-center">
        <section className="premium-hero">
          <div>
            <h1>Good Evening, {candidate.name} 👋</h1>
            <p>
              Your profile is getting stronger. Improve trust score and attract
              genuine recruiters.
            </p>

            <div className="hero-actions">
              <a href={`/profile/${candidate._id}`}>AI Career Assistant</a>
              <a href={`/profile/${candidate._id}`}>View My Profile</a>
            </div>
          </div>

          <div className="trust-meter">
            <h2>{Math.min(score + 10, 100)}</h2>
            <p>/100</p>
            <span>Trust Score</span>
            <b>Excellent</b>
          </div>
        </section>

        <section className="metric-row">
          <div>
            <span>Job Matches</span>
            <h2>{jobs.length}</h2>
            <p>Live backend jobs</p>
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
        </section>

        <section className="premium-card" id="jobs">
          <div className="premium-section-head">
            <h2>Recommended Jobs for You</h2>
            <span>{jobs.length} matches</span>
          </div>

          {jobs.length > 0 ? (
            <div className="premium-job-grid">
              {jobs.slice(0, 6).map((job) => (
                <div className="premium-job-card" key={job._id}>
                  <div className="job-top">
                    <h3>{job.title}</h3>
                    <span>90% Match</span>
                  </div>

                  <p className="job-company">{job.company}</p>
                  <p>{job.location} • {job.workMode}</p>

                  <h4>{job.salary || "Salary not disclosed"}</h4>

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
                  <button onClick={() => applyJob(job._id)}>Apply Now</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-premium-box">
              No backend jobs found. Ask recruiter to post jobs first.
            </div>
          )}
        </section>

        <section className="bottom-grid">
          <div className="premium-card">
            <div className="premium-section-head">
              <h2>Auto Apply Tracker</h2>
              <button onClick={autoApply}>Manage Consent</button>
            </div>

            <p>No auto-apply records yet.</p>
          </div>

          <div className="premium-card">
            <h2>Profile Improvement Tasks</h2>

            <div className="task-item">
              <div>
                <b>Add Work Experience</b>
                <p>Add details of your work experience</p>
              </div>
              <span>+15%</span>
            </div>

            <div className="task-item">
              <div>
                <b>Verify College Email</b>
                <p>Get your education verified</p>
              </div>
              <span>+10%</span>
            </div>

            <div className="task-item">
              <div>
                <b>Add Project Details</b>
                <p>Add 2 more projects</p>
              </div>
              <span>+10%</span>
            </div>
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

        <div className="premium-card">
          <h3>Career Growth Insights</h3>

          <div className="career-chip">Data Engineering</div>
          <div className="career-chip">AWS</div>
          <div className="career-chip">Python</div>

          <p>Data Engineer roles are high in demand in your location.</p>
        </div>

        <div className="premium-pro-card" id="services">
          <h3>👑 NoProxy Pro</h3>
          <p>Unlock premium tools to accelerate your career.</p>

          <ul>
            <li>AI Resume Optimization</li>
            <li>Mock Interview Practice</li>
            <li>Salary Insights</li>
            <li>Priority Job Recommendations</li>
          </ul>

          <button onClick={() => setShowProDetails(true)}>
            Upgrade to Pro
          </button>
        </div>
      </aside>
    </div>

    {showProDetails && (
      <div className="modal-overlay">
        <div className="edit-modal">
          <h2>NoProxy Pro Benefits</h2>

          <p>✅ AI Resume Optimization</p>
          <p>✅ Mock Interview Practice</p>
          <p>✅ Profile Boost</p>
          <p>✅ Career Guidance</p>
          <p>✅ Auto Apply with Consent</p>

          <button onClick={() => alert("Payment integration coming soon")}>
            Buy NoProxy Pro
          </button>

          <button onClick={() => setShowProDetails(false)}>Close</button>
        </div>
      </div>
    )}
  </>
);}
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

      <div className="advanced-brand-card">

        <img
          src="/logo.png"
          alt="NoProxiesJobs.com"
          className="advanced-company-logo"
        />

        <h2>NOPROXYJOBS.COM</h2>

        <p>Smart Solutions. Real Results.</p>

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
function RecruiterDashboard() {
  const [stats, setStats] = useState({
    totalCandidates: 0,
    shortlisted: 0,
    jobsPosted: 0,
    applications: 0,
  });

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  const recruiterName =
    user?.name || user?.email?.split("@")[0] || "Recruiter";

  useEffect(() => {
    loadDashboard();
  }, []);

  

  const loadDashboard = async () => {
    try {
      const candidatesRes = await axios.get(`${API_URL}/api/candidates`);
      const jobsRes = await axios.get(`${API_URL}/api/jobs`);

      const candidates = candidatesRes.data || [];
      const jobList = jobsRes.data || [];

      const appliedCandidates = candidates.filter((c) => c.applied === true);

      setStats({
        totalCandidates: candidates.length,
        shortlisted: candidates.filter((c) => c.shortlisted === true).length,
        jobsPosted: jobList.length,
        applications: appliedCandidates.length,
      });

      setJobs(jobList.slice(0, 5));
      setApplications(appliedCandidates.slice(0, 5));
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Dashboard data loading failed");
    }
  };

  return (
    <>
      <Navbar />

      <div className="hr-dashboard">
        <RecruiterAdvancedSidebar />

        <main className="hr-main">
          <section className="hr-welcome">
            <div>
              <h1>Welcome back, {recruiterName} 👋</h1>
              <p>Track jobs, candidates, applications and hiring performance.</p>
            </div>

            <button onClick={() => (window.location.href = "/recruiter-post-job")}>
              + Post New Job
            </button>
          </section>

          <section className="hr-stats">
            <div className="hr-stat purple">
              <span>👥</span>
              <div>
                <p>Total Candidates</p>
                <h2>{stats.totalCandidates}</h2>
                <small>Live database</small>
              </div>
            </div>

            <div className="hr-stat green">
              <span>🔖</span>
              <div>
                <p>Shortlisted</p>
                <h2>{stats.shortlisted}</h2>
                <small>Real shortlisted</small>
              </div>
            </div>

            <div className="hr-stat blue">
              <span>💼</span>
              <div>
                <p>Jobs Posted</p>
                <h2>{stats.jobsPosted}</h2>
                <small>Real jobs</small>
              </div>
            </div>

            <div className="hr-stat orange">
              <span>📄</span>
              <div>
                <p>Applications</p>
                <h2>{stats.applications}</h2>
                <small>Real applications</small>
              </div>
            </div>
          </section>

          <section className="hr-card">
            <div className="hr-section-head">
              <h2>Recent Job Posts</h2>
              <button onClick={() => (window.location.href = "/recruiter-post-job")}>
                View All Jobs →
              </button>
            </div>

            <div className="hr-job-table">
              <div className="hr-job-row hr-table-head">
                <span>Job Title</span>
                <span>Applications</span>
                <span>Status</span>
                <span>Location</span>
                <span>Action</span>
              </div>

              {jobs.length ? (
                jobs.map((job) => (
                  <div className="hr-job-row" key={job._id}>
                    <span>
                      <b>{job.title}</b>
                      <small>{job.company}</small>
                    </span>

                    <span>{job.applications?.length || 0}</span>

                    <span className="hr-status active">
                      {job.status || "Active"}
                    </span>

                    <span>{job.location || "Not added"}</span>

                    <button onClick={() => window.location.href = `/recruiter-job-details/${job._id}`}>
                      ⋮
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-box">No jobs posted yet.</div>
              )}
            </div>
          </section>

          <section className="hr-card">
            <div className="hr-section-head">
              <h2>Recent Applications</h2>
              <button onClick={() => (window.location.href = "/recruiter-applications")}>
                View All Applications →
              </button>
            </div>

            {applications.length ? (
              applications.map((candidate) => (
                <div className="hr-application-row" key={candidate._id}>
                  <div className="hr-avatar">
                    {candidate.name?.charAt(0) || "C"}
                  </div>

                  <div>
                    <h4>{candidate.name}</h4>
                    <p>{candidate.currentRole || "Candidate"}</p>
                  </div>

                  <span>{candidate.experienceYears || 0} yrs</span>
                  <span>{candidate.location || "NA"}</span>

                  <span className="hr-tag">
                    {candidate.status || "Applied"}
                  </span>

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
              <div className="empty-box">No applications yet.</div>
            )}
          </section>
        </main>

        <aside className="hr-right">
          <div className="hr-card">
            <h3>Applications Overview</h3>
            <div className="hr-chart">
              <div></div>
            </div>
            <h2>{stats.applications}</h2>
            <p>Total Applications</p>
          </div>

          <div className="hr-card">
            <h3>Shortlisted Candidates</h3>
            <div className="hr-circle">{stats.shortlisted}</div>
            <p>Live shortlisted candidates</p>
          </div>

          <div className="hr-card hr-quick">
            <h3>Quick Actions</h3>
            <button onClick={() => (window.location.href = "/recruiter-post-job")}>
              ➕ Post Job
            </button>
            <button onClick={() => (window.location.href = "/recruiter-search")}>
              🔍 Search Candidates
            </button>
            <button onClick={() => (window.location.href = "/recruiter-applications")}>
              📄 View Applications
            </button>
            <button onClick={() => (window.location.href = "/recruiter-shortlisted")}>
              ⭐ Shortlisted
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
function RecruiterPostJobPage() {
  return (
    <>
      <Navbar />

      <div className="advanced-post-layout">
        <RecruiterAdvancedSidebar />

        <main className="clean-job-main">
          <section className="clean-job-hero">
            <div className="clean-job-icon">💼</div>

            <div>
              <h1>Post a New Job</h1>
              <p>
                Create a professional job opening and reach verified candidates.
              </p>
            </div>
          </section>

          <JobPostForm />
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
function RecruiterReportsPage() {
  const [activeReport, setActiveReport] = useState("Overview");

  return (
    <>
      <Navbar />

      <div className="applications-layout">
        <RecruiterAdvancedSidebar />

        <main className="applications-main">
          <section className="applications-hero">
            <div>
              <h1>📊 Hiring Reports</h1>
              <p>
                Track hiring performance, applications, shortlists and interview progress.
              </p>
            </div>

            <div className="applications-summary">
              <button>
                <span>Total Views</span>
                <h2>4,820</h2>
              </button>

              <button>
                <span>Applications</span>
                <h2>1,248</h2>
              </button>

              <button>
                <span>Shortlisted</span>
                <h2>328</h2>
              </button>

              <button>
                <span>Interviews</span>
                <h2>96</h2>
              </button>
            </div>
          </section>

          <section className="applications-tabs">
            {["Overview", "Jobs", "Candidates", "Interviews"].map((tab) => (
              <button
                key={tab}
                className={activeReport === tab ? "active" : ""}
                onClick={() => setActiveReport(tab)}
              >
                {tab}
              </button>
            ))}
          </section>

          {activeReport === "Overview" && (
            <section className="reports-grid">
              <div className="report-card">
                <h2>Hiring Funnel</h2>
                <p>Applied → Screening → Interview → Offered</p>

                <div className="report-bar"><span style={{ width: "85%" }}></span></div>
                <div className="report-bar"><span style={{ width: "62%" }}></span></div>
                <div className="report-bar"><span style={{ width: "38%" }}></span></div>
                <div className="report-bar"><span style={{ width: "18%" }}></span></div>
              </div>

              <div className="report-card">
                <h2>Top Skills Demand</h2>
                <p>React, Python, SQL, AWS, Node.js</p>

                <div className="application-skills">
                  <span>React</span>
                  <span>Python</span>
                  <span>SQL</span>
                  <span>AWS</span>
                  <span>Node.js</span>
                </div>
              </div>
            </section>
          )}

          {activeReport === "Jobs" && (
            <section className="reports-grid">
              <div className="report-card">
                <h2>Best Performing Jobs</h2>
                <p>Data Engineer - 128 applications</p>
                <p>React Developer - 96 applications</p>
                <p>DevOps Engineer - 64 applications</p>
              </div>

              <div className="report-card">
                <h2>Job Status</h2>
                <p>✅ Active Jobs: 12</p>
                <p>📝 Draft Jobs: 3</p>
                <p>🔒 Closed Jobs: 4</p>
              </div>
            </section>
          )}

          {activeReport === "Candidates" && (
            <section className="reports-grid">
              <div className="report-card">
                <h2>Candidate Quality</h2>
                <p>Verified Candidates: 82%</p>
                <p>Resume Uploaded: 76%</p>
                <p>Video Profile Added: 41%</p>
              </div>

              <div className="report-card">
                <h2>Top Candidate Locations</h2>
                <p>Bangalore - 420</p>
                <p>Hyderabad - 280</p>
                <p>Pune - 190</p>
              </div>
            </section>
          )}

          {activeReport === "Interviews" && (
            <section className="reports-grid">
              <div className="report-card">
                <h2>Interview Pipeline</h2>
                <p>Screening: 64</p>
                <p>Technical Round: 42</p>
                <p>HR Round: 18</p>
                <p>Selected: 9</p>
              </div>

              <div className="report-card">
                <h2>Recruiter Insights</h2>
                <p>✅ Interview conversion is strong</p>
                <p>⚡ Faster response improves selection</p>
                <p>📌 Add interview feedback notes</p>
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}
function RecruiterSettingsPage(){

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
  const savedPlan = localStorage.getItem("recruiterPlan") || "Free";

  const [activePlan, setActivePlan] = useState(savedPlan);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const plans = [
    {
      name: "Free",
      price: "₹0",
      amount: 0,
      period: "/month",
      badge: "Starter",
      desc: "For testing basic hiring tools",
      features: [
        "Post 1 job",
        "Basic candidate search",
        "Limited shortlist access",
        "Basic dashboard",
      ],
    },
    {
      name: "Growth",
      price: "₹4,999",
      amount: 4999,
      period: "/month",
      badge: "Most Popular",
      desc: "For startups hiring regularly",
      features: [
        "Post 10 jobs",
        "Advanced candidate filters",
        "Shortlist pipeline",
        "Applications dashboard",
        "Recruiter notes",
      ],
    },
    {
      name: "Enterprise",
      price: "₹14,999",
      amount: 14999,
      period: "/month",
      badge: "Premium",
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

  

  const startPayment = async (plan) => {
    try {
      if (plan.amount === 0) {
        localStorage.setItem("recruiterPlan", "Free");
        setActivePlan("Free");
        alert("Free plan activated");
        return;
      }

      if (!window.Razorpay) {
        alert("Razorpay not loaded. Please refresh page.");
        return;
      }

      const res = await axios.post(
        `${API_URL}/api/payments/create-order`,
        {
          amount: plan.amount,
          planName: plan.name,
        }
      );

      const options = {
        key: res.data.key,
        amount: res.data.order.amount,
        currency: "INR",
        name: "NoProxy Talent",
        description: `${plan.name} Plan`,
        order_id: res.data.order.id,

        handler: async function (response) {
          try {
            const verifyRes = await axios.post(
              `${API_URL}/api/payments/verify`,
              {
                ...response,
                planName: plan.name,
              }
            );

            if (verifyRes.data.success) {
              localStorage.setItem(
                "recruiterPlan",
                plan.name
              );

              localStorage.setItem(
                "paymentId",
                verifyRes.data.paymentId
              );

              setActivePlan(plan.name);

              alert(
                "Payment successful. Plan activated."
              );
            } else {
              alert("Payment verification failed");
            }
          } catch (err) {
            console.log(
              err.response?.data || err.message
            );
            alert("Verification failed");
          }
        },

        prefill: {
          name: "Recruiter",
          email:
            JSON.parse(
              localStorage.getItem("user")
            )?.email ||
            "recruiter@example.com",
        },

        theme: {
          color: "#6C47FF",
        },
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.open();

    } catch (err) {
      console.log(
        err.response?.data || err.message
      );
      alert("Payment failed");
    }
  };
  const paymentId = localStorage.getItem("paymentId");

  return (
    <>
      <Navbar />

      <div className="applications-layout">
        <RecruiterAdvancedSidebar />

        <main className="applications-main">
          <section className="billing-hero-premium">
            <div>
              <span className="billing-mini-label">
                NoProxy Talent Pro
              </span>

              <h1>💳 Billing & Plans</h1>

              <p>
                Choose the right hiring plan for verified candidates,
                advanced search, interview pipeline and recruiter tools.
              </p>
            </div>

            <div className="billing-current-plan premium">
              <span>Current Plan</span>
              <h2>{activePlan}</h2>
              <p>
                {paymentId
                  ? `Payment ID: ${paymentId.slice(-8)}`
                  : "No payment yet"}
              </p>
            </div>
          </section>

          <section className="billing-plan-grid premium-grid">
            {plans.map((plan) => (
              <div
                className={
                  activePlan === plan.name
                    ? "billing-plan-card premium-card active"
                    : "billing-plan-card premium-card"
                }
                key={plan.name}
              >
                <div className="plan-card-top">
                  <h2>{plan.name}</h2>
                  <span>{plan.badge}</span>
                </div>

                <div className="plan-price-row">
                  <h1>{plan.price}</h1>
                  <small>{plan.period}</small>
                </div>

                <p>{plan.desc}</p>

                <ul>
                  {plan.features.map((feature, i) => (
                    <li key={i}>✅ {feature}</li>
                  ))}
                </ul>

                <button onClick={() => startPayment(plan)}>
                  {activePlan === plan.name
                    ? "Current Plan"
                    : plan.amount === 0
                    ? "Activate Free"
                    : "Pay & Activate"}
                </button>
              </div>
            ))}
          </section>

          <section className="billing-bottom-grid">
            <div className="billing-info-card premium-info">
              <h2>Invoice & Payment</h2>

              <div className="billing-info-row">
                <span>Next billing date</span>
                <b>
                  {activePlan === "Free"
                    ? "Not active"
                    : "Next month"}
                </b>
              </div>

              <div className="billing-info-row">
                <span>Payment method</span>
                <b>
                  {paymentId
                    ? "Razorpay verified"
                    : "Not added"}
                </b>
              </div>

              <div className="billing-info-row">
                <span>Billing status</span>
                <b className="billing-status-active">
                  {activePlan === "Free" ? "Free Plan" : "Active"}
                </b>
              </div>
            </div>

            <div className="billing-info-card premium-info">
              <h2>Usage Summary</h2>

              <div className="billing-usage">
                <p>Jobs Posted</p>
                <div>
                  <span style={{ width: "45%" }}></span>
                </div>
                <b>7 used</b>
              </div>

              <div className="billing-usage">
                <p>Candidate Searches</p>
                <div>
                  <span style={{ width: "70%" }}></span>
                </div>
                <b>142 searches</b>
              </div>

              <div className="billing-usage">
                <p>Shortlists</p>
                <div>
                  <span style={{ width: "30%" }}></span>
                </div>
                <b>18 candidates</b>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
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