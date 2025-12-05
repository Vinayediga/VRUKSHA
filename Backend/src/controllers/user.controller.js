import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import crypto from "crypto";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import {SendEmail_for_Verification,SendMssg,sendUPdatedCcountDetails}  from "../utils/nodeMaile.js";
import bcrypt from "bcrypt";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import {Upload} from "../models/upload.model.js"
import {validateImage} from "../utils/Validateimage.js"
import { extractParams } from "../utils/extractParams.js";
import { compareImages } from "../utils/compareimages.js";

// ---------- Growth Scoring Helper ----------

function computeGrowthPoints(diff) {
  if (!diff || diff.error) return 0;

  const heightChange = Number(diff.heightChange ?? 0);
  const widthChange = Number(diff.widthChange ?? 0);
  const greenChange = Number(diff.greenChange ?? 0);

  // Main signal: size change (height/width)
  const maxSizeChange = Math.max(Math.abs(heightChange), Math.abs(widthChange));

  // Reject extreme / clearly noisy comparisons by giving 0 points
  if (maxSizeChange > 60 || greenChange < -30) {
    return 0;
  }

  // If green area jumps too much, treat as suspicious (different plant / lighting)
  if (greenChange > 50) {
    return 0;
  }

  let points = 0;

  // Base band from size change
  if (maxSizeChange < 1 && greenChange < 5) {
    // Essentially no growth
    points = 0;
  } else if (maxSizeChange < 2) {
    // Very small but consistent growth
    points = 3;
  } else if (maxSizeChange < 5) {
    // Sweet spot: steady, healthy growth
    points = 6;
  } else if (maxSizeChange < 10) {
    // Larger change: could be angle/distance noise
    points = 4;
  } else {
    // Very big change → suspicious, small reward only
    points = 1;
  }

  // Adjust with green area change (proxy for greenCount change)
  if (greenChange > 20) {
    points += 2; // a lot more green foliage
  } else if (greenChange > 10) {
    points += 1;
  } else if (greenChange < 0) {
    // Plant got visibly less green → penalize
    points -= 2;
  }

  // Clamp to [0, 10]
  if (points < 0) points = 0;
  if (points > 10) points = 10;

  return points;
}

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { Username, Email, Password, Country, phoneNumber } = req.body;
    console.log(Username);
    
  
    // Validate required fields
    if(!(Username&&Email)){
        throw new ApiError(400,"bad request")
    }
    console.log({phoneNumber});
    


    if (
      [Username, Email, Password, Country, phoneNumber].some(
        (field) => !field || field.trim() === ""
      )
    ) {
      throw new ApiError(400, "All fields are required");
    }
  
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) {
      throw new ApiError(400, "Invalid email format");
    }
  
    // Validate phone number (basic validation)
    const phoneRegex = /^[0-9]{10,15}$/; // Adjust regex based on your requirements
    if (!phoneRegex.test(phoneNumber)) {
      throw new ApiError(400, "Invalid phone number format");
    }
  
    // Check if user already exists
    const existedUser = await User.findOne({
      $or: [{ Username }, { Email }],
    });
  
    if (existedUser) {
      throw new ApiError(409, "User with email or username already exists");
    }
  
    // Check if file is uploaded
    
  
    // Validate file type (e.g., only allow images)
       // console.log("MimeType:",req.file.mimetype);
        

  
    // Convert file to base64
     // Generate OTP
  

    

    // Create user
    const newUser = await User.create({
   
        Username:Username,
        Email,
        Password,
        Country,
        phoneNumber: Number(phoneNumber),
    });

    // Fetch created user without sensitive fields
    const createdUser = await User.findById(newUser._id).select(
        "-refreshToken"
    );
  
    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user");
    }
   console.log(createdUser);
   
    // Return success response
    return res.status(201).json(
    
        new ApiResponse(
          200,
          createdUser,
          "User registered successfully. Please verify your OTP."
        )
      );
  });


  const verifyOTP = asyncHandler(async (req, res) => {
    const { userId, otp } = req.body;
  
    // Validate required fields
    if (!userId || !otp) {
      throw new ApiError(400, "User ID and OTP are required");
    }
  
    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    console.log("verify otp:",otp);
    console.log("user otp:",user.otp);
    console.log("type of",typeof(otp));
    console.log("type of",typeof(user.otp));
    
    if(otp==user.otp){
        console.log("same otp");
        
    }
    const OTP = Number(otp)
    console.log("type converted otp",OTP);
    
    // Check if OTP matches and is not expired
    if (user.otp !== Number(otp) || user.otpExpiry < Date.now()) {
      throw new ApiError(400, "Invalid or expired OTP");
    }
  
    // Mark user as verified
    user.isVerified = true;
    user.otp = undefined; // Clear OTP
    user.otpExpiry = undefined; // Clear OTP expiry
    await user.save();
  
    return res.status(200).json(
      new ApiResponse(200, {}, "OTP verified successfully. You can now log in.")
    );
  });

  const resendOTP = asyncHandler(async (req, res) => {
    const { userId } = req.body;
  
    // Validate required fields
    if (!userId) {
      throw new ApiError(400, "User ID is required");
    }
  
    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
  
    // Generate new OTP
    const OTP = crypto.randomInt(100000, 999999); // Generate a 6-digit OTP
    const otpExpiry = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes
  
    // Send OTP to user's email
    const emailSent = SendEmail_for_Verification(user.Email, OTP);
    if (!emailSent) {
      throw new ApiError(500, "Failed to send OTP");
    }
  
    // Update user with new OTP and expiry
    user.otp = OTP;
    user.otpExpiry = otpExpiry;
    await user.save();
  
    return res.status(200).json(
      new ApiResponse(200, {}, "New OTP sent successfully.")
    );
  });


  const loginUser = asyncHandler(async (req, res) => {
    const { Email, Username, Password } = req.body;
    console.log({Email,Username,Password});
    
  
    if (!Username && !Email) {
      throw new ApiError(400, "Username or email is required");
    }
  
    const user = await User.findOne({
      $or: [ { Email }],
    });
   
    
    if (!user) {
      throw new ApiError(404, "User does not exist");
    }
  console.log("Fetched user:", user);
    const isPasswordValid = await user.isPasswordCorrect(Password);
  
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid user credentials");
    }
  
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);
  
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
  
    const options = {
      httpOnly: true,
      secure: true,
      sameSite:"None",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expiry date
    };
  
    return res
      .status(200)
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,     // important
       sameSite: "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expiry date
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
          secure: false,     // important
    sameSite: "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expiry date
      })
      .json(

        {  user:loggedInUser,accessToken,refreshToken}


    );
  });



  
