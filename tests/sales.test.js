// Runs without installing anything:  npm test
const test = require('node:test');
const assert = require('node:assert');
const productService = require('../src/services/productService');
const saleService = require('../src/services/saleService');

test('a sale lowers stock and totals correctly', async () => {
  const p = await productService.create({ name: 'Sugar 1kg', price: 1600, qty: 10 });
  const sale = await saleService.create({ items: [{ productId: p.id, quantity: 3 }], payment: 'Cash' }, { username: 'cashier' });
  assert.strictEqual(sale.total, 4800);
  assert.strictEqual((await productService.get(p.id)).qty, 7);
});

test('selling more than the stock is refused', async () => {
  const p = await productService.create({ name: 'Oil 3L', price: 11500, qty: 2 });
  await assert.rejects(
    saleService.create({ items: [{ productId: p.id, quantity: 5 }], payment: 'Cash' }, { username: 'cashier' }),
    err => err.status === 409
  );
  assert.strictEqual((await productService.get(p.id)).qty, 2);
});
