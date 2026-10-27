/*
Verifica si la peticion realmente viene desde la aplicacion y no desde otra pagina maliciosa.
*/
import type { Request, Response, NextFunction } from 'express';

export const validateCSRF =(req: Request, res: Response, next: NextFunction) => {

    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    // Obtenemos el csrfToken de la session(servidor) y el tokenCsrf que envia el navegador(user) en el header.
    // (?. devuelve undefined en vez de romper el codigo)
    const sessionToken = req.session?.csrfToken;
    const headerToken = req.headers['x-csrf-token']; // csrf del encabezado
    const bodyToken = req.body?._csrf; // csrf del cuerpo del formulario

    // Segun el csrf que obtengamos esta variable obtiene su valor y la validamos despues
    const submittedToken = headerToken ?? bodyToken;

    // Verificamos que las peticiones autenticadas mediante sesion incluyan un token CSRF valido, para evitar que sitios maliciosos realicen
    //acciones utilizando cookies de sesion del usuario en nuestra app.
    if (!sessionToken || !submittedToken || sessionToken !== submittedToken) {
        return res.status(403).render('login', { message: 'Token CSRF invalido o faltante' })
    }

    next()
};


