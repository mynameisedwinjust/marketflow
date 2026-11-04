const router = require('express').Router();
const c = require('../controllers/saleController');
const requireRole = require('../middleware/roles');
const { ALL } = require('../config/roles');

router.get('/', requireRole(ALL), c.list);
router.post('/', requireRole(ALL), c.create); // cashiers sell at the till
// Reports (staff only) will be added here next, calculated from real sales.
module.exports = router;
