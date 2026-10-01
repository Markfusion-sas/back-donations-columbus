-- ============================================================================
--  Directorio Comercial TCS — revisión 30/09/2026
--  - grado: se pide a los estudiantes junto con el código de familia.
--  - verificacion_detalle: motivo por el que un registro quedó para revisión
--    manual (cédula no encontrada en la base del colegio, relación distinta,
--    egresado). El registro ya no se bloquea: se alerta al administrador.
--
--  psql -U <usuario> -d <base> -f migrations/2026-09-30-emprendimientos-grado-verificacion.sql
-- ============================================================================

ALTER TABLE emprendimientos
  ADD COLUMN IF NOT EXISTS grado                VARCHAR(255),
  ADD COLUMN IF NOT EXISTS verificacion_detalle TEXT;
