import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useER } from '../../contexts/ERContext';
import EntityBox from './EntityBox';
import RelationshipLine from './RelationshipLine';

const DiagramContainer = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: linear-gradient(45deg, #1a1a1a 25%, transparent 25%),
              linear-gradient(-45deg, #1a1a1a 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #1a1a1a 75%),
              linear-gradient(-45deg, transparent 75%, #1a1a1a 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
`;

const DiagramCanvas = styled.div`
  position: relative;
  min-width: 1200px;
  min-height: 800px;
  padding: 50px;
  user-select: none;
  transform-origin: center center;
`;

const Title = styled.h1`
  position: absolute;
  top: 20px;
  left: 20px;
  color: #ffffff;
  font-size: clamp(18px, 2.5vw, 24px);
  font-weight: bold;
  margin: 0;
  z-index: 1000;
  pointer-events: none;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
`;

const ERDiagram: React.FC = () => {
  const { entities, relationships } = useER();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Espaçamento voltado ao valor anterior
  const EXTRA_SPACING = 80;

  // Calcular offset para centralizar as entidades considerando o espaçamento extra
  const getCenterOffset = () => {
    if (entities.length === 0) return { offsetX: 0, offsetY: 0 };
    const minX = Math.min(...entities.map(e => e.position.x + e.position.x / 200 * EXTRA_SPACING));
    const maxX = Math.max(...entities.map(e => e.position.x + e.position.x / 200 * EXTRA_SPACING));
    const minY = Math.min(...entities.map(e => e.position.y + e.position.y / 120 * EXTRA_SPACING));
    const maxY = Math.max(...entities.map(e => e.position.y + e.position.y / 120 * EXTRA_SPACING));
    const diagramWidth = maxX - minX + 200; // 200 = largura da caixa
    const diagramHeight = maxY - minY + 120; // 120 = altura da caixa
    const canvasWidth = 1200;
    const canvasHeight = 800;
    const offsetX = (canvasWidth - diagramWidth) / 2 - minX;
    const offsetY = (canvasHeight - diagramHeight) / 2 - minY;
    return { offsetX, offsetY };
  };
  const { offsetX, offsetY } = getCenterOffset();

  // Calcular entidades com posição final (offset, espaçamento e deslocamento manual)
  const FINAL_SHIFT_X = 1000;
  const FINAL_SHIFT_Y = 250;
  const entitiesWithFinalPosition = entities.map(entity => {
    const spacedX = entity.position.x + entity.position.x / 200 * EXTRA_SPACING;
    const spacedY = entity.position.y + entity.position.y / 120 * EXTRA_SPACING;
    return {
      ...entity,
      position: {
        x: spacedX + offsetX + FINAL_SHIFT_X + panOffset.x,
        y: spacedY + offsetY + FINAL_SHIFT_Y + panOffset.y,
      },
    };
  });

  // Função para ajustar o zoom automaticamente baseado no tamanho da tela
  const adjustZoomForScreen = () => {
    if (!canvasRef.current) return;
    
    const container = canvasRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Calcular o zoom ideal baseado no tamanho da tela
    const idealScaleX = (containerWidth - 100) / 1200; // 100px de margem
    const idealScaleY = (containerHeight - 100) / 800;
    const idealScale = Math.min(idealScaleX, idealScaleY, 1); // Não aumentar além de 1
    
    setScale(Math.max(0.3, idealScale)); // Mínimo de 0.3
  };

  // Ajustar zoom quando a janela é redimensionada
  useEffect(() => {
    adjustZoomForScreen();
    
    const handleResize = () => {
      adjustZoomForScreen();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Função para zoom com scroll do mouse
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setScale(prev => Math.max(0.2, Math.min(2, prev * delta)));
      }
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel);
      return () => canvas.removeEventListener('wheel', handleWheel);
    }
  }, []);

  // Função para arrastar o diagrama
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Botão esquerdo do mouse
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Função para centralizar o diagrama
  const centerDiagram = () => {
    setPanOffset({ x: 0, y: 0 });
    adjustZoomForScreen();
  };

  // Centralizar diagrama com duplo clique
  const handleDoubleClick = () => {
    centerDiagram();
  };

  return (
    <DiagramContainer 
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onDoubleClick={handleDoubleClick}
    >
      <Title>StackOverflow - Modelo Entidade-Relacionamento</Title>
      <DiagramCanvas style={{ transform: `scale(${scale})` }}>
        {/* Renderizar linhas de relacionamento primeiro (para ficarem atrás das entidades) */}
        {relationships.map(relationship => (
          <RelationshipLine
            key={relationship.id}
            relationship={relationship}
            entities={entitiesWithFinalPosition}
            offsetX={0}
            offsetY={0}
          />
        ))}
        {/* Renderizar entidades */}
        {entitiesWithFinalPosition.map(entity => (
          <EntityBox
            key={entity.id}
            entity={entity}
          />
        ))}
      </DiagramCanvas>
    </DiagramContainer>
  );
};

export default ERDiagram;