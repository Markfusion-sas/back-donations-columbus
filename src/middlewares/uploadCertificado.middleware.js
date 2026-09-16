import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import multer from 'multer';
import { extname, join } from 'path';

import { PUBLIC_URL, UPLOADS_DIR } from '#config/environment.config';

const MAX_MB = 10;
const ALLOWED_MIME = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const EXT_BY_MIME = { 'application/pdf': '.pdf', 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

/** Subcarpeta donde quedan las cédulas / RUT de solicitudes de certificado. */
export const CERTIFICADOS_UPLOAD_PATH = 'certificados';

const destination = join(UPLOADS_DIR, CERTIFICADOS_UPLOAD_PATH);
mkdirSync(destination, { recursive: true });

const storage = multer.diskStorage({
  destination,
  filename: (_req, file, cb) => {
    const ext = EXT_BY_MIME[file.mimetype] || extname(file.originalname).toLowerCase() || '.bin';
    cb(null, `documento-${randomUUID()}${ext}`);
  }
});

const fileFilter = (_req, file, cb) => {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    const error = new Error('Solo se permite PDF, JPG, PNG o WEBP');
    error.statusCode = 400;
    return cb(error);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_MB * 1024 * 1024, files: 1 }
}).single('documento');

const publicUrl = (req, filename) => {
  const base = PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
  return `${base.replace(/\/$/, '')}/api/v1/uploads/${CERTIFICADOS_UPLOAD_PATH}/${filename}`;
};

/**
 * Procesa el multipart/form-data de la solicitud de certificado.
 * Deja en `req.certificado` los datos del donante + la URL y ruta del documento.
 */
export const uploadCertificado = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      const error = err.code === 'LIMIT_FILE_SIZE'
        ? new Error(`El documento debe pesar menos de ${MAX_MB} MB`)
        : err;
      error.statusCode = error.statusCode || 400;
      return next(error);
    }

    if (!req.file) {
      const error = new Error('Adjunta tu cédula o RUT');
      error.statusCode = 400;
      return next(error);
    }

    const body = req.body ?? {};

    req.certificado = {
      name: body.name?.trim(),
      last_name: body.last_name?.trim(),
      email: body.email?.trim().toLowerCase(),
      phone: body.phone?.trim() || null,
      identity_document: body.identity_document?.trim(),
      donation_value: body.donation_value ? Number(body.donation_value) : null,
      donation_destination: body.donation_destination?.trim() || null,
      documento_url: publicUrl(req, req.file.filename),
      documento_nombre: req.file.originalname,
      // Ruta local: se usa para adjuntar el archivo al correo
      documento_path: req.file.path
    };

    next();
  });
};
