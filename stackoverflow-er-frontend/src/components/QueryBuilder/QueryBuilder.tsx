import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useER } from '../../contexts/ERContext';
import { Field, Join, Filter, Relationship } from '../../types/ERTypes';
import { executeCustomQuery, validateCustomQuery, generateAutomaticJoins } from '../../services/apiService';

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

const ValidationMessage = styled.div<{ type: 'error' | 'warning' | 'success' }>`
  padding: 8px 12px;
  border-radius: 4px;
  margin: 8px 0;
  font-size: 12px;
  
  ${props => {
    switch (props.type) {
      case 'error':
        return `
          background-color: #ffebee;
          color: #c62828;
          border: 1px solid #ffcdd2;
        `;
      case 'warning':
        return `
          background-color: #fff3e0;
          color: #ef6c00;
          border: 1px solid #ffcc02;
        `;
      case 'success':
        return `
          background-color: #e8f5e8;
          color: #2e7d32;
          border: 1px solid #c8e6c9;
        `;
    }
  }}
`;

const SuggestionBox = styled.div`
  background-color: #2a2a2a;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 8px;
  margin: 8px 0;
  font-size: 11px;
  color: #e0e0e0;
`;

const AutoJoinNotification = styled.div`
  background-color: #e3f2fd;
  border: 1px solid #2196f3;
  border-radius: 4px;
  padding: 8px 12px;
  margin: 8px 0;
  font-size: 12px;
  color: #1976d2;
`;

const JoinOrderVisual = styled.div`
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  margin: 8px 0;
  font-size: 11px;
`;

const JoinStep = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px 0;
  
  &:not(:last-child)::after {
    content: '↓';
    color: #666;
    margin-left: 8px;
  }
