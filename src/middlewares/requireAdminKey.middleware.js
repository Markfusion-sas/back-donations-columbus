import { ADMIN_API_KEY } from '#config/environment.config';

/**
 * Protege las rutas del panel administrativo.
 * Si `ADMIN_API_KEY` está definida, exige el header `x-admin-key` con ese valor.
 * Si no está definida, deja pasar (mismo comportamiento del resto del panel).
 */
export const requireAdminKey = (req, res, next) => {
  if (!ADMIN_API_KEY) return next();

  if (req.headers['x-admin-key'] !== ADMIN_API_KEY) {
    const error = new Error('No autorizado');
    error.statusCode = 401;
    return next(error);
  }

  next();
};
