import type { Request, Response } from 'express';
import { getAllUsers, deleteUserById, findUserById } from '../models/userRepository.js';

export const getUsers = async (req: Request, res: Response) => {
    try {
        // Buscamos a todos los usuarios de la base de datos(array con objetos = todos los datos de los usuarios).
        const users = await getAllUsers();
        
        
        return res.render('admin', { users });

    } catch(error) {
        console.error(error);
        return res.status(500).render('admin', { error: 'Error al obtener usuarios '});
    }
};



export const deleteUser = async (req: Request, res: Response) => {
    try {
        //  Extraemos el ID que viene en la URL
        const { id } = req.params;

        if(typeof id !== 'string') throw new Error('El id obtenido de los parametros es invalido');  

        // Verificamos si el usuario realmente existe en la base de datos
        const userExists = await findUserById(id);
        
        if (!userExists) {
            return res.status(404).render('admin',{ error: 'Usuario no encontrado. No se pudo eliminar.' });
        }

        await deleteUserById(id);

        // Respondemos con éxito
        return res.redirect('/admin');

        // Capturamos cualquier error inesperado para que el servidor no se caiga
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        return res.status(500).render('admin', { message: 'Error interno al intentar eliminar el usuario' });
    }
};
