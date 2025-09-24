import { Router } from "express";
import {
  createComment,
  getVideoComments,
  deleteComment
} from "../controllers/comment.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

// Create comment
router.route("/")
  .post(verifyJwt, createComment);

// Get comments for a video
router.route("/video/:videoId")
  .get(getVideoComments);

// Delete comment
router.route("/:commentId")
  .delete(verifyJwt, deleteComment);

export default router;
