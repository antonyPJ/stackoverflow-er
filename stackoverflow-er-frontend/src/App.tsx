import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import ERDiagram from './components/ERDiagram/ERDiagram';
import EntityDetails from './components/EntityDetails/EntityDetails';
import QueryBuilder from './components/QueryBuilder/QueryBuilder';
import QueryResults from './components/QueryResults/QueryResults';
import { ERProvider } from './contexts/ERContext';
import GlobalStyles from './styles/GlobalStyles';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #1a1a1a;
  color: #ffffff;
`;

const DiagramContainer = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
`;

const SidebarContainer = styled.div<{ width: number }>`
  width: ${props => props.width}px;
  min-width: 350px;
  max-width: 1000px;
  background-color: #2d2d2d;
  border-left: 1px solid #444;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const ResizeHandle = styled.div`
  position: absolute;
  left: -3px;
  top: 0;
  width: 6px;
  height: 100%;
  background-color: transparent;
  cursor: col-resize;
  z-index: 1000;
  
  &:hover {
    background-color: #4CAF50;
  }
  
  &:active {
    background-color: #45a049;
  }
`;

const TabContainer = styled.div`
  display: flex;
  background-color: #333;
  border-bottom: 1px solid #444;
`;

const Tab = styled.button<{ isActive: boolean }>`
  flex: 1;
  padding: 12px;
  background-color: ${props => props.isActive ? '#4CAF50' : '#444'};
  color: white;
  border: none;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.isActive ? '#45a049' : '#555'};
  }
`;

const TabContent = styled.div`
  flex: 1;
  overflow: hidden;
`;

const Instructions = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.8);
  padding: 15px;
  border-radius: 8px;
  font-size: 12px;
  max-width: 300px;
  z-index: 1000;
`;

const InstructionsTitle = styled.div`
  font-weight: bold;
  margin-bottom: 8px;
  color: #4CAF50;
`;

const InstructionsText = styled.div`
  color: #ccc;
  line-height: 1.4;
`;

function App() {
  const [activeTab, setActiveTab] = useState<'details' | 'query' | 'results'>('details');
  const [sidebarWidth, setSidebarWidth] = useState(500);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && sidebarRef.current) {
        const newWidth = window.innerWidth - e.clientX;
        const clampedWidth = Math.max(350, Math.min(1000, newWidth));
        setSidebarWidth(clampedWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  return (
    <ERProvider>
      <GlobalStyles />
      <AppContainer>
        <DiagramContainer>
          <ERDiagram />
          <Instructions>
            <InstructionsTitle>💡 Como usar:</InstructionsTitle>
            <InstructionsText>
              • <strong>Clique simples:</strong> Seleciona entidade para ver detalhes<br/>
              • <strong>Ctrl+Clique:</strong> Adiciona/remove tabela da consulta<br/>
              • <strong>Abas laterais:</strong> Monte consultas e veja resultados<br/>
              • <strong>Arraste a borda:</strong> Redimensione a aba lateral<br/>
              • <strong>🖱️ Arraste:</strong> Mova o diagrama na tela<br/>
              • <strong>⌨️ Ctrl+Scroll:</strong> Zoom in/out no diagrama<br/>
              • <strong>🖱️ Duplo clique:</strong> Centraliza o diagrama
            </InstructionsText>
          </Instructions>
        </DiagramContainer>
        
        <SidebarContainer ref={sidebarRef} width={sidebarWidth}>
          <ResizeHandle onMouseDown={handleResizeStart} />
          <TabContainer>
            <Tab 
              isActive={activeTab === 'details'} 
              onClick={() => setActiveTab('details')}
            >
              📋 Detalhes
            </Tab>
            <Tab 
              isActive={activeTab === 'query'} 
              onClick={() => setActiveTab('query')}
            >
              🔍 Consulta
            </Tab>
            <Tab 
              isActive={activeTab === 'results'} 
              onClick={() => setActiveTab('results')}
            >
              📊 Resultados
            </Tab>
          </TabContainer>
          
          <TabContent>
            {activeTab === 'details' && <EntityDetails />}
            {activeTab === 'query' && <QueryBuilder />}
            {activeTab === 'results' && <QueryResults />}
          </TabContent>
        </SidebarContainer>
      </AppContainer>
    </ERProvider>
  );
}

export default App;