import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>Authen Talent</h1>
      <p>Hire genuine and verified candidates</p>

      <div style={{ marginTop: "20px" }}>
        <Link to="/login">
          <button>Login</button>
        </Link>

        <Link to="/register">
          <button style={{ marginLeft: "10px" }}>Candidate Register</button>
        </Link>
      </div>
    </div>
  );
}

export default LandingPage;