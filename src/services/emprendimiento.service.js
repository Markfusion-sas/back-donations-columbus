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
  removeFiles = async() => {},
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

  /**
   * Edición desde el panel admin. No toca estado, autorización ni moderación.
   * @param {string} id
   * @param {object} data - salida de mapEmprendimiento (logo undefined si no se reemplaza)
   * @param {string[]} fotosExistentes - URLs de fotos previas que se conservan
   */
  const updateEmprendimiento = async(id, data, fotosExistentes = []) => {
    const emprendimiento = await Emprendimiento.findByPk(id);
    if (!emprendimiento) throw notFound();

    const { acepta_datos: _acepta, logo: nuevoLogo, fotos: nuevasFotos = [], ...campos } = data; // eslint-disable-line no-unused-vars

    const fotosPrevias = emprendimiento.fotos ?? [];
    const fotosConservadas = fotosPrevias.filter((url) => fotosExistentes.includes(url));
    const fotos = [...fotosConservadas, ...nuevasFotos].slice(0, 3);
    const logo = nuevoLogo || emprendimiento.logo;

    const eliminados = [
      ...fotosPrevias.filter((url) => !fotos.includes(url)),
      ...(nuevoLogo && emprendimiento.logo !== nuevoLogo ? [emprendimiento.logo] : [])
    ];

    await emprendimiento.update({ ...campos, logo, fotos });

    // Limpieza de archivos que ya no se usan (best effort)
    try {
      await removeFiles(eliminados);
    } catch (error) {
      errorLog('No se pudieron eliminar archivos antiguos:', error?.message ?? error);
    }

    return mapEmprendimientoResponse(emprendimiento);
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
