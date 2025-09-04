/**
 * @module Schemas/Signature
 * @description
 * Esquema de validación para la creación de firmas de pago.
 * Este esquema valida los datos necesarios para generar la firma
 * utilizada en la integración con la pasarela de pagos Wompi.
 * Campos:
 * - reference: Referencia única de la transacción (string, requerido).
 * - amount_in_cents: Monto de la transacción en centavos (number, positivo, requerido).
 * - currency: Moneda de la transacción, solo acepta "COP" (string, requerido).
 * - customer_email: Email del cliente (string, opcional, formato válido).
 * - redirect_url: URL de redirección después del pago (string, opcional, formato URI válido).
 */

import Joi from 'joi';

export const signatureSchema = Joi.object({
  reference: Joi.string().required().messages({
    'any.required': 'Reference is required',
    'string.base': 'Reference must be a string'
  }),
  amount_in_cents: Joi.number().positive().required().messages({
    'any.required': 'Amount is required',
    'number.base': 'Amount must be a number',
    'number.positive': 'Amount must be a positive number'
  }),
  currency: Joi.string().valid('COP').required().messages({
    'any.required': 'Currency is required',
    'any.only': 'Currency must be "COP"'
  }),
  customer_email: Joi.string().email().optional().messages({
    'string.email': 'Customer email must be a valid email'
  }),
  redirect_url: Joi.string().uri().optional().messages({
    'string.uri': 'Redirect URL must be a valid URI'
  })
});
