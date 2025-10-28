import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class ExamQuestion extends Model {}
ExamQuestion.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  exam_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  question_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  order: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 1 }
}, {
  sequelize,
  modelName: 'exam_question',
  tableName: 'exam_question',
  freezeTableName: true,
  timestamps: true,
  underscored: true,
  indexes: [{ unique: true, fields: ['exam_id','question_id'] }]
});

export default ExamQuestion;
