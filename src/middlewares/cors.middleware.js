const DEFAULT_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
const DEFAULT_HEADERS = ['Content-Type', 'Authorization', 'x-admin-key'];

/**
 * Convierte todos los valores del arreglo a mayúsculas y los une con comas.
 * @param {string[]} values - Arreglo de valores que se deben convertir a mayúsculas.
 * @returns {string} Cadena resultante con los valores en mayúscula separados por comas.
 * @example
 * parseHeader(['get', 'post']); // 'GET, POST'
 * @example
 * parseHeader(['Content-Type', 'Authorization']); // 'Content-Type, Authorization'
 */
const parseHeader = (values) => values.join(', ');

/**
 * Middleware para configurar encabezados CORS.
 * @param {object} options - Opciones de configuración.
 * @param {boolean} [options.skip=false] - Si es , omite la configuración de CORS.
 * @param {string} [options.origin='*'] - Origen u orígenes permitidos (separados por coma) para solicitudes CORS.
 * @param {string[]} [options.methods=['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']] - Métodos HTTP permitidos.
 * @param {string[]} [options.headers=['Content-Type', 'Authorization', 'x-admin-key']] - Encabezados permitidos.
 * Las peticiones preflight (OPTIONS) se responden con 204 sin pasar por las rutas.
 * @returns {void}
 * @example
 * app.use(cors({ origin: 'https://miapp.com' }));
 * @example
 * app.use(cors({ skip: true }));
 */
export const cors = ({ skip = false, origin = '*', methods = DEFAULT_METHODS, headers = DEFAULT_HEADERS }) => (req, res, next) => {
  if (!skip) {
    // `origin` admite varios orígenes separados por coma (p. ej. producción + túnel de demo + localhost).
    // Si el Origin de la petición está en la lista se responde con ese; si no, con el primero.
    const allowed = String(origin || '*').split(',').map((o) => o.trim()).filter(Boolean);
    const requestOrigin = req.headers.origin;
    const resolved = allowed.includes('*') ? '*' : (allowed.includes(requestOrigin) ? requestOrigin : allowed[0]);

    res.header('Access-Control-Allow-Origin', resolved);
    if (resolved !== '*') res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Methods', parseHeader(methods.map(value => value.toUpperCase())));
    res.header('Access-Control-Allow-Headers', parseHeader(headers));

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
  }
  next();
};
