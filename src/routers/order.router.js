import { Router } from 'express';

import { orderController } from '#controllers/index';
import { validateOrderRequest } from '#middlewares/validateOrderRequest.middleware';

const router = Router();

router.post('/', validateOrderRequest, orderController.createOrder);
//router.get('/', orderController.getAllOrders);
router.get('/:id/details', orderController.getOrderDetails);

export default router;
