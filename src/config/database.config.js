/**
 * @file database.config.js
 * @description Conexión a la base de datos con Sequelize.
 *
 * Producción usa el SQL Server del colegio (10.90.11.15, base EventosTCS,
 * esquema "fundacion"), igual que los demás eventos (TCS Run). Railway quedó
 * descartado por decisión de Juan José Ayala (2026-10-01) tras quedar la base
 * inaccesible. En desarrollo local se puede seguir usando Postgres.
 */

import { Sequelize } from 'sequelize';

import { DB_DIALECT, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_SCHEMA, DB_USER } from '#config/environment.config';
import { sqlLog } from '#utils/logger.util';

export const isMssql = DB_DIALECT === 'mssql';

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: Number(DB_PORT),
  dialect: isMssql ? 'mssql' : 'postgres',
  logging: sqlLog,
  ...(isMssql ? { dialectOptions: { options: { encrypt: true, trustServerCertificate: true } } } : {}),
  define: {
    timestamps: true,
    // Esquema propio para no mezclarse con las tablas de otros eventos
    ...(DB_SCHEMA ? { schema: DB_SCHEMA } : {})
  }
});

export default sequelize;
