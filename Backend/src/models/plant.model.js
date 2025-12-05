import mongoose, { Schema } from "mongoose";

const PlantSchema = new Schema(
  {
    PlantName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    images: {
      type: [String],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    About:{
        type:String,
        required:true
    },
    type:{
        type:String,
        required:true
    },
    difficulty:{
        type:String,
        required:true
    },
    
    
  },
  {
    timestamps: true,
  }
);

export const Plant = mongoose.model("Plant", PlantSchema);
