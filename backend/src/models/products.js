import {DataTypes} from 'sequelize'
import {v4 as uuidv4} from 'uuid'
export default (sequelize) =>{
    const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: { notEmpty: true }
    },
    code: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true,
      validate: { min: 0 }
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { min: 0, max: 5 }
    },
    available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    imageUrl: {
      type: DataTypes.STRING(2048),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'products',
    underscored: true,
    timestamps: true
  });

  return Product;
}