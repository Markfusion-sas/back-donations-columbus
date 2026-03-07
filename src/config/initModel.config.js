import sequelize from '#config/database.config';
import { setupAssociations } from '#models/associations';
import { BingoTable } from '#models/bingoTable.model';
import { BingoTableOrder } from '#models/bingoTableOrder.model';
import { Donation } from '#models/donation.model';
import { Transaction } from '#models/transaction.model';
import { errorLog, sqlLog } from '#utils/logger.util';

/**
 * @function initDatabase
 * @description Inicializa la conexión con la base de datos, verifica la autenticación
 *              y sincroniza el modelo `Transaction` con la base de datos.
 * @async
 * @returns {Promise<void>} No retorna ningún valor. Finaliza el proceso si ocurre un error.
 * @example
 * await initDatabase();
 * @throws {Error} Lanza un error si la conexión a la base de datos falla.
 */
export const initDatabase = async() => {
  try {
    await sequelize.authenticate();
    sqlLog('Conexión establecida con la base de datos');

    setupAssociations();

    await Transaction.sync({ alter: false });
    await Donation.sync({ alter: false });
    await BingoTable.sync({ alter: false });
    await BingoTableOrder.sync({ alter: false });

    await BingoTable.findOrCreate({
      where: { title: 'Tabla bingo' },
      defaults: {
        title: 'Tabla bingo',
        image_url: 'https://postimg.cc/N5X569GQ',
        stock: 500,
        description: null,
        price: 45000,
        price_offer: 40000
      }
    });
  } catch (error) {
    errorLog('Error al iniciar conexión:', error.message);
    process.exit(1);
  }
};
