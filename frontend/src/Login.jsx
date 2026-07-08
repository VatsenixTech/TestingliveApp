import { useEffect, useState } from "react";
import {
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";

import axios from "axios";

import { FcGoogle } from "react-icons/fc";

import {
  FaLinkedinIn,
  FaFacebookF,
  FaMicrosoft,
} from "react-icons/fa";


/* =========================================================
   API URL
========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


/* =========================================================
   LOGIN COMPONENT
========================================================= */

function Login() {
  const navigate = useNavigate();

  const location = useLocation();


  /* =======================================================
     FORM STATE
  ======================================================= */

  const [form, setForm] = useState({
    email: "",
    password: "",
  });


  /* =======================================================
     PAGE STATE
  ======================================================= */

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [googleLoading, setGoogleLoading] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState("");


  /* =======================================================
     READ GOOGLE OAUTH ERRORS FROM URL
  ======================================================= */

  useEffect(() => {
    const params =
      new URLSearchParams(location.search);

    const error =
      params.get("error");


    if (!error) {
      return;
    }


    if (error === "google_login_failed") {
      setErrorMsg(
        "Google login failed. Please try again."
      );
    }

    else if (error === "candidate_not_found") {
      setErrorMsg(
        "Google login completed, but candidate account could not be created."
      );
    }

    else if (error === "google_account_error") {
      setErrorMsg(
        "Unable to process your Google account."
      );
    }

    else {
      setErrorMsg(
        "Authentication failed. Please try again."
      );
    }

  }, [location.search]);


  /* =======================================================
     INPUT CHANGE
  ======================================================= */

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;


    setErrorMsg("");


    setForm((previousForm) => ({
      ...previousForm,

      [name]: value,
    }));
  };


  /* =======================================================
     EMAIL PASSWORD LOGIN
  ======================================================= */

  const handleLogin = async (e) => {
    e.preventDefault();


    setErrorMsg("");


    const cleanEmail =
      form.email
        .trim()
        .toLowerCase();


    if (!cleanEmail) {
      setErrorMsg(
        "Email is required"
      );

      return;
    }


    if (!form.password.trim()) {
      setErrorMsg(
        "Password is required"
      );

      return;
    }


    try {
      setLoading(true);


      /* ---------------------------------------------------
         CALL CANDIDATE LOGIN API
      --------------------------------------------------- */

      const response =
        await axios.post(
          `${API_URL}/api/candidates/login`,

          {
            email: cleanEmail,

            password:
              form.password,
          }
        );


      console.log(
        "Candidate login response:",
        response.data
      );


      /* ---------------------------------------------------
         GET REAL CANDIDATE
      --------------------------------------------------- */

      const candidate =
        response.data?.candidate ||
        response.data?.user;


      if (!candidate) {
        throw new Error(
          "Candidate data was not returned by backend"
        );
      }


      /* ---------------------------------------------------
         GET REAL CANDIDATE ID
      --------------------------------------------------- */

      const candidateId =
        candidate?._id ||
        candidate?.id ||
        candidate?.candidateId;


      if (!candidateId) {
        throw new Error(
          "Candidate ID was not returned by backend"
        );
      }


      /* ---------------------------------------------------
         GET JWT TOKEN
      --------------------------------------------------- */

      const token =
        response.data?.token;


      if (!token) {
        throw new Error(
          "Authentication token was not returned by backend"
        );
      }


      /* ---------------------------------------------------
         REMOVE OLD AUTHENTICATION DATA
      --------------------------------------------------- */

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );


      /* ---------------------------------------------------
         SAVE REAL AUTHENTICATION DATA
      --------------------------------------------------- */

      localStorage.setItem(
        "token",
        token
      );


      localStorage.setItem(
        "user",
        JSON.stringify(candidate)
      );


      /* ---------------------------------------------------
         OPEN CANDIDATE DASHBOARD
      --------------------------------------------------- */

      navigate(
        `/dashboard/${candidateId}`,

        {
          replace: true,
        }
      );

    }

    catch (error) {

      console.error(
        "Candidate login error:",
        error
      );


      setErrorMsg(

        error.response?.data?.message ||

        error.message ||

        "Invalid email or password. Please try again."

      );

    }

    finally {

      setLoading(false);

    }
  };


  /* =======================================================
     GOOGLE LOGIN

     IMPORTANT:

     NO FIREBASE HERE.

     Browser opens:

     backend
         ↓
     Google OAuth
         ↓
     Google Callback
         ↓
     GoogleAuthSuccess.jsx
         ↓
     Candidate Dashboard
  ======================================================= */

  const handleGoogleLogin = () => {
    try {

      setErrorMsg("");

      setGoogleLoading(true);


      /* ---------------------------------------------------
         REMOVE PREVIOUS LOGIN SESSION DATA

         This prevents previous candidate data from
         incorrectly opening another dashboard.
      --------------------------------------------------- */

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );


      /* ---------------------------------------------------
         START GOOGLE OAUTH
      --------------------------------------------------- */

      window.location.assign(
        `${API_URL}/api/auth/google`
      );

    }

    catch (error) {

      console.error(
        "Unable to start Google login:",
        error
      );


      setGoogleLoading(false);


      setErrorMsg(
        "Unable to start Google login. Please try again."
      );

    }
  };


  /* =======================================================
     PAGE UI
  ======================================================= */

  return (

    <main className="candidate-login-elite">


      {/* ===================================================
          LEFT SECTION
      =================================================== */}

      <section className="elite-left">


        {/* BRAND */}

        <div className="elite-brand">

          <img
            src="/logo.png"
            alt="NoPrompt Jobs"
          />

        </div>


        {/* CONTENT */}

        <div className="elite-copy">


          <span className="elite-trust-badge">

            🛡 Trusted by verified professionals

          </span>


          <h1>

            Your Dream Job is{" "}

            <b>
              Closer
            </b>{" "}

            Than You Think

          </h1>


          <p>

            Join verified professionals finding the
            right opportunities and building successful
            careers every day.

          </p>


          {/* FEATURE 1 */}

          <div className="elite-feature">

            <span>
              ✓
            </span>


            <div>

              <h4>
                Verified Opportunities
              </h4>


              <p>

                All jobs are verified for your safety
                and career growth.

              </p>

            </div>

          </div>


          {/* FEATURE 2 */}

          <div className="elite-feature">

            <span>
              ⌕
            </span>


            <div>

              <h4>
                Smart Job Matching
              </h4>


              <p>

                AI-powered matching connects you with
                the right opportunities.

              </p>

            </div>

          </div>


          {/* FEATURE 3 */}

          <div className="elite-feature">

            <span>
              ↗
            </span>


            <div>

              <h4>
                Career Growth
              </h4>


              <p>

                Tools, resources and guidance to help
                you grow in your career.

              </p>

            </div>

          </div>


        </div>


        {/* HERO IMAGE */}

        <img

          className="login-woman-fixed"

          src="/images/login-woman.png"

          alt="Candidate working"

        />


        {/* SECURE CARD */}

        <div className="elite-secure-card">

          <span>
            🔒
          </span>


          <div>

            <h4>
              Secure & Private
            </h4>


            <p>

              Your data is always safe and protected
              with us.

            </p>

          </div>

        </div>


      </section>


      {/* ===================================================
          RIGHT SECTION
      =================================================== */}

      <section className="elite-right">


        <div className="elite-login-card">


          <span className="elite-pill">

            👋 Welcome Back!

          </span>


          <h1>
            Candidate Login
          </h1>


          <p>

            Sign in to continue your career journey

          </p>


          {/* ERROR MESSAGE */}

          {errorMsg && (

            <div className="login-error-box">

              {errorMsg}

            </div>

          )}


          {/* =================================================
              EMAIL PASSWORD FORM
          ================================================= */}

          <form onSubmit={handleLogin}>


            {/* EMAIL */}

            <label>

              Email Address

            </label>


            <div className="elite-input">

              <span>
                ✉
              </span>


              <input

                type="email"

                name="email"

                placeholder="Enter your email address"

                value={form.email}

                onChange={handleChange}

                disabled={
                  loading ||
                  googleLoading
                }

                autoComplete="email"

              />

            </div>


            {/* PASSWORD */}

            <label>

              Password

            </label>


            <div className="elite-input">

              <span>
                🔒
              </span>


              <input

                type={
                  showPassword
                    ? "text"
                    : "password"
                }

                name="password"

                placeholder="Enter your password"

                value={form.password}

                onChange={handleChange}

                disabled={
                  loading ||
                  googleLoading
                }

                autoComplete="current-password"

              />


              <button

                type="button"

                onClick={() =>
                  setShowPassword(
                    (currentValue) =>
                      !currentValue
                  )
                }

                disabled={
                  loading ||
                  googleLoading
                }

              >

                {
                  showPassword
                    ? "🙈"
                    : "👁"
                }

              </button>


            </div>


            {/* OPTIONS */}

            <div className="elite-options">


              <label>

                <input

                  type="checkbox"

                  disabled={
                    loading ||
                    googleLoading
                  }

                />

                Remember me

              </label>


              <Link to="/candidate-forgot-password">

                Forgot password?

              </Link>


            </div>


            {/* LOGIN BUTTON */}

            <button

              className="elite-main-btn"

              type="submit"

              disabled={
                loading ||
                googleLoading
              }

            >

              {
                loading

                  ? "Signing in..."

                  : "↪ Access Dashboard"
              }

            </button>


          </form>


          {/* =================================================
              DIVIDER
          ================================================= */}

          <div className="elite-divider">

            <span></span>

            <p>
              or continue with
            </p>

            <span></span>

          </div>


          {/* =================================================
              SOCIAL LOGIN
          ================================================= */}

          <div className="elite-socials">


            {/* GOOGLE */}

            <button

              type="button"

              onClick={handleGoogleLogin}

              disabled={
                loading ||
                googleLoading
              }

            >

              <FcGoogle />

              {
                googleLoading
                  ? "Connecting..."
                  : "Google"
              }

            </button>


            {/* LINKEDIN */}

            <button
              type="button"
              disabled
            >

              <FaLinkedinIn />

              LinkedIn

            </button>


            {/* MICROSOFT */}

            <button
              type="button"
              disabled
            >

              <FaMicrosoft />

              Microsoft

            </button>


            {/* FACEBOOK */}

            <button
              type="button"
              disabled
            >

              <FaFacebookF />

              Facebook

            </button>


          </div>


          {/* =================================================
              NEW CANDIDATE
          ================================================= */}

          <div className="elite-new-box">


            <h3>

              New to NoPrompt Jobs?

            </h3>


            <p>

              Create your verified account and start
              your journey

            </p>


            <Link to="/candidate-email-verify">

              👥 Create New Account

            </Link>


          </div>


        </div>


        {/* ===================================================
            BOTTOM TRUST SECTION
        =================================================== */}

        <div className="elite-bottom-trust">

          <div>
            🔒 Secure & Private
          </div>

          <div>
            🛡 Trusted Platform
          </div>

          <div>
            ✅ 100% Verified
          </div>

        </div>


      </section>


    </main>

  );
}


export default Login;