import crypto from 'crypto';

import { SECRET_EVENT } from '#config/environment.config';

/**
 * Genera un hash SHA-256 (checksum) a partir de los datos de la transacción.
 * Esta función toma la información de una transacción, ordena los datos según las
 * propiedades definidas en la firma (`transactionObj.signature.properties`), los concatena
 * en un solo string junto con la marca de tiempo (`timestamp`) y la clave secreta (`SECRET_EVENT`),
 * y luego genera un hash criptográfico usando el algoritmo SHA-256.
 * @function assignChecksum
 * @param {Object} transactionObj - Objeto que contiene la información completa de la transacción.
 * @param {Object} transactionObj.signature - Información de la firma que define el orden de concatenación.
 * @param {string[]} transactionObj.signature.properties - Lista de propiedades que deben concatenarse.
 * @param {Object} transactionObj.data - Datos principales de la transacción.
 * @param {Object} transactionObj.data.transaction - Detalles de la transacción.
 * @param {string} transactionObj.data.transaction.id - ID único de la transacción.
 * @param {string} transactionObj.data.transaction.status - Estado actual de la transacción.
 * @param {number} transactionObj.data.transaction.amount_in_cents - Monto de la transacción en centavos.
 * @param {string} transactionObj.timestamp - Marca de tiempo en la que ocurrió el evento.
 * @returns {string} Retorna el hash SHA-256 generado como string hexadecimal.
 * @example
 * const transactionObj = {
 *   signature: { properties: ['transaction.id', 'transaction.status', 'transaction.amount_in_cents'] },
 *   data: {
 *     transaction: {
 *       id: 'abc123',
 *       status: 'APPROVED',
 *       amount_in_cents: 150000
 *     }
 *   },
 *   timestamp: '2025-08-19T18:32:00.000Z'
 * };
 *
 * const hash = checksum.assignChecksum(transactionObj);
 * console.log(hash); // Devuelve un hash SHA-256 único
 */
const assignChecksum = (transactionObj) => {

  const properties = transactionObj.signature.properties;
  const params = new Map();

  params.set('transaction.id', transactionObj.data.transaction.id);
  params.set('transaction.status', transactionObj.data.transaction.status);
  params.set('transaction.amount_in_cents', transactionObj.data.transaction.amount_in_cents);

  let concatenatedString = '';

  properties.forEach(property => {
    const value = params.get(property);
    concatenatedString += value;
  });

  concatenatedString += transactionObj.timestamp;
  concatenatedString += SECRET_EVENT;

  const sha256Hash = crypto.createHash('sha256').update(concatenatedString, 'utf-8').digest('hex');

  return sha256Hash;
};
export const checksum = { assignChecksum };
