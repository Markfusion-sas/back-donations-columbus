-- ============================================================================
--  Directorio Comercial TCS — revisión de la Fundación 2026-10-02 (Manuela Toro)
--  mostrar_email: el correo sigue siendo obligatorio, pero el administrador puede
--  ocultarlo de la ficha pública cuando es el correo personal del dueño.
--  Las marcas existentes quedan con el correo visible (valor por defecto 1).
--
--  SQL Server (EventosTCS / EventosTCS_dev, esquema fundacion). Idempotente:
--  si la columna ya existe no hace nada.
--  Para pruebas locales cambiar el USE por EventosTCS_dev.
-- ============================================================================

USE EventosTCS;
GO

IF COL_LENGTH('fundacion.emprendimientos', 'mostrar_email') IS NULL
BEGIN
  ALTER TABLE fundacion.emprendimientos
    ADD mostrar_email BIT NOT NULL
    CONSTRAINT DF_emprendimientos_mostrar_email DEFAULT 1;
END;
GO

-- Verificación: debe devolver una fila con mostrar_email
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'fundacion' AND TABLE_NAME = 'emprendimientos' AND COLUMN_NAME = 'mostrar_email';
