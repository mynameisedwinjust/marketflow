const authService = require('../src/services/authService');
const repositories = require('../src/repositories');

async function seed() {
  const requiredPasswords = [
    'SEED_ADMIN_PASSWORD',
    'SEED_MANAGER_PASSWORD',
    'SEED_CASHIER_PASSWORD'
  ];
  const missing = requiredPasswords.filter(name => !process.env[name]);
  if (missing.length) {
    throw new Error(`Set these environment variables before seeding: ${missing.join(', ')}`);
  }
  await authService.seedUsers();
}

seed()
  .catch(error => {
    console.error('Failed to seed database:', error);
    process.exitCode = 1;
  })
  .finally(() => repositories.disconnect());
