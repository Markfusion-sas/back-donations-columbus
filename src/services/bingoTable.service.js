import { errorLog } from '#utils/logger.util';

export const bingoTableServiceFactory = ({ BingoTable, mapBingoTable }) => {

  const createBingoTable = async (tableData) => {
    const dbData = mapBingoTable(tableData);

    try {
      const table = await BingoTable.create(dbData);
      return table;
    } catch (error) {
      errorLog('Error al crear la tabla de bingo en la BD:', error);
      throw error;
    }
  };

  const getAllBingoTables = async () => {
    const tables = await BingoTable.findAll();
    return tables;
  };

  return { createBingoTable, getAllBingoTables };

};
