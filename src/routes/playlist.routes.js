import { Router } from "express";
import {
  createPlaylist,
  getUserPlaylists,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist
} from "../controllers/playlist.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/")
  .post(verifyJwt, createPlaylist)
  .get(verifyJwt, getUserPlaylists);

router.route("/add-video")
  .patch(verifyJwt, addVideoToPlaylist);

router.route("/remove-video")
  .patch(verifyJwt, removeVideoFromPlaylist);

router.route("/:playlistId")
  .delete(verifyJwt, deletePlaylist);

export default router;
