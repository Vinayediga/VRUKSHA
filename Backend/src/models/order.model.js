import mongoose, { Schema } from "mongoose";

const PlantSnapshotSchema = new Schema(
  {
    plantId: { type: Number },
    name: { type: String, required: true },
    type: { type: String },
    price: { type: Number, required: true },
    imageURL: { type: String },
  },
  { _id: false }
);

const PaymentInfoSchema = new Schema(
  {
    paymentId: { type: String, required: true },
    method: { type: String, enum: ["Online", "COD"], required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["paid", "pending", "failed"],
      default: "paid",
    },
  },
  { _id: false }
);

const CustomerInfoSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
  },
  { _id: false }
);

const CouponSnapshotSchema = new Schema(
  {
    code: { type: String },
    discountPercent: { type: Number },
    discountAmount: { type: Number },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plant: { type: PlantSnapshotSchema, required: true },
    payment: { type: PaymentInfoSchema, required: true },
    customer: { type: CustomerInfoSchema, required: true },
    expectedDelivery: { type: String, required: true },
    coupon: { type: CouponSnapshotSchema },
    finalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: "processing",
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", OrderSchema);

