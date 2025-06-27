import React, { useState } from 'react';
import styled from 'styled-components';
import { useER } from '../../contexts/ERContext';
import { Field, Join, Filter } from '../../types/ERTypes';
import { executeCustomQuery } from '../../services/apiService';

const QueryBuilderContainer = styled.div`
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #2d2d2d;
  color: #ffffff;
`;

const Title = styled.h2`
  color: #ffffff;
  margin-bottom: 20px;
  border-bottom: 2px solid #444;
  padding-bottom: 10px;
  flex-shrink: 0;
`;

const ScrollableContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
  
  /* Estilização da scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #333;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #666;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #888;
  }
`;

const Section = styled.div`
  margin-bottom: 20px;
  background-color: #333;
  border-radius: 8px;
  padding: 15px;
  flex-shrink: 0;
`;

const SectionTitle = styled.h3`
  color: #ccc;
  margin-bottom: 15px;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TableGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
  margin-bottom: 15px;
`;

const TableButton = styled.button<{ isSelected: boolean }>`
  padding: 8px;
  border: 2px solid ${props => props.isSelected ? '#4CAF50' : '#555'};
  background-color: ${props => props.isSelected ? '#4CAF50' : '#444'};
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.isSelected ? '#45a049' : '#555'};
  }
`;

const FieldList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
`;

const FieldItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  background-color: #444;
  border-radius: 4px;
  font-size: 11px;
`;

const FieldCheckbox = styled.input`
  margin: 0;
`;

const FieldName = styled.span`
  flex: 1;
`;

const FieldType = styled.span`
  color: #999;
  font-size: 9px;
`;

const JoinSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 150px;
  overflow-y: auto;
`;

const JoinItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background-color: #444;
  border-radius: 6px;
  font-size: 11px;
`;

const Select = styled.select`
  background-color: #555;
  color: white;
  border: 1px solid #666;
  padding: 4px;
  border-radius: 4px;
  font-size: 11px;
`;

const FilterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 150px;
  overflow-y: auto;
`;

const FilterItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background-color: #444;
  border-radius: 6px;
  font-size: 11px;
`;

const Input = styled.input`
  background-color: #555;
  color: white;
  border: 1px solid #666;
  padding: 4px;
  border-radius: 4px;
  font-size: 11px;
  flex: 1;
`;

const Button = styled.button`
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  margin: 3px;

  &:hover {
    background-color: #45a049;
  }

  &:disabled {
    background-color: #666;
    cursor: not-allowed;
  }
`;

const RemoveButton = styled.button`
  background-color: #f44336;
  color: white;
  border: none;
  padding: 4px 6px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 9px;

  &:hover {
    background-color: #d32f2f;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #444;
  flex-shrink: 0;
`;

const AddControlsContainer = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
  padding: 8px;
  background-color: #3a3a3a;
  border-radius: 6px;
  margin-top: 8px;
`;

const QueryBuilder: React.FC = () => {
  const {
    entities,
    selectedTables,
    selectedFields,
    joins,
    filters,
    addTable,
    removeTable,
    addField,
    removeField,
    addJoin,
    removeJoin,
    addFilter,
    removeFilter,
    clearQuery,
    setIsQueryLoading,
    setQueryResult
  } = useER();

  const [newJoin, setNewJoin] = useState<Partial<Join>>({
    fromTable: '',
    toTable: '',
    type: 'INNER'
  });

  const [newFilter, setNewFilter] = useState<Partial<Filter>>({
    field: '',
    operator: '=',
    value: ''
  });

  const handleTableToggle = (tableName: string) => {
    if (selectedTables.includes(tableName)) {
      removeTable(tableName);
    } else {
      addTable(tableName);
    }
  };

  const handleFieldToggle = (field: Field) => {
    const fieldId = `${field.table}.${field.name}`;
    if (selectedFields.find(f => `${f.table}.${f.name}` === fieldId)) {
      removeField(fieldId);
    } else {
      addField(field);
    }
  };

  const handleAddJoin = () => {
    if (newJoin.fromTable && newJoin.toTable && newJoin.type) {
      const join: Join = {
        id: `${newJoin.fromTable}-${newJoin.toTable}`,
        fromTable: newJoin.fromTable,
        toTable: newJoin.toTable,
        fromField: 'id', // Simplificado por enquanto
        toField: 'id',   // Simplificado por enquanto
        type: newJoin.type
      };
      addJoin(join);
      setNewJoin({ fromTable: '', toTable: '', type: 'INNER' });
    }
  };

  const handleAddFilter = () => {
    if (newFilter.field && newFilter.operator && newFilter.value !== undefined) {
      const filter: Filter = {
        id: `${newFilter.field}-${newFilter.operator}-${Date.now()}`,
        field: newFilter.field,
        operator: newFilter.operator,
        value: newFilter.value,
        logicalOperator: 'AND'
      };
      addFilter(filter);
      setNewFilter({ field: '', operator: '=', value: '' });
    }
  };

  const handleExecuteQuery = async () => {
    if (selectedTables.length === 0 || selectedFields.length === 0) {
      alert('Selecione pelo menos uma tabela e um campo!');
      return;
    }

    setIsQueryLoading(true);
    try {
      const queryBuilder = {
        selectedTables,
        selectedFields,
        joins,
        filters,
      };
      
      const result = await executeCustomQuery(queryBuilder);
      setQueryResult(result);
    } catch (error) {
      console.error('Erro ao executar consulta:', error);
      alert('Erro ao executar consulta. Verifique o console para mais detalhes.');
    } finally {
      setIsQueryLoading(false);
    }
  };

  const getAvailableFields = () => {
    return entities
      .filter(entity => selectedTables.includes(entity.name))
      .flatMap(entity => 
        entity.attributes.map(attr => ({
          table: entity.name,
          name: attr.name,
          displayName: `${entity.displayName}.${attr.name}`,
          type: attr.type
        }))
      );
  };

  return (
    <QueryBuilderContainer>
      <Title>🔍 Construtor de Consultas</Title>

      <ScrollableContent>
        <Section>
          <SectionTitle>📋 1. Selecionar Tabelas</SectionTitle>
          <TableGrid>
            {entities.map(entity => (
              <TableButton
                key={entity.id}
                isSelected={selectedTables.includes(entity.name)}
                onClick={() => handleTableToggle(entity.name)}
              >
                {entity.displayName}
              </TableButton>
            ))}
          </TableGrid>
        </Section>

        {selectedTables.length > 0 && (
          <Section>
            <SectionTitle>📝 2. Selecionar Campos</SectionTitle>
            <FieldList>
              {getAvailableFields().map(field => (
                <FieldItem key={`${field.table}.${field.name}`}>
                  <FieldCheckbox
                    type="checkbox"
                    checked={selectedFields.some(f => f.table === field.table && f.name === field.name)}
                    onChange={() => handleFieldToggle(field)}
                  />
                  <FieldName>{field.displayName}</FieldName>
                  <FieldType>{field.type}</FieldType>
                </FieldItem>
              ))}
            </FieldList>
          </Section>
        )}

        {selectedTables.length > 1 && (
          <Section>
            <SectionTitle>🔗 3. Definir Junções (Joins)</SectionTitle>
            <JoinSection>
              {joins.map(join => (
                <JoinItem key={join.id}>
                  <span>{join.fromTable}</span>
                  <span>→</span>
                  <span>{join.toTable}</span>
                  <span>({join.type})</span>
                  <RemoveButton onClick={() => removeJoin(join.id)}>×</RemoveButton>
                </JoinItem>
              ))}
            </JoinSection>
            
            <AddControlsContainer>
              <Select
                value={newJoin.fromTable}
                onChange={(e) => setNewJoin({ ...newJoin, fromTable: e.target.value })}
              >
                <option value="">Tabela origem</option>
                {selectedTables.map(table => (
                  <option key={table} value={table}>{table}</option>
                ))}
              </Select>
              
              <Select
                value={newJoin.type}
                onChange={(e) => setNewJoin({ ...newJoin, type: e.target.value as any })}
              >
                <option value="INNER">INNER</option>
                <option value="LEFT">LEFT</option>
                <option value="RIGHT">RIGHT</option>
              </Select>
              
              <Select
                value={newJoin.toTable}
                onChange={(e) => setNewJoin({ ...newJoin, toTable: e.target.value })}
              >
                <option value="">Tabela destino</option>
                {selectedTables.map(table => (
                  <option key={table} value={table}>{table}</option>
                ))}
              </Select>
              
              <Button onClick={handleAddJoin}>Adicionar</Button>
            </AddControlsContainer>
          </Section>
        )}

        {selectedFields.length > 0 && (
          <Section>
            <SectionTitle>🔍 4. Aplicar Filtros</SectionTitle>
            <FilterSection>
              {filters.map(filter => (
                <FilterItem key={filter.id}>
                  <span>{filter.field}</span>
                  <span>{filter.operator}</span>
                  <span>{String(filter.value)}</span>
                  <RemoveButton onClick={() => removeFilter(filter.id)}>×</RemoveButton>
                </FilterItem>
              ))}
            </FilterSection>
            
            <AddControlsContainer>
              <Select
                value={newFilter.field}
                onChange={(e) => setNewFilter({ ...newFilter, field: e.target.value })}
              >
                <option value="">Campo</option>
                {selectedFields.map(field => (
                  <option key={`${field.table}.${field.name}`} value={`${field.table}.${field.name}`}>
                    {field.displayName}
                  </option>
                ))}
              </Select>
              
              <Select
                value={newFilter.operator}
                onChange={(e) => setNewFilter({ ...newFilter, operator: e.target.value as any })}
              >
                <option value="=">=</option>
                <option value="!=">!=</option>
                <option value="&gt;">&gt;</option>
                <option value="&lt;">&lt;</option>
                <option value="&gt;=">&gt;=</option>
                <option value="&lt;=">&lt;=</option>
                <option value="LIKE">LIKE</option>
              </Select>
              
              <Input
                type="text"
                value={String(newFilter.value || '')}
                onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })}
                placeholder="Valor"
              />
              
              <Button onClick={handleAddFilter}>Adicionar</Button>
            </AddControlsContainer>
          </Section>
        )}
      </ScrollableContent>

      <ActionButtons>
        <Button onClick={handleExecuteQuery} disabled={selectedTables.length === 0 || selectedFields.length === 0}>
          🚀 Executar Consulta
        </Button>
        <Button onClick={clearQuery} style={{ backgroundColor: '#ff9800' }}>
          🗑️ Limpar
        </Button>
      </ActionButtons>
    </QueryBuilderContainer>
  );
};

export default QueryBuilder; 