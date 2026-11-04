const asyncHandler = require('../utils/asyncHandler');

module.exports = service => ({
  list: asyncHandler(async (req, res) => res.json(await service.list())),
  get: asyncHandler(async (req, res) => res.json(await service.get(req.params.id))),
  create: asyncHandler(async (req, res) => res.status(201).json(await service.create(req.body))),
  update: asyncHandler(async (req, res) => res.json(await service.update(req.params.id, req.body))),
  remove: asyncHandler(async (req, res) => { await service.remove(req.params.id); res.status(204).end(); })
});
