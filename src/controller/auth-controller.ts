import bcrypt from 'bcrypt';
import { findUserByEmail, findUserById, findUserByUsername, saveUser } from '../models/userRepository.js'
import { assignSession } from '../utils/session-manager.js';
import jwt from 'jsonwebtoken';
import { generateAccesToken, generateRefreshToken } from '../utils/jwt-helpers.js';
import { deleteRefreshToken, findRefreshToken, saveRefreshToken } from '../models/refreshTokenRepository.js';
import type { Request, Response } from 'express';
import { setSecureCookie } from '../utils/cookie-helper.js';

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS!);
const SECRET_JWT_KEY = process.env.SECRET_JWT_KEY;


const register = async (req: Request, res: Response) => {
    try {
        // Extraemos los datos que vienen de la peticion (body)
        const { username, email, password, role } = req.body;
        
        // Validamos si el usuario nos envio su username, email y contrasenha
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'username, email y contrasenha requeridos'});
        }

        // Falta validar que el usuario no pueda usar un nombre de usuario existente.
        const usernameExist = await findUserByUsername(username);
        if (usernameExist) {
            return res.status(409).json({ message: 'El nombre de usuario ya en uso'})
        }

        // Hasheamos la contrasenha antes de guardarla
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const registerUser = await saveUser({
            username: username,
            email: email,
            password: hashedPassword,
            role: role || 'user'
        });

        res.status(201).json({ 
            message: 'Usuario registrado con exito',
            username: registerUser.username
        });
    
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Hubo errores al realizar el registro, intente de nuevo'})
    }
};

const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validamos que el usuario envio su username y password para loguearse.
        if (!email || !password ) {
            return res.status(400).json({ message: 'Username y contrasenha requeridos'});
        };

        // Buscamos si el username existe en la base de datos(Devuelve el objeto JS completo, no solo el username).
        const userData = await findUserByEmail(email);
        if (!userData) {
            return res.status(401).json({ message: 'Credenciales invalidas 1'});
        };

        // Comparamos las contrasenhas si son correctas
        const compareHash = await bcrypt.compare(password, userData.password)
        if (!compareHash) {
            return res.status(401).json({ message: 'Credenciales invalidas 2'});
        };

        return assignSession(req, res, userData)

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor '})
    }
}

const refresh = async (req: Request, res: Response) => {

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Token de refresh no encontrado '});
    }

    try {
        // Verificamos si el token es valido y no ha expirado.
        const payload = jwt.verify(refreshToken, SECRET_JWT_KEY!) as RefreshTokenPayload;
        // Verificamos si el token es realmente un refresh Token.
        if (typeof payload.userId !== 'string' || typeof payload.jti !== 'string' ||payload.type !== 'refresh') {
            return res.status(401).json({ message: 'No existe el refresh token '})
        }

        // Validamos si el refreshToken recibido desde el navegador existe aun en la base de datos
        const validRefreshToken = await findRefreshToken(payload.jti);
        if(!validRefreshToken) {
            return res.status(401).json({ message: 'RefreshToken invalido' })
        }
        
        // Validamos si el usuario existe aun en la base datos.
        const userData = await findUserById(payload.userId);
        if(!userData) return res.status(404).json({ message: 'El usuario no existe'});;
        
        // Usamos los datos del user de la BD para generar el nuevo accessToken.
        const newAccessToken = generateAccesToken(userData);
        const newRefreshToken = generateRefreshToken(userData);
        
        // Borramos el refreshToken recibido desde el navegador y enviamos el nuevo refreshToken creado al usuario.
        await deleteRefreshToken(payload.jti);
        setSecureCookie(res, 'refreshToken', newRefreshToken);
        
        // Volvemos a decodificar y validar el nuevo refreshToken para guardarlo nuevamente en la base de datos.
        const decodeRefreshToken = jwt.decode(newRefreshToken) as RefreshTokenPayload;
        if (typeof decodeRefreshToken.userId !== 'string' || typeof decodeRefreshToken.jti !== 'string' ||decodeRefreshToken.type !== 'refresh') {
            throw new Error('El decode devolvio otra tipo que no es RefreshTokenPayload')
        }
        await saveRefreshToken(decodeRefreshToken);
        

        // Devolvemos el nuevo accessToken al usuario
        return res.status(200).json({
            accessToken: newAccessToken,
            exp: '15 min'
        });

    } catch (error) {
        console.error(error);
        return res.status(403).json(({ message: 'Sesion expirada o token invalido' }))
    }
}

const logout = async (req: Request, res: Response) => {

    try {
        // Obtenemos y validamos el refreshToken del navegador.
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: 'Token de refresh no encontrado '});
        }
    
        // Verificamos si el token es valido y no ha expirado, tambien si tiene una estructura valida
        const payload = jwt.verify(refreshToken, SECRET_JWT_KEY!) as RefreshTokenPayload;
        if (typeof payload.userId !== 'string' || typeof payload.jti !== 'string' ||payload.type !== 'refresh') {
            return res.status(401).json({ message: 'No existe el refresh token '})
        }
    
        await deleteRefreshToken(payload.jti);
    
        // Borramos toda la sesion que tiene el usuario en el servidor
        req.session.destroy((error) => {
            if (error) {
                return res.status(500).json({ message: 'Error al cerrar sesion'})
            }
            // Borramos las cookies del navegador de ambas sesiones.
            res.clearCookie('connect.sid'); 
            res.clearCookie('refreshToken');
    
            return res.status(200).json({ message: 'Session cerrada correctamente '});
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export { register, login, refresh, logout }