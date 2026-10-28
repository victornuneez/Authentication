import jwt from 'jsonwebtoken';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt-helpers.js';
import { deleteRefreshToken, findRefreshToken, saveRefreshToken } from '../models/refreshTokenRepository.js';
import { findUserById } from '../models/userRepository.js'
import type { RefreshResult } from '../types/type-refresh.js';
const SECRET_JWT_KEY = process.env.SECRET_JWT_KEY;


export const refreshTokens = async (refreshToken: string): Promise<RefreshResult | null> => {
    
    try {
        // Verificamos si el token es valido y no ha expirado.
        const payload = jwt.verify(refreshToken, SECRET_JWT_KEY!) as RefreshTokenPayload;
        // Verificamos si el token es realmente un refresh Token.
        if (typeof payload.userId !== 'string' || typeof payload.jti !== 'string' ||payload.type !== 'refresh') {
            return null;
        }

        // Validamos si el refreshToken recibido desde el navegador existe aun en la base de datos
        const validRefreshToken = await findRefreshToken(payload.jti);
        if(!validRefreshToken) {
            return null;
        }
        
        // Validamos si el usuario existe aun en la base datos.
        const userData = await findUserById(payload.userId);
        if(!userData){
            return null;
        }
        // Usamos los datos del user de la BD para generar el nuevo accessToken y refreshToken.
        const newAccessToken = generateAccessToken(userData);
        const newRefreshToken = generateRefreshToken(userData);
        
        // Volvemos a decodificar y validar el nuevo refreshToken para guardarlo nuevamente en la base de datos.
        const decoded = jwt.decode(newRefreshToken);
        if (typeof decoded !== 'object' || decoded === null || typeof decoded.userId !== 'string' || 
            typeof decoded.jti !== 'string' || decoded.type !== 'refresh') {
                throw new Error('El nuevo refreshToken tiene un payload invalido')
            }
        
        // Creamos de forma explicita los datos del payload del nuevo refreshToken que se van a guardar en la base de datos. 
        const decodeRefreshToken: RefreshTokenPayload = {
            userId: decoded.userId,
            jti: decoded.jti,
            type: decoded.type
        }
            
        // Primero guardamos el nuevo refreshToken en la base de datos y luego eliminamos el anterior
        // Si falla el guardado del nuevo refresh token, evitamos que el usuario se quede sin refreshToken.
        await saveRefreshToken(decodeRefreshToken);
        await deleteRefreshToken(payload.jti);

        return { 
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            user: { 
                _id: userData._id.toString(),
                role: userData.role 
            }
        };

    } catch (error) {
        if( error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError) {
            return null;
        }

        // Atrapa y propaga los errores inesperados que puedan ocurrir.
        throw error;
    }
}