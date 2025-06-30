import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import customQueryRoutes from './routes/customQueryRoutes';

const app = express();
export const prisma = new PrismaClient();
const PORT = process.env.PORT || 3002;

// Função para verificar se há dados e popular automaticamente
async function checkAndPopulateData() {
  try {
    console.log('🔍 Verificando dados na tabela question_tags...');
    
    // Verificar apenas se há dados na tabela question_tags
    const questionTagsCount = await prisma.questionTags.count();
    
    console.log(`📊 Status dos dados:`);
    console.log(`  - QuestionTags: ${questionTagsCount}`);
    
    // Se não há dados na tabela question_tags, executar script de população
    if (questionTagsCount === 0) {
      console.log('⚠️  Tabela question_tags vazia. Executando script de população...');
      
      // Importar e executar o script de população
      const { execSync } = require('child_process');
      const path = require('path');
      
      try {
        const scriptPath = path.join(__dirname, '..', 'scripts', 'populate-question-tags.js');
        console.log(`📜 Executando script: ${scriptPath}`);
        
        execSync(`node ${scriptPath}`, { 
          stdio: 'inherit',
          cwd: path.join(__dirname, '..')
        });
        
        console.log('✅ Script de população executado com sucesso!');
      } catch (scriptError) {
        console.error('❌ Erro ao executar script de população:', scriptError instanceof Error ? scriptError.message : String(scriptError));
        console.log('💡 Você pode executar manualmente: npm run populate');
      }
    } else {
      console.log('✅ Dados encontrados na tabela question_tags. Nenhuma população necessária.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar dados:', error);
  }
}

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

// Rota para verificar status dos dados
app.get('/api/data-status', async (req, res) => {
  try {
    const questionsCount = await prisma.questions.count();
    const usersCount = await prisma.users.count();
    const answersCount = await prisma.answers.count();
    const tagsCount = await prisma.tags.count();
    const questionTagsCount = await prisma.questionTags.count();
    
    res.json({
      status: 'OK',
      data: {
        questions: questionsCount,
        users: usersCount,
        answers: answersCount,
        tags: tagsCount,
        questionTags: questionTagsCount
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'Error', message: error instanceof Error ? error.message : String(error) });
  }
});

// Rotas da API
app.use('/api/custom-query', customQueryRoutes);

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 API disponível em http://localhost:${PORT}`);
  console.log(`🔍 Consultas Customizadas: http://localhost:${PORT}/api/custom-query`);
  
  // Verificar e popular dados automaticamente
  await checkAndPopulateData();
}); 