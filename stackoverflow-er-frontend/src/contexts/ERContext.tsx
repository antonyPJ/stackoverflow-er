import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Entity, Relationship } from '../types/ERTypes';
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
}

const ERContext = createContext<ERContextType | undefined>(undefined);

export const ERProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [entityData, setEntityData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const value = {
    entities: mockEntities,
    relationships: mockRelationships,
    selectedEntity,
    setSelectedEntity,
    entityData,
    setEntityData,
    isLoading,
    setIsLoading,
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