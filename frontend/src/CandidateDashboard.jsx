import { useNavigate } from "react-router-dom";

function CandidateDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Candidate Dashboard</h1>

      <h3>Welcome, {user?.name}</h3>
      <p>Email: {user?.email}</p>

      <button onClick={handleLogout}>Logout</button>

      <hr />

      <h2>Your Profile</h2>
      <p>Here candidate profile details will come.</p>
    </div>
  );
}

export default CandidateDashboard;