import Joi from 'joi';

export const paymentSourceVerifySchema = Joi.object({
  customer_email: Joi.string().email().required(),
  password: Joi.string().required()
});
