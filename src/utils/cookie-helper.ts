
// importamos el tipo para especificar de que tipo es el parametro res y comprobarlo.
// Con la palabra reservada type le indicamos al compilador que elimine por esta linea de importacion ya que el navegador y node no lo entiende
import type { Response } from 'express';

// Funcion para realizar(setear) una cookie con estas reglas de seguridad.
const setSecureCookie = (res: Response, name: string , value: string): void => {
    res.cookie(name, value, {                           // "res.cookie" envia una cabecera Set-Cookie
        httpOnly: true,                                 // El JS del navegador no puede leer la cookie, no se puede robar la cookie facilmente
        sameSite: 'lax',                                // Controla cuando el navegador envia la cookie automaticamente al servidor. Permite enlaces externos GET y protege contra mayoria de CSRF
        maxAge: 7 * 24 * 60 * 1000,
        path: '/'                                       // '/' significa que se puede usar en toda la aplicacion.
    });
};

export { setSecureCookie }