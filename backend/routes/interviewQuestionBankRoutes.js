const express = require("express");
const PDFDocument = require("pdfkit");
const mongoose = require("mongoose");
const InterviewSession = require("../models/InterviewSession");
const router = express.Router();

const clean = value => String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
const escapeRegex = value => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const candidateIdFrom = req => req.user?.candidateId || req.user?._id || req.user?.id || req.query?.candidateId || null;

function validateCandidateId(value) {
  if (!value) return "Candidate ID is required.";
  if (!mongoose.Types.ObjectId.isValid(value)) return "Invalid candidate ID.";
  return null;
}
function difficulty(question) {
  if (question?.difficulty) return String(question.difficulty);
  const text = clean(question?.question);
  if (/(design|architecture|optimi[sz]e|trade.?off|production|scale|debug|performance)/.test(text)) return "Hard";
  if (/(explain|difference|compare|how would|scenario|experience)/.test(text)) return "Medium";
  return "Easy";
}
function normalizeQuestion(item) {
  const text = String(item?.question || "").trim();
  if (!text) return null;
  return {
    question: text,
    category: String(item?.category || "General").trim(),
    difficulty: difficulty(item),
    createdAt: item?.answeredAt || item?.createdAt || null
  };
}
function uniqueQuestions(items) {
  const seen = new Set();
  const output = [];
  for (const item of items) {
    const normalized = normalizeQuestion(item);
    if (!normalized) continue;
    const key = clean(normalized.question);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(normalized);
  }
  return output;
}
async function getBank({ candidateId, role, type, search }) {
  const sessions = await InterviewSession.find({
    candidateId,
    role: { $regex: `^${escapeRegex(role)}$`, $options: "i" },
    ...(clean(type) === "mixed" ? {} : {
      interviewType: { $regex: `^${escapeRegex(type)}$`, $options: "i" }
    }),
    "questions.0": { $exists: true }
  })
    .select("role interviewType questions completedAt updatedAt createdAt")
    .sort({ completedAt: -1, updatedAt: -1, createdAt: -1 })
    .lean();

  let questions = uniqueQuestions(sessions.flatMap(session => session.questions || []));
  if (search) {
    const value = clean(search);
    questions = questions.filter(q => clean(q.question).includes(value) || clean(q.category).includes(value));
  }
  const topics = [...new Set(questions.map(q => q.category || "General"))].sort();
  const difficulties = [...new Set(questions.map(q => q.difficulty || "Medium"))].sort();
  const lastUpdated = sessions.map(s => s.updatedAt || s.completedAt || s.createdAt).filter(Boolean).sort((a,b) => new Date(b)-new Date(a))[0] || null;
  return { questions, topics, difficulties, lastUpdated };
}
function grouped(questions) {
  const map = new Map();
  for (const question of questions) {
    const topic = question.category || "General";
    if (!map.has(topic)) map.set(topic, []);
    map.get(topic).push(question);
  }
  return [...map.entries()].sort(([a],[b]) => a.localeCompare(b));
}
function space(doc, height = 75) {
  if (doc.page.height - doc.page.margins.bottom - doc.y < height) doc.addPage();
}
function footer(doc) {
  const range = doc.bufferedPageRange();
  for (let page = range.start; page < range.start + range.count; page += 1) {
    doc.switchToPage(page);
    doc.font("Helvetica").fontSize(8).fillColor("#98a2b3")
      .text(`NoPromptJobs · Page ${page + 1} of ${range.count}`, doc.page.margins.left, doc.page.height - 38, {
        width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
        align: "center"
      });
  }
}

