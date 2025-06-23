import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

export const getAnswers = async (req: Request, res: Response) => {
  try {
    const answers = await prisma.answers.findMany({
      take: 10,
      orderBy: {
        creation_date: 'desc'
      }
    });
    res.json(answers);
  } catch (error) {
    console.error('Erro ao buscar respostas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}; 