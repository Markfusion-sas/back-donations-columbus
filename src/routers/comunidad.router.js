import { Router } from 'express';

import { comunidadController } from '#controllers/index';
import { rateLimit } from '#middlewares/rateLimit.middleware';

const router = Router();

// Público (registro del directorio), con límite por IP
router.get('/validar', rateLimit({ windowMs: 10 * 60 * 1000, max: 30 }), comunidadController.validarCedula);

export default router;
