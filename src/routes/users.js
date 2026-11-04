const router = require('express').Router();
const c = require('../controllers/authController');
const requireRole = require('../middleware/roles');
const { ROLES } = require('../config/roles');

router.use(requireRole([ROLES.ADMIN])); // only admins manage staff accounts
router.get('/', c.listUsers);
router.post('/', c.createUser);

module.exports = router;
