import { useState } from "react";
import axios from "axios";
import "./HrOfferLetter.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function HrOfferLetter() {
  const [form, setForm] = useState({
    candidateName: "Rahul Sharma",
    candidateEmail: "rahul@email.com",
    candidatePhone: "+91 98765 43210",
    candidateAddress:
      "123, 4th Main Road, 5th Cross,\nHSR Layout, Bengaluru - 560102,\nKarnataka, India",

    designation: "Full Stack Developer",
    department: "Engineering",
    employmentType: "Full-Time",
    joiningDate: "2026-07-15",
    workLocation: "Bengaluru, Karnataka",
    ctc: "800000",
    reportingManager: "Venkatesh A",
    grade: "L1",
    probation: "6 Months",
    workingModel: "Hybrid / WFO / Remote",
    officeHours: "Mon–Fri (9:30 AM – 6:30 PM)",

    salary: {
      basicMonthly: "25000",
      basicAnnual: "300000",

      hraMonthly: "10000",
      hraAnnual: "120000",

      specialMonthly: "12000",
      specialAnnual: "144000",

      conveyanceMonthly: "2000",
      conveyanceAnnual: "24000",

      internetMonthly: "1000",
      internetAnnual: "12000",

      performanceMonthly: "5000",
      performanceAnnual: "60000",

      grossMonthly: "55000",
      grossAnnual: "660000",

      pfMonthly: "1800",
      pfAnnual: "21600",

      gratuityMonthly: "1200",
      gratuityAnnual: "14400",

      medicalMonthly: "1000",
      medicalAnnual: "12000",

      bonusMonthly: "",
      bonusAnnual: "92000",

      totalAnnualCtc: "800000",
    },
  });

  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");

  const updateForm = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const updateSalary = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      salary: {
        ...form.salary,
        [name]: value,
      },
    });
  };

  const autoCalculateSalary = () => {
    const annualCtc = Number(form.ctc || 0);

    if (!annualCtc || annualCtc <= 0) {
      alert("Please enter Annual CTC first.");
      return;
    }

    const basicAnnual = Math.round(annualCtc * 0.4);
    const hraAnnual = Math.round(basicAnnual * 0.4);
    const conveyanceAnnual = 24000;
    const internetAnnual = 12000;
    const pfAnnual = 21600;
    const gratuityAnnual = Math.round(basicAnnual * 0.0481);
    const medicalAnnual = 12000;
    const performanceAnnual = Math.round(annualCtc * 0.08);

    const usedAnnual =
      basicAnnual +
      hraAnnual +
      conveyanceAnnual +
      internetAnnual +
      pfAnnual +
      gratuityAnnual +
      medicalAnnual +
      performanceAnnual;

    const specialAnnual = Math.max(annualCtc - usedAnnual, 0);

    const grossAnnual =
      basicAnnual +
      hraAnnual +
      specialAnnual +
      conveyanceAnnual +
      internetAnnual +
      performanceAnnual;

    const monthly = (amount) => Math.round(amount / 12).toString();

    setForm({
      ...form,
      salary: {
        basicMonthly: monthly(basicAnnual),
        basicAnnual: basicAnnual.toString(),

        hraMonthly: monthly(hraAnnual),
        hraAnnual: hraAnnual.toString(),

        specialMonthly: monthly(specialAnnual),
        specialAnnual: specialAnnual.toString(),

        conveyanceMonthly: monthly(conveyanceAnnual),
        conveyanceAnnual: conveyanceAnnual.toString(),

        internetMonthly: monthly(internetAnnual),
        internetAnnual: internetAnnual.toString(),

        performanceMonthly: monthly(performanceAnnual),
        performanceAnnual: performanceAnnual.toString(),

        grossMonthly: monthly(grossAnnual),
        grossAnnual: grossAnnual.toString(),

        pfMonthly: monthly(pfAnnual),
        pfAnnual: pfAnnual.toString(),

        gratuityMonthly: monthly(gratuityAnnual),
        gratuityAnnual: gratuityAnnual.toString(),

        medicalMonthly: monthly(medicalAnnual),
        medicalAnnual: medicalAnnual.toString(),

        bonusMonthly: "",
        bonusAnnual: "",

        totalAnnualCtc: annualCtc.toString(),
      },
    });
  };

  const createOffer = async (sendEmail = false) => {
  try {
    setLoading(true);

    const payload = {
      ...form,

      candidateAddress: form.candidateAddress,
      candidatePhone: form.candidatePhone,

      reportingManager: form.reportingManager,
      grade: form.grade,
      probation: form.probation,
      workingModel: form.workingModel,
      officeHours: form.officeHours,

      salary: form.salary || {},

      ctc: form.salary?.totalAnnualCtc || form.ctc,
      sendEmail,
    };

    console.log("========== OFFER DATA ==========");
    console.log("Payload:", payload);
    console.log("Salary:", payload.salary);
    console.log("Address:", payload.candidateAddress);
    console.log("===============================");

    const res = await axios.post(
      `${API_URL}/api/hr/offer-letters/create-and-send`,
      payload
    );

    const id = res.data.offer._id;

    setPdfUrl(`${API_URL}/api/hr/offer-letters/${id}/pdf?t=${Date.now()}`);

    if (sendEmail) {
      alert("Offer letter generated and sent successfully.");
      window.location.href = `/hr-offer-letter-details?id=${id}`;
    } else {
      alert("Offer letter preview generated successfully.");
    }
  } catch (error) {
    console.log("OFFER CREATE ERROR:", error.response?.data || error.message);
    alert(error.response?.data?.message || "Failed to generate offer letter");
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="hr-create-offer-page">
      <aside className="offer-left-nav">
        <div className="offer-nav-brand">
          <img src="/vatsenix-logo.png" alt="Vatsenix" />
          <h2>VATSENIX</h2>
          <p>HR PORTAL</p>
        </div>

        <button onClick={() => (window.location.href = "/hr-portal")}>
          🏠 Dashboard
        </button>
        <button>👥 Employees</button>
        <button onClick={() => (window.location.href = "/recruiter-dashboard")}>
          🎯 Recruitment
        </button>
        <button className="active">📄 Create Offer</button>
        <button onClick={() => (window.location.href = "/hr-offer-letters")}>
          📁 Offer Letters
        </button>
        <button>📂 Documents</button>
        <button>📊 Reports</button>
        <button>⚙ Settings</button>

        <div className="offer-help">
          <b>Need Help?</b>
          <p>Contact HR support</p>
          <span>careers@vatsenix.com</span>
        </div>
      </aside>

      <section className="offer-workspace">
        <section className="offer-form-card">
          <h1>Create Offer Letter</h1>
          <p>
            Fill candidate information, edit salary breakup, preview PDF and
            send offer letter.
          </p>

          <h2 className="form-section-title">Candidate Details</h2>

          <div className="offer-form-grid">
            <label>
              Candidate Name *
              <input
                name="candidateName"
                value={form.candidateName}
                onChange={updateForm}
              />
            </label>

            <label>
              Candidate Email *
              <input
                name="candidateEmail"
                value={form.candidateEmail}
                onChange={updateForm}
              />
            </label>

            <label>
              Candidate Phone
              <input
                name="candidatePhone"
                value={form.candidatePhone}
                onChange={updateForm}
              />
            </label>

            <label className="full">
              Candidate Address
              <textarea
                name="candidateAddress"
                value={form.candidateAddress}
                onChange={updateForm}
              />
            </label>

            <label>
              Designation *
              <input
                name="designation"
                value={form.designation}
                onChange={updateForm}
              />
            </label>

            <label>
              Department
              <input
                name="department"
                value={form.department}
                onChange={updateForm}
              />
            </label>

            <label>
              Employment Type
              <select
                name="employmentType"
                value={form.employmentType}
                onChange={updateForm}
              >
                <option>Full-Time</option>
                <option>Internship</option>
                <option>Contract</option>
              </select>
            </label>

            <label>
              Joining Date *
              <input
                type="date"
                name="joiningDate"
                value={form.joiningDate}
                onChange={updateForm}
              />
            </label>

            <label>
              Work Location
              <input
                name="workLocation"
                value={form.workLocation}
                onChange={updateForm}
              />
            </label>

            <label>
              Annual CTC
              <input name="ctc" value={form.ctc} onChange={updateForm} />
            </label>

            <label>
              Reporting Manager
              <input
                name="reportingManager"
                value={form.reportingManager}
                onChange={updateForm}
              />
            </label>

            <label>
              Grade / Level
              <input name="grade" value={form.grade} onChange={updateForm} />
            </label>

            <label>
              Probation
              <input
                name="probation"
                value={form.probation}
                onChange={updateForm}
              />
            </label>

            <label>
              Working Model
              <input
                name="workingModel"
                value={form.workingModel}
                onChange={updateForm}
              />
            </label>

            <label className="full">
              Office Hours
              <input
                name="officeHours"
                value={form.officeHours}
                onChange={updateForm}
              />
            </label>
          </div>

          <div className="salary-header-row">
            <div>
              <h2 className="form-section-title">Editable Salary Breakup</h2>
              <p>
                These values will appear in Annexure A of the generated offer
                letter.
              </p>
            </div>

            <button
              type="button"
              className="calculate-btn"
              onClick={autoCalculateSalary}
            >
              Auto Calculate
            </button>
          </div>

          <div className="salary-breakup-table">
            <div className="salary-table-head">
              <span>Salary Component</span>
              <span>Monthly ₹</span>
              <span>Annual ₹</span>
            </div>

            <SalaryRow
              label="Basic Salary"
              monthlyName="basicMonthly"
              annualName="basicAnnual"
              salary={form.salary}
              updateSalary={updateSalary}
            />

            <SalaryRow
              label="House Rent Allowance"
              monthlyName="hraMonthly"
              annualName="hraAnnual"
              salary={form.salary}
              updateSalary={updateSalary}
            />

            <SalaryRow
              label="Special Allowance"
              monthlyName="specialMonthly"
              annualName="specialAnnual"
              salary={form.salary}
              updateSalary={updateSalary}
            />

            <SalaryRow
              label="Conveyance Allowance"
              monthlyName="conveyanceMonthly"
              annualName="conveyanceAnnual"
              salary={form.salary}
              updateSalary={updateSalary}
            />

            <SalaryRow
              label="Internet / Communication"
              monthlyName="internetMonthly"
              annualName="internetAnnual"
              salary={form.salary}
              updateSalary={updateSalary}
            />

            <SalaryRow
              label="Performance Allowance"
              monthlyName="performanceMonthly"
              annualName="performanceAnnual"
              salary={form.salary}
              updateSalary={updateSalary}
            />

            <SalaryRow
              label="Gross Salary"
              monthlyName="grossMonthly"
              annualName="grossAnnual"
              salary={form.salary}
              updateSalary={updateSalary}
            />

            <SalaryRow
              label="Employer PF"
              monthlyName="pfMonthly"
              annualName="pfAnnual"
              salary={form.salary}
              updateSalary={updateSalary}
            />

            <SalaryRow
              label="Gratuity"
              monthlyName="gratuityMonthly"
              annualName="gratuityAnnual"
              salary={form.salary}
              updateSalary={updateSalary}
            />

            <SalaryRow
              label="Medical Insurance"
              monthlyName="medicalMonthly"
              annualName="medicalAnnual"
              salary={form.salary}
              updateSalary={updateSalary}
            />

            <SalaryRow
              label="Annual Performance Bonus"
              monthlyName="bonusMonthly"
              annualName="bonusAnnual"
              salary={form.salary}
              updateSalary={updateSalary}
            />

            <div className="salary-total-row">
              <b>Total Annual CTC</b>
              <span></span>
              <input
                name="totalAnnualCtc"
                value={form.salary.totalAnnualCtc}
                onChange={updateSalary}
              />
            </div>
          </div>

          <div className="offer-buttons">
            <button
              className="outline"
              type="button"
              onClick={() => alert("Draft saved locally")}
            >
              💾 Save Draft
            </button>

            <button
              className="outline"
              type="button"
              onClick={() => createOffer(false)}
              disabled={loading}
            >
              👁 Preview PDF
            </button>

            <button
              className="primary"
              type="button"
              onClick={() => createOffer(true)}
              disabled={loading}
            >
              {loading ? "Generating..." : "✈ Generate & Send Offer"}
            </button>
          </div>
        </section>

        <section className="offer-preview-card">
          <div className="preview-head">
            <div>
              <h2>Live Offer Letter Preview</h2>
              <p>This is how the generated PDF will look.</p>
            </div>

            {pdfUrl && (
              <div>
                <button onClick={() => window.open(pdfUrl, "_blank")}>
                  ⬇ Download PDF
                </button>
                <button onClick={() => window.open(pdfUrl, "_blank")}>
                  ⛶ Full Screen
                </button>
              </div>
            )}
          </div>

          <div className="pdf-preview-box">
            {pdfUrl ? (
              <iframe src={pdfUrl} title="Offer Letter PDF" />
            ) : (
              <div className="empty-preview">
                <h2>PDF Preview Not Generated Yet</h2>
                <p>
                  Click “Preview PDF” to generate the corporate offer letter
                  format.
                </p>
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function SalaryRow({ label, monthlyName, annualName, salary, updateSalary }) {
  return (
    <div className="salary-row">
      <b>{label}</b>

      <input
        name={monthlyName}
        value={salary[monthlyName]}
        onChange={updateSalary}
      />

      <input
        name={annualName}
        value={salary[annualName]}
        onChange={updateSalary}
      />
    </div>
  );
}

export default HrOfferLetter;