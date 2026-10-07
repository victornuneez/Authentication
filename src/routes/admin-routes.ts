import { Router } from "express";
import { getUsers, deleteUser } from "../controller/admin-controller.js";

// Importamos a los guardias uno por uno
import { verifyJWT } from '../middlewares/auth-jwt.js';
import { verifySession } from '../middlewares/auth-session.js';
import { validateCSRF } from '../middlewares/csrf-validator.js';
import { requireRole } from '../middlewares/role-guard.js';

const router = Router();

// Definimos un array con la cadena de guardias que tenemos
const adminSecurity = [verifyJWT, verifySession, validateCSRF, requireRole('admin')];

// Aplicamos los middlewares a nuestras rutas.
router.get('/users', adminSecurity, getUsers);
router.delete('/users/:id', adminSecurity, deleteUser)

export default router