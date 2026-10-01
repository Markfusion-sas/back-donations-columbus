import { EMPRENDIMIENTO_STATUS } from '#config/constants.config';
import { isAdminRequest } from '#middlewares/requireAdminKey.middleware';
import { emprendimientoService } from '#services/index';

// Datos que solo ve el administrador; el directorio público no los recibe (2026-10-01)
const CAMPOS_PRIVADOS = [
  'cedula', 'codigo_familia', 'grado', 'telefono_personal', 'nombre_representante', 'relacion_tcs',
  'verificacion_comunidad', 'verificacion_detalle', 'motivo_rechazo', 'fuente_pago_id', 'donacion'
];

const publico = (emprendimiento) => {
  const copia = { ...emprendimiento };
  CAMPOS_PRIVADOS.forEach((campo) => delete copia[campo]);
  return copia;
};

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

      const admin = isAdminRequest(req);
      // Sin sesión de admin solo se listan los aprobados, sin datos personales
      const emprendimientos = await emprendimientoService.getEmprendimientos({
        estado: admin ? estado : EMPRENDIMIENTO_STATUS.APPROVED,
        conDonacion: admin
      });

      return res.status(200).json({
        success: true,
        data: admin ? emprendimientos : emprendimientos.map(publico)
      });
    } catch (error) {
      next(error);
    }
  };

  /** GET /emprendimientos/:id */
  const getEmprendimientoById = async(req, res, next) => {
    try {
      const admin = isAdminRequest(req);
      const emprendimiento = await emprendimientoService.getEmprendimientoById(req.params.id, { conDonacion: admin });

      if (!admin && emprendimiento.estado !== EMPRENDIMIENTO_STATUS.APPROVED) {
        const error = new Error('Emprendimiento no encontrado');
        error.statusCode = 404;
        throw error;
      }

      return res.status(200).json({
        success: true,
        data: admin ? emprendimiento : publico(emprendimiento)
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
