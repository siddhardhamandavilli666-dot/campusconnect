import crypto from "crypto";
import Razorpay from "razorpay";
import { pool } from "../config/db.js";

function razorpayClient() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay test keys are not configured in backend/.env");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

export async function createPaymentOrder(req, res) {
  try {
    const { order_id } = req.body;
    const [rows] = await pool.query(
      `SELECT o.*, q.amount
       FROM orders o
       JOIN quotations q ON q.id=o.quotation_id
       WHERE o.id=? AND o.student_id=?`,
      [order_id, req.user.id]
    );

    if (!rows.length) return res.status(404).json({ message: "Order not found" });
    const order = rows[0];

    if (order.payment_status === "PAID") {
      return res.status(400).json({ message: "Order is already paid" });
    }
    if (order.status === "CANCELLED") {
      return res.status(400).json({ message: "Cancelled orders cannot be paid" });
    }

    const amount = Number(order.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid order amount" });
    }

    const razorpay = razorpayClient();
    const rpOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `campusconnect_${order.id}`,
      notes: { campusconnect_order_id: String(order.id) }
    });

    await pool.query(
      `UPDATE orders SET razorpay_order_id=?, payment_status='PENDING' WHERE id=?`,
      [rpOrder.id, order.id]
    );

    res.json({
      key_id: process.env.RAZORPAY_KEY_ID,
      razorpay_order_id: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      name: "CampusConnect",
      description: order.title || "Campus service order",
      prefill: { name: req.user.name, email: req.user.email }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function verifyPayment(req, res) {
  try {
    const {
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const [rows] = await pool.query(
      `SELECT * FROM orders WHERE id=? AND student_id=?`,
      [order_id, req.user.id]
    );

    if (!rows.length) return res.status(404).json({ message: "Order not found" });
    const order = rows[0];

    if (order.razorpay_order_id !== razorpay_order_id) {
      return res.status(400).json({ message: "Payment order mismatch" });
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      await pool.query(
        `UPDATE orders SET payment_status='FAILED' WHERE id=?`,
        [order.id]
      );
      return res.status(400).json({ message: "Payment verification failed" });
    }

    await pool.query(
      `UPDATE orders
       SET payment_status='PAID', razorpay_payment_id=?
       WHERE id=?`,
      [razorpay_payment_id, order.id]
    );

    res.json({ message: "Payment verified successfully", payment_status: "PAID" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
