import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class Assignment extends Model {}
Assignment.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  class_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }
}, {
  sequelize,
  modelName: 'assignment',
  tableName: 'assignment',
  freezeTableName: true,
  timestamps: true,
  underscored: true,
  indexes: [{ unique: true, fields: ['class_id','user_id'] }]
});

export default Assignment;
