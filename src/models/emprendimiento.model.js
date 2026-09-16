import { DataTypes, Model } from 'sequelize';

import { EMPRENDIMIENTO_STATUS } from '#config/constants.config';
import sequelize from '#config/database.config';

export class Emprendimiento extends Model {}

Emprendimiento.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // Autorización de uso de datos e imágenes (Ley 1581 de 2012)
  acepta_datos: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  // Representante de la marca
  nombre_representante: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telefono_personal: {
    type: DataTypes.STRING,
    allowNull: false
  },
  relacion_tcs: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: []
  },
  // Emprendimiento
  nombre_emprendimiento: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telefono_marca: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  categorias: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: []
  },
  categoria_otro: {
    type: DataTypes.STRING,
    allowNull: true
  },
  historia: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  red_social: {
    type: DataTypes.STRING,
    allowNull: false
  },
  web: {
    type: DataTypes.STRING,
    allowNull: false
  },
  punto_fisico: {
    type: DataTypes.STRING,
    allowNull: true
  },
  envios: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Imágenes (URLs públicas)
  logo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fotos: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: []
  },
  // Beneficio para la comunidad TCS
  beneficio_tcs: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  beneficio_descripcion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Moderación
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: EMPRENDIMIENTO_STATUS.PENDING,
    validate: {
      isIn: [Object.values(EMPRENDIMIENTO_STATUS)]
    }
  },
  motivo_rechazo: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  revisado_en: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Emprendimiento',
  tableName: 'emprendimientos',
  timestamps: true,
  underscored: true
});
