import { Router } from 'express';
import { getQuestions, getQuestionById, getQuestionsStats } from '../controllers/questionsController';

const router = Router();

// GET /api/questions - Listar perguntas
router.get('/', getQuestions);

// GET /api/questions/stats - Estatísticas das perguntas
router.get('/stats', getQuestionsStats);

// GET /api/questions/:id - Buscar pergunta por ID
router.get('/:id', getQuestionById);

export default router; 