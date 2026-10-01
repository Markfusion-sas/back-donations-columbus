/**
 * Validación de pertenencia a la comunidad TCS contra la base del colegio
 * (SQL Server). Replica la consulta "TCRAN" de TCS Run
 * (FastAPI_TCS/src/infra/adapters/person_repository.py):
 *   - Empleados activos en SIESA (linked server CSERPDB)
 *   - Estudiantes (tabla students → family_id)
 *   - Padres y madres (tabla family_info → id_family)
 * La verificación NO bloquea el registro (revisión 30/09/2026, Manuela Toro):
 * si la cédula no aparece, la relación no coincide o la persona es egresada,
 * el registro se guarda igual y se alerta al administrador para revisarlo a
 * mano (puede ser un error de la base del colegio).
 *
 * Decisiones (reunión de validación de la comunidad, 2026-09-30):
 *  - Reutilizar la consulta TCRAN de TCS Run contra el SQL Server del colegio
 *    (acordado con Luis Fernando; él revisa la consulta).
 *  - Validar familias, padres, madres y empleados; egresados aplazado hasta
 *    tener una base con cédulas: se registran y se revisan a mano.
 *  - Solo lectura (SELECT): este servicio nunca escribe en la base del colegio.
 * Pendiente de aprobar:
 *  - TI: qué usuario de SQL Server se usa en producción y con qué permisos.
 *  - Protección de datos: si el endpoint público puede devolver nombre y
 *    código de familia (hoy los devuelve para autocompletar, como TCS Run).
 */

const httpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Mismo saneamiento que TCS Run: la cédula va dentro de un OPENQUERY (no admite parámetros)
export const sanitizeCedula = (value) => String(value ?? '').replace(/[^A-Za-z0-9\-_]/g, '').slice(0, 20);

// Solo celulares colombianos (3XXXXXXXXX, con o sin 57): en la base también hay
// teléfonos fijos de la casa, que no sirven como contacto personal
export const normalizeCelular = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '').replace(/^57(?=3\d{9}$)/, '');
  return /^3\d{9}$/.test(digits) ? digits : null;
};

const joinName = (...parts) => parts.filter(Boolean).map((p) => String(p).trim()).join(' ').trim() || null;

const RELACION_LABEL = { padre: 'papá/mamá', estudiante: 'estudiante', staff: 'staff' };

// Las relaciones que se verifican contra la base del colegio
const RELACIONES_VERIFICABLES = ['padre', 'estudiante', 'staff'];

const empleadoQuery = (nit) => `
  SELECT *
  FROM OPENQUERY(CSERPDB,
  'SELECT
      f200_nit,
      f200_nombres,
      f200_apellido1,
      f200_apellido2,
      f015_celular
   FROM t200_mm_terceros t
        INNER JOIN t015_mm_contactos co
            ON co.f015_rowid = t.f200_rowid_contacto
        LEFT JOIN w0550_contratos tc
            ON tc.c0550_rowid_tercero = t.f200_rowid
   WHERE f200_ind_empleado = 1
     AND f200_ind_estado = 1
     AND c0550_fecha_retiro IS NULL
     AND f200_id_cia = 1
     AND f200_ind_tipo_tercero = 1
     AND f200_nit = ''${nit}''
  ')
`;

const ESTUDIANTE_QUERY = `
  SELECT TOP 1 first_name, middle_name, last_name, phone, family_id
  FROM students
  WHERE id_number = @nit
`;

const FAMILIA_QUERY = `
  SELECT TOP 1 father, father_last_name, father_id, father_cell_phone,
               mother, mother_last_name, mother_id, mother_cell_phone, employee, id_family
  FROM family_info
  WHERE father_id = @nit OR mother_id = @nit
`;

/**
 * @param {object} deps
 * @param {Function} deps.runQuery     - (sql, params) => Promise<rows[]>
 * @param {Function} deps.isConfigured - () => boolean
 * @param {Function} [deps.errorLog]
 */