router.get("/question-bank/metadata", async (req, res) => {
  try {
    const candidateId = candidateIdFrom(req);
    const invalid = validateCandidateId(candidateId);
    if (invalid) return res.status(400).json({ success: false, message: invalid });

    const role = String(req.query.role || "Data Engineer").trim();
    const type = String(req.query.type || "Technical").trim();
    const search = String(req.query.search || "").trim();
    const data = await getBank({ candidateId, role, type, search });

    return res.json({
      success: true,
      data: {
        role,
        type,
        fileName: `${role.replace(/\s+/g, "_")}_${type.replace(/\s+/g, "_")}_Interview_Questions.pdf`,
        totalQuestions: data.questions.length,
        topicCount: data.topics.length,
        difficultyCount: data.difficulties.length,
        estimatedPages: data.questions.length ? Math.max(1, Math.ceil(data.questions.length / 18)) : 0,
        estimatedBytes: data.questions.length * 260,
        relevanceScore: data.questions.length ? 100 : 0,
        lastUpdated: data.lastUpdated,
        topics: data.topics,
        difficulties: data.difficulties
      }
    });
  } catch (error) {
    console.error("Question bank metadata error:", error);
    return res.status(500).json({ success: false, message: error.message || "Unable to load Question Bank." });
  }
});

router.get("/question-bank/pdf", async (req, res) => {
  try {
    const candidateId = candidateIdFrom(req);
    const invalid = validateCandidateId(candidateId);
    if (invalid) return res.status(400).json({ success: false, message: invalid });

    const role = String(req.query.role || "Data Engineer").trim();
    const type = String(req.query.type || "Technical").trim();
    const search = String(req.query.search || "").trim();
    const data = await getBank({ candidateId, role, type, search });

    if (!data.questions.length) {
      return res.status(404).json({
        success: false,
        message: `No saved ${type.toLowerCase()} questions were found for ${role}. Complete interview sessions first or select another role/type.`
      });
    }

    const fileName = `${role.replace(/\s+/g, "_")}_${type.replace(/\s+/g, "_")}_Interview_Questions.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `${req.query.download === "1" ? "attachment" : "inline"}; filename="${fileName}"`);
    res.setHeader("Cache-Control", "private, max-age=300");

    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 46, right: 50, bottom: 55, left: 50 },
      bufferPages: true,
      info: {
        Title: `${role} ${type} Interview Questions`,
        Author: "NoPromptJobs",
        Subject: "Interview Preparation Question Bank"
      }
    });

    doc.pipe(res);
    doc.font("Helvetica-Bold").fontSize(21).fillColor("#35207f")
      .text(`${role} – ${type} Interview Questions`, { align: "center" });
    doc.moveDown(.45);
    doc.font("Helvetica").fontSize(10).fillColor("#667085")
      .text(`Professional preparation document containing ${data.questions.length} real questions collected from completed interview sessions.`, { align: "center" });
    doc.moveDown(1);
    doc.strokeColor("#e3e6ef").moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
    doc.moveDown(1);

    grouped(data.questions).forEach(([topic, questions], topicIndex) => {
      space(doc, 100);
      doc.font("Helvetica-Bold").fontSize(14).fillColor("#5b2bd8").text(`${topicIndex + 1}. ${topic}`);
      doc.moveDown(.5);

      questions.forEach((question, questionIndex) => {
        space(doc, 62);
        doc.font("Helvetica").fontSize(10.5).fillColor("#1d2939")
          .text(`${questionIndex + 1}. ${question.question}`, { indent: 12, paragraphGap: 4 });
        doc.font("Helvetica").fontSize(8.5).fillColor("#7f56d9")
          .text(`Difficulty: ${question.difficulty}`, { indent: 28 });
        doc.moveDown(.55);
      });

      doc.moveDown(.4);
      doc.strokeColor("#e8eaf2").moveTo(doc.page.margins.left, doc.y)
        .lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
      doc.moveDown(.8);
    });

    footer(doc);
    doc.end();
  } catch (error) {
    console.error("Question bank PDF error:", error);
    if (!res.headersSent) return res.status(500).json({ success: false, message: error.message || "Unable to generate PDF." });
    res.end();
  }
});

module.exports = router;
