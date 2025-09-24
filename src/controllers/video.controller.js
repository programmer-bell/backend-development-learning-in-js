import asyncHandler from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { uploadToCloudinary } from "../utils/cloudnary.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const uploadVideo = asyncHandler(async (req, res) => {
  const { title, description, duration } = req.body;

  const videoLocalPath = req.files?.video?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video and thumbnail are required");
  }

  const videoUpload = await uploadToCloudinary(videoLocalPath);
  const thumbnailUpload = await uploadToCloudinary(thumbnailLocalPath);

  const video = await Video.create({
    title,
    description,
    duration,
    videoFile: videoUpload.url,
    thumbnail: thumbnailUpload.url,
    owner: req.user._id
  });

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video uploaded successfully"));
});

const getAllVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find({ isPublished: true })
    .populate("owner", "username fullName avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId).populate("owner", "username fullName avatar");

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideoViews = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } },
    { new: true }
  );

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "View count updated"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findOneAndDelete({
    _id: videoId,
    owner: req.user._id
  });

  if (!video) {
    throw new ApiError(404, "Video not found or not authorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

export {
  uploadVideo,
  getAllVideos,
  getVideoById,
  updateVideoViews,
  deleteVideo
};
