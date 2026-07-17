import { useEffect, useMemo, useState } from "react";
import "./BlogPage.css";

const categories = ["All", "Resume", "Interviews", "Job Search", "Career Growth", "AI & Hiring"];

const articles = [
  {
    id: 1,
    category: "Resume",
    title: "How to Create an ATS-Friendly Resume That Gets Seen",
    excerpt: "A practical framework for structuring your resume, choosing keywords and presenting measurable impact.",
    readTime: "8 min read",
    date: "July 15, 2026",
    icon: "▤",
    tone: "blue",
    featured: true,
  },
  {
    id: 2,
    category: "Interviews",
    title: "A Better Way to Answer Technical Interview Questions",
    excerpt: "Learn how to explain your reasoning clearly, handle follow-ups and demonstrate senior-level thinking.",
    readTime: "7 min read",
    date: "July 12, 2026",
    icon: "◉",
    tone: "purple",
  },
  {
    id: 3,
    category: "Job Search",
    title: "How to Identify Genuine Job Opportunities",
    excerpt: "Spot trustworthy employers, evaluate job descriptions and avoid the most common recruitment scams.",
    readTime: "6 min read",
    date: "July 10, 2026",
    icon: "⌕",
    tone: "green",
  },
  {
    id: 4,
    category: "Career Growth",
    title: "Build a Career Roadmap You Can Actually Follow",
    excerpt: "Turn an ambitious career goal into focused skills, milestones and projects you can complete each month.",
    readTime: "9 min read",
    date: "July 8, 2026",
    icon: "◎",
    tone: "orange",
  },
  {
    id: 5,
    category: "AI & Hiring",
    title: "What AI Job Matching Should—and Shouldn’t—Do",
    excerpt: "A transparent look at how responsible matching helps candidates discover relevant roles without replacing human judgment.",
    readTime: "10 min read",
    date: "July 5, 2026",
    icon: "✦",
    tone: "violet",
  },
  {
    id: 6,
    category: "Resume",
    title: "Seven Resume Metrics Recruiters Notice Immediately",
    excerpt: "Replace vague responsibilities with credible results that show scope, ownership and business impact.",
    readTime: "5 min read",
    date: "July 2, 2026",
    icon: "↗",
    tone: "cyan",
  },
];

const goTo = (path) => {
  window.location.href = path;
};

function BlogPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const featured = articles.find((article) => article.featured);

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();
    return articles.filter((article) => {
      const matchesCategory = activeCategory === "All" || article.category === activeCategory;
      const matchesQuery = !query || `${article.title} ${article.excerpt} ${article.category}`.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, search]);

  useEffect(() => {
    document.body.classList.toggle("resource-lock", mobileOpen || Boolean(selectedArticle));
    return () => document.body.classList.remove("resource-lock");
  }, [mobileOpen, selectedArticle]);

  const subscribe = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <main className="resource-page">
      <header className="resource-header">
        <button className="resource-logo" onClick={() => goTo("/")} aria-label="NoPromptJobs home">
          <img src="/logo.png" alt="NoPromptJobs" />
        </button>

        <button
          className="resource-menu-button"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span /><span /><span />
        </button>

        <nav className={mobileOpen ? "resource-nav open" : "resource-nav"}>
          <button onClick={() => goTo("/services")}>Product <span>⌄</span></button>
          <button onClick={() => goTo("/jobs")}>For Candidates <span>⌄</span></button>
          <button onClick={() => goTo("/employer-login")}>For Employers <span>⌄</span></button>
          <button className="active" onClick={() => goTo("/blog")}>Resources</button>
          <button onClick={() => goTo("/about")}>Company</button>
        </nav>

        <div className="resource-header-actions">
          <button className="resource-sign-in" onClick={() => goTo("/candidate-login")}>Sign in</button>
          <button className="resource-primary compact" onClick={() => goTo("/candidate-register")}>Get started <span>→</span></button>
        </div>
      </header>

      <section className="resource-hero resource-container">
        <div className="resource-hero-copy">
          <span className="resource-kicker">✦ CAREER KNOWLEDGE CENTRE</span>
          <h1>Practical ideas for a<br /><strong>career that moves forward.</strong></h1>
          <p>Expert guidance for resumes, interviews, job searching and professional growth—built for the real world of work.</p>

          <label className="resource-search">
            <span>⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search guides, topics and skills..."
            />
            <kbd>⌘ K</kbd>
          </label>

          <div className="resource-popular">
            <span>Popular:</span>
            {categories.slice(1, 5).map((category) => (
              <button key={category} onClick={() => setActiveCategory(category)}>{category}</button>
            ))}
          </div>
        </div>

        <div className="resource-hero-art" aria-hidden="true">
          <div className="resource-orbit orbit-a" />
          <div className="resource-orbit orbit-b" />
          <div className="resource-book"><span>NP</span><b>Career<br />Playbook</b></div>
          <div className="resource-float-card card-one"><span>✓</span><div><b>Resume ready</b><small>ATS score improved</small></div></div>
          <div className="resource-float-card card-two"><span>↗</span><div><b>Career growth</b><small>Weekly insights</small></div></div>
          <i className="resource-spark spark-one">✦</i>
          <i className="resource-spark spark-two">✧</i>
        </div>
      </section>

      <section className="featured-wrap resource-container">
        <article className="featured-article">
          <div className="featured-visual">
            <span className="featured-label">EDITOR'S PICK</span>
            <div className="featured-document"><span>ATS</span><i>✓</i></div>
            <div className="featured-bars"><i /><i /><i /><i /></div>
          </div>
          <div className="featured-content">
            <span className="article-category">{featured.category}</span>
            <h2>{featured.title}</h2>
            <p>{featured.excerpt}</p>
            <div className="article-meta"><span>{featured.date}</span><i /> <span>{featured.readTime}</span></div>
            <button className="resource-primary" onClick={() => setSelectedArticle(featured)}>Read featured guide <span>→</span></button>
          </div>
        </article>
      </section>

      <section className="resource-library resource-container">
        <div className="library-heading">
          <div><span>LATEST RESOURCES</span><h2>Learn, prepare and grow</h2><p>Actionable guidance for every stage of your career.</p></div>
          <div className="library-count">{filteredArticles.length} resources</div>
        </div>

        <div className="category-tabs" role="tablist" aria-label="Resource categories">
          {categories.map((category) => (
            <button
              key={category}
              className={activeCategory === category ? "active" : ""}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {filteredArticles.length ? (
          <div className="article-grid">
            {filteredArticles.map((article) => (
              <article className="resource-card" key={article.id}>
                <div className={`resource-card-art ${article.tone}`}>
                  <span>{article.icon}</span>
                  <i>{article.category}</i>
                </div>
                <div className="resource-card-body">
                  <div className="article-meta"><span>{article.date}</span><i /><span>{article.readTime}</span></div>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                  <button onClick={() => setSelectedArticle(article)}>Read article <span>→</span></button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="resource-empty">
            <span>⌕</span><h3>No matching resources</h3><p>Try a different keyword or category.</p>
            <button onClick={() => { setSearch(""); setActiveCategory("All"); }}>Clear filters</button>
          </div>
        )}
      </section>

      <section className="resource-newsletter resource-container">
        <div className="newsletter-icon">✉</div>
        <div><span>THE CAREER BRIEF</span><h2>Useful career advice. No noise.</h2><p>Get our best guides and product updates delivered twice a month.</p></div>
        {subscribed ? (
          <div className="subscribed-message">✓ You're subscribed</div>
        ) : (
          <form onSubmit={subscribe}>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email" required />
            <button type="submit">Subscribe <span>→</span></button>
          </form>
        )}
      </section>

      <footer className="resource-footer">
        <div className="resource-container">
          <img src="/logo.png" alt="NoPromptJobs" />
          <p>Trusted careers. Verified opportunities.</p>
          <nav><button onClick={() => goTo("/about")}>About</button><button onClick={() => goTo("/how-it-works")}>How it works</button><button onClick={() => goTo("/contact")}>Contact</button><button onClick={() => goTo("/privacy")}>Privacy</button></nav>
          <small>© 2026 NoPromptJobs. A Vatsenix Software product.</small>
        </div>
      </footer>

      {selectedArticle && (
        <div className="article-modal-backdrop" role="presentation" onMouseDown={() => setSelectedArticle(null)}>
          <article className="article-modal" role="dialog" aria-modal="true" aria-labelledby="article-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedArticle(null)} aria-label="Close article">×</button>
            <span className="article-category">{selectedArticle.category}</span>
            <h2 id="article-title">{selectedArticle.title}</h2>
            <div className="article-meta"><span>{selectedArticle.date}</span><i /><span>{selectedArticle.readTime}</span></div>
            <p>{selectedArticle.excerpt}</p>
            <p>This guide is ready to connect to your CMS or article API. Until that content is available, the preview keeps every Read Article interaction functional without sending users to a broken route.</p>
            <button className="resource-primary" onClick={() => setSelectedArticle(null)}>Back to resources</button>
          </article>
        </div>
      )}
    </main>
  );
}

export default BlogPage;