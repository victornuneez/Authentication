# Authentication App

Aplicación web de autenticación y gestión de usuarios desarrollada con Node.js, Express y TypeScript. El proyecto comenzó como una aplicación de backend en JavaScript y evolucionó mediante una migración progresiva a TypeScript, incorporando una interfaz web renderizada en el servidor y persistencia de datos con MongoDB.

## Características

- **Registro de usuarios:** creación de cuentas con username, email y contraseña.
- **Inicio y cierre de sesión:** autenticación mediante JWT o sesiones de servidor.
- **Gestión de tokens:** access tokens de corta duración y refresh tokens con rotación y persistencia en MongoDB.
- **Control de acceso por roles:** rutas protegidas según los permisos del usuario, con acceso administrativo.
- **Panel de administración:** consulta y eliminación de usuarios.
- **Gestión de sesiones:** persistencia de sesiones mediante `express-session` y `session-file-store`.
- **Protecciones de seguridad:** hash de contraseñas con bcrypt, cabeceras HTTP con Helmet, limitación de intentos de inicio de sesión y validación de tokens CSRF.
- **Interfaz web:** vistas EJS con estilos CSS propios y diseño adaptable a pantallas pequeñas.

## Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| Node.js | Entorno de ejecución |
| TypeScript | Tipado estático y desarrollo del backend |
| Express 5 | Servidor HTTP y enrutamiento |
| MongoDB | Base de datos |
| Mongoose | Modelado y acceso a los datos |
| EJS | Renderizado de vistas del lado del servidor |
| CSS | Estilos de la interfaz |
| JSON Web Token | Autenticación basada en tokens |
| express-session | Gestión de sesiones |
| bcrypt | Hash de contraseñas |
| Helmet | Cabeceras de seguridad HTTP |
| express-rate-limit | Limitación de intentos de login |
| dotenv | Configuración mediante variables de entorno |

## Arquitectura del proyecto

La aplicación separa las responsabilidades en controladores, modelos, rutas, middlewares y utilidades. Esta organización facilita mantener el código y desarrollar nuevas funcionalidades.

```text
project/
├── src/
│   ├── app.ts
│   ├── config/
│   │   └── database.ts
│   ├── controller/
│   │   ├── admin-controller.ts
│   │   ├── auth-controller.ts
│   │   └── views-controller.ts
│   ├── middlewares/
│   │   ├── auth-jwt.ts
│   │   ├── auth-session.ts
│   │   ├── csrf-validator.ts
│   │   ├── filter-escape.ts
│   │   ├── rate-limit.ts
│   │   └── role-guard.ts
│   ├── models/
│   │   ├── refreshTokenRepository.ts
│   │   └── userRepository.ts
│   ├── routes/
│   │   ├── admin-routes.ts
│   │   └── authRoutes.ts
│   ├── types/
│   │   ├── type-express-request.ts
│   │   ├── type-express-session.ts
│   │   ├── type-refresh.ts
│   │   ├── typeDocumentsMongoDB.ts
│   │   ├── typeRefreshTokenDocument.ts
│   │   └── types.d.ts
│   ├── utils/
│   │   ├── cookie-helper.ts
│   │   ├── jwt-helpers.ts
│   │   ├── refresh-tokens.ts
│   │   └── session-manager.ts
│   ├── views/
│   │   ├── admin.ejs
│   │   ├── login.ejs
│   │   ├── register.ejs
│   │   └── user.ejs
│   └── public/
│       └── styles.css
├── sessions/
├── build/
├── .env
├── .gitignore
├── package.json
└── tsconfig.json
```

*Nota: `build/` se genera durante la compilación. La estructura mostrada resume las carpetas y archivos principales compartidos; algunos archivos auxiliares pueden variar según la versión del proyecto.*

## Autenticación y autorización

La aplicación permite elegir entre dos mecanismos de autenticación:

### JWT

