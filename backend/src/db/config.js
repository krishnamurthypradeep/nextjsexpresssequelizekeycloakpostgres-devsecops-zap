// src/db/config.js (ESM)
import 'dotenv/config';

const common = {
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASS ?? 'postgres',
  database: process.env.DB_NAME ?? 'productsdb',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5433),
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    // Enable in prod if needed:
    // ssl: process.env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : false,
  },
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
};

const config = {
  development: { ...common },
  test: { ...common, database: `${process.env.DB_NAME ?? 'productsdb'}_test` },
  production: { ...common },
};

export default config;
