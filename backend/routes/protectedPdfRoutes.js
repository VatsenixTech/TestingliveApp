const express = require("express");
const path = require("path");
const fs = require("fs");
const Device = require("../models/Device");

const router = express.Router();

const pdfMap = {
  "data-engineering": "data-engineering.pdf",
  cybersecurity: "cybersecurity.pdf",
  sap: "sap.pdf",
  devops: "devops.pdf",
  "data-science": "data-science.pdf",
  hr: "hr.pdf",
};

router.post("/access", async (req, res) => {
  try {
    const { folderKey, deviceId, deviceType } = req.body;

    // Temporary until auth is fixed
    const userId = req.user?.id || "test-user";

    if (!folderKey || !deviceId || !deviceType) {
      return res.status(400).json({
        allowed: false,
        message: "Missing folder or device information",
      });
    }

    if (!pdfMap[folderKey]) {
      return res.status(404).json({
        allowed: false,
        message: "PDF folder not found",
      });
    }

    const existingDevices = await Device.find({ userId });

    const sameDevice = existingDevices.find(
      (device) => device.deviceId === deviceId
    );

    if (!sameDevice) {
      const sameTypeAlreadyUsed = existingDevices.find(
        (device) => device.deviceType === deviceType
      );

      if (sameTypeAlreadyUsed) {
        return res.json({
          allowed: false,
          message: `PDF access allowed only on one ${deviceType}.`,
        });
      }

      await Device.create({
        userId,
        deviceId,
        deviceType,
      });
    }

    return res.json({
      allowed: true,
      fileUrl: `/api/protected-pdf/view/${encodeURIComponent(folderKey)}`,
    });
  } catch (error) {
    console.error("Protected PDF access error:", error);

    return res.status(500).json({
      allowed: false,
      message: error.message || "Server error while checking PDF access",
    });
  }
});

router.get("/view/:folderKey", async (req, res) => {
  try {
    const folderKey = decodeURIComponent(req.params.folderKey);
    const fileName = pdfMap[folderKey];

    if (!fileName) {
      return res.status(404).json({ message: "PDF not found" });
    }

    const filePath = path.join(process.cwd(), "protected-pdfs", fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: `PDF file missing: ${fileName}. Add it inside backend/protected-pdfs folder.`,
      });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("Cache-Control", "no-store");

    return res.sendFile(filePath);
  } catch (error) {
    console.error("Protected PDF view error:", error);

    return res.status(500).json({
      message: error.message || "Unable to open PDF",
    });
  }
});

module.exports = router;