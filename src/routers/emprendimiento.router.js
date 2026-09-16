import { Router } from 'express';

import { emprendimientoController } from '#controllers/index';
import { requireAdminKey } from '#middlewares/requireAdminKey.middleware';
import { uploadEmprendimiento } from '#middlewares/uploadEmprendimiento.middleware';
import { validateEmprendimientoRequest, validateRechazoRequest } from '#middlewares/validateEmprendimientoRequest.middleware';

const router = Router();

// Público
router.post('/', uploadEmprendimiento, validateEmprendimientoRequest, emprendimientoController.createEmprendimiento);
router.get('/', emprendimientoController.getEmprendimientos);
router.get('/:id', emprendimientoController.getEmprendimientoById);

// Panel administrativo
router.patch('/:id/aprobar', requireAdminKey, emprendimientoController.aprobarEmprendimiento);
router.patch('/:id/rechazar', requireAdminKey, validateRechazoRequest, emprendimientoController.rechazarEmprendimiento);

export default router;
