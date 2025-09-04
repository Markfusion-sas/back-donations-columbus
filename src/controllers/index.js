import { signatureControllerFactory } from '#controllers/wompiSignature.controller';
import { paymentControllerFactory } from '#controllers/wompiTransaction.controller';
import { wompiTransactionService } from '#services/index';
import { generateWompiSignature } from '#utils/signature.util';
import { validateChecksum } from '#utils/validateCheksum.util';

/**
 * Controlador principal para manejar las transacciones de Wompi. 
 * Este controlador se genera mediante la factoría `paymentControllerFactory`,
 * a la cual se le inyectan las dependencias necesarias:
 * - `validateCheksumUtil`: Utilidad para validar la integridad de la transacción.
 * - `saveWompiTransaction`: Servicio encargado de almacenar la transacción en la base de datos.
 * @constant {Object} wompiController - Controlador de pagos Wompi.
 */
export const wompiController = paymentControllerFactory(
  validateChecksum,
  wompiTransactionService.saveWompiTransaction
);

/**
 * Controlador para la generación de firmas en Wompi. 
 * Este controlador es generado por la factoría `signatureControllerFactory`,
 * utilizando la utilidad `generateWompiSignature` para crear la firma
 * requerida por la pasarela de pagos.
 * @constant {Object} wompiSignatureController - Controlador de firmas Wompi.
 */
export const wompiSignatureController = signatureControllerFactory(
  generateWompiSignature
);
