// Se importa esta libreria primero para evitar ejecutar una funcion que dependa de una variable de entorno antes de que dotenv se ejecute.
import 'dotenv/config'

import express from 'express';
import session from 'express-session';
import authRoutes from './routes/authRoutes.js';
/* import { PORT, SECRET_JWT_KEY } from './.env'; */
import cookieParser from 'cookie-parser';
import adminRoutes from './routes/admin-routes.js'
import helmet from 'helmet';
import sessionFileStore from 'session-file-store';
import { connectDB } from './config/database.js';
connectDB();

const PORT = parseInt(process.env.PORT!, 10);
const SECRET_JWT_KEY = process.env.SECRET_JWT_KEY;

const app = express();
const FileStore = sessionFileStore(session);

// Middleware protege la app automaticamente agregando cabeceras HTTP que previenen ataques comunes.
app.use(helmet())
// middlewares que permite que el servidor transforme los datos recibidos en formato JSON a un objeto JS para usarlo
app.use(express.json())
// Permite que el servidor lea las cookies que envía y recibe el navegador (como el refresh_token)
app.use(cookieParser())

// Este middleware crea y maneja sesiones de usuario en el servidor. 
// guarda un Id de sesion en una cookie para que el navegador lo recuerde y el servidor pueda saber quien es el usuario en cada request.
app.use(session({
    // Guardamos cada sesion en un archivo .(archivo en disco)
    store: new FileStore({
        path: './sessions',
        retries: 0,    // Para evitar errores si el archivo esta temporalmente bloqueado.
        ttl: 3600       // definimos el tiempo de vida de la session 1h. (Aunque el usuario no cierre sesion)
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