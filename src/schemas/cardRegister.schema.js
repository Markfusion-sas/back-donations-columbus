import Joi from 'joi';

export const cardRegisterSchema = Joi.object({
  token: Joi.string().required(),
  customer_email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  acceptance_token: Joi.string().required(),
  accept_personal_auth: Joi.string().required(),
  name: Joi.string().required(),
  last_name: Joi.string().required(),
  identity_document: Joi.string().required(),
  phone: Joi.string().required(),
  address: Joi.string().required(),
  donation_destination: Joi.string().required(),
  donation_value: Joi.number().integer().positive().required(),
  billing_frequency: Joi.string().valid('weekly', 'biweekly', 'monthly').required(),
  brand: Joi.string().required(),
  last_four: Joi.string().length(4).required(),
  exp_month: Joi.string().length(2).required(),
  exp_year: Joi.string().length(4).required(),
  card_holder: Joi.string().required()
});
