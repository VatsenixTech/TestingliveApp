const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

async function generatePremiumOfferPdf(offer) {
  const folder = path.join(process.cwd(), "generated-offers");
  if (!fs.existsSync(folder)) fs.mkdirSync(folder);

  const safeName = (offer.candidateName || "Candidate").replace(/[^a-z0-9]/gi, "_");
  const fileName = `Offer_Letter_${safeName}_${Date.now()}.pdf`;
  const outputPath = path.join(folder, fileName);

  const logoPath = path.join(process.cwd(), "assets", "vatsenix-logo.png");
  const companyNamePath = path.join(process.cwd(), "assets", "vatsenix-company-name.png");
  const signaturePath = path.join(process.cwd(), "assets", "venkatesh-signature.png");

  const logoBase64 = fs.existsSync(logoPath)
    ? `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`
    : "";

  const companyNameBase64 = fs.existsSync(companyNamePath)
    ? `data:image/png;base64,${fs.readFileSync(companyNamePath).toString("base64")}`
    : "";

  const signatureBase64 = fs.existsSync(signaturePath)
    ? `data:image/png;base64,${fs.readFileSync(signaturePath).toString("base64")}`
    : "";

  const issueDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const data = {
    offerRefNo: offer.offerRefNo || "VSPL/HR/OL/2026/00125",
    issueDate,
    candidateName: offer.candidateName || "Candidate Name",
    candidateAddress: (
      offer.candidateAddress ||
      "Candidate Address Line 1\nCandidate Address Line 2\nCity – Pincode"
    ).replace(/\n/g, "<br/>"),
    designation: offer.designation || "Full Stack Developer",
    department: offer.department || "Engineering",
    reportingManager: offer.reportingManager || "Engineering Manager",
    employmentType: offer.employmentType || "Full-Time",
    grade: offer.grade || "L1",
    workLocation: offer.workLocation || "Bengaluru, Karnataka",
    joiningDate: offer.joiningDate || "DD/MM/YYYY",
    probation: offer.probation || "6 Months",
    workingModel: offer.workingModel || "Hybrid / WFO / Remote",
    officeHours: offer.officeHours || "Mon–Fri (9:30 AM – 6:30 PM)",
    ctc: offer.ctc || "__________",
    salary: offer.salary || {},
  };

  const header = `
    <div class="doc-header">
      <div class="doc-logo">
        ${logoBase64 ? `<img src="${logoBase64}" />` : ""}
      </div>
      <div class="doc-company-img">
        ${companyNameBase64 ? `<img src="${companyNameBase64}" />` : ""}
      </div>
    </div>
    <div class="brand-line"><span></span><b></b></div>
  `;

  const footer = (pageNo) => `
    <div class="doc-footer">
      <div>
        <strong>REGISTERED OFFICE</strong>
        #1189, 2nd Floor, 18th Cross,<br/>
        Sector 3, HSR Layout,<br/>
        Bengaluru – 560102,<br/>
        Karnataka, India
      </div>
      <div><strong>EMAIL</strong>careers@vatsenix.com</div>
      <div><strong>WEBSITE</strong>www.vatsenix.com</div>
      <div><strong>PHONE</strong>+91 80 4162 7001</div>
      <small>Page ${pageNo} of 11</small>
    </div>
  `;

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
  color: #101827;
  background: #fff;
}

.page {
  width: 794px;
  height: 1123px;
  padding: 28px 42px 115px;
  margin: 0 auto;
  position: relative;
  page-break-after: always;
  overflow: hidden;
  background: #fff;
}

.page:last-child { page-break-after: auto; }

.doc-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.doc-logo img {
  width: 82px;
  height: auto;
  object-fit: contain;
}

.doc-company-img {
  text-align: right;
  padding-top: 4px;
}

.doc-company-img img {
  width: 255px;
  height: auto;
  object-fit: contain;
}

