import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        Username: {
            type: String,
            required: true,
            sparse: true
          },
          Fullname:{
            type: String,
            required: false,
            unique: true,
            lowercase: true,
          },
          Email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
          },
          Password: {
            type: String,
            required: true,
          },
          Country: {
            type: String,
            required: true,
          },
          phoneNumber: {
            type: Number,
            required: true,
          },
          Avatar: {
            type: String,
            required: false,
          },
        /*  isVerified: {
            type: Boolean,
            default: false,
          },
          otp: {
            type: Number,
          },
          otpExpiry: {
            type: Date,
          },
          refreshToken:{
            type:String,
           
          }*/
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next) {
  if (!this.isModified("Password")) return next();

  console.log("Hashing password:", this.Password); // Debug log
  this.Password = await bcrypt.hash(this.Password, 10);
  
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  console.log("Password from DB (hashed):", this.Password); // Debug log
  console.log("Password provided (plain text):", password); // Debug log

  if (!password) {
    throw new Error("Password is required for comparison");
  }
  if (!this.Password) {
    throw new Error("Password hash is missing in the database");
  }

  // Compare the provided password with the hashed password in the database
  const isMatch = await bcrypt.compare(password, this.Password);
  console.log("Password match result:", isMatch); // Debug log

  return isMatch;
};

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.Email,
            username: this.UserName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)