
import { DataTypes, Model } from 'sequelize';

import sequelize from '#config/database.config';

/**
 * Modelo Transaction.
 * Representa una transacción realizada a través de Wompi o cualquier otro medio de pago.
 * Este modelo almacena toda la información relevante de la transacción, incluyendo
 * datos del cliente, estado del pago, método de pago y detalles de la pasarela.
 * @class Transaction
 * @extends {Model}
 * @property {string} id - Identificador único (UUID).
 * @property {string} transaction_id - ID único de la transacción proporcionado por Wompi.
 * @property {string} reference - Referencia única para identificar la transacción.
 * @property {number} amount_in_cents - Monto de la transacción en centavos.
 * @property {string} currency - Moneda de la transacción (por ejemplo, "COP").
 * @property {string} payment_method_type - Tipo de método de pago (ej. "CARD", "NEQUI", "PSE").
 * @property {string|null} brand - Marca de la tarjeta, si aplica (ej. "VISA").
 * @property {string|null} last_four - Últimos cuatro dígitos de la tarjeta, si aplica.
 * @property {string} status - Estado actual de la transacción (ej. "APPROVED", "DECLINED", "ERROR").
 * @property {string|null} customer_email - Correo electrónico del cliente.
 * @property {string|null} full_name - Nombre completo del cliente.
 * @property {string|null} phone_number - Número de teléfono del cliente.
 * @property {string|null} legal_id - Documento de identidad del cliente, si aplica.
 * @property {string|null} legal_id_type - Tipo de documento de identidad (CC, CE, NIT, etc.).
 * @property {string|null} redirect_url - URL a la que se redirige tras completar el pago.
 * @property {Date} created_at_api - Fecha de creación en la API.
 * @property {Date} updated_at_api - Fecha de última actualización en la API.
 * @example
 * // Crear una nueva transacción
 * const transaction = await Transaction.create({
 *   transaction_id: "12345",
 *   reference: "ORD-001",
 *   amount_in_cents: 500000,
 *   currency: "COP",
 *   payment_method_type: "CARD",
 *   status: "APPROVED"
 * });
 *
 * console.log(transaction.id); // UUID generado automáticamente
 */
export class Transaction extends Model {}

Transaction.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  transaction_type: {
    type: DataTypes.ENUM('donation', 'bingo_table_order'),
    allowNull: false,
  },
  transaction_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount_in_cents: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  payment_method_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  last_four: {
    type: DataTypes.STRING(4),
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customer_email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  legal_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  legal_id_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  redirect_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  created_at_api: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at_api: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'Transaction',
  tableName: 'transacciones',
  timestamps: true,
  underscored: true,
});
