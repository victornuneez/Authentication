/*
Filtra y escapa los datos ingresados por el usario en el username, email, password
*/
import type { Request, Response, NextFunction } from "express";

// Funcion para escapar cualquier dato ingresado por el usuario.(evita inyecciones de scripts)
const escapeHTML = (str: unknown) => {
    // Comprobamos que lo que recibimos es una cadena de texto, si no es lo devolvemos tal cual.
    if (typeof str !== 'string') return str;
    
    const characters = ({
            '&':'&amp;', 
            '<': '&lt;', 
            '>': '&gt;', 
            "'": '&#39;', 
            '"': '&quot;',
            '/': '&#x2F;'
        })

    // Mapeamos cada caracter que se puede usar en ataques XSS para mostrarlo en el HTML sin que se ejecute codigo malicioso
    return str.replace(/[&<>'"/]/g, (character) => characters[character as keyof typeof characters]);
};

// Funcion para filtrar los datos antes de que lleguen a la ruta final.
const filter = (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
        for (const key in req.body) { // key toma cada clave del objeto en cada vuelta del bucle
            req.body[key] = escapeHTML(req.body[key]); // Escapamos cada valor asociado a la clave de turno. (username, email, password)
        }
    }
    next();
}

export { filter }
