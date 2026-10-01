/**
 * Límite simple de peticiones por IP (en memoria). Evita que un endpoint
 * público se use para consultar cédulas de forma masiva.
 * @param {{ windowMs: number, max: number, message?: string }} options
 */
export const rateLimit = ({ windowMs, max, message = 'Demasiadas consultas. Inténtalo de nuevo en unos minutos.' }) => {
  const hits = new Map();

  return (req, res, next) => {
    // Detrás de nginx la IP real llega en X-Forwarded-For
    const ip = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() || req.ip;
    const now = Date.now();
    const entry = hits.get(ip);

    if (!entry || now - entry.start > windowMs) {
      hits.set(ip, { start: now, count: 1 });
    } else if (++entry.count > max) {
      return res.status(429).json({ success: false, message });
    }

    // Limpieza ocasional de entradas vencidas
    if (hits.size > 5000) {
      for (const [key, value] of hits) if (now - value.start > windowMs) hits.delete(key);
    }

    next();
  };
};
