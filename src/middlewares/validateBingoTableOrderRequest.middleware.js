import { bingoTableOrderSchema } from '#schemas/bingoTableOrder.schema';

export const validateBingoTableOrderRequest = (req, res, next) => {
  const { error } = bingoTableOrderSchema.validate(req.body, { abortEarly: true });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};
