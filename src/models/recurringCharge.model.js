import { DataTypes } from 'sequelize';

import sequelize from '#config/database.config';

export const RecurringCharge = sequelize.define('RecurringCharge', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  payment_source_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  transaction_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'declined'),
    allowNull: false,
    defaultValue: 'pending'
  }
}, {
  tableName: 'cobros_recurrentes',
  timestamps: true,
  underscored: true
});
