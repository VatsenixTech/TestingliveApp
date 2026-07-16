import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaArrowTrendUp,
  FaBriefcase,
  FaChartLine,
  FaCheck,
  FaDatabase,
  FaDownload,
  FaIndianRupeeSign,
  FaLocationDot,
  FaRotate,
  FaShieldHalved,
  FaStar,
  FaXmark,
} from "react-icons/fa6";

import "./SalaryPredictor.css";


/* =========================================================
   API CONFIGURATION
========================================================= */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


/* =========================================================
   LOCAL STORAGE HELPERS
========================================================= */

function getSavedUser() {
  try {
    return JSON.parse(
      localStorage.getItem("user") || "{}"
    );
  } catch (error) {
    console.error(
      "Unable to read saved user:",
      error
    );

    return {};
  }
}


function getCandidateId(user) {
  return (
    user?.candidateId ||
    user?._id ||
    user?.id ||
    ""
  );
}


function getCandidateName(user) {
  return (
    user?.name ||
    user?.fullName ||
    user?.candidateName ||
    "Candidate"
  );
}


function getCandidateRole(user) {
  return (
    user?.role ||
    user?.jobTitle ||
    user?.currentRole ||
    ""
  );
}


function getCandidateLocation(user) {
  if (typeof user?.location === "string") {
    return user.location;
  }

  if (user?.location?.city) {
    return [
      user.location.city,
      user.location.state,
      user.location.country,
    ]
      .filter(Boolean)
      .join(", ");
  }

  return user?.city || "";
}


function getCandidateExperience(user) {
  const directValue =
    user?.experienceYears ??
    user?.totalExperience ??
    user?.yearsOfExperience;

  if (
    directValue !== undefined &&
    directValue !== null &&
    Number.isFinite(Number(directValue))
  ) {
    return String(Number(directValue));
  }

  const text = String(
    user?.experience ||
      user?.experienceLevel ||
      ""
  );

  const matches =
    text.match(/\d+(\.\d+)?/g);

  if (!matches?.length) {
    return "";
  }

  return matches[0];
}


function getCandidateSkills(user) {
  const skills =
    user?.skills ||
    user?.technicalSkills ||
    user?.primarySkills ||
    [];

  if (Array.isArray(skills)) {
    return skills
      .map((skill) => {
        if (typeof skill === "string") {
          return skill;
        }

        return (
          skill?.name ||
          skill?.skill ||
          ""
        );
      })
      .filter(Boolean)
      .join(", ");
  }

  return String(skills || "");
}


/* =========================================================
   DISPLAY HELPERS
========================================================= */

function moneyLPA(value) {
  const amount = Number(value);

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return "—";
  }

  return `₹${(
    amount / 100000
  ).toFixed(2)} LPA`;
}


function signedPercent(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return number > 0
    ? `+${number}%`
    : `${number}%`;
}


function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("en-IN");
}


function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
}


