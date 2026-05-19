import { Router } from 'express';

import { paymentSourceController } from '#controllers/index';
import { validateCardRegisterRequest, validateNequiRegisterRequest, validatePaymentSourceVerifyRequest } from '#middlewares/validateTokenizationRequest.middleware';

const router = Router();

router.post('/nequi/register', validateNequiRegisterRequest, paymentSourceController.registerNequi);
router.post('/card/register', validateCardRegisterRequest, paymentSourceController.registerCard);
router.post('/verify', validatePaymentSourceVerifyRequest, paymentSourceController.verify);
router.get('/charges', paymentSourceController.listCharges);
router.delete('/:id', paymentSourceController.cancel);

export default router;
