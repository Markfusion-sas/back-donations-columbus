import { Router } from 'express';

import { productController } from '#controllers/index';

const router = Router();

router.get('/', productController.getAllProducts);
router.get('/:id/variants', productController.getVariantsByProduct);

export default router;
