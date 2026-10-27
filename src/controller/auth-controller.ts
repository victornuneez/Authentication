import bcrypt from 'bcrypt';
import { findUserByEmail, findUserByUsername, saveUser } from '../models/userRepository.js'
import { generateSession } from '../utils/session-manager.js';
import jwt from 'jsonwebtoken';
import { deleteRefreshToken } from '../models/refreshTokenRepository.js';
import type { Request, Response } from 'express';



const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS!);
const SECRET_JWT_KEY = process.env.SECRET_JWT_KEY;


export const register = async (req: Request, res: Response) => {
    try {
        // Extraemos los datos que vienen de la peticion (body)
        const { username, email, password } = req.body;
        
        // Validamos si el usuario nos envio su username, email y contrasenha
        if (!username || !email || !password) {
            return res.status(400).render('register', { error: 'username, email y contrasenha requeridos' });
        }

        // Falta validar que el usuario no pueda usar un nombre de usuario existente.
        const usernameExist = await findUserByUsername(username);
        if (usernameExist) {
            return res.status(409).render('register', { error: 'El nombre de usuario ya esta en uso' })
        }

        // Hasheamos la contrasenha antes de guardarla
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        await saveUser({
            username: username,
            email: email,
            password: hashedPassword,
            role: 'user'
        });

        res.redirect('/');
    
    } catch (error) {
        console.error(error);
        res.status(500).render('register', { error: 'Hubo errores al realizar el registro, intente de nuevo'})
    }
};


export const login = async (req: Request, res: Response) => {
    try {
        const { email, password, remember } = req.body;

        // Validamos que el usuario envio su email y password para loguearse.
        if (!email || !password ) {
            return res.status(400).render('login', { error: 'Email y contraseñas requeridos'});
        };

        // Buscamos si el username existe en la base de datos(Devuelve el objeto JS completo, no solo el username).
        const userData = await findUserByEmail(email);
        if (!userData) {
            return res.status(401).render('login', { error: 'Credenciales invalidas'});
        };

        // Comparamos las contrasenhas si son correctas
        const compareHash = await bcrypt.compare(password, userData.password)
        if (!compareHash) {
            return res.status(401).render('login', { error: 'Email o contraseña incorrecta'});
        };

        // Validamos si la casilla del checkbox vino marcada o no para asignar el metodo de inicio de sesion que usara el usuario.
        const method = remember === 'cookie' ? 'cookie' : 'jwt';

        return generateSession(req, res, userData, method)

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).render('login', { error: 'Error interno en el servidor '})
    }
}


export const logout = async (req: Request, res: Response) => {

    try {
        // Obtenemos y validamos el refreshToken del navegador.
        const refreshToken = req.cookies?.refreshToken;

        if (refreshToken) {
            let payload: RefreshTokenPayload;
            try {
                // Verificamos si el token es valido y no ha expirado,
                payload = jwt.verify(refreshToken, SECRET_JWT_KEY!) as RefreshTokenPayload;
                
            // Si el refreshToken no se verifico o expiro, lo eliminamos del navegaddor y redirigimos al usuario a la pantalla de login
            // Tambien se borra el accessToken.
            } catch (error) {
                console.warn('Refresh Token invalido o expirado al cerrar sesion:', error);
                res.clearCookie('refreshToken');
                res.clearCookie('accessToken');
                return res.redirect('/');
            }
            // Si la estructura del refreshToken es invalida igual lo borramos del navegador y redirigimos al usuario al login.
            // Tambien se borra el accessToken.
            if (typeof payload.userId !== 'string' || 
                typeof payload.jti !== 'string' ||
                payload.type !== 'refresh') {
                
                    res.clearCookie('refreshToken');
                    res.clearCookie('accessToken');
                    return res.redirect('/')
            }
            // Si el refreshoken es valido y tiene el formato esperado se borra de la base de datos y del navegador.
            // Tambien se borra el accessToken.
            await deleteRefreshToken(payload.jti);
            res.clearCookie('refreshToken');
            res.clearCookie('accessToken');
            return res.redirect('/');
        } 
        
        if(req.session?.user) {
            req.session.destroy((error) => {
                if (error) {
                    console.error('Error al cerrar sesion:', error);
                    return res.status(500).render('login', { error: 'Error al cerrar sesion' })
                }

                res.clearCookie('connect.sid'); 
                // Si la session se destruyo correctamente redirigimos a la pantalla de login
                return res.redirect('/');
            });
        
        } else {
            // Si no habia req.session, redirigimos directamente a login
            return res.redirect('/')
        }

    } catch (error) {
        console.error('Error en el logout:',error);
        res.clearCookie('connect.sid');
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');
        return res.status(500).render('login',{ error: 'Error interno del servidor al cerrar sesion' });
    }
};

