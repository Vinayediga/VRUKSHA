import mongoose, { Schema } from "mongoose";

const CouponSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    code: { type: String, required: true, unique: true },
    rewardId: { type: String, required: true },
    label: { type: String },
    discountPercent: { type: Number, required: true },
    pointsCost: { type: Number, required: true },
    status: {
      type: String,
      enum: ["active", "redeemed", "expired"],
      default: "active",
    },
    claimedAt: { type: Date, default: () => new Date() },
    redeemedAt: { type: Date },
  },
  { timestamps: true }
);

export const Coupon = mongoose.model("Coupon", CouponSchema);

