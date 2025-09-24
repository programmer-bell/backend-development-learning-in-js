import asyncHandler from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import mongoose from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content?.trim()) {
    throw new ApiError(400, "Tweet content is required");
  }

  const tweet = await Tweet.create({
    content,
    owner: req.user._id
  });

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet posted successfully"));
});

const getAllTweets = asyncHandler(async (req, res) => {
  const tweets = await Tweet.find()
    .populate("owner", "username fullName avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  const tweet = await Tweet.findOneAndDelete({
    _id: tweetId,
    owner: req.user._id
  });

  if (!tweet) {
    throw new ApiError(404, "Tweet not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

export {
  createTweet,
  getAllTweets,
  deleteTweet
};
