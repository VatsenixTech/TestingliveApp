import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FiSearch,
  FiBriefcase,
  FiCheckCircle,
  FiEye,
  FiUsers,
  FiTrendingUp,
  FiRefreshCw,
  FiArrowUpRight,
  FiFilter,
  FiMoreHorizontal,
  FiDownload,
  FiX,
  FiTrash2,
  FiLogOut,
  FiMapPin,
} from "react-icons/fi";

import "./ApplicationsPage.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const FILTER_OPTIONS = [
  "All",
  "Applied",
  "Under Review",
  "Interview",
  "Offer",
  "Rejected",
];

const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toast, setToast] = useState("");

  const pageRef = useRef(null);

  let savedUser = {};

  try {
    savedUser = JSON.parse(localStorage.getItem("user") || "{}");
  } catch (error) {
    console.error("Unable to read user:", error);
  }

  const candidateId =
    savedUser?.candidateId ||
    savedUser?._id ||
    savedUser?.id ||
    "";

  const goTo = (path) => {
    if (!path) return;
    window.location.href = path;
  };

  const authHeaders = () => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      "";

    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2500);
  };

  const normalizeStatus = (status = "") => {
    const value = String(status).toLowerCase().trim();

    if (value.includes("review") || value.includes("shortlist")) {
      return "Under Review";
    }

    if (value.includes("interview")) {
      return "Interview";
    }

    if (value.includes("offer") || value.includes("selected")) {
      return "Offer";
    }

    if (
      value.includes("reject") ||
      value.includes("declined") ||
      value.includes("withdraw")
    ) {
      return "Rejected";
    }

    return "Applied";
  };

  const firstArray = (body) => {
    if (Array.isArray(body)) return body;
    if (Array.isArray(body?.applications)) return body.applications;
    if (Array.isArray(body?.data)) return body.data;
    if (Array.isArray(body?.items)) return body.items;
    return [];
  };

  const loadApplications = async ({ manual = false } = {}) => {
    try {
      if (manual) setRefreshing(true);
      else setLoading(true);

      if (!candidateId) {
        setApplications([]);
        showToast("Please login to view applications.");
        return;
      }

      const endpoints = [
        `${API_URL}/api/applications/candidate/${candidateId}`,
        `${API_URL}/api/candidates/${candidateId}/applications`,
        `${API_URL}/api/applications/my-applications`,
      ];

      let loaded = false;

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: "GET",
            headers: authHeaders(),
          });

          if (!response.ok) continue;

          const result = await response.json();
          setApplications(firstArray(result));
          loaded = true;
          break;
        } catch (error) {
          console.warn("Applications endpoint failed:", endpoint, error);
        }
      }

      if (!loaded) {
        setApplications([]);
        showToast("No application endpoint responded.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pageRef.current && !pageRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedApplication(null);
        setActiveMenuId(null);
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  const stats = useMemo(() => {
    const values = {
      total: applications.length,
      applied: 0,
      underReview: 0,
      interviews: 0,
      offers: 0,
      rejected: 0,
    };

    applications.forEach((item) => {
      const status = normalizeStatus(item?.status);

      if (status === "Applied") values.applied += 1;
      if (status === "Under Review") values.underReview += 1;
      if (status === "Interview") values.interviews += 1;
      if (status === "Offer") values.offers += 1;
      if (status === "Rejected") values.rejected += 1;
    });

    return values;
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return applications.filter((item) => {
      const company =
        item?.companyName ||
        item?.company ||
        item?.job?.company ||
        "";

      const role =
        item?.jobTitle ||
        item?.role ||
        item?.job?.title ||
        "";

      const location =
        item?.location ||
        item?.job?.location ||
        item?.city ||
        "";

      const status = normalizeStatus(item?.status);

      const matchesSearch =
        !search ||
        `${company} ${role} ${location} ${status}`
          .toLowerCase()
          .includes(search);

      const matchesFilter =
        activeFilter === "All" ||
        status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [applications, searchText, activeFilter]);

  const formatDate = (value) => {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const getApplicationId = (item, index = 0) =>
    item?._id || item?.id || `application-${index}`;

  const getCompany = (item) =>
    item?.companyName ||
    item?.company ||
    item?.job?.company ||
    "Company";

  const getRole = (item) =>
    item?.jobTitle ||
    item?.role ||
    item?.job?.title ||
    "Position";

  const getLocation = (item) =>
    item?.location ||
    item?.job?.location ||
    item?.city ||
    "Location unavailable";

  const exportApplications = () => {
    const headers = [
      "Company",
      "Role",
      "Location",
      "Status",
      "Applied On",
      "Next Step",
    ];

    const rows = filteredApplications.map((item) => [
      getCompany(item),
      getRole(item),
      getLocation(item),
      normalizeStatus(item?.status),
      formatDate(item?.appliedAt || item?.createdAt),
      item?.nextStep ||
        item?.interviewStage ||
        "Awaiting update",
    ]);

    const escapeCell = (value) => {
      const text = String(value ?? "");
      return /[",\n]/.test(text)
        ? `"${text.replaceAll('"', '""')}"`
        : text;
    };

    const csv = [
      headers.map(escapeCell).join(","),
      ...rows.map((row) =>
        row.map(escapeCell).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "nopromptjobs-applications.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast("Applications exported successfully.");
  };

  const tryActionEndpoints = async (endpoints, options) => {
    let lastError = null;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, options);

        if (response.ok) {
          return true;
        }

        lastError = new Error(`Request failed with ${response.status}`);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error("No endpoint responded.");
  };

  const withdrawApplication = async (item, index) => {
    const id = getApplicationId(item, index);

    if (!window.confirm("Withdraw this application?")) return;

    try {
      setActionLoadingId(id);

      await tryActionEndpoints(
        [
          `${API_URL}/api/applications/${id}/withdraw`,
          `${API_URL}/api/applications/withdraw/${id}`,
        ],
        {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({
            candidateId,
            status: "Withdrawn",
          }),
        }
      );

      setApplications((current) =>
        current.map((application, itemIndex) =>
          getApplicationId(application, itemIndex) === id
            ? {
                ...application,
                status: "Withdrawn",
                nextStep: "Application withdrawn",
              }
            : application
        )
      );

      setSelectedApplication(null);
      setActiveMenuId(null);
      showToast("Application withdrawn.");
    } catch (error) {
      console.error("Withdraw failed:", error);
      showToast("Withdraw API is not available yet.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const deleteApplication = async (item, index) => {
    const id = getApplicationId(item, index);

    if (!window.confirm("Delete this application from your history?")) return;

    try {
      setActionLoadingId(id);

      await tryActionEndpoints(
        [
          `${API_URL}/api/applications/${id}`,
          `${API_URL}/api/applications/delete/${id}`,
        ],
        {
          method: "DELETE",
          headers: authHeaders(),
        }
      );

      setApplications((current) =>
        current.filter(
          (application, itemIndex) =>
            getApplicationId(application, itemIndex) !== id
        )
      );

      setSelectedApplication(null);
      setActiveMenuId(null);
      showToast("Application deleted.");
    } catch (error) {
      console.error("Delete failed:", error);
      showToast("Delete API is not available yet.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const metricCards = [
    {
      label: "Total Applications",
      value: stats.total,
      description: "Live backend records",
      icon: <FiBriefcase />,
      className: "applications-metric-blue",
    },
    {
      label: "Applied",
      value: stats.applied,
      description: "Submitted roles",
      icon: <FiCheckCircle />,
      className: "applications-metric-green",
    },
    {
      label: "Under Review",
      value: stats.underReview,
      description: "Recruiter evaluation",
      icon: <FiEye />,
      className: "applications-metric-purple",
    },
    {
      label: "Interviews",
      value: stats.interviews,
      description: "Interview stage",
      icon: <FiUsers />,
      className: "applications-metric-orange",
    },
    {
      label: "Offers",
      value: stats.offers,
      description: "Successful outcomes",
      icon: <FiTrendingUp />,
      className: "applications-metric-teal",
    },
  ];

  return (
    <main
      ref={pageRef}
      className="ultimate-applications-page"
    >
      {toast && (
        <div className="applications-toast">
          {toast}
        </div>
      )}

      <section className="applications-hero">
        <div className="applications-hero-copy">
          <span className="applications-eyebrow">
            Application Intelligence
          </span>

          <h1>My Applications</h1>

          <p>
            Track every job application, recruiter response,
            interview stage and hiring outcome from one premium
            workspace.
          </p>
        </div>

        <div className="applications-hero-actions">
          <button
            type="button"
            className="applications-secondary-button"
            onClick={() =>
              loadApplications({ manual: true })
            }
            disabled={refreshing}
          >
            <FiRefreshCw
              className={
                refreshing ? "applications-spin" : ""
              }
            />
            {refreshing ? "Refreshing" : "Refresh"}
          </button>

          <button
            type="button"
            className="applications-secondary-button"
            onClick={exportApplications}
          >
            <FiDownload />
            Export
          </button>

          <button
            type="button"
            className="applications-primary-button"
            onClick={() => goTo("/jobs")}
          >
            Apply for Jobs
            <FiArrowUpRight />
          </button>
        </div>
      </section>

      <section className="applications-metrics-grid">
        {metricCards.map((card) => (
          <article
            key={card.label}
            className="applications-metric-card"
          >
            <div
              className={`applications-metric-icon ${card.className}`}
            >
              {card.icon}
            </div>

            <div className="applications-metric-copy">
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <small>{card.description}</small>
            </div>
          </article>
        ))}
      </section>

      <section className="applications-workspace">
        <div className="applications-main-panel">
          <div className="applications-panel-heading">
            <div>
              <h2>Applications Pipeline</h2>
              <p>
                Review and manage all your submitted
                applications.
              </p>
            </div>

            <button
              type="button"
              className="applications-glass-apply-button"
              onClick={() => goTo("/jobs")}
            >
              <span className="applications-glass-apply-icon">
                <FiBriefcase />
              </span>

              <span>Apply for Jobs</span>
              <FiArrowUpRight />
            </button>
          </div>

          <div className="applications-filter-tabs">
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={
                  activeFilter === option
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveFilter(option)
                }
              >
                {option}
              </button>
            ))}
          </div>

          <div className="applications-toolbar">
            <label className="applications-search">
              <FiSearch />

              <input
                type="search"
                value={searchText}
                onChange={(event) =>
                  setSearchText(event.target.value)
                }
                placeholder="Search company, role, location or status"
              />
            </label>

            <label className="applications-filter">
              <FiFilter />

              <select
                value={activeFilter}
                onChange={(event) =>
                  setActiveFilter(event.target.value)
                }
              >
                {FILTER_OPTIONS.map((option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {loading ? (
            <div className="applications-state">
              <div className="applications-loader" />
              <h3>Loading applications</h3>
              <p>
                Connecting to your latest application records.
              </p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="applications-state">
              <div className="applications-empty-icon">
                <FiBriefcase />
              </div>

              <h3>No applications found</h3>

              <p>
                Apply for suitable jobs and your application
                progress will appear here automatically.
              </p>

              <button
                type="button"
                className="applications-glass-explore-button"
                onClick={() => goTo("/jobs")}
              >
                <span className="applications-glass-explore-icon">
                  <FiSearch />
                </span>

                <span className="applications-glass-explore-label">
                  Explore Jobs
                </span>

                <FiArrowUpRight className="applications-glass-explore-arrow" />
              </button>
            </div>
          ) : (
            <div className="applications-list">
              {filteredApplications.map((item, index) => {
                const id = getApplicationId(item, index);
                const company = getCompany(item);
                const role = getRole(item);
                const location = getLocation(item);
                const status = normalizeStatus(item?.status);

                return (
                  <article
                    key={id}
                    className="application-item"
                    onClick={() =>
                      setSelectedApplication({
                        item,
                        index,
                      })
                    }
                  >
                    <div className="application-company">
                      <span className="application-company-avatar">
                        {company.charAt(0).toUpperCase()}
                      </span>

                      <div>
                        <strong>{company}</strong>
                        <span>{role}</span>

                        <small>
                          <FiMapPin />
                          {location}
                        </small>
                      </div>
                    </div>

                    <div className="application-column">
                      <span
                        className={`applications-status applications-status-${status
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                      >
                        {status}
                      </span>

                      <small>Applied on</small>

                      <strong>
                        {formatDate(
                          item?.appliedAt ||
                            item?.createdAt
                        )}
                      </strong>
                    </div>

                    <div className="application-column">
                      <small>Next step</small>

                      <strong>
                        {item?.nextStep ||
                          item?.interviewStage ||
                          "Awaiting update"}
                      </strong>
                    </div>

                    <div className="application-column application-score">
                      <small>Match score</small>

                      <strong>
                        {Number(
                          item?.matchScore ||
                            item?.score ||
                            0
                        )}
                        %
                      </strong>
                    </div>

                    <div className="applications-actions-menu">
                      <button
                        type="button"
                        aria-label="Application options"
                        onClick={(event) => {
                          event.stopPropagation();

                          setActiveMenuId((current) =>
                            current === id ? null : id
                          );
                        }}
                      >
                        <FiMoreHorizontal />
                      </button>

                      {activeMenuId === id && (
                        <div
                          className="applications-row-menu"
                          onClick={(event) =>
                            event.stopPropagation()
                          }
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedApplication({
                                item,
                                index,
                              })
                            }
                          >
                            <FiEye />
                            View details
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              goTo(
                                `/jobs?search=${encodeURIComponent(
                                  role
                                )}`
                              )
                            }
                          >
                            <FiSearch />
                            Find similar jobs
                          </button>

                          <button
                            type="button"
                            disabled={actionLoadingId === id}
                            onClick={() =>
                              withdrawApplication(item, index)
                            }
                          >
                            <FiLogOut />
                            Withdraw
                          </button>

                          <button
                            type="button"
                            className="danger"
                            disabled={actionLoadingId === id}
                            onClick={() =>
                              deleteApplication(item, index)
                            }
                          >
                            <FiTrash2 />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <aside className="applications-insights">
          <div className="applications-insight-card">
            <div className="applications-insight-heading">
              <div>
                <span>Application Overview</span>
                <strong>{stats.total}</strong>
                <small>Total applications</small>
              </div>

              <div className="applications-ring">
                <span>{stats.total}</span>
              </div>
            </div>

            <div className="applications-breakdown">
              <div>
                <span className="applications-dot applied" />
                Applied
                <strong>{stats.applied}</strong>
              </div>

              <div>
                <span className="applications-dot review" />
                Under Review
                <strong>{stats.underReview}</strong>
              </div>

              <div>
                <span className="applications-dot interview" />
                Interviews
                <strong>{stats.interviews}</strong>
              </div>

              <div>
                <span className="applications-dot offer" />
                Offers
                <strong>{stats.offers}</strong>
              </div>

              <div>
                <span className="applications-dot rejected" />
                Rejected
                <strong>{stats.rejected}</strong>
              </div>
            </div>
          </div>

          <div className="applications-insight-card applications-quick-actions-card">
            <h3>Quick Actions</h3>

            <div className="applications-quick-actions-list">
              <button
                type="button"
                className="applications-quick-action"
                onClick={() => goTo("/jobs")}
              >
                <span className="applications-quick-action-icon">
                  <FiSearch />
                </span>

                <span className="applications-quick-action-copy">
                  <strong>Explore Jobs</strong>
                  <small>Discover matching opportunities</small>
                </span>

                <FiArrowUpRight className="applications-quick-action-arrow" />
              </button>

              <button
                type="button"
                className="applications-quick-action"
                onClick={() => goTo("/resume-studio")}
              >
                <span className="applications-quick-action-icon">
                  <FiBriefcase />
                </span>

                <span className="applications-quick-action-copy">
                  <strong>Improve Resume</strong>
                  <small>Optimize your ATS profile</small>
                </span>

                <FiArrowUpRight className="applications-quick-action-arrow" />
              </button>

              <button
                type="button"
                className="applications-quick-action"
                onClick={() => goTo("/ai-interview")}
              >
                <span className="applications-quick-action-icon">
                  <FiUsers />
                </span>

                <span className="applications-quick-action-copy">
                  <strong>Practice Interview</strong>
                  <small>Prepare with AI interviews</small>
                </span>

                <FiArrowUpRight className="applications-quick-action-arrow" />
              </button>

              <button
                type="button"
                className="applications-quick-action"
                onClick={() => goTo("/job-alerts")}
              >
                <span className="applications-quick-action-icon">
                  <FiTrendingUp />
                </span>

                <span className="applications-quick-action-copy">
                  <strong>Manage Job Alerts</strong>
                  <small>Control opportunity notifications</small>
                </span>

                <FiArrowUpRight className="applications-quick-action-arrow" />
              </button>
            </div>
          </div>
        </aside>
      </section>

      {selectedApplication && (
        <div
          className="applications-modal-backdrop"
          onMouseDown={() =>
            setSelectedApplication(null)
          }
        >
          <section
            className="applications-details-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="applications-modal-close"
              onClick={() =>
                setSelectedApplication(null)
              }
            >
              <FiX />
            </button>

            <span className="applications-eyebrow">
              Application Details
            </span>

            <h2>
              {getRole(selectedApplication.item)}
            </h2>

            <p className="applications-modal-company">
              {getCompany(selectedApplication.item)}
            </p>

            <div className="applications-modal-grid">
              <div>
                <span>Status</span>
                <strong>
                  {normalizeStatus(
                    selectedApplication.item?.status
                  )}
                </strong>
              </div>

              <div>
                <span>Location</span>
                <strong>
                  {getLocation(selectedApplication.item)}
                </strong>
              </div>

              <div>
                <span>Applied on</span>
                <strong>
                  {formatDate(
                    selectedApplication.item?.appliedAt ||
                      selectedApplication.item?.createdAt
                  )}
                </strong>
              </div>

              <div>
                <span>Next step</span>
                <strong>
                  {selectedApplication.item?.nextStep ||
                    selectedApplication.item?.interviewStage ||
                    "Awaiting update"}
                </strong>
              </div>
            </div>

            <div className="applications-modal-actions">
              <button
                type="button"
                className="applications-secondary-button"
                onClick={() =>
                  goTo(
                    `/jobs?search=${encodeURIComponent(
                      getRole(selectedApplication.item)
                    )}`
                  )
                }
              >
                Find similar jobs
              </button>

              <button
                type="button"
                className="applications-withdraw-button"
                onClick={() =>
                  withdrawApplication(
                    selectedApplication.item,
                    selectedApplication.index
                  )
                }
              >
                Withdraw
              </button>

              <button
                type="button"
                className="applications-delete-button"
                onClick={() =>
                  deleteApplication(
                    selectedApplication.item,
                    selectedApplication.index
                  )
                }
              >
                Delete
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default ApplicationsPage;