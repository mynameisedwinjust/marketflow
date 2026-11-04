const { randomUUID } = require('crypto');

// Temporary storage. Every repository exposes the same methods, so when we pick
// the real database we only rewrite this layer; services and routes stay unchanged.
module.exports = function createMemoryRepository(seed = []) {
  let rows = seed.map(r => ({ id: randomUUID(), ...r }));
  return {
    async findAll() { return rows.map(r => ({ ...r })); },
    async findById(id) { const r = rows.find(x => x.id === id); return r ? { ...r } : null; },
    async findOne(pred) { const r = rows.find(pred); return r ? { ...r } : null; },
    async create(data) { const r = { id: randomUUID(), createdAt: new Date().toISOString(), ...data }; rows.push(r); return { ...r }; },
    async update(id, data) {
      const i = rows.findIndex(x => x.id === id);
      if (i < 0) return null;
      rows[i] = { ...rows[i], ...data, id, updatedAt: new Date().toISOString() };
      return { ...rows[i] };
    },
    async remove(id) { const n = rows.length; rows = rows.filter(x => x.id !== id); return rows.length < n; }
  };
};
