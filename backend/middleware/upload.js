import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const uploadDir = process.env.UPLOAD_DIR || (process.env.VERCEL ? path.join("/tmp", "uploads") : path.resolve("uploads"));
try {
  fs.mkdirSync(uploadDir, { recursive: true });
} catch (e) {
  console.warn("Could not create uploads directory:", e.message);
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
    cb(null, safeName);
  }
});

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new Error("Unsupported file type. Use PDF, JPG, PNG, DOC or DOCX."));
    }
    cb(null, true);
  }
});

export default upload;
export { uploadDir };
