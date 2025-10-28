import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class Class extends Model {}
Class.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  subject_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  semester_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  owner_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }
}, {
  sequelize,
  modelName: 'class',
  tableName: 'class',
  freezeTableName: true,
  timestamps: true,
  underscored: true
});

export default Class;
