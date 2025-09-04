import { signatureSchema } from '#schemas/signature.schema';

/**
 * Middleware para validar la estructura de la solicitud de creación de firma.
 * Este middleware utiliza el esquema definido en `signatureSchema` para validar
 * que el cuerpo (`req.body`) contenga los campos requeridos con el formato correcto.
 * Si la validación falla, retorna un error 400 con un mensaje descriptivo;
 * de lo contrario, permite continuar al siguiente middleware o controlador.
 * @function
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función que permite pasar al siguiente middleware.
 * @returns {void} No retorna ningún valor directamente, pero envía una respuesta 400 si hay error.
 * @example
 * // Ejemplo de uso en una ruta:
 * import express from 'express';
 * import { validateSignatureRequest } from '#middlewares/validate-signature.middleware.js';
 * 
 * const router = express.Router();
 * 
 * router.post('/signature', validateSignatureRequest, (req, res) => {
 *   res.status(200).json({ success: true, message: 'Firma válida' });
 * });
 */
export const validateSignatureRequest = (req, res, next) => {
  const { error } = signatureSchema.validate(req.body, { abortEarly: true });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};
