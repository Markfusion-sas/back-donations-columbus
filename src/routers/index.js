import { Router } from 'express';

import comunidadRouter from '#routers/comunidad.router';
import donationRouter from '#routers/donation.router';
import emprendimientoRouter from '#routers/emprendimiento.router';
import orderRouter from '#routers/order.router';
import paymentSourceRouter from '#routers/paymentSource.router';
import productRouter from '#routers/product.router';
import siteContentRouter from '#routers/siteContent.router';
import wompiTransactionRouter from '#routers/wompiTransaction.router';

const router = Router();

router.use('/wompitransaction', wompiTransactionRouter);
router.use('/donation', donationRouter);
router.use('/products', productRouter);
router.use('/orders', orderRouter);
router.use('/payment-sources', paymentSourceRouter);
router.use('/emprendimientos', emprendimientoRouter);
router.use('/contenido', siteContentRouter);
router.use('/comunidad', comunidadRouter);

export default router;
