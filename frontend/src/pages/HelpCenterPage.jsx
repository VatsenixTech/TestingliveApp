import "./HelpCenterPage.css";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FiBell,
  FiBookOpen,
  FiChevronRight,
  FiClock,
  FiHeadphones,
  FiMail,
  FiMessageCircle,
  FiRefreshCw,
  FiSearch,
  FiSend,
  FiStar,
  FiX,
} from "react-icons/fi";

import { HiOutlineSparkles } from "react-icons/hi2";

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "http://localhost:5000/api";

const fallbackArticles = [
  {
    _id: "local-1",
    slug: "interview-prep",
    title: "How to use AI Interview Prep",
    summary: "Practice interviews, improve answers, and get AI feedback.",
    content:
      "Open Services → AI Interview Prep. Choose your role, start a mock interview, answer questions, and review your AI feedback report.",
  },
  {
    _id: "local-2",
    slug: "resume-studio",
    title: "How to use Resume Studio",
    summary: "Create ATS friendly resumes and improve your resume score.",
    content:
      "Open Services → Resume Studio. Upload or create your resume, check ATS score, and apply AI suggestions.",
  },
  {
    _id: "local-3",
    slug: "applications",
    title: "How to track applications",
    summary: "Track your applications and career activity.",
    content:
      "Open Services to access application tracking, job tools, alerts, and premium career features.",
  },
  {
    _id: "local-4",
    slug: "jobs",
    title: "How to search jobs",
    summary: "Search jobs by title, company, location, skill, or salary.",
    content:
      "Go to Jobs page, use filters, search keywords, save jobs, and apply directly.",
  },
  {
    _id: "local-5",
    slug: "premium",
    title: "Premium features",
    summary:
      "Access Resume Studio, AI Interview Prep, Skill Assessment, and Salary Predictor.",
    content:
      "Open Services page to access all premium career tools in one place.",
  },
];

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("token") || localStorage.getItem("authToken");

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    credentials: "include",
    body: options.body,
  });

  const data = await response.json().catch(() => ({
    success: false,
    message: "Backend returned invalid response",
  }));

  if (!response.ok) {
    throw new Error(
      data.message || data.error || `Request failed (${response.status})`
    );
  }

  return data;
}

