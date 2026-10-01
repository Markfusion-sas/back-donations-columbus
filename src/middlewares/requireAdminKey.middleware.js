import { NODE_ENV } from '#config/environment.config';
import { isAdminConfigured, verifyAdminToken } from '#utils/adminToken.util';

/**
 * Indica si la petición trae una sesión válida del panel administrativo
 * (header `Authorization: Bearer <token>`, ver POST /admin/login).
 *
 * Reemplaza la antigua clave `x-admin-key`, que iba dentro del código del
 * frontend y cualquiera podía leer (2026-10-01).
 * Sin ADMIN_PASSWORD: en desarrollo se deja pasar; en producción se niega.
 */
export const isAdminRequest = (req) => {
  if (!isAdminConfigured()) return NODE_ENV !== 'production';

  const auth = String(req.headers.authorization ?? '');
  return auth.startsWith('Bearer ') && verifyAdminToken(auth.slice(7));
};

/** Protege las rutas del panel administrativo. */
export const requireAdminKey = (req, res, next) => {
  if (isAdminRequest(req)) return next();

  const error = new Error('Inicia sesión en el panel administrativo');
  error.statusCode = 401;
  next(error);
};
