-- ============================================================================
--  Directorio Comercial TCS — campos nuevos del formulario de registro
--  Ejecutar una vez en la base de datos (los modelos se sincronizan con
--  alter: false, así que las columnas nuevas no se crean solas).
--
--  psql -U <usuario> -d <base> -f migrations/2026-09-22-emprendimientos-directorio-tcs.sql
-- ============================================================================

ALTER TABLE emprendimientos
  -- Verificación de pertenencia a la comunidad TCS
  ADD COLUMN IF NOT EXISTS cedula                        VARCHAR(255),
  ADD COLUMN IF NOT EXISTS codigo_familia                VARCHAR(255),
  ADD COLUMN IF NOT EXISTS verificacion_comunidad        VARCHAR(255) NOT NULL DEFAULT 'pendiente',
  -- Red social principal (instagram, facebook, tiktok, whatsapp, linkedin, youtube, x)
  ADD COLUMN IF NOT EXISTS red_social_tipo               VARCHAR(255) NOT NULL DEFAULT 'instagram',
  -- Horario del punto físico
  ADD COLUMN IF NOT EXISTS horario                       VARCHAR(255),
  -- Beneficios para la comunidad TCS
  ADD COLUMN IF NOT EXISTS beneficio_como                TEXT,
  ADD COLUMN IF NOT EXISTS beneficio_condiciones         VARCHAR(255)[] NOT NULL DEFAULT ARRAY[]::VARCHAR(255)[],
  ADD COLUMN IF NOT EXISTS beneficio_condiciones_detalle TEXT;

-- beneficio_descripcion pasa de VARCHAR(255) a TEXT
ALTER TABLE emprendimientos
  ALTER COLUMN beneficio_descripcion TYPE TEXT;
