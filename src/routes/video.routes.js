import { Router } from "express";
import { uploadVideo, getAllVideos, getVideoById, updateVideoViews, deleteVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/")
  .get(getAllVideos) 
  .post(
    verifyJwt,
    upload.fields([
      { name: "video", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 }
    ]),
    uploadVideo
  );

router.route("/:videoId")
  .get(getVideoById)
  .delete(verifyJwt, deleteVideo);

router.route("/:videoId/views")
  .patch(updateVideoViews);

export default router;
