import express from 'express';
import { executeCustomQuery, testCustomQuery, getSchemaInfo, validateCustomQuery, generateAutomaticJoinsForTable } from '../controllers/customQueryController';

const router = express.Router();

// Endpoint principal para executar consultas dinâmicas
router.post('/execute', executeCustomQuery);

// Endpoint para validar queries antes da execução
router.post('/validate', validateCustomQuery);

// Endpoint para gerar JOINs automáticos quando uma nova tabela é selecionada
router.post('/auto-joins', generateAutomaticJoinsForTable);

// Endpoint de teste para verificar se o controller está funcionando
router.get('/test', testCustomQuery);

// Endpoint para obter informações do schema
router.get('/schema', getSchemaInfo);

export default router; 