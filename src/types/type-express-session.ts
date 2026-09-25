// Importamos la libreria para agregar estos tipos a los types de la libreria, no para sobreescribirlos
import 'express-session';
// SOLUCION: Declaramos nuestro tipo personalizado de "user" para agregarlo a la declaracion de tipos de la libreria express-sessions.

// Le decimos a TS que vamos a modificar el modulo 'express-session'
declare module 'express-session' {

    interface SessionData {
        user: UserData
        csrfToken: string
    }
}