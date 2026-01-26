import { Router } from 'express';

import { donationController } from '#controllers/index';

const router = Router();

router.post('/', donationController.createDonation);

export default router;
