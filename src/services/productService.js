const repos = require('../repositories');
const createCrudService = require('./crudService');
const HttpError = require('../utils/httpError');

const base = createCrudService(repos.products, { label: 'Product', requiredFields: ['name', 'price'] });

const numeric = (data, fields) => fields.forEach(f => {
  if (f in data && (!Number.isFinite(Number(data[f])) || Number(data[f]) < 0)) {
    throw new HttpError(400, `${f} must be a number of 0 or more.`);
  }
});

module.exports = {
  ...base,
  create: data => { numeric(data, ['price', 'cost', 'qty', 'min']); return base.create(data); },
  update: (id, data) => { numeric(data, ['price', 'cost', 'qty', 'min']); return base.update(id, data); }
};
