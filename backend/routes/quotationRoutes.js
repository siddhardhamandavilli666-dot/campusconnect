import { Router } from "express";
import {
  createQuotation,
  getMyQuotations,
  getVendorQuotations,
  acceptQuotation
} from "../controllers/quotationController.js";
import { authenticate, allowRoles } from "../middleware/auth.js";

const router = Router();

router.post("/", authenticate, allowRoles("vendor"), createQuotation);
router.get("/my", authenticate, allowRoles("student"), getMyQuotations);
router.get("/vendor", authenticate, allowRoles("vendor"), getVendorQuotations);
router.post("/:id/accept", authenticate, allowRoles("student"), acceptQuotation);

export default router;
