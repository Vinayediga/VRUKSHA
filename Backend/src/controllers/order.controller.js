import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../models/order.model.js";
import { Coupon } from "../models/coupon.model.js";

export const createOrderRecord = asyncHandler(async (req, res) => {
  const {
    plant,
    payment,
    customer,
    expectedDelivery,
    couponCode,
  } = req.body;

  if (!plant || !payment || !customer || !expectedDelivery) {
    throw new ApiError(400, "Missing required order fields.");
  }

  if (!payment.paymentId || !payment.method || payment.amount === undefined) {
    throw new ApiError(400, "Incomplete payment information.");
  }

  const originalPrice = Number(plant.price);
  if (Number.isNaN(originalPrice)) {
    throw new ApiError(400, "Invalid plant price.");
  }

  let couponSnapshot = null;
  if (couponCode && typeof couponCode === "string") {
    const normalizedCode = couponCode.trim().toUpperCase();
    const coupon = await Coupon.findOne({
      user: req.user._id,
      code: normalizedCode,
    });
    if (!coupon) throw new ApiError(404, "Coupon not found.");
    if (coupon.status !== "active") {
      throw new ApiError(400, "Coupon already used or expired.");
    }

    const discountAmount = Number(
      ((coupon.discountPercent / 100) * originalPrice).toFixed(2)
    );

    coupon.status = "redeemed";
    coupon.redeemedAt = new Date();
    await coupon.save();

    couponSnapshot = {
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discountAmount,
    };
  }

  const finalAmount = Number(
    Math.max(0, originalPrice - (couponSnapshot?.discountAmount || 0)).toFixed(2)
  );

  const paymentAmount = Number(payment.amount);
  if (Number.isNaN(paymentAmount)) {
    throw new ApiError(400, "Invalid payment amount.");
  }

  if (Math.abs(paymentAmount - finalAmount) > 0.5) {
    throw new ApiError(400, "Payment amount does not match expected total.");
  }

  const order = await Order.create({
    user: req.user._id,
    plant: {
      plantId: plant.id,
      name: plant.name,
      type: plant.type,
      price: originalPrice,
      imageURL: plant.imageURL,
    },
    payment: {
      paymentId: payment.paymentId,
      method: payment.method,
      amount: paymentAmount,
      status: payment.status || (payment.method === "COD" ? "pending" : "paid"),
    },
    customer: {
      name: customer.name,
      email: customer.email,
      address: customer.address,
    },
    expectedDelivery,
    coupon: couponSnapshot,
    finalAmount,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, order, "Order stored successfully"));
});

export const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

