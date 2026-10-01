import { checkAdminPassword, createAdminToken, isAdminConfigured } from '#utils/adminToken.util';

export const adminControllerFactory = () => {

  /** POST /admin/login  body: { password } → { token, expiresAt } */
  const login = (req, res, next) => {
    try {
      if (!isAdminConfigured()) {
        const error = new Error('El acceso al panel no está configurado (ADMIN_PASSWORD)');
        error.statusCode = 503;
        throw error;
      }

      if (!checkAdminPassword(req.body?.password)) {
        const error = new Error('Contraseña incorrecta');
        error.statusCode = 401;
        throw error;
      }

      return res.status(200).json({ success: true, data: createAdminToken() });
    } catch (error) {
      next(error);
    }
  };

  return { login };

};
