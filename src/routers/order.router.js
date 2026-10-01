import { Router } from 'express';

import { orderController } from '#controllers/index';
import { requireAdminKey } from '#middlewares/requireAdminKey.middleware';
import { validateOrderRequest } from '#middlewares/validateOrderRequest.middleware';

const router = Router();

router.post('/', validateOrderRequest, orderController.createOrder);
router.get('/', requireAdminKey, orderController.getAllOrders);
router.get('/:id/details', requireAdminKey, orderController.getOrderDetails);

export default router;
