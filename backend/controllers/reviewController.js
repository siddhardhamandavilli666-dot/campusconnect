import { pool } from "../config/db.js";

export async function createReview(req, res) {
  try {
    const { order_id, rating, comment } = req.body;

    if (!order_id || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5"
      });
    }

    const [orders] = await pool.query(
      `SELECT * FROM orders
       WHERE id=? AND student_id=? AND status='COMPLETED'`,
      [order_id, req.user.id]
    );

    if (!orders.length) {
      return res.status(404).json({
        message: "Completed order not found"
      });
    }

    const order = orders[0];

    await pool.query(
      `INSERT INTO reviews
       (order_id,student_id,vendor_id,rating,comment)
       VALUES(?,?,?,?,?)`,
      [
        order_id,
        req.user.id,
        order.vendor_id,
        Number(rating),
        comment || ""
      ]
    );

    res.status(201).json({
      message: "Review submitted successfully"
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "You already reviewed this order"
      });
    }

    res.status(500).json({
      message: error.message
    });
  }
}
