require("dotenv").config();

const mongoose = require("mongoose");
const Coupon = require("../models/Coupon");

const coupons = [
  {
    code: "WELCOME30",
    title: "Welcome 30 Minute Access",
    description: "30 minutes of premium access.",
    rewardType: "PREMIUM_MINUTES",
    premiumMinutes: 30,
    usageLimit: 1000,
    perUserLimit: 1,
    validFrom: new Date(),
    validUntil: new Date("2027-12-31T23:59:59.999Z"),
    isActive: true,
  },
  {
    code: "NPJ60",
    title: "60 Minute Premium Access",
    description: "60 minutes of premium access.",
    rewardType: "PREMIUM_MINUTES",
    premiumMinutes: 60,
    usageLimit: 500,
    perUserLimit: 1,
    validFrom: new Date(),
    validUntil: new Date("2027-12-31T23:59:59.999Z"),
    isActive: true,
  },
  {
    code: "SAVE20",
    title: "20 Percent Discount",
    description: "20% subscription discount.",
    rewardType: "DISCOUNT_PERCENT",
    discountPercent: 20,
    usageLimit: 500,
    perUserLimit: 1,
    validFrom: new Date(),
    validUntil: new Date("2027-12-31T23:59:59.999Z"),
    isActive: true,
  },
  {
    code: "DISCOUNT500",
    title: "₹500 Discount",
    description: "₹500 subscription discount.",
    rewardType: "DISCOUNT_AMOUNT",
    discountAmount: 500,
    usageLimit: 250,
    perUserLimit: 1,
    validFrom: new Date(),
    validUntil: new Date("2027-12-31T23:59:59.999Z"),
    isActive: true,
  },
];

const seed = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error(
        "MONGO_URI or MONGODB_URI is missing."
      );
    }

    await mongoose.connect(mongoUri);

    for (const coupon of coupons) {
      await Coupon.findOneAndUpdate(
        { code: coupon.code },
        coupon,
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      console.log(`Seeded: ${coupon.code}`);
    }

    console.log("Coupon seed completed.");
    process.exit(0);
  } catch (error) {
    console.error("Coupon seed failed:", error);
    process.exit(1);
  }
};

seed();
