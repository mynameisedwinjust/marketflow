const config = require('./config');
const app = require('./app');
const { seedUsers } = require('./services/authService');

(async () => {
  await seedUsers();
  app.listen(config.port, () => console.log(`MarketFlow running at http://localhost:${config.port}`));
})().catch(err => { console.error(err); process.exit(1); });
