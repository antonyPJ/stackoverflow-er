import { Router } from 'express';
import { getUsers, getUserById, getUsersStats } from '../controllers/usersController';

const router = Router();

// GET /api/users - Listar usuários
router.get('/', getUsers);

// GET /api/users/stats - Estatísticas dos usuários
router.get('/stats', getUsersStats);

// GET /api/users/:id - Buscar usuário por ID
router.get('/:id', getUserById);

export default router; 