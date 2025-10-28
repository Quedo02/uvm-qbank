import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class Enrollment extends Model {}
Enrollment.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  class_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }
}, {
  sequelize,
  modelName: 'enrollment',
  tableName: 'enrollment',
  freezeTableName: true,
  timestamps: true,
  underscored: true,
  indexes: [{ unique: true, fields: ['class_id','user_id'] }]
});

export default Enrollment;
