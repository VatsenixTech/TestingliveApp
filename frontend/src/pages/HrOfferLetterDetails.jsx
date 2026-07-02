import { useEffect, useState } from "react";
import axios from "axios";
import "./HrOfferLetterDetails.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function HrOfferLetterDetails() {
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);

  const params = new URLSearchParams(window.location.search);
  const offerId = params.get("id");

  const goTo = (path) => {
    window.location.href = path;
  };

  const loadOffer = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API_URL}/api/hr/offer-letters/${offerId}`);
      setOffer(res.data.offer);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to load offer letter");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (offerId) loadOffer();
  }, [offerId]);

  if (loading) {
    return <div className="offer-loading">Loading offer letter...</div>;
  }

  if (!offer) {
    return <div className="offer-loading">Offer letter not found.</div>;
  }

  const pdfUrl = `${API_URL}/api/hr/offer-letters/${offer._id}/pdf`;

  return (
    <main className="offer-detail-page">
      <aside className="offer-sidebar">
        <div className="offer-brand">
          <img src="/vatsenix-logo.png" alt="Vatsenix" />
          <div>
            <h2>VATSENIX</h2>
            <p>HR Suite</p>
          </div>
        </div>

        <button onClick={() => goTo("/hr-portal")}>🏠 Dashboard</button>
        <button>👤 Me</button>
        <button>👥 My Team</button>
        <button>🕒 Attendance</button>
        <button>🌴 Leave</button>
        <button>💰 Payroll</button>
        <button>🎯 Recruitment</button>
        <button>🚀 Onboarding</button>
        <button className="active">📄 Offer Letters</button>
        <button>📁 Documents</button>
        <button>📊 Reports</button>
        <button>⚙ Settings</button>
      </aside>

      <section className="offer-main">
        <header className="offer-topbar">
          <div className="offer-search">
            🔍 <input placeholder="Search employees, documents..." />
          </div>

          <div className="offer-user">
            🔔 ❔ ⚙
            <div className="user-chip">
              <span>VA</span>
              <div>
                <b>Venkatesh A</b>
                <p>HR Manager</p>
              </div>
            </div>
          </div>
        </header>

        <section className="offer-title-row">
          <div>
            <h1>Offer Letter Details</h1>
            <p>Dashboard &gt; Offer Letters &gt; {offer.offerRefNo}</p>
          </div>

          <div className="offer-actions">
            <button onClick={() => goTo("/hr-offer-letters")}>← Back to List</button>
            <button onClick={() => window.open(pdfUrl, "_blank")}>⬇ Download PDF</button>
            <button
              className="primary"
              onClick={async () => {
                await axios.post(`${API_URL}/api/hr/offer-letters/${offer._id}/resend`);
                alert("Offer email resent successfully");
              }}
            >
              ✈ Resend Email
            </button>
          </div>
        </section>

        <section className="candidate-summary">
          <div className="candidate-left">
            <img src="/profile.png" alt="Candidate" />
            <div>
              <h2>{offer.candidateName}</h2>
              <p>{offer.candidateEmail}</p>
              <p>{offer.phone || "+91 XXXXX XXXXX"}</p>
            </div>
          </div>

          <div className="summary-grid">
            <Info label="Designation" value={offer.designation} />
            <Info label="Department" value={offer.department} />
            <Info label="Joining Date" value={offer.joiningDate} />
            <Info label="Employment Type" value={offer.employmentType} />
            <Info label="Annual CTC" value={offer.ctc} />
            <Info label="Work Location" value={offer.workLocation} />
          </div>

          <div className="status-box">
            <p>Status</p>
            <b>{offer.status}</b>
            <small>Sent On</small>
            <span>{offer.sentAt ? new Date(offer.sentAt).toLocaleString() : "-"}</span>
          </div>
        </section>

        <section className="offer-tabs">
          <button className="active">Offer Letter</button>
          <button>Offer Details</button>
          <button>Approvals</button>
          <button>Emails</button>
          <button>History</button>
        </section>

        <section className="offer-content-grid">
          <div className="pdf-preview-card">
            <div className="pdf-toolbar">
              <span>‹</span>
              <span>1</span>
              <span>2</span>
              <span>›</span>
              <b>100%</b>
              <button onClick={() => window.open(pdfUrl, "_blank")}>Open PDF</button>
            </div>

            <iframe
              src={pdfUrl}
              title="Offer Letter PDF"
              className="offer-pdf-frame"
            />
          </div>

          <aside className="offer-right-panel">
            <div className="side-card">
              <h3>Offer Letter Actions</h3>

              <button onClick={() => window.open(pdfUrl, "_blank")}>
                ⬇ Download PDF
              </button>

              <button onClick={() => window.open(pdfUrl, "_blank")}>
                ⛶ Preview Fullscreen
              </button>

              <button className="danger">🗑 Cancel Offer</button>
            </div>

            <div className="side-card">
              <h3>Email Summary</h3>

              <Info label="To" value={offer.candidateEmail} />
              <Info label="Subject" value={`Offer Letter - ${offer.designation}`} />
              <Info
                label="Sent On"
                value={offer.sentAt ? new Date(offer.sentAt).toLocaleString() : "-"}
              />
              <Info label="Sent By" value="Venkatesh A (HR Manager)" />
              <Info label="Email Status" value={offer.status === "Sent" ? "Delivered" : offer.status} />
            </div>

            <div className="side-card">
              <h3>Attachments</h3>

              <div className="attachment-box">
                📄
                <div>
                  <b>Offer_Letter_{offer.candidateName}.pdf</b>
                  <p>Generated PDF</p>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}

function Info({ label, value }) {
  return (
    <div className="info-item">
      <p>{label}</p>
      <b>{value || "-"}</b>
    </div>
  );
}

export default HrOfferLetterDetails;