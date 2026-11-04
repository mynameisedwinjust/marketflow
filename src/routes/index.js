const router = require('express').Router();
const requireAuth = require('../middleware/auth');
const crudRoutes = require('./crudRoutes');
const createCrudService = require('../services/crudService');
const productService = require('../services/productService');
const repos = require('../repositories');
const { ALL, STAFF } = require('../config/roles');

router.get('/health', (req, res) => res.json({ status: 'ok' }));
router.use('/auth', require('./auth'));

// Everything below needs a signed-in user.
router.use(requireAuth);
router.use('/users', require('./users'));
router.use('/sales', require('./sales'));

// Products: everyone can read (the till needs them); only staff can change them.
router.use('/products', crudRoutes(productService, { read: ALL, write: STAFF }));
// Customers: cashiers may look up and add customers; only staff edit/delete.
router.use('/customers', crudRoutes(
  createCrudService(repos.customers, { label: 'Customer', requiredFields: ['name'] }),
  { read: ALL, create: ALL, write: STAFF }));
// Suppliers: staff only.
router.use('/suppliers', crudRoutes(
  createCrudService(repos.suppliers, { label: 'Supplier', requiredFields: ['name'] }),
  { read: STAFF, write: STAFF }));

module.exports = router;
