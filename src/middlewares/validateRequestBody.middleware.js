/**
 * @function validateRequestBody
 * @description Middleware que valida que el cuerpo de la solicitud contenga los campos requeridos para procesar la notificación de Wompi. 
 * Verifica que:
 *  - Exista la propiedad `event` en el body.
 *  - Exista `data.transaction.status` en el body. 
 * Si alguno de estos campos falta, lanza un error con estado **400**.
 * @param {import('express').Request} req - Objeto de solicitud de Express.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - Función para pasar al siguiente middleware. 
 * @throws {Error} Si faltan los campos requeridos en el body. 
 * @example
 * // Ejemplo de request válido:
 * {
 *   "event": "transaction.updated",
 *   "data": {
 *     "transaction": {
 *       "status": "APPROVED"
 *     }
 *   }
 * }
 */
export const validateRequestBody = (req, res, next) => {
  const { event, data } = req.body;

  if (!event || !data?.transaction?.status) {
    const error = new Error("'event' and 'status' are required fields in the request body.");
    error.statusCode = 400;
    return next(error); 
  }

  next(); 
};
