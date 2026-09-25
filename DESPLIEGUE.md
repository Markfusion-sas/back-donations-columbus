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
```

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

El formulario pide **cédula** y **código de familia** (papá/mamá y
estudiantes) y los guarda con `verificacion_comunidad = 'pendiente'`. El cruce
con la base de datos del colegio todavía es manual: el correo de alerta
recuerda verificarlo y el panel muestra los datos. Cuando haya forma de
consultar esa base (API o archivo), se puede automatizar.
