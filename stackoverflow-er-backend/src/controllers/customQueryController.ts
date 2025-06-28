import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Field {
  table: string;
  name: string;
  displayName: string;
  type: string;
}

interface Join {
  id: string;
  fromTable: string;
  fromField: string;
  toTable: string;
  toField: string;
  type: 'INNER' | 'LEFT' | 'RIGHT';
}

interface Filter {
  id: string;
  field: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN' | 'IS NULL' | 'IS NOT NULL';
  value: string | number | boolean | null;
  logicalOperator?: 'AND' | 'OR';
}

interface QueryBuilder {
  selectedTables: string[];
  selectedFields: Field[];
  joins: Join[];
  filters: Filter[];
  orderBy?: {
    field: string;
    direction: 'ASC' | 'DESC';
  };
  limit?: number;
}

interface QueryResult {
  data: any[];
  columns: string[];
  rowCount: number;
  executionTime?: number;
  sql?: string;
  debug?: any;
}

// Configuração automática baseada no schema Prisma
const SCHEMA_CONFIG: { [key: string]: any } = {
  tables: {
    'users': {
      model: prisma.users,
      fields: ['user_id', 'name', 'reputation', 'link'],
      relations: {
        'questions': { field: 'user_id', targetField: 'user_id' },
        'answers': { field: 'user_id', targetField: 'user_id' },
        'comments': { field: 'user_id', targetField: 'user_id' }
      }
    },
    'questions': {
      model: prisma.questions,
      fields: ['question_id', 'title', 'is_answered', 'answer_count', 'view_count', 'creation_date', 'score', 'user_id'],
      relations: {
        'users': { field: 'user_id', targetField: 'user_id' },
        'answers': { field: 'question_id', targetField: 'question_id' },
        'comments': { field: 'question_id', targetField: 'question_id' },
        'question_tags': { field: 'question_id', targetField: 'question_id' }
      }
    },
    'answers': {
      model: prisma.answers,
      fields: ['answers_id', 'body', 'creation_date', 'score', 'is_accepted', 'user_id', 'question_id'],
      relations: {
        'users': { field: 'user_id', targetField: 'user_id' },
        'questions': { field: 'question_id', targetField: 'question_id' },
        'comments': { field: 'answers_id', targetField: 'answer_id' }
      }
    },
    'comments': {
      model: prisma.comments,
      fields: ['comment_id', 'body', 'creation_date', 'user_id', 'answer_id', 'question_id'],
      relations: {
        'users': { field: 'user_id', targetField: 'user_id' },
        'questions': { field: 'question_id', targetField: 'question_id' },
        'answers': { field: 'answer_id', targetField: 'answers_id' }
      }
    },
    'tags': {
      model: prisma.tags,
      fields: ['tag_id', 'name', 'has_synonyms', 'is_moderator_only', 'is_required', 'count'],
      relations: {
        'question_tags': { field: 'tag_id', targetField: 'tag_id' }
      }
    },
    'question_tags': {
      model: prisma.questionTags,
      fields: ['question_id', 'tag_id'],
      relations: {
        'questions': { field: 'question_id', targetField: 'question_id' },
        'tags': { field: 'tag_id', targetField: 'tag_id' }
      },
      isJunctionTable: true,
      junctionFor: ['questions', 'tags']
    }
  }
};

// Classe para construir queries SQL de forma segura
class SQLQueryBuilder {
  private tables: string[];
  private fields: Field[];
  private filters: Filter[];
  private orderBy?: { field: string; direction: 'ASC' | 'DESC' };
  private limit?: number;
  private joins: string[] = [];
  private whereConditions: string[] = [];
  private parameters: any[] = [];
  private paramIndex = 1;
  private customJoins: Join[] = []; // JOINs definidos pelo frontend

  constructor(queryBuilder: QueryBuilder) {
    this.tables = queryBuilder.selectedTables;
    this.fields = queryBuilder.selectedFields;
    this.filters = queryBuilder.filters || [];
    this.orderBy = queryBuilder.orderBy;
    this.limit = queryBuilder.limit;
    this.customJoins = queryBuilder.joins || [];
  }

  private addParameter(value: any): string {
    this.parameters.push(this.convertValue(value));
    return `$${this.paramIndex++}`;
  }

  private convertValue(value: any): any {
    // Se o valor é uma string que representa um número, converter para número
    if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
      const numValue = Number(value);
      // Se é um número inteiro válido, retornar como número
      if (Number.isInteger(numValue)) {
        return numValue;
      }
    }
    
