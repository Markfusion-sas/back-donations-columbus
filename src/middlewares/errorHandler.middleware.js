import { errorLog } from '#utils/logger.util';

/**
 * Maneja los errores globales de la aplicación.
 * Este middleware captura cualquier error que ocurra durante la ejecución
 * de la aplicación, lo registra en los logs y envía una respuesta HTTP
 * estructurada al cliente con el estado y el mensaje correspondiente.
 * @function errorHandler
 * @param {Object} err - Objeto de error que contiene información detallada del fallo.
 * @param {import('express').Request} req - Objeto de solicitud HTTP.
 * @param {import('express').Response} res - Objeto de respuesta HTTP.
 * @param {import('express').NextFunction} _next - Función para pasar el control al siguiente middleware.
 * @returns {void} No retorna ningún valor; envía una respuesta HTTP con el error.
 * @example
 * app.use(errorHandler);
 *
 * // Si ocurre un error, la respuesta podría ser:
 * // {
 * //   "success": false,
 * //   "message": "Recurso no encontrado"
 * // }
 */
export const errorHandler = (err, req, res, _next) => {
  errorLog(err);

  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error'
  });
};
