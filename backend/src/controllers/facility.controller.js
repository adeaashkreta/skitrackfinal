const facilityService = require("../services/facility.service");

const handleError = (res, error) => {
  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      message: "Duplicate record",
    });
  }

  if (error.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({
      message: "Invalid resort_id or facility_id",
    });
  }

  return res.status(error.statusCode || 500).json({
    message: error.message || "Internal server error",
  });
};

const listFacilities = async (req, res) => {
  try {
    const result = await facilityService.listFacilities(req.query);
    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
};

const getFacilityById = async (req, res) => {
  try {
    const facility = await facilityService.getFacilityById(req.params.id);

    return res.json({
      data: facility,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const createFacility = async (req, res) => {
  try {
    const facility = await facilityService.createFacility(
      req.body,
      req.user,
      req.ip
    );

    return res.status(201).json({
      message: "Facility created successfully",
      data: facility,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const updateFacility = async (req, res) => {
  try {
    const facility = await facilityService.updateFacility(
      req.params.id,
      req.body,
      req.user,
      req.ip
    );

    return res.json({
      message: "Facility updated successfully",
      data: facility,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const deleteFacility = async (req, res) => {
  try {
    await facilityService.deleteFacility(req.params.id, req.user, req.ip);

    return res.json({
      message: "Facility deleted successfully",
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const listFacilitiesByResort = async (req, res) => {
  try {
    const result = await facilityService.listFacilitiesByResort(
      req.params.resortId,
      req.query
    );

    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
};

const attachFacilityToResort = async (req, res) => {
  try {
    const result = await facilityService.attachFacilityToResort(
      req.params.resortId,
      req.body,
      req.user,
      req.ip
    );

    return res.status(201).json({
      message: "Facility attached to resort successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const removeFacilityFromResort = async (req, res) => {
  try {
    await facilityService.removeFacilityFromResort(
      req.params.resortId,
      req.params.facilityId,
      req.user,
      req.ip
    );

    return res.json({
      message: "Facility removed from resort successfully",
    });
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  listFacilities,
  getFacilityById,
  createFacility,
  updateFacility,
  deleteFacility,
  listFacilitiesByResort,
  attachFacilityToResort,
  removeFacilityFromResort,
};