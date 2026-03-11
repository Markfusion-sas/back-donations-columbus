import Joi from 'joi';

const orderDetailSchema = Joi.object({
  product_variant_id: Joi.string().uuid().required().messages({
    'any.required': 'El ID de variante es obligatorio',
    'string.base': 'El ID de variante debe ser texto',
    'string.guid': 'El ID de variante debe ser un UUID válido'
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'any.required': 'La cantidad es obligatoria',
    'number.base': 'La cantidad debe ser un número',
    'number.integer': 'La cantidad debe ser un número entero',
    'number.min': 'La cantidad debe ser al menos 1'
  }),
  unit_price: Joi.number().positive().required().messages({
    'any.required': 'El precio unitario es obligatorio',
    'number.base': 'El precio unitario debe ser un número',
    'number.positive': 'El precio unitario debe ser un número positivo'
  }),
  total: Joi.number().positive().required().messages({
    'any.required': 'El total del ítem es obligatorio',
    'number.base': 'El total del ítem debe ser un número',
    'number.positive': 'El total del ítem debe ser un número positivo'
  })
});

export const orderSchema = Joi.object({
  identity_document: Joi.string().required().messages({
    'any.required': 'El documento de identidad es obligatorio',
    'string.base': 'El documento de identidad debe ser texto',
    'string.empty': 'El documento de identidad no puede estar vacío'
  }),
  name: Joi.string().required().messages({
    'any.required': 'El nombre es obligatorio',
    'string.base': 'El nombre debe ser texto',
    'string.empty': 'El nombre no puede estar vacío'
  }),
  last_name: Joi.string().required().messages({
    'any.required': 'El apellido es obligatorio',
    'string.base': 'El apellido debe ser texto',
    'string.empty': 'El apellido no puede estar vacío'
  }),
  phone: Joi.string().required().messages({
    'any.required': 'El teléfono es obligatorio',
    'string.base': 'El teléfono debe ser texto',
    'string.empty': 'El teléfono no puede estar vacío'
  }),
  email: Joi.string().email().required().messages({
    'any.required': 'El correo electrónico es obligatorio',
    'string.base': 'El correo electrónico debe ser texto',
    'string.email': 'El correo electrónico no es válido'
  }),
  address: Joi.string().required().messages({
    'any.required': 'La dirección es obligatoria',
    'string.base': 'La dirección debe ser texto',
    'string.empty': 'La dirección no puede estar vacía'
  }),
  total: Joi.number().positive().required().messages({
    'any.required': 'El total es obligatorio',
    'number.base': 'El total debe ser un número',
    'number.positive': 'El total debe ser un número positivo'
  }),
  items: Joi.array().items(orderDetailSchema).min(1).required().messages({
    'any.required': 'Los ítems son obligatorios',
    'array.base': 'Los ítems deben ser un arreglo',
    'array.min': 'Debe haber al menos un ítem en la orden'
  })
});