    // Se é 'true' ou 'false' como string, converter para boolean
    if (value === 'true') return true;
    if (value === 'false') return false;
    
    // Se é 'NULL' como string, converter para null
    if (value === 'NULL') return null;
    
    // Caso contrário, retornar o valor original
    return value;
  }

  private buildWhere(): void {
    this.filters.forEach(filter => {
      const [table, field] = filter.field.split('.');
      const condition = this.buildWhereCondition(table, field, filter);
      if (condition) {
        this.whereConditions.push(condition);
      }
    });
  }

  private buildWhereCondition(table: string, field: string, filter: Filter): string | null {
    const tableConfig = SCHEMA_CONFIG.tables[table];
    if (!tableConfig || !tableConfig.fields.includes(field)) {
      console.warn(`Campo inválido: ${table}.${field}`);
      return null;
    }

    const column = `${table}.${field}`;
    
    // Verificar se é um campo de data
    const isDateField = field.toLowerCase().includes('creation_date') || 
                       field.toLowerCase().includes('date');
    
    switch (filter.operator) {
      case '=':
        if (filter.value === null || filter.value === 'NULL') {
          return `${column} IS NULL`;
        }
        if (isDateField) {
          return `${column} = ${this.addParameter(filter.value)}::date`;
        }
        return `${column} = ${this.addParameter(filter.value)}`;
      
      case '!=':
        if (filter.value === null || filter.value === 'NULL') {
          return `${column} IS NOT NULL`;
        }
        if (isDateField) {
          return `${column} != ${this.addParameter(filter.value)}::date`;
        }
        return `${column} != ${this.addParameter(filter.value)}`;
      
      case '>':
        if (isDateField) {
          return `${column} > ${this.addParameter(filter.value)}::date`;
        }
        return `${column} > ${this.addParameter(filter.value)}`;
      
      case '<':
        if (isDateField) {
          return `${column} < ${this.addParameter(filter.value)}::date`;
        }
        return `${column} < ${this.addParameter(filter.value)}`;
      
      case '>=':
        if (isDateField) {
          return `${column} >= ${this.addParameter(filter.value)}::date`;
        }
        return `${column} >= ${this.addParameter(filter.value)}`;
      
      case '<=':
        if (isDateField) {
          return `${column} <= ${this.addParameter(filter.value)}::date`;
        }
        return `${column} <= ${this.addParameter(filter.value)}`;
      
      case 'LIKE':
        return `${column} LIKE ${this.addParameter(`%${filter.value}%`)}`;
      
      case 'IS NULL':
        return `${column} IS NULL`;
      
      case 'IS NOT NULL':
        return `${column} IS NOT NULL`;
      
      default:
        console.warn(`Operador não suportado: ${filter.operator}`);
        return null;
    }
  }

  private buildSelect(): string {
    const selectFields = this.fields.map(field => {
      const tableConfig = SCHEMA_CONFIG.tables[field.table];
      if (!tableConfig || !tableConfig.fields.includes(field.name)) {
        console.warn(`Campo inválido: ${field.table}.${field.name}`);
        return null;
      }
      return `${field.table}.${field.name} AS "${field.displayName}"`;
    }).filter(Boolean);

    return selectFields.join(', ');
  }

  private buildOrderBy(): string {
    if (!this.orderBy) return '';
    
    const [table, field] = this.orderBy.field.split('.');
    const tableConfig = SCHEMA_CONFIG.tables[table];
    
    if (!tableConfig || !tableConfig.fields.includes(field)) {
      console.warn(`Campo de ordenação inválido: ${table}.${field}`);
      return '';
    }

    return `ORDER BY ${table}.${field} ${this.orderBy.direction}`;
  }

  // Função auxiliar para ordenar JOINs por dependência
  private orderJoinsByDependency(primaryTable: string, joins: Join[]): Join[] {
    /**
     * Ordena os JOINs para garantir que cada JOIN só utilize tabelas já presentes.
     * Se não for possível ordenar todos (ciclo ou dependência quebrada), lança erro.
     */
    const ordered: Join[] = [];
    const pending = [...joins];
    const present = new Set<string>([primaryTable]);
    const failedJoins: Join[] = [];

    while (pending.length > 0) {
      let progress = false;
      for (let i = 0; i < pending.length; i++) {
        const join = pending[i];
        if (present.has(join.fromTable)) {
          ordered.push(join);
          present.add(join.toTable);
          pending.splice(i, 1);
          progress = true;
          break;
        }
      }
      if (!progress) {
        // Se não conseguiu processar nenhum JOIN, coletar os que falharam
        failedJoins.push(...pending);
        break;
      }
    }

    if (failedJoins.length > 0) {
      const failedDetails = failedJoins.map(join => 
        `${join.fromTable} → ${join.toTable} (${join.fromTable} não está disponível)`
      ).join(', ');
      
      const availableTables = Array.from(present).join(', ');
      
      throw new Error(
        `Não foi possível ordenar os seguintes JOINs: ${failedDetails}.\n\n` +
        `Tabelas disponíveis: ${availableTables}\n\n` +
        `Dica: Certifique-se de que cada JOIN conecte tabelas que já estão no FROM ou em JOINs anteriores.\n` +
        `Exemplo de ordem correta: users → questions → answers (cada tabela depende da anterior).`
      );
    }
    
    return ordered;
  }

  // Função para encontrar componentes conectados no grafo de tabelas
  private findConnectedComponents(tables: string[], joins: Join[]): string[][] {
    // Cria grafo de adjacência
    const graph: { [key: string]: Set<string> } = {};
    tables.forEach(t => (graph[t] = new Set()));
    joins.forEach(j => {
      if (graph[j.fromTable] && graph[j.toTable]) {
        graph[j.fromTable].add(j.toTable);
        graph[j.toTable].add(j.fromTable);
      }
    });
    // Busca componentes
    const visited = new Set<string>();
    const components: string[][] = [];
    for (const t of tables) {
      if (!visited.has(t)) {
        const comp: string[] = [];
        const stack = [t];
        while (stack.length) {
          const curr = stack.pop()!;
          if (!visited.has(curr)) {
            visited.add(curr);
            comp.push(curr);
            for (const n of graph[curr]) stack.push(n);
          }
        }
        components.push(comp);
      }
    }
    return components;
  }

  build(): { sql: string; parameters: any[] } {
    this.buildWhere();

    // Determinar tabela principal e garantir que todas as tabelas estejam incluídas
    let primaryTable = this.tables[0];
    let orderedJoins: Join[] = [];

    // Processar JOINs customizados primeiro
    if (this.customJoins && this.customJoins.length > 0) {
      // Determinar tabela principal baseada nos JOINs
      const fromTables = this.customJoins.map(join => join.fromTable);
      const toTables = this.customJoins.map(join => join.toTable);
      
      // Encontrar uma tabela que seja fromTable mas não seja toTable (tabela raiz)
      const rootTable = fromTables.find(table => !toTables.includes(table));
      if (rootTable && this.tables.includes(rootTable)) {
        primaryTable = rootTable;
      } else {
        // Se não encontrou uma tabela raiz clara, usar a primeira tabela que aparece como fromTable
        const firstFromTable = fromTables[0];
        if (firstFromTable && this.tables.includes(firstFromTable)) {
          primaryTable = firstFromTable;
        }
      }
      
      // Detectar componentes conectados
      const components = this.findConnectedComponents(this.tables, this.customJoins);
      if (components.length > 1) {
        throw new Error(
          `As tabelas selecionadas não estão todas conectadas por JOINs.\n\nPara que a consulta funcione, conecte todas as tabelas usando relacionamentos (JOINs).\n\nGrupos de tabelas desconexos encontrados:\n${components.map((c, i) => `  Grupo ${i + 1}: ${c.join(', ')}`).join('\n')}\n\nDica: Use JOINs para criar um "caminho" entre todas as tabelas selecionadas.\nExemplo: users → questions → answers → comments.\n\nSe precisar de ajuda, revise o diagrama entidade-relacionamento do banco!`
        );
      }
      
      // Ordenar os JOINs para garantir dependências corretas
      try {
        orderedJoins = this.orderJoinsByDependency(primaryTable, this.customJoins);
      } catch (err) {
        throw new Error(
          'Erro ao ordenar os JOINs: ' + (err instanceof Error ? err.message : String(err))
        );
      }
    }

    // Garantir que todas as tabelas selecionadas estejam na query
    const allTablesInQuery = new Set([primaryTable]);
    this.joins = [];
    // Adicionar JOINs ordenados
    if (orderedJoins.length > 0) {
      orderedJoins.forEach(join => {
        const joinClause = `${join.type} JOIN ${join.toTable} ON ${join.fromTable}.${join.fromField} = ${join.toTable}.${join.toField}`;
        this.joins.push(joinClause);
        allTablesInQuery.add(join.toTable);
      });
    }

    // Adicionar tabelas que ainda não estão na query
    this.tables.forEach(table => {
      if (!allTablesInQuery.has(table)) {
        // Tentar encontrar uma relação com qualquer tabela já na query
        for (const existingTable of allTablesInQuery) {
          const relation = this.findRelation(existingTable, table) || this.findRelation(table, existingTable);
          if (relation) {
            const joinClause = `LEFT JOIN ${table} ON ${existingTable}.${relation.field} = ${table}.${relation.targetField}`;
            this.joins.push(joinClause);
            allTablesInQuery.add(table);
            break;
          }
        }
      }
    });

    // Verificar se ainda há tabelas não conectadas
    const finalMissingTables = this.tables.filter(table => !allTablesInQuery.has(table));
    if (finalMissingTables.length > 0) {
      console.warn(`Aviso: As seguintes tabelas não puderam ser conectadas: ${finalMissingTables.join(', ')}`);
    }

    const selectClause = this.buildSelect();
    const fromClause = `FROM ${primaryTable}`;
    const joinClause = this.joins.length > 0 ? this.joins.join(' ') : '';
    const whereClause = this.whereConditions.length > 0 ? `WHERE ${this.whereConditions.join(' AND ')}` : '';
    const orderByClause = this.buildOrderBy();
    const limitClause = this.limit ? `LIMIT ${this.limit}` : '';

    const sql = [
      `SELECT ${selectClause}`,
      fromClause,
      joinClause,
      whereClause,
      orderByClause,
      limitClause
    ].filter(Boolean).join(' ');

    return { sql, parameters: this.parameters };
  }

  private findRelation(fromTable: string, toTable: string): any {
    const fromConfig = SCHEMA_CONFIG.tables[fromTable];
    return fromConfig?.relations[toTable];
  }
}

