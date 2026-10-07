/*
Verifica si la peticion realmente viene desde la aplicacion y no desde otra pagina maliciosa.
*/
import type { Request, Response, NextFunction } from 'express';

const validateCSRF =(req: Request, res: Response, next: NextFunction) => {

    // Si el usuario se logueo por JWT, no es necesario validar CSRF, entonces lo dejamos pasar(JWT no es vulnerable a CSRF).
    if (req.authMethod === 'jwt') return next();

    // Obtenemos el csrfToken de la session(servidor) y el tokenCsrf que envia el navegador(user) en el header.
    // (?. devuelve undefined en vez de romper el codigo)
    const sessionToken = req.session?.csrfToken;
    const headerToken = req.headers['x-csrf-token']; 

    // Verificamos que las peticiones autenticadas mediante sesion incluyan un token CSRF valido, para evitar que sitios maliciosos realicen
    //acciones utilizando cookies de sesion del usuario en nuestra app.
    if (!sessionToken || !headerToken || sessionToken !== headerToken) {
        return res.status(403).json({ message: 'Token CSRF invalido o faltante' })
    }

    next()
};

export { validateCSRF }
