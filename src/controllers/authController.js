const config = require('../config');
const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

const cookieOptions = () => ({
  httpOnly: true, sameSite: 'lax', secure: config.isProd, maxAge: config.tokenTtlHours * 3600 * 1000
});

exports.login = asyncHandler(async (req, res) => {
  const { token, user } = await authService.login(req.body.username, req.body.password);
  res.cookie(config.cookieName, token, cookieOptions()).json({ user });
});
exports.logout = (req, res) => res.clearCookie(config.cookieName).status(204).end();
exports.me = (req, res) => res.json({ user: req.user });
exports.listUsers = asyncHandler(async (req, res) => res.json(await authService.listUsers()));
exports.createUser = asyncHandler(async (req, res) => res.status(201).json(await authService.createUser(req.body)));