// Função para validar a query antes de executar
function validateQuery(queryBuilder: QueryBuilder): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar tabelas
  if (!queryBuilder.selectedTables || queryBuilder.selectedTables.length === 0) {
    errors.push('Pelo menos uma tabela deve ser selecionada');
  } else {
    const invalidTables = queryBuilder.selectedTables.filter(table => !SCHEMA_CONFIG.tables[table]);
    if (invalidTables.length > 0) {
      errors.push(`Tabelas inválidas: ${invalidTables.join(', ')}`);
    }
  }

  // Validar campos
  if (!queryBuilder.selectedFields || queryBuilder.selectedFields.length === 0) {
    errors.push('Pelo menos um campo deve ser selecionado');
  } else {
    queryBuilder.selectedFields.forEach(field => {
      const tableConfig = SCHEMA_CONFIG.tables[field.table];
      if (!tableConfig) {
        errors.push(`Tabela não encontrada: ${field.table}`);
      } else if (!tableConfig.fields.includes(field.name)) {
        errors.push(`Campo não encontrado: ${field.table}.${field.name}`);
      }
    });
  }

  // Validar filtros
  if (queryBuilder.filters) {
    queryBuilder.filters.forEach(filter => {
      const [table, field] = filter.field.split('.');
      const tableConfig = SCHEMA_CONFIG.tables[table];
      
      if (!tableConfig) {
        errors.push(`Tabela não encontrada no filtro: ${table}`);
      } else if (!tableConfig.fields.includes(field)) {
        errors.push(`Campo não encontrado no filtro: ${table}.${field}`);
      }
    });
  }

  // Validar JOINs
  if (queryBuilder.joins) {
    const joinTables = new Set<string>();
    
    queryBuilder.joins.forEach(join => {
      // Validar tabelas dos JOINs
      if (!SCHEMA_CONFIG.tables[join.fromTable]) {
        errors.push(`Tabela não encontrada no JOIN: ${join.fromTable}`);
      }
      if (!SCHEMA_CONFIG.tables[join.toTable]) {
        errors.push(`Tabela não encontrada no JOIN: ${join.toTable}`);
      }
      
      // Validar campos dos JOINs
      const fromTableConfig = SCHEMA_CONFIG.tables[join.fromTable];
      const toTableConfig = SCHEMA_CONFIG.tables[join.toTable];
      
      if (fromTableConfig && !fromTableConfig.fields.includes(join.fromField)) {
        errors.push(`Campo não encontrado no JOIN: ${join.fromTable}.${join.fromField}`);
      }
      if (toTableConfig && !toTableConfig.fields.includes(join.toField)) {
        errors.push(`Campo não encontrado no JOIN: ${join.toTable}.${join.toField}`);
      }
      
      // Validar tipo de JOIN
      const validJoinTypes = ['INNER', 'LEFT', 'RIGHT'];
      if (!validJoinTypes.includes(join.type)) {
        errors.push(`Tipo de JOIN inválido: ${join.type}. Tipos válidos: ${validJoinTypes.join(', ')}`);
      }
      
      // Coletar tabelas dos JOINs
      joinTables.add(join.fromTable);
      joinTables.add(join.toTable);
    });
    
    // Verificar se todas as tabelas selecionadas estão cobertas pelos JOINs
    const selectedTablesSet = new Set(queryBuilder.selectedTables);
    const missingTables = queryBuilder.selectedTables.filter(table => !joinTables.has(table));
    
    if (missingTables.length > 0) {
      warnings.push(`As seguintes tabelas selecionadas não estão conectadas por JOINs: ${missingTables.join(', ')}. Isso pode causar erros na consulta.`);
    }
  }

  // Validar conectividade das tabelas
  if (queryBuilder.selectedTables && queryBuilder.selectedTables.length > 1) {
    const connectivityCheck = validateTableConnectivity(queryBuilder.selectedTables, queryBuilder.joins || []);
    if (!connectivityCheck.isConnected) {
      errors.push(`Tabelas não conectadas: ${connectivityCheck.disconnectedTables.join(', ')}. Todas as tabelas devem estar conectadas por JOINs.`);
    }
  }

  // Validação educativa para tabelas de junção
  queryBuilder.selectedTables.forEach(table => {
    const tableConfig = SCHEMA_CONFIG.tables[table];
    if (tableConfig && tableConfig.isJunctionTable) {
      const relatedTables = tableConfig.junctionFor || [];
      const missingRelatedTables = relatedTables.filter((relatedTable: string) => 
        !queryBuilder.selectedTables.includes(relatedTable)
      );
      
      if (missingRelatedTables.length > 0) {
        warnings.push(
          `A tabela '${table}' é uma tabela de junção que conecta ${relatedTables.join(' e ')}. ` +
          `Para ver dados úteis, considere selecionar também: ${missingRelatedTables.join(', ')}. ` +
          `Tabelas de junção geralmente não contêm dados significativos sozinhas.`
        );
      }
    }
  });

  return { isValid: errors.length === 0, errors, warnings };
}

