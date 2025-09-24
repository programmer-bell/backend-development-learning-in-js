import asyncHandler from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import mongoose from "mongoose";

const subscribeToChannel = asyncHandler(async (req, res) => {
  const { channelId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  if (channelId === req.user._id.toString()) {
    throw new ApiError(400, "You cannot subscribe to yourself");
  }

  const existingSub = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId
  });

  if (existingSub) {
    throw new ApiError(400, "Already subscribed");
  }

  const subscription = await Subscription.create({
    subscriber: req.user._id,
    channel: channelId
  });

  return res
    .status(201)
    .json(new ApiResponse(201, subscription, "Subscribed successfully"));
});

const unsubscribeFromChannel = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const result = await Subscription.findOneAndDelete({
    subscriber: req.user._id,
    channel: channelId
  });

  if (!result) {
    throw new ApiError(404, "Subscription not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Unsubscribed successfully"));
});

const getUserSubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.find({
    subscriber: req.user._id
  }).populate("channel", "username fullName avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, subscriptions, "Subscribed channels fetched"));
});

const getUserSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await Subscription.find({
    channel: req.user._id
  }).populate("subscriber", "username fullName avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, subscribers, "Subscribers fetched"));
});

export {
  subscribeToChannel,
  unsubscribeFromChannel,
  getUserSubscriptions,
  getUserSubscribers
};
