import { useNavigate } from "react-router-dom";
import "./AuthHeader.css";

export default function AuthHeader() {
  const navigate = useNavigate();

  return (
    <header className="auth-header">

      <div className="auth-logo">
        <img src="/logo.png" alt="" />

        <div>
          <h2>NOPROXIESJOBS.COM</h2>
          <p>Smart Solutions. Real Results.</p>
        </div>
      </div>

      <div className="auth-nav">

        <button onClick={()=>navigate("/")}>
          Home
        </button>

        <button
        onClick={()=>navigate("/candidate-login")}
        >
          Candidate Login
        </button>

        <button
          className="recruiter-btn"
          onClick={()=>navigate("/recruiter-login")}
        >
          Recruiter Login
        </button>

      </div>

    </header>
  );
}