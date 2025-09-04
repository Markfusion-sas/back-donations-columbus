import { checksum } from '#utils/cheksum.util';

/**
 * Middleware para verificar la integridad de los eventos recibidos desde Wompi.
 * Este middleware valida que el checksum recibido en los encabezados o en el body
 * coincida con el checksum generado localmente usando la función `assignChecksum`.
 * Si la validación falla, se devuelve un error 400 o 403 según corresponda.
 * @function verifyWompiChecksum
 * @param {import('express').Request} req - Objeto de solicitud HTTP. 
 * Debe contener la cabecera `x-event-checksum` o `req.body.signature.checksum`.
 * @param {import('express').Response} res - Objeto de respuesta HTTP.
 * @param {import('express').NextFunction} next - Función para pasar el control al siguiente middleware.
 * @returns {void} No retorna un valor directo, pero puede enviar una respuesta HTTP si ocurre un error.
 * @throws {Error} Si ocurre algún problema inesperado durante la verificación.
 * @example
 * // Ejemplo de uso en una ruta:
 * import { verifyWompiChecksum } from '#middlewares/wompi.middleware.js';
 *
 * router.post('/webhook', verifyWompiChecksum, (req, res) => {
 *   res.status(200).json({ success: true });
 * });
 */
export const verifyWompiChecksum = (req, res, next) => {
  try {
    const receivedChecksum = req.headers['x-event-checksum'] 
      || req.body?.signature?.checksum;

    if (!receivedChecksum) {
      return res.status(400).json({ success: false, message: 'Missing checksum' });
    }

    const generatedChecksum = checksum.assignChecksum(req.body);

    if (generatedChecksum !== receivedChecksum) {
      return res.status(403).json({ success: false, message: 'Invalid checksum' });
    }

    // Guardamos el checksum generado para el controlador si lo necesita
    req.wompiChecksum = generatedChecksum;

    next();
  } catch (err) {
    next(err);
  }
};
