import type { Request, Response } from "express";
import { getAllUsers } from "../models/userRepository.js";


// Metodo para renderizar la vista de login como vista principal de la aplicacion.
export const loginView = (req: Request, res: Response) => {
    return res.render('login', { error: null });
}

// Metodo que renderiza la vista de register
export const registerView = (req: Request, res: Response) => {
    return res.render('register', { error: null });
}

// Metodo que renderiza la vista de admin
export const adminView = async (req: Request, res: Response) => {
    try {
        const users = await getAllUsers();

    return res.render('admin', { users, csrfToken: req.session.csrfToken });
    
} catch(error) {
    console.error(error);
    return res.status(500).render('admin', { users: [], error: error });
}
}

export const userView = (req: Request, res: Response) => {
    return res.render('user', { error: null });
}