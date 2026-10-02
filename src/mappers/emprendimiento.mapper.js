/**
 * Convierte un valor recibido por multipart/form-data en arreglo.
 * multer entrega `campo[]` como string (un valor) o array (varios).
 * @param {string|string[]|undefined} value
 * @returns {string[]}
 */
export const toArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value === undefined || value === null || value === '') return [];
  return [String(value)];
};

const toBoolean = (value) => value === true || value === 'true' || value === 'si' || value === '1';

const clean = (value) => (typeof value === 'string' ? value.trim() : value);

/**
 * Normaliza el body del formulario de registro (los campos pueden llegar
 * como `categorias` o `categorias[]` según el cliente) al formato de la DB.
 * Las URLs de logo y fotos se agregan aparte porque vienen de los archivos.
 */
export const mapEmprendimiento = (data = {}, { logo, fotos = [] } = {}) => {
  const categorias = toArray(data.categorias ?? data['categorias[]']);
  const beneficio = toBoolean(data.beneficio_tcs);

  return {
    acepta_datos: toBoolean(data.acepta_datos),
    nombre_representante: clean(data.nombre_representante),
    cedula: String(data.cedula ?? '').replace(/\D/g, '') || null,
    codigo_familia: clean(data.codigo_familia) || null,
    grado: clean(data.grado) || null,
    telefono_personal: String(data.telefono_personal ?? '').replace(/\D/g, ''),
    relacion_tcs: toArray(data.relacion_tcs ?? data['relacion_tcs[]']),
    nombre_emprendimiento: clean(data.nombre_emprendimiento),
    telefono_marca: String(data.telefono_marca ?? '').replace(/\D/g, ''),
    email: clean(data.email)?.toLowerCase(),
    categorias,
    categoria_otro: categorias.includes('otro') ? clean(data.categoria_otro) || null : null,
    historia: clean(data.historia),
    descripcion: clean(data.descripcion),
    red_social: clean(data.red_social)?.replace(/^@/, ''),
    red_social_tipo: clean(data.red_social_tipo) || 'instagram',
    // La columna es NOT NULL en la base; sin link se guarda vacío (link opcional desde 2026-10-02)
    web: clean(data.web) || '',
    punto_fisico: clean(data.punto_fisico) || null,
    horario: clean(data.horario) || null,
    envios: clean(data.envios) || null,
    logo,
    fotos,
    beneficio_tcs: beneficio,
    beneficio_descripcion: beneficio ? clean(data.beneficio_descripcion) || null : null,
    beneficio_como: beneficio ? clean(data.beneficio_como) || null : null,
    beneficio_condiciones: beneficio ? toArray(data.beneficio_condiciones ?? data['beneficio_condiciones[]']) : [],
    beneficio_condiciones_detalle: beneficio ? clean(data.beneficio_condiciones_detalle) || null : null,
    fuente_pago_id: clean(data.fuente_pago_id) || undefined
  };
};

/**
 * Resumen de la donación recurrente asociada (solo para el panel admin).
 * @param {object|null|undefined} fuentePago - PaymentSource (plain)
 */
const mapDonacion = (fuentePago) => {
  if (!fuentePago) return null;
  return {
    valor: fuentePago.donation_value,
    frecuencia: fuentePago.billing_frequency,
    tipo: fuentePago.type,
    estado: fuentePago.status,
    proximo_cobro: fuentePago.next_billing_date,
    donante: [fuentePago.name, fuentePago.last_name].filter(Boolean).join(' '),
    donante_email: fuentePago.customer_email,
    donante_documento: fuentePago.identity_document
  };
};

/**
 * Da forma a la respuesta de un emprendimiento (misma forma que consume el frontend).
 * @param {import('sequelize').Model|object} emprendimiento
 */
export const mapEmprendimientoResponse = (emprendimiento) => {
  const e = typeof emprendimiento.get === 'function' ? emprendimiento.get({ plain: true }) : emprendimiento;

  return {
    id: e.id,
    nombre_emprendimiento: e.nombre_emprendimiento,
    nombre_representante: e.nombre_representante,
    cedula: e.cedula,
    codigo_familia: e.codigo_familia,
    verificacion_comunidad: e.verificacion_comunidad,
    verificacion_detalle: e.verificacion_detalle ?? null,
    grado: e.grado ?? null,
    telefono_personal: e.telefono_personal,
    relacion_tcs: e.relacion_tcs ?? [],
    telefono_marca: e.telefono_marca,
    email: e.email,
    mostrar_email: e.mostrar_email !== false,
    categorias: e.categorias ?? [],
    categoria_otro: e.categoria_otro,
    historia: e.historia,
    descripcion: e.descripcion,
    red_social: e.red_social,
    red_social_tipo: e.red_social_tipo ?? 'instagram',
    web: e.web,
    punto_fisico: e.punto_fisico,
    horario: e.horario,
    envios: e.envios,
    logo: e.logo,
    fotos: e.fotos ?? [],
    beneficio_tcs: e.beneficio_tcs ? 'si' : 'no',
    beneficio_descripcion: e.beneficio_descripcion,
    beneficio_como: e.beneficio_como,
    beneficio_condiciones: e.beneficio_condiciones ?? [],
    beneficio_condiciones_detalle: e.beneficio_condiciones_detalle,
    estado: e.estado,
    motivo_rechazo: e.motivo_rechazo,
    revisado_en: e.revisado_en,
    fuente_pago_id: e.fuente_pago_id ?? null,
    ...(e.fuentePago !== undefined ? { donacion: mapDonacion(e.fuentePago) } : {}),
    createdAt: e.createdAt ?? e.created_at,
    updatedAt: e.updatedAt ?? e.updated_at
  };
};
