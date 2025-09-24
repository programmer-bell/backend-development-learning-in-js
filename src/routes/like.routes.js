import { Router } from "express";
import { toggleLike, getLikesCount } from "../controllers/like.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

// Toggle like/unlike
router.route("/")
  .post(verifyJwt, toggleLike);

// Get like count
router.route("/:type/:id")
  .get(getLikesCount);

export default router;
