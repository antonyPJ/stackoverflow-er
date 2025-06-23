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