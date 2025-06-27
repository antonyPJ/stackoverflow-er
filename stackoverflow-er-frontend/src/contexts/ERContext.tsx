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
    }
  };
  
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