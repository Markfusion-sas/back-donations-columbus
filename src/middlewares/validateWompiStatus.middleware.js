/**
 * @function validateWompiStatus
 * @description Middleware que valida el estado de la transacción recibida desde Wompi.
 * Este middleware extrae el estado de la transacción desde `req.body.data.transaction.status`
 * y verifica que exista y que su valor sea `APPROVED`.  
 * En caso de no existir el estado o si el estado es diferente de `APPROVED`, se genera un error.
 * @param {import('express').Request} req - Objeto de solicitud HTTP, que debe contener la transacción en `req.body.data.transaction.status`.
 * @param {import('express').Response} res - Objeto de respuesta HTTP (no se utiliza directamente aquí).
 * @param {import('express').NextFunction} next - Función para pasar al siguiente middleware o manejar errores.
 * @throws {Error} Lanza un error si el estado de la transacción está ausente o si no es `APPROVED`.
 * @example
 * // Ejemplo de uso en una ruta:
 * app.post('/webhook', validateWompiStatus, (req, res) => {
 *   res.status(200).json({ message: 'Transacción validada correctamente' });
 * });
 */
export const validateWompiStatus = (req, res, next) => {
  const status = req.body?.data?.transaction?.status;
  if (!status) {
    return next(new Error('Transaction status is missing'));
  }

  if (status !== 'APPROVED') {
    return next(new Error(`Transaction not approved. Status: ${status}`));
  }

  next();
};
