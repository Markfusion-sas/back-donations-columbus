import Joi from 'joi';

import {
  EMPRENDIMIENTO_CATEGORIAS,
  EMPRENDIMIENTO_CONDICIONES_BENEFICIO,
  EMPRENDIMIENTO_REDES,
  EMPRENDIMIENTO_RELACIONES
} from '#config/constants.config';

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
  cedula: Joi.string().pattern(/^\d{5,15}$/).required().messages({
    'string.pattern.base': 'La cédula debe tener entre 5 y 15 dígitos',
    'string.empty': 'La cédula es obligatoria',
    'any.required': 'La cédula es obligatoria'
  }),
  // Obligatorio para papá/mamá y estudiantes (se verifica con el colegio)
  codigo_familia: Joi.string().max(30).allow(null, '').when('relacion_tcs', {
    is: Joi.array().has(Joi.string().valid('padre', 'estudiante')),
    then: Joi.string().max(30).invalid(null, '').required().messages({
      'any.invalid': 'El código de familia es obligatorio',
      'any.required': 'El código de familia es obligatorio'
    })
  }),
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
  historia: requiredText(500, 'La historia de la marca'),
  descripcion: requiredText(500, 'La descripción de productos o servicios'),
  red_social: requiredText(60, 'El usuario de la red social'),
  red_social_tipo: Joi.string().valid(...EMPRENDIMIENTO_REDES).default('instagram'),
  web: Joi.string().uri({ scheme: ['http', 'https'] }).required().messages({
    'string.uri': 'El link debe ser una URL válida (http:// o https://)',
    'string.empty': 'El link de página web o portafolio es obligatorio',
    'any.required': 'El link de página web o portafolio es obligatorio'
  }),
  punto_fisico: Joi.string().max(150).allow(null, ''),
  horario: Joi.string().max(150).allow(null, ''),
  envios: Joi.string().max(150).allow(null, ''),
  logo: Joi.string().required().messages({
    'string.empty': 'El logo es obligatorio',
    'any.required': 'El logo es obligatorio'
  }),
  fotos: Joi.array().items(Joi.string()).max(3).messages({
    'array.max': 'Puedes subir máximo 3 fotos'
  }),
  beneficio_tcs: Joi.boolean().required(),
  beneficio_descripcion: Joi.string().max(300).allow(null, '').when('beneficio_tcs', {
    is: true,
    then: Joi.string().max(300).invalid(null, '').required().messages({
      'any.invalid': 'Describe el beneficio para la comunidad TCS',
      'any.required': 'Describe el beneficio para la comunidad TCS'
    })
  }),
  beneficio_como: Joi.string().max(300).allow(null, '').when('beneficio_tcs', {
    is: true,
    then: Joi.string().max(300).invalid(null, '').required().messages({
      'any.invalid': 'Indica cómo hacer efectivo el beneficio',
      'any.required': 'Indica cómo hacer efectivo el beneficio'
    })
  }),
  beneficio_condiciones: Joi.array().items(Joi.string().valid(...EMPRENDIMIENTO_CONDICIONES_BENEFICIO)).when('beneficio_tcs', {
    is: true,
    then: Joi.array().min(1).required().messages({
      'array.min': 'Selecciona al menos una condición de la oferta',
      'any.required': 'Selecciona al menos una condición de la oferta'
    })
  }),
  beneficio_condiciones_detalle: Joi.string().max(300).allow(null, '')
});

export const rechazoSchema = Joi.object({
  motivo: requiredText(1000, 'El motivo del rechazo')
});

/**
 * Edición desde el panel admin: el logo solo viene si se reemplaza y la
 * autorización de datos no se vuelve a pedir.
 */
export const emprendimientoUpdateSchema = emprendimientoSchema
  .fork(['logo'], (field) => field.optional())
  .fork(['acepta_datos'], () => Joi.any().optional());
