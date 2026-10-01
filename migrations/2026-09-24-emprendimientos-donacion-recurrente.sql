-- ============================================================================
--  Directorio Comercial TCS — donación recurrente obligatoria al registrarse
--  Ejecutar una vez en la base de datos (los modelos se sincronizan con
--  alter: false, así que la columna nueva no se crea sola).
--
--  psql -U <usuario> -d <base> -f migrations/2026-09-24-emprendimientos-donacion-recurrente.sql
-- ============================================================================

-- Fuente de pago (Nequi o tarjeta) registrada con el formulario del directorio.
-- Los registros anteriores a este cambio quedan en NULL.
ALTER TABLE emprendimientos
  ADD COLUMN IF NOT EXISTS fuente_pago_id UUID REFERENCES fuentes_pago(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS emprendimientos_fuente_pago_id_key
  ON emprendimientos (fuente_pago_id)
  WHERE fuente_pago_id IS NOT NULL;
