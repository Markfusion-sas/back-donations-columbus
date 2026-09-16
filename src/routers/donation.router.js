import { Router } from 'express';

import { donationController } from '#controllers/index';
import { uploadCertificado } from '#middlewares/uploadCertificado.middleware';
import { validateCertificadoRequest, validateLinkCertificadoRequest } from '#middlewares/validateCertificadoRequest.middleware';

const router = Router();

router.post('/', donationController.createDonation);

// Certificado de donación (cédula / RUT adjunto)
router.post('/certificado', uploadCertificado, validateCertificadoRequest, donationController.requestCertificate);
router.patch('/certificado/:id', validateLinkCertificadoRequest, donationController.linkCertificate);

export default router;
