import { DataTypes, Model } from 'sequelize';

import sequelize from '#config/database.config';

export class BingoTableOrder extends Model {}

BingoTableOrder.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  bingo_table_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'bingo_tables',
      key: 'id'
    }
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
  unit_price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  transaction_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'transacciones',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'BingoTableOrder',
  tableName: 'bingo_table_orders',
  timestamps: true,
  underscored: true
});
