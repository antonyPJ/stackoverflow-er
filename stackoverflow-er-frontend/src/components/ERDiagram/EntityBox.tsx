import React from 'react';
import styled from 'styled-components';
import { Entity } from '../../types/ERTypes';
import { useER } from '../../contexts/ERContext';

interface EntityBoxProps {
  entity: Entity;
}

const EntityContainer = styled.div<{ color: string; isSelected: boolean; isQuerySelected: boolean }>`
  position: absolute;
  background-color: ${props => props.color};
  border: 3px solid ${props => {
    if (props.isQuerySelected) return '#4CAF50';
    if (props.isSelected) return '#FFD700';
    return 'transparent';
  }};
  border-radius: 8px;
  min-width: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    border-color: ${props => props.isQuerySelected ? '#4CAF50' : '#FFD700'};
  }
`;

const EntityHeader = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  padding: 12px;
  text-align: center;
  font-weight: bold;
  font-size: 16px;
  color: white;
  border-radius: 5px 5px 0 0;
  position: relative;
`;

const SelectionIndicator = styled.div<{ isQuerySelected: boolean }>`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  background-color: ${props => props.isQuerySelected ? '#4CAF50' : 'transparent'};
  border: 2px solid ${props => props.isQuerySelected ? '#4CAF50' : '#fff'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: white;
`;

const AttributesList = styled.div`
  padding: 8px;
`;

const AttributeItem = styled.div<{ isPrimaryKey?: boolean; isForeignKey?: boolean }>`
  padding: 4px 8px;
  font-size: 12px;
  color: white;
  background-color: ${props => 
    props.isPrimaryKey ? 'rgba(255, 215, 0, 0.2)' : 
    props.isForeignKey ? 'rgba(255, 165, 0, 0.2)' : 
    'transparent'
  };
  border-left: 3px solid ${props => 
    props.isPrimaryKey ? '#FFD700' : 
    props.isForeignKey ? '#FFA500' : 
    'transparent'
  };
  margin: 2px 0;
  border-radius: 2px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const AttributeName = styled.span`
  font-weight: ${props => props.color === 'primary' ? 'bold' : 'normal'};
`;

const AttributeType = styled.span`
  color: #ccc;
  font-size: 10px;
  margin-left: 8px;
`;

const EntityBox: React.FC<EntityBoxProps> = ({ entity }) => {
  const { 
    selectedEntity, 
    setSelectedEntity, 
    selectedTables, 
    addTable, 
    removeTable 
  } = useER();
  
  const isSelected = selectedEntity?.id === entity.id;
  const isQuerySelected = selectedTables.includes(entity.name);

  const handleClick = (e: React.MouseEvent) => {
    // Se Ctrl/Cmd estiver pressionado, adiciona/remove da seleção de consulta
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (isQuerySelected) {
        removeTable(entity.name);
      } else {
        addTable(entity.name);
      }
    } else {
      // Clique normal seleciona a entidade para detalhes
      setSelectedEntity(entity);
    }
  };

  return (
    <EntityContainer
      color={entity.color}
      isSelected={isSelected}
      isQuerySelected={isQuerySelected}
      style={{
        left: entity.position.x,
        top: entity.position.y,
      }}
      onClick={handleClick}
    >
      <EntityHeader>
        {entity.name}
        <SelectionIndicator isQuerySelected={isQuerySelected}>
          {isQuerySelected && '✓'}
        </SelectionIndicator>
      </EntityHeader>
      <AttributesList>
        {entity.attributes.map((attribute, index) => (
          <AttributeItem
            key={index}
            isPrimaryKey={attribute.isPrimaryKey}
            isForeignKey={attribute.isForeignKey}
          >
            <AttributeName>
              {attribute.isPrimaryKey && '🔑 '}
              {attribute.isForeignKey && '🔗 '}
              {attribute.name}
              {attribute.isRequired && ' *'}
            </AttributeName>
            <AttributeType>{attribute.type}</AttributeType>
          </AttributeItem>
        ))}
      </AttributesList>
    </EntityContainer>
  );
};

export default EntityBox;