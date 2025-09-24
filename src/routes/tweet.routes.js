import { Router } from "express";
import {
  createTweet,
  getAllTweets,
  deleteTweet
} from "../controllers/tweet.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

// Create tweet
router.route("/")
  .post(verifyJwt, createTweet);

// Get all tweets
router.route("/")
  .get(getAllTweets);

// Delete tweet
router.route("/:tweetId")
  .delete(verifyJwt, deleteTweet);

export default router;
