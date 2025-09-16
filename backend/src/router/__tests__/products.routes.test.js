import request from 'supertest';
import express from 'express';
import router from '../productRouter.js';
import { Product, Review } from '../../models/index.js';

// Mock middleware
jest.mock('../../middleware/auth.js', () => ({
  authenticate: () => (req, res, next) => next(),
  requireRealmRole: (role) => (req, res, next) => {
    req.user = { role };
    next();
  },
}));

// Mock Sequelize models
jest.mock('../../models/index.js', () => ({
  Product: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  Review: {
    create: jest.fn(),
  },
}));

// Setup app
const app = express();
app.use(express.json());
app.use('/products', router);

describe('Products API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ================================
  // GET /products
  // ================================
  it('should return all products without reviews', async () => {
    Product.findAll.mockResolvedValue(
      [{ id: 1, name: 'Product A' }]);

    const res = await request(app).get('/products');

    expect(res.status).toBe(200);
    expect(Product.findAll).toHaveBeenCalledWith({ include: [] });
    expect(res.body).toEqual([{ id: 1, name: 'Product A' }]);
  });

  it('should return all products with reviews when ?include=reviews', async () => {
    Product.findAll.mockResolvedValue([
      { id: 1, name: 'Product A', reviews: [{ id: 10, title: 'Great' }] },
    ]);

    const res = await request(app).get('/products?include=reviews');

    expect(res.status).toBe(200);
    expect(Product.findAll).toHaveBeenCalledWith({
      include: [{ model: Review, as: 'reviews' }],
    });
    expect(res.body[0].reviews[0].title).toBe('Great');
  });

  // ================================
  // POST /products
  // ================================
  it('should create a new product', async () => {
    const newProduct = { id: 2, name: 'Product B' };
    Product.create.mockResolvedValue(newProduct);

    const res = await request(app)
      .post('/products')
      .send({ name: 'Product B' });

    expect(res.status).toBe(201);
    expect(Product.create).toHaveBeenCalledWith({ name: 'Product B' });
    expect(res.body).toEqual(newProduct);
  });

  // ================================
  // POST /products/:id/reviews
  // ================================
  it('should create a review for a product', async () => {
    const product = { id: 3, name: 'Product C' };
    Product.findByPk.mockResolvedValue(product);

    const review = { id: 101, title: 'Nice', body: 'Good one', stars: 5 };
    Review.create.mockResolvedValue(review);

    const res = await request(app)
      .post('/products/3/reviews')
      .send({ title: 'Nice', body: 'Good one', stars: 5 });

    expect(res.status).toBe(201);
    expect(Product.findByPk).toHaveBeenCalledWith('3');
    expect(Review.create).toHaveBeenCalledWith({
      title: 'Nice',
      body: 'Good one',
      stars: 5,
      product_id: 3,
    });
    expect(res.body).toEqual(review);
  });

  it('should return 404 if product not found when creating review', async () => {
    Product.findByPk.mockResolvedValue(null);

    const res = await request(app)
      .post('/products/99/reviews')
      .send({ title: 'Bad', body: 'No product', stars: 1 });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ err: 'product not found' });
  });

  // ================================
  // GET /products/:id
  // ================================
  it('should return product with reviews by ID', async () => {
    const product = {
      id: 5,
      name: 'Product D',
      reviews: [{ id: 200, title: 'Superb' }],
    };
    Product.findByPk.mockResolvedValue(product);

    const res = await request(app).get('/products/5');

    expect(res.status).toBe(200);
    expect(Product.findByPk).toHaveBeenCalledWith('5', {
      include: [{ model: Review, as: 'reviews' }],
    });
    expect(res.body.name).toBe('Product D');
  });

  it('should return 404 if product not found by ID', async () => {
    Product.findByPk.mockResolvedValue(null);

    const res = await request(app).get('/products/404');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'product not found' });
  });
});
