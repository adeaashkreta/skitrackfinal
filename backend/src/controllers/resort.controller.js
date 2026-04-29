const resortService = require("../services/resort.service");

const handleError = (res, error) => {
  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      message: "Duplicate record",
    });
  }

  if (error.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({
      message: "Invalid foreign key value",
    });
  }

  return res.status(error.statusCode || 500).json({
    message: error.message || "Internal server error",
  });
};

const listResorts = async (req, res) => {
  try {
    const result = await resortService.listResorts(req.query);

    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
};

const getResortById = async (req, res) => {
  try {
    const resort = await resortService.getResortById(req.params.id);

    return res.json({
      data: resort,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const createResort = async (req, res) => {
  try {
    const resort = await resortService.createResort(req.body, req.user);

    return res.status(201).json({
      message: "Resort created successfully",
      data: resort,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const updateResort = async (req, res) => {
  try {
    const resort = await resortService.updateResort(
      req.params.id,
      req.body,
      req.user
    );

    return res.json({
      message: "Resort updated successfully",
      data: resort,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const deleteResort = async (req, res) => {
  try {
    await resortService.deleteResort(req.params.id, req.user);

    return res.json({
      message: "Resort deactivated successfully",
    });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  listResorts,
  getResortById,
  createResort,
  updateResort,
  deleteResort,
};