function getSavedUser() {
  try {
    const savedUser =
      localStorage.getItem("user") || localStorage.getItem("candidate");

    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
}

function HelpCenterPage() {
  const navigate = useCallback((path) => {
    window.location.href = path;
  }, []);

  const chatBottomRef = useRef(null);

  const [user, setUser] = useState(() => getSavedUser());
  const [categories, setCategories] = useState([]);
  const [popularArticles, setPopularArticles] = useState([]);
  const [quickGuides, setQuickGuides] = useState([]);
  const [systemStatus, setSystemStatus] = useState([]);

  const [search, setSearch] = useState("");
  const [articles, setArticles] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articleLoading, setArticleLoading] = useState(false);

  const [pageLoading, setPageLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState("");

  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your NoPromptJobs AI support assistant. How can I help you today?",
    },
  ]);

  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState("");

  const [ticket, setTicket] = useState({
    subject: "",
    categoryId: "",
    message: "",
  });

  const candidateId =
    user?.candidateId || user?._id || user?.id || getSavedUser()?._id || "";

  const goToDashboard = () => {
    if (candidateId) {
      navigate(`/dashboard/${candidateId}`);
      return;
    }

    navigate("/candidate-login");
  };

  const handleHeaderNavigation = (destination) => {
    if (destination === "dashboard") {
      goToDashboard();
      return;
    }

    if (destination === "jobs") {
      navigate("/jobs");
      return;
    }

    navigate("/services");
  };

  useEffect(() => {
    const openChat = () => setChatOpen(true);

    window.addEventListener("open-help-chat", openChat);

    const params = new URLSearchParams(window.location.search);
    if (params.get("openChat") === "true") {
      setChatOpen(true);
    }

    return () => {
      window.removeEventListener("open-help-chat", openChat);
    };
  }, []);

  const loadHelpCenter = useCallback(async () => {
    setPageLoading(true);
    setError("");

    try {
      const results = await Promise.allSettled([
        apiRequest("/auth/me"),
        apiRequest("/help/categories"),
        apiRequest("/help/articles/popular"),
        apiRequest("/help/guides"),
        apiRequest("/help/status"),
      ]);

      if (results[0].status === "fulfilled") {
        const authUser = results[0].value.user || results[0].value;
        setUser(authUser);

        try {
          localStorage.setItem("user", JSON.stringify(authUser));
        } catch {}
      }

      if (results[1].status === "fulfilled") {
        setCategories(results[1].value.categories || []);
      }

      if (results[2].status === "fulfilled") {
        const items = results[2].value.articles || [];
        setPopularArticles(items.length ? items : fallbackArticles.slice(0, 4));
      } else {
        setPopularArticles(fallbackArticles.slice(0, 4));
      }

      if (results[3].status === "fulfilled") {
        const items = results[3].value.guides || [];
        setQuickGuides(items.length ? items : fallbackArticles.slice(0, 3));
      } else {
        setQuickGuides(fallbackArticles.slice(0, 3));
      }

      if (results[4].status === "fulfilled") {
        setSystemStatus(results[4].value.services || []);
      }
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHelpCenter();
  }, [loadHelpCenter]);

  useEffect(() => {
    if (!chatOpen) return;

    chatBottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chatOpen, messages, chatLoading]);

  const searchArticles = async (query = search) => {
    const q = query.trim().toLowerCase();

    setSearchLoading(true);
    setHasSearched(true);
    setError("");

    try {
      const data = await apiRequest(
        `/help/articles/search?q=${encodeURIComponent(query.trim())}`
      );

      const backendArticles = data.articles || [];

      if (backendArticles.length > 0) {
        setArticles(backendArticles);
        return;
      }

      const localResults = fallbackArticles.filter((article) => {
        return (
          article.title.toLowerCase().includes(q) ||
          article.summary.toLowerCase().includes(q) ||
          article.content.toLowerCase().includes(q)
        );
      });

      setArticles(q ? localResults : fallbackArticles);
    } catch {
      const localResults = fallbackArticles.filter((article) => {
        return (
          article.title.toLowerCase().includes(q) ||
          article.summary.toLowerCase().includes(q) ||
          article.content.toLowerCase().includes(q)
        );
      });

      setArticles(q ? localResults : fallbackArticles);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    searchArticles(search);
  };

  const filterByCategory = async (category) => {
    if (!category?.slug) return;

    setSearchLoading(true);
    setHasSearched(true);
    setError("");

    try {
      const data = await apiRequest(
        `/help/articles/category/${encodeURIComponent(category.slug)}`
      );

      const backendArticles = data.articles || [];
      setArticles(backendArticles.length ? backendArticles : fallbackArticles);

      requestAnimationFrame(() => {
        document.getElementById("help-results")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    } catch {
      setArticles(fallbackArticles);
    } finally {
      setSearchLoading(false);
    }
  };

  const openArticle = async (article) => {
    if (!article) return;

    if (article.content) {
      setSelectedArticle(article);
      return;
    }

    if (!article.slug) return;

    setArticleLoading(true);
    setError("");

    try {
      const data = await apiRequest(
        `/help/articles/${encodeURIComponent(article.slug)}`
      );

      setSelectedArticle(data.article || article);
    } catch {
      setSelectedArticle(article);
    } finally {
      setArticleLoading(false);
    }
  };

  const refreshStatus = async () => {
    setStatusLoading(true);
    setError("");

    try {
      const data = await apiRequest("/help/status");
      setSystemStatus(data.services || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setStatusLoading(false);
    }
  };

  const submitArticleFeedback = async (helpful) => {
    if (!selectedArticle?._id) return;

    try {
      await apiRequest(`/help/articles/${selectedArticle._id}/feedback`, {
        method: "POST",
        body: JSON.stringify({ helpful }),
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const sendChatMessage = async () => {
    const question = chatInput.trim();

    if (!question || chatLoading) return;

    const userMessage = {
      role: "user",
      content: question,
    };

    const conversation = [...messages, userMessage];

    setMessages(conversation);
    setChatInput("");
    setChatLoading(true);
    setError("");

    try {
      const data = await apiRequest("/help/chat", {
        method: "POST",
        body: JSON.stringify({
          question,
          conversation: conversation.slice(-10),
        }),
      });

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.answer || "I couldn't generate an answer.",
          sources: data.sources || [],
        },
      ]);
    } catch {
      const localAnswer = fallbackArticles.find((article) =>
        question.toLowerCase().includes(article.slug)
      );

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: localAnswer
            ? localAnswer.content
            : "I can help with jobs, applications, resume studio, interview prep, premium tools, and account support. Please search or open Services for more options.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const submitTicket = async (event) => {
    event.preventDefault();

    if (!ticket.subject.trim() || !ticket.categoryId || !ticket.message.trim()) {
      setError("Please complete subject, category, and message.");
      return;
    }

    setTicketLoading(true);
    setTicketSuccess("");
    setError("");

    try {
      const data = await apiRequest("/help/tickets", {
        method: "POST",
        body: JSON.stringify(ticket),
      });

      setTicketSuccess(
        `Ticket ${data.ticket?.ticketNumber || ""} created successfully.`
      );

      setTicket({
        subject: "",
        categoryId: "",
        message: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setTicketLoading(false);
    }
  };

  const allSystemsOperational = useMemo(() => {
    return (
      systemStatus.length > 0 &&
      systemStatus.every((service) => service.status === "Operational")
    );
  }, [systemStatus]);

  if (pageLoading) {
    return (
      <main className="hc-page">
        <div className="hc-global-loader">Loading Help Center...</div>
      </main>
    );
  }

  return (
    <main className="hc-page">
      <header className="hc-navbar">
        <button
          type="button"
          className="hc-brand"
          onClick={() => handleHeaderNavigation("dashboard")}
        >
          <img src="/logo.png" alt="NoPromptJobs" />
          <strong>NoPromptJobs</strong>
        </button>

        <nav>
          <button type="button" onClick={() => handleHeaderNavigation("dashboard")}>
            Dashboard
          </button>

          <button type="button" onClick={() => handleHeaderNavigation("jobs")}>
            Jobs
          </button>

          <button type="button" onClick={() => handleHeaderNavigation("services")}>
            Applications
          </button>

          <button type="button" onClick={() => handleHeaderNavigation("services")}>
            Resume Studio
          </button>

          <button type="button" onClick={() => handleHeaderNavigation("services")}>
            Interview Prep
          </button>

          <button type="button" onClick={() => handleHeaderNavigation("services")}>
            Premium
          </button>
        </nav>

        <div className="hc-user">
          <button type="button" onClick={() => navigate("/notifications")}>
            <FiBell />
          </button>

          <button type="button" onClick={() => navigate("/services")}>
            <FiMail />
          </button>

          <img
            src={
              user?.profilePhoto ||
              user?.profileImageUrl ||
              user?.photoURL ||
              "/profile.png"
            }
            alt={user?.name || "Candidate profile"}
          />

          <strong>{user?.name || "Candidate"}</strong>
        </div>
      </header>

      {error && (
        <div className="hc-error">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            <FiX />
          </button>
        </div>
      )}

      <section className="hc-layout">
        <section className="hc-main">
          <section className="hc-hero">
            <div className="hc-hero-copy">
              <span className="hc-badge">HELP CENTER</span>
              <h1>How can we help you?</h1>
              <p>
                Find answers, explore product guides, troubleshoot issues, and
                get support for your NoPromptJobs account.
              </p>
            </div>

            <div className="hc-hero-visual">
              <div className="hc-visual-orb hc-orb-one" />
              <div className="hc-visual-orb hc-orb-two" />

              <img
                src="/images/help-center-hero.png"
                alt="NoPromptJobs Help Center"
                className="hc-hero-image"
              />
            </div>
          </section>

          <form className="hc-search-card" onSubmit={handleSearch}>
            <div className="hc-search-row">
              <div className="hc-search-input-wrap">
                <FiSearch />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search help articles, payments, profile, interview..."
                />
              </div>

              <button type="submit" disabled={searchLoading}>
                {searchLoading ? "Searching..." : "Search"}
              </button>
            </div>

            {categories.length > 0 && (
              <div className="hc-tags">
                {categories.slice(0, 6).map((category) => (
                  <button
                    type="button"
                    key={category._id}
                    onClick={() => filterByCategory(category)}
                  >
                    <span>{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            )}
          </form>

          <div className="hc-section-heading">
            <div>
              <span>EXPLORE SUPPORT</span>
              <h2>Browse by Category</h2>
            </div>

            <p>Select a topic to find relevant documentation and support.</p>
          </div>

          {categories.length > 0 ? (
            <section className="hc-category-grid">
              {categories.map((category) => (
                <article
                  className="hc-category-card"
                  key={category._id}
                  onClick={() => filterByCategory(category)}
                >
                  <div className="hc-category-icon">{category.icon}</div>

                  <div className="hc-category-copy">
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                  </div>

                  <FiChevronRight />
                </article>
              ))}
            </section>
          ) : (
            <div className="hc-empty-card">
              <FiBookOpen />
              <h3>Help categories are not available yet</h3>
              <p>Backend categories are unavailable. Search still works with built-in help guides.</p>
            </div>
          )}

          {hasSearched && (
            <section id="help-results" className="hc-results">
              <div className="hc-panel-head">
                <div>
                  <span className="hc-panel-eyebrow">SEARCH RESULTS</span>
                  <h2>Help Articles</h2>
                </div>

                <span className="hc-result-count">{articles.length} results</span>
              </div>

              {searchLoading ? (
                <div className="hc-result-loading">Searching knowledge base...</div>
              ) : articles.length > 0 ? (
                <div className="hc-article-list">
                  {articles.map((article) => (
                    <button
                      type="button"
                      key={article._id}
                      onClick={() => openArticle(article)}
                    >
                      <div>
                        <strong>{article.title}</strong>
                        <p>{article.summary}</p>
                      </div>

                      <FiChevronRight />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="hc-empty-result">
                  <FiSearch />
                  <h3>No help articles found</h3>
                  <p>Try searching jobs, resume, interview, applications, or premium.</p>
                </div>
              )}
            </section>
          )}

          <section className="hc-bottom-grid">
            <article className="hc-panel">
              <div className="hc-panel-head">
                <div>
                  <span className="hc-panel-eyebrow">MOST READ</span>
                  <h2>
                    <FiStar />
                    Popular Articles
                  </h2>
                </div>

                <button type="button" onClick={() => searchArticles("")}>
                  View All
                </button>
              </div>

              <div className="hc-popular-list">
                {(popularArticles.length ? popularArticles : fallbackArticles).map(
                  (article) => (
                    <button
                      type="button"
                      key={article._id}
                      onClick={() => openArticle(article)}
                    >
                      <span>{article.title}</span>
                      <FiChevronRight />
                    </button>
                  )
                )}
              </div>
            </article>

            <article className="hc-panel">
              <div className="hc-panel-head">
                <div>
                  <span className="hc-panel-eyebrow">PLATFORM HEALTH</span>
                  <h2>System Status</h2>
                </div>

                <button type="button" onClick={refreshStatus} disabled={statusLoading}>
                  <FiRefreshCw className={statusLoading ? "hc-spin" : ""} />
                  Refresh
                </button>
              </div>

              <div
                className={
                  allSystemsOperational
                    ? "hc-status-summary operational"
                    : "hc-status-summary degraded"
                }
              >
                <div className="hc-status-pulse" />

                <div>
                  <strong>
                    {allSystemsOperational
                      ? "All Systems Operational"
                      : "Service status unavailable"}
                  </strong>
                  <p>Live status from NoPromptJobs backend services.</p>
                </div>
              </div>

              {systemStatus.length > 0 ? (
                <div className="hc-status-grid">
                  {systemStatus.map((service) => (
                    <div key={service.name}>
                      <i
                        className={
                          service.status === "Operational"
                            ? "operational"
                            : "degraded"
                        }
                      />
                      <span>{service.name}</span>
                      <b>{service.status}</b>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="hc-mini-empty">System status is unavailable.</div>
              )}
            </article>
          </section>
        </section>

        <aside className="hc-sidebar">
          <section className="hc-ai-card">
            <div className="hc-ai-glow" />

            <div className="hc-ai-heading">
              <div className="hc-ai-title">
                <HiOutlineSparkles />
                <h2>AI Assistant</h2>
              </div>

              <span>
                <i />
                Online
              </span>
            </div>

            <p>
              Get intelligent support for applications, subscriptions,
              interviews, resumes, account issues, and NoPromptJobs features.
            </p>

            <div className="hc-ai-visual">
              <div className="hc-ai-ring" />
              <div className="hc-ai-robot">🤖</div>
            </div>

            <button type="button" onClick={() => setChatOpen(true)}>
              <FiMessageCircle />
              Start Chat
            </button>

            <small>AI-powered support • Available 24 × 7</small>
          </section>

          <section className="hc-ticket-card">
            <div className="hc-side-icon">
              <FiHeadphones />
            </div>

            <h2>Still Need Help?</h2>
            <p>
              Create a support ticket and track responses directly from your
              account.
            </p>

            <div className="hc-contact-row">
              <FiMail />
              <span>support@nopromptjobs.com</span>
            </div>

            <div className="hc-contact-row">
              <FiClock />
              <span>Typical response within 24 hours</span>
            </div>

            <button
              type="button"
              className="hc-primary-side-button"
              onClick={() => {
                setTicketSuccess("");
                setTicketOpen(true);
              }}
            >
              Submit a Ticket
            </button>

            <button
              type="button"
              className="hc-secondary-side-button"
              onClick={() => navigate("/services")}
            >
              My Tickets
            </button>
          </section>

          <section className="hc-ticket-card">
            <div className="hc-side-card-heading">
              <div className="hc-side-icon small">
                <FiBookOpen />
              </div>
              <h2>Quick Guides</h2>
            </div>

            <div className="hc-guide-list">
              {(quickGuides.length ? quickGuides : fallbackArticles.slice(0, 3)).map(
                (guide) => (
                  <button
                    type="button"
                    key={guide._id}
                    onClick={() => openArticle(guide)}
                  >
                    <span>{guide.title}</span>
                    <FiChevronRight />
                  </button>
                )
              )}
            </div>
          </section>
        </aside>
      </section>

      {articleLoading && (
        <div className="hc-global-loader">Loading article...</div>
      )}

      {selectedArticle && (
        <div
          className="hc-modal-overlay"
          onMouseDown={() => setSelectedArticle(null)}
        >
          <article
            className="hc-article-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="hc-close"
              onClick={() => setSelectedArticle(null)}
            >
              <FiX />
            </button>

            <span className="hc-modal-category">
              {selectedArticle.category?.name || "Help Article"}
            </span>

            <h1>{selectedArticle.title}</h1>

            <div className="hc-article-content">{selectedArticle.content}</div>

            <div className="hc-feedback">
              <span>Was this article helpful?</span>
              <button type="button" onClick={() => submitArticleFeedback(true)}>
                👍 Yes
              </button>
              <button type="button" onClick={() => submitArticleFeedback(false)}>
                👎 No
              </button>
            </div>
          </article>
        </div>
      )}

      {chatOpen && (
        <section className="hc-chat-window">
          <header>
            <div className="hc-chat-header-copy">
              <div className="hc-chat-avatar">🤖</div>

              <div>
                <strong>NoPromptJobs AI Support</strong>
                <small>
                  <i />
                  Online
                </small>
              </div>
            </div>

            <button type="button" onClick={() => setChatOpen(false)}>
              <FiX />
            </button>
          </header>

          <div className="hc-chat-messages">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`hc-message ${message.role}`}
              >
                <p>{message.content}</p>

                {message.sources?.length > 0 && (
                  <div className="hc-message-sources">
                    {message.sources.map((source) => (
                      <button
                        type="button"
                        key={source.slug}
                        onClick={() => openArticle(source)}
                      >
                        {source.title}
                        <FiChevronRight />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {chatLoading && (
              <div className="hc-message assistant hc-typing">
                <span />
                <span />
                <span />
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          <div className="hc-chat-input">
            <input
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendChatMessage();
                }
              }}
              placeholder="Ask anything about NoPromptJobs..."
            />

            <button
              type="button"
              onClick={sendChatMessage}
              disabled={chatLoading || !chatInput.trim()}
            >
              <FiSend />
            </button>
          </div>
        </section>
      )}

      {ticketOpen && (
        <div
          className="hc-modal-overlay"
          onMouseDown={() => setTicketOpen(false)}
        >
          <form
            className="hc-ticket-modal"
            onMouseDown={(event) => event.stopPropagation()}
            onSubmit={submitTicket}
          >
            <button
              type="button"
              className="hc-close"
              onClick={() => setTicketOpen(false)}
            >
              <FiX />
            </button>

            <span className="hc-modal-category">SUPPORT REQUEST</span>

            <h2>Create Support Ticket</h2>

            {ticketSuccess && (
              <div className="hc-ticket-success">{ticketSuccess}</div>
            )}

            <label>
              Subject
              <input
                value={ticket.subject}
                onChange={(event) =>
                  setTicket((current) => ({
                    ...current,
                    subject: event.target.value,
                  }))
                }
                placeholder="Briefly describe the issue"
              />
            </label>

            <label>
              Category
              <select
                value={ticket.categoryId}
                onChange={(event) =>
                  setTicket((current) => ({
                    ...current,
                    categoryId: event.target.value,
                  }))
                }
              >
                <option value="">Select support category</option>

                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}

                {categories.length === 0 && (
                  <>
                    <option value="general">General Support</option>
                    <option value="jobs">Jobs</option>
                    <option value="resume">Resume Studio</option>
                    <option value="interview">Interview Prep</option>
                  </>
                )}
              </select>
            </label>

            <label>
              Describe your issue
              <textarea
                value={ticket.message}
                onChange={(event) =>
                  setTicket((current) => ({
                    ...current,
                    message: event.target.value,
                  }))
                }
                placeholder="Provide enough detail for our support team to investigate..."
              />
            </label>

            <button className="hc-submit-ticket-button" disabled={ticketLoading}>
              {ticketLoading ? "Creating Ticket..." : "Create Support Ticket"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}

export default HelpCenterPage;