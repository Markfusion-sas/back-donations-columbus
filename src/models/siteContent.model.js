import { DataTypes, Model } from 'sequelize';

import sequelize from '#config/database.config';

/**
 * Contenido editable del sitio (textos e imágenes), tipo CMS.
 * Cada fila sobreescribe el valor por defecto que vive en el código del
 * frontend (src/translations/translations.js y src/data/siteImages.js).
 * Si no existe fila para una clave, el sitio muestra el valor por defecto.
 */
export class SiteContent extends Model {}

SiteContent.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // Ruta de la traducción o de la imagen, p. ej. "hero.title" o "img.hero.banner1"
  clave: {
    type: DataTypes.STRING,
    allowNull: false
  },
  idioma: {
    type: DataTypes.STRING(5),
    allowNull: false,
    validate: { isIn: [['es', 'en']] }
  },
  tipo: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'text',
    validate: { isIn: [['text', 'image']] }
  },
  valor: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'SiteContent',
  tableName: 'contenido_sitio',
  timestamps: true,
  underscored: true,
  indexes: [{ unique: true, fields: ['clave', 'idioma'] }]
});
