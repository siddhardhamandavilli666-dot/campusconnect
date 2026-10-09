import { Router } from "express";
import {
  createRequest,
  getMyRequests,
  getOpenRequests
} from "../controllers/requestController.js";
import { authenticate, allowRoles } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();

router.get("/my", authenticate, allowRoles("student"), getMyRequests);
router.get("/open", authenticate, allowRoles("vendor"), getOpenRequests);
router.post(
  "/",
  authenticate,
  allowRoles("student"),
  upload.single("attachment"),
  createRequest
);

export default router;
