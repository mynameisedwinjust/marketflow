require('dotenv').config();

const isProd = process.env.NODE_ENV === 'production';

if (isProd && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change-me')) {
  throw new Error('JWT_SECRET must be set to a strong value in production.');
}

module.exports = {
  isProd,
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret',
  cookieName: 'mf_token',
  tokenTtlHours: 8,
  seedPasswords: {
    admin: process.env.SEED_ADMIN_PASSWORD || 'admin123',
    manager: process.env.SEED_MANAGER_PASSWORD || 'manager123',
    cashier: process.env.SEED_CASHIER_PASSWORD || 'cashier123'
  }
};
