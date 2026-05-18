import { DataTypes } from 'sequelize';

import sequelize from '#config/database.config';
import { PAYMENT_SOURCE_STATUS, PAYMENT_SOURCE_TYPE } from '#config/constants.config';

export const PaymentSource = sequelize.define('PaymentSource', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  wompi_source_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  customer_email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM(...Object.values(PAYMENT_SOURCE_TYPE)),
    allowNull: false
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: true
  },
  last_four: {
    type: DataTypes.STRING(4),
    allowNull: true
  },
  exp_month: {
    type: DataTypes.STRING(2),
    allowNull: true
  },
  exp_year: {
    type: DataTypes.STRING(4),
    allowNull: true
  },
  card_holder: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM(...Object.values(PAYMENT_SOURCE_STATUS)),
    allowNull: false,
    defaultValue: PAYMENT_SOURCE_STATUS.AVAILABLE
  }
}, {
  tableName: 'fuentes_pago',
  timestamps: true,
  underscored: true
});
