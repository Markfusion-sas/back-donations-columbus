import { DataTypes } from 'sequelize';

import { isMssql } from '#config/database.config';
import { DB_SCHEMA } from '#config/environment.config';

/**
 * Referencia a otra tabla para una llave foránea. Con esquema propio
 * (DB_SCHEMA) hay que indicarlo; si no, SQL Server la busca en dbo.
 * @param {string} tableName
 */
export const tableRef = (tableName) => (DB_SCHEMA ? { tableName, schema: DB_SCHEMA } : tableName);

/**
 * Lista de textos. Postgres la guarda como ARRAY; SQL Server no tiene arreglos,
 * así que allí se guarda como JSON en NVARCHAR(MAX) y se convierte al leer/escribir.
 * @param {string} field - nombre del atributo
 */
export const stringList = (field) => (isMssql
  ? {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '[]',
    get() {
      const raw = this.getDataValue(field);
      if (Array.isArray(raw)) return raw;
      try {
        const parsed = JSON.parse(raw ?? '[]');
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    },
    set(value) {
      this.setDataValue(field, JSON.stringify(Array.isArray(value) ? value : []));
    }
  }
  : {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: []
  });
