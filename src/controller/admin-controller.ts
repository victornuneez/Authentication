import type { Request, Response } from 'express';
import { getAllUsers, deleteUserById, findUserById } from '../models/userRepository.js';

const getUsers = async (req: Request, res: Response) => {
    try {
        // Buscamos a todos los usuarios de la base de datos(array con objetos = todos los datos de los usuarios).
        const users = await getAllUsers();
        
        // Recorremos cada usuario con .map, creamos un nuevo objeto sin info sensible(cada u creamos un nuevo objeto con los campos nuevos). 
        const safeUsers = users.map( u => ({ username: u.username, role: u.role}));
        
        return res.status(200).json({
            message: 'Listado de usuarios (vista admin)',
            data: safeUsers // lista de usuarios filtrada
        });

    } catch(error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener usuarios '});
    }
};



const deleteUser = async (req: Request, res: Response) => {
    try {
        //  Extraemos el ID que viene en la URL
        const { id } = req.params;

        if(typeof id !== 'string') throw new Error('El id obtenido de los parametros es invalido');  

        // Verificamos si el usuario realmente existe en la base de datos
        const userExists = await findUserById(id);
        
        if (!userExists) {
            return res.status(404).json({ message: 'Usuario no encontrado. No se pudo eliminar.' });
        }

        await deleteUserById(id);

        // Respondemos con éxito
        return res.status(200).json({ 
            message: `Usuario eliminado correctamente` 
        });

        // Capturamos cualquier error inesperado para que el servidor no se caiga
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        return res.status(500).json({ message: 'Error interno al intentar eliminar el usuario' });
    }
};

export { getUsers, deleteUser }