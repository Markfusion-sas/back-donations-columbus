import { DataTypes, Model } from 'sequelize';

import sequelize from '#config/database.config';
import { tableRef } from '#models/types.util';

export class ProductVariant extends Model {}

ProductVariant.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  product_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: tableRef('productos'),
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0.01
    }
  }
}, {
  sequelize,
  modelName: 'ProductVariant',
  tableName: 'variantes',
  timestamps: true,
  underscored: true
});
