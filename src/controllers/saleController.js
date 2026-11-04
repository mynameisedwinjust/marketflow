const saleService = require('../services/saleService');
const asyncHandler = require('../utils/asyncHandler');

exports.list = asyncHandler(async (req, res) => res.json(await saleService.list()));
exports.create = asyncHandler(async (req, res) => res.status(201).json(await saleService.create(req.body, req.user)));
