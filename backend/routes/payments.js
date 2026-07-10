const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const router = express.Router();

/* =========================================================
   RAZORPAY CONFIGURATION
   ========================================================= */

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* =========================================================
   FRONTEND URL

   LOCAL:
   http://localhost:5173

   PRODUCTION:
   https://nopromptjobs.com
   ========================================================= */

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

/* =========================================================
   PLAN CONFIGURATION

   NEVER TRUST PRICE COMING FROM FRONTEND.

   Backend decides the actual payable amount.
   ========================================================= */

const PLANS = {
  pro: {
    name: "Pro",

    actualPrice: 1399,

    offerPrice: 899,
  },

  ultimate: {
    name: "Ultimate",

    actualPrice: 3499,

    offerPrice: 1,
  },
};

/* =========================================================
   COUPON CONFIGURATION

   TEMPORARY VERSION.

   Later move coupons into MongoDB.
   ========================================================= */

const COUPONS = {
  NPJ100: {
    code: "NPJ100",

    discount: 100,

    allowedPlans: ["pro", "ultimate"],
  },

  PRO200: {
    code: "PRO200",

    discount: 200,

    allowedPlans: ["pro"],
  },

  ULTIMATE500: {
    code: "ULTIMATE500",

    discount: 500,

    allowedPlans: ["ultimate"],
  },
};

/* =========================================================
   HELPER: GET FINAL PRICE
   ========================================================= */

const calculateFinalPrice = (planKey, couponCode) => {
  const normalizedPlanKey = String(planKey || "").toLowerCase();

  const plan = PLANS[normalizedPlanKey];

  if (!plan) {
    return {
      success: false,

      message: "Invalid plan selected",
    };
  }

  let discount = 0;

  let appliedCoupon = null;

  if (couponCode) {
    const normalizedCoupon = String(couponCode)
      .trim()
      .toUpperCase();

    const coupon = COUPONS[normalizedCoupon];

    if (!coupon) {
      return {
        success: false,

        message: "Invalid coupon code",
      };
    }

    if (!coupon.allowedPlans.includes(normalizedPlanKey)) {
      return {
        success: false,

        message: `Coupon ${normalizedCoupon} cannot be used for ${plan.name}`,
      };
    }

    discount = coupon.discount;

    appliedCoupon = coupon.code;
  }

  const finalPrice = Math.max(
    plan.offerPrice - discount,
    1
  );

  return {
    success: true,

    plan,

    planKey: normalizedPlanKey,

    actualPrice: plan.actualPrice,

    offerPrice: plan.offerPrice,

    discount,

    finalPrice,

    appliedCoupon,
  };
};

/* =========================================================
   HEALTH CHECK

   OPTIONAL BUT USEFUL FOR TESTING
   ========================================================= */

router.get("/health", (req, res) => {
  res.json({
    success: true,

    message: "Payment API working",
  });
});

/* =========================================================
   CREATE RAZORPAY ORDER

   KEEPING YOUR EXISTING ORDER FLOW.

   FRONTEND SHOULD SEND:

   {
      "planKey": "ultimate",
      "couponCode": "ULTIMATE500"
   }
   ========================================================= */

router.post("/create-order", async (req, res) => {
  try {
    const {
      planKey,
      couponCode,
    } = req.body;

    const priceResult = calculateFinalPrice(
      planKey,
      couponCode
    );

    if (!priceResult.success) {
      return res.status(400).json(priceResult);
    }

    const {
      plan,
      actualPrice,
      offerPrice,
      discount,
      finalPrice,
      appliedCoupon,
    } = priceResult;

    const order = await razorpay.orders.create({
      amount: Math.round(finalPrice * 100),

      currency: "INR",

      receipt: `npj_${Date.now()}`,

      notes: {
        planKey: priceResult.planKey,

        planName: plan.name,

        actualPrice: String(actualPrice),

        offerPrice: String(offerPrice),

        discount: String(discount),

        finalPrice: String(finalPrice),

        couponCode: appliedCoupon || "NONE",
      },
    });

    return res.status(201).json({
      success: true,

      key: process.env.RAZORPAY_KEY_ID,

      order,

      plan: {
        key: priceResult.planKey,

        name: plan.name,

        actualPrice,

        offerPrice,

        discount,

        finalPrice,

        couponCode: appliedCoupon,
      },
    });
  } catch (error) {
    console.error(
      "CREATE ORDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error?.error?.description ||
        error.message ||
        "Unable to create Razorpay order",
    });
  }
});

