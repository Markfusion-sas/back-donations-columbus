import { Router } from 'express';

import { adminController } from '#controllers/index';
import { rateLimit } from '#middlewares/rateLimit.middleware';

const router = Router();

// Pocos intentos por IP para que la contraseña no se pueda adivinar a la fuerza
router.post('/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Demasiados intentos. Espera 15 minutos.' }), adminController.login);

export default router;
