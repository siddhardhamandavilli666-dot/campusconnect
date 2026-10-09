import { pool } from "../config/db.js";

export async function getMyOrders(req, res) {
  try {
    const field =
      req.user.role === "student"
        ? "o.student_id"
        : "o.vendor_id";

    const [rows] = await pool.query(`
      SELECT o.*, r.title, r.service_type,
             s.name AS student_name,
             v.name AS vendor_name,
             q.amount
      FROM orders o
      JOIN service_requests r ON r.id=o.request_id
      JOIN users s ON s.id=o.student_id
      JOIN users v ON v.id=o.vendor_id
      JOIN quotations q ON q.id=o.quotation_id
      WHERE ${field}=?
      ORDER BY o.created_at DESC
    `, [req.user.id]);

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body;

    const allowed = [
      "PLACED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED"
    ];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status"
      });
    }

    const [existing] = await pool.query(
      `SELECT id, payment_status FROM orders WHERE id=? AND vendor_id=?`,
      [req.params.id, req.user.id]
    );

    if (!existing.length) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    if (["IN_PROGRESS", "COMPLETED"].includes(status) && existing[0].payment_status !== "PAID") {
      return res.status(400).json({
        message: "Student payment is required before this order can proceed"
      });
    }

    const [result] = await pool.query(
      `UPDATE orders
       SET status=?
       WHERE id=? AND vendor_id=?`,
      [status, req.params.id, req.user.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    if (status === "COMPLETED") {
      await pool.query(
        `UPDATE service_requests r
         JOIN orders o ON o.request_id=r.id
         SET r.status='COMPLETED'
         WHERE o.id=?`,
        [req.params.id]
      );
    }

    res.json({
      message: "Order status updated"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}
