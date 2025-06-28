import React, { useState, useRef, useEffect } from 'react';
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
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
`;

const StatsLeft = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  text-align: center;
  min-width: 80px;
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

const ExportButton = styled.button`
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1976D2;
  }

  &:disabled {
    background-color: #666;
    cursor: not-allowed;
  }
`;

const ExportDropdown = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownContent = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'block' : 'none'};
  position: absolute;
  right: 0;
  top: 100%;
  background-color: #444;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1000;
  border-radius: 6px;
  margin-top: 5px;
`;

const DropdownItem = styled.button`
  color: white;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  border-radius: 6px;

  &:hover {
    background-color: #555;
  }

  &:first-child {
    border-radius: 6px 6px 0 0;
  }

  &:last-child {
    border-radius: 0 0 6px 6px;
  }
`;

const TableContainer = styled.div`
  background-color: #333;
  border-radius: 8px;
  overflow: hidden;
  max-height: 800px;
  min-height: 200px;
  overflow-y: auto;
  overflow-x: auto;
  position: relative;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  min-width: 600px;
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
  white-space: nowrap;
  min-width: 100px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
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
  min-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: top;
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

const ScrollIndicator = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 11px;
  z-index: 10;
`;

const QueryResults: React.FC = () => {
  const { queryResult, isQueryLoading } = useER();
  const [hasHorizontalScroll, setHasHorizontalScroll] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScroll = () => {
      if (tableContainerRef.current) {
        const hasScroll = tableContainerRef.current.scrollWidth > tableContainerRef.current.clientWidth;
        setHasHorizontalScroll(hasScroll);
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    
    return () => window.removeEventListener('resize', checkScroll);
  }, [queryResult]);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setIsExportDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const exportToCSV = () => {
    if (!queryResult) return;

    // Criar cabeçalho CSV
    const headers = queryResult.columns.join(',');
    
    // Criar linhas de dados
    const rows = queryResult.data.map(row => 
      queryResult.columns.map(column => {
        const value = row[column];
        // Escapar vírgulas e aspas duplas
        if (value === null || value === undefined) {
          return '';
        }
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    );

    // Combinar cabeçalho e dados
    const csvContent = [headers, ...rows].join('\n');
    
    // Criar blob e download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `consulta_resultados_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    if (!queryResult) return;

    const jsonData = {
      metadata: {
        rowCount: queryResult.rowCount,
        columnCount: queryResult.columns.length,
        executionTime: queryResult.executionTime,
        exportDate: new Date().toISOString()
      },
      columns: queryResult.columns,
      data: queryResult.data
    };

    const jsonContent = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `consulta_resultados_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleExportDropdown = () => {
    setIsExportDropdownOpen(!isExportDropdownOpen);
  };

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
        <StatsLeft>
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
        </StatsLeft>

        <ExportDropdown ref={exportDropdownRef}>
          <ExportButton onClick={toggleExportDropdown}>
            📥 Exportar
          </ExportButton>
          <DropdownContent isOpen={isExportDropdownOpen}>
            <DropdownItem onClick={exportToCSV}>
              📄 Exportar como CSV
            </DropdownItem>
            <DropdownItem onClick={exportToJSON}>
              📋 Exportar como JSON
            </DropdownItem>
          </DropdownContent>
        </ExportDropdown>
      </StatsContainer>

      <TableContainer ref={tableContainerRef}>
        <Table>
          <TableHeader>
            <tr>
              {queryResult.columns.map((column, index) => (
                <TableHeaderCell key={index} title={column}>
                  {column}
                </TableHeaderCell>
              ))}
            </tr>
          </TableHeader>
          <TableBody>
            {queryResult.data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {queryResult.columns.map((column, colIndex) => (
                  <TableCell key={colIndex} title={String(row[column] || '')}>
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
        {hasHorizontalScroll && (
          <ScrollIndicator>
            ← Arraste horizontalmente para ver mais colunas →
          </ScrollIndicator>
        )}
      </TableContainer>
    </ResultsContainer>
  );
};

export default QueryResults; 