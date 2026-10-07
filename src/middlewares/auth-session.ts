/*
Este middleware se encarga de que sin importar el metodo elegido, la información del usuario siempre termine disponible en el objeto req.user.
Además, actua como una barrera de seguridad: si no detecta una sesion activa.
*/
import type { Request, Response, NextFunction } from 'express';

const verifySession = (req: Request, res: Response, next: NextFunction) => {

    // Verificamos si el usuario ya esta logueado con JWT, lo pasamos al siguiente middleware o ruta.
    if (req.user) return next();

    // Verificamos si hay una session activa y si hay un usuario logueado con Cookies, si es asi guardamos su info en req.user.
    // Para que todas las rutas puedan trabajar con req.user sin importar su metodo de logueo.
    if (req.session && req.session.user) {
        req.user = req.session.user;
        req.authMethod = 'cookie'; // Marcamos con que methodo se logueo el usuario.
        return next();
    }

    return res.status(401).json({ message: 'No autorizado. Inicia sesion'})
};

export { verifySession }