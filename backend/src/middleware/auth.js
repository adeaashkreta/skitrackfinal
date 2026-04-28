const jwt = require("jsonwebtoken");
const authRepository = require("../repositories/auth.repository");

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";

    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Missing token",
      });
    }

    const token = header.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await authRepository.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        message: "User is inactive",
      });
    }

    const roles = await authRepository.getUserRoles(user.id);

    req.user = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      roles,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRoles = req.user?.roles || [];

    const allowed = allowedRoles.map((role) => role.toLowerCase());

    const hasRole = userRoles.some((role) =>
      allowed.includes(role.toLowerCase())
    );

    if (!hasRole) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    next();
  };
};

module.exports = {
  auth,
  requireRole,
};