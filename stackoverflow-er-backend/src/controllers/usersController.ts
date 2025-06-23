import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.users.findMany({
      take: 10, // Limitar a 10 usuários para demonstração
      orderBy: {
        reputation: 'desc'
      }
    });
    
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.users.findUnique({
      where: { user_id: parseInt(id) },
      include: {
        questions: true,
        answers: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getUsersStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.users.count();
    const topUsers = await prisma.users.findMany({
      take: 5,
      orderBy: {
        reputation: 'desc'
      },
      select: {
        user_id: true,
        name: true,
        reputation: true
      }
    });
    
    res.json({
      totalUsers,
      topUsers
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}; 