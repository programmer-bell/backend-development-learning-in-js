import asyncHandler from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import mongoose from "mongoose";

const createComment = asyncHandler(async (req, res) => {
  const { content, videoId } = req.body;

  if (!content || !videoId) {
    throw new ApiError(400, "Content and videoId are required");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id
  });

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment posted successfully"));
});

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const comments = await Comment.find({ video: videoId })
    .populate("owner", "username fullName avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findOneAndDelete({
    _id: commentId,
    owner: req.user._id
  });

  if (!comment) {
    throw new ApiError(404, "Comment not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export {
  createComment,
  getVideoComments,
  deleteComment
};
