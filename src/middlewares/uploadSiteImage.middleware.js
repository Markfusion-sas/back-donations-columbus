import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import multer from 'multer';
import { extname, join } from 'path';

import { PUBLIC_URL, UPLOADS_DIR } from '#config/environment.config';

const MAX_MB = 10;
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif', 'application/pdf'];
const EXT_BY_MIME = {
  'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/svg+xml': '.svg', 'image/gif': '.gif', 'application/pdf': '.pdf'
};

/** Subcarpeta pública para imágenes/documentos del sitio (CMS). */
export const SITIO_UPLOAD_PATH = 'sitio';

const destination = join(UPLOADS_DIR, SITIO_UPLOAD_PATH);
mkdirSync(destination, { recursive: true });

const storage = multer.diskStorage({
  destination,
  filename: (_req, file, cb) => {
    const ext = EXT_BY_MIME[file.mimetype] || extname(file.originalname).toLowerCase() || '.bin';
    cb(null, `${randomUUID()}${ext}`);
  }
});

const fileFilter = (_req, file, cb) => {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    const error = new Error('Solo se permiten imágenes (JPG, PNG, WEBP, SVG, GIF) o PDF');
    error.statusCode = 400;
    return cb(error);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_MB * 1024 * 1024, files: 1 } }).single('imagen');

/**
 * Sube una imagen del sitio y deja en `req.imagenUrl` su URL pública.
 */
export const uploadSiteImage = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      const error = err.code === 'LIMIT_FILE_SIZE' ? new Error(`El archivo debe pesar menos de ${MAX_MB} MB`) : err;
      error.statusCode = error.statusCode || 400;
      return next(error);
    }
    if (!req.file) {
      const error = new Error('Adjunta una imagen');
      error.statusCode = 400;
      return next(error);
    }

    const base = PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
    req.imagenUrl = `${base.replace(/\/$/, '')}/api/v1/uploads/${SITIO_UPLOAD_PATH}/${req.file.filename}`;
    next();
  });
};
