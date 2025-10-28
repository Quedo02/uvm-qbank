import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class Subject extends Model {}
Subject.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true }
}, {
  sequelize,
  modelName: 'subject',
  tableName: 'subject',
  freezeTableName: true,
  timestamps: true,
  underscored: true
});

export default Subject;
