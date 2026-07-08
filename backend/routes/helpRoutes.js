const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");

const HelpCategory = require("../models/HelpCategory");
const HelpArticle = require("../models/HelpArticle");
const SupportTicket = require("../models/SupportTicket");

const router = express.Router();

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/* GET CATEGORIES */
router.get(
  "/categories",
  asyncHandler(async (req, res) => {
    const categories = await HelpCategory.find({})
      .sort({ order: 1, createdAt: 1 })
      .lean();

    res.json({
      success: true,
      categories,
    });
  })
);

/* POPULAR ARTICLES */
router.get(
  "/articles/popular",
  asyncHandler(async (req, res) => {
    const articles = await HelpArticle.find({ isPopular: true })
      .populate("category", "name slug icon")
      .sort({ views: -1, createdAt: -1 })
      .limit(8)
      .lean();

    res.json({
      success: true,
      articles,
    });
  })
);

/* SEARCH ARTICLES */
router.get(
  "/articles/search",
  asyncHandler(async (req, res) => {
    const q = String(req.query.q || "").trim();

    if (!q) {
      return res.json({
        success: true,
        articles: [],
      });
    }

    const safeQuery = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const articles = await HelpArticle.find({
      $or: [
        { title: { $regex: safeQuery, $options: "i" } },
        { summary: { $regex: safeQuery, $options: "i" } },
        { content: { $regex: safeQuery, $options: "i" } },
      ],
    })
      .populate("category", "name slug icon")
      .sort({ views: -1, createdAt: -1 })
      .limit(20)
      .lean();

    res.json({
      success: true,
      articles,
    });
  })
);

/* QUICK GUIDES */
router.get(
  "/guides",
  asyncHandler(async (req, res) => {
    const guides = await HelpArticle.find({ isGuide: true })
      .populate("category", "name slug icon")
      .sort({ views: -1, createdAt: -1 })
      .limit(8)
      .lean();

    res.json({
      success: true,
      guides,
    });
  })
);

/* ARTICLES BY CATEGORY */
router.get(
  "/articles/category/:slug",
  asyncHandler(async (req, res) => {
    const category = await HelpCategory.findOne({
      slug: req.params.slug,
    }).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Help category not found",
      });
    }

    const articles = await HelpArticle.find({
      category: category._id,
    })
      .populate("category", "name slug icon")
      .sort({ views: -1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      category,
      articles,
    });
  })
);

/* SYSTEM STATUS */
router.get(
  "/status",
  asyncHandler(async (req, res) => {
    const mongoConnected = mongoose.connection.readyState === 1;

    res.json({
      success: true,
      overallStatus:
        mongoConnected && process.env.GROQ_API_KEY
          ? "Operational"
          : "Some Services Require Attention",
      services: [
        {
          name: "Help Center API",
          status: "Operational",
        },
        {
          name: "MongoDB",
          status: mongoConnected ? "Operational" : "Unavailable",
        },
        {
          name: "AI Support",
          status: process.env.GROQ_API_KEY ? "Configured" : "Not Configured",
        },
      ],
      checkedAt: new Date().toISOString(),
    });
  })
);

/* CREATE SUPPORT TICKET */
router.post(
  "/tickets",
  asyncHandler(async (req, res) => {
    const { userId, name, email, subject, categoryId, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Subject and message are required",
      });
    }

    const ticketNumber = `NPJ-${Date.now()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const ticket = await SupportTicket.create({
      ticketNumber,
      userId: userId || null,
      name: name || "Candidate",
      email: email || "",
      subject: subject.trim(),
      categoryId: categoryId || null,
      message: message.trim(),
      status: "Open",
    });

    res.status(201).json({
      success: true,
      message: "Support ticket created successfully",
      ticket,
    });
  })
);

/* MY TICKETS */
router.get(
  "/tickets/me",
  asyncHandler(async (req, res) => {
    const userId = String(req.query.userId || "").trim();

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const tickets = await SupportTicket.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      tickets,
    });
  })
);

/* REAL AI CHAT USING GROQ */
router.post(
  "/chat",
  asyncHandler(async (req, res) => {
    const question = String(req.body.question || "").trim();

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({
        success: false,
        message: "GROQ_API_KEY is missing in backend .env file",
      });
    }

    const keywords = question
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length >= 3)
      .slice(0, 8);

    let articles = [];

    if (keywords.length > 0) {
      const conditions = keywords.flatMap((keyword) => {
        const safeKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        return [
          { title: { $regex: safeKeyword, $options: "i" } },
          { summary: { $regex: safeKeyword, $options: "i" } },
          { content: { $regex: safeKeyword, $options: "i" } },
        ];
      });

      articles = await HelpArticle.find({
        $or: conditions,
      })
        .populate("category", "name slug icon")
        .sort({ views: -1 })
        .limit(5)
        .lean();
    }

    const knowledgeBase =
      articles.length > 0
        ? articles
            .map(
              (article, index) => `
DOCUMENT ${index + 1}

Title:
${article.title}

Category:
${article.category?.name || "General"}

Summary:
${article.summary || ""}

Content:
${article.content || ""}
`
            )
            .join("\n\n")
        : "No matching Help Center article found.";

    let aiResponse;

    try {
      aiResponse = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: `
You are NoPromptJobs AI Support Assistant.

You help users with:
- account and profile
- job search
- job applications
- Resume Studio
- ATS resume
- AI interview preparation
- premium plans
- payments
- security
- technical issues
- support tickets

Use the provided NoPromptJobs Help Center documentation when available.
Do not invent payment, application, subscription, or account status.
If you do not know, ask the user to create a support ticket.
Keep the answer clear, professional, and short.
              `.trim(),
            },
            {
              role: "user",
              content: `
User Question:
${question}

NoPromptJobs Help Center Knowledge:
${knowledgeBase}
              `.trim(),
            },
          ],
          temperature: 0.2,
          max_tokens: 700,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );
    } catch (error) {
      console.error("GROQ API ERROR:", error.response?.data || error.message);

      return res.status(502).json({
        success: false,
        message: "AI provider failed. Please try again.",
      });
    }

    const answer =
      aiResponse.data?.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I could not generate an answer.";

    res.json({
      success: true,
      answer,
      sources: articles.map((article) => ({
        id: article._id,
        title: article.title,
        slug: article.slug,
        category: article.category?.name || "General",
      })),
    });
  })
);

/* SINGLE ARTICLE - KEEP AFTER OTHER /articles ROUTES */
router.get(
  "/articles/:slug",
  asyncHandler(async (req, res) => {
    const article = await HelpArticle.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate("category", "name slug icon")
      .lean();

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Help article not found",
      });
    }

    res.json({
      success: true,
      article,
    });
  })
);

/* ARTICLE FEEDBACK */
router.post(
  "/articles/:id/feedback",
  asyncHandler(async (req, res) => {
    const { helpful } = req.body;

    if (typeof helpful !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "helpful must be true or false",
      });
    }

    const update = helpful
      ? { $inc: { helpful: 1 } }
      : { $inc: { notHelpful: 1 } };

    const article = await HelpArticle.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Help article not found",
      });
    }

    res.json({
      success: true,
      message: "Feedback recorded successfully",
    });
  })
);

module.exports = router;