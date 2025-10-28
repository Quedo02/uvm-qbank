import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class User extends Model {}

User.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(120), allowNull: false },
  // Quitar "unique: true" del atributo para que Sequelize no haga "CHANGE ... UNIQUE" cada sync
  email: { type: DataTypes.STRING(180), allowNull: false },
  password_hash: { type: DataTypes.STRING(120), allowNull: false },
  role_id: { type: DataTypes.INTEGER, allowNull: false }
}, {
  sequelize,
  modelName: 'user',
  tableName: 'user',         // explícito: coincide con lo que ya tienes en DB
  freezeTableName: true,     // evita pluralización ("users")
  indexes: [
    // Índice único con nombre estable: Sequelize lo gestiona sin re-crear "UNIQUE" en la columna
    { unique: true, name: 'ux_user_email', fields: ['email'] }
  ]
});

export default User;
