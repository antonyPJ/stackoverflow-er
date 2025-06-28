import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Entity, Relationship, QueryBuilder, QueryResult, Field, Join, Filter } from '../types/ERTypes';
import { mockEntities, mockRelationships } from '../data/mockData';

interface ERContextType {
  entities: Entity[];
  relationships: Relationship[];
  selectedEntity: Entity | null;
  setSelectedEntity: (entity: Entity | null) => void;
  entityData: any;
  setEntityData: (data: any) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Novos estados para consultas dinâmicas
  queryBuilder: QueryBuilder;
  setQueryBuilder: (query: QueryBuilder) => void;
  selectedTables: string[];
  setSelectedTables: (tables: string[]) => void;
  selectedFields: Field[];
  setSelectedFields: (fields: Field[]) => void;
  joins: Join[];
  setJoins: (joins: Join[]) => void;
  filters: Filter[];
  setFilters: (filters: Filter[]) => void;
  queryResult: QueryResult | null;
  setQueryResult: (result: QueryResult | null) => void;
  isQueryLoading: boolean;
  setIsQueryLoading: (loading: boolean) => void;
  
  // Funções auxiliares
  addTable: (tableName: string) => void;
  removeTable: (tableName: string) => void;
  addField: (field: Field) => void;
  removeField: (fieldId: string) => void;
  addJoin: (join: Join) => void;
  removeJoin: (joinId: string) => void;
  addFilter: (filter: Filter) => void;
  removeFilter: (filterId: string) => void;
  clearQuery: () => void;
}

const ERContext = createContext<ERContextType | undefined>(undefined);

