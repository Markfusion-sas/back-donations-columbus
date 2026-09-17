import { Router } from 'express';

import { siteContentController } from '#controllers/index';
import { requireAdminKey } from '#middlewares/requireAdminKey.middleware';
import { uploadSiteImage } from '#middlewares/uploadSiteImage.middleware';

const router = Router();

// Público: el sitio lo consulta al cargar
router.get('/', siteContentController.getContent);

// Panel administrativo
router.put('/', requireAdminKey, siteContentController.saveContent);
router.post('/imagen', requireAdminKey, uploadSiteImage, siteContentController.uploadImage);

export default router;
