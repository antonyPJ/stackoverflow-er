import React from 'react';
import styled from 'styled-components';
import ERDiagram from './components/ERDiagram/ERDiagram';
import EntityDetails from './components/EntityDetails/EntityDetails';
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
`;

const SidebarContainer = styled.div`
  width: 400px;
  background-color: #2d2d2d;
  border-left: 1px solid #444;
  overflow-y: auto;
`;

function App() {
  return (
    <ERProvider>
      <GlobalStyles />
      <AppContainer>
        <DiagramContainer>
          <ERDiagram />
        </DiagramContainer>
        <SidebarContainer>
          <EntityDetails />
        </SidebarContainer>
      </AppContainer>
    </ERProvider>
  );
}export default App;