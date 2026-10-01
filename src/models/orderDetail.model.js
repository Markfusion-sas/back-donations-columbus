import { DataTypes, Model } from 'sequelize';

import sequelize from '#config/database.config';
import { tableRef } from '#models/types.util';

export class OrderDetail extends Model {}

OrderDetail.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: tableRef('ordenes'),
      key: 'id'
    }
  },
  product_variant_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: tableRef('variantes'),
      key: 'id'
    }
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
  }
}, {
  sequelize,
  modelName: 'OrderDetail',
  tableName: 'detalle_ordenes',
  timestamps: true,
  underscored: true
});
