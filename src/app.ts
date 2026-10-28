// Se importa esta libreria primero para evitar ejecutar una funcion que dependa de una variable de entorno antes de que dotenv se ejecute.
import 'dotenv/config'
import express from 'express';
import session from 'express-session';
import methodOverride from 'method-override';
import authRoutes from './routes/authRoutes.js';
import cookieParser from 'cookie-parser';
import adminRoutes from './routes/admin-routes.js'
import helmet from 'helmet';
import sessionFileStore from 'session-file-store';
import { connectDB } from './config/database.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
connectDB();

const PORT = parseInt(process.env.PORT!, 10);
const SECRET_JWT_KEY = process.env.SECRET_JWT_KEY;

const app = express();
const FileStore = sessionFileStore(session);

// Le indicamos a Express que use EJS
app.set('view engine', 'ejs');

// Obtenemos la ruta en donde se encuentra este archivo y eliminamos app.ts para usar esta ruta como punto de partida y entrar a otras
// carpetas del proyecto
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Le decimos en que carpeta estan las plantillas ejs.
app.set('views', path.join(__dirname, 'views'));

// Middleware protege la app automaticamente agregando cabeceras HTTP que previenen ataques comunes.
app.use(helmet());
// middlewares que permite que el servidor transforme los datos recibidos en formato JSON a un objeto JS para usarlo
app.use(express.json());
// Permite que el servidor lea las cookies que envía y recibe el navegador (como el refresh_token)
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

// Middleware que permite al servidor leer los datos que vienen de un formulario HTML.
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
// Este middleware crea y maneja sesiones de usuario en el servidor. 
// guarda un Id de sesion en una cookie para que el navegador lo recuerde y el servidor pueda saber quien es el usuario en cada request.
app.use(session({
    // Guardamos cada sesion en un archivo .(archivo en disco)
    store: new FileStore({
        path: './sessions',
        retries: 0,    // Para evitar errores si el archivo esta temporalmente bloqueado.
        ttl: 7 * 24 * 60 * 60    // definimos el tiempo de vida de la session 7dias. (Aunque el usuario no cierre sesion)
    }),
    secret: SECRET_JWT_KEY!, // Se usa para firmar el ID de sesion.
    resave: false,          // No guarda la sesion si no hubo cambios (ahorramos recursos)
    saveUninitialized: false, // No crea sesiones para usuarios que no se han logueado
    cookie: {
        httpOnly: true,     
        secure: process.env.NODE_ENV === 'production', // Solo viaja por HTTPS en producción
        maxAge: 7 * 24 * 60 * 60 * 1000 // La sesion dura 7 días (Persistente)
    }
}));

app.use('/', authRoutes);
app.use('/', adminRoutes)

app.listen(PORT, () => {
    console.log("Servidor ejecutandose en http://localhost:3000")
})