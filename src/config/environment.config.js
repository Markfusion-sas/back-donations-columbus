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
 * @constant {string} DB_DIALECT  - 'mssql' (SQL Server del colegio, producción) o 'postgres' (por defecto, desarrollo).
 * @constant {string} DB_SCHEMA   - (Opcional) Esquema donde viven las tablas (producción: fundacion).
 * @constant {string} DB_HOST     - Host de la base de datos PostgreSQL.
 * @constant {number} DB_PORT     - Puerto en el que corre la base de datos.
 * @constant {string} DB_USER     - Usuario para la conexión a PostgreSQL.
 * @constant {string} DB_PASSWORD - Contraseña para PostgreSQL.
 * @constant {string} DB_NAME     - Nombre de la base de datos.
 * Wompi API:
 * @constant {string} WOMPI_PRIVATE_KEY - Llave privada de Wompi (solo backend, nunca exponer al cliente).
 * @constant {string} WOMPI_PUBLIC_KEY  - Llave pública de Wompi (usada por el frontend).
 * @constant {string} WOMPI_API_URL     - URL base de la API de Wompi.
 * Correos y directorio comercial (emprendimientos):
 * @constant {string} RESEND_API_KEY  - API key de Resend para envío de correos.
 * @constant {string} RESEND_EMAIL    - Remitente de los correos (dominio verificado en Resend).
 * @constant {string} ADMIN_EMAIL     - Correo del administrador que recibe la alerta de nuevos emprendimientos.
 * @constant {string} ADMIN_API_KEY   - (Opcional) Clave que debe enviar el panel admin en el header `x-admin-key`
 *                                       para aprobar/rechazar emprendimientos. Si no se define, no se exige.
 * @constant {string} UPLOADS_DIR     - Carpeta donde se guardan logos y fotos (por defecto ./uploads).
 * @constant {string} PUBLIC_URL      - URL pública del backend para construir los enlaces de las imágenes
 *                                       (por defecto se usa el host de la petición).
 * Correo saliente por SMTP (tiene prioridad sobre Resend si MAIL_HOST está definido):
 * @constant {string} MAIL_HOST     - Servidor SMTP (Google Workspace: smtp.gmail.com).
 * @constant {number} MAIL_PORT     - Puerto (587 STARTTLS por defecto; 465 SSL).
 * @constant {string} MAIL_USER     - Cuenta que envía (fundaciontcs@columbus.edu.co).
 * @constant {string} MAIL_PASSWORD - Contraseña de aplicación de esa cuenta.
 * @constant {string} MAIL_FROM     - (Opcional) Dirección del remitente; por defecto MAIL_USER.
 * Base de datos del colegio (SQL Server, misma que usa TCS Run) para validar la comunidad:
 * @constant {string} MSSQL_HOST     - Servidor SQL Server. Si no se define, la validación queda desactivada.
 * @constant {number} MSSQL_PORT     - Puerto (por defecto 1433).
 * @constant {string} MSSQL_USER     - Usuario de SQL Server.
 * @constant {string} MSSQL_PASSWORD - Contraseña de SQL Server.
 * @constant {string} MSSQL_DB       - Base con las tablas students y family_info.
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
  DB_DIALECT = 'postgres',
  DB_SCHEMA,
  RESEND_API_KEY,
  RESEND_EMAIL,
  ADMIN_EMAIL = 'fundaciontcs@columbus.edu.co',
  ADMIN_API_KEY,
  UPLOADS_DIR = 'uploads',
  PUBLIC_URL,
  WOMPI_PRIVATE_KEY,
  WOMPI_PUBLIC_KEY,
  WOMPI_API_URL = 'https://api.wompi.co/v1',
  REDIS_HOST = 'localhost',
  REDIS_PORT = 6379,
  REDIS_URL,
  MSSQL_HOST,
  MSSQL_PORT = 1433,
  MSSQL_USER,
  MSSQL_PASSWORD,
  MSSQL_DB,
  MAIL_HOST,
  MAIL_PORT = 587,
  MAIL_USER,
  MAIL_PASSWORD,
  MAIL_FROM
} = process.env;
