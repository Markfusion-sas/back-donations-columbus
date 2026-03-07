import { DataTypes, Model } from 'sequelize';

import sequelize from '#config/database.config';

export class BingoTable extends Model {}

BingoTable.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  price_offer: {
    type: DataTypes.FLOAT,
    allowNull: true,
  }
}, {
  sequelize,
  modelName: 'BingoTable',
  tableName: 'bingo_tables',
  timestamps: true,
  underscored: true
});
