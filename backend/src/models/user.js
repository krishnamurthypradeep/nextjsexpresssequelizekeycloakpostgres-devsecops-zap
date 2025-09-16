// models/User.js
import {DataTypes} from 'sequelize'
export default (sequelize) => {
  const User = sequelize.define("User", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    keycloakId: { type: DataTypes.STRING, unique: true }, // JWT "sub"
    username: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    name: { type: DataTypes.STRING }, // full name if available
  });
  return User;
};
