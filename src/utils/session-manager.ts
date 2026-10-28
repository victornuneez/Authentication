import { generateAccessToken, generateRefreshToken } from './jwt-helpers.js';
import { setSecureCookie } from './cookie-helper.js';
import { randomUUID } from 'node:crypto';
import { saveRefreshToken } from '../models/refreshTokenRepository.js';
import jwt from 'jsonwebtoken';
import type { Response, Request} from 'express';


// funcion para generar una sesion nueva  unica en cada login, guarda info minima necesaria para la session
export const generateSession = async (req: Request, res: Response, user: UserDB, method: Method) => {
    
    try {
        // Este camino se activa si el usuario marco la casilla recordarme.
        if (method === 'cookie') {
            // Con regenerate nos aseguramos que cada login por cookies reciba una nueva id sesion nueva y segura.
            // (evita usar una sesion del usuario que el atacante ya conoce.(cada login = nuevaID))
            return req.session.regenerate((error: Error | null | undefined) => {   
                if (error) return res.status(500).render('login', { error: 'Error al iniciar sesion'}); 
    
                // Al guardar en la session, express-session envia automáticamente una cookie con el ID de sesión al navegador para vincular 
                // al usuario con esta sesion.
                // (Guardamos los datos para identificar al usuario en cada request)
                req.session.user = { _id: user._id!, role: user.role };
                
                // Creamos este token para verificar si las peticiones(POST,DELETE,PUT) vienen del propio sitio y no de otro sitio externo.
                // Se guarda en la sesion del servidor pero se envia al navegador tambien.(Evitamos las falsificaciones de peticiones)
                req.session.csrfToken = randomUUID();

                // Guardamos la session explicitamente para darle tiempo de guardar antes de redirigir al usuario a la vista de admin
                req.session.save((error) => {
                if (error) {
                    console.error('Error al guardar la sesión:', error);
                    return res.status(500).render('login', {
                        error: 'Error al guardar la sesión'
                    });
                }

                if(user.role === 'admin') {
                    return res.redirect('/admin');
                }

                return res.redirect('/user');
            });
        });
    // Si el usuario elige iniciar sesion con un JWT, vamos a crear sus tokens y guardar el refresh token en una cookie segura.
    } else if (method === 'jwt') {
                const token = generateAccessToken(user);
                const refresh = generateRefreshToken(user);
                
                // Decodificamos nuestro refreshToken creado para poder guardarlo en la base de datos con nuestro tipo RefreshTokenPayload.
                const refreshToken = jwt.decode(refresh) as RefreshTokenPayload;
                if(typeof refreshToken.userId !== 'string' || typeof refreshToken.jti !== 'string' || refreshToken.type !== 'refresh') {
                    throw new Error('El decode devolvio otra tipo que no es RefreshTokenPayload')
                } 
                await saveRefreshToken(refreshToken);

                req.session.regenerate((error: Error | null | undefined) => {   
                if (error) return res.status(500).render('login', { error: 'Error al iniciar sesion'});
                
                // Guarda
                req.session.csrfToken = randomUUID(); 

                req.session.save((error) => {
                if (error) {
                    console.error('Error al guardar la sesión:', error);
                    return res.status(500).render('login', {
                        error: 'Error al guardar la sesión'
                    });
                }

                // Guardamos y enviamos el accessToken y el refresh token en cookies al cliente. 
                setSecureCookie(res, 'accessToken', token, 15 * 60 * 1000);
                setSecureCookie(res, 'refreshToken', refresh, 7 * 24 * 60 * 60 * 1000);
                
                if(user.role === 'admin') {
                    return res.redirect('/admin');
                }
        
                return res.redirect('/user');
                });                
            });
                

        
        // Validamos el caso en donde el Metodo de inicion de session sea desconocido
        } else {
            return res.status(400).render('login', { error: 'Metodo invalido' });
            }
        
    } catch (error) {
        console.error('Error al generar sesion:', error)
        return res.status(500).render('login', { error:  error });
    }

    }


