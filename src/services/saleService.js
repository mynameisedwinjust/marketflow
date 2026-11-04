const repos = require('../repositories');
const HttpError = require('../utils/httpError');

module.exports = {
  list: () => repos.sales.findAll(),

  // items: [{ productId, quantity }]. Checks stock, lowers it, records the sale.
  async create({ items, customer = 'Walk-in', payment }, user) {
    if (!Array.isArray(items) || items.length === 0) throw new HttpError(400, 'Add at least one item.');
    if (!payment) throw new HttpError(400, 'Payment method is required.');

    const lines = [];
    for (const it of items) {
      const qty = Number(it.quantity);
      if (!Number.isInteger(qty) || qty < 1) throw new HttpError(400, 'Quantity must be a whole number of 1 or more.');
      const p = await repos.products.findById(it.productId);
      if (!p) throw new HttpError(404, 'A product in this sale no longer exists.');
      if (Number(p.qty) < qty) throw new HttpError(409, `Not enough stock for ${p.name} (only ${p.qty} left).`);
      lines.push({ product: p, qty });
    }
    for (const { product, qty } of lines) {
      await repos.products.update(product.id, { qty: Number(product.qty) - qty });
    }
    const total = lines.reduce((s, l) => s + Number(l.product.price) * l.qty, 0);
    return repos.sales.create({
      customer, payment, total,
      items: lines.map(l => ({ productId: l.product.id, name: l.product.name, price: Number(l.product.price), quantity: l.qty })),
      cashier: user.username
    });
  }
};
