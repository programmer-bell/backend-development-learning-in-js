import asyncHandler from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    throw new ApiError(400, "Name and description are required");
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id
  });

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const playlists = await Playlist.find({ owner: req.user._id })
    .populate("videos")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "User playlists fetched"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.body;

  const playlist = await Playlist.findOneAndUpdate(
    { _id: playlistId, owner: req.user._id },
    { $addToSet: { videos: videoId } },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(404, "Playlist not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video added to playlist"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.body;

  const playlist = await Playlist.findOneAndUpdate(
    { _id: playlistId, owner: req.user._id },
    { $pull: { videos: videoId } },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(404, "Playlist not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video removed from playlist"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  const playlist = await Playlist.findOneAndDelete({
    _id: playlistId,
    owner: req.user._id
  });

  if (!playlist) {
    throw new ApiError(404, "Playlist not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted"));
});

export {
  createPlaylist,
  getUserPlaylists,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist
};
