const HttpError = require('../utils/httpError');

// Generic list/get/create/update/remove with a per-resource field check.
module.exports = function createCrudService(repo, { label, requiredFields = [] }) {
  const check = (data, partial) => {
    for (const f of requiredFields) {
      if (!partial || f in data) {
        if (data[f] === undefined || data[f] === null || String(data[f]).trim() === '') {
          throw new HttpError(400, `${f} is required.`);
        }
      }
    }
  };
  const get = async id => {
    const row = await repo.findById(id);
    if (!row) throw new HttpError(404, `${label} not found.`);
    return row;
  };
  return {
    list: () => repo.findAll(),
    get,
    async create(data) { check(data, false); return repo.create(data); },
    async update(id, data) { await get(id); check(data, true); return repo.update(id, data); },
    async remove(id) { await get(id); await repo.remove(id); }
  };
};