// Função para validar se as tabelas estão conectadas
function validateTableConnectivity(selectedTables: string[], joins: Join[]): { isConnected: boolean; disconnectedTables: string[] } {
  if (selectedTables.length <= 1) {
    return { isConnected: true, disconnectedTables: [] };
  }

  // Criar grafo de conectividade
  const graph: { [key: string]: string[] } = {};
  
  // Inicializar grafo
  selectedTables.forEach(table => {
    graph[table] = [];
  });
  
  // Adicionar conexões dos JOINs
  joins.forEach(join => {
    if (selectedTables.includes(join.fromTable) && selectedTables.includes(join.toTable)) {
      graph[join.fromTable].push(join.toTable);
      graph[join.toTable].push(join.fromTable);
    }
  });
  
  // Verificar conectividade usando BFS
  const visited = new Set<string>();
  const queue = [selectedTables[0]];
  visited.add(selectedTables[0]);
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = graph[current] || [];
    
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  
  const disconnectedTables = selectedTables.filter(table => !visited.has(table));
  
  return {
    isConnected: disconnectedTables.length === 0,
    disconnectedTables
  };
}

// Função para encontrar relação entre duas tabelas
function findRelationBetweenTables(table1: string, table2: string): { fromField: string; toField: string } | null {
  const table1Config = SCHEMA_CONFIG.tables[table1];
  const table2Config = SCHEMA_CONFIG.tables[table2];
  
  if (!table1Config || !table2Config) return null;
  
  // Verificar se table1 tem relação com table2
  const relation = table1Config.relations[table2];
  if (relation) {
    return {
      fromField: relation.field,
      toField: relation.targetField
    };
  }
  
  // Verificar se table2 tem relação com table1
  const reverseRelation = table2Config.relations[table1];
  if (reverseRelation) {
    return {
      fromField: reverseRelation.targetField,
      toField: reverseRelation.field
    };
  }
  
  return null;
}

