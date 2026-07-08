const mongoose = require("mongoose");
require("dotenv").config();

const HelpCategory = require("./models/HelpCategory");
const HelpArticle = require("./models/HelpArticle");

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI is missing in .env file");
  process.exit(1);
}

const categories = [
  ["👤", "Account & Profile", "account-profile", "Manage account, profile, verification & settings"],
  ["💼", "Jobs & Applications", "jobs-applications", "Find jobs, apply, track applications & alerts"],
  ["📄", "Resume Studio", "resume-studio", "Create ATS resume, score, templates & downloads"],
  ["🎤", "Interview Prep", "interview-prep", "AI interview, practice, feedback & performance"],
  ["💎", "Premium Plans", "premium-plans", "Pricing, subscription, billing & plan benefits"],
  ["💳", "Payments & Billing", "payments-billing", "Transactions, invoices, refunds & payment help"],
  ["🛡️", "Security & Privacy", "security-privacy", "Data safety, privacy policy & account security"],
  ["⚙️", "Technical Issues", "technical-issues", "Bugs, errors, login issues & support"],
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);

    await HelpCategory.deleteMany({});
    await HelpArticle.deleteMany({});

    const createdCategories = {};

    for (let i = 0; i < categories.length; i++) {
      const [icon, name, slug, description] = categories[i];

      const category = await HelpCategory.create({
        icon,
        name,
        slug,
        description,
        order: i + 1,
      });

      createdCategories[slug] = category._id;
    }

    await HelpArticle.insertMany([
      {
        title: "How to apply for a job?",
        slug: "how-to-apply-for-a-job",
        summary: "Learn how to search jobs and submit applications.",
        content:
          "Go to Jobs page, select a job, review the details, and click Apply. You can track your application from Applications page.",
        category: createdCategories["jobs-applications"],
        isPopular: true,
        isGuide: true,
      },
      {
        title: "How to create ATS Resume?",
        slug: "how-to-create-ats-resume",
        summary: "Create a professional ATS-friendly resume.",
        content:
          "Open Resume Studio, enter your profile details, choose a template, check your ATS score, and download the resume.",
        category: createdCategories["resume-studio"],
        isPopular: true,
        isGuide: true,
      },
      {
        title: "How to increase my Trust Score?",
        slug: "how-to-increase-trust-score",
        summary: "Improve profile verification and candidate trust.",
        content:
          "Complete your profile, verify email, upload resume, add skills, complete AI interview, and maintain genuine application activity.",
        category: createdCategories["account-profile"],
        isPopular: true,
      },
      {
        title: "How to activate Premium plan?",
        slug: "how-to-activate-premium-plan",
        summary: "Activate Pro or Ultimate subscription.",
        content:
          "Go to Premium page, choose your plan, complete payment, and your premium benefits will activate automatically.",
        category: createdCategories["premium-plans"],
        isPopular: true,
      },
      {
        title: "I forgot my password. What should I do?",
        slug: "forgot-password-help",
        summary: "Reset your NoPromptJobs password securely.",
        content:
          "Go to Login page, click Forgot Password, enter your registered email, verify OTP, and create a new password.",
        category: createdCategories["account-profile"],
        isPopular: true,
      },
    ]);

    console.log("Help Center data seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Help Center seed failed:", error);
    process.exit(1);
  }
}

seed();