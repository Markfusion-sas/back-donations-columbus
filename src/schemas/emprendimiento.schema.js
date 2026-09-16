import Joi from 'joi';

import { EMPRENDIMIENTO_CATEGORIAS, EMPRENDIMIENTO_RELACIONES } from '#config/constants.config';

const phone = Joi.string().pattern(/^\d{7,15}$/).required().messages({
  'string.pattern.base': 'El número debe tener entre 7 y 15 dígitos',
  'string.empty': 'El número es obligatorio',
  'any.required': 'El número es obligatorio'
});

const requiredText = (max, label) => Joi.string().max(max).required().messages({
  'string.empty': `${label} es obligatorio`,
  'any.required': `${label} es obligatorio`,
  'string.max': `${label} no puede superar ${max} caracteres`
});

/**
 * Valida el registro de un emprendimiento ya normalizado por el mapper
 * (ver mapEmprendimiento en #mappers/emprendimiento.mapper).
 */
export const emprendimientoSchema = Joi.object({
  acepta_datos: Joi.boolean().valid(true).required().messages({
    'any.only': 'Debes aceptar la autorización de uso de datos e imágenes',
    'any.required': 'Debes aceptar la autorización de uso de datos e imágenes'
  }),
  nombre_representante: requiredText(100, 'El nombre del representante'),
  telefono_personal: phone,
  relacion_tcs: Joi.array().items(Joi.string().valid(...EMPRENDIMIENTO_RELACIONES)).min(1).required().messages({
    'array.min': 'Selecciona al menos una relación con The Columbus School',
    'any.only': 'Relación con The Columbus School no válida'
  }),
  nombre_emprendimiento: requiredText(80, 'El nombre del emprendimiento'),
  telefono_marca: phone,
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.email': 'El correo electrónico no es válido',
    'string.empty': 'El correo electrónico es obligatorio',
    'any.required': 'El correo electrónico es obligatorio'
  }),
  categorias: Joi.array().items(Joi.string().valid(...EMPRENDIMIENTO_CATEGORIAS)).min(1).required().messages({
    'array.min': 'Selecciona al menos una categoría',
    'any.only': 'Categoría no válida'
  }),
  categoria_otro: Joi.string().max(60).allow(null, '').when('categorias', {
    is: Joi.array().has('otro'),
    then: Joi.string().max(60).invalid(null, '').required().messages({
      'any.invalid': 'Indica cuál es la otra categoría',
      'any.required': 'Indica cuál es la otra categoría'
    })
  }),
  historia: requiredText(1000, 'La historia de la marca'),
  descripcion: requiredText(1500, 'La descripción de productos o servicios'),
  red_social: requiredText(60, 'El usuario de la red social'),
  web: Joi.string().uri({ scheme: ['http', 'https'] }).required().messages({
    'string.uri': 'El link debe ser una URL válida (http:// o https://)',
    'string.empty': 'El link de página web o portafolio es obligatorio',
    'any.required': 'El link de página web o portafolio es obligatorio'
  }),
  punto_fisico: Joi.string().max(150).allow(null, ''),
  envios: Joi.string().max(150).allow(null, ''),
  logo: Joi.string().required().messages({
    'string.empty': 'El logo es obligatorio',
    'any.required': 'El logo es obligatorio'
  }),
  fotos: Joi.array().items(Joi.string()).max(3).messages({
    'array.max': 'Puedes subir máximo 3 fotos'
  }),
  beneficio_tcs: Joi.boolean().required(),
  beneficio_descripcion: Joi.string().max(200).allow(null, '').when('beneficio_tcs', {
    is: true,
    then: Joi.string().max(200).invalid(null, '').required().messages({
      'any.invalid': 'Describe el beneficio para la comunidad TCS',
      'any.required': 'Describe el beneficio para la comunidad TCS'
    })
  })
});

export const rechazoSchema = Joi.object({
  motivo: requiredText(1000, 'El motivo del rechazo')
});
