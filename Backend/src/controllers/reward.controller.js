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
    // DEMO MODE: Set points to 500 for demonstration purposes
    // TODO: Remove this and uncomment the actual calculation below for production
    
    return {
      totalPoints: 500,        // Demo: Total points earned
      spentPoints: 0,          // Demo: No points spent
      availablePoints: 500,    // Demo: Available points
    };

    // ACTUAL CALCULATION (commented out for demo):
    // // Calculate total points earned from all uploads
    // const [pointsAgg] = await Upload.aggregate([
    //   { $match: { user: userId } },
    //   { $group: { _id: null, total: { $sum: "$Points" } } },
    // ]);

    // // Calculate total points spent on coupons
    // const [spentAgg] = await Coupon.aggregate([
    //   { $match: { user: userId } },
    //   { $group: { _id: null, total: { $sum: "$pointsCost" } } },
    // ]);

    // const totalPoints = pointsAgg?.total || 0;
    // const spentPoints = spentAgg?.total || 0;

    // // Available points = Total points earned - Points spent on coupons
    // // When new points are earned (upload), totalPoints increases, so availablePoints increases
    // // When coupon is claimed, spentPoints increases, so availablePoints decreases
    // return {
    //   totalPoints,        // Total points earned from uploads (never decreases)
    //   spentPoints,        // Total points spent on coupons
    //   availablePoints: Math.max(0, totalPoints - spentPoints), // Available = Earned - Spent
    // };
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
    
    if (!req.user || !req.user._id) {
      throw new ApiError(401, "User not authenticated. Please login again.");
    }

    if (!rewardId) {
      throw new ApiError(400, "rewardId is required.");
    }

    const reward = rewardCatalog.find((r) => r.id === rewardId);
    if (!reward) throw new ApiError(404, "Reward option not found.");

    const totals = await getPointsTotals(req.user._id);
    
    // Add detailed logging for debugging
    console.log("Claim Coupon Request:", {
      userId: req.user._id,
      rewardId,
      availablePoints: totals.availablePoints,
      requiredPoints: reward.pointsCost,
      totalPoints: totals.totalPoints,
      spentPoints: totals.spentPoints
    });

    if (totals.availablePoints < reward.pointsCost) {
      throw new ApiError(
        400, 
        `Not enough points. You have ${totals.availablePoints} points, but need ${reward.pointsCost} points.`
      );
    }

    // Explicitly set status to "active" to ensure it's created correctly
    const coupon = await Coupon.create({
      user: req.user._id,
      code: generateCouponCode(reward.id),
      rewardId: reward.id,
      label: reward.label,
      discountPercent: reward.discountPercent,
      pointsCost: reward.pointsCost,
      status: "active", // Explicitly set to active
    });

    console.log("Coupon created:", {
      code: coupon.code,
      status: coupon.status,
      userId: coupon.user
    });

    const updatedSummary = await getPointsTotals(req.user._id);

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { coupon, summary: updatedSummary },
          "Coupon claimed successfully"
        )
      );
  });

  export const validateCoupon = asyncHandler(async (req, res) => {
    const { code } = req.body;
    if (!code) throw new ApiError(400, "Coupon code is required.");

    const normalizedCode = code.trim().toUpperCase();
    
    const coupon = await Coupon.findOne({
      user: req.user._id,
      code: normalizedCode,
    });

    if (!coupon) {
      throw new ApiError(404, `Coupon "${normalizedCode}" not found. Please check the code and try again.`);
    }

    // Add detailed logging
    console.log("Coupon validation:", {
      code: normalizedCode,
      userId: req.user._id,
      couponStatus: coupon.status,
      couponId: coupon._id
    });

    if (coupon.status !== "active") {
      const statusMessage = coupon.status === "redeemed" 
        ? "This coupon has already been used." 
        : coupon.status === "expired"
        ? "This coupon has expired."
        : `This coupon is ${coupon.status}.`;
      
      throw new ApiError(400, statusMessage);
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

