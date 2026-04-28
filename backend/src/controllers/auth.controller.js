const authService = require("../services/auth.service");

const REFRESH_TOKEN_DAYS = Number(process.env.REFRESH_TOKEN_DAYS || 7);

const cookieOptions = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite: process.env.COOKIE_SECURE === "true" ? "none" : "lax",
  path: "/api/auth",
};

const setRefreshCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    ...cookieOptions,
    maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie("refreshToken", cookieOptions);
};

const handleError = (res, error) => {
  return res.status(error.statusCode || 500).json({
    message: error.message || "Internal server error",
  });
};

const register = async (req, res) => {
  try {
    const result = await authService.register({
      body: req.body,
      ip: req.ip,
    });

    setRefreshCookie(res, result.refreshToken);

    return res.status(201).json({
      message: "User registered successfully",
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const login = async (req, res) => {
  try {
    const result = await authService.login({
      body: req.body,
      ip: req.ip,
    });

    setRefreshCookie(res, result.refreshToken);

    return res.json({
      message: "Login successful",
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    const result = await authService.refresh({
      refreshToken: token,
    });

    setRefreshCookie(res, result.refreshToken);

    return res.json({
      message: "Token refreshed",
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    clearRefreshCookie(res);
    return handleError(res, error);
  }
};

const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    await authService.logout({
      refreshToken: token,
    });

    clearRefreshCookie(res);

    return res.json({
      message: "Logged out successfully",
    });
  } catch (error) {
    clearRefreshCookie(res);
    return handleError(res, error);
  }
};

const me = async (req, res) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);

    return res.json({
      user,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
};