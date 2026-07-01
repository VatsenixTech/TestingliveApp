import "./PremiumTermsPage.css";

const sections = [
  {
    id: "intro",
    title: "1. Introduction",
    icon: "📄",
    body: [
      "Welcome to NoPromptJobs.com, a product of Vatsenix Software Pvt Ltd. These Terms and Conditions govern your access to and use of our website, applications, AI tools, candidate services, recruiter services and related platform features.",
      "By using NoPromptJobs, you agree to follow these Terms. If you do not agree, you must stop using the platform immediately.",
    ],
  },
  {
    id: "eligibility",
    title: "2. Eligibility",
    icon: "👤",
    body: [
      "You must be legally capable of entering into a binding agreement under applicable law.",
      "Candidates, recruiters and employers must provide accurate, truthful and updated information.",
    ],
  },
  {
    id: "account",
    title: "3. Account Responsibility",
    icon: "🔐",
    body: [
      "You are responsible for maintaining the confidentiality of your login credentials.",
      "Vatsenix Software Pvt Ltd is not responsible for loss caused by unauthorized access due to your negligence.",
      "We may suspend or restrict accounts that appear suspicious, fake, abusive or harmful to the platform.",
    ],
  },
  {
    id: "candidate",
    title: "4. Candidate Responsibilities",
    icon: "🧑‍💼",
    list: [
      "Do not upload fake resumes, false experience or misleading information.",
      "Do not use proxy interview methods, fake identities or dishonest representation.",
      "Use AI tools only for learning, preparation and career improvement.",
      "Keep your profile, resume, skills and employment history accurate.",
    ],
  },
  {
    id: "recruiter",
    title: "5. Recruiter Responsibilities",
    icon: "🏢",
    list: [
      "Post only genuine job opportunities.",
      "Use candidate data only for hiring-related purposes.",
      "Do not misuse, sell, scrape or redistribute candidate information.",
      "Do not collect illegal processing fees from candidates.",
    ],
  },
  {
    id: "ai",
    title: "6. AI Tools Usage",
    icon: "🤖",
    body: [
      "AI-generated outputs are provided for assistance, preparation and productivity. They should not be treated as legal, financial, medical or guaranteed career advice.",
      "Users are responsible for reviewing AI-generated content before using it professionally.",
    ],
  },
  {
    id: "payments",
    title: "7. Payments and Subscriptions",
    icon: "💳",
    body: [
      "Paid services, subscriptions or premium tools may be subject to separate pricing, billing and refund rules.",
      "Vatsenix Software Pvt Ltd may modify pricing, plans or features with reasonable notice where required.",
    ],
  },
  {
    id: "rights",
    title: "8. Platform Rights",
    icon: "🛡",
    body: [
      "We may update, improve, restrict, suspend or discontinue any feature for security, legal, operational or business reasons.",
      "We reserve the right to remove content, accounts or job postings that violate these Terms or harm platform trust.",
    ],
  },
  {
    id: "liability",
    title: "9. Limitation of Liability",
    icon: "⚖️",
    body: [
      "NoPromptJobs helps connect candidates and recruiters, but we do not guarantee job offers, hiring outcomes, interview results, salary increases or employment decisions.",
      "To the maximum extent permitted by law, Vatsenix Software Pvt Ltd shall not be liable for indirect, incidental, consequential or business losses arising from platform use.",
    ],
  },
  {
    id: "contact",
    title: "10. Contact",
    icon: "📩",
    body: [
      "For questions about these Terms, contact us at hello@vatsenix.com.",
      "These Terms should be reviewed by a qualified legal professional before publishing.",
    ],
  },
];

function PremiumTermsPage() {
  return (
    <main className="pt-page">
      <nav className="pt-nav">
        <a href="/">
          <img src="/logo.png" alt="NoPromptJobs" />
        </a>

        <div>
          <a href="/jobs">Jobs</a>
          <a href="/companies">Companies</a>
          <a href="/services">Services</a>
          <a href="/contact">Contact</a>
        </div>
      </nav>

      <section className="pt-hero">
        <div>
          <p>Home › Legal › Terms and Conditions</p>
          <h1>Terms and Conditions</h1>
          <span>Effective Date: 01 July 2026</span>
          <p>
            These terms govern your use of NoPromptJobs.com, a product of
            Vatsenix Software Pvt Ltd.
          </p>
        </div>

        <div className="pt-hero-art">📄✅</div>
      </section>

      <section className="pt-layout">
        <aside className="pt-sidebar">
          <h3>On this page</h3>

          {sections.map((s) => (
            <a href={`#${s.id}`} key={s.id}>
              {s.icon} {s.title}
            </a>
          ))}

          <div className="pt-help">
            <b>Need help?</b>
            <p>Have questions about these terms?</p>
            <a href="/contact">Contact support →</a>
          </div>
        </aside>

        <article className="pt-content">
          {sections.map((s) => (
            <section id={s.id} className="pt-section" key={s.id}>
              <div className="pt-icon">{s.icon}</div>

              <div>
                <h2>{s.title}</h2>

                {s.body?.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}

                {s.list && (
                  <ul>
                    {s.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}

          <div className="pt-trust-row">
            <span>🛡 Secure & Trusted Platform</span>
            <span>🔒 Your Data is Protected</span>
            <span>✅ Committed to Transparency</span>
          </div>
        </article>
      </section>
    </main>
  );
}

export default PremiumTermsPage;