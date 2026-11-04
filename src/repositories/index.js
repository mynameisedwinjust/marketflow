const { PrismaClient } = require('@prisma/client');
const HttpError = require('../utils/httpError');

const prisma = new PrismaClient();

const definitions = {
  users: { model: 'user', fields: ['username', 'name', 'role', 'passwordHash'] },
  products: {
    model: 'product',
    fields: ['name', 'cat', 'sku', 'cost', 'price', 'qty', 'min'],
    numbers: ['cost', 'price', 'qty', 'min'],
    metadata: true
  },
  customers: { model: 'customer', fields: ['name'], metadata: true },
  suppliers: { model: 'supplier', fields: ['name'], metadata: true }
};

const extraFields = (data, fields) => Object.fromEntries(
  Object.entries(data).filter(([key, value]) => !fields.includes(key) && value !== undefined)
);

function decodeMetadata(value) {
  return value ? JSON.parse(value) : {};
}

function createRepository(definition) {
  const model = prisma[definition.model];

  const restore = row => {
    if (!row || !definition.metadata) return row;
    const { metadata, ...data } = row;
    return { ...decodeMetadata(metadata), ...data };
  };

  const prepare = data => {
    const values = Object.fromEntries(
      definition.fields.filter(field => data[field] !== undefined).map(field => {
        const value = definition.numbers?.includes(field) ? Number(data[field]) : data[field];
        return [field, value];
      })
    );
    if (definition.metadata) {
      values.metadata = JSON.stringify({
        ...extraFields(data, definition.fields),
        ...(data.metadata || {})
      });
    }
    return values;
  };

  return {
    async findAll() {
      return (await model.findMany({ orderBy: { createdAt: 'asc' } })).map(restore);
    },
    async findById(id) {
      return restore(await model.findUnique({ where: { id } }));
    },
    async findOne(predicate) {
      return (await this.findAll()).find(predicate) || null;
    },
    async findByUsername(username) {
      if (definition.model !== 'user') throw new Error('findByUsername is only available for users.');
      return model.findUnique({ where: { username } });
    },
    async create(data) {
      return restore(await model.create({ data: prepare(data) }));
    },
    async update(id, data) {
      const current = await model.findUnique({ where: { id } });
      if (!current) return null;
      const values = prepare(data);
      if (definition.metadata) {
        values.metadata = JSON.stringify({
          ...decodeMetadata(current.metadata),
          ...extraFields(data, definition.fields),
          ...(data.metadata || {})
        });
      }
      return restore(await model.update({ where: { id }, data: values }));
    },
    async remove(id) {
      const result = await model.deleteMany({ where: { id } });
      return result.count > 0;
    }
  };
}

const repositories = Object.fromEntries(
  Object.entries(definitions).map(([name, definition]) => [name, createRepository(definition)])
);

repositories.sales = {
  async findAll() {
    return prisma.sale.findMany({
      include: { items: true },
      orderBy: { createdAt: 'asc' }
    });
  },
  async create(data) {
    return prisma.$transaction(async tx => {
      for (const item of data.items) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, qty: { gte: item.quantity } },
          data: { qty: { decrement: item.quantity } }
        });
        if (updated.count !== 1) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product) throw new HttpError(404, 'A product in this sale no longer exists.');
          throw new HttpError(409, `Not enough stock for ${product.name} (only ${product.qty} left).`);
        }
      }

      return tx.sale.create({
        data: {
          customer: data.customer,
          payment: data.payment,
          total: Number(data.total),
          cashier: data.cashier,
          items: {
            create: data.items.map(item => ({
              productId: item.productId,
              name: item.name,
              price: Number(item.price),
              quantity: item.quantity
            }))
          }
        },
        include: { items: true }
      });
    });
  }
};

repositories.disconnect = () => prisma.$disconnect();

module.exports = repositories;
