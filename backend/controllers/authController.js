import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (!["student", "vendor"].includes(role)) {
      return res.status(400).json({
        message: "Invalid account type"
      });
    }

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users(name,email,password,role)
       VALUES(?,?,?,?)`,
      [name, email, hashedPassword, role]
    );

    const user = {
      id: result.insertId,
      name,
      email,
      role
    };

    res.status(201).json({
      user,
      token: createToken(user)
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const user = rows[0];

    const valid = await bcrypt.compare(
      password,
      user.password
    );

    if (!valid) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.json({
      user: safeUser,
      token: createToken(safeUser)
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}