// Função para gerar JOINs automáticos quando necessário (versão original para compatibilidade)
function generateAutomaticJoins(selectedTables: string[]): Join[] {
  if (selectedTables.length <= 1) return [];
  
  const joins: Join[] = [];
  const connectedTables = new Set([selectedTables[0]]);
  
  // Tentar conectar todas as tabelas
  for (let i = 1; i < selectedTables.length; i++) {
    const table = selectedTables[i];
    let connected = false;
    
    // Tentar conectar com qualquer tabela já conectada
    for (const connectedTable of connectedTables) {
      const relation = findRelationBetweenTables(connectedTable, table);
      if (relation) {
        joins.push({
          id: `${connectedTable}-${table}`,
          fromTable: connectedTable,
          fromField: relation.fromField,
          toTable: table,
          toField: relation.toField,
          type: 'LEFT'
        });
        connectedTables.add(table);
        connected = true;
        break;
      }
    }
    
    if (!connected) {
      // Se não conseguiu conectar, tentar o caminho inverso
      for (const connectedTable of connectedTables) {
        const relation = findRelationBetweenTables(table, connectedTable);
        if (relation) {
          joins.push({
            id: `${table}-${connectedTable}`,
            fromTable: table,
            fromField: relation.fromField,
            toTable: connectedTable,
            toField: relation.toField,
            type: 'LEFT'
          });
          connectedTables.add(table);
          connected = true;
          break;
        }
      }
    }
  }
  
  return joins;
}