`;

const QueryBuilder: React.FC = () => {
  const {
    entities,
    relationships,
    selectedTables,
    selectedFields,
    joins,
    filters,
    queryResult,
    isQueryLoading,
    addField,
    removeField,
    addJoin,
    removeJoin,
    addFilter,
    removeFilter,
    clearQuery,
    setIsQueryLoading,
    setQueryResult,
    setSelectedTables,
    setSelectedFields,
    setJoins
  } = useER();

  const [newJoin, setNewJoin] = useState<Partial<Join>>({
    fromTable: '',
    toTable: '',
    type: 'LEFT'
  });

  const [newFilter, setNewFilter] = useState<Partial<Filter>>({
    field: '',
    operator: '=',
    value: ''
  });

  // Estados para validação
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestedJoins: any[];
    connectivity: { isConnected: boolean; disconnectedTables: string[] };
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Estados para JOINs automáticos
  const [autoJoinMessage, setAutoJoinMessage] = useState<string>('');
  const [showJoinOrder, setShowJoinOrder] = useState(false);

  // Validar query em tempo real quando as seleções mudarem
  useEffect(() => {
    if (selectedTables.length > 0 && selectedFields.length > 0) {
      validateQueryInRealTime();
    } else {
      setValidationResult(null);
    }
  }, [selectedTables, selectedFields, joins, filters]);

  const validateQueryInRealTime = async () => {
    if (selectedTables.length === 0 || selectedFields.length === 0) return;

    setIsValidating(true);
    try {
      const queryBuilder = {
        selectedTables: selectedTables.map(table => table.toLowerCase()),
        selectedFields: selectedFields.map(field => ({
          ...field,
          table: field.table.toLowerCase()
        })),
        joins: joins.map(join => ({
          ...join,
          fromTable: join.fromTable.toLowerCase(),
          toTable: join.toTable.toLowerCase()
        })),
        filters: filters.map(filter => ({
          ...filter,
          field: filter.field.toLowerCase()
        }))
      };

      const validation = await validateCustomQuery(queryBuilder);
      setValidationResult(validation);
    } catch (error) {
      console.error('Erro na validação em tempo real:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleTableToggle = async (tableName: string) => {
    const newSelectedTables = selectedTables.includes(tableName)
      ? selectedTables.filter(t => t !== tableName)
      : [...selectedTables, tableName];

    setSelectedTables(newSelectedTables);

    // Se está adicionando uma nova tabela, gerar JOINs automáticos
    if (!selectedTables.includes(tableName) && newSelectedTables.length > 1) {
      try {
        const result = await generateAutomaticJoins(tableName, selectedTables, joins);
        
        if (result.newJoins.length > 0) {
          // Adicionar os novos JOINs automáticos
          const updatedJoins = [...joins, ...result.newJoins];
          setJoins(updatedJoins);
          
          // Mostrar mensagem informativa
          setAutoJoinMessage(result.message);
          setShowJoinOrder(true);
          
          // Limpar mensagem após 5 segundos
          setTimeout(() => {
            setAutoJoinMessage('');
            setShowJoinOrder(false);
          }, 5000);
        }
      } catch (error) {
        console.error('Erro ao gerar JOINs automáticos:', error);
      }
    } else if (selectedTables.includes(tableName)) {
      // Se está removendo uma tabela, remover JOINs relacionados
      const updatedJoins = joins.filter(join => 
        join.fromTable !== tableName && join.toTable !== tableName
      );
      setJoins(updatedJoins);
    }
  };

  // Função para criar JOIN baseado na relação real (mesma lógica do contexto)
  const createJoinFromRelationship = (rel: Relationship, table1: string, table2: string): Join | null => {
    // Mapeamento de campos para JOINs baseado nas relações reais
    const joinMappings: { [key: string]: { [key: string]: { fromField: string; toField: string } } } = {
      'questions': {
        'answers': { fromField: 'question_id', toField: 'question_id' },
        'users': { fromField: 'user_id', toField: 'user_id' },
        'comments': { fromField: 'question_id', toField: 'question_id' },
        'question_tags': { fromField: 'question_id', toField: 'question_id' }
      },
      'answers': {
        'questions': { fromField: 'question_id', toField: 'question_id' },
        'users': { fromField: 'user_id', toField: 'user_id' },
        'comments': { fromField: 'answers_id', toField: 'answer_id' }
      },
      'users': {
        'questions': { fromField: 'user_id', toField: 'user_id' },
        'answers': { fromField: 'user_id', toField: 'user_id' },
        'comments': { fromField: 'user_id', toField: 'user_id' }
      },
      'comments': {
        'questions': { fromField: 'question_id', toField: 'question_id' },
        'answers': { fromField: 'answer_id', toField: 'answers_id' },
        'users': { fromField: 'user_id', toField: 'user_id' }
      },
      'tags': {
        'question_tags': { fromField: 'tag_id', toField: 'tag_id' }
      },
      'question_tags': {
        'questions': { fromField: 'question_id', toField: 'question_id' },
        'tags': { fromField: 'tag_id', toField: 'tag_id' }
      }
    };

    // Determinar qual tabela é a origem e qual é o destino
    let fromTable: string, toTable: string;
    if (rel.fromEntity.toLowerCase() === table1.toLowerCase()) {
      fromTable = table1;
      toTable = table2;
    } else if (rel.toEntity.toLowerCase() === table1.toLowerCase()) {
      fromTable = table2;
      toTable = table1;
    } else {
      fromTable = table1;
      toTable = table2;
    }

    // Buscar o mapeamento de campos
    const mapping = joinMappings[fromTable.toLowerCase()]?.[toTable.toLowerCase()];
    if (!mapping) {
      // Tentar o mapeamento reverso
      const reverseMapping = joinMappings[toTable.toLowerCase()]?.[fromTable.toLowerCase()];
      if (reverseMapping) {
        return {
          id: `${fromTable.toLowerCase()}-${toTable.toLowerCase()}`,
          fromTable: fromTable.toLowerCase(),
          toTable: toTable.toLowerCase(),
          fromField: reverseMapping.toField,
          toField: reverseMapping.fromField,
          type: 'LEFT' as const,
        };
      }
      return null;
    }

    return {
      id: `${fromTable.toLowerCase()}-${toTable.toLowerCase()}`,
      fromTable: fromTable.toLowerCase(),
      toTable: toTable.toLowerCase(),
      fromField: mapping.fromField,
      toField: mapping.toField,
      type: 'LEFT' as const,
    };
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
      // Mapeamento de campos para JOINs baseado no CSV
      const getJoinFields = (fromTable: string, toTable: string) => {
        const joinMappings: { [key: string]: { [key: string]: { fromField: string; toField: string } } } = {
          'questions': {
            'answers': { fromField: 'question_id', toField: 'question_id' },
            'users': { fromField: 'user_id', toField: 'user_id' },
            'comments': { fromField: 'question_id', toField: 'question_id' },
            'question_tags': { fromField: 'question_id', toField: 'question_id' }
          },
          'answers': {
            'questions': { fromField: 'question_id', toField: 'question_id' },
            'users': { fromField: 'user_id', toField: 'user_id' },
            'comments': { fromField: 'answers_id', toField: 'answer_id' }
          },
          'users': {
            'questions': { fromField: 'user_id', toField: 'user_id' },
            'answers': { fromField: 'user_id', toField: 'user_id' },
            'comments': { fromField: 'user_id', toField: 'user_id' }
          },
          'comments': {
            'questions': { fromField: 'question_id', toField: 'question_id' },
            'answers': { fromField: 'answer_id', toField: 'answers_id' },
            'users': { fromField: 'user_id', toField: 'user_id' }
          },
          'tags': {
            'question_tags': { fromField: 'tag_id', toField: 'tag_id' }
          },
          'question_tags': {
            'questions': { fromField: 'question_id', toField: 'question_id' },
            'tags': { fromField: 'tag_id', toField: 'tag_id' }
          }
        };

        const mapping = joinMappings[fromTable]?.[toTable];
        if (!mapping) {
          console.warn(`Mapeamento de JOIN não encontrado: ${fromTable} -> ${toTable}`);
          return null; // Retornar null em vez de campos inválidos
        }
        
        return mapping;
      };

      const joinFields = getJoinFields(newJoin.fromTable.toLowerCase(), newJoin.toTable.toLowerCase());
      
      if (!joinFields) {
        alert('Não foi possível criar o JOIN. Verifique se as tabelas selecionadas têm relacionamentos válidos.');
        return;
      }
      
      const join: Join = {
        id: `${newJoin.fromTable.toLowerCase()}-${newJoin.toTable.toLowerCase()}`,
        fromTable: newJoin.fromTable.toLowerCase(),
        toTable: newJoin.toTable.toLowerCase(),
        fromField: joinFields.fromField,
        toField: joinFields.toField,
        type: newJoin.type
      };
      addJoin(join);
      setNewJoin({ fromTable: '', toTable: '', type: 'INNER' });
    }
  };

  const handleAddFilter = () => {
    if (newFilter.field && newFilter.operator && newFilter.value !== undefined) {
      const filter: Filter = {
        id: `${newFilter.field.toLowerCase()}-${newFilter.operator}-${Date.now()}`,
        field: newFilter.field.toLowerCase(),
        operator: newFilter.operator,
        value: newFilter.value,
        logicalOperator: 'AND'
      };
      addFilter(filter);
      setNewFilter({ field: '', operator: '=', value: '' });
    }
  };

  const getFieldType = (fieldName: string) => {
    const field = selectedFields.find(f => `${f.table}.${f.name}` === fieldName);
    return field?.type || 'string';
  };

  const isDateField = (fieldName: string) => {
    const field = selectedFields.find(f => `${f.table}.${f.name}` === fieldName);
    if (field) {
      return field.type.toLowerCase().includes('date') || 
             field.type.toLowerCase().includes('datetime') ||
             field.name.toLowerCase().includes('creation_date') || 
             field.name.toLowerCase().includes('date');
    }
    return fieldName.toLowerCase().includes('creation_date') || 
           fieldName.toLowerCase().includes('date');
  };

  const getDateOperators = () => [
    { value: '=', label: '=' },
    { value: '>', label: '>' },
    { value: '<', label: '<' },
    { value: '>=', label: '>=' },
    { value: '<=', label: '<=' },
    { value: 'IS NULL', label: 'IS NULL' },
    { value: 'IS NOT NULL', label: 'IS NOT NULL' }
  ];

  const getStringOperators = () => [
    { value: '=', label: '=' },
    { value: '!=', label: '!=' },
    { value: '>', label: '>' },
    { value: '<', label: '<' },
    { value: '>=', label: '>=' },
    { value: '<=', label: '<=' },
    { value: 'LIKE', label: 'LIKE' },
    { value: 'IS NULL', label: 'IS NULL' },
    { value: 'IS NOT NULL', label: 'IS NOT NULL' }
  ];

  const getNumberOperators = () => [
    { value: '=', label: '=' },
    { value: '!=', label: '!=' },
    { value: '>', label: '>' },
    { value: '<', label: '<' },
    { value: '>=', label: '>=' },
    { value: '<=', label: '<=' },
    { value: 'IS NULL', label: 'IS NULL' },
    { value: 'IS NOT NULL', label: 'IS NOT NULL' }
  ];

  const getOperatorsForField = (fieldName: string) => {
    if (isDateField(fieldName)) {
      return getDateOperators();
    }
    const fieldType = getFieldType(fieldName);
    if (fieldType === 'int' || fieldType === 'number') {
      return getNumberOperators();
    }
    return getStringOperators();
  };

  const handleExecuteQuery = async () => {
    if (selectedTables.length === 0 || selectedFields.length === 0) {
      alert('Selecione pelo menos uma tabela e um campo!');
      return;
    }

    // Validar antes de executar
    if (validationResult && !validationResult.isValid) {
      alert(`Query inválida:\n${validationResult.errors.join('\n')}`);
      return;
    }

    setIsQueryLoading(true);
    try {
      // Converter nomes das tabelas para minúsculas
      const normalizedTables = selectedTables.map(table => table.toLowerCase());
      const normalizedFields = selectedFields.map(field => ({
        ...field,
        table: field.table.toLowerCase()
      }));
      
      // Normalizar joins
      const normalizedJoins = joins.map(join => ({
        ...join,
        fromTable: join.fromTable.toLowerCase(),
        toTable: join.toTable.toLowerCase()
      }));
      
      // Normalizar filtros
      const normalizedFilters = filters.map(filter => ({
        ...filter,
        field: filter.field.toLowerCase()
      }));
      
      const queryBuilder = {
        selectedTables: normalizedTables,
        selectedFields: normalizedFields,
        joins: normalizedJoins,
        filters: normalizedFilters,
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

        {/* Seção de validação */}
        {validationResult && (
          <Section>
            <SectionTitle>✅ Validação da Query</SectionTitle>
            {isValidating && <div>Validando...</div>}
            
            {validationResult.errors.length > 0 && (
              <ValidationMessage type="error">
                <strong>Erros:</strong>
                <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
                  {validationResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </ValidationMessage>
            )}
            
            {validationResult.warnings.length > 0 && (
              <ValidationMessage type="warning">
                <strong>Avisos:</strong>
                <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
                  {validationResult.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </ValidationMessage>
            )}
            
            {validationResult.isValid && validationResult.errors.length === 0 && (
              <ValidationMessage type="success">
                ✅ Query válida e pronta para execução!
              </ValidationMessage>
            )}
            
            {validationResult.suggestedJoins.length > 0 && (
              <SuggestionBox>
                <strong>Sugestões de JOINs automáticos:</strong>
                <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
                  {validationResult.suggestedJoins.map((join, index) => (
                    <li key={index}>
                      {join.fromTable}.{join.fromField} → {join.toTable}.{join.toField} ({join.type})
                    </li>
                  ))}
                </ul>
              </SuggestionBox>
            )}
          </Section>
        )}

        {selectedTables.length > 1 && (
          <Section>
            <SectionTitle>🔗 3. Definir Junções (Joins)</SectionTitle>
            
            {/* Notificação de JOINs automáticos */}
            {autoJoinMessage && (
              <AutoJoinNotification>
                ✅ {autoJoinMessage}
              </AutoJoinNotification>
            )}
            
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
            
            {/* Visualização da ordem dos JOINs */}
            {showJoinOrder && joins.length > 0 && (
              <JoinOrderVisual>
                <strong>Ordem de execução dos JOINs:</strong>
                {joins.map((join, index) => (
                  <JoinStep key={join.id}>
                    {index + 1}. {join.fromTable} → {join.toTable} ({join.type})
                  </JoinStep>
                ))}
              </JoinOrderVisual>
            )}
            
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
                {getOperatorsForField(newFilter.field || '').map(op => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </Select>
              
              <Input
                type={isDateField(newFilter.field || '') ? "date" : "text"}
                value={String(newFilter.value || '')}
                onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })}
                placeholder={isDateField(newFilter.field || '') ? "YYYY-MM-DD" : "Valor"}
                disabled={newFilter.operator === 'IS NULL' || newFilter.operator === 'IS NOT NULL'}
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