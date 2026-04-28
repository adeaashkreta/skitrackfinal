const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const authRepository = require("../repositories/auth.repository");

const REFRESH_TOKEN_DAYS = Number(process.env.REFRESH_TOKEN_DAYS || 7);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const hashRefreshToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const createRawRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

const createAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );
};

const normalizeEmail = (email) => {
  return String(email || "").trim().toLowerCase();
};

const getRefreshTokenExpiry = () => {
  return new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
};

const getCurrentUser = async (userId) => {
  const user = await authRepository.findUserById(userId);

  if (!user) {
    throw createError("User not found", 404);
  }

  const roles = await authRepository.getUserRoles(user.id);

  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    is_active: Boolean(user.is_active),
    created_at: user.created_at,
    roles,
  };
};

const register = async ({ body = {}, ip } = {}) => {
  const firstName = String(body.first_name || "").trim();
  const lastName = String(body.last_name || "").trim();
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");

  if (!firstName || !lastName || !email || !password) {
    throw createError(
      "first_name, last_name, email and password are required",
      400
    );
  }

  if (password.length < 6) {
    throw createError("Password must be at least 6 characters", 400);
  }

  const existingUser = await authRepository.findUserByEmail(email);

  if (existingUser) {
    throw createError("Email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await authRepository.withTransaction(async (connection) => {
    const userId = await authRepository.createUser(
      {
        first_name: firstName,
        last_name: lastName,
        email,
        password_hash: passwordHash,
      },
      connection
    );

    await authRepository.updateUserAuditFields(userId, connection);

    const userRole = await authRepository.findRoleByName("User", connection);

    if (!userRole) {
      throw createError("Default role User does not exist", 500);
    }

    await authRepository.assignRoleToUser(
      {
        user_id: userId,
        role_id: userRole.id,
        created_by: userId,
        updated_by: userId,
      },
      connection
    );

    const rawRefreshToken = createRawRefreshToken();
    const tokenHash = hashRefreshToken(rawRefreshToken);

    await authRepository.createRefreshToken(
      {
        user_id: userId,
        token_hash: tokenHash,
        expires_at: getRefreshTokenExpiry(),
        created_by: userId,
        updated_by: userId,
      },
      connection
    );

    return {
      userId,
      refreshToken: rawRefreshToken,
    };
  });

  const user = await getCurrentUser(result.userId);
  const accessToken = createAccessToken(user);

  await authRepository.createAuditLog({
    user_id: user.id,
    action: "REGISTER",
    entity: "users",
    entity_id: user.id,
    old_value: null,
    new_value: JSON.stringify({ email: user.email }),
    ip_address: ip,
  });

  return {
    user,
    accessToken,
    refreshToken: result.refreshToken,
  };
};

const login = async ({ body = {}, ip } = {}) => {
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");

  if (!email || !password) {
    throw createError("Email and password are required", 400);
  }

  const userRow = await authRepository.findUserByEmail(email);

  if (!userRow) {
    throw createError("Invalid credentials", 401);
  }

  if (!userRow.is_active) {
    throw createError("User is inactive", 403);
  }

  const passwordOk = await bcrypt.compare(password, userRow.password_hash);

  if (!passwordOk) {
    throw createError("Invalid credentials", 401);
  }

  const result = await authRepository.withTransaction(async (connection) => {
    const rawRefreshToken = createRawRefreshToken();
    const tokenHash = hashRefreshToken(rawRefreshToken);

    await authRepository.createRefreshToken(
      {
        user_id: userRow.id,
        token_hash: tokenHash,
        expires_at: getRefreshTokenExpiry(),
        created_by: userRow.id,
        updated_by: userRow.id,
      },
      connection
    );

    return {
      refreshToken: rawRefreshToken,
    };
  });

  const user = await getCurrentUser(userRow.id);
  const accessToken = createAccessToken(user);

  await authRepository.createAuditLog({
    user_id: user.id,
    action: "LOGIN",
    entity: "users",
    entity_id: user.id,
    old_value: null,
    new_value: null,
    ip_address: ip,
  });

  return {
    user,
    accessToken,
    refreshToken: result.refreshToken,
  };
};

const refresh = async ({ refreshToken }) => {
  if (!refreshToken) {
    throw createError("Missing refresh token", 401);
  }

  const tokenHash = hashRefreshToken(refreshToken);

  const tokenRow = await authRepository.findValidRefreshToken(tokenHash);

  if (!tokenRow) {
    throw createError("Invalid refresh token", 401);
  }

  const result = await authRepository.withTransaction(async (connection) => {
    await authRepository.revokeRefreshToken(
      {
        refresh_token_id: tokenRow.refresh_token_id,
        user_id: tokenRow.user_id,
      },
      connection
    );

    const newRawRefreshToken = createRawRefreshToken();
    const newTokenHash = hashRefreshToken(newRawRefreshToken);

    await authRepository.createRefreshToken(
      {
        user_id: tokenRow.user_id,
        token_hash: newTokenHash,
        expires_at: getRefreshTokenExpiry(),
        created_by: tokenRow.user_id,
        updated_by: tokenRow.user_id,
      },
      connection
    );

    return {
      refreshToken: newRawRefreshToken,
    };
  });

  const user = await getCurrentUser(tokenRow.user_id);
  const accessToken = createAccessToken(user);

  return {
    user,
    accessToken,
    refreshToken: result.refreshToken,
  };
};

const logout = async ({ refreshToken }) => {
  if (!refreshToken) {
    return;
  }

  const tokenHash = hashRefreshToken(refreshToken);

  await authRepository.revokeRefreshTokenByHash(tokenHash);
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getCurrentUser,
};