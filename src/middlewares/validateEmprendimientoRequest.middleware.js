import { emprendimientoSchema, rechazoSchema } from '#schemas/emprendimiento.schema';

const validateWith = (schema, getData) => (req, res, next) => {
  const { error } = schema.validate(getData(req), { abortEarly: true });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};

/**
 * Valida el registro ya normalizado (`req.emprendimiento`, construido por
 * el middleware de subida de archivos + mapper).
 */
export const validateEmprendimientoRequest = validateWith(emprendimientoSchema, (req) => req.emprendimiento);

/**
 * Valida el body de rechazo ({ motivo }).
 */
export const validateRechazoRequest = validateWith(rechazoSchema, (req) => req.body ?? {});
