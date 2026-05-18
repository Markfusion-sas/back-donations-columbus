import { Router } from 'express';

import { paymentSourceController } from '#controllers/index';
import { validateNequiRegisterRequest } from '#middlewares/validateTokenizationRequest.middleware';

const router = Router();

router.post('/nequi/register', validateNequiRegisterRequest, paymentSourceController.registerNequi);

export default router;
