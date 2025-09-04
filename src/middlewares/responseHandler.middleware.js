/**
 * Manejador de respuestas estándar.
 * Envía una respuesta JSON con código de estado **200**,
 * estableciendo `success: true` y combinando los datos
 * previamente almacenados en `res.locals.data`.
 * @function
 * @param {import('express').Request} req - Objeto de solicitud de Express.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @returns {void} No retorna ningún valor, envía la respuesta al cliente.
 * @example
 * // Ejemplo de uso en un middleware o controlador:
 * app.get('/clientes', (req, res, next) => {
 *   res.locals.data = { clientes: [{ id: 1, nombre: 'Mauricio' }] };
 *   next();
 * }, responseHandler);
 *
 * // Respuesta esperada:
 * // {
 * //   "success": true,
 * //   "clientes": [{ "id": 1, "nombre": "Mauricio" }]
 * // }
 */export const responseHandler = (req, res) => {
  res.status(200).json({
    ...res.locals.data,
    success: true
  });
};
