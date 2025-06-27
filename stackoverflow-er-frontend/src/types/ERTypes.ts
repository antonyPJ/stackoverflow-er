export interface Attribute {
  name: string;
  type: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  isRequired?: boolean;
}

export interface Entity {
  id: string;
  name: string;
  displayName: string;
  attributes: Attribute[];
  position: { x: number; y: number };
  color: string;
  apiEndpoint?: string;
}

export interface Relationship {
  id: string;
  fromEntity: string;
  toEntity: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  label: string;
  fromCardinality: string;
  toCardinality: string;
}

export interface EntityData {
  [key: string]: any;
}

// Novos tipos para consultas dinâmicas
export interface Field {
  table: string;
  name: string;
  displayName: string;
  type: string;
}

export interface Join {
  id: string;
  fromTable: string;
  fromField: string;
  toTable: string;
  toField: string;
  type: 'INNER' | 'LEFT' | 'RIGHT';
}

export interface Filter {
  id: string;
  field: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN' | 'IS NULL' | 'IS NOT NULL';
  value: string | number | boolean | null;
  logicalOperator?: 'AND' | 'OR';
}

export interface QueryBuilder {
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

export interface QueryResult {
  data: any[];
  columns: string[];
  rowCount: number;
  executionTime?: number;
}

export interface QueryHistory {
  id: string;
  name: string;
  query: QueryBuilder;
  timestamp: Date;
  result?: QueryResult;
}