import { DataTypes, Model } from 'sequelize';

import sequelize from '#config/database.config';
import { tableRef } from '#models/types.util';

export class Donation extends Model {}

Donation.init({
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
  donation_destination: {
    type: DataTypes.STRING,
    allowNull: false,
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
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  donation_value: {
    type: DataTypes.FLOAT,
    allowNull: false
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
  modelName: 'Donation',
  tableName: 'donaciones',
  timestamps: true,
  underscored: true
});
