// Runs without installing anything:  npm test
const test = require('node:test');
const assert = require('node:assert');
const productService = require('../src/services/productService');
const saleService = require('../src/services/saleService');
const authService = require('../src/services/authService');
const repos = require('../src/repositories');

test('users persist and username lookup ignores case', async () => {
  const username = `test-${Date.now()}`;
  const created = await authService.createUser({
    username,
    name: 'Test User',
    password: 'test-password',
    role: 'cashier'
  });
  try {
    const result = await authService.login(username.toUpperCase(), 'test-password');
    assert.strictEqual(result.user.id, created.id);
    assert.strictEqual((await repos.users.findById(created.id)).username, username);
  } finally {
    await repos.users.remove(created.id);
  }
});

test('customer extra fields persist and survive partial updates', async () => {
  const customer = await repos.customers.create({ name: 'Test Customer', phone: '123', email: 'test@example.com' });
  try {
    await repos.customers.update(customer.id, { phone: '456' });
    const saved = await repos.customers.findById(customer.id);
    assert.strictEqual(saved.phone, '456');
    assert.strictEqual(saved.email, 'test@example.com');
  } finally {
    await repos.customers.remove(customer.id);
  }
});

test('a sale lowers stock and totals correctly', async () => {
  const p = await productService.create({ name: 'Sugar 1kg', price: 1600, qty: 10 });
  let sale;
  try {
    sale = await saleService.create({ items: [{ productId: p.id, quantity: 3 }], payment: 'Cash' }, { username: 'cashier' });
    assert.strictEqual(sale.total, 4800);
    assert.deepStrictEqual(sale.items.map(item => item.quantity), [3]);
    assert.strictEqual((await productService.get(p.id)).qty, 7);
  } finally {
    if (sale) await repos.sales.remove(sale.id);
    await repos.products.remove(p.id);
  }
});

test('selling more than the stock is refused', async () => {
  const p = await productService.create({ name: 'Oil 3L', price: 11500, qty: 2 });
  try {
    await assert.rejects(
      saleService.create({ items: [{ productId: p.id, quantity: 5 }], payment: 'Cash' }, { username: 'cashier' }),
      err => err.status === 409
    );
    assert.strictEqual((await productService.get(p.id)).qty, 2);
  } finally {
    await repos.products.remove(p.id);
  }
});

test('failed database sale rolls back stock deductions', async () => {
  const available = await productService.create({ name: 'Available stock', price: 10, qty: 5 });
  const limited = await productService.create({ name: 'Limited stock', price: 20, qty: 1 });
  try {
    await assert.rejects(repos.sales.create({
      customer: 'Walk-in',
      payment: 'Cash',
      total: 30,
      cashier: 'test',
      items: [
        { productId: available.id, name: available.name, price: available.price, quantity: 1 },
        { productId: limited.id, name: limited.name, price: limited.price, quantity: 2 }
      ]
    }), error => error.status === 409);
    assert.strictEqual((await productService.get(available.id)).qty, 5);
  } finally {
    await repos.products.remove(available.id);
    await repos.products.remove(limited.id);
  }
});
