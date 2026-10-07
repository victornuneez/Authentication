// Importamos la libreria express para agregar nuestras propiedades al objeto Request, no para sobreescribirlos
import 'express';
declare global {
    namespace Express { // Entra al espacio de nombres de express en donde organiza sus tipos
        interface Request { // Hacemos referencia directa a la interfaz de Request para agregar nuestras propiedades
            user: UserData;
            authMethod: Method;
        }
    }
}
