import { Router } from 'express';
import { getAnswers } from '../controllers/answersController';

const router = Router();

// GET /api/answers - Listar respostas
router.get('/', getAnswers);

export default router; 