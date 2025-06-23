import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

export const getStats = async (req: Request, res: Response) => {
  try {
    const usersCount = await prisma.users.count();
    const questionsCount = await prisma.questions.count();
    const answersCount = await prisma.answers.count();
    const commentsCount = await prisma.comments.count();
    res.json({ users: usersCount, questions: questionsCount, answers: answersCount, comments: commentsCount });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}; 