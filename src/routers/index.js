import { Router } from 'express';

import donationRouter from '#routers/donation.router';
import orderRouter from '#routers/order.router';
import productRouter from '#routers/product.router';
import wompiTransactionRouter from '#routers/wompiTransaction.router';

const router = Router();

router.use('/wompitransaction', wompiTransactionRouter);
router.use('/donation', donationRouter);
router.use('/products', productRouter);
router.use('/orders', orderRouter);

export default router;
