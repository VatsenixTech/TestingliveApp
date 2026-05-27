import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import AuthHeader from "../components/AuthHeader";

function Register() {
  const navigate = useNavigate();

  const [step, setStep] = useState("details");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    otp: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const sendOtp = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter your name");
      return;
    }

    if (!form.email.trim() && !form.phone.trim()) {
      alert("Please enter email or mobile number");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/candidate-send-otp",
        {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
        }
      );

      alert(`OTP sent successfully. Dev OTP: ${res.data.devOtp}`);

      setStep("otp");
    } catch (err) {
      alert(err.response?.data?.message || "OTP send failed");
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();

    if (!form.otp.trim()) {
      alert("Please enter OTP");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/candidate-verify-otp",
        {
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          otp: form.otp.trim(),
        }
      );

      localStorage.setItem(
        "user",
        JSON.stringify({
          email: res.data.candidate.email || "",
          phone: res.data.candidate.phone || "",
          name: res.data.candidate.name || "",
          role: "candidate",
          candidateId: res.data.candidate._id,
        })
      );

      alert("Candidate account created successfully");

      navigate(`/profile/${res.data.candidate._id}`);
    } catch (err) {
      alert(err.response?.data?.message || "OTP verification failed");
    }
  };

  return (
    <>
      <AuthHeader />

      <div className="otp-register-page">
        <div className="otp-card">
          <img src="/logo.png" alt="NoProxiesJobs" />

          <h1>Create Candidate Account</h1>

          <p>
            Verify your email or mobile number first. You can complete your full
            profile after registration.
          </p>

          {step === "details" && (
            <form onSubmit={sendOtp}>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
              />

              <div className="otp-divider">OR</div>

              <input
                type="tel"
                name="phone"
                placeholder="Mobile Number"
                value={form.phone}
                onChange={handleChange}
              />

              <button type="submit">Send OTP</button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={verifyOtp}>
              <input
                type="text"
                name="otp"
                placeholder="Enter 6 digit OTP"
                value={form.otp}
                onChange={handleChange}
              />

              <button type="submit">Verify & Create Account</button>

              <button
                type="button"
                className="secondary-otp-btn"
                onClick={sendOtp}
              >
                Resend OTP
              </button>
            </form>
          )}

          <p className="auth-bottom-link">
            Already registered?{" "}
            <Link to="/candidate-login">Login here</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Register;