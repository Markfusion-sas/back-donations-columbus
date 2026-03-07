import { Donation } from '#models/donation.model';
import { errorLog } from '#utils/logger.util';

export const wompiTransactionServiceFactory = ({ Transaction, mapWompiTransaction }) => {

  const saveWompiTransaction = async(wompiData) => {
    const dbData = mapWompiTransaction(wompiData);
    try {
      const [transaction] = await Transaction.findOrCreate({
        where: { transaction_id: dbData.transaction_id },
        defaults: dbData
      });

      return transaction;
    } catch (error) {

      errorLog('Error al guardar transacción en DB:', error);

      // Retornamos null para indicar fallo en DB pero SIN interrumpir webhook
      return null;
    }
  };

  const getAllTransactions = async() => {

    try {

      const transactions = await Transaction.findAll({
        where: {
          status: 'APPROVED',
          transaction_type: 'donation'
        },
        attributes: ['reference', ['amount_in_cents', 'value'], 'payment_method_type', ['created_at', 'date']],
        include: [{
          model: Donation,
          required: true,
          as: 'donation',
        }],
      });

      return transactions;
    } catch (error) {
      errorLog('Error al traer los datos de la BD', error.message);
    }

  };

  return { saveWompiTransaction, getAllTransactions };
};
