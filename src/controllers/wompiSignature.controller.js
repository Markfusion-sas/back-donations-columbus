/**
 * @function signatureControllerFactory
 * @description
 * Crea un controlador de Express encargado de generar la firma digital para la integración con Wompi.
 * Utiliza un utilitario externo (`signatureUtil`) para construir la firma a partir de los datos enviados
 * en la solicitud y retorna la información junto con la firma generada.
 * @param {Function} signatureUtil - Función utilitaria encargada de generar la firma digital.
 * @returns {Function} Middleware de Express que procesa la solicitud y envía la respuesta con la firma.
 * @example
 * // Ejemplo de uso en una ruta:
 * import express from 'express';
 * import { signatureControllerFactory } from './signature.controller';
 * import { generateSignature } from './utils/signature.util';
 *
 * const router = express.Router();
 * router.post('/generate-signature', signatureControllerFactory(generateSignature));
 *
 * @throws {Error} Si ocurre un error durante la generación de la firma, se pasa al middleware de manejo de errores.
 */
export const signatureControllerFactory = (signatureUtil) => {
  return (req, res, next) => {
    try {
      const { reference, amount_in_cents, currency, ...rest } = req.body;

      const signature = signatureUtil({ reference, amount_in_cents, currency });

      const responsePayload = {
        success: true,
        data: {
          reference,
          amount_in_cents,
          currency,
          signature,
          ...rest
        }
      };

      res.status(200).json(responsePayload);
    } catch (err) {
      next(err);
    }
  };
};
