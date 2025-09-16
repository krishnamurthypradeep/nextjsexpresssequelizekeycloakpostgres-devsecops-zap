import { Sequelize } from 'sequelize';
import dbConfig from '../db/config.js';
import defineProduct from './products.js'; // your factory from the question
import defineReview from './review.js'
import defineUser from "./user.js"; 

const env = process.env.NODE_ENV ?? 'development';
const cfg = dbConfig[env];

export const sequelize = new Sequelize(
  cfg.database,
  cfg.username,
  cfg.password,
  cfg
);

// Register models (explicit & simple)
export const Product = defineProduct(sequelize);
export const Review = defineReview(sequelize);
export const User = defineUser(sequelize);
// If any model defines `associate(models)`, wire them here:

Product.hasMany(Review, {
  as: 'reviews',
  foreignKey: { name: 'product_id', allowNull: false },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
})
Review.belongsTo(Product, {
  as: 'product',
  foreignKey: { name: 'product_id', allowNull: false }
})
Review.belongsTo(User, {
  as: "user",
  foreignKey: { name: "user_id", allowNull: false },
});
User.hasMany(Review, {
  as: "reviews",
  foreignKey: { name: "user_id", allowNull: true },
});
const models = { Product,Review, User };
Object.values(models).forEach((m) => m.associate?.(models));

export default { sequelize, ...models };