const logoutUser = asyncHandler(async(req, res) => {
  const update =  await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

   const user = await User.findById(req.user._id)
 //  console.log(user);
   
   
  /*  const options = {
        httpOnly: true,
        secure: true,
        sameSite:"strict"
    }
*/

    return res
    .status(200)
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
    })
    .json(new ApiResponse(200, {}, "User logged out successfully"));
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword,Email} = req.body

    

    const user = await User.findOne({Email})
    if(!user){
      throw new ApiError(400,"unauthorized request")
    }
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.Password = newPassword 
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const resetpassword = asyncHandler(async(req, res) => {
  const {password,Email} = req.body

  if(!(password&&Email)){
    throw new ApiError(400,"Email and Password are required")
  }

  const user = await User.findOne({Email})
  if(!user){
    throw new ApiError(400,"unauthorized request")
  }


  user.Password = password
  await user.save({validateBeforeSave: false})

  return res
  .status(200)
  .json({message:"sucess"})
})


const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})



const updateAccountDetails = asyncHandler(async (req, res) => {
  
  if (!req.body) {
    return res.status(200).json({message:"Request body is missing"});
}


  const { Username,Fullname, Email, Password, Country, phoneNumber,  } = req.body
  const updates = {};
  const changedFields = [];
  let oldEmailmessageId = ""
  let newmessageId = ""
  let messageId = ""

  const user = await User.findById(req.user?._id);
  const UserMail = user.Email

  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found"));
  }

  // Compare each field and update only if changed
  if (Username && Username !== user.Username) {
    updates.Username = Username;
    changedFields.push("Username");
  }
  if (Fullname && Fullname !== user.Fullname) {
    updates.Fullname = Fullname;
    changedFields.push("Fullname");
  }
  if (Email && Email !== user.Email) {
    updates.Email = Email;
    changedFields.push("Email");
  }
  if (Country && Country !== user.Country) {
    updates.Country = Country;
    changedFields.push("Country");
  }
  if (phoneNumber && phoneNumber !== user.phoneNumber) {
    updates.phoneNumber = phoneNumber;
    changedFields.push("Phone Number");
  }
  if (Password) {
    const isSamePassword = await bcrypt.compare(Password, user.Password);
    if (!isSamePassword) {
      updates.Password = await bcrypt.hash(Password, 10);
      changedFields.push("Password");
    }
  }

  if (Object.keys(updates).length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, user, "No changes were made to the account"));
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: updates },
    { new: true }
  ).select("-password");

  const query =
    "Updated account details: " + changedFields.join(", ") + ".";
 
    
    if (updatedUser.Email!=UserMail) {
      oldEmailmessageId =await  sendUPdatedCcountDetails(UserMail,query)
      newmessageId = await sendUPdatedCcountDetails(updatedUser.Email,query)
    }
    else{
     messageId = await sendUPdatedCcountDetails(updatedUser.Email,query)
      console.log("updated controller messageId",messageId);
    }
    if((oldEmailmessageId&&newmessageId))
    {
      return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, messageId));
    }
    else if(messageId){
      return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, messageId));
    }
});


