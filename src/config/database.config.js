/**
 * @file database.config.js
 * @description Configuración e inicialización de la conexión a la base de datos PostgreSQL utilizando Sequelize.
 */

import { Sequelize } from 'sequelize';

import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from '#config/environment.config';
import { sqlLog } from '#utils/logger.util';

/**
 * Instancia de Sequelize para manejar la conexión con la base de datos PostgreSQL.
 * Utiliza las credenciales y configuraciones definidas en las variables de entorno.
 * @constant
 * @type {Sequelize}
 */
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: sqlLog,
  define: {
    timestamps: true,
  },
});

export default sequelize;
