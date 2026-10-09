import fs from "fs/promises";
import path from "path";
import { pool } from "../config/db.js";
import { uploadDir } from "../middleware/upload.js";

const SERVICE_RULES = {
  Printing: {
    allowed: ["application/pdf", "image/jpeg", "image/png", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    required: true
  },
  Repair: {
    allowed: ["image/jpeg", "image/png"],
    required: false
  },
  Stationery: {
    allowed: ["image/jpeg", "image/png"],
    required: false
  },
  Other: {
    allowed: ["application/pdf", "image/jpeg", "image/png"],
    required: false
  },
  Food: { allowed: [], required: false },
  Transport: { allowed: [], required: false }
};

async function removeUploadedFile(file) {
  if (!file?.path) return;
  try {
    await fs.unlink(file.path);
  } catch {
    // Ignore cleanup failures.
  }
}

export async function createRequest(req, res) {
  let connection;

  try {
    const {
      service_type,
      title,
      description,
      location,
      budget,
      copies,
      print_type,
      paper_size,
      sides,
      device_type,
      pickup_location,
      drop_location,
      travel_date,
      travel_time,
      people_count,
      special_requirements
    } = req.body;

    if (!service_type || !title || !description || !location) {
      await removeUploadedFile(req.file);
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const rule = SERVICE_RULES[service_type];
    if (!rule) {
      await removeUploadedFile(req.file);
      return res.status(400).json({ message: "Invalid service type" });
    }

    if (rule.required && !req.file) {
      return res.status(400).json({
        message: "Please upload the file you want to print."
      });
    }

    if (req.file && !rule.allowed.includes(req.file.mimetype)) {
      await removeUploadedFile(req.file);
      return res.status(400).json({
        message: `Invalid attachment type for ${service_type}.`
      });
    }

    if (!rule.allowed.length && req.file) {
      await removeUploadedFile(req.file);
      return res.status(400).json({
        message: `${service_type} requests do not need an attachment.`
      });
    }

    if (service_type === "Printing") {
      if (!copies || Number(copies) < 1) {
        await removeUploadedFile(req.file);
        return res.status(400).json({ message: "Number of copies must be at least 1" });
      }
      if (!print_type || !paper_size || !sides) {
        await removeUploadedFile(req.file);
        return res.status(400).json({ message: "Please select all printing options" });
      }
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO service_requests
       (student_id,service_type,title,description,location,budget,
        copies,print_type,paper_size,sides,device_type,pickup_location,
        drop_location,travel_date,travel_time,people_count,special_requirements)
       VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        req.user.id,
        service_type,
        title,
        description,
        location,
        Number(budget) || 0,
        service_type === "Printing" ? Number(copies) : null,
        service_type === "Printing" ? print_type : null,
        service_type === "Printing" ? paper_size : null,
        service_type === "Printing" ? sides : null,
        service_type === "Repair" ? device_type || null : null,
        service_type === "Transport" ? pickup_location || null : null,
        service_type === "Transport" ? drop_location || null : null,
        service_type === "Transport" ? travel_date || null : null,
        service_type === "Transport" ? travel_time || null : null,
        service_type === "Transport" ? Number(people_count) || 1 : null,
        special_requirements || null
      ]
    );

    if (req.file) {
      const fileUrl = `/uploads/${path.basename(req.file.path)}`;
      await connection.query(
        `INSERT INTO request_attachments
         (request_id,file_name,file_url,mime_type,file_size)
         VALUES(?,?,?,?,?)`,
        [
          result.insertId,
          req.file.originalname,
          fileUrl,
          req.file.mimetype,
          req.file.size
        ]
      );
    }

    await connection.commit();

    const [rows] = await pool.query(
      `SELECT r.*, a.id AS attachment_id, a.file_name, a.file_url, a.mime_type, a.file_size
       FROM service_requests r
       LEFT JOIN request_attachments a ON a.request_id=r.id
       WHERE r.id=?`,
      [result.insertId]
    );

    res.status(201).json({
      message: "Request created successfully",
      request: rows[0]
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch {}
    }
    await removeUploadedFile(req.file);
    res.status(500).json({ message: error.message });
  } finally {
    connection?.release();
  }
}

const requestWithAttachment = `
  SELECT r.*,
         a.id AS attachment_id,
         a.file_name,
         a.file_url,
         a.mime_type,
         a.file_size
  FROM service_requests r
  LEFT JOIN request_attachments a ON a.request_id=r.id
`;

export async function getMyRequests(req, res) {
  try {
    const [rows] = await pool.query(
      `${requestWithAttachment}
       WHERE r.student_id = ?
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getOpenRequests(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT r.*, u.name AS student_name,
             a.id AS attachment_id,
             a.file_name,
             a.file_url,
             a.mime_type,
             a.file_size
      FROM service_requests r
      JOIN users u ON u.id = r.student_id
      LEFT JOIN request_attachments a ON a.request_id = r.id
      WHERE r.status IN ('OPEN','QUOTED')
      ORDER BY r.created_at DESC
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
