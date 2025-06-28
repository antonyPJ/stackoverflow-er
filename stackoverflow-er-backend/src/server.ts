import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import customQueryRoutes from './routes/customQueryRoutes';

const app = express();
export const prisma = new PrismaClient();
const PORT = process.env.PORT || 3002;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas básicas
app.get('/', (req, res) => {
  res.json({ message: 'StackOverflow ER Backend API' });
});

// Rota de teste para verificar conexão com banco
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'OK', database: 'Connected' });
  } catch (error) {
    res.status(500).json({ status: 'Error', database: 'Disconnected' });
  }
});

// Rotas da API
app.use('/api/custom-query', customQueryRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 API disponível em http://localhost:${PORT}`);
  console.log(`🔍 Consultas Customizadas: http://localhost:${PORT}/api/custom-query`);
}); 