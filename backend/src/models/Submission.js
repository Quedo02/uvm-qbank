import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class Submission extends Model {}
Submission.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  exam_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  class_id:{ type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  started_at:  { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  finished_at: { type: DataTypes.DATE, allowNull: true },
  correct_auto: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
  total_auto:   { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
  score: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  status: { type: DataTypes.ENUM('submitted','in_review','graded'), defaultValue: 'submitted' }
}, {
  sequelize,
  modelName: 'submission',
  tableName: 'submission',
  freezeTableName: true,
  timestamps: true,
  underscored: true,
  indexes: [{ unique: true, fields: ['exam_id','user_id'] }]
});

export default Submission;
