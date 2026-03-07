import { Router } from 'express';

import { bingoTableController } from '#controllers/index';
import { validateBingoTableRequest } from '#middlewares/validateBingoTableRequest.middleware';

const router = Router();

router.post('/', validateBingoTableRequest, bingoTableController.createBingoTable);
router.get('/', bingoTableController.getAllBingoTables);

export default router;
