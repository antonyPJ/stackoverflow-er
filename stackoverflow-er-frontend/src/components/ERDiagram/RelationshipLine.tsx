import React from 'react';
import styled from 'styled-components';
import { Relationship, Entity } from '../../types/ERTypes';

interface RelationshipLineProps {
  relationship: Relationship;
  entities: Entity[];
  offsetX: number;
  offsetY: number;
}

const LineContainer = styled.div`
  position: absolute;
  pointer-events: none;
`;

const Line = styled.div<{ width: number; angle: number; left: number; top: number }>`
  position: absolute;
  height: 2px;
  background-color: #666;
  transform-origin: left center;
  transform: rotate(${props => props.angle}deg);
  width: ${props => props.width}px;
  left: ${props => props.left}px;
  top: ${props => props.top}px;
`;

const Label = styled.div<{ left: number; top: number }>`
  position: absolute;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  left: ${props => props.left}px;
  top: ${props => props.top}px;
  transform: translate(-50%, -50%);
  white-space: nowrap;
`;

const Cardinality = styled.div<{ left: number; top: number }>`
  position: absolute;
  color: #999;
  font-size: 10px;
  font-weight: bold;
  left: ${props => props.left}px;
  top: ${props => props.top}px;
  transform: translate(-50%, -50%);
`;

const RelationshipLine: React.FC<RelationshipLineProps> = ({ relationship, entities, offsetX, offsetY }) => {
  const fromEntity = entities.find(e => e.id === relationship.fromEntity);
  const toEntity = entities.find(e => e.id === relationship.toEntity);

  if (!fromEntity || !toEntity) return null;

  // Calcular posições centrais das entidades, aplicando offset
  const fromCenter = {
    x: fromEntity.position.x + 100 + offsetX, // 200px largura
    y: fromEntity.position.y + 60 + offsetY, // 120px altura
  };

  const toCenter = {
    x: toEntity.position.x + 100 + offsetX,
    y: toEntity.position.y + 60 + offsetY,
  };

  // Calcular distância e ângulo
  const deltaX = toCenter.x - fromCenter.x;
  const deltaY = toCenter.y - fromCenter.y;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

  // Posição do meio da linha para o label
  const midX = fromCenter.x + deltaX / 2;
  const midY = fromCenter.y + deltaY / 2;

  // Posições para cardinalidades
  const fromCardX = fromCenter.x + deltaX * 0.2;
  const fromCardY = fromCenter.y + deltaY * 0.2;
  const toCardX = fromCenter.x + deltaX * 0.8;
  const toCardY = fromCenter.y + deltaY * 0.8;

  return (
    <LineContainer>
      <Line
        width={distance}
        angle={angle}
        left={fromCenter.x}
        top={fromCenter.y}
      />
      <Label left={midX} top={midY}>
        {relationship.label}
      </Label>
      <Cardinality left={fromCardX} top={fromCardY}>
        {relationship.fromCardinality}
      </Cardinality>
      <Cardinality left={toCardX} top={toCardY}>
        {relationship.toCardinality}
      </Cardinality>
    </LineContainer>
  );
};

export default RelationshipLine;