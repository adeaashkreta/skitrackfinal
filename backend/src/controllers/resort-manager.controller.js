const service = require("../services/resort-manager.service");

const handleError = (res, error) => {
  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      message: "This user is already assigned as manager for this resort",
    });
  }

  if (error.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({
      message: "Invalid resort_id or user_id",
    });
  }

  return res.status(error.statusCode || 500).json({
    message: error.message || "Internal server error",
  });
};

const listResortManagers = async (req, res) => {
  try {
    const result = await service.listResortManagers(req.query);

    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
};

const getResortManagerById = async (req, res) => {
  try {
    const result = await service.getResortManagerById(req.params.id);

    return res.json({
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const createResortManager = async (req, res) => {
  try {
    const result = await service.createResortManager(
      req.body,
      req.user,
      req.ip
    );

    return res.status(201).json({
      message: "Resort manager assigned successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const updateResortManager = async (req, res) => {
  try {
    const result = await service.updateResortManager(
      req.params.id,
      req.body,
      req.user,
      req.ip
    );

    return res.json({
      message: "Resort manager updated successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const deactivateResortManager = async (req, res) => {
  try {
    await service.deactivateResortManager(req.params.id, req.user, req.ip);

    return res.json({
      message: "Resort manager deactivated successfully",
    });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  listResortManagers,
  getResortManagerById,
  createResortManager,
  updateResortManager,
  deactivateResortManager,
};