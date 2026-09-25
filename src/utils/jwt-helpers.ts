import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';

const SECRET_JWT_KEY = process.env.SECRET_JWT_KEY;

// Funcion para generar el JWT (accessToken) vive poco.
const generateAccesToken = (user: UserData): string => {
    if(!SECRET_JWT_KEY) throw new Error('Falta SECRET_JWT_KEY');
    return jwt.sign(
        { id: user._id, role: user.role }, SECRET_JWT_KEY, { expiresIn: '15m' } );
};

// Funcion para realizar el refresh token para mantener la sesion del usuario activa.(Cada vez que se pide un accesToken nuevo, tambien se crea un nuevo refreshToken)
const generateRefreshToken = (user: UserData): string => {
    if(!SECRET_JWT_KEY) throw new Error('Falta SECRET_JWT_KEY');
    return jwt.sign(
        { id: user._id, jti: randomUUID(), type: 'refresh'}, //id de usuario sirve para saber quien pide un nuevo access token. 
        SECRET_JWT_KEY,
        { expiresIn: '7d' }
    );
};

export { generateAccesToken, generateRefreshToken }




/*
JTI = JWT ID el identificador unico que se le pone a cada refresh token.
- Le da a cada sesion una identidad propia una persona puede tener 3 sesiones abiertas en 3 dispositivos diferentes y los 3 refresh token tendran un JTI distinto( sesiones separadas).
- Nos permite revocar tokens robados aunque no hayan expirado.(Si se usa uno de los refresh token desde otras IP)
- Con el JTI podemos saber que refrestoken fue usado, asi si se roba un refreshToken anterior y se intenta usar, mediante el JTI guardado en la base de datos sabemos cual refresh token es el activo
*/