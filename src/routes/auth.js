const router = require('express').Router();
const c = require('../controllers/authController');
const requireAuth = require('../middleware/auth');

router.post('/login', c.login);
router.post('/logout', c.logout);
router.get('/me', requireAuth, c.me);

module.exports = router;
