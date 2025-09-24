import asyncHandler from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import mongoose from "mongoose";

const toggleLike = asyncHandler(async (req, res) => {
  const { type, id } = req.body;

  if (!["video", "comment", "tweet"].includes(type)) {
    throw new ApiError(400, "Invalid like type");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid ID");
  }

  const filter = {
    likedBy: req.user._id,
    [type]: id
  };

  const existingLike = await Like.findOne(filter);

  let action = "liked";

  if (existingLike) {
    await existingLike.deleteOne();
    action = "unliked";
  } else {
    await Like.create(filter);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, `Successfully ${action}`));
});

const getLikesCount = asyncHandler(async (req, res) => {
  const { type, id } = req.params;

  if (!["video", "comment", "tweet"].includes(type)) {
    throw new ApiError(400, "Invalid like type");
  }

  const count = await Like.countDocuments({ [type]: id });

  return res
    .status(200)
    .json(new ApiResponse(200, { count }, "Like count fetched"));
});

export { toggleLike, getLikesCount };
