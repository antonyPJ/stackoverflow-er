import { Request, Response } from 'express';
import { prisma } from '../server';

export const getQuestions = async (req: Request, res: Response) => {
  try {
    const questions = await prisma.questions.findMany({
      take: 10,
      orderBy: {
        creation_date: 'desc'
      },
      include: {
        user: {
          select: {
            user_id: true,
            name: true
          }
        },
        answers: {
          include: {
            user: {
              select: {
                user_id: true,
                name: true
              }
            }
          }
        }
      }
    });
    
    res.json(questions);
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getQuestionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const question = await prisma.questions.findUnique({
      where: { question_id: parseInt(id) },
      include: {
        user: {
          select: {
            user_id: true,
            name: true,
            reputation: true
          }
        },
        answers: {
          include: {
            user: {
              select: {
                user_id: true,
                name: true,
                reputation: true
              }
            }
          }
        },
        question_tags: {
          include: {
            tag: true
          }
        }
      }
    });
    
    if (!question) {
      return res.status(404).json({ error: 'Pergunta não encontrada' });
    }
    
    res.json(question);
  } catch (error) {
    console.error('Erro ao buscar pergunta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getQuestionsStats = async (req: Request, res: Response) => {
  try {
    const totalQuestions = await prisma.questions.count();
    const questionsWithAnswers = await prisma.questions.count({
      where: {
        answers: {
          some: {}
        }
      }
    });
    
    const recentQuestions = await prisma.questions.findMany({
      take: 5,
      orderBy: {
        creation_date: 'desc'
      },
      select: {
        question_id: true,
        title: true,
        creation_date: true,
        user: {
          select: {
            name: true
          }
        }
      }
    });
    
    res.json({
      totalQuestions,
      questionsWithAnswers,
      recentQuestions
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}; 