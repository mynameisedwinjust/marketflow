const config = require('./config');
const app = require('./app');
const { seedUsers } = require('./services/authService');

(async () => {
  await seedUsers();
  const server = app.listen(config.port, () => console.log(`MarketFlow running at http://localhost:${config.port}`));
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
      server.close(async err => {
        await require('./repositories').disconnect();
        if (err) {
          console.error(err);
          process.exitCode = 1;
        }
      });
    });
  }
})().catch(err => { console.error(err); process.exit(1); });
