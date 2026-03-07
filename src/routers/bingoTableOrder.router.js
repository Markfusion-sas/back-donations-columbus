import { Router } from 'express';

import { bingoTableOrderController } from '#controllers/index';
import { validateBingoTableOrderRequest } from '#middlewares/validateBingoTableOrderRequest.middleware';

const router = Router();

router.post('/', validateBingoTableOrderRequest, bingoTableOrderController.createBingoTableOrder);
router.get('/', bingoTableOrderController.getAllBingoTableOrders);

export default router;
