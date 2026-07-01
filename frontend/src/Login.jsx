import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { signInWithPopup } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { FaLinkedinIn, FaFacebookF, FaMicrosoft } from "react-icons/fa";
import { auth, googleProvider } from "../firebase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setErrorMsg("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.email.trim()) return setErrorMsg("Email is required");
    if (!form.password.trim()) return setErrorMsg("Password is required");

    try {
      setLoading(true);

      const res = await axios.post(`${API_URL}/api/candidates/login`, {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      const candidate = res.data.candidate || res.data.user;
      const candidateId = candidate?._id || candidate?.id || candidate?.candidateId;

      localStorage.setItem("user", JSON.stringify(candidate));
      localStorage.setItem("token", res.data.token);

      navigate(candidateId ? `/dashboard/${candidateId}` : "/dashboard");
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");

    try {
      setLoading(true);

      const result = await signInWithPopup(auth, googleProvider);
      const firebaseToken = await result.user.getIdToken();

      const res = await axios.post(`${API_URL}/api/candidates/firebase-login`, {
        token: firebaseToken,
        provider: "google",
      });

      const candidate = res.data.candidate;
      const candidateId = candidate?._id || candidate?.id;

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(candidate));

      if (res.data?.isNewCandidate || !res.data?.hasPassword) {
        localStorage.setItem("candidateSetPasswordId", candidateId);
        localStorage.setItem("candidateSetPasswordEmail", candidate.email);
        navigate("/candidate-set-password?mode=google");
      } else {
        navigate(candidateId ? `/dashboard/${candidateId}` : "/dashboard");
      }
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message ||
          error.message ||
          "Google login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="candidate-login-elite">
      <section className="elite-left">
        <div className="elite-brand">
          <img src="/logo.png" alt="NoPrompt Jobs" />
        </div>

        <div className="elite-copy">
          <span className="elite-trust-badge">
            🛡 Trusted by verified professionals
          </span>

          <h1>
            Your Dream Job is <b>Closer</b> Than You Think
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

        <img
          className="login-woman-fixed"
          src="/images/login-woman.png"
          alt="Candidate working"
        />

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

          <form onSubmit={handleLogin}>
            <label>Email Address</label>
            <div className="elite-input">
              <span>✉</span>
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <label>Password</label>
            <div className="elite-input">
              <span>🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>

            <div className="elite-options">
              <label>
                <input type="checkbox" /> Remember me
              </label>

              <Link to="/candidate-forgot-password">Forgot password?</Link>
            </div>

            <button className="elite-main-btn" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "↪ Access Dashboard"}
            </button>
          </form>

          <div className="elite-divider">
            <span></span>
            <p>or continue with</p>
            <span></span>
          </div>

          <div className="elite-socials">
            <button type="button" onClick={handleGoogleLogin} disabled={loading}>
              <FcGoogle /> Google
            </button>

            <button type="button" disabled>
              <FaLinkedinIn /> LinkedIn
            </button>

            <button type="button" disabled>
              <FaMicrosoft /> Microsoft
            </button>

            <button type="button" disabled>
              <FaFacebookF /> Facebook
            </button>
          </div>

          <div className="elite-new-box">
            <h3>New to NoPrompt Jobs?</h3>
            <p>Create your verified account and start your journey</p>

            <Link to="/candidate-email-verify">👥 Create New Account</Link>
          </div>
        </div>

        <div className="elite-bottom-trust">
          <div>🔒 Secure & Private</div>
          <div>🛡 Trusted Platform</div>
          <div>✅ 100% Verified</div>
        </div>
      </section>
    </main>
  );
}

export default Login;