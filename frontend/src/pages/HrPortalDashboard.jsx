import { useEffect, useState } from "react";
import axios from "axios";
import "./HrPortalDashboard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function HrPortalDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const goTo = (path) => {
    window.location.href = path;
  };

  const loadHrDashboard = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API_URL}/api/hr/dashboard`);
      setDashboard(res.data);
    } catch (error) {
      console.log("HR DASHBOARD ERROR:", error.response?.data || error.message);
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHrDashboard();
  }, []);

  const stats = [
    ["👥", dashboard?.totalEmployees || 0, "Total Employees", "Live employee database"],
    ["✅", dashboard?.presentToday || 0, "Present Today", `${dashboard?.attendanceRate || 0}% attendance`],
    ["🌴", dashboard?.onLeave || 0, "On Leave", "Today"],
    ["💼", dashboard?.openPositions || 0, "Open Positions", "Hiring active"],
    ["📄", dashboard?.offersInProgress || 0, "Offers in Progress", "Pending approvals"],
  ];

  const menu = [
    ["🏠", "Dashboard", "/hr-portal"],
    ["👤", "Me", "/hr-me"],
    ["👥", "My Team", "/hr-team"],
    ["🕒", "Attendance", "/hr-attendance"],
    ["🌴", "Leave", "/hr-leave"],
    ["💰", "Payroll", "/hr-payroll"],
    ["🎯", "Recruitment", "/recruiter-dashboard"],
    ["🚀", "Onboarding", "/hr-onboarding"],
    ["📄", "Offer Letters", "/hr-offer-letter"],
    ["📁", "Documents", "/hr-documents"],
    ["📊", "Reports", "/hr-reports"],
    ["⚙️", "Settings", "/hr-settings"],
  ];

  const actions = [
  ["👤➕", "Add Employee", "/hr-add-employee"],
  ["🌴", "Request Leave", "/hr-leave"],
  ["💰", "Run Payroll", "/hr-payroll"],
  ["💼", "Post Job", "/recruiter-post-job"],
  ["📄", "Create Offer", "/hr-offer-letter"], // <-- Add this line
  ["☁️", "Upload Document", "/hr-documents"],
];

  const departments = dashboard?.departments?.length
    ? dashboard.departments
    : [
        { name: "Engineering", count: 0 },
        { name: "Sales", count: 0 },
        { name: "HR", count: 0 },
        { name: "Marketing", count: 0 },
      ];

  const activities = dashboard?.activities?.length
    ? dashboard.activities
    : ["No recent HR activities found."];

  const notifications = dashboard?.notifications?.length
    ? dashboard.notifications
    : ["No notifications available."];

  return (
    <main className="hr-page">
      <aside className="hr-sidebar">
        <div className="hr-brand">
          <img src="/vatsenix-logo.png" alt="Vatsenix" />
          <div>
            <h2>VATSENIX</h2>
            <p>HR Suite</p>
          </div>
        </div>

        <nav>
          {menu.map((item) => (
            <button
              key={item[1]}
              className={window.location.pathname === item[2] ? "active" : ""}
              onClick={() => goTo(item[2])}
            >
              <span>{item[0]}</span>
              {item[1]}
            </button>
          ))}
        </nav>

        <div className="hr-org-card">
          <span>🏢</span>
          <h4>ORG STRUCTURE</h4>
          <p>Explore company hierarchy</p>
        </div>
      </aside>

      <section className="hr-main">
        <header className="hr-header">
          <div className="hr-search">
            🔍
            <input placeholder="Search employees, features, documents..." />
          </div>

          <div className="hr-header-actions">
            <button>🔔<b>12</b></button>
            <button>❔</button>
            <button>⚙️</button>

            <div className="hr-user">
              <img src="/profile.png" alt="User" />
              <div>
                <strong>Venkatesh A</strong>
                <span>HR Manager</span>
              </div>
            </div>
          </div>
        </header>

        <section className="hr-welcome">
          <div>
            <h1>Hello, Venkatesh 👋</h1>
            <p>Here’s what is happening in your organization today.</p>
          </div>

          <button onClick={loadHrDashboard}>
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>
        </section>

        <section className="hr-stats">
          {stats.map((s) => (
            <div className="hr-stat-card" key={s[2]}>
              <span>{s[0]}</span>
              <div>
                <p>{s[2]}</p>
                <h2>{loading ? "..." : s[1]}</h2>
                <small>{s[3]}</small>
              </div>
            </div>
          ))}
        </section>

        <section className="hr-grid">
          <div className="hr-card attendance-card">
            <div className="hr-card-head">
              <h3>Attendance Overview</h3>
              <button>This Month ▾</button>
            </div>

            <div className="attendance-body">
              <div className="circle-progress">
                <h2>{dashboard?.attendanceRate || 0}%</h2>
                <p>Attendance Rate</p>
              </div>

              <div className="legend">
                <p><span className="green"></span> Present <b>{dashboard?.presentToday || 0}</b></p>
                <p><span className="red"></span> Absent <b>{dashboard?.absentToday || 0}</b></p>
                <p><span className="yellow"></span> Leave <b>{dashboard?.onLeave || 0}</b></p>
              </div>
            </div>
          </div>

          <div className="hr-card">
            <div className="hr-card-head">
              <h3>Employee Distribution</h3>
              <button>Department ▾</button>
            </div>

            {departments.map((d) => (
              <div className="dept-row" key={d.name}>
                <span>{d.name}</span>
                <div>
                  <b style={{ width: `${Math.min(d.count, 100)}%` }}></b>
                </div>
                <strong>{d.count}</strong>
              </div>
            ))}
          </div>

          <div className="hr-card quick-card">
            <h3>Quick Actions</h3>

<div className="quick-grid">
  {actions.map((a) => (
    <button key={a[1]} onClick={() => window.location.href = a[2]}>
      <span>{a[0]}</span>
      {a[1]}
    </button>
  ))}
</div>
          </div>

          <div className="hr-card activity-card">
            <div className="hr-card-head">
              <h3>Recent Activities</h3>
              <button>All Activities ▾</button>
            </div>

            {activities.map((item, index) => (
              <div className="activity-row" key={index}>
                <span>📌</span>
                <div>
                  <b>{typeof item === "string" ? item : item.title}</b>
                  <p>{typeof item === "string" ? "Recently" : item.time}</p>
                </div>
                <em>{typeof item === "string" ? "HR" : item.type}</em>
              </div>
            ))}
          </div>

          <div className="hr-card notification-card">
            <div className="hr-card-head">
              <h3>Notifications</h3>
              <button onClick={() => goTo("/hr-notifications")}>View All</button>
            </div>

            {notifications.map((n, index) => (
              <p key={index}>🔔 {typeof n === "string" ? n : n.message}</p>
            ))}
          </div>

          <div className="hr-card birthday-card">
            <div className="hr-card-head">
              <h3>Upcoming Birthdays</h3>
              <button>Calendar</button>
            </div>

            <div className="birthday-list">
              {["Ankit", "Sneha", "Rahul", "Pooja"].map((name) => (
                <div key={name}>
                  <img src="/profile.png" alt={name} />
                  <b>{name}</b>
                  <small>05 May</small>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

export default HrPortalDashboard;