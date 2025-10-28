import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class Semester extends Model {}
Semester.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(50), allowNull: false, unique: true }
}, {
  sequelize,
  modelName: 'semester',
  tableName: 'semester',
  freezeTableName: true,
  timestamps: true,
  underscored: true
});

export default Semester;
