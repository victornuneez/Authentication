import { Router } from "express";
import { getUsers, deleteUser } from "../controller/admin-controller.js";
import { adminView } from "../controller/views-controller.js";
// Importamos a los guardias uno por uno
import { verifyJWT } from '../middlewares/auth-jwt.js';
import { verifySession } from '../middlewares/auth-session.js';
import { validateCSRF } from '../middlewares/csrf-validator.js';
import { requireRole } from '../middlewares/role-guard.js';

const router = Router();

// Definimos un array con la cadena de guardias que tenemos
const adminSecurity = [verifyJWT, verifySession, validateCSRF, requireRole('admin')];

router.get('/admin', adminSecurity, adminView);

// Aplicamos los middlewares a nuestras rutas.
router.get('/users', adminSecurity, getUsers); 
router.delete('/delete/:id', adminSecurity, deleteUser)

export default router