.brand-line {
  display: flex;
  margin: 18px 0 24px;
}

.brand-line span {
  height: 4px;
  background: #073b8e;
  flex: 3;
}

.brand-line b {
  height: 4px;
  background: #f15a24;
  flex: 1;
}

.doc-footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 92px;
  background: #073b8e;
  color: white;
  padding: 15px 28px 20px;
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1fr;
  gap: 18px;
  font-size: 9.5px;
  line-height: 1.4;
  border-top: 4px solid #f15a24;
}

.doc-footer strong {
  display: block;
  font-size: 10.5px;
  margin-bottom: 5px;
}

.doc-footer small {
  position: absolute;
  right: 28px;
  bottom: 5px;
  font-size: 9.5px;
  opacity: 0.9;
}

.ref-row {
  display: flex;
  justify-content: space-between;
  margin: 8px 0 24px;
  font-size: 11.5px;
}

.blue { color: #073b8e; }

.to-block {
  font-size: 12px;
  line-height: 1.5;
}

.main-title {
  text-align: center;
  color: #073b8e;
  font-size: 18px;
  margin: 30px 0 26px;
  letter-spacing: 0.5px;
  font-weight: 900;
}

.main-title::after {
  content: "";
  display: block;
  width: 330px;
  height: 3px;
  margin: 12px auto 0;
  background: linear-gradient(to right, #073b8e 42%, #f15a24 42%, #f15a24 58%, #073b8e 58%);
}

h1.page-heading {
  font-size: 18px;
  color: #073b8e;
  margin: 18px 0 14px;
  text-transform: uppercase;
  line-height: 1.22;
}

h2 {
  color: #073b8e;
  font-size: 16px;
  margin: 16px 0 8px;
}

h3 {
  color: #073b8e;
  font-size: 13px;
  margin: 13px 0 6px;
}

p, li {
  font-size: 12px;
  line-height: 1.38;
}

.letter-body p {
  font-size: 12px;
  line-height: 1.48;
  margin: 0 0 12px;
}

.sign {
  margin-top: 18px;
  font-size: 12px;
  line-height: 1.35;
}

.sign b { color: #073b8e; }

.digital-sign {
  width: 125px;
  height: auto;
  display: block;
  margin: 8px 0 2px;
  object-fit: contain;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 14px 0 18px;
  page-break-inside: avoid;
  break-inside: avoid;
}

tr, td, th {
  page-break-inside: avoid;
  break-inside: avoid;
}

th {
  background: #073b8e;
  color: white;
  text-align: left;
  font-size: 12px;
  padding: 7px 9px;
  border: 1px solid #cfd8e3;
}

td {
  border: 1px solid #cfd8e3;
  padding: 7px 9px;
  font-size: 11.5px;
  vertical-align: top;
}

td.label {
  background: #eaf2ff;
  font-weight: 800;
  width: 38%;
}

.salary-table td,
.salary-table th {
  font-size: 10.8px;
  padding: 6px 8px;
}

.total-row td {
  background: #eef4ff;
}

ul {
  padding-left: 18px;
  margin: 8px 0 14px;
}

.ack {
  margin-top: 14px;
  font-weight: 700;
}
</style>
</head>

<body>

<section class="page">
  ${header}

  <div class="ref-row">
    <div>Offer Reference No.: <b class="blue">${data.offerRefNo}</b></div>
    <div>Date: <b class="blue">${data.issueDate}</b></div>
  </div>

  <div class="to-block">
    To,<br/>
    <b class="blue">Mr./Ms. ${data.candidateName}</b><br/>
    ${data.candidateAddress}
  </div>

  <h1 class="main-title">LETTER OF OFFER AND APPOINTMENT</h1>

  <div class="letter-body">
    <p>Dear <b class="blue">Mr./Ms. ${data.candidateName}</b>,</p>
    <p>It gives us immense pleasure to welcome you to <b>Vatsenix Software Private Limited</b>.</p>
    <p>After carefully evaluating your qualifications, technical expertise, professional experience, and overall performance during our selection process, we are delighted to offer you the position of <b class="blue">${data.designation}</b> with our organization.</p>
    <p>Your demonstrated skills, commitment to excellence, and passion for innovation have impressed our hiring team. We believe your capabilities will contribute significantly to our mission of building world-class software products and delivering exceptional value to our customers.</p>
    <p>At Vatsenix, we are committed to creating technology that transforms industries through Artificial Intelligence, Cloud Computing, Enterprise Software, Data Engineering, Recruitment Technology, and Digital Innovation. Our culture encourages continuous learning, ownership, collaboration, integrity, and customer success.</p>
    <p>Your proposed date of joining is <b class="blue">${data.joiningDate}</b>, and your initial place of posting will be <b>${data.workLocation}</b>, unless otherwise communicated by the Company.</p>
    <p>This offer is subject to successful completion of document verification, background verification and other joining formalities.</p>
    <p>We warmly welcome you to the Vatsenix family and wish you a long, successful, and fulfilling career with us.</p>
  </div>

  <div class="sign">
    Warm Regards,<br/>
    ${signatureBase64 ? `<img class="digital-sign" src="${signatureBase64}" />` : `<br/><br/>`}
    <b>Venkatesh A</b><br/>
    Founder & Chief Executive Officer<br/>
    <b>Vatsenix Software Private Limited</b>
  </div>

  ${footer(1)}
</section>

<section class="page">
  ${header}

  <h1 class="page-heading">Employment Details & Key Appointment Information</h1>
  <p>Welcome to <b>Vatsenix Software Private Limited</b>. This page summarizes the key details of your appointment and forms an integral part of your employment agreement.</p>

  <table>
    <tr><th>Particular</th><th>Details</th></tr>
    <tr><td class="label">Employee Name</td><td>${data.candidateName}</td></tr>
    <tr><td class="label">Employee ID</td><td>To be allotted on joining</td></tr>
    <tr><td class="label">Designation</td><td>${data.designation}</td></tr>
    <tr><td class="label">Department</td><td>${data.department}</td></tr>
    <tr><td class="label">Reporting Manager</td><td>${data.reportingManager}</td></tr>
    <tr><td class="label">Employment Type</td><td>${data.employmentType}</td></tr>
    <tr><td class="label">Grade / Level</td><td>${data.grade}</td></tr>
    <tr><td class="label">Work Location</td><td>${data.workLocation}</td></tr>
    <tr><td class="label">Joining Date</td><td>${data.joiningDate}</td></tr>
    <tr><td class="label">Probation</td><td>${data.probation}</td></tr>
    <tr><td class="label">Working Model</td><td>${data.workingModel}</td></tr>
    <tr><td class="label">Office Hours</td><td>${data.officeHours}</td></tr>
    <tr><td class="label">Annual CTC</td><td>₹ ${data.ctc}</td></tr>
  </table>

  <h2>Your Role at Vatsenix</h2>
  <ul>
    <li>Build scalable software products.</li>
    <li>Collaborate with cross-functional teams.</li>
    <li>Maintain high coding and quality standards.</li>
    <li>Protect company and customer information.</li>
    <li>Continuously learn emerging technologies.</li>
  </ul>

  <h2>Our Core Values</h2>
  <p><b>Innovation • Integrity • Customer Success • Ownership • Continuous Learning</b></p>

  <p><b><i>Important Note:</i></b> This page provides a summary of your employment details. Detailed terms and conditions are covered in the following annexures.</p>

  ${footer(2)}
</section>

<section class="page">
  ${header}
  <h1 class="page-heading">Terms of Employment, Professional Responsibilities & Code of Conduct</h1>
  <h3>1. Professional Responsibilities</h3>
  <p>As an employee of Vatsenix Software Private Limited, you are expected to perform your duties with professionalism, accountability, and dedication while contributing to the Company's vision and business objectives.</p>
  <ul>
    <li>Perform assigned responsibilities with honesty and integrity.</li>
    <li>Deliver quality work within agreed timelines.</li>
    <li>Collaborate effectively with colleagues and clients.</li>
    <li>Follow Company policies and procedures.</li>
    <li>Take ownership of assigned tasks.</li>
    <li>Continuously improve technical and professional skills.</li>
    <li>Represent the Company positively in all professional interactions.</li>
  </ul>
  <h3>2. Standards of Professional Conduct</h3>
  <p>Employees shall maintain the highest standards of conduct by respecting colleagues, promoting teamwork, maintaining discipline, complying with applicable laws, and supporting a safe, inclusive, and harassment-free workplace.</p>
  <h3>3. Ethics & Integrity</h3>
  <p>Integrity is a core value of Vatsenix Software. Employees shall act honestly, avoid conflicts of interest, never engage in bribery or unethical business practices, and immediately report fraud, unethical behaviour, or security incidents.</p>
  <h3>4. Confidentiality & Information Security</h3>
  <p>Employees may have access to confidential information including source code, AI models, customer information, business strategies, financial information, and technical documentation. Such information shall remain the exclusive property of the Company and shall not be disclosed without authorization.</p>
  <p class="ack">Employee Acknowledgement: By accepting this Offer Letter, you acknowledge that you have read, understood, and agree to comply with Company policies.</p>
  ${footer(3)}
</section>

<section class="page">
  ${header}
  <h1 class="page-heading">Employment Policies, Workplace Guidelines & Performance Expectations</h1>
  <h3>1. Working Hours</h3>
  <p>The standard working schedule is 45 hours per week, generally Monday to Friday, 9:30 AM to 6:30 PM. Depending on project requirements, employees may be required to work flexible hours, rotational shifts, or hybrid schedules.</p>
  <h3>2. Attendance & Leave Management</h3>
  <p>Employees shall maintain regular attendance and follow the Company's leave approval process. Leave requests should be submitted through the approved system and require reporting manager approval except in emergencies.</p>
  <h3>3. Hybrid, Remote & Work From Office Policy</h3>
  <p>The Company may assign employees to Work From Office, Hybrid, or Remote working models based on business requirements. Employees are expected to maintain productivity, professionalism, confidentiality, and communication standards irrespective of work location.</p>
  <h3>4. Performance Expectations</h3>
  <p>Performance is evaluated based on quality of work, productivity, technical competency, innovation, customer satisfaction, collaboration, ownership, learning, and policy compliance.</p>
  <h3>5. Company Assets & Resources</h3>
  <p>The Company may provide laptops, official email, software licenses, ID cards, VPN access, cloud resources, and development tools. These assets remain Company property and must be returned upon separation.</p>
  <p class="ack">Employee Commitment: By joining Vatsenix Software Private Limited, you agree to uphold the Company's values and follow workplace policies.</p>
  ${footer(4)}
</section>

<section class="page">
  ${header}
  <h1 class="page-heading">Information Security, Confidentiality & Intellectual Property</h1>
  <h3>1. Information Security</h3>
  <p>At Vatsenix Software Private Limited, protecting information assets is a shared responsibility. Employees shall comply with all Information Security Policies, Cyber Security Standards, and applicable legal requirements.</p>
  <h3>2. Confidential Information</h3>
  <p>Employees may have access to confidential information including source code, AI models, product roadmaps, customer information, recruitment data, databases, technical documentation, financial information, research activities, and internal business processes.</p>
  <h3>3. Non-Disclosure Obligation</h3>
  <p>Employees shall not disclose confidential information, copy or distribute Company data without authorization, share passwords or system credentials, or use Company information for personal benefit. These obligations continue even after employment.</p>
  <h3>4. Intellectual Property Rights</h3>
  <p>All software, source code, web applications, APIs, databases, AI models, machine learning algorithms, documentation, inventions, product designs, and business processes created during employment shall remain the exclusive property of Vatsenix Software Private Limited.</p>
  <h3>5. Data Privacy & Protection</h3>
  <p>Employees shall process personal and business information only for legitimate business purposes and in accordance with Company policies and applicable data protection laws.</p>
  ${footer(5)}
</section>

<section class="page">
  ${header}
  <h1 class="page-heading">Employee Benefits, Compensation & Career Development</h1>
  <h3>1. Compensation & Salary Administration</h3>
  <p>Your compensation has been designed to be competitive and aligned with your role, qualifications, experience, and performance. Salary shall normally be credited directly to your designated bank account on the Company's scheduled payroll date, subject to statutory deductions.</p>
  <h3>2. Employee Benefits</h3>
  <p>Subject to eligibility and Company policies, employees may receive benefits including Health Insurance, Group Personal Accident Insurance, Provident Fund, ESI, Gratuity, Paid Annual Leave, Sick Leave, Casual Leave, Public Holidays, Employee Referral Rewards, and Performance Recognition Programs.</p>
  <h3>3. Performance Bonus & Rewards</h3>
  <p>The Company recognizes exceptional performance through Annual Performance Bonuses, Spot Awards, Innovation Awards, Customer Appreciation Awards, Team Excellence Awards, Leadership Recognition, and other performance-based incentives.</p>
  <h3>4. Learning & Professional Development</h3>
  <p>Employees are encouraged to participate in technical training, leadership development programs, AI and Machine Learning workshops, Cloud certifications, Data Engineering programs, Product Engineering sessions, soft skills training, and cybersecurity awareness sessions.</p>
  <h3>5. Career Growth Opportunities</h3>
  <p>Career progression is based on performance, technical expertise, leadership capability, innovation, customer feedback, professional certifications, business contribution, and organizational requirements.</p>
  ${footer(6)}
</section>

<section class="page">
  ${header}

  <h1 class="page-heading">Annexure – A<br/>Compensation Structure & Annual Cost to Company (CTC)</h1>

  <p>At <b>Vatsenix Software Private Limited</b>, we are committed to providing a competitive and transparent compensation package. The salary structure below outlines the annual Cost to Company (CTC), including fixed pay, statutory benefits, and performance-based rewards.</p>

  <table>
    <tr><th>Particular</th><th>Details</th></tr>
    <tr><td class="label">Employee Name</td><td>${data.candidateName}</td></tr>
    <tr><td class="label">Employee ID</td><td>To be allotted on joining</td></tr>
    <tr><td class="label">Designation</td><td>${data.designation}</td></tr>
    <tr><td class="label">Department</td><td>${data.department}</td></tr>
    <tr><td class="label">Date of Joining</td><td>${data.joiningDate}</td></tr>
    <tr><td class="label">Employment Type</td><td>${data.employmentType}</td></tr>
    <tr><td class="label">Payroll Frequency</td><td>Monthly</td></tr>
    <tr><td class="label">Work Location</td><td>${data.workLocation}</td></tr>
    <tr><td class="label">Annual CTC</td><td>₹ ${data.salary?.totalAnnualCtc || data.ctc || "-"}</td></tr>
  </table>

  <h2>Annual Salary Structure</h2>

  <table class="salary-table">
    <tr>
      <th>Salary Component</th>
      <th>Monthly (₹)</th>
      <th>Annual (₹)</th>
    </tr>
    <tr><td>Basic Salary</td><td>${data.salary?.basicMonthly || "-"}</td><td>${data.salary?.basicAnnual || "-"}</td></tr>
    <tr><td>House Rent Allowance (HRA)</td><td>${data.salary?.hraMonthly || "-"}</td><td>${data.salary?.hraAnnual || "-"}</td></tr>
    <tr><td>Special Allowance</td><td>${data.salary?.specialMonthly || "-"}</td><td>${data.salary?.specialAnnual || "-"}</td></tr>
    <tr><td>Conveyance Allowance</td><td>${data.salary?.conveyanceMonthly || "-"}</td><td>${data.salary?.conveyanceAnnual || "-"}</td></tr>
    <tr><td>Internet / Communication Allowance</td><td>${data.salary?.internetMonthly || "-"}</td><td>${data.salary?.internetAnnual || "-"}</td></tr>
    <tr><td>Performance Allowance</td><td>${data.salary?.performanceMonthly || "-"}</td><td>${data.salary?.performanceAnnual || "-"}</td></tr>
    <tr><td>Gross Salary</td><td>${data.salary?.grossMonthly || "-"}</td><td>${data.salary?.grossAnnual || "-"}</td></tr>
    <tr><td>Employer PF Contribution</td><td>${data.salary?.pfMonthly || "-"}</td><td>${data.salary?.pfAnnual || "-"}</td></tr>
    <tr><td>Gratuity Provision</td><td>${data.salary?.gratuityMonthly || "-"}</td><td>${data.salary?.gratuityAnnual || "-"}</td></tr>
    <tr><td>Medical Insurance</td><td>${data.salary?.medicalMonthly || "-"}</td><td>${data.salary?.medicalAnnual || "-"}</td></tr>
    <tr><td>Annual Performance Bonus</td><td>${data.salary?.bonusMonthly || "-"}</td><td>${data.salary?.bonusAnnual || "-"}</td></tr>
    <tr class="total-row">
      <td><b>Total Annual CTC</b></td>
      <td></td>
      <td><b>₹ ${data.salary?.totalAnnualCtc || data.ctc || "-"}</b></td>
    </tr>
  </table>

  ${footer(7)}
</section>

<section class="page">
  ${header}
  <h1 class="page-heading">Annexure – B<br/>Pre-Joining Formalities & Documents Required for Joining</h1>
  <p>Welcome to Vatsenix Software Private Limited. To ensure a smooth onboarding experience, please complete the following pre-joining formalities and submit all required documents on or before your joining date.</p>
  <h3>1. Identity Verification Documents</h3>
  <ul><li>Aadhaar Card</li><li>PAN Card</li><li>Passport if available</li><li>Voter ID / Driving Licence</li><li>Recent passport size photographs</li></ul>
  <h3>2. Educational Documents</h3>
  <ul><li>Class X and XII certificates and mark sheets</li><li>Bachelor's degree certificates and mark sheets</li><li>Technical and professional certifications</li></ul>
  <h3>3. Employment Documents</h3>
  <ul><li>Appointment letters</li><li>Experience certificates</li><li>Relieving letters</li><li>Last three months salary slips</li><li>UAN / PF details where applicable</li></ul>
  <h3>4. Banking Information</h3>
  <ul><li>Cancelled cheque</li><li>Bank passbook front page</li><li>Account number and IFSC code</li></ul>
  <p class="ack">Employee Signature: ___________________________</p>
  <p class="ack">Date: ___________________________</p>
  ${footer(8)}
</section>

<section class="page">
  ${header}
  <h1 class="page-heading">Employee Declaration, Acceptance of Offer & Authorization</h1>
  <h3>Employee Declaration</h3>
  <p>I, ______________________________, hereby confirm that I have carefully read, understood, and voluntarily accepted all the terms and conditions contained in this Offer Letter, including all Annexures and Company Policies.</p>
  <h3>Acceptance of Employment</h3>
  <p>By signing this document, I agree to perform my duties with honesty, professionalism, and integrity; comply with all Company policies; maintain confidentiality; protect Company assets and intellectual property; follow Information Security and Data Privacy requirements.</p>
  <h3>Consent for Background Verification</h3>
  <p>I authorize Vatsenix Software Private Limited or its authorized agency to conduct background verification, educational verification, employment verification, identity verification, and reference checks.</p>
  <h2>Acceptance & Signature</h2>
  <table>
    <tr><td class="label">Employee Name</td><td>________________________________________</td></tr>
    <tr><td class="label">Designation</td><td>________________________________________</td></tr>
    <tr><td class="label">Signature</td><td>________________________________________</td></tr>
    <tr><td class="label">Date</td><td>________________________________________</td></tr>
    <tr><td class="label">Place</td><td>________________________________________</td></tr>
  </table>
  <h2>For Official Use Only</h2>
  <table>
    <tr><th>Particular</th><th>Details</th></tr>
    <tr><td class="label">Offer Accepted</td><td>Yes / No</td></tr>
    <tr><td class="label">HR Representative</td><td>____________________</td></tr>
    <tr><td class="label">HR Signature</td><td>____________________</td></tr>
    <tr><td class="label">Date</td><td>____________________</td></tr>
    <tr><td class="label">Employee ID</td><td>____________________</td></tr>
  </table>
  ${footer(9)}
</section>

<section class="page">
  ${header}
  <h1 class="page-heading">Joining Checklist & HR Contact Information</h1>
  <h2>Joining Day Checklist</h2>
  <ul>
    <li>Carry original identity, address, education and employment documents for verification.</li>
    <li>Submit signed offer letter and annexures.</li>
    <li>Complete HR onboarding forms and bank details form.</li>
    <li>Collect employee ID, official email access, and required IT assets.</li>
    <li>Attend orientation, policy briefing, and team introduction session.</li>
  </ul>
  <h2>HR Contact Details</h2>
  <table>
    <tr><td class="label">HR Email</td><td>careers@vatsenix.com</td></tr>
    <tr><td class="label">Website</td><td>www.vatsenix.com</td></tr>
    <tr><td class="label">Office Location</td><td>Bengaluru, Karnataka</td></tr>
    <tr><td class="label">Phone</td><td>+91 80 4162 7001</td></tr>
  </table>
  <h2>Important Note</h2>
  <p>The Company reserves the right to revise, modify, or update policies from time to time. Updated policies shall be communicated through official channels and will be applicable to all employees.</p>
  ${footer(10)}
</section>

<section class="page">
  ${header}
  <h1 class="page-heading">Welcome to the Vatsenix Family</h1>
  <h2>A Message from the Founder & Chief Executive Officer</h2>
  <p>Dear Team Member,</p>
  <p>On behalf of everyone at Vatsenix Software Private Limited, I warmly welcome you to our organization. You are becoming part of a team driven by innovation, collaboration, and a shared vision to build technology that creates meaningful impact.</p>
  <p>We encourage you to embrace curiosity, take ownership of your work, pursue continuous learning, and help us deliver world-class software solutions.</p>
  <p>Warm Regards,</p>
  <p><b>Venkatesh A</b><br/>Founder & Chief Executive Officer</p>
  <h2>Our Vision</h2>
  <p>To become a globally trusted technology company that empowers businesses and individuals through innovative software products, intelligent automation, and transformative digital solutions.</p>
  <h2>Our Mission</h2>
  <p>To design, develop, and deliver reliable, secure, and scalable technology solutions while fostering innovation, ethical practices, customer success, and continuous learning.</p>
  <h2>Our Core Values</h2>
  <ul><li>Innovation</li><li>Integrity</li><li>Customer Success</li><li>Excellence</li><li>Collaboration</li><li>Ownership</li><li>Continuous Learning</li></ul>
  <h2>Congratulations & Best Wishes</h2>
  <p>Congratulations on becoming part of Vatsenix Software Private Limited. We look forward to your valuable contributions and wish you every success in your journey with us. Welcome aboard!</p>
  ${footer(11)}
</section>

</body>
</html>
`;

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
  });

  await browser.close();
  return outputPath;
}

module.exports = generatePremiumOfferPdf;