const mongoose = require("mongoose");

const helpArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    summary: { type: String, default: "" },
    content: { type: String, default: "" },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HelpCategory",
      required: true,
    },
    isPopular: { type: Boolean, default: false },
    isGuide: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    helpful: { type: Number, default: 0 },
    notHelpful: { type: Number, default: 0 },
  },
  { timestamps: true }
);

helpArticleSchema.index({
  title: "text",
  summary: "text",
  content: "text",
});

module.exports = mongoose.model("HelpArticle", helpArticleSchema);