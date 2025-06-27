import React from 'react';
import styled from 'styled-components';
import { useER } from '../../contexts/ERContext';

const ResultsContainer = styled.div`
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  background-color: #2d2d2d;
  color: #ffffff;
`;

const Title = styled.h2`
  color: #ffffff;
  margin-bottom: 20px;
  border-bottom: 2px solid #444;
  padding-bottom: 10px;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #333;
  border-radius: 8px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #4CAF50;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #999;
  margin-top: 5px;
`;

const TableContainer = styled.div`
  background-color: #333;
  border-radius: 8px;
  overflow: hidden;
  max-height: 400px;
  overflow-y: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
`;

const TableHeader = styled.thead`
  background-color: #444;
  position: sticky;
  top: 0;
  z-index: 1;
`;

const TableHeaderCell = styled.th`
  padding: 12px 8px;
  text-align: left;
  border-bottom: 2px solid #555;
  font-weight: bold;
  color: #fff;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #3a3a3a;
  }
  
  &:hover {
    background-color: #4a4a4a;
  }
`;

const TableCell = styled.td`
  padding: 8px;
  border-bottom: 1px solid #444;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const NoResults = styled.div`
  text-align: center;
  padding: 40px;
  color: #999;
  font-style: italic;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 40px;
  color: #4CAF50;
`;

const QueryResults: React.FC = () => {
  const { queryResult, isQueryLoading } = useER();

  if (isQueryLoading) {
    return (
      <ResultsContainer>
        <Title>📊 Resultados da Consulta</Title>
        <LoadingSpinner>
          <div>⏳ Executando consulta...</div>
        </LoadingSpinner>
      </ResultsContainer>
    );
  }

  if (!queryResult) {
    return (
      <ResultsContainer>
        <Title>📊 Resultados da Consulta</Title>
        <NoResults>
          Execute uma consulta para ver os resultados aqui.
        </NoResults>
      </ResultsContainer>
    );
  }

  return (
    <ResultsContainer>
      <Title>📊 Resultados da Consulta</Title>
      
      <StatsContainer>
        <StatItem>
          <StatValue>{queryResult.rowCount}</StatValue>
          <StatLabel>Registros</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{queryResult.columns.length}</StatValue>
          <StatLabel>Colunas</StatLabel>
        </StatItem>
        {queryResult.executionTime && (
          <StatItem>
            <StatValue>{queryResult.executionTime.toFixed(3)}s</StatValue>
            <StatLabel>Tempo de Execução</StatLabel>
          </StatItem>
        )}
      </StatsContainer>

      <TableContainer>
        <Table>
          <TableHeader>
            <tr>
              {queryResult.columns.map((column, index) => (
                <TableHeaderCell key={index}>
                  {column}
                </TableHeaderCell>
              ))}
            </tr>
          </TableHeader>
          <TableBody>
            {queryResult.data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {queryResult.columns.map((column, colIndex) => (
                  <TableCell key={colIndex}>
                    {row[column] !== null && row[column] !== undefined 
                      ? String(row[column])
                      : <span style={{ color: '#666', fontStyle: 'italic' }}>null</span>
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </ResultsContainer>
  );
};

export default QueryResults; 