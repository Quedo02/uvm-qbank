import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class AuditLog extends Model {}

AuditLog.init({
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  actor_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  entity: { type: DataTypes.STRING(60), allowNull: false },
  entity_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  action: { type: DataTypes.STRING(60), allowNull: false },
  before: { type: DataTypes.JSON, allowNull: true },
  after:  { type: DataTypes.JSON, allowNull: true },
  meta:   { type: DataTypes.JSON, allowNull: true },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  sequelize,
  modelName: 'audit_log',
  tableName: 'audit_log',
  freezeTableName: true,
  timestamps: false, // solo created_at
  underscored: true
});

export default AuditLog;
