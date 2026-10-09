import { Router } from "express";
import { createReview } from "../controllers/reviewController.js";
import { authenticate, allowRoles } from "../middleware/auth.js";

const router = Router();

router.post("/", authenticate, allowRoles("student"), createReview);

export default router;