/* =========================================================
   VERIFY RAZORPAY CHECKOUT PAYMENT

   THIS IS FOR YOUR EXISTING ORDER/CHECKOUT FLOW.
   ========================================================= */

router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,

        message: "Missing Razorpay payment verification data",
      });
    }

    const body =
      `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(body)
      .digest("hex");

    const receivedBuffer = Buffer.from(
      razorpay_signature,
      "utf8"
    );

    const expectedBuffer = Buffer.from(
      expectedSignature,
      "utf8"
    );

    const isValid =
      receivedBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(
        receivedBuffer,
        expectedBuffer
      );

    if (!isValid) {
      return res.status(400).json({
        success: false,

        message: "Payment verification failed",
      });
    }

    /*
     IMPORTANT:

     Later update Candidate/User in MongoDB here.

     Do not activate subscription using only localStorage.
    */

    return res.json({
      success: true,

      verified: true,

      message: "Payment verified successfully",

      paymentId: razorpay_payment_id,

      orderId: razorpay_order_id,
    });
  } catch (error) {
    console.error(
      "VERIFY PAYMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message: "Unable to verify payment",
    });
  }
});

/* =========================================================
   CREATE DYNAMIC PAYMENT LINK

   THIS IS THE ROUTE YOUR NEW ServicesPage USES.

   POST:
   /api/payments/create-payment-link

   FRONTEND SENDS:

   {
      "planKey": "ultimate",
      "couponCode": "ULTIMATE500",
      "candidateId": "...",
      "name": "...",
      "email": "...",
      "contact": "..."
   }
   ========================================================= */

router.post("/create-payment-link", async (req, res) => {
  try {
    const {
      planKey,
      couponCode,
      candidateId,
      name,
      email,
      contact,
    } = req.body;

    /* -------------------------------------------------------
       VALIDATE USER
       ------------------------------------------------------- */

    if (!candidateId) {
      return res.status(400).json({
        success: false,

        message: "Candidate ID is required",
      });
    }

    /* -------------------------------------------------------
       CALCULATE PRICE ON BACKEND
       ------------------------------------------------------- */

    const priceResult = calculateFinalPrice(
      planKey,
      couponCode
    );

    if (!priceResult.success) {
      return res.status(400).json(priceResult);
    }

    const {
      plan,
      actualPrice,
      offerPrice,
      discount,
      finalPrice,
      appliedCoupon,
    } = priceResult;

    /* -------------------------------------------------------
       CALLBACK URL

       Razorpay sends payment-link parameters to this URL.
       ------------------------------------------------------- */

    const callbackUrl =
      `${FRONTEND_URL}/payment-success`;

    /* -------------------------------------------------------
       CUSTOMER OBJECT

       Razorpay fields should not contain undefined values.
       ------------------------------------------------------- */

    const customer = {};

    if (name && String(name).trim()) {
      customer.name = String(name).trim();
    }

    if (email && String(email).trim()) {
      customer.email = String(email).trim();
    }

    if (contact && String(contact).trim()) {
      customer.contact = String(contact).trim();
    }

    /* -------------------------------------------------------
       CREATE PAYMENT LINK
       ------------------------------------------------------- */

    const paymentLink =
      await razorpay.paymentLink.create({
        amount: Math.round(finalPrice * 100),

        currency: "INR",

        accept_partial: false,

        description:
          `NoPromptJobs ${plan.name} Plan`,

        customer,

        notify: {
          sms: Boolean(customer.contact),

          email: Boolean(customer.email),
        },

        reminder_enable: true,

        notes: {
          candidateId: String(candidateId),

          planKey: priceResult.planKey,

          planName: plan.name,

          actualPrice: String(actualPrice),

          offerPrice: String(offerPrice),

          discount: String(discount),

          finalPrice: String(finalPrice),

          couponCode: appliedCoupon || "NONE",
        },

        callback_url: callbackUrl,

        callback_method: "get",
      });

    return res.status(201).json({
      success: true,

      message: "Payment link created successfully",

      paymentLink: paymentLink.short_url,

      paymentLinkId: paymentLink.id,

      callbackUrl,

      plan: {
        key: priceResult.planKey,

        name: plan.name,

        actualPrice,

        offerPrice,

        discount,

        finalPrice,

        couponCode: appliedCoupon,
      },
    });
  } catch (error) {
    console.error(
      "CREATE PAYMENT LINK ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error?.error?.description ||
        error.message ||
        "Unable to create payment link",
    });
  }
});

/* =========================================================
   VERIFY PAYMENT LINK AFTER REDIRECT

   PaymentSuccessPage should call:

   POST /api/payments/verify-payment-link

   with the query parameters Razorpay added to the callback URL.

   DO NOT activate Ultimate merely because the user visited
   /payment-success manually.
   ========================================================= */

router.post("/verify-payment-link", async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_payment_link_id,
      razorpay_payment_link_reference_id,
      razorpay_payment_link_status,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_payment_id ||
      !razorpay_payment_link_id ||
      !razorpay_payment_link_status ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,

        message: "Missing Payment Link verification data",
      });
    }

    /*
     Razorpay Payment Link callback signature payload:

     payment_link_id
     |
     payment_link_reference_id
     |
     payment_link_status
     |
     payment_id
    */

    const signatureBody = [
      razorpay_payment_link_id,

      razorpay_payment_link_reference_id || "",

      razorpay_payment_link_status,

      razorpay_payment_id,
    ].join("|");

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(signatureBody)
      .digest("hex");

    const receivedBuffer = Buffer.from(
      razorpay_signature,
      "utf8"
    );

    const expectedBuffer = Buffer.from(
      expectedSignature,
      "utf8"
    );

    const signatureValid =
      receivedBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(
        receivedBuffer,
        expectedBuffer
      );

    if (!signatureValid) {
      return res.status(400).json({
        success: false,

        verified: false,

        message: "Invalid Payment Link signature",
      });
    }

    /* -------------------------------------------------------
       FETCH PAYMENT LINK FROM RAZORPAY

       Do not trust planName coming from frontend/localStorage.
       ------------------------------------------------------- */

    const paymentLink =
      await razorpay.paymentLink.fetch(
        razorpay_payment_link_id
      );

    if (paymentLink.status !== "paid") {
      return res.status(400).json({
        success: false,

        verified: false,

        message: "Payment Link is not paid",
      });
    }

    const candidateId =
      paymentLink.notes?.candidateId;

    const planKey =
      paymentLink.notes?.planKey;

    const planName =
      paymentLink.notes?.planName;

    if (
      !candidateId ||
      !planKey ||
      !PLANS[planKey]
    ) {
      return res.status(400).json({
        success: false,

        verified: false,

        message: "Invalid payment subscription metadata",
      });
    }

    /*
     =========================================================
     IMPORTANT NEXT STEP

     UPDATE YOUR CANDIDATE MODEL HERE.

     Example:

     const Candidate = require("../models/Candidate");

     await Candidate.findByIdAndUpdate(
       candidateId,
       {
         plan: planName,
         subscriptionStatus: "active",
         razorpayPaymentId: razorpay_payment_id,
         razorpayPaymentLinkId: razorpay_payment_link_id,
       },
       {
         new: true,
       }
     );

     Only after MongoDB update succeeds should you return
     subscriptionActive: true.
     =========================================================
    */

    return res.json({
      success: true,

      verified: true,

      subscriptionActive: true,

      message: "Payment Link verified successfully",

      candidateId,

      planKey,

      planName,

      paymentId: razorpay_payment_id,

      paymentLinkId:
        razorpay_payment_link_id,
    });
  } catch (error) {
    console.error(
      "VERIFY PAYMENT LINK ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      verified: false,

      message:
        error?.error?.description ||
        error.message ||
        "Unable to verify Payment Link",
    });
  }
});

module.exports = router;