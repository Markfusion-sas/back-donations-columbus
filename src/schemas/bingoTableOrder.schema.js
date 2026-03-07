import Joi from 'joi';

export const bingoTableOrderSchema = Joi.object({
  bingo_table_id: Joi.string().uuid().required().messages({
    'any.required': 'Bingo table ID is required',
    'string.base': 'Bingo table ID must be a string',
    'string.guid': 'Bingo table ID must be a valid UUID'
  }),
  identity_document: Joi.string().required().messages({
    'any.required': 'Identity document is required',
    'string.base': 'Identity document must be a string',
    'string.empty': 'Identity document cannot be empty'
  }),
  name: Joi.string().required().messages({
    'any.required': 'Name is required',
    'string.base': 'Name must be a string',
    'string.empty': 'Name cannot be empty'
  }),
  last_name: Joi.string().required().messages({
    'any.required': 'Last name is required',
    'string.base': 'Last name must be a string',
    'string.empty': 'Last name cannot be empty'
  }),
  phone: Joi.string().required().messages({
    'any.required': 'Phone is required',
    'string.base': 'Phone must be a string',
    'string.empty': 'Phone cannot be empty'
  }),
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required',
    'string.base': 'Email must be a string',
    'string.email': 'Email must be a valid email address'
  }),
  address: Joi.string().required().messages({
    'any.required': 'Address is required',
    'string.base': 'Address must be a string',
    'string.empty': 'Address cannot be empty'
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'any.required': 'Quantity is required',
    'number.base': 'Quantity must be a number',
    'number.integer': 'Quantity must be an integer',
    'number.min': 'Quantity must be at least 1'
  }),
  total: Joi.number().positive().required().messages({
    'any.required': 'Total is required',
    'number.base': 'Total must be a number',
    'number.positive': 'Total must be a positive number'
  })
});
