const { Router } = require('express');
const requireRole = require('../middleware/roles');
const createCrudController = require('../controllers/crudController');

// who = { read: [roles], write: [roles], create: [roles] (optional, defaults to write) }
module.exports = (service, who) => {
  const r = Router();
  const c = createCrudController(service);
  r.get('/', requireRole(who.read), c.list);
  r.get('/:id', requireRole(who.read), c.get);
  r.post('/', requireRole(who.create || who.write), c.create);
  r.put('/:id', requireRole(who.write), c.update);
  r.delete('/:id', requireRole(who.write), c.remove);
  return r;
};
