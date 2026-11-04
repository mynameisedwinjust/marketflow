const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { ROLES, ALL } = require('../config/roles');
const repos = require('../repositories');
const HttpError = require('../utils/httpError');

const publicUser = u => ({ id: u.id, username: u.username, name: u.name, role: u.role });

async function createUser({ username, name, password, role }) {
  if (!username || !password || !name) throw new HttpError(400, 'Name, username and password are required.');
  if (password.length < 6) throw new HttpError(400, 'Password must be at least 6 characters.');
  if (!ALL.includes(role)) throw new HttpError(400, `Role must be one of: ${ALL.join(', ')}.`);
  const uname = username.trim().toLowerCase();
  if (await repos.users.findByUsername(uname)) throw new HttpError(409, 'That username is already taken.');
  try {
    const user = await repos.users.create({ username: uname, name: name.trim(), role, passwordHash: await bcrypt.hash(password, 10) });
    return publicUser(user);
  } catch (error) {
    if (error.code === 'P2002') throw new HttpError(409, 'That username is already taken.');
    throw error;
  }
}

async function login(username, password) {
  const user = await repos.users.findByUsername(String(username || '').trim().toLowerCase());
  // Same message for unknown user / wrong password so attackers learn nothing.
  if (!user || !(await bcrypt.compare(String(password || ''), user.passwordHash))) {
    throw new HttpError(401, 'Incorrect username or password.');
  }
  const token = jwt.sign(
    { sub: user.id, role: user.role, name: user.name, username: user.username },
    config.jwtSecret, { expiresIn: `${config.tokenTtlHours}h` }
  );
  return { token, user: publicUser(user) };
}

// First users so you can sign in. Change these passwords via .env before real use.
async function seedUsers() {
  const p = config.seedPasswords;
  for (const [username, name, password, role] of [
    ['admin', 'Admin', p.admin, ROLES.ADMIN],
    ['manager', 'Manager', p.manager, ROLES.MANAGER],
    ['cashier', 'Cashier', p.cashier, ROLES.CASHIER]
  ]) {
    if (!await repos.users.findByUsername(username)) {
      await createUser({ username, name, password, role });
    }
  }
}

module.exports = { createUser, login, seedUsers, listUsers: async () => (await repos.users.findAll()).map(publicUser) };
