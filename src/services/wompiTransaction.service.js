import { errorLog } from '#utils/logger.util';
/**
 * @module services/wompiTransactionService
 * @description
 * Servicio encargado de gestionar la persistencia de las transacciones
 * recibidas desde el webhook de Wompi.
 * Este servicio:
 *  1. Recibe los datos enviados por Wompi.
 *  2. Mapea la información al formato de nuestra base de datos utilizando `mapWompiTransaction`.
 *  3. Usa `findOrCreate` para evitar crear transacciones duplicadas.
 *  4. Si la transacción ya existe, la retorna sin duplicar datos.
 *  5. Si ocurre un error en la base de datos, devuelve `null` pero **no lanza un error**,
 *     permitiendo que el webhook siga funcionando correctamente.
 * @param {Object} dependencies - Dependencias necesarias para crear el servicio.
 * @param {import('sequelize').Model} dependencies.Transaction - Modelo Sequelize para manejar transacciones.
 * @param {Function} dependencies.mapWompiTransaction - Función para mapear datos de Wompi al modelo de la BD.
 * @returns {Object} Objeto que expone los métodos del servicio.
 * @property {Function} saveWompiTransaction - Guarda una transacción en base de datos usando `findOrCreate`.
 * @example
 * import { wompiTransactionServiceFactory } from '#services/wompiTransaction.service';
 * import { Transaction } from '#models/transaction.model';
 * import { mapWompiTransaction } from '#mappers/wompiTransaction.mapper';
 * const wompiTransactionService = wompiTransactionServiceFactory({
 *   Transaction,
 *   mapWompiTransaction
 * });
 *
 * const transaction = await wompiTransactionService.saveWompiTransaction(wompiData);
 *
 * if (!transaction) {
 *   console.log('Webhook recibido, pero la transacción no se guardó en la base de datos');
 * }
 */

export const wompiTransactionServiceFactory = ({ Transaction, mapWompiTransaction }) => {
  /**
   * @function saveWompiTransaction
   * @description
   * Intenta guardar una transacción proveniente del webhook de Wompi en la base de datos.
   * Utiliza `findOrCreate` para evitar duplicados.  
   * En caso de fallo, devuelve `null` para permitir que el webhook continúe sin errores.
   * @async
   * @param {Object} wompiData - Datos de la transacción recibidos desde Wompi.
   * @returns {Promise<Object|null>} Transacción creada o existente, o `null` si ocurrió un error.
   */
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
  
  return { saveWompiTransaction };
};