const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

  
    // Validate file type (e.g., only allow images)
        console.log("MimeType:",req.file.mimetype);

    //TODO: delete old image - assignment

    console.log(req.file);
     
    const meta = Datauri(req.file.path);
    console.log("controller update avatar",req.user._id);
    

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
              Avatar: meta.base64
            }
        },
        {new: true}
    ).select("-password")

    if(!user){
      throw new ApiError(400,"user not found")
    }

    console.log("Avatar updated:",user);
    

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})













const ForgotPassword = asyncHandler(async(req,res)=>{
    const {email} = req.body
    if(!email){
        throw new ApiError(400,"Email is required")

    }
    const user = await User.findOne({"email":email})


    if(!user){
        throw new ApiError(400,"no user exists with that email")
    }
    console.log("Reset password secret:", process.env.RESET_PASSWORD_SECRET);

    const resetToken = jwt.sign({_id:user._id}, process.env.RESET_PASSWORD_SECRET || "default_secret_key",{expiresIn:"15min"})
    
   

    const sendResetPasswordRequest = Password_reset(email,resetToken)
    const messg_data = JSON.parse(sendResetPasswordRequest)
    if(!messg_data){
        throw new ApiError(500,"Something went wrong")
    }
  
    

    return res
    .status(200)
    .json(new ApiResponse(200, messg_data))


    


})


const contact = asyncHandler(async(req,res)=>{
    const {email,query} = req.body
    if(!(email&&query)){
        throw new ApiError(400,"Email and message is required is required")

    }


 
    
    
   

    const info = SendMssg(email,query)
    if(!info){
        throw new ApiError(500,"Something went wrong")
    }
    const mssgID = info.messageId
    if(!mssgID){
        throw new ApiError(500,"Something went wrong")
    }
    const message = await Message.create({
        messages:[{
              msg:query
        }]
    })

    

    return res
    .status(200)
    .json(new ApiResponse(200,mssgID ))


    


})

const getmessages = asyncHandler(async(req,res)=>{
    const messages = await Message.find({user:req.user._id})
    if(!messages){
        throw new ApiError(400,"no messages are there")

    }

    return res.status(201).json(ApiResponse(201,messages,"messages fetched successfully"))
})

const uploadcontroller = asyncHandler(async(req,res)=>{
   const buffer = req.file.buffer;

    // 1. validate
    const v = await validateImage(buffer);
    if (!v.valid) return res.status(400).json({ error: v.reason });

    // 2. extract params
    const params = await extractParams(buffer);

    // 3. Check previous upload
    const previous = await Upload.findOne({ user: req.user._id }).sort({ createdAt: -1 });

    let diff = null;
    let points = 0;

    if (previous && previous.ImageBuffer) {
      try {
        diff = await compareImages(previous.ImageBuffer, buffer);

        if (diff?.error) {
          return res
            .status(400)
            .json({ error: diff.error, details: diff });
        }

        // If green area increased too much, treat as suspicious and block upload
        if (Number(diff.greenChange ?? 0) > 50) {
          return res.status(400).json({
            error:
              "Green area change is too large (>50%). Please upload a consistent plant photo.",
            comparison: diff,
          });
        }

        // Use HSV-based size + green change to compute points
        points = computeGrowthPoints(diff);
      } catch (error) {
        console.error("Error comparing images:", error);
        return res.status(400).json({
          error: "Comparison failed",
          message: error.message,
        });
      }
    }

    // 4. Ensure uploads directory exists and save image file
    const uploadsDir = path.resolve("public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const filename = `plant_${Date.now()}.jpg`;
    const absolutePath = path.join(uploadsDir, filename);
    await sharp(buffer).jpeg().toFile(absolutePath);

    // Store path relative to project root for consistency
    const relativePath = path.relative(process.cwd(), absolutePath).replace(/\\/g, "/");

    // 5. save db entry
    console.log("Upload comparison result:", {
      user: req.user._id,
      points,
      diff,
    });

    const upload = await Upload.create({
      Name: req.body.name,
      Image: relativePath,
      ImageBuffer: buffer, // optional, but helpful
      Points: points,
      Parameters: params,
      user: req.user._id,
    });

    const responsePayload = {
      success: true,
      upload,
      diff,
      points,
    };

    console.log("Upload response payload:", responsePayload);

    return res.json(responsePayload);
})




export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    ForgotPassword,
    contact,
    updateUserAvatar,
    verifyOTP,
    resendOTP,
    resetpassword,
    uploadcontroller,
}