- Access token con una duración de 15 minutos.
- Refresh token con una duración de 7 días.
- Tokens enviados mediante cookies configuradas con `HttpOnly` y `SameSite`.
- Persistencia del identificador único (`jti`) de los refresh tokens en MongoDB.
- Renovación de tokens cuando el access token expira, siempre que el refresh token siga siendo válido.

### Sesiones de servidor

- Gestión mediante `express-session`.
- Almacenamiento de sesiones en archivos con `session-file-store`.
- Regeneración del identificador de sesión al iniciar sesión.
- Token CSRF asociado a la sesión para validar las solicitudes protegidas.

### Roles y permisos

Las rutas administrativas utilizan una cadena de middlewares para comprobar la autenticación, recuperar la información del usuario, validar las solicitudes y verificar el rol requerido.

El panel de administración permite consultar los usuarios registrados y eliminar cuentas.

## Requisitos previos

Antes de ejecutar el proyecto, necesitás:

- Node.js y npm.
- Una instancia de MongoDB local o una base de datos MongoDB accesible.
- Git para clonar el repositorio.

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd <NOMBRE_DEL_PROYECTO>
```

Reemplazá los valores entre `< >` por la URL y el nombre reales del repositorio.

### 2. Instalar las dependencias

```bash
npm install
```

### 3. Configurar las variables de entorno

Creá un archivo `.env` en la raíz del proyecto:

```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/authentication
SECRET_JWT_KEY=replace_with_a_long_random_secret
SALT_ROUNDS=12
```

- `PORT`: puerto del servidor.
- `NODE_ENV`: entorno de ejecución.
- `MONGO_URI`: cadena de conexión a MongoDB.
- `SECRET_JWT_KEY`: secreto utilizado para firmar y verificar los tokens y firmar las sesiones.
- `SALT_ROUNDS`: coste de hashing de las contraseñas con bcrypt.

Usá un secreto aleatorio y privado. No publiques el archivo `.env` ni incluyas credenciales reales en el repositorio.

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Este comando ejecuta la aplicación desde TypeScript y reinicia el proceso al detectar cambios.

### 5. Compilar y ejecutar

```bash
npm run build
npm start
```

El proceso de compilación genera el JavaScript en `build/` y copia las vistas EJS y los archivos estáticos necesarios.

Una vez iniciado el servidor, abrí:

http://localhost:3000

## Rutas principales

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Pantalla de inicio de sesión |
| GET | `/register` | Formulario de registro |
| POST | `/register` | Registro de usuarios |
| POST | `/login` | Inicio de sesión |
| POST | `/logout` | Cierre de sesión |
| GET | `/user` | Pantalla de usuario autenticado |
| GET | `/admin` | Panel administrativo |
| GET | `/users` | Consulta de usuarios protegida |
| DELETE | `/delete/:id` | Eliminación de un usuario protegida |

Las rutas protegidas requieren la autenticación correspondiente y, en el caso de las rutas administrativas, el rol autorizado.

## Migración de JavaScript a TypeScript

Uno de los objetivos principales del proyecto fue practicar una migración progresiva de JavaScript a TypeScript, manteniendo la lógica de autenticación y reorganizando el código para mejorar su mantenibilidad.

Durante este proceso se trabajó en:

- Definición de tipos e interfaces para usuarios, sesiones y payloads JWT.
- Tipado de controladores, middlewares y funciones asíncronas.
- Extensión de los tipos de `Express.Request` y `express-session` para representar la información de autenticación.
- Uso de `HydratedDocument` para tipar documentos de Mongoose.
- Separación entre tipos de datos, acceso a la base de datos y lógica de negocio.
- Configuración de TypeScript con módulos ES y generación de archivos JavaScript en `build/`.

La aplicación también evolucionó desde una implementación centrada en el backend hacia una aplicación web con formularios, vistas renderizadas en el servidor y estilos propios.


Desarrollado como proyecto de aprendizaje y práctica de backend, TypeScript, autenticación y desarrollo web con Node.js y Express.
