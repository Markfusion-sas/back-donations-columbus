import { bingoTableSchema } from '#schemas/bingoTable.schema';

export const validateBingoTableRequest = (req, res, next) => {
  const { error } = bingoTableSchema.validate(req.body, { abortEarly: true });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};
