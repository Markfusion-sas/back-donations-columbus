import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import multer from 'multer';
import { extname, join } from 'path';

import { PUBLIC_URL, UPLOADS_DIR } from '#config/environment.config';
import { mapEmprendimiento } from '#mappers/emprendimiento.mapper';

const MAX_LOGO_MB = 10;
const MAX_PHOTO_MB = 5;
const MAX_PHOTOS = 3;
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const EXT_BY_MIME = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/svg+xml': '.svg' };

/** Subcarpeta pública donde quedan las imágenes de emprendimientos. */
export const EMPRENDIMIENTOS_UPLOAD_PATH = 'emprendimientos';

const destination = join(UPLOADS_DIR, EMPRENDIMIENTOS_UPLOAD_PATH);
mkdirSync(destination, { recursive: true });

const storage = multer.diskStorage({
  destination,
  filename: (_req, file, cb) => {
    const ext = EXT_BY_MIME[file.mimetype] || extname(file.originalname).toLowerCase() || '.img';
    cb(null, `${file.fieldname === 'logo' ? 'logo' : 'foto'}-${randomUUID()}${ext}`);
  }
});

const fileFilter = (_req, file, cb) => {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    const error = new Error('Solo se permiten imágenes JPG, PNG, WEBP o SVG');
    error.statusCode = 400;
    return cb(error);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_LOGO_MB * 1024 * 1024, files: MAX_PHOTOS + 1 }
}).fields([
  { name: 'logo', maxCount: 1 },
  { name: 'fotos', maxCount: MAX_PHOTOS },
  { name: 'fotos[]', maxCount: MAX_PHOTOS }
]);

/**
 * Construye la URL pública de un archivo subido.
 * Usa PUBLIC_URL si está definida; si no, el host de la petición.
 */
const publicUrl = (req, filename) => {
  const base = PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
  return `${base.replace(/\/$/, '')}/api/v1/uploads/${EMPRENDIMIENTOS_UPLOAD_PATH}/${filename}`;
};

/**
 * Procesa el multipart/form-data del registro de emprendimiento:
 * guarda logo y fotos en disco y deja en `req.emprendimiento` el objeto
 * normalizado (con las URLs de las imágenes) listo para validar y guardar.
 */
export const uploadEmprendimiento = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      const error = err.code === 'LIMIT_FILE_SIZE'
        ? new Error(`Cada imagen debe pesar menos de ${MAX_LOGO_MB} MB`)
        : err.code === 'LIMIT_UNEXPECTED_FILE' || err.code === 'LIMIT_FILE_COUNT'
          ? new Error(`Puedes subir máximo ${MAX_PHOTOS} fotos y un logo`)
          : err;
      error.statusCode = error.statusCode || 400;
      return next(error);
    }

    const files = req.files ?? {};
    const logoFile = files.logo?.[0];
    const fotoFiles = [...(files.fotos ?? []), ...(files['fotos[]'] ?? [])].slice(0, MAX_PHOTOS);

    const tooBig = fotoFiles.find((f) => f.size > MAX_PHOTO_MB * 1024 * 1024);
    if (tooBig) {
      const error = new Error(`Cada foto debe pesar menos de ${MAX_PHOTO_MB} MB`);
      error.statusCode = 400;
      return next(error);
    }

    req.emprendimiento = mapEmprendimiento(req.body, {
      logo: logoFile ? publicUrl(req, logoFile.filename) : undefined,
      fotos: fotoFiles.map((f) => publicUrl(req, f.filename))
    });

    next();
  });
};
