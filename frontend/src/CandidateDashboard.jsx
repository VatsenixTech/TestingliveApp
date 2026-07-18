import { useEffect, useState } from "react";
import axios from "axios";
import { calculateProfileStrength } from "./utils/profileStrength";


function CandidateDashboard() {
  const [candidate, setCandidate] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [activity, setActivity] = useState([]);
  const [interviewAlerts, setInterviewAlerts] = useState([]);

  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

  const candidateId = window.location.pathname.split("/").pop();

  const goTo = (path) => {
    window.location.href = path;
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const candidateRes = await axios.get(
          `${API_URL}/api/candidates/${candidateId}`
        );

        const candidateData =
          candidateRes.data.candidate ||
          candidateRes.data.data ||
          candidateRes.data;

        setCandidate(candidateData);

        const realActivity = [];

        if (candidateData?.profileViews > 0) {
          realActivity.push({
            title: "Recruiter viewed your profile",
            time: `${candidateData.profileViews} views`,
          });
        }

        if (candidateData?.shortlisted) {
          realActivity.push({
            title: "You were shortlisted",
            time: "Recently",
          });
        }

        if (candidateData?.resumeUrl) {
          realActivity.push({
            title: "Resume available to recruiters",
            time: "Active",
          });
        }

        setActivity(realActivity);

        const realInterviews = [];

        if (candidateData?.status === "Interview") {
          realInterviews.push({
            round: "Interview Round",
            status: "Scheduled",
          });
        }

        if (
          Array.isArray(candidateData?.interviews) &&
          candidateData.interviews.length > 0
        ) {
          candidateData.interviews.forEach((item) => {
            realInterviews.push({
              round: item.round || item.title || "Interview",
              status: item.status || item.date || "Pending",
            });
          });
        }

        setInterviewAlerts(realInterviews);

        const jobsRes = await axios.get(`${API_URL}/api/jobs`);

        const allJobs =
          jobsRes.data.jobs ||
          jobsRes.data.data ||
          jobsRes.data ||
          [];

        setJobs(Array.isArray(allJobs) ? allJobs : []);
      } catch (err) {
        console.log(
          "DASHBOARD LOAD ERROR:",
          err.response?.data || err.message
        );
      }
    };

    if (candidateId) {
      loadDashboard();
    }
  }, [API_URL, candidateId]);

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
      if (!window.confirm("Auto apply matching jobs?")) {
        return;
      }

      const res = await axios.post(
        `${API_URL}/api/jobs/auto-apply/${candidateId}`
      );

      alert(`Applied ${res.data.appliedCount || 0} jobs`);
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Auto apply failed");
    }
  };

  const handleSearch = () => {
    document
      .getElementById("jobs")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  if (!candidate) {
    return (
      <div className="loading">
        Loading Dashboard...
      </div>
    );
  }

  /*
   * REAL SHARED PROFILE STRENGTH
   *
   * This uses the same utility as CandidateProfilePage.
   */
  const profileStrength =
    calculateProfileStrength(candidate || {});

  const filteredJobs = jobs.filter((job) => {
    if (!searchText.trim()) {
      return true;
    }

    const search = searchText.toLowerCase();

    const skillsText = Array.isArray(job.skills)
      ? job.skills
          .map((skill) =>
            typeof skill === "string"
              ? skill
              : skill?.name || ""
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

  return (
    <main className="candidate-dashboard-page">

      {/* ================= TOP BAR ================= */}

      <header className="candidate-topbar">
        <img
          src="/logo.png"
          alt="NoPromptJobs"
          className="candidate-top-logo"
        />

        <div className="candidate-search">
          <span>🔍</span>

          <input
            value={searchText}
            placeholder="Search jobs, companies..."
            onChange={(e) =>
              setSearchText(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
        </div>

        <nav className="candidate-nav">
          <button
            type="button"
            className="active"
            onClick={() =>
              goTo(`/dashboard/${candidateId}`)
            }
          >
            Dashboard
          </button>

          <button
            type="button"
            onClick={() => goTo("/jobs")}
          >
            Jobs
          </button>

          <button
            type="button"
            onClick={() => goTo("/companies")}
          >
            Companies
          </button>

          <button
            type="button"
            onClick={() => goTo("/services")}
          >
            Services
          </button>

          <button
            type="button"
            onClick={() => goTo("/notifications")}
          >
            Notifications
          </button>
        </nav>

        <button
          type="button"
          className="candidate-user-pill"
          onClick={() =>
            goTo(`/profile/${candidateId}`)
          }
        >
          <span>
            {candidate.name?.charAt(0) || "N"}
          </span>

          {candidate.name || "Candidate"}
        </button>
      </header>


      {/* ================= DASHBOARD ================= */}

      <section className="candidate-dashboard-shell">

        {/* ================= LEFT PANEL ================= */}

        <aside className="candidate-left-panel">

          <div className="candidate-profile-card">

            <div className="candidate-avatar">
              {candidate.profileImageUrl ? (
                <img
                  src={candidate.profileImageUrl}
                  alt="profile"
                />
              ) : (
                <span>
                  {candidate.name?.charAt(0) || "N"}
                </span>
              )}
            </div>

            <h2>{candidate.name}</h2>

            <div className="verified-pill">
              Verified Candidate ✓
            </div>

            <p>
              {candidate.currentRole || "Candidate"}
            </p>

            <p>
              @{" "}
              {candidate.currentCompany ||
                "Company not added"}
            </p>

            <p>
              📍{" "}
              {candidate.location ||
                "Location not added"}
            </p>


            {/* FIXED: OPENS SERVICES */}

            <button
              type="button"
              className="improve-btn"
              onClick={() => goTo("/services")}
            >
              Improve Profile
            </button>

          </div>


          {/* ================= PREMIUM TOOLS ================= */}

          <div className="candidate-premium-box">

            <h3>👑 Premium Career Tools</h3>

            <p>Powered career growth panel</p>

            <button
              type="button"
              onClick={() => goTo("/services")}
            >
              📝 Resume Builder
            </button>

            <button
              type="button"
              onClick={autoApply}
            >
              Auto Apply Tracker
            </button>

          </div>

        </aside>


        {/* ================= MAIN PANEL ================= */}

        <section className="candidate-main-panel">

          <div className="candidate-hero-card">

            <div>

              <h1>
                Good Evening, {candidate.name} 👋
              </h1>

              <p>
                Your profile is {profileStrength}%
                complete. Complete your profile to
                improve job recommendations.
              </p>


              <div className="hero-actions">

                <button
                  type="button"
                  onClick={() => goTo("/services")}
                >
                  Career Assistant
                </button>

                <button
                  type="button"
                  onClick={() =>
                    goTo(`/profile/${candidateId}`)
                  }
                >
                  View My Profile
                </button>

              </div>

            </div>


            {/* ================= REAL PROFILE STRENGTH ================= */}

            <div className="trust-circle">

              <h2>{profileStrength}%</h2>

              <b>Profile Strength</b>

              <small>
                {profileStrength >= 90
                  ? "Excellent"
                  : profileStrength >= 75
                  ? "Strong"
                  : profileStrength >= 50
                  ? "Good"
                  : "Improve"}
              </small>

            </div>

          </div>


          {/* ================= METRICS ================= */}

          <div className="metric-grid">

            <div className="metric-card">
              <p>Job Matches</p>

              <h2>{filteredJobs.length}</h2>

              <span>
                {searchText
                  ? `Results for "${searchText}"`
                  : "Live  jobs"}
              </span>
            </div>


            <div className="metric-card">
              <p>Auto Applied</p>

              <h2>
                {candidate.autoAppliedCount || 0}
              </h2>

              <span>Active</span>
            </div>


            <div className="metric-card">
              <p>Shortlisted</p>

              <h2>
                {candidate.shortlisted ? 1 : 0}
              </h2>

              <span>Recruiter interest</span>
            </div>


            <div className="metric-card">
              <p>Interviews</p>

              <h2>
                {candidate.interviews?.length || 0}
              </h2>

              <span>Upcoming</span>
            </div>


            <div className="metric-card">
              <p>Salary Predictor</p>

              <h2>
                {candidate.expectedSalary ||
                  "Not calculated"}
              </h2>

              <span>Based on profile</span>
            </div>

          </div>


          {/* ================= JOBS ================= */}

          <section
            className="jobs-section"
            id="jobs"
          >

            <div className="premium-section-head">

              <h2>Recommended Jobs for You</h2>

              <span>
                {filteredJobs.length} matches
              </span>

            </div>


            {filteredJobs.length > 0 ? (

              <div className="premium-job-grid">

                {filteredJobs.map((job) => {

                  const jobId =
                    job._id || job.id;

                  return (

                    <div
                      className="premium-job-card"
                      key={jobId}
                    >

                      <h3>
                        {job.title ||
                          job.jobTitle ||
                          job.role ||
                          "Untitled Job"}
                      </h3>


                      <p>
                        {job.company ||
                          job.companyName ||
                          "Company not added"}
                      </p>


                      <p>
                        {job.location ||
                          job.city ||
                          "Location not added"}

                        {" • "}

                        {job.workMode ||
                          job.jobType ||
                          job.employmentType ||
                          "Not specified"}
                      </p>


                      <h4>
                        {job.salary ||
                          job.package ||
                          "Salary not disclosed"}
                      </h4>


                      <button
                        type="button"
                        onClick={() =>
                          applyJob(jobId)
                        }
                      >
                        Apply Now
                      </button>

                    </div>

                  );
                })}

              </div>

            ) : (

              <div className="empty-premium-box">

                {searchText
                  ? `No jobs found for "${searchText}"`
                  : "No backend jobs found."}

              </div>

            )}

          </section>


          {/* ================= FOOTER ================= */}

          <footer className="candidate-dashboard-footer">

            <div className="footer-left">
              © 2026 NoPromptJobs by Vatsenix
              Software Pvt Ltd.
            </div>


            <div className="footer-right">

              <button
                type="button"
                onClick={() =>
                  goTo("/privacy-policy")
                }
              >
                Privacy Policy
              </button>

              <button
                type="button"
                onClick={() => goTo("/terms")}
              >
                Terms
              </button>

              <button
                type="button"
                onClick={() => goTo("/contact")}
              >
                Support
              </button>

              <button
                type="button"
                onClick={() => goTo("/contact")}
              >
                Contact
              </button>

            </div>

          </footer>

        </section>


        {/* ================= RIGHT PANEL ================= */}

        <aside className="candidate-right-panel">

          <div className="side-info-card">

            <div className="side-info-head">

              <h2>Recruiter Activity</h2>

              <button
                type="button"
                onClick={() =>
                  goTo("/notifications")
                }
              >
                View All →
              </button>

            </div>


            {activity.length > 0 ? (

              activity
                .slice(0, 3)
                .map((item, index) => (

                  <div
                    className="side-row"
                    key={index}
                  >

                    <span>{item.title}</span>

                    <b>{item.time}</b>

                  </div>

                ))

            ) : (

              <p>No recruiter activity yet</p>

            )}

          </div>


          <div className="side-info-card">

            <div className="side-info-head">

              <h2>Interview Alerts</h2>

              <button
                type="button"
                onClick={() =>
                  goTo("/services")
                }
              >
                View All →
              </button>

            </div>


            {interviewAlerts.length > 0 ? (

              interviewAlerts
                .slice(0, 3)
                .map((item, index) => (

                  <div
                    className="side-row"
                    key={index}
                  >

                    <span>{item.round}</span>

                    <b>{item.status}</b>

                  </div>

                ))

            ) : (

              <p>No interview schedule yet</p>

            )}

          </div>

        </aside>

      </section>

    </main>
  );
}

export default CandidateDashboard;