import { EMPRENDIMIENTO_STATUS } from '#config/constants.config';
import { emprendimientoService } from '#services/index';

export const emprendimientoControllerFactory = () => {

  /** POST /emprendimientos — registro público (multipart/form-data) */
  const createEmprendimiento = async(req, res, next) => {
    try {
      const emprendimiento = await emprendimientoService.createEmprendimiento(req.emprendimiento);

      return res.status(201).json({
        success: true,
        data: emprendimiento
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /emprendimientos?estado=pendiente|aprobado|rechazado
   * Sin `estado` devuelve todos (uso del panel admin).
   */
  const getEmprendimientos = async(req, res, next) => {
    try {
      const { estado } = req.query;

      if (estado && !Object.values(EMPRENDIMIENTO_STATUS).includes(estado)) {
        const error = new Error('Estado no válido');
        error.statusCode = 400;
        throw error;
      }

      const emprendimientos = await emprendimientoService.getEmprendimientos({ estado });

      return res.status(200).json({
        success: true,
        data: emprendimientos
      });
    } catch (error) {
      next(error);
    }
  };

  /** GET /emprendimientos/:id */
  const getEmprendimientoById = async(req, res, next) => {
    try {
      const emprendimiento = await emprendimientoService.getEmprendimientoById(req.params.id);

      return res.status(200).json({
        success: true,
        data: emprendimiento
      });
    } catch (error) {
      next(error);
    }
  };

  /** PUT /emprendimientos/:id — edición desde el panel admin (multipart/form-data) */
  const updateEmprendimiento = async(req, res, next) => {
    try {
      const emprendimiento = await emprendimientoService.updateEmprendimiento(
        req.params.id,
        req.emprendimiento,
        req.fotosExistentes
      );

      return res.status(200).json({
        success: true,
        data: emprendimiento
      });
    } catch (error) {
      next(error);
    }
  };

  /** PATCH /emprendimientos/:id/aprobar */
  const aprobarEmprendimiento = async(req, res, next) => {
    try {
      const emprendimiento = await emprendimientoService.aprobarEmprendimiento(req.params.id);

      return res.status(200).json({
        success: true,
        data: emprendimiento
      });
    } catch (error) {
      next(error);
    }
  };

  /** PATCH /emprendimientos/:id/rechazar  body: { motivo } */
  const rechazarEmprendimiento = async(req, res, next) => {
    try {
      const emprendimiento = await emprendimientoService.rechazarEmprendimiento(req.params.id, req.body.motivo);

      return res.status(200).json({
        success: true,
        data: emprendimiento
      });
    } catch (error) {
      next(error);
    }
  };

  return {
    createEmprendimiento,
    updateEmprendimiento,
    getEmprendimientos,
    getEmprendimientoById,
    aprobarEmprendimiento,
    rechazarEmprendimiento
  };

};