export const comunidadServiceFactory = ({ runQuery, isConfigured, errorLog = () => {} }) => {

  /**
   * Busca la cédula en la base del colegio.
   * @returns {Promise<{configurado: boolean, encontrado?: boolean, relaciones?: string[], codigo_familia?: string|null, nombre?: string|null, telefono?: string|null}>}
   */
  const buscarPorCedula = async(cedula) => {
    if (!isConfigured()) return { configurado: false };

    const nit = sanitizeCedula(cedula);
    if (!nit) throw httpError('Cédula no válida', 400);

    let empleado, estudiante, familia;
    try {
      [[empleado], [estudiante], [familia]] = await Promise.all([
        runQuery(empleadoQuery(nit)),
        runQuery(ESTUDIANTE_QUERY, { nit }),
        runQuery(FAMILIA_QUERY, { nit })
      ]);
    } catch (error) {
      errorLog('Error consultando la base del colegio:', error?.message ?? error);
      throw httpError('No pudimos verificar la cédula con el colegio en este momento. Inténtalo de nuevo más tarde.', 503);
    }

    const relaciones = new Set();
    let codigoFamilia = null;
    let nombre = null;
    let telefono = null;

    if (empleado) {
      relaciones.add('staff');
      nombre = joinName(empleado.f200_nombres, empleado.f200_apellido1, empleado.f200_apellido2);
      telefono = normalizeCelular(empleado.f015_celular);
    }

    if (estudiante) {
      relaciones.add('estudiante');
      codigoFamilia = estudiante.family_id ?? null;
      nombre ??= joinName(estudiante.first_name, estudiante.middle_name, estudiante.last_name);
      telefono ||= normalizeCelular(estudiante.phone);
    }

    if (familia) {
      relaciones.add('padre');
      if (Number(familia.employee) === 1) relaciones.add('staff');
      codigoFamilia ??= familia.id_family ?? null;
      const esPadre = String(familia.father_id ?? '').trim() === nit;
      nombre ??= esPadre
        ? joinName(familia.father, familia.father_last_name)
        : joinName(familia.mother, familia.mother_last_name);
      telefono ||= normalizeCelular(esPadre ? familia.father_cell_phone : familia.mother_cell_phone);
    }

    return {
      configurado: true,
      encontrado: relaciones.size > 0,
      relaciones: [...relaciones],
      codigo_familia: codigoFamilia !== null && codigoFamilia !== undefined ? String(codigoFamilia).trim() : null,
      nombre,
      telefono
    };
  };

  /**
   * Verifica un registro del directorio antes de guardarlo. Nunca bloquea:
   * devuelve el estado de la verificación y el motivo para que el administrador
   * lo revise.
   *  - verificado:    la cédula está en la base y todas las relaciones coinciden.
   *  - revisar:       está en la base pero alguna relación no coincide o es egresado.
   *  - no_encontrado: la cédula no está en la base del colegio.
   *  - pendiente:     no se pudo consultar la base (sin configurar o caída).
   * @param {{cedula: string, relacion_tcs: string[], codigo_familia?: string}} data
   * @returns {Promise<{verificacion_comunidad: string, verificacion_detalle: string|null, codigo_familia?: string|null}>}
   */
  const verificarRegistro = async({ cedula, relacion_tcs: relaciones = [], codigo_familia: codigoFamilia }) => {
    const egresado = relaciones.includes('egresado') ? ['Se registró como egresado: verificar manualmente.'] : [];

    let resultado;
    try {
      resultado = await buscarPorCedula(cedula);
    } catch (error) {
      return {
        verificacion_comunidad: 'pendiente',
        verificacion_detalle: [`No se pudo consultar la base del colegio (${error.message}).`, ...egresado].join(' ')
      };
    }

    if (!resultado.configurado) {
      return { verificacion_comunidad: 'pendiente', verificacion_detalle: egresado.join(' ') || null };
    }

    if (!resultado.encontrado) {
      return {
        verificacion_comunidad: 'no_encontrado',
        verificacion_detalle: ['La cédula no aparece en la base de datos del colegio.', ...egresado].join(' ')
      };
    }

    const noCoinciden = relaciones
      .filter((r) => RELACIONES_VERIFICABLES.includes(r))
      .filter((r) => !resultado.relaciones.includes(r));
    const motivos = [
      ...(noCoinciden.length
        ? [`Marcó ${noCoinciden.map((r) => RELACION_LABEL[r] || r).join(', ')}, pero en la base aparece como ${resultado.relaciones.map((r) => RELACION_LABEL[r] || r).join(', ')}.`]
        : []),
      ...egresado
    ];

    return {
      verificacion_comunidad: motivos.length ? 'revisar' : 'verificado',
      verificacion_detalle: motivos.join(' ') || null,
      // Si la base del colegio tiene código de familia, manda sobre el escrito a mano
      codigo_familia: resultado.codigo_familia ?? codigoFamilia ?? null
    };
  };

  return { buscarPorCedula, verificarRegistro };
};
