import mongoose, { Schema } from "mongoose";

const UploadSchema = new Schema(
  {
    Name: { type: String, required: true, lowercase: true },
    Image: { type: String, required: true },
    Points: { type: Number, default: 0 },
    Parameters: {
      height: Number,
      width: Number,
      leafArea: Number,
      greenPercent: Number,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ImageBuffer: {
  type: Buffer,
  required: true,
},
  },
  { timestamps: true }
);

export const Upload = mongoose.model("Upload", UploadSchema);
