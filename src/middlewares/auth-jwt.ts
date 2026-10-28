/*
Este middleware identifica al usuario y valida que el token que tiene sea valido.
Permite que las rutas sepan quien esta logueado sin tener que decodificar el JWT cada vez.
Evita que gente que modifique o robe un token pueda entrar.
Tambien renueva los tokens de acceso y refresh validos del usuario cuando expiran.
*/

import type { Request, Response, NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { refreshTokens } from '../utils/refresh-tokens.js';
import { setSecureCookie } from '../utils/cookie-helper.js';
const SECRET_JWT_KEY = process.env.SECRET_JWT_KEY;

// Funcion auxiliar que valida en runtime e indica a typescript explicitamente que el tipo de payload es UserData.(narrowing)
const isUserData = (payload: string | JwtPayload): payload is UserData => {
    return (
        typeof payload === 'object' &&
        payload !== null &&
        typeof payload._id === 'string' &&
        typeof payload.role === 'string'
    );
};

export const verifyJWT = async (req: Request, res: Response, next: NextFunction) => {
    const auth = req.cookies?.accessToken;

    // Si no hay un accessToken pasamos al sig middleware (quizas es una sesion con cookies)
    if (!auth) {
        return next();
    }

    try {
        // verificamos si el token es valido(si nadie lo modifico) o no expiro. 
        // Guardamos el payload en la request para identificar al usuario logueado. Indicamos con que metodo ingreso
        // Sin esto el backend no sabe quien hace la request y tendria que verificar el JWT cada vez.
        const payload = jwt.verify(auth, SECRET_JWT_KEY!);

        if(!isUserData(payload)) {
            return res.status(401).render('login', { error: 'Payload invalido'})
        }

        req.user = payload; // 
        req.authMethod = 'jwt';

        return next();

    } catch (error) {
        if(error instanceof jwt.TokenExpiredError) {
            const refreshToken = req.cookies?.refreshToken;

            if(!refreshToken) {
                res.clearCookie('accessToken');
                res.clearCookie('refreshToken');
            
                return res.status(401).render('login', { error: 'Tu sesion expiro. Inicia sesion nuevamente' });
            }

        try {
            const result = await refreshTokens(refreshToken);

            if(!result) {
                res.clearCookie('accessToken');
                res.clearCookie('refreshToken');

                return res.status(401).render('login', { error: 'Tu sesion expiro. Inicia sesion nuevamente' });
            }

            req.user = result.user;
            req.authMethod = 'jwt';

            // Se envian los nuevos accessToken y refreshToken al usuario y se sigue con la peticion inicial.
            setSecureCookie(res, 'accessToken', result.accessToken, 15 * 60 * 1000);
            setSecureCookie(res, 'refreshToken', result.refreshToken, 7 * 24 * 60 * 60 * 1000);

            return next();

        } catch (error) {
            console.error('Error al renovar los tokens:', error);

            return res.status(500).render('login', { error: 'Ocurrio un error al renovar la sesion. Intente nuevamente' });
        }
    } 

        console.error(error);
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        return res.status(401).render('login', { error: 'Token invalido o expirado. Inicia sesion nuevamente'});
    }
}

