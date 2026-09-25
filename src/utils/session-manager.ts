import { generateAccesToken, generateRefreshToken } from './jwt-helpers.js';
import { setSecureCookie } from './cookie-helper.js';
import { randomUUID } from 'node:crypto';
import type { Response, Request} from 'express';


// funcion para generar una sesion nueva  unica en cada login, guarda info minima necesaria para la session
const generateSession = (req: Request, res: Response, user: UserData, method: Method) => {
    
    try {
        if (method === 'cookie') {
            // Con regenerate nos aseguramos que cada login por cookies reciba una nueva id sesion nueva y segura.(evita usar una sesion del usuario que el atacante ya conoce.(cada login = nuevaID))
            return req.session.regenerate((error: Error | null | undefined) => {   
                if (error) return res.status(500).json({ error: 'Error al iniciar sesion'}); 
    
                // Al guardar datos aca, express-session envia automáticamente una cookie con el ID de sesión al navegador para vincular al usuario con esta sesion
                // (Guardamos los datos para identificar al usuario en cada request)
                req.session.user = { _id: user._id, role: user.role };
                
                // Creamos este token para verificar si las peticiones(POST,DELETE,PUT) vienen del propio sitio y no de otro sitio externo.
                // Se guarda en la sesion del servidor pero se envia en el navegador tambien
                req.session.csrfToken = randomUUID()
    
                // Cuando se ejecuta este res, la libreria express-session mete automaticamente una cookie y la envia al navegador.
                return res.status(200).json({ 
                    message: 'Sesion Persistente activada',
                    method: 'Cookie',
                    csrfToken: req.session.csrfToken // Enviamos al usuario para que lo use desde el navegador para futuros requests(previene CSRF).
                });
            });
    
        // Si el usuario elige iniciar sesion con un JWT, vamos a crear sus tokens y guardar el refresh token en una cookie segura.
        } else if (method === 'jwt') {
                const token = generateAccesToken(user);
                const refresh = generateRefreshToken(user);
                
                // Guardamos y enviamos el refresh token en una cookie 
                setSecureCookie(res, 'refreshToken', refresh)
        
                return res.status(200).json({
                    message: 'Sesion sin estado activada',
                    method: 'jwt',
                    accessToken: token
                });
        
        // Validamos el caso en donde el Metodo de inicion de session sea desconocido
        } else {
            return res.status(400).json({ message: 'Metodo invalido' });
            }
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor'
        return res.status(500).json({ error:  errorMessage });
    }

    }

const assignSession = (req: Request, res: Response, user: UserData) => {
    const { method = 'cookie' } = req.body; // Si no envian el metodo usamos cookies por defecto
    return generateSession(req, res, user, method);  
}

export { generateSession, assignSession }