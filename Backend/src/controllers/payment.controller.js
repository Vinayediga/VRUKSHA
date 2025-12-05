import Razorpay from "razorpay";
import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

if (!razorpayKeyId || !razorpayKeySecret) {
  console.warn(
    "⚠️  Razorpay keys are not set. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment."
  );
}

const razorpay = new Razorpay({
  key_id: razorpayKeyId || "missing_key_id",
  key_secret: razorpayKeySecret || "missing_key_secret",
});

export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, currency = "INR", receipt, notes } = req.body;

  if (!amount) {
    throw new ApiError(400, "Amount is required to create an order.");
  }

  if (!razorpayKeyId || !razorpayKeySecret) {
    throw new ApiError(500, "Razorpay keys are not configured on the server.");
  }

  const normalizedAmount = Math.round(Number(amount) * 100); // convert to paise
  if (Number.isNaN(normalizedAmount) || normalizedAmount <= 0) {
    throw new ApiError(400, "Amount must be a positive number.");
  }

  const options = {
    amount: normalizedAmount,
    currency,
    receipt: receipt || `receipt_${Date.now()}`,
    notes: notes || {},
  };

  const order = await razorpay.orders.create(options);

  return res
    .status(201)
    .json(
      new ApiResponse(201, { order, key: razorpayKeyId }, "Razorpay order created")
    );
});

export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, "Missing Razorpay verification parameters.");
  }

  if (!razorpayKeySecret) {
    throw new ApiError(500, "Razorpay secret is not configured on the server.");
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", razorpayKeySecret)
    .update(body)
    .digest("hex");

  const isValid = expectedSignature === razorpay_signature;
  if (!isValid) {
    throw new ApiError(400, "Invalid Razorpay signature.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { razorpay_order_id, razorpay_payment_id },
        "Payment verified successfully"
      )
    );
});

