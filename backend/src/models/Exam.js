import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class Exam extends Model {}
Exam.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(140), allowNull: false },
  class_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  created_by: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  status: { type: DataTypes.ENUM('draft','published'), defaultValue: 'draft' },
  starts_at: { type: DataTypes.DATE, allowNull: true },
  ends_at: { type: DataTypes.DATE, allowNull: true },
  time_limit_min: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  attempts_allowed: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 }
}, {
  sequelize,
  modelName: 'exam',
  tableName: 'exam',
  freezeTableName: true,
  timestamps: true,
  underscored: true
});

export default Exam;
