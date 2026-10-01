import { DataTypes, Model } from 'sequelize';

import sequelize from '#config/database.config';
import { tableRef } from '#models/types.util';

export class Order extends Model {}

Order.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  identity_document: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'aprobado', 'declinado', 'error'),
    allowNull: false,
    defaultValue: 'pendiente'
  },
  transaction_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: tableRef('transacciones'),
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'Order',
  tableName: 'ordenes',
  timestamps: true,
  underscored: true
});
