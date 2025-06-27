import axios from 'axios';
import { QueryBuilder, QueryResult } from '../types/ERTypes';

// Configuração base da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para tratamento de erros
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Busca dados de uma entidade específica
 * @param endpoint - Endpoint da API para a entidade
 * @returns Promise com os dados da entidade
 */
export const fetchEntityData = async (endpoint: string): Promise<any> => {
  try {
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    // Para demonstração, retornar dados mock se a API não estiver disponível
    return getMockDataForEndpoint(endpoint);
  }
};

/**
 * Executa uma consulta dinâmica
 * @param queryBuilder - Objeto com a consulta montada
 * @returns Promise com os resultados da consulta
 */
export const executeCustomQuery = async (queryBuilder: QueryBuilder): Promise<QueryResult> => {
  try {
    const response = await apiClient.post('/api/custom-query', queryBuilder);
    return response.data;
  } catch (error) {
    console.error('Erro ao executar consulta customizada:', error);
    
    // Para demonstração, retornar dados mock se o endpoint não estiver disponível
    return getMockQueryResult(queryBuilder);
  }
};

/**
 * Dados mock para demonstração quando a API não estiver disponível
 */
const getMockDataForEndpoint = (endpoint: string): any => {
  const mockData: { [key: string]: any } = {
    '/api/users': [
      { id: 1, username: 'john_doe', email: 'john@example.com', reputation: 1250, created_at: '2023-01-15' },
      { id: 2, username: 'jane_smith', email: 'jane@example.com', reputation: 890, created_at: '2023-02-20' },
    ],
    '/api/questions': [
      { id: 1, user_id: 1, views: 150, score: 5, title: 'Como usar React Hooks?' },
      { id: 2, user_id: 2, views: 89, score: 3, title: 'TypeScript vs JavaScript' },
    ],
    '/api/answers': [
      { id: 1, question_id: 1, user_id: 2, is_accepted: true, score: 8 },
      { id: 2, question_id: 1, user_id: 1, is_accepted: false, score: 2 },
    ],
    '/api/tags': [
      { id: 1, name: 'react', description: 'React JavaScript library', usage_count: 1250 },
      { id: 2, name: 'typescript', description: 'TypeScript programming language', usage_count: 890 },
    ],
  };

  return mockData[endpoint] || { message: 'Dados não encontrados para este endpoint' };
};

/**
 * Resultado mock para consultas dinâmicas
 */
const getMockQueryResult = (queryBuilder: QueryBuilder): QueryResult => {
  const columns = queryBuilder.selectedFields.map(field => field.name);
  
  // Gerar dados mock baseados nas tabelas selecionadas
  const mockData = [];
  
  if (queryBuilder.selectedTables.includes('users') && queryBuilder.selectedTables.includes('questions')) {
    mockData.push(
      { id: 1, name: 'João Silva', title: 'Como usar React Hooks?', score: 5 },
      { id: 2, name: 'Maria Santos', title: 'TypeScript vs JavaScript', score: 3 },
      { id: 3, name: 'Pedro Costa', title: 'Node.js performance tips', score: 7 }
    );
  } else if (queryBuilder.selectedTables.includes('users')) {
    mockData.push(
      { id: 1, name: 'João Silva', reputation: 1250 },
      { id: 2, name: 'Maria Santos', reputation: 890 },
      { id: 3, name: 'Pedro Costa', reputation: 2100 }
    );
  } else if (queryBuilder.selectedTables.includes('questions')) {
    mockData.push(
      { id: 1, title: 'Como usar React Hooks?', score: 5, views: 150 },
      { id: 2, title: 'TypeScript vs JavaScript', score: 3, views: 89 },
      { id: 3, title: 'Node.js performance tips', score: 7, views: 234 }
    );
  } else {
    // Dados genéricos
    mockData.push(
      { id: 1, name: 'Item 1', value: 100 },
      { id: 2, name: 'Item 2', value: 200 },
      { id: 3, name: 'Item 3', value: 300 }
    );
  }

  return {
    data: mockData,
    columns,
    rowCount: mockData.length,
    executionTime: 0.15
  };
};

export default apiClient;