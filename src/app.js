import express from 'express';
import { basename } from 'path';

import { FRONTEND_URL, NODE_ENV, PORT } from '#config/environment.config';
import { initDatabase } from '#config/initModel.config';
import { cors } from '#middlewares/cors.middleware';
import { errorHandler } from '#middlewares/errorHandler.middleware';
import { responseHandler } from '#middlewares/responseHandler.middleware';
import { PaymentSource } from '#models/paymentSource.model';
import { billingQueue } from '#queues/billing.queue';
import routes from '#routers/index';
import { scheduleBillingJobs } from '#schedulers/billing.scheduler';
import { log } from '#utils/logger.util';
import { startBillingWorker } from '#workers/billing.worker';

const app = express();

/**
 * @module server
 * @description
 * Configuración principal de la aplicación **Express**.
 * Se encarga de inicializar middlewares, configurar rutas, manejar errores
 * y levantar el servidor. Además, establece la conexión con la base de datos.
 * @requires express
 * @requires path
 * @requires #config/environment.config
 * @requires #config/initModel.config
 * @requires #middlewares/cors.middleware
 * @requires #middlewares/errorHandler.middleware
 * @requires #middlewares/responseHandler.middleware
 * @requires #routers/index
 * @requires #utils/logger.util
 */
/**
 * Middleware de configuración **CORS**.
 * Define el origen permitido para las solicitudes.
 * @function
 * @param {Object} options - Opciones para configurar CORS.
 * @param {string} options.origin - Origen permitido para las solicitudes.
 * @see {@link #middlewares/cors.middleware}
 */
app.use(cors({ origin: FRONTEND_URL }));

/**
 * Configuración para que las respuestas JSON tengan formato legible.
 * Cada objeto se indentará con **2 espacios**.
 * @example
 * {
 *   "success": true,
 *   "data": {...}
 * }
 */
app.set('json spaces', 2);

/**
 * Middleware para procesar solicitudes JSON entrantes.
 * Equivalente a `body-parser.json()`.
 */
app.use(express.json());

/**
 * Middleware para **debugging**.
 * Loggea los **headers** y el **body** de cada petición entrante.
 * @example
 * === HEADERS ===
 * { "content-type": "application/json" }
 * === BODY ===
 * { "userId": 123, "product": "Laptop" }
 */
app.use((req, res, next) => {
  log('=== HEADERS ===');
  log(req.headers);

  log('=== BODY ===');
  log(req.body);

  next();
});

/**
 * Rutas principales de la API.
 * Todas las rutas están bajo el prefijo `/api/v1`.
 * @example
 * GET /api/v1/transactions
 * POST /api/v1/payments
 */
app.use('/api/v1', routes);

/**
 * Middleware para dar formato a las respuestas.
 * Garantiza que todas las respuestas sigan la misma estructura.
 * @see {@link #middlewares/responseHandler.middleware}
 */
app.use(responseHandler);

/**
 * Middleware global para manejo de errores.
 * Captura cualquier excepción y devuelve una respuesta uniforme.
 * @see {@link #middlewares/errorHandler.middleware}
 */
app.use(errorHandler);

/**
 * Inicializa la base de datos y levanta el servidor.
 * Solo se ejecuta si el archivo es el **punto de entrada principal**
 * y si no estamos en un entorno de **test**.
 * @async
 * @function startServer
 * @returns {Promise<void>}
 */
if (basename(import.meta.url) === basename(process.argv[1]) && NODE_ENV !== 'test') {
  initDatabase().then(async () => {
    await startBillingWorker(PaymentSource);

    await scheduleBillingJobs(PaymentSource);

    await billingQueue.add(
      'daily-billing-check',
      { type: 'scheduled' },
      { repeat: { pattern: '0 8 * * *' } }
    );

    app.listen(PORT, () => {
      log(`Servidor Express corriendo en http://localhost:${PORT}\n`);
    });
  });
}

export { app };
