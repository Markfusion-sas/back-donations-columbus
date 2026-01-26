import { donationService } from '#services/index';

/**
 * Factory que crea un controlador de pagos para procesar transacciones.
 * Este controlador:
 *  1. Recibe la notificación del webhook de Wompi.
 *  2. Valida la integridad de los datos usando el checksum.
 *  3. Llama al servicio `saveWompiTransaction` para registrar la transacción.
 *  4. Si la DB falla, responde igualmente **200 OK** para evitar reintentos infinitos de Wompi.
 * @function paymentControllerFactory
 * @param {Function} validateChecksum - Función encargada de validar el checksum generado por Wompi.
 * @param {Function} saveTransaction - Función encargada de guardar la transacción en la base de datos.
 * @returns {Function} Middleware de Express para procesar la solicitud de pago.
 * @example
 * router.post('/', verifyWompiChecksum, validateRequestBody, validateWompiStatus,
 *   paymentControllerFactory(validateChecksum, saveWompiTransaction)
 * );
 */
export const paymentControllerFactory = (validateChecksum, saveTransaction) => {
  return async(req, res, next) => {
    try {
      const transactionData = req.body;

      // Verificamos integridad de la notificación
      validateChecksum(transactionData, req.wompiChecksum);

      //Buscamos la donacion que corresponde a la transaccion
      const { id: donation_id } = await donationService.getDonationByReference(transactionData.data.transaction.reference);
 
      const dataTransaction = { donation_id, ...transactionData.data.transaction };

      // Guardamos la transacción en base de datos
      const savedTransaction = await saveTransaction(dataTransaction);
      
      // Siempre respondemos 200 OK, incluso si no se pudo guardar
      res.status(200).json({
        success: true,
        message: savedTransaction
          ? 'Transaction registered successfully'
          : 'Transaction processed but not saved in DB',
        transaction: savedTransaction || null
      });
      
    } catch (error) {
      next(error);
    }
  };
};

export const listTransactions = (getAllTransactions) => {
  return async(req, res, next) => {

    try {
      const transactions = await getAllTransactions();

      return res.status(200).json({
        success: true,
        data: transactions
      });
    } catch (error) {
      next(error);
    }

  };
};
