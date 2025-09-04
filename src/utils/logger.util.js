/**
 * Logger centralizado.
 * Controla los niveles de logs (INFO, ERROR, SQL) y el formato de salida.
 * Respeta la configuración del entorno, mostrando solo lo necesario.
 */

import { NODE_ENV } from '#config/environment.config';

/**
 * Niveles de logs disponibles.
 * INFO → Información general.
 * ERROR → Errores importantes.
 * SQL → Consultas SQL (solo en desarrollo).
 */
const LOG_LEVELS = {
  INFO: 'INFO',
  ERROR: 'ERROR',
  SQL: 'SQL'
};

/**
 * Genera un timestamp con formato local para Colombia.
 * @returns {string} Fecha y hora formateada.
 */
const getTimestamp = () => {
  return new Date().toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * Formatea y muestra un log genérico en consola.
 * @param {string} level - Nivel del log (INFO, ERROR, SQL).
 * @param {...any} args - Contenido a imprimir.
 */
const formatLog = (level, ...args) => {
  const timestamp = getTimestamp();
  // eslint-disable-next-line no-console
  console.log(`[${timestamp}] [${level}]`, ...args);
};

/**
 * Muestra logs informativos solo en entorno de desarrollo.
 * Uso: log('Servidor iniciado en puerto', 3000);
 * @param {...any} args - Contenido a imprimir.
 */
export const log = (...args) => {
  if (NODE_ENV === 'development') {
    formatLog(LOG_LEVELS.INFO, ...args);
  }
};

/**
 * Muestra logs de error siempre, sin importar el entorno.
 * Uso: errorLog('Error al conectar a la base de datos', error);
 * @param {...any} args - Contenido a imprimir.
 */
export const errorLog = (...args) => {
  const timestamp = getTimestamp();
  // eslint-disable-next-line no-console
  console.error(`[${timestamp}] [${LOG_LEVELS.ERROR}]`, ...args);
};

/**
 * Muestra logs de consultas SQL solo en entorno de desarrollo.
 * Esto es útil para depuración sin exponer información sensible en producción.
 * Uso: sqlLog('SELECT * FROM clientes');
 * @param {string} query - Consulta SQL ejecutada.
 */
export const sqlLog = (query) => {
  if (NODE_ENV === 'development') {
    formatLog(LOG_LEVELS.SQL, `\n${query}\n`);
  }
};
