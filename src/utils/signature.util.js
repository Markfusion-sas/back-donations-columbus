import crypto from 'crypto';

import { INTEGRITY_SECRET } from '#config/environment.config';

/**
 * Genera la firma criptográfica requerida por Wompi para validar
 * la integridad de la transacción.
 * @function generateWompiSignature
 * @param {Object} params - Objeto con los datos necesarios para generar la firma.
 * @param {string} params.reference - Referencia única de la transacción.
 * @param {number|string} params.amount_in_cents - Monto de la transacción expresado en centavos.
 * @param {string} params.currency - Moneda de la transacción (por ejemplo: "COP").
 * @throws {Error} Lanza un error si alguno de los parámetros requeridos no está presente.
 * @returns {string} Hash SHA-256 en formato hexadecimal que representa la firma de integridad.
 * @example
 * // Ejemplo de uso
 * const signature = generateWompiSignature({
 *   reference: 'ABC123',
 *   amount_in_cents: 500000,
 *   currency: 'COP'
 * });
 * console.log(signature);
 */
export const generateWompiSignature = ({ reference, amount_in_cents, currency }) => {
  if (!reference || !amount_in_cents || !currency) {
    throw new Error('Missing required parameters to generate signature');
  }

  const concatenated = `${reference}${amount_in_cents}${currency}${INTEGRITY_SECRET}`;

  return crypto
    .createHash('sha256')
    .update(concatenated, 'utf-8')
    .digest('hex');
};
