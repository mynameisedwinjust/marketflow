const authService = require('../src/services/authService');
const repositories = require('../src/repositories');

async function seed() {
  await authService.seedUsers();
}

seed()
  .catch(error => {
    console.error('Failed to seed database:', error);
    process.exitCode = 1;
  })
  .finally(() => repositories.disconnect());
