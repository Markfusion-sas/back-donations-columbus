import sql from 'mssql';

import { MSSQL_DB, MSSQL_HOST, MSSQL_PASSWORD, MSSQL_PORT, MSSQL_USER } from '#config/environment.config';

/** La validación de la comunidad solo se activa si hay conexión configurada. */
export const isMssqlConfigured = () => Boolean(MSSQL_HOST && MSSQL_USER);

let poolPromise = null;

// Una sola conexión compartida; si falla se reintenta en la siguiente consulta
const getPool = () => {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool({
      server: MSSQL_HOST,
      port: Number(MSSQL_PORT),
      user: MSSQL_USER,
      password: MSSQL_PASSWORD,
      database: MSSQL_DB,
      options: { encrypt: true, trustServerCertificate: true },
      pool: { max: 5, min: 0, idleTimeoutMillis: 30000 },
      connectionTimeout: 10000,
      requestTimeout: 15000
    }).connect().catch((error) => {
      poolPromise = null;
      throw error;
    });
  }
  return poolPromise;
};

/**
 * Ejecuta una consulta y devuelve las filas.
 * @param {string} text - SQL con parámetros @nombre
 * @param {Record<string, string>} [params]
 */
export const runMssqlQuery = async(text, params = {}) => {
  const pool = await getPool();
  const request = pool.request();
  Object.entries(params).forEach(([name, value]) => request.input(name, sql.VarChar(50), value));
  const result = await request.query(text);
  return result.recordset ?? [];
};
