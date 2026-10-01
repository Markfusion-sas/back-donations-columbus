# Despliegue — cambios del Directorio Comercial TCS

Resumen de lo que hay que hacer en el servidor para poner en producción los
commits `70427f6 … 95dfe63` (directorio comercial, certificado de donación y
contenido editable del sitio).

## 1. Dependencias

Se agregó **multer** (subida de archivos):

```bash
npm install
```

## 2. Base de datos

Los modelos se sincronizan con `alter: false`, así que las tablas nuevas se
crean solas al arrancar, pero **las columnas nuevas de `emprendimientos` no**.
Ejecutar una sola vez:

```bash
psql -U <usuario> -d <base> -f migrations/2026-09-22-emprendimientos-directorio-tcs.sql
psql -U <usuario> -d <base> -f migrations/2026-09-24-emprendimientos-donacion-recurrente.sql
psql -U <usuario> -d <base> -f migrations/2026-09-30-emprendimientos-grado-verificacion.sql
```

- `2026-09-24`: agrega `emprendimientos.fuente_pago_id`. La donación recurrente
  se quitó del registro (revisión 30/09/2026); la columna queda opcional.
- `2026-09-30`: agrega `grado` (estudiantes) y `verificacion_detalle` (motivo de
  la revisión manual).

Tablas que se crean automáticamente al iniciar el servidor:

| Tabla | Para qué |
|---|---|
| `emprendimientos` | Directorio Comercial TCS |
| `certificados_donacion` | Solicitudes de certificado con el RUT adjunto |
| `contenido_sitio` | Textos e imágenes editables desde el panel |

## 3. Variables de entorno

Ver `.env.example`. Las nuevas:

| Variable | Valor sugerido | Para qué |
|---|---|---|
| `ADMIN_EMAIL` | `fundaciontcs@columbus.edu.co` | Recibe las alertas de nuevos registros y de certificados |
| `PUBLIC_URL` | `https://fundaciontcs.columbus.edu.co` | Construye las URLs públicas de las imágenes subidas |
| `UPLOADS_DIR` | `uploads` | Carpeta donde se guardan logos, fotos y documentos |
| `ADMIN_API_KEY` | *(opcional)* | Si se define, el panel debe enviarla en `x-admin-key`; en el frontend va como `VITE_ADMIN_API_KEY` |
| `FRONTEND_URL` | `https://fundaciontcs.columbus.edu.co` | Origen permitido por CORS. Admite varios separados por coma |

`RESEND_API_KEY` y `RESEND_EMAIL` ya existían: sin ellas el servidor funciona
pero los correos no salen (queda registrado en el log).

## 4. Archivos subidos

`UPLOADS_DIR` debe ser una carpeta **persistente** (no se borra en cada
despliegue). Dentro se crean solas:

```
uploads/emprendimientos/   logos y fotos de las marcas
uploads/certificados/      RUT de las solicitudes de certificado
uploads/sitio/             imágenes cambiadas desde el panel
```

Se sirven en `GET /api/v1/uploads/...`, así que el proxy de nginx que ya
enruta `/api/` no necesita cambios.

## 5. Endpoints nuevos

```
POST   /api/v1/emprendimientos            registro público (multipart)
GET    /api/v1/emprendimientos            listado (admin) · ?estado=
GET    /api/v1/emprendimientos/:id        detalle
PUT    /api/v1/emprendimientos/:id        edición (admin)
PATCH  /api/v1/emprendimientos/:id/aprobar
PATCH  /api/v1/emprendimientos/:id/rechazar   body { motivo }

POST   /api/v1/donation/certificado       solicitud de certificado (multipart)
PATCH  /api/v1/donation/certificado/:id   asocia la referencia DON-...

GET    /api/v1/contenido                  textos/imágenes editados del sitio
PUT    /api/v1/contenido                  guardar (admin)
POST   /api/v1/contenido/imagen           subir imagen del sitio (admin)
```

## 6. Pendiente de definir con el colegio

Egresados: se registran y quedan para revisión manual (no hay base con sus
cédulas). Familias, estudiantes y staff se cruzan automáticamente (ver sección 7).

## 7. Validación de la comunidad TCS (base del colegio)

Al registrarse, la cédula se cruza con la base del colegio (SQL Server) para
autocompletar relación, código de familia, nombre y celular. **No bloquea el
registro** (revisión 30/09/2026): si no coincide, se guarda igual y el correo de
alerta al administrador lo marca para revisión manual. Se reutiliza la consulta de TCS Run
(`FastAPI_TCS/src/infra/adapters/person_repository.py`):

| Relación | Dónde se busca la cédula | Código de familia |
|---|---|---|
| Staff | SIESA vía `OPENQUERY(CSERPDB, ...)`, empleados activos | `family_info.id_family` si también es papá/mamá |
| Estudiante | tabla `students` (`id_number`) | `students.family_id` |
| Papá/mamá | tabla `family_info` (`father_id` / `mother_id`) | `family_info.id_family` |

Estados de `verificacion_comunidad`: `verificado`, `revisar` (relación distinta o
egresado), `no_encontrado` (cédula fuera de la base) y `pendiente` (no se pudo
consultar). El motivo queda en `verificacion_detalle`. Los egresados se registran
y siempre quedan para revisión manual.

Configurar en el `.env` del backend las mismas credenciales que usa TCS Run:

```
MSSQL_HOST=...
MSSQL_PORT=1433
MSSQL_USER=...
MSSQL_PASSWORD=...
MSSQL_DB=...   # la base que tiene students y family_info
```

- Endpoint público: `GET /api/v1/comunidad/validar?cedula=...` (máx. 30 consultas cada 10 min por IP).
- `POST /emprendimientos` vuelve a consultar la cédula, guarda el estado de la
  verificación y usa el código de familia del colegio cuando existe.
- Al representante solo se le envía correo cuando el administrador aprueba.
- Sin `MSSQL_HOST` la validación queda desactivada (útil en desarrollo local).
