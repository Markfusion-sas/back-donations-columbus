/**
 * Enrutador principal de la aplicación.
 * Este archivo centraliza y organiza todos los submódulos de rutas de la API.
 * Cada módulo es cargado dinámicamente para mantener la escalabilidad y la 
 * separación de responsabilidades.
 * Actualmente, maneja las rutas relacionadas con las transacciones de Wompi.
 * @module Routers/index
 * @requires express
 * @requires #routers/wompiTransaction.router
 * @example
 * import router from '#routers/index';
 * app.use('/api/v1', router);
 */

import { Router } from 'express';

import wompiTransactionRouter from '#routers/wompiTransaction.router';

const router = Router();

/**
 * Rutas principales.
 * Prefijo: `/api/v1/wompitransaction`
 * Este prefijo agrupa todos los endpoints relacionados con la integración de
 * Wompi, incluyendo la creación, validación y verificación de transacciones.
 */
router.use('/wompitransaction', wompiTransactionRouter);

export default router;
