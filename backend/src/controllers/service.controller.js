const serviceService = require("../services/service.service");

const handleError = (res, error) => {
  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      message: "Duplicate record",
    });
  }

  if (error.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({
      message: "Invalid resort_id or service_type_id",
    });
  }

  if (error.code === "ER_ROW_IS_REFERENCED_2") {
    return res.status(409).json({
      message: "Cannot delete this record because it is already in use",
    });
  }

  return res.status(error.statusCode || 500).json({
    message: error.message || "Internal server error",
  });
};

const listServiceTypes = async (req, res) => {
  try {
    const result = await serviceService.listServiceTypes(req.query);
    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
};

const getServiceTypeById = async (req, res) => {
  try {
    const serviceType = await serviceService.getServiceTypeById(req.params.id);

    return res.json({
      data: serviceType,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const createServiceType = async (req, res) => {
  try {
    const serviceType = await serviceService.createServiceType(
      req.body,
      req.user,
      req.ip
    );

    return res.status(201).json({
      message: "Service type created successfully",
      data: serviceType,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const updateServiceType = async (req, res) => {
  try {
    const serviceType = await serviceService.updateServiceType(
      req.params.id,
      req.body,
      req.user,
      req.ip
    );

    return res.json({
      message: "Service type updated successfully",
      data: serviceType,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const deleteServiceType = async (req, res) => {
  try {
    await serviceService.deleteServiceType(req.params.id, req.user, req.ip);

    return res.json({
      message: "Service type deleted successfully",
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const listResortServices = async (req, res) => {
  try {
    const result = await serviceService.listResortServices(req.query);
    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
};

const getResortServiceById = async (req, res) => {
  try {
    const resortService = await serviceService.getResortServiceById(
      req.params.id
    );

    return res.json({
      data: resortService,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const listServicesByResort = async (req, res) => {
  try {
    const result = await serviceService.listServicesByResort(
      req.params.resortId,
      req.query
    );

    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
};

const createResortService = async (req, res) => {
  try {
    const resortService = await serviceService.createResortService(
      req.params.resortId,
      req.body,
      req.user,
      req.ip
    );

    return res.status(201).json({
      message: "Resort service created successfully",
      data: resortService,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const updateResortService = async (req, res) => {
  try {
    const resortService = await serviceService.updateResortService(
      req.params.id,
      req.body,
      req.user,
      req.ip
    );

    return res.json({
      message: "Resort service updated successfully",
      data: resortService,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const updateResortServiceAvailability = async (req, res) => {
  try {
    const resortService = await serviceService.updateResortServiceAvailability(
      req.params.id,
      req.body,
      req.user,
      req.ip
    );

    return res.json({
      message: "Resort service availability updated successfully",
      data: resortService,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const deleteResortService = async (req, res) => {
  try {
    await serviceService.deleteResortService(req.params.id, req.user, req.ip);

    return res.json({
      message: "Resort service deactivated successfully",
    });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  listServiceTypes,
  getServiceTypeById,
  createServiceType,
  updateServiceType,
  deleteServiceType,
  listResortServices,
  getResortServiceById,
  listServicesByResort,
  createResortService,
  updateResortService,
  updateResortServiceAvailability,
  deleteResortService,
};
