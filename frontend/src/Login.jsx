import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);

      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);

      if (res.data.user.role === "recruiter") {
        navigate("/recruiter");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      alert("Invalid email or password");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);

      const firebaseToken = await result.user.getIdToken();

      const response = await fetch(
        "http://localhost:5000/api/candidates/firebase-login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: firebaseToken,
            provider: "google",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Google login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.candidate));

      alert("Google login successful");
      navigate("/dashboard");
    } catch (error) {
      console.log("GOOGLE LOGIN ERROR:", error);
      alert(error.message);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "auto" }}>
      <h2>Login</h2>

      <button
        type="button"
        onClick={handleGoogleLogin}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "20px",
          cursor: "pointer",
        }}
      >
        Continue with Google
      </button>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <br />
        <br />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <br />
        <br />

        <button type="submit">Login</button>
      </form>

      <p>
        New candidate? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default Login;