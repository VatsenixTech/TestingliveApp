import React, { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CandidateForgotPassword() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    try {
      setLoading(true);

      await axios.post(`${API_URL}/api/candidates/forgot-password/send-otp`, {
        email,
      });

      alert("OTP sent to your email");
      setOtpSent(true);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    try {
      setLoading(true);

      await axios.post(`${API_URL}/api/candidates/forgot-password/reset-password`, {
        email,
        otp,
        newPassword,
      });

      alert("Password reset successfully");
      window.location.href = "/candidate-login";
    } catch (error) {
      alert(error.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Forgot Password</h1>
        <p>Reset your password using email OTP.</p>

        <input
          type="email"
          placeholder="Enter registered email"
          value={email}
          disabled={otpSent}
          onChange={(e) => setEmail(e.target.value)}
        />

        {!otpSent ? (
          <button onClick={sendOtp} disabled={loading}>
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        ) : (
          <>
            <input
              placeholder="Enter 6 digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <button onClick={resetPassword} disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}

        <a href="/candidate-login">Back to Login</a>
      </div>
    </main>
  );
}