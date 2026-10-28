/*
Middleware que verifica que rol tiene el usuario para proteger rutas segun el rol del usuario.
*/
import type { Request, Response, NextFunction } from "express";
import type { error } from "node:console";

export const requireRole = (necessaryRole: Role) => {
    return (req: Request, res: Response, next: NextFunction) => {

        // Verificamos quien esta realizando la peticion.(autenticacion -> quien sos) 
        if (!req.user) {
            return res.status(401).render('login', { error: 'Usuario no identificado'});
        }

        // Verificamos el rol del usuario.(autorizacion -> que podes hacer)
        if (req.user.role !== necessaryRole) {
            return res.status(403).render('login', { message: 'Acceso denegado. No tienes permisos'});
        }

        next();
    };
};

