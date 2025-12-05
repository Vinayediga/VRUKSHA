
import { Router } from "express";
import { 
    loginUser, 
    logoutUser, 
    registerUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateAccountDetails,
    contact,
    verifyOTP,
    resendOTP,
    updateUserAvatar,
    resetpassword,
    uploadcontroller,
} from "../controllers/user.controller.js";
import { createRazorpayOrder, verifyRazorpayPayment } from "../controllers/payment.controller.js";
import { createOrderRecord, getUserOrders } from "../controllers/order.controller.js";
import { getRewardSummary, claimCoupon, validateCoupon } from "../controllers/reward.controller.js";

import { verifyJWTUser } from "../middlewares/auth.middleware.js";
import { uploadPlantImage } from "../middlewares/multerUpload.js";
import { upload } from "../middlewares/multer.middleware.js";
import { getplants } from "../controllers/plant.controller.js";


const router = Router()



router.route("/login").post(loginUser)
router.route("/contact").post(verifyJWTUser,contact)
router.route("/register").post(upload.single("avatar"),registerUser)
router.route("/change-Avatar").post(verifyJWTUser,upload.single("avatar"),updateUserAvatar)
router.route("/logout").post(verifyJWTUser,  logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWTUser, changeCurrentPassword)
router.route("/reset-password").post(resetpassword)
router.route("/current-user").get(verifyJWTUser, getCurrentUser)
router.route("/update-account").patch(verifyJWTUser, updateAccountDetails)
router.route("/get-plants").get(getplants)
router.route("/verify-otp").post(verifyOTP),
router.route("/resend-otp").post(resendOTP)
router.route("/upload-plant").post(
  verifyJWTUser,
  uploadPlantImage.single("image"),
  uploadcontroller
)
router.route("/payments/create-order").post(verifyJWTUser, createRazorpayOrder)
router.route("/payments/verify").post(verifyJWTUser, verifyRazorpayPayment)
router.route("/orders")
  .post(verifyJWTUser, createOrderRecord)
  .get(verifyJWTUser, getUserOrders)
router.route("/rewards/summary").get(verifyJWTUser, getRewardSummary)
router.route("/rewards/claim").post(verifyJWTUser, claimCoupon)
router.route("/rewards/validate").post(verifyJWTUser, validateCoupon)





export default router
