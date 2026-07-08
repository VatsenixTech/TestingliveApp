const mongoose = require("mongoose");

const helpCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "📘" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HelpCategory", helpCategorySchema);