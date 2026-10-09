import { Router } from "express";
import {
  getMyOrders,
  updateOrderStatus
} from "../controllers/orderController.js";
import { authenticate, allowRoles } from "../middleware/auth.js";

const router = Router();

router.get("/my", authenticate, getMyOrders);
router.patch("/:id/status", authenticate, allowRoles("vendor"), updateOrderStatus);

export default router;
