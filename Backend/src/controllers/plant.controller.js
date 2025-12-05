import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { Plant } from "../models/plant.model.js";






const getplants = asyncHandler(async (req,res)=>{
   
    const plants = await Plant.find({})

    return res.status(201).json(
    
        new ApiResponse(
          200,
          plants,
          "plants fetched successfully"
        )
      );
})



export {getplants}

