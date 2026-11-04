const createMemoryRepository = require('./memoryRepository');

module.exports = {
  users: createMemoryRepository(),
  products: createMemoryRepository(),
  customers: createMemoryRepository(),
  suppliers: createMemoryRepository(),
  sales: createMemoryRepository()
};
