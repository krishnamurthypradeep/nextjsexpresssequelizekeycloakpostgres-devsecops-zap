import {DataTypes} from 'sequelize'
import {v4 as uuidv4} from 'uuid'
export default (sequelize) =>{
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.UUID, primaryKey: true, defaultValue: () => uuidv4(),
    },
    title: { type: DataTypes.STRING(200), allowNull: false },
    body: { type: DataTypes.TEXT },
    stars: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
    // FK column (underscored)
    product_id: { type: DataTypes.UUID, allowNull: false },
    user_id: {
  type: DataTypes.BIGINT,
  allowNull: true,
}
  }, 
   
  {
    tableName: 'reviews',
    underscored: true,
    timestamps: true
  });

  return Review;
}