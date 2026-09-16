import Joi from 'joi';

const requiredText = (max, label) => Joi.string().max(max).required().messages({
  'string.empty': `${label} es obligatorio`,
  'any.required': `${label} es obligatorio`,
  'string.max': `${label} no puede superar ${max} caracteres`
});

/** Solicitud de certificado (ya normalizada por uploadCertificado). */
export const donationCertificateSchema = Joi.object({
  name: requiredText(100, 'El nombre'),
  last_name: requiredText(100, 'El apellido'),
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.email': 'El correo electrónico no es válido',
    'string.empty': 'El correo electrónico es obligatorio',
    'any.required': 'El correo electrónico es obligatorio'
  }),
  phone: Joi.string().max(30).allow(null, ''),
  identity_document: requiredText(30, 'El documento de identidad'),
  donation_value: Joi.number().min(0).allow(null),
  donation_destination: Joi.string().max(100).allow(null, ''),
  documento_url: Joi.string().required(),
  documento_nombre: Joi.string().required(),
  documento_path: Joi.string().required()
});

/** Vinculación con la donación creada. */
export const linkCertificateSchema = Joi.object({
  reference: Joi.string().pattern(/^DON-/).required().messages({
    'string.pattern.base': 'La referencia no es válida',
    'any.required': 'La referencia es obligatoria'
  })
});
