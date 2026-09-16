import { EMPRENDIMIENTO_STATUS } from '#config/constants.config';

const notFound = () => {
  const error = new Error('Emprendimiento no encontrado');
  error.statusCode = 404;
  return error;
};

/**
 * Servicio del directorio comercial (emprendimientos).
 * Recibe el modelo y los notificadores por inyección para poder probarlo sin DB ni correo.
 * @param {object} deps
 * @param {import('sequelize').ModelStatic} deps.Emprendimiento
 * @param {Function} deps.mapEmprendimientoResponse
 * @param {Function} [deps.notifyNewEmprendimiento]  - (emprendimiento) => Promise. Alerta al admin.
 * @param {Function} [deps.notifyApproved]           - (emprendimiento) => Promise. Correo al representante.
 * @param {Function} [deps.notifyRejected]           - (emprendimiento) => Promise. Correo al representante.
 * @param {Function} [deps.errorLog]
 */
export const emprendimientoServiceFactory = ({
  Emprendimiento,
  mapEmprendimientoResponse,
  notifyNewEmprendimiento = async() => {},
  notifyApproved = async() => {},
  notifyRejected = async() => {},
  errorLog = () => {}
}) => {

  // Las notificaciones nunca deben tumbar la operación principal
  const safeNotify = async(fn, emprendimiento) => {
    try {
      await fn(emprendimiento);
    } catch (error) {
      errorLog('Error al enviar notificación de emprendimiento:', error?.message ?? error);
    }
  };

  const createEmprendimiento = async(data) => {
    const emprendimiento = await Emprendimiento.create({
      ...data,
      estado: EMPRENDIMIENTO_STATUS.PENDING
    });

    await safeNotify(notifyNewEmprendimiento, emprendimiento);

    return mapEmprendimientoResponse(emprendimiento);
  };

  const getEmprendimientos = async({ estado } = {}) => {
    const where = {};
    if (estado) where.estado = estado;

    const list = await Emprendimiento.findAll({
      where,
      order: [['created_at', 'DESC']]
    });

    return list.map(mapEmprendimientoResponse);
  };

  const getEmprendimientoById = async(id) => {
    const emprendimiento = await Emprendimiento.findByPk(id);
    if (!emprendimiento) throw notFound();
    return mapEmprendimientoResponse(emprendimiento);
  };

  const aprobarEmprendimiento = async(id) => {
    const emprendimiento = await Emprendimiento.findByPk(id);
    if (!emprendimiento) throw notFound();

    await emprendimiento.update({
      estado: EMPRENDIMIENTO_STATUS.APPROVED,
      motivo_rechazo: null,
      revisado_en: new Date()
    });

    await safeNotify(notifyApproved, emprendimiento);

    return mapEmprendimientoResponse(emprendimiento);
  };

  const rechazarEmprendimiento = async(id, motivo) => {
    const emprendimiento = await Emprendimiento.findByPk(id);
    if (!emprendimiento) throw notFound();

    await emprendimiento.update({
      estado: EMPRENDIMIENTO_STATUS.REJECTED,
      motivo_rechazo: motivo,
      revisado_en: new Date()
    });

    await safeNotify(notifyRejected, emprendimiento);

    return mapEmprendimientoResponse(emprendimiento);
  };

  return {
    createEmprendimiento,
    getEmprendimientos,
    getEmprendimientoById,
    aprobarEmprendimiento,
    rechazarEmprendimiento
  };

};
