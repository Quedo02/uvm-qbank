import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class Role extends Model {}
Role.init({
  id: { type: DataTypes.INTEGER, primaryKey: true },
  name: { type: DataTypes.STRING(50), allowNull: false }
}, {
  sequelize,
  modelName: 'role',
  tableName: 'role',
  freezeTableName: true,
  timestamps: true,
  underscored: true
});

export default Role;
