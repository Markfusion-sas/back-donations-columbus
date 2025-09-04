/**
 * @function validateChecksum
 * @description
 * Esta función valida que la firma (`checksum`) recibida en la petición sea igual
 * al `checksum` que recibimos como respuesta del servicio de pagos. 
 * Es un mecanismo de **seguridad** para garantizar que la información no fue alterada
 * durante la transmisión. Si los valores no coinciden, se lanza un error con código 401.
 * @param {Object} req - Objeto de la petición (request) recibido por la API.
 * @param {string} responseChecksum - Cadena con el checksum esperado que viene desde Wompi.
 * @throws {Error} Si los checksums no coinciden, lanza un error con el mensaje:
 *         "La solicitud no cumple con los estándares de seguridad."
 * @example
 * // Ejemplo de uso dentro de un controlador:
 * try {
 *   validateChecksum(req, responseChecksum);
 *   console.log('Checksum válido, continuando con el flujo...');
 * } catch (error) {
 *   console.error(error.message);
 *   res.status(error.statusCode).json({ mensaje: error.message });
 * }
 */
export const validateChecksum = (req, responseChecksum) => {
  const checksumTransactions = req.signature?.checksum;
  if (checksumTransactions !== responseChecksum) {
    const error = new Error('The request does not meet security standards.');
    error.statusCode = 401;
    throw error;
  }
};
