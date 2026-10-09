import { Router } from "express";
import { createPaymentOrder, verifyPayment } from "../controllers/paymentController.js";
import { authenticate, allowRoles } from "../middleware/auth.js";

const router = Router();

router.post("/create-order", authenticate, allowRoles("student"), createPaymentOrder);
router.post("/verify", authenticate, allowRoles("student"), verifyPayment);

export default router;
