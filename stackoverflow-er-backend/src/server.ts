import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import usersRoutes from './routes/usersRoutes';
import questionsRoutes from './routes/questionsRoutes';
import answersRoutes from './routes/answersRoutes';
import statsRoutes from './routes/statsRoutes';

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
app.use('/api/users', usersRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/answers', answersRoutes);
app.use('/api/stats', statsRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 API disponível em http://localhost:${PORT}`);
  console.log(`👥 Usuários: http://localhost:${PORT}/api/users`);
  console.log(`❓ Perguntas: http://localhost:${PORT}/api/questions`);
  console.log(`💬 Respostas: http://localhost:${PORT}/api/answers`);
  console.log(`📈 Estatísticas: http://localhost:${PORT}/api/stats`);
}); 