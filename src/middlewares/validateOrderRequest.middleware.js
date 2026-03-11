import { orderSchema } from '#schemas/order.schema';

export const validateOrderRequest = (req, res, next) => {
  const { error } = orderSchema.validate(req.body, { abortEarly: true });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};
