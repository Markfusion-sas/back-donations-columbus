import { comunidadService } from '#services/index';

export const comunidadControllerFactory = () => {

  /**
   * GET /comunidad/validar?cedula=... — verifica si la cédula pertenece a la
   * comunidad TCS (familias, estudiantes y staff). Devuelve lo necesario para
   * autocompletar el registro, como TCS Run: relaciones, nombre y celular (decisión de Juan José Ayala, 2026-09-30;
   * pendiente de visto bueno de protección de datos).
   */
  const validarCedula = async(req, res, next) => {
    try {
      // El código de familia no se envía al navegador: solo si existe (2026-10-01).
      // Al guardar, el backend lo toma directo de la base del colegio.
      const { codigo_familia: codigo, ...resto } = await comunidadService.buscarPorCedula(req.query.cedula);
      const data = resto.configurado ? { ...resto, tiene_codigo_familia: Boolean(codigo) } : resto;

      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  return { validarCedula };

};
