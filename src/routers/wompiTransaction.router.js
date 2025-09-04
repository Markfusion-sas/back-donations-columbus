import { Router } from 'express';

import { wompiController,wompiSignatureController } from '#controllers/index';
import { validateRequestBody } from '#middlewares/validateRequestBody.middleware';
import { validateSignatureRequest } from '#middlewares/validateSignatureRequest.middleware';
import { validateWompiStatus } from '#middlewares/validateWompiStatus.middleware';
import { verifyWompiChecksum } from '#middlewares/verifyWompiChecksum.middleware';

const router = Router();

/**
 * @fileoverview Rutas relacionadas con la integración de Wompi.
 * @module routes/wompi
 * @description Este módulo define las rutas necesarias para:
 *  1. Recibir notificaciones desde Wompi (webhook).
 *  2. Generar firmas necesarias para la comunicación segura entre el backend y el front.
 */
/**
 * @route POST /
 * @summary Webhook que recibe notificaciones de Wompi.
 * @description Esta ruta es utilizada por Wompi para enviar actualizaciones sobre el estado de las transacciones. 
 * **Flujo de middlewares**:
 *  1. **verifyWompiChecksum** → Verifica que la notificación provenga de Wompi validando la integridad de la firma.
 *  2. **validateRequestBody** → Valida que el cuerpo de la petición cumpla con el formato esperado.
 *  3. **validateWompiStatus** → Verifica el estado de la transacción y que los datos sean consistentes.
 *  4. **wompiController** → Procesa la notificación y actualiza el estado en la base de datos.
 * @access Public
 * @param {Object} req - Objeto de solicitud HTTP con los datos enviados por Wompi.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @param {Function} next - Función para pasar al siguiente middleware en caso de éxito.
 * @returns {JSON} Respuesta con el resultado del procesamiento de la notificación.
 * @example
 * // Ejemplo de payload que Wompi enviará al webhook
 * POST /
 * Content-Type: application/json
 * 
 * {
 *   "event": "transaction.updated",
 *   "data": {
 *     "transaction": {
 *       "id": "12345678",
 *       "status": "APPROVED",
 *       "reference": "ORD-98231",
 *       "amount_in_cents": 250000,
 *       "currency": "COP"
 *     }
 *   },
 *   "signature": "abcdef123456789"
 * }
 * 
 * // Respuesta exitosa
 * {
 *   "success": true,
 *   "message": "Webhook recibido correctamente"
 * }
 */
router.post('/',verifyWompiChecksum,validateRequestBody,validateWompiStatus, wompiController);

/**
 * @route POST /generate-signature
 * @summary Genera la firma para validar integridad de datos.
 * @description Este endpoint es usado por el frontend para generar una firma segura
 * que se utiliza al enviar transacciones a Wompi. 
 * **Flujo de middlewares**:
 *  1. **validateSignatureRequest** → Valida que los datos enviados por el frontend sean correctos.
 *  2. **wompiSignatureController** → Genera la firma usando los datos recibidos y la clave privada.
 * @access Private
 * @param {Object} req - Objeto de solicitud HTTP con la información de la transacción.
 * @param {Object} res - Objeto de respuesta HTTP con la firma generada.
 * @returns {JSON} Objeto que contiene la firma generada para la transacción.
 * @example
 * // Ejemplo de request desde el frontend
 * POST /generate-signature
 * Content-Type: application/json
 * 
 * {
 *   "reference": "ORD-98231",
 *   "amount_in_cents": 250000,
 *   "currency": "COP"
 * }
 * 
 * // Ejemplo de respuesta exitosa
 * {
 *   "signature": "abcdef123456789",
 *   "timestamp": "2025-08-19T15:23:45Z"
 * }
 */
router.post('/generate-signature',validateSignatureRequest, wompiSignatureController);

export default router;
