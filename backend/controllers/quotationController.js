import { pool } from "../config/db.js";

export async function createQuotation(req, res) {
  try {
    const { request_id, amount, message } = req.body;

    if (!request_id || !amount) {
      return res.status(400).json({
        message: "Request and amount are required"
      });
    }

    const [request] = await pool.query(
      "SELECT id FROM service_requests WHERE id = ?",
      [request_id]
    );

    if (!request.length) {
      return res.status(404).json({
        message: "Request not found"
      });
    }

    await pool.query(
      `INSERT INTO quotations
       (request_id,vendor_id,amount,message)
       VALUES(?,?,?,?)`,
      [
        request_id,
        req.user.id,
        Number(amount),
        message || ""
      ]
    );

    await pool.query(
      "UPDATE service_requests SET status='QUOTED' WHERE id=?",
      [request_id]
    );

    res.status(201).json({
      message: "Quotation submitted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

export async function getMyQuotations(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT q.*, r.title, r.service_type,
             u.name AS vendor_name
      FROM quotations q
      JOIN service_requests r ON r.id=q.request_id
      JOIN users u ON u.id=q.vendor_id
      WHERE r.student_id=?
      ORDER BY q.created_at DESC
    `, [req.user.id]);

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

export async function getVendorQuotations(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT q.*, r.title, r.service_type,
             u.name AS student_name
      FROM quotations q
      JOIN service_requests r ON r.id=q.request_id
      JOIN users u ON u.id=r.student_id
      WHERE q.vendor_id=?
      ORDER BY q.created_at DESC
    `, [req.user.id]);

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

export async function acceptQuotation(req, res) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(`
      SELECT q.*, r.student_id
      FROM quotations q
      JOIN service_requests r ON r.id=q.request_id
      WHERE q.id=?
    `, [req.params.id]);

    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({
        message: "Quotation not found"
      });
    }

    const quotation = rows[0];

    if (quotation.student_id !== req.user.id) {
      await connection.rollback();
      return res.status(403).json({
        message: "This quotation does not belong to you"
      });
    }

    await connection.query(
      `UPDATE quotations
       SET status='REJECTED'
       WHERE request_id=? AND id<>?`,
      [quotation.request_id, quotation.id]
    );

    await connection.query(
      "UPDATE quotations SET status='ACCEPTED' WHERE id=?",
      [quotation.id]
    );

    await connection.query(
      "UPDATE service_requests SET status='ACCEPTED' WHERE id=?",
      [quotation.request_id]
    );

    const [order] = await connection.query(
      `INSERT INTO orders
       (request_id,quotation_id,student_id,vendor_id,amount,payment_status)
       VALUES(?,?,?,?,?, 'PENDING')`,
      [
        quotation.request_id,
        quotation.id,
        quotation.student_id,
        quotation.vendor_id,
        quotation.amount
      ]
    );

    await connection.commit();

    res.json({
      message: "Quotation accepted and order created",
      order_id: order.insertId
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({
      message: error.message
    });
  } finally {
    connection.release();
  }
}
