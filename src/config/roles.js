// The three roles. Routes say which of these may use them (see middleware/roles.js).
const ROLES = Object.freeze({ ADMIN: 'admin', MANAGER: 'manager', CASHIER: 'cashier' });
const ALL = Object.values(ROLES);
const STAFF = [ROLES.ADMIN, ROLES.MANAGER]; // back-office staff

module.exports = { ROLES, ALL, STAFF };
