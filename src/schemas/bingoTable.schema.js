import Joi from 'joi';

export const bingoTableSchema = Joi.object({
  title: Joi.string().required().messages({
    'any.required': 'Title is required',
    'string.base': 'Title must be a string',
    'string.empty': 'Title cannot be empty'
  }),
  image_url: Joi.string().uri().required().messages({
    'any.required': 'Image URL is required',
    'string.base': 'Image URL must be a string',
    'string.uri': 'Image URL must be a valid URI',
    'string.empty': 'Image URL cannot be empty'
  }),
  stock: Joi.number().integer().min(0).required().messages({
    'any.required': 'Stock is required',
    'number.base': 'Stock must be a number',
    'number.integer': 'Stock must be an integer',
    'number.min': 'Stock cannot be negative'
  }),
  description: Joi.string().optional().allow('', null).messages({
    'string.base': 'Description must be a string'
  }),
  price: Joi.number().positive().required().messages({
    'any.required': 'Price is required',
    'number.base': 'Price must be a number',
    'number.positive': 'Price must be a positive number'
  })
});
