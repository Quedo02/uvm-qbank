import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class SubmissionAnswer extends Model {}
SubmissionAnswer.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  submission_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  question_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  answer: { type: DataTypes.JSON, allowNull: true },
  correct: { type: DataTypes.BOOLEAN, allowNull: true }
}, {
  sequelize,
  modelName: 'submission_answer',
  tableName: 'submission_answer',
  freezeTableName: true,
  timestamps: true,
  underscored: true
});

export default SubmissionAnswer;
