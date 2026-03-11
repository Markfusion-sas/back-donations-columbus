import { productSchema } from '#schemas/product.schema';

export const validateProductRequest = (req, res, next) => {
  const { error } = productSchema.validate(req.body, { abortEarly: true });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};
