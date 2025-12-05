import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Upload } from "../models/upload.model.js";
import { Coupon } from "../models/coupon.model.js";

const rewardCatalog = [
  { id: "GREEN5", label: "5% OFF Coupon", pointsCost: 50, discountPercent: 5 },
  { id: "GREEN10", label: "10% OFF Coupon", pointsCost: 90, discountPercent: 10 },
  { id: "GREEN15", label: "15% OFF Coupon", pointsCost: 130, discountPercent: 15 },
];

function generateCouponCode(prefix = "VRK") {
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${random}`;
}

async function getPointsTotals(userId) {
  const [pointsAgg] = await Upload.aggregate([
    { $match: { user: userId } },
    { $group: { _id: null, total: { $sum: "$Points" } } },
  ]);

  const [spentAgg] = await Coupon.aggregate([
    { $match: { user: userId } },
    { $group: { _id: null, total: { $sum: "$pointsCost" } } },
  ]);

  const totalPoints = pointsAgg?.total || 0;
  const spentPoints = spentAgg?.total || 0;

  return {
    totalPoints,
    spentPoints,
    availablePoints: Math.max(0, totalPoints - spentPoints),
  };
}

export const getRewardSummary = asyncHandler(async (req, res) => {
  const totals = await getPointsTotals(req.user._id);
  const coupons = await Coupon.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  return res.json(
    new ApiResponse(200, { ...totals, coupons, catalog: rewardCatalog }, "Rewards summary fetched")
  );
});

export const claimCoupon = asyncHandler(async (req, res) => {
  const { rewardId } = req.body;
  if (!rewardId) throw new ApiError(400, "rewardId is required.");

  const reward = rewardCatalog.find((r) => r.id === rewardId);
  if (!reward) throw new ApiError(404, "Reward option not found.");

  const totals = await getPointsTotals(req.user._id);
  if (totals.availablePoints < reward.pointsCost) {
    throw new ApiError(400, "Not enough points to claim this coupon.");
  }

  const coupon = await Coupon.create({
    user: req.user._id,
    code: generateCouponCode(reward.id),
    rewardId: reward.id,
    label: reward.label,
    discountPercent: reward.discountPercent,
    pointsCost: reward.pointsCost,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { coupon, summary: await getPointsTotals(req.user._id) },
        "Coupon claimed successfully"
      )
    );
});

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code) throw new ApiError(400, "Coupon code is required.");

  const coupon = await Coupon.findOne({
    user: req.user._id,
    code: code.trim().toUpperCase(),
  });

  if (!coupon) throw new ApiError(404, "Coupon not found.");
  if (coupon.status !== "active") {
    throw new ApiError(400, "Coupon is already used or expired.");
  }

  return res.json(
    new ApiResponse(200, {
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      label: coupon.label,
      status: coupon.status,
    }, "Coupon is valid")
  );
});

