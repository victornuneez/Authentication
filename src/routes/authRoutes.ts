// Importamos router, que es herramienta de express que nos permite agrupar rutas.
import { Router } from 'express'
import { register, login, logout } from '../controller/auth-controller.js';
import { loginView, registerView, userView } from '../controller/views-controller.js';
import { loginLimiter } from '../middlewares/rate-limit.js'
import { filter } from '../middlewares/filter-escape.js';

const router = Router()

// Asociamos la ruta raiz al controlador loginView para renderizar la pantalla de login como pagina principal de la aplicacion.
router.get('/', loginView);
router.get('/register', registerView);
router.get('/user', userView);

router.post('/register',filter, register);
router.post('/login',filter, loginLimiter, login);
router.post('/logout', logout);

// Exportamos router como el archivo principal de archivo.(Asi las rutas del router quedan activadas en el servidor)
export default router;