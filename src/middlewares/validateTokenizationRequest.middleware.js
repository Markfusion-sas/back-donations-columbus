import { nequiRegisterSchema } from '#schemas/nequiRegister.schema';
import { paymentSourceVerifySchema } from '#schemas/paymentSourceVerify.schema';

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: true });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};

export const validateNequiRegisterRequest = validate(nequiRegisterSchema);
export const validatePaymentSourceVerifyRequest = validate(paymentSourceVerifySchema);
