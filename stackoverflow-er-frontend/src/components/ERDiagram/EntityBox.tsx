import React from 'react';
import styled from 'styled-components';
import { Entity } from '../../types/ERTypes';
import { useER } from '../../contexts/ERContext';

interface EntityBoxProps {
  entity: Entity;
}

const EntityContainer = styled.div<{ color: string; isSelected: boolean }>`
  position: absolute;
  background-color: ${props => props.color};
  border: 3

px solid ${props => props.isSelected ? '#FFD700' : 'transparent'};
  border-radius: 8px;
  min-width: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    border-color: #FFD700;
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
  const { selectedEntity, setSelectedEntity } = useER();
  const isSelected = selectedEntity?.id === entity.id;

  const handleClick = () => {
    setSelectedEntity(entity);
  };

  return (
    <EntityContainer
      color={entity.color}
      isSelected={isSelected}
      style={{
        left: entity.position.x,
        top: entity.position.y,
      }}
      onClick={handleClick}
    >
      <EntityHeader>{entity.name}</EntityHeader>
      <AttributesList>
        {entity.attributes.map((attribute, index) => (
          <AttributeItem
            key={index}
            isPrimaryKey={attribute.isPrimaryKey}
            isForeignKey={

attribute.isForeignKey}
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