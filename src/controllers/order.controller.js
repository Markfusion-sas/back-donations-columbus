import { orderService } from '#services/index';

export const orderControllerFactory = () => {

  const createOrder = async(req, res, next) => {
    try {
      const order = await orderService.createOrder(req.body);

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

  const getAllOrders = async(_req, res, next) => {
    try {
      const orders = await orderService.getAllOrders();

      return res.status(200).json({
        success: true,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  };

  const getOrderDetails = async(req, res, next) => {
    try {
      const result = await orderService.getOrderDetailsByOrderId(req.params.id);

      return res.status(200).json({
        success: true,
        data: result
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

  return { createOrder, getAllOrders, getOrderDetails };

};
