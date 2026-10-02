import { EMPRENDIMIENTO_STATUS } from '#config/constants.config';

const httpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

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
 * @param {import('sequelize').ModelStatic} [deps.PaymentSource] - Para validar la donación recurrente del registro
 * @param {Function} [deps.verificarComunidad] - (data) => Promise<{verificacion_comunidad, codigo_familia?}>. Base del colegio.
 * @param {Function} [deps.notifyNewEmprendimiento]  - (emprendimiento, fuentePago) => Promise. Alerta al admin.
 * @param {Function} [deps.notifyApproved]           - (emprendimiento) => Promise. Correo al representante.
 * @param {Function} [deps.notifyRejected]           - (emprendimiento) => Promise. Correo al representante.
 * @param {Function} [deps.errorLog]
 */
export const emprendimientoServiceFactory = ({
  Emprendimiento,
  mapEmprendimientoResponse,
  PaymentSource,
  verificarComunidad = async() => ({}),
  notifyNewEmprendimiento = async() => {},
  notifyApproved = async() => {},
  notifyRejected = async() => {},
  removeFiles = async() => {},
  errorLog = () => {}
}) => {

  // Las notificaciones nunca deben tumbar la operación principal
  const safeNotify = async(fn, ...args) => {
    try {
      await fn(...args);
    } catch (error) {
      errorLog('Error al enviar notificación de emprendimiento:', error?.message ?? error);
    }
  };

  // La donación recurrente ya no es obligatoria (revisión 30/09/2026); si viene,
  // la fuente de pago debe existir y no estar usada por otro registro
  const findFuentePago = async(fuentePagoId) => {
    if (!PaymentSource || !fuentePagoId) return null;

    const fuentePago = await PaymentSource.findByPk(fuentePagoId);
    if (!fuentePago) throw httpError('La donación recurrente no existe. Vuelve a registrarla.', 400);

    const enUso = await Emprendimiento.count({ where: { fuente_pago_id: fuentePagoId } });
    if (enUso > 0) throw httpError('Esta donación recurrente ya está asociada a otro emprendimiento.', 409);

    return fuentePago;
  };

  const createEmprendimiento = async(data) => {
    // Se verifica contra la base del colegio sin bloquear: lo que no coincida
    // queda marcado para que el administrador lo revise
    const verificacion = await verificarComunidad(data);

    // Papá/mamá y estudiantes necesitan código de familia: de la base del colegio
    // o, si no aparece allí, el que escribió la persona
    const codigoFamilia = verificacion.codigo_familia || data.codigo_familia;
    if (!codigoFamilia && (data.relacion_tcs ?? []).some((r) => ['padre', 'estudiante'].includes(r))) {
      throw httpError('El código de familia es obligatorio', 400);
    }

    const fuentePago = await findFuentePago(data.fuente_pago_id);

    const emprendimiento = await Emprendimiento.create({
      ...data,
      ...verificacion,
      estado: EMPRENDIMIENTO_STATUS.PENDING
    });

    // Al representante solo se le escribe cuando se aprueba (revisión 30/09/2026)
    await safeNotify(notifyNewEmprendimiento, emprendimiento, fuentePago);

    return mapEmprendimientoResponse(emprendimiento);
  };

  // Solo el panel admin ve la donación asociada
  const includeDonacion = (conDonacion) => (conDonacion && PaymentSource
    ? { include: [{ model: PaymentSource, as: 'fuentePago' }] }
    : {});

  const getEmprendimientos = async({ estado, conDonacion = false } = {}) => {
    const where = {};
    if (estado) where.estado = estado;

    const list = await Emprendimiento.findAll({
      where,
      order: [['created_at', 'DESC']],
      ...includeDonacion(conDonacion)
    });

    return list.map(mapEmprendimientoResponse);
  };

  const getEmprendimientoById = async(id, { conDonacion = false } = {}) => {
    const emprendimiento = await Emprendimiento.findByPk(id, includeDonacion(conDonacion));
    if (!emprendimiento) throw notFound();
    return mapEmprendimientoResponse(emprendimiento);
  };

  const aprobarEmprendimiento = async(id) => {
    const emprendimiento = await Emprendimiento.findByPk(id);
    if (!emprendimiento) throw notFound();
    // Volver a publicar una marca retirada no repite el correo de bienvenida
    const republicada = emprendimiento.estado === EMPRENDIMIENTO_STATUS.RETIRED;

    await emprendimiento.update({
      estado: EMPRENDIMIENTO_STATUS.APPROVED,
      motivo_rechazo: null,
      revisado_en: new Date()
    });

    if (!republicada) await safeNotify(notifyApproved, emprendimiento);

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

  /** Retira la marca del directorio público a solicitud del dueño. No envía correo. */
  const retirarEmprendimiento = async(id) => {
    const emprendimiento = await Emprendimiento.findByPk(id);
    if (!emprendimiento) throw notFound();

    await emprendimiento.update({
      estado: EMPRENDIMIENTO_STATUS.RETIRED,
      revisado_en: new Date()
    });

    return mapEmprendimientoResponse(emprendimiento);
  };

  /** Muestra u oculta el correo en la ficha pública (panel admin, 2026-10-02) */
  const setCorreoVisible = async(id, visible) => {
    const emprendimiento = await Emprendimiento.findByPk(id);
    if (!emprendimiento) throw notFound();

    await emprendimiento.update({ mostrar_email: visible === true || visible === 'true' });

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

    // La donación del registro no se cambia desde la edición
    const { acepta_datos: _acepta, fuente_pago_id: _fuente, verificacion_comunidad: _v, verificacion_detalle: _vd, logo: nuevoLogo, fotos: nuevasFotos = [], ...campos } = data; // eslint-disable-line no-unused-vars

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
    rechazarEmprendimiento,
    retirarEmprendimiento,
    setCorreoVisible
  };

};
