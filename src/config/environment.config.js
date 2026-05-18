/**
 * Variables de entorno usadas para la configuración de la aplicación.
 * Configuración general:
 * @constant {string} FRONTEND_URL   - URL base del frontend para CORS y redirecciones.
 * @constant {string} NODE_ENV       - Ambiente de ejecución (development, staging, production).
 * @constant {number} PORT           - Puerto en el que corre el servidor (por defecto 3000).
 * Seguridad:
 * @constant {string} SECRET_EVENT      - Token compartido para validar eventos de Wompi.
 * @constant {string} INTEGRITY_SECRET  - Llave secreta usada para validar la integridad de los pagos.
 * Base de datos:
 * @constant {string} DB_HOST     - Host de la base de datos PostgreSQL.
 * @constant {number} DB_PORT     - Puerto en el que corre la base de datos.
 * @constant {string} DB_USER     - Usuario para la conexión a PostgreSQL.
 * @constant {string} DB_PASSWORD - Contraseña para PostgreSQL.
 * @constant {string} DB_NAME     - Nombre de la base de datos.
 * Wompi API:
 * @constant {string} WOMPI_PRIVATE_KEY - Llave privada de Wompi (solo backend, nunca exponer al cliente).
 * @constant {string} WOMPI_PUBLIC_KEY  - Llave pública de Wompi (usada por el frontend).
 * @constant {string} WOMPI_API_URL     - URL base de la API de Wompi.
 */
export const {
  FRONTEND_URL,
  NODE_ENV,
  PORT = 3000,
  SECRET_EVENT,
  INTEGRITY_SECRET,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  RESEND_API_KEY,
  RESEND_EMAIL,
  WOMPI_PRIVATE_KEY,
  WOMPI_PUBLIC_KEY,
  WOMPI_API_URL = 'https://api.wompi.co/v1'
} = process.env;
