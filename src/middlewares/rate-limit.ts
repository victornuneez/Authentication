/*
Limitador de intentos de login.
*/

import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // Tenes una ventana de 10 minutos para intentar loguearte desde el primer intento de logueo.
    max: 3, // intentos de loguearte permitidos
    standardHeaders: true,
    message: {
        error: 'Llegaste a los 3 intentos permitidos. Por seguridad, tu acceso ha sido bloqueado, intenta nuevamente en un rato'
    }
});

export  { loginLimiter }