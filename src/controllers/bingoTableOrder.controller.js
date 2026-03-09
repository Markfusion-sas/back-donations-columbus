import { bingoTableOrderService } from '#services/index';

export const bingoTableOrderControllerFactory = () => {

  const createBingoTableOrder = async(req, res, next) => {
    try {
      const order = await bingoTableOrderService.createBingoTableOrder(req.body);

      return res.status(201).json({
        success: true,
        data: order
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  };

  const getAllBingoTableOrders = async(req, res, next) => {
    try {
      const orders = await bingoTableOrderService.getAllBingoTableOrders();

      return res.status(200).json({
        success: true,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  };

  return { createBingoTableOrder, getAllBingoTableOrders };

};