function getPercentileLabel(value) {
  const percentile = Number(value || 0);

  if (percentile >= 90) {
    return "Top 10%";
  }

  if (percentile >= 75) {
    return "Top 25%";
  }

  if (percentile >= 50) {
    return "Above Median";
  }

  if (percentile >= 25) {
    return "Developing";
  }

  return "Entry Position";
}


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function SalaryPredictor() {
  const user = useMemo(
    () => getSavedUser(),
    []
  );

  const candidateId =
    getCandidateId(user);

  const candidateName =
    getCandidateName(user);

  const [form, setForm] =
    useState({
      targetRole:
        getCandidateRole(user),

      experienceYears:
        getCandidateExperience(user),

      location:
        getCandidateLocation(user),

      employmentType:
        "Full-time",

      skills:
        getCandidateSkills(user),
    });


  const [
    prediction,
    setPrediction,
  ] = useState(null);


  const [
    marketMetrics,
    setMarketMetrics,
  ] = useState(null);


  const [
    history,
    setHistory,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    predicting,
    setPredicting,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");


  /* =======================================================
     API REQUEST HELPER
  ======================================================= */

  const request =
    useCallback(
      async (
        endpoint,
        options = {}
      ) => {
        const token =
          localStorage.getItem("token");

        const response =
          await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
              ...options,

              headers: {
                "Content-Type":
                  "application/json",

                ...(token
                  ? {
                      Authorization:
                        `Bearer ${token}`,
                    }
                  : {}),

                ...(options.headers || {}),
              },
            }
          );


        let data = {};

        try {
          data =
            await response.json();
        } catch {
          data = {};
        }


        if (!response.ok) {
          throw new Error(
            data?.message ||
              `Request failed: ${response.status}`
          );
        }


        return data;
      },
      []
    );


  /* =======================================================
     LOAD DASHBOARD DATA
  ======================================================= */

  const loadDashboard =
    useCallback(async () => {
      if (!candidateId) {
        setError(
          "Candidate ID not found. Please login again."
        );

        setLoading(false);

        return;
      }


      setLoading(true);

      setError("");


      const results =
        await Promise.allSettled([
          request(
            `/api/salary-predictor/latest?candidateId=${candidateId}`
          ),

          request(
            `/api/salary-predictor/history?candidateId=${candidateId}`
          ),

          request(
            "/api/salary-predictor/market-metrics"
          ),
        ]);


      if (
        results[0].status ===
        "fulfilled"
      ) {
        setPrediction(
          results[0].value
            ?.prediction || null
        );
      }


      if (
        results[1].status ===
        "fulfilled"
      ) {
        setHistory(
          Array.isArray(
            results[1].value
              ?.predictions
          )
            ? results[1].value
                .predictions
            : []
        );
      }


      if (
        results[2].status ===
        "fulfilled"
      ) {
        setMarketMetrics(
          results[2].value
            ?.metrics || null
        );
      }


      if (
        results.every(
          (result) =>
            result.status ===
            "rejected"
        )
      ) {
        setError(
          "Unable to connect to Salary Predictor backend."
        );
      }


      setLoading(false);
    }, [
      candidateId,
      request,
    ]);


  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);


  /* =======================================================
     FORM CHANGE
  ======================================================= */

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;


    setForm((current) => ({
      ...current,

      [name]: value,
    }));
  }


  /* =======================================================
     PREDICT SALARY
  ======================================================= */

  async function handlePredict(event) {
    event.preventDefault();


    setError("");

    setSuccessMessage("");


    const targetRole =
      form.targetRole.trim();


    const location =
      form.location.trim();


    const experienceYears =
      Number(
        form.experienceYears
      );


    const skills =
      form.skills
        .split(",")
        .map((skill) =>
          skill.trim()
        )
        .filter(Boolean);


    if (!candidateId) {
      setError(
        "Candidate ID not found."
      );

      return;
    }


    if (!targetRole) {
      setError(
        "Please enter target role."
      );

      return;
    }


    if (
      !Number.isFinite(
        experienceYears
      ) ||
      experienceYears < 0
    ) {
      setError(
        "Please enter valid experience."
      );

      return;
    }


    if (!location) {
      setError(
        "Please enter location."
      );

      return;
    }


    if (!skills.length) {
      setError(
        "Please enter at least one skill."
      );

      return;
    }


    setPredicting(true);


    try {
      const result =
        await request(
          "/api/salary-predictor/predict",
          {
            method: "POST",

            body:
              JSON.stringify({
                candidateId,

                targetRole,

                experienceYears,

                location,

                employmentType:
                  form.employmentType,

                skills,
              }),
          }
        );


      if (!result?.prediction) {
        throw new Error(
          "Backend did not return prediction data."
        );
      }


      setPrediction(
        result.prediction
      );


      setHistory(
        (current) => [
          result.prediction,

          ...current.filter(
            (item) =>
              item?._id !==
              result.prediction
                ?._id
          ),
        ]
      );


      setSuccessMessage(
        "Salary prediction generated successfully."
      );


      window.scrollTo({
        top: 0,

        behavior: "smooth",
      });
    } catch (requestError) {
      console.error(
        requestError
      );


      setError(
        requestError.message ||
          "Unable to generate salary prediction."
      );
    } finally {
      setPredicting(false);
    }
  }


  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const salary =
    prediction?.prediction ||
    null;


  const marketInsights =
    prediction?.marketInsights ||
    null;


  const salaryBreakdown =
    prediction?.salaryBreakdown ||
    null;


  const skillInsights =
    Array.isArray(
      prediction?.skillInsights
    )
      ? prediction.skillInsights
      : [];


  const candidatePercentile =
    Number(
      salary
        ?.candidatePercentile ||
        0
    );


  const percentileLabel =
    marketInsights
      ?.marketPosition ||
    getPercentileLabel(
      candidatePercentile
    );


  const markerPosition =
    Math.min(
      Math.max(
        candidatePercentile,
        4
      ),

      96
    );


  /* =======================================================
     DOWNLOAD REPORT
  ======================================================= */

  function handleDownloadReport() {
    if (!prediction) {
      setError(
        "Generate salary prediction first."
      );

      return;
    }


    const report = [
      "NOPROMPTJOBS SALARY PREDICTION REPORT",

      "",

      `Candidate: ${candidateName}`,

      `Role: ${
        prediction.requestedRole ||
        form.targetRole
      }`,

      `Location: ${
        prediction.location ||
        form.location
      }`,

      `Experience: ${
        prediction.experienceYears ??
        form.experienceYears
      } years`,

      "",

      `Predicted Salary: ${moneyLPA(
        salary?.predictedSalary
      )}`,

      `Market Average: ${moneyLPA(
        salary?.marketAverage
      )}`,

      `Minimum Range: ${moneyLPA(
        salary?.percentile25 ||
          salary?.minimumSalary
      )}`,

      `Maximum Range: ${moneyLPA(
        salary?.percentile75 ||
          salary?.maximumSalary
      )}`,

      `Candidate Percentile: ${
        salary?.candidatePercentile ??
        0
      }`,

      `Confidence Score: ${
        salary?.confidenceScore ??
        0
      }%`,
    ].join("\n");


    const blob =
      new Blob(
        [report],
        {
          type:
            "text/plain;charset=utf-8",
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const anchor =
      document.createElement("a");


    anchor.href = url;


    anchor.download =
      "salary-prediction-report.txt";


    document.body.appendChild(
      anchor
    );


    anchor.click();


    anchor.remove();


    URL.revokeObjectURL(
      url
    );
  }


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="sp-page-content">

      {/* ===============================================
          PAGE HEADER
      =============================================== */}

      <section className="sp-header">

        <div className="sp-header-copy">

          <span className="sp-eyebrow">
            AI COMPENSATION INTELLIGENCE
          </span>


          <h1>
            Hello, {candidateName}
            <span> 👋</span>
          </h1>


          <h2>
            Premium AI Salary Predictor
          </h2>


          <p>
            Understand your market value using
            your role, experience, location,
            verified skills and real salary
            information available across the
            platform.
          </p>

        </div>


        <div className="sp-header-actions">

          <button
            type="button"
            className="sp-secondary-button"
            onClick={loadDashboard}
            disabled={
              loading ||
              predicting
            }
          >
            <FaRotate />

            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>


          <button
            type="button"
            className="sp-primary-button"
            onClick={
              handleDownloadReport
            }
            disabled={!prediction}
          >
            <FaDownload />

            Download Report
          </button>

        </div>

      </section>


      {/* ===============================================
          ALERTS
      =============================================== */}

      {error && (

        <div className="sp-alert sp-alert-error">

          <span>
            {error}
          </span>


          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            <FaXmark />
          </button>

        </div>

      )}


      {successMessage && (

        <div className="sp-alert sp-alert-success">

          <FaCheck />


          <span>
            {successMessage}
          </span>


          <button
            type="button"
            onClick={() =>
              setSuccessMessage("")
            }
          >
            <FaXmark />
          </button>

        </div>

      )}


      {/* ===============================================
          METRICS
      =============================================== */}

      <section className="sp-metrics">

        <MetricCard
          icon={<FaDatabase />}
          label="Jobs Analyzed"
          value={formatNumber(
            salary
              ?.totalJobsAnalyzed ??
            marketMetrics
              ?.totalJobsAnalyzed ??
            0
          )}
          note="Active market records"
        />


        <MetricCard
          icon={
            <FaIndianRupeeSign />
          }
          label="Salary Records"
          value={formatNumber(
            salary
              ?.salaryRecordCount ??
            marketMetrics
              ?.salaryRecords ??
            0
          )}
          note="Structured salary data"
        />


        <MetricCard
          icon={<FaBriefcase />}
          label="Roles Covered"
          value={formatNumber(
            marketMetrics
              ?.rolesCovered ??
            0
          )}
          note="Distinct job roles"
        />


        <MetricCard
          icon={
            <FaShieldHalved />
          }
          label="Prediction Confidence"
          value={
            salary
              ? `${
                  salary
                    .confidenceScore ??
                  0
                }%`
              : "—"
          }
          note="Calculated confidence"
        />


        <MetricCard
          icon={<FaChartLine />}
          label="Market Position"
          value={
            prediction
              ? percentileLabel
              : "—"
          }
          note={
            prediction
              ? `${candidatePercentile}th percentile`
              : "Generate prediction"
          }
        />

      </section>


      {/* ===============================================
          MAIN WORKSPACE
      =============================================== */}

      <section className="sp-workspace">

        {/* FORM */}

        <form
          className="sp-card sp-form-card"
          onSubmit={handlePredict}
        >

          <CardHeading
            eyebrow="YOUR PROFILE"
            title="Analyze Your Salary"
            description="Enter your career details to calculate your market salary position."
          />


          <label>
            Target Role

            <input
              type="text"
              name="targetRole"
              value={
                form.targetRole
              }
              onChange={
                handleChange
              }
              placeholder="Data Engineer"
            />

          </label>


          <div className="sp-form-grid">

            <label>
              Experience Years

              <input
                type="number"
                name="experienceYears"
                min="0"
                max="50"
                step="0.5"
                value={
                  form.experienceYears
                }
                onChange={
                  handleChange
                }
              />

            </label>


            <label>
              Employment Type

              <select
                name="employmentType"
                value={
                  form.employmentType
                }
                onChange={
                  handleChange
                }
              >

                <option>
                  Full-time
                </option>

                <option>
                  Contract
                </option>

                <option>
                  Part-time
                </option>

                <option>
                  Internship
                </option>

              </select>

            </label>

          </div>


          <label>
            Location

            <div className="sp-input-icon">

              <FaLocationDot />


              <input
                type="text"
                name="location"
                value={
                  form.location
                }
                onChange={
                  handleChange
                }
                placeholder="Bangalore, India"
              />

            </div>

          </label>


          <label>
            Skills

            <textarea
              name="skills"
              value={
                form.skills
              }
              onChange={
                handleChange
              }
              placeholder="Python, PySpark, SQL, AWS, Snowflake"
            />

          </label>


          <button
            type="submit"
            className="sp-predict-button"
            disabled={predicting}
          >

            {predicting
              ? "Analyzing Market Data..."
              : "Predict My Salary"}

          </button>

        </form>


        {/* SALARY RESULT */}

        <section className="sp-card sp-prediction-card">

          <CardHeading
            eyebrow="SALARY PREDICTION"
            title="Estimated Annual Salary"
            description={
              prediction
                ? `Generated ${formatDate(
                    prediction.createdAt
                  )}`
                : "Generate your market-based salary prediction."
            }
          />


          {!prediction ? (

            <EmptyState
              icon={
                <FaIndianRupeeSign />
              }
              title="No salary prediction yet"
              text="Complete your profile details and select Predict My Salary."
            />

          ) : (

            <>

              <div className="sp-salary-value">

                <span>
                  Most Likely Annual Salary
                </span>


                <strong>
                  {moneyLPA(
                    salary
                      ?.predictedSalary
                  )}
                </strong>


                <em>
                  {signedPercent(
                    marketInsights
                      ?.marketComparisonPercent
                  )}{" "}
                  compared with market average
                </em>

              </div>


              <div className="sp-range-track">

                <div className="sp-range-line">
                  <span />
                </div>


                <div className="sp-range-values">

                  <div>

                    <small>
                      Minimum Range
                    </small>

                    <strong>
                      {moneyLPA(
                        salary
                          ?.percentile25 ||
                        salary
                          ?.minimumSalary
                      )}
                    </strong>

                  </div>


                  <div>

                    <small>
                      Most Likely
                    </small>

                    <strong>
                      {moneyLPA(
                        salary
                          ?.predictedSalary
                      )}
                    </strong>

                  </div>


                  <div>

                    <small>
                      Maximum Range
                    </small>

                    <strong>
                      {moneyLPA(
                        salary
                          ?.percentile75 ||
                        salary
                          ?.maximumSalary
                      )}
                    </strong>

                  </div>

                </div>

              </div>


              <div className="sp-detail-list">

                <DetailRow
                  label="Market Average"
                  value={moneyLPA(
                    salary
                      ?.marketAverage
                  )}
                />


                <DetailRow
                  label="Top 10% Threshold"
                  value={moneyLPA(
                    salary
                      ?.percentile90
                  )}
                />


                <DetailRow
                  label="Salary Records Used"
                  value={formatNumber(
                    salary
                      ?.salaryRecordCount ??
                    0
                  )}
                />


                <DetailRow
                  label="Demand Level"
                  value={
                    salary
                      ?.demandLevel ||
                    "Not available"
                  }
                />

              </div>

            </>

          )}

        </section>


        {/* MARKET POSITION */}

        <section className="sp-card sp-market-card">

          <CardHeading
            eyebrow="MARKET POSITION"
            title="Your Salary Position"
            description="Your estimated position among matching compensation records."
          />


          {!prediction ? (

            <EmptyState
              icon={
                <FaArrowTrendUp />
              }
              title="Awaiting prediction"
              text="Market position appears after salary analysis."
            />

          ) : (

            <>

              <div className="sp-market-curve">

                <div className="sp-market-curve-shape" />


                <div
                  className="sp-market-marker"
                  style={{
                    left:
                      `${markerPosition}%`,
                  }}
                >

                  <span />

                  <small>
                    You
                  </small>

                </div>

              </div>


              <div className="sp-market-summary">

                <div>

                  <strong>
                    {percentileLabel}
                  </strong>

                  <span>
                    Your Position
                  </span>

                </div>


                <div>

                  <strong>
                    {moneyLPA(
                      salary
                        ?.predictedSalary
                    )}
                  </strong>

                  <span>
                    Your Salary
                  </span>

                </div>

              </div>


              <div className="sp-market-progress">

                <span
                  style={{
                    width:
                      `${
                        Math.min(
                          candidatePercentile,
                          100
                        )
                      }%`,
                  }}
                />

              </div>


              <p className="sp-market-text">

                Your estimated salary is above{" "}

                <strong>
                  {candidatePercentile}%
                </strong>{" "}

                of matching salary records.

              </p>

            </>

          )}

        </section>

      </section>


      {/* ===============================================
          LOWER GRID
      =============================================== */}

      <section className="sp-lower-grid">

        <section className="sp-card">

          <CardHeading
            eyebrow="COMPENSATION STRUCTURE"
            title="Estimated Salary Breakdown"
            description="Estimated compensation allocation."
          />


          {!prediction ? (

            <EmptyState
              icon={
                <FaIndianRupeeSign />
              }
              title="No breakdown available"
              text="Generate your salary prediction first."
            />

          ) : (

            <div className="sp-breakdown">

              <DetailRow
                label="Base Salary"
                value={moneyLPA(
                  salaryBreakdown
                    ?.baseSalary
                )}
              />


              <DetailRow
                label="Performance Bonus"
                value={moneyLPA(
                  salaryBreakdown
                    ?.performanceBonus
                )}
              />


              <DetailRow
                label="Stock Compensation"
                value={moneyLPA(
                  salaryBreakdown
                    ?.stockCompensation
                )}
              />


              <DetailRow
                label="Other Benefits"
                value={moneyLPA(
                  salaryBreakdown
                    ?.otherBenefits
                )}
              />

            </div>

          )}

        </section>


        <section className="sp-card">

          <CardHeading
            eyebrow="SKILL INTELLIGENCE"
            title="Skill Salary Impact"
            description="Calculated from matching salary records."
          />


          {skillInsights.length === 0 ? (

            <EmptyState
              icon={<FaStar />}
              title="No verified skill impact yet"
              text="More matching salary records are required."
            />

          ) : (

            <div className="sp-skill-list">

              {skillInsights.map(
                (item) => (

                  <div
                    className="sp-skill-item"
                    key={item.skill}
                  >

                    <div>

                      <strong>
                        {item.skill}
                      </strong>


                      <span>
                        {formatNumber(
                          item.matchingJobs
                        )}{" "}
                        matching jobs
                      </span>

                    </div>


                    <b>
                      {signedPercent(
                        item.impactPercent
                      )}
                    </b>

                  </div>

                )
              )}

            </div>

          )}

        </section>


        <section className="sp-card">

          <CardHeading
            eyebrow="HISTORY"
            title="Recent Predictions"
            description="Your latest saved salary analyses."
          />


          {history.length === 0 ? (

            <EmptyState
              icon={<FaChartLine />}
              title="No prediction history"
              text="Completed predictions appear here."
            />

          ) : (

            <div className="sp-history">

              {history
                .slice(0, 5)
                .map((item) => (

                  <button
                    type="button"
                    className="sp-history-item"
                    key={item._id}
                    onClick={() =>
                      setPrediction(item)
                    }
                  >

                    <div>

                      <strong>
                        {item.requestedRole ||
                          item.resolvedRole ||
                          "Salary Prediction"}
                      </strong>


                      <span>
                        {formatDate(
                          item.createdAt
                        )}
                      </span>

                    </div>


                    <b>
                      {moneyLPA(
                        item
                          ?.prediction
                          ?.predictedSalary
                      )}
                    </b>

                  </button>

                ))}

            </div>

          )}

        </section>

      </section>

    </div>
  );
}


/* =========================================================
   CHILD COMPONENTS
========================================================= */

function MetricCard({
  icon,
  label,
  value,
  note,
}) {
  return (
    <article className="sp-metric-card">

      <div className="sp-metric-icon">
        {icon}
      </div>


      <div>

        <span>
          {label}
        </span>


        <strong>
          {value}
        </strong>


        <small>
          {note}
        </small>

      </div>

    </article>
  );
}


function CardHeading({
  eyebrow,
  title,
  description,
}) {
  return (
    <header className="sp-card-heading">

      <span>
        {eyebrow}
      </span>


      <h3>
        {title}
      </h3>


      <p>
        {description}
      </p>

    </header>
  );
}


function DetailRow({
  label,
  value,
}) {
  return (
    <div className="sp-detail-row">

      <span>
        {label}
      </span>


      <strong>
        {value}
      </strong>

    </div>
  );
}


function EmptyState({
  icon,
  title,
  text,
}) {
  return (
    <div className="sp-empty">

      <div className="sp-empty-icon">
        {icon}
      </div>


      <strong>
        {title}
      </strong>


      <p>
        {text}
      </p>

    </div>
  );
}