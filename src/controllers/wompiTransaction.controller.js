import { ORDER_STATUS } from '#config/constants.config';
import { bingoTableOrderService, donationService } from '#services/index';
import { errorLog } from '#utils/logger.util';

export const paymentControllerFactory = (validateChecksum, saveTransaction) => {
  return async(req, res, next) => {
    try {
      const transactionData = req.body;

      // Verificamos integridad de la notificación
      validateChecksum(transactionData, req.wompiChecksum);

      const { reference } = transactionData.data.transaction;

      // Detectamos el tipo por el prefijo del reference
      let entity, transaction_type;

      if (reference.startsWith('BINGO-')) {
        entity = await bingoTableOrderService.getBingoTableOrderByReference(reference);
        transaction_type = 'bingo_table_order';
      } else {
        entity = await donationService.getDonationByReference(reference);
        transaction_type = 'donation';
      }

      if (!entity) {
        const error = new Error(`No entity found for reference: ${reference}`);
        error.statusCode = 404;
        return next(error);
      }

      const dataTransaction = { transaction_type, ...transactionData.data.transaction };

      // Guardamos la transacción en base de datos
      const savedTransaction = await saveTransaction(dataTransaction);

      // Actualizamos la entidad con el transaction_id (y el estado si es una orden de bingo)
      if (savedTransaction) {
        const updateData = { transaction_id: savedTransaction.id };
        if (transaction_type === 'bingo_table_order') updateData.status = ORDER_STATUS.APPROVED;
        await entity.update(updateData);
      }

      // Descontamos stock solo cuando la transacción es aprobada
      if (transaction_type === 'bingo_table_order') {
        try {
          await bingoTableOrderService.decrementBingoTableStock(entity);
        } catch (stockError) {
          errorLog('Error al descontar stock de bingo table:', stockError);
        }
      }

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
