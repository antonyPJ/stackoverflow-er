import axios from 'axios';
import { QueryBuilder, QueryResult } from '../types/ERTypes';

// Configuração base da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

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
    console.log('Enviando consulta para o backend:', JSON.stringify(queryBuilder, null, 2));
    
    const response = await apiClient.post('/api/custom-query/execute', queryBuilder);
    console.log('Resposta do backend:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao executar consulta customizada:', error);
    
    // Log detalhado do erro
    if (error.response) {
      console.error('Status do erro:', error.response.status);
      console.error('Dados do erro:', error.response.data);
    }
    
    // Para demonstração, retornar dados mock se o endpoint não estiver disponível
    return getMockQueryResult(queryBuilder);
  }
};

/**
 * Valida uma consulta antes da execução
 * @param queryBuilder - Objeto com a consulta montada
 * @returns Promise com os resultados da validação
 */
export const validateCustomQuery = async (queryBuilder: QueryBuilder): Promise<{
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestedJoins: any[];
  connectivity: { isConnected: boolean; disconnectedTables: string[] };
}> => {
  try {
    console.log('Validando consulta:', JSON.stringify(queryBuilder, null, 2));
    
    const response = await apiClient.post('/api/custom-query/validate', queryBuilder);
    console.log('Resposta da validação:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao validar consulta:', error);
    
    // Log detalhado do erro
    if (error.response) {
      console.error('Status do erro:', error.response.status);
      console.error('Dados do erro:', error.response.data);
    }
    
    // Retornar erro de validação mock
    return {
      isValid: false,
      errors: ['Erro de conexão com o servidor'],
      warnings: [],
      suggestedJoins: [],
      connectivity: { isConnected: false, disconnectedTables: [] }
    };
  }
};

/**
 * Gera JOINs automáticos quando uma nova tabela é selecionada
 * @param newTable - Nova tabela selecionada
 * @param existingTables - Tabelas já selecionadas
 * @param existingJoins - JOINs já existentes
 * @returns Promise com os JOINs automáticos gerados
 */
export const generateAutomaticJoins = async (
  newTable: string, 
  existingTables: string[], 
  existingJoins: any[] = []
): Promise<{
  newJoins: any[];
  optimizedJoins: any[];
  message: string;
}> => {
  try {
    console.log('Gerando JOINs automáticos para:', newTable);
    
    const response = await apiClient.post('/api/custom-query/auto-joins', {
      newTable,
      existingTables,
      existingJoins
    });
    
    console.log('JOINs automáticos gerados:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao gerar JOINs automáticos:', error);
    
    if (error.response) {
      console.error('Status do erro:', error.response.status);
      console.error('Dados do erro:', error.response.data);
    }
    
    // Retornar resposta de erro
    return {
      newJoins: [],
      optimizedJoins: existingJoins,
      message: 'Erro ao gerar JOINs automáticos'
    };
  }
};

/**
 * Dados mock para demonstração quando a API não estiver disponível
 */
const getMockDataForEndpoint = (endpoint: string): any => {
  const mockData: { [key: string]: any } = {
    '/api/users': [
      { user_id: 1, name: 'john_doe', reputation: 1250, created_at: '2023-01-15' },
      { user_id: 2, name: 'jane_smith', reputation: 890, created_at: '2023-02-20' },
    ],
    '/api/questions': [
      { question_id: 1, user_id: 1, views: 150, score: 5, title: 'Como usar React Hooks?' },
      { question_id: 2, user_id: 2, views: 89, score: 3, title: 'TypeScript vs JavaScript' },
    ],
    '/api/answers': [
      { answers_id: 1, question_id: 1, user_id: 2, is_accepted: true, score: 8 },
      { answers_id: 2, question_id: 1, user_id: 1, is_accepted: false, score: 2 },
    ],
    '/api/tags': [
      { tag_id: 1, name: 'react', description: 'React JavaScript library', usage_count: 1250 },
      { tag_id: 2, name: 'typescript', description: 'TypeScript programming language', usage_count: 890 },
    ],
    '/api/question_tags': [
      { question_id: 1, tag_id: 1 },
      { question_id: 1, tag_id: 2 },
      { question_id: 2, tag_id: 2 },
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