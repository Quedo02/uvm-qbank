import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

const TYPES = ['mcq_single','true_false','mcq_multi','open'];

class Question extends Model {}
Question.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  type: { type: DataTypes.ENUM(...TYPES), allowNull: false, defaultValue: 'mcq_single' },
  text: { type: DataTypes.TEXT, allowNull: false },
  options: { type: DataTypes.JSON, allowNull: true },
  answer:  { type: DataTypes.JSON, allowNull: true },
  status:  { type: DataTypes.ENUM('proposed','approved','rejected'), defaultValue: 'proposed' },
  review_comment: { type: DataTypes.TEXT, allowNull: true },
  reviewed_at: { type: DataTypes.DATE, allowNull: true },

  subject_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  semester_id:{ type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  created_by: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  approved_by: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  rejected_by: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true }
}, {
  sequelize,
  modelName: 'question',
  tableName: 'question',
  freezeTableName: true,
  timestamps: true,
  underscored: true
});

export default Question;
