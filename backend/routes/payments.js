const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post("/create-order", async (req, res) => {
  try {
    const { amount, planName } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `nop_${Date.now()}`,
      notes: {
        planName,
      },
    });

    res.json({
      key: process.env.RAZORPAY_KEY_ID,
      order,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});


router.post("/verify", async (req, res) => {

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body;

  const body =
    razorpay_order_id +
    "|" +
    razorpay_payment_id;

  const expected = crypto
    .createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET
    )
    .update(body)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return res.status(400).json({
      success:false,
      message:"Payment verification failed"
    });
  }

  res.json({
    success:true,
    message:"Payment successful"
  });

});

module.exports = router;