export const executeCustomQuery = async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    console.log('=== INÍCIO DA CONSULTA CUSTOMIZADA ===');
    console.log('Body recebido:', JSON.stringify(req.body, null, 2));
    
    const queryBuilder: QueryBuilder = req.body;

    // Validação da query
    const validation = validateQuery(queryBuilder);
    if (!validation.isValid) {
      console.log('Erro de validação:', validation.errors);
      return res.status(400).json({ 
        error: 'Query inválida',
        details: validation.errors,
        warnings: validation.warnings
      });
    }

    // Se há warnings, logar mas continuar
    if (validation.warnings.length > 0) {
      console.log('Avisos de validação:', validation.warnings);
    }

    // Gerar JOINs automáticos se necessário
    let finalQueryBuilder = { ...queryBuilder };
    console.log('JOINs originais:', queryBuilder.joins);
    
    if (!queryBuilder.joins || queryBuilder.joins.length === 0) {
      const automaticJoins = generateAutomaticJoins(queryBuilder.selectedTables);
      console.log('JOINs automáticos gerados:', automaticJoins);
      if (automaticJoins.length > 0) {
        finalQueryBuilder.joins = automaticJoins;
      }
    } else {
      // Verificar se todos os JOINs estão corretos
      const connectivityCheck = validateTableConnectivity(queryBuilder.selectedTables, queryBuilder.joins);
      console.log('Verificação de conectividade:', connectivityCheck);
      if (!connectivityCheck.isConnected) {
        // Tentar adicionar JOINs automáticos para conectar as tabelas desconectadas
        const missingJoins = generateAutomaticJoins(connectivityCheck.disconnectedTables);
        console.log('JOINs adicionais para conectar tabelas:', missingJoins);
        if (missingJoins.length > 0) {
          finalQueryBuilder.joins = [...queryBuilder.joins, ...missingJoins];
        }
      }
    }

    console.log('JOINs finais:', finalQueryBuilder.joins);

    // Construir query SQL
    const sqlBuilder = new SQLQueryBuilder(finalQueryBuilder);
    const { sql, parameters } = sqlBuilder.build();

    console.log('SQL gerado:', sql);
    console.log('Parâmetros:', parameters);

    // Executar query
    const result = await prisma.$queryRawUnsafe(sql, ...parameters);
    const executionTime = Date.now() - startTime;

    console.log('Resultado obtido:', Array.isArray(result) ? result.length : 0, 'registros');
    console.log('Tempo de execução:', executionTime, 'ms');

    // Preparar resposta
    const columns = queryBuilder.selectedFields.map(field => field.displayName);
    const response: QueryResult = {
      data: Array.isArray(result) ? result : [],
      columns,
      rowCount: Array.isArray(result) ? result.length : 0,
      executionTime,
      sql,
      debug: {
        tables: queryBuilder.selectedTables,
        fields: queryBuilder.selectedFields,
        filters: queryBuilder.filters,
        joins: finalQueryBuilder.joins,
        parameters,
        warnings: validation.warnings
      }
    };

    console.log('=== FIM DA CONSULTA CUSTOMIZADA ===');
    res.json(response);

  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('Erro ao executar consulta customizada:', error);
    
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      executionTime,
      debug: {
        body: req.body,
        timestamp: new Date().toISOString()
      }
    });
  }
};

