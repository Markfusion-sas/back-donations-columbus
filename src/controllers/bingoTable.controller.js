import { bingoTableService } from '#services/index';

export const bingoTableControllerFactory = () => {

  const createBingoTable = async (req, res, next) => {
    try {
      const table = await bingoTableService.createBingoTable(req.body);

      return res.status(201).json({
        success: true,
        data: table
      });
    } catch (error) {
      next(error);
    }
  };

  const getAllBingoTables = async (req, res, next) => {
    try {
      const tables = await bingoTableService.getAllBingoTables();

      return res.status(200).json({
        success: true,
        data: tables
      });
    } catch (error) {
      next(error);
    }
  };

  return { createBingoTable, getAllBingoTables };

};
