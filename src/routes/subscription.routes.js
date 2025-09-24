import { Router } from "express";
import {
  subscribeToChannel,
  unsubscribeFromChannel,
  getUserSubscriptions,
  getUserSubscribers
} from "../controllers/subscription.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/")
  .post(verifyJwt, subscribeToChannel);

router.route("/subscriptions")
  .get(verifyJwt, getUserSubscriptions);

router.route("/subscribers")
  .get(verifyJwt, getUserSubscribers);

router.route("/:channelId")
  .delete(verifyJwt, unsubscribeFromChannel);

export default router;
