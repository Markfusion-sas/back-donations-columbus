import { DataTypes, Model } from 'sequelize';

import { CERTIFICATE_STATUS } from '#config/constants.config';
import sequelize from '#config/database.config';

/**
 * Solicitud de certificado de donación.
 * El donante adjunta su cédula o RUT desde el formulario de donación; la
 * Fundación recibe la alerta por correo y emite el certificado manualmente.
 */
export class DonationCertificate extends Model {}

DonationCertificate.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // Se asocia cuando la donación se crea (formato DON-{UUID})
  donation_reference: {
    type: DataTypes.STRING,
    allowNull: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  identity_document: {
    type: DataTypes.STRING,
    allowNull: false
  },
  donation_value: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  donation_destination: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Cédula o RUT adjunto (URL pública en /api/v1/uploads/certificados)
  documento_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  documento_nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: CERTIFICATE_STATUS.PENDING,
    validate: {
      isIn: [Object.values(CERTIFICATE_STATUS)]
    }
  }
}, {
  sequelize,
  modelName: 'DonationCertificate',
  tableName: 'certificados_donacion',
  timestamps: true,
  underscored: true
});
