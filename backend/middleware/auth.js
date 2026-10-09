import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ")
      ? header.substring(7)
      : null;

    if (!token) {
      return res.status(401).json({ message: "Login required" });
    }

    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}

export function allowRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission for this action"
      });
    }
    next();
  };
}
