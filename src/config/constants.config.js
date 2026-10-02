export const ORDER_STATUS = {
  PENDING: 'pendiente',
  APPROVED: 'aprobado'
};

export const PAYMENT_SOURCE_STATUS = {
  AVAILABLE: 'available',
  INACTIVE: 'inactive',
  EXPIRED: 'expired'
};

export const PAYMENT_SOURCE_TYPE = {
  NEQUI: 'NEQUI',
  CARD: 'CARD'
};

export const EMPRENDIMIENTO_STATUS = {
  PENDING: 'pendiente',
  APPROVED: 'aprobado',
  REJECTED: 'rechazado',
  // Marca que estuvo publicada y se retiró a solicitud del dueño, sin enviarle
  // el correo de "no aprobado" (aprobado por Manuela Toro, 2026-10-02)
  RETIRED: 'retirado'
};

export const EMPRENDIMIENTO_CATEGORIAS = [
  'moda',
  'belleza',
  'hogar',
  'gastronomia',
  'arte',
  'tecnologia',
  'educacion',
  'salud',
  'mascotas',
  'servicios',
  'deportes',
  'infantil',
  'sostenibilidad',
  'eventos',
  'otro'
];

export const EMPRENDIMIENTO_RELACIONES = ['padre', 'egresado', 'estudiante', 'staff'];

export const CERTIFICATE_STATUS = {
  PENDING: 'pendiente',
  SENT: 'enviado'
};

export const EMPRENDIMIENTO_REDES = ['instagram', 'facebook', 'tiktok', 'whatsapp', 'linkedin', 'youtube', 'x'];

export const EMPRENDIMIENTO_CONDICIONES_BENEFICIO = [
  'montoMinimo',
  'noAcumulable',
  'canal',
  'clientesNuevos',
  'referencias',
  'na'
];