export const ERProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [entityData, setEntityData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para consultas dinâmicas
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<Field[]>([]);
  const [joins, setJoins] = useState<Join[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  
  // QueryBuilder consolidado
  const queryBuilder: QueryBuilder = {
    selectedTables,
    selectedFields,
    joins,
    filters,
  };
  
  const setQueryBuilder = (query: QueryBuilder) => {
    setSelectedTables(query.selectedTables);
    setSelectedFields(query.selectedFields);
    setJoins(query.joins);
    setFilters(query.filters);
  };
  
  // Funções auxiliares
  const addTable = (tableName: string) => {
    if (!selectedTables.includes(tableName)) {
      setSelectedTables([...selectedTables, tableName]);
      // Adicionar JOIN automaticamente se houver relação
      if (selectedTables.length > 0) {
        // Procurar relação entre a nova tabela e as já selecionadas
        for (const existingTable of selectedTables) {
          const rel = mockRelationships.find(r =>
            (r.fromEntity.toLowerCase() === existingTable.toLowerCase() && r.toEntity.toLowerCase() === tableName.toLowerCase()) ||
            (r.toEntity.toLowerCase() === existingTable.toLowerCase() && r.fromEntity.toLowerCase() === tableName.toLowerCase())
          );
          if (rel) {
            // Criar JOIN baseado na relação real entre as tabelas
            const join = createJoinFromRelationship(rel, existingTable, tableName);
            if (join && !joins.find(j => j.id === join.id)) {
              setJoins([...joins, join]);
            }
            break;
          }
        }
      }
    }
  };
  
  // Função para criar JOIN baseado na relação real
  function createJoinFromRelationship(rel: Relationship, table1: string, table2: string): Join | null {
    // Mapeamento de campos para JOINs baseado nas relações reais
    const joinMappings: { [key: string]: { [key: string]: { fromField: string; toField: string } } } = {
      'questions': {
        'answers': { fromField: 'question_id', toField: 'question_id' },
        'users': { fromField: 'user_id', toField: 'user_id' },
        'comments': { fromField: 'question_id', toField: 'question_id' },
        'question_tags': { fromField: 'question_id', toField: 'question_id' }
      },
      'answers': {
        'questions': { fromField: 'question_id', toField: 'question_id' },
        'users': { fromField: 'user_id', toField: 'user_id' },
        'comments': { fromField: 'answers_id', toField: 'answer_id' }
      },
      'users': {
        'questions': { fromField: 'user_id', toField: 'user_id' },
        'answers': { fromField: 'user_id', toField: 'user_id' },
        'comments': { fromField: 'user_id', toField: 'user_id' }
      },
      'comments': {
        'questions': { fromField: 'question_id', toField: 'question_id' },
        'answers': { fromField: 'answer_id', toField: 'answers_id' },
        'users': { fromField: 'user_id', toField: 'user_id' }
      },
      'tags': {
        'question_tags': { fromField: 'tag_id', toField: 'tag_id' }
      },
      'question_tags': {
        'questions': { fromField: 'question_id', toField: 'question_id' },
        'tags': { fromField: 'tag_id', toField: 'tag_id' }
      }
    };

    // Determinar qual tabela é a origem e qual é o destino
    let fromTable: string, toTable: string;
    if (rel.fromEntity.toLowerCase() === table1.toLowerCase()) {
      fromTable = table1;
      toTable = table2;
    } else if (rel.toEntity.toLowerCase() === table1.toLowerCase()) {
      fromTable = table2;
      toTable = table1;
    } else {
      // Se não conseguir determinar, usar a primeira tabela como origem
      fromTable = table1;
      toTable = table2;
    }

    // Buscar o mapeamento de campos
    const mapping = joinMappings[fromTable.toLowerCase()]?.[toTable.toLowerCase()];
    if (!mapping) {
      // Tentar o mapeamento reverso
      const reverseMapping = joinMappings[toTable.toLowerCase()]?.[fromTable.toLowerCase()];
      if (reverseMapping) {
        return {
          id: `${fromTable.toLowerCase()}-${toTable.toLowerCase()}`,
          fromTable: fromTable.toLowerCase(),
          toTable: toTable.toLowerCase(),
          fromField: reverseMapping.toField,
          toField: reverseMapping.fromField,
          type: 'LEFT',
        };
      }
      return null;
    }

    return {
      id: `${fromTable.toLowerCase()}-${toTable.toLowerCase()}`,
      fromTable: fromTable.toLowerCase(),
      toTable: toTable.toLowerCase(),
      fromField: mapping.fromField,
      toField: mapping.toField,
      type: 'LEFT',
    };
  }
  
  // Função auxiliar para pegar a PK da entidade
  function getFirstPK(entityName: string): string {
    const entity = mockEntities.find(e => e.name.toLowerCase() === entityName.toLowerCase());
    if (!entity) return 'id';
    const pk = entity.attributes.find(attr => attr.isPrimaryKey);
    return pk ? pk.name : 'id';
  }
  
  const removeTable = (tableName: string) => {
    setSelectedTables(selectedTables.filter(t => t !== tableName));
    // Remove campos e joins relacionados
    setSelectedFields(selectedFields.filter(f => f.table !== tableName));
    setJoins(joins.filter(j => j.fromTable !== tableName && j.toTable !== tableName));
  };
  
  const addField = (field: Field) => {
    if (!selectedFields.find(f => f.table === field.table && f.name === field.name)) {
      setSelectedFields([...selectedFields, field]);
    }
  };
  
  const removeField = (fieldId: string) => {
    setSelectedFields(selectedFields.filter(f => `${f.table}.${f.name}` !== fieldId));
  };
  
  const addJoin = (join: Join) => {
    if (!joins.find(j => j.id === join.id)) {
      setJoins([...joins, join]);
    }
  };
  
  const removeJoin = (joinId: string) => {
    setJoins(joins.filter(j => j.id !== joinId));
  };
  
  const addFilter = (filter: Filter) => {
    if (!filters.find(f => f.id === filter.id)) {
      setFilters([...filters, filter]);
    }
  };
  
  const removeFilter = (filterId: string) => {
    setFilters(filters.filter(f => f.id !== filterId));
  };
  
  const clearQuery = () => {
    setSelectedTables([]);
    setSelectedFields([]);
    setJoins([]);
    setFilters([]);
    setQueryResult(null);
  };

  const value = {
    entities: mockEntities,
    relationships: mockRelationships,
    selectedEntity,
    setSelectedEntity,
    entityData,
    setEntityData,
    isLoading,
    setIsLoading,
    
    // Consultas dinâmicas
    queryBuilder,
    setQueryBuilder,
    selectedTables,
    setSelectedTables,
    selectedFields,
    setSelectedFields,
    joins,
    setJoins,
    filters,
    setFilters,
    queryResult,
    setQueryResult,
    isQueryLoading,
    setIsQueryLoading,
    
    // Funções auxiliares
    addTable,
    removeTable,
    addField,
    removeField,
    addJoin,
    removeJoin,
    addFilter,
    removeFilter,
    clearQuery,
  };

  return <ERContext.Provider value={value}>{children}</ERContext.Provider>;
};

export const useER = () => {
  const context = useContext(ERContext);
  if (context === undefined) {
    throw new Error('useER must be used within an ERProvider');
  }
  return context;
};