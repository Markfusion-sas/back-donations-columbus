import { ORDER_STATUS } from '#config/constants.config';
import { sendOrderConfirmationEmail } from '#services/email.service';
import { donationService, orderService, paymentSourceService } from '#services/index';
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
        entity = await orderService.getOrderByReference(reference);
        transaction_type = 'bingo_table_order';
      } else if (reference.startsWith('REC-')) {
        entity = await paymentSourceService.getChargeByReference(reference);
        transaction_type = 'recurring';
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

      // Actualizamos la entidad según el tipo
      if (savedTransaction) {
        if (transaction_type === 'bingo_table_order') {
          await entity.update({ transaction_id: savedTransaction.id, status: ORDER_STATUS.APPROVED });
        } else if (transaction_type === 'recurring') {
          const { status } = transactionData.data.transaction;
          await entity.update({
            transaction_id: savedTransaction.id,
            status: status === 'APPROVED' ? 'approved' : 'declined'
          });
        } else {
          await entity.update({ transaction_id: savedTransaction.id });
        }
      }

      // Descontamos stock y enviamos correo de confirmación cuando la transacción es aprobada
      if (transaction_type === 'bingo_table_order') {
        try {
          await orderService.decrementStock(entity);
        } catch (stockError) {
          errorLog('Error al descontar stock:', stockError);
        }

        try {
          const { order, details } = await orderService.getOrderDetailsByOrderId(entity.id);
          await sendOrderConfirmationEmail({ order, details });
        } catch (emailError) {
          errorLog('Error al enviar correo de confirmación:', emailError);
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
