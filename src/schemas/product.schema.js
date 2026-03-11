import Joi from 'joi';

export const productSchema = Joi.object({
  title: Joi.string().required().messages({
    'any.required': 'El título es obligatorio',
    'string.base': 'El título debe ser texto',
    'string.empty': 'El título no puede estar vacío'
  }),
  image_url: Joi.string().uri().required().messages({
    'any.required': 'La URL de imagen es obligatoria',
    'string.base': 'La URL de imagen debe ser texto',
    'string.uri': 'La URL de imagen debe ser una URL válida',
    'string.empty': 'La URL de imagen no puede estar vacía'
  }),
  stock: Joi.number().integer().min(0).required().messages({
    'any.required': 'El stock es obligatorio',
    'number.base': 'El stock debe ser un número',
    'number.integer': 'El stock debe ser un número entero',
    'number.min': 'El stock no puede ser negativo'
  }),
  description: Joi.string().optional().allow('', null).messages({
    'string.base': 'La descripción debe ser texto'
  })
});