// Endpoint de teste para verificar se o controller está funcionando
export const testCustomQuery = async (req: Request, res: Response) => {
  try {
    res.json({ 
      message: 'Custom Query Controller funcionando!',
      availableTables: Object.keys(SCHEMA_CONFIG.tables),
      schemaInfo: SCHEMA_CONFIG,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no teste do controller' });
  }
};

// Endpoint para obter informações do schema
export const getSchemaInfo = async (req: Request, res: Response) => {
  try {
    // Criar uma versão limpa do schema sem os modelos Prisma
    const cleanSchema = {
      tables: Object.keys(SCHEMA_CONFIG.tables).reduce((acc, tableName) => {
        const tableConfig = SCHEMA_CONFIG.tables[tableName];
        acc[tableName] = {
          fields: tableConfig.fields,
          relations: tableConfig.relations,
          isJunctionTable: tableConfig.isJunctionTable || false,
          junctionFor: tableConfig.junctionFor || null
        };
        return acc;
      }, {} as any),
      timestamp: new Date().toISOString()
    };

    res.json(cleanSchema);
  } catch (error) {
    console.error('Erro no endpoint getSchemaInfo:', error);
    res.status(500).json({ 
      error: 'Erro ao obter informações do schema',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

// Endpoint para validar uma query antes da execução
export const validateCustomQuery = async (req: Request, res: Response) => {
  try {
    const queryBuilder: QueryBuilder = req.body;
    
    // Validação da query
    const validation = validateQuery(queryBuilder);
    
    // Gerar JOINs automáticos se necessário
    let suggestedJoins: Join[] = [];
    if (!queryBuilder.joins || queryBuilder.joins.length === 0) {
      suggestedJoins = generateAutomaticJoins(queryBuilder.selectedTables);
    } else {
      const connectivityCheck = validateTableConnectivity(queryBuilder.selectedTables, queryBuilder.joins);
      if (!connectivityCheck.isConnected) {
        suggestedJoins = generateAutomaticJoins(connectivityCheck.disconnectedTables);
      }
    }
    
    res.json({
      isValid: validation.isValid,
      errors: validation.errors,
      warnings: validation.warnings,
      suggestedJoins,
      connectivity: validateTableConnectivity(queryBuilder.selectedTables, queryBuilder.joins || []),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro na validação da query:', error);
    res.status(500).json({ 
      error: 'Erro ao validar query',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

// Endpoint para gerar JOINs automáticos quando uma nova tabela é selecionada
export const generateAutomaticJoinsForTable = async (req: Request, res: Response) => {
  try {
    const { newTable, existingTables, existingJoins } = req.body;
    
    if (!newTable || !existingTables) {
      return res.status(400).json({
        error: 'Parâmetros inválidos',
        details: 'newTable e existingTables são obrigatórios'
      });
    }
    
    // Verificar se a nova tabela existe no schema
    if (!SCHEMA_CONFIG.tables[newTable]) {
      return res.status(400).json({
        error: 'Tabela não encontrada',
        details: `A tabela '${newTable}' não existe no schema`
      });
    }
    
    // Gerar JOINs automáticos
    const automaticJoins = generateAutomaticJoinsForNewTable(newTable, existingTables, existingJoins || []);
    
    // Otimizar JOINs removendo redundâncias
    const allJoins = [...(existingJoins || []), ...automaticJoins];
    const optimizedJoins = optimizeJoins(allJoins);
    
    res.json({
      newJoins: automaticJoins,
      optimizedJoins,
      message: automaticJoins.length > 0 
        ? `JOINs automáticos gerados para conectar '${newTable}' às tabelas existentes`
        : `A tabela '${newTable}' já está conectada ou não há relacionamentos diretos`
    });
    
  } catch (error) {
    console.error('Erro ao gerar JOINs automáticos:', error);
    res.status(500).json({ 
      error: 'Erro ao gerar JOINs automáticos',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

// Função para gerar JOINs automáticos quando uma nova tabela é selecionada
function generateAutomaticJoinsForNewTable(newTable: string, existingTables: string[], existingJoins: Join[]): Join[] {
  const newJoins: Join[] = [];
  
  // Se é a primeira tabela, não precisa de JOINs
  if (existingTables.length === 0) {
    return newJoins;
  }
  
  // Verificar se a nova tabela já está conectada via JOINs existentes
  const connectedTables = new Set<string>();
  existingJoins.forEach(join => {
    connectedTables.add(join.fromTable);
    connectedTables.add(join.toTable);
  });
  
  // Se a nova tabela já está conectada, não precisa de JOINs adicionais
  if (connectedTables.has(newTable)) {
    return newJoins;
  }
  
  // Tentar conectar a nova tabela com as tabelas existentes
  for (const existingTable of existingTables) {
    // Verificar se já existe um JOIN entre essas tabelas
    const existingJoin = existingJoins.find(join => 
      (join.fromTable === existingTable && join.toTable === newTable) ||
      (join.fromTable === newTable && join.toTable === existingTable)
    );
    
    if (existingJoin) {
      continue; // JOIN já existe
    }
    
    // Tentar encontrar uma relação direta
    const relation = findRelationBetweenTables(existingTable, newTable);
    if (relation) {
      newJoins.push({
        id: `${existingTable}-${newTable}`,
        fromTable: existingTable,
        fromField: relation.fromField,
        toTable: newTable,
        toField: relation.toField,
        type: 'LEFT'
      });
      break; // Uma conexão é suficiente
    }
  }
  
  // Se não encontrou relação direta, tentar encontrar caminho através de tabelas intermediárias
  if (newJoins.length === 0) {
    const allTables = Object.keys(SCHEMA_CONFIG.tables);
    for (const existingTable of existingTables) {
      const path = findPathBetweenTables(existingTable, newTable, allTables);
      if (path && path.length > 0) {
        // Gerar JOINs para o caminho encontrado
        for (let i = 0; i < path.length - 1; i++) {
          const currentTable = path[i];
          const nextTable = path[i + 1];
          
          // Verificar se já existe um JOIN entre essas tabelas
          const existingJoin = existingJoins.find(join => 
            (join.fromTable === currentTable && join.toTable === nextTable) ||
            (join.fromTable === nextTable && join.toTable === currentTable)
          );
          
          if (!existingJoin) {
            const relation = findRelationBetweenTables(currentTable, nextTable);
            if (relation) {
              newJoins.push({
                id: `${currentTable}-${nextTable}`,
                fromTable: currentTable,
                fromField: relation.fromField,
                toTable: nextTable,
                toField: relation.toField,
                type: 'LEFT'
              });
            }
          }
        }
        break; // Um caminho é suficiente
      }
    }
  }
  
  return newJoins;
}

// Função para encontrar caminho entre duas tabelas através de tabelas intermediárias
function findPathBetweenTables(fromTable: string, toTable: string, availableTables: string[]): string[] | null {
  // Usar BFS para encontrar o caminho mais curto
  const visited = new Set<string>();
  const queue: { table: string; path: string[] }[] = [{ table: fromTable, path: [fromTable] }];
  visited.add(fromTable);
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    if (current.table === toTable) {
      return current.path;
    }
    
    // Verificar todas as tabelas disponíveis que podem se conectar
    for (const table of availableTables) {
      if (!visited.has(table)) {
        const relation = findRelationBetweenTables(current.table, table);
        if (relation) {
          visited.add(table);
          queue.push({
            table,
            path: [...current.path, table]
          });
        }
      }
    }
  }
  
  return null; // Não encontrou caminho
}

// Função para otimizar JOINs removendo redundâncias
function optimizeJoins(joins: Join[]): Join[] {
  const optimized: Join[] = [];
  const connections = new Map<string, Set<string>>();
  
  // Construir mapa de conexões
  joins.forEach(join => {
    if (!connections.has(join.fromTable)) {
      connections.set(join.fromTable, new Set());
    }
    if (!connections.has(join.toTable)) {
      connections.set(join.toTable, new Set());
    }
    connections.get(join.fromTable)!.add(join.toTable);
    connections.get(join.toTable)!.add(join.fromTable);
  });
  
  // Verificar se há caminhos redundantes
  joins.forEach(join => {
    // Verificar se já existe um caminho alternativo entre fromTable e toTable
    const hasAlternativePath = checkAlternativePath(join.fromTable, join.toTable, connections, join);
    
    if (!hasAlternativePath) {
      optimized.push(join);
    }
  });
  
  return optimized;
}

// Função auxiliar para verificar se existe caminho alternativo
function checkAlternativePath(from: string, to: string, connections: Map<string, Set<string>>, excludeJoin: Join): boolean {
  const visited = new Set<string>();
  const queue = [from];
  visited.add(from);
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = connections.get(current) || new Set();
    
    for (const neighbor of neighbors) {
      // Pular o JOIN que estamos verificando
      if ((current === excludeJoin.fromTable && neighbor === excludeJoin.toTable) ||
          (current === excludeJoin.toTable && neighbor === excludeJoin.fromTable)) {
        continue;
      }
      
      if (neighbor === to) {
        return true; // Encontrou caminho alternativo
      }
      
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  
  return false;
} 