// Importamos router, que es herramienta de express que nos permite agrupar rutas.
import { Router } from 'express'
import { register, login, logout, refresh } from '../controller/auth-controller.js';
import { loginLimiter } from '../middlewares/rate-limit.js'
import { filter } from '../middlewares/filter-escape.js';

const router = Router()

router.post('/register',filter, register);
router.post('/login',filter, loginLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);

// exportamos router como el archivo principal de archivo.(Asi las rutas del router quedan activadas en el servidor)
export default router;