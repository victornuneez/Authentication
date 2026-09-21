# Authentication

Proyecto de aprendizaje con Node.js y Express para practicar autenticación y autorización. Combina tokens JWT con sesiones persistidas en archivos y organiza la lógica en rutas, controladores, middlewares, modelos y utilidades.

## Funcionalidades confirmadas

- Registro e inicio de sesión mediante las rutas del proyecto.
- Generación y validación de JWT.
- Sesiones con `express-session` y `session-file-store`.
- Cookies mediante `cookie-parser`.
- Protección de cabeceras con `helmet`.
- Rate limiting, validación CSRF y filtrado de entradas mediante middlewares propios.
- Restricción de rutas administrativas por rol.
- Hashing de contraseñas con `bcrypt`.

## Tecnologías

Node.js, Express 5, `bcrypt`, `jsonwebtoken`, `express-session`, `session-file-store`, `cookie-parser`, `helmet`, `express-rate-limit` y `db-local`.

## Estructura

```text
app.js                 Configuración y arranque del servidor
routes/                Rutas de autenticación y administración
controller/            Controladores
middlewares/           JWT, sesión, CSRF, filtrado, rate limit y roles
models/                Repositorio de usuarios
utils/                 Cookies, JWT y sesiones
```

## Instalación y ejecución

```bash
git clone https://github.com/victornuneez/Authentication.git
cd Authentication
npm install
cp .env.example .env
node app.js
```

El servidor imprime `http://localhost:3000` al arrancar. El proyecto no define scripts `start`, `dev` o `test` en `package.json`; por eso se documenta `node app.js`.

## Variables de entorno

```env
PORT=3000
SECRET_JWT_KEY=reemplazar_por_una_clave_local
NODE_ENV=development
```

## Autor

Victor Nunez
