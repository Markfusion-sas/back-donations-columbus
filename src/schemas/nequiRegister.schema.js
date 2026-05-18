import Joi from 'joi';

export const nequiRegisterSchema = Joi.object({
  token: Joi.string().required(),
  customer_email: Joi.string().email().required(),
  acceptance_token: Joi.string().required(),
  accept_personal_auth: Joi.string().required()
});
