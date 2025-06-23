import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useER } from '../../contexts/ERContext';
import { fetchEntityData } from '../../services/apiService';

const DetailsContainer = styled.div`
  padding: 20px;
  height: 100%;
  overflow-y: auto;
`;

const Title = styled.h2`
  color: #ffffff;
  margin-bottom: 20px;
  border-bottom: 2px solid #444;
  padding-bottom: 10px;
`;

const Section = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  color: #ccc;
  margin-bottom: 15px;
  font-size: 16px;
`;

const AttributeList = styled.div`
  background-color: #333;
  border-radius: 8px;
  padding: 15px;
`;

const AttributeItem = styled.div<{ isPrimaryKey?: boolean; isForeignKey?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #444;

  &:last-child {
    border-bottom: none;
  }
`;

const AttributeName = styled.span<{ isPrimaryKey?: boolean; isForeignKey?: boolean }>`
  font-weight: ${props => props.isPrimaryKey ? 'bold' : 'normal'};
  color: ${props =>
    props.isPrimaryKey ? '#FFD700' :
    props.isForeignKey ? '#FFA500' :
    '#ffffff'
  };
`;

const AttributeType = styled.span`
  color: #999;
  font-size: 12px;
`;

const DataSection = styled.div`
  background-color: #333;
  border-radius: 8px;
  padding: 15px;
  max-height: 300px;
  overflow-y: auto;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  color: #999;
  padding: 20px;
`;

const ErrorMessage = styled.div`
  color: #f44336;
  padding: 10px;
  background-color: rgba(244, 67, 54, 0.1);
  border-radius: 4px;
  margin: 10px 0;
`;

const DataButton = styled.button`
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 15px;

  &:hover {
    background-color: #45a049;
  }

  &:disabled {
    background-color: #666;
    cursor: not-allowed;
  }
`;

const DataItem = styled.div`
  padding: 8px;
  border-bottom: 1px solid #444;
  font-size: 12px;

  &:last-child {
    border-bottom: none;
  }
`;

const EntityDetails: React.FC = () => {
  const {
    selectedEntity,
    entityData,
    setEntityData,
    isLoading,
    setIsLoading
  } = useER();

  const handleFetchData = async () => {
    if (!selectedEntity?.apiEndpoint) return;

    setIsLoading(true);
    try {
      const data = await fetchEntityData(selectedEntity.apiEndpoint);
      setEntityData(data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setEntityData({ error: 'Erro ao carregar dados da API' });
    } finally {
      setIsLoading(false);
    }
  };

  // Limpar dados quando trocar de entidade
  useEffect(() => {
    setEntityData(null);
  }, [selectedEntity, setEntityData]);

  if (!selectedEntity) {
    return (
      <DetailsContainer>
        <Title>Detalhes da Entidade</Title>
        <p style={{ color: '#999' }}>
          Clique em uma entidade no diagrama para ver seus detalhes.
        </p>
      </DetailsContainer>
    );
  }

  return (
    <DetailsContainer>
      <Title>{selectedEntity.displayName}</Title>

      <Section>
        <SectionTitle>Atributos</SectionTitle>
        <AttributeList>
          {selectedEntity.attributes.map((attribute, index) => (
            <AttributeItem
              key={index}
              isPrimaryKey={attribute.isPrimaryKey}
              isForeignKey={attribute.isForeignKey}
            >
              <AttributeName
                isPrimaryKey={attribute.isPrimaryKey}
                isForeignKey={attribute.isForeignKey}
              >
                {attribute.isPrimaryKey && '🔑 '}
                {attribute.isForeignKey && '🔗 '}
                {attribute.name}
                {attribute.isRequired && ' *'}
              </AttributeName>
              <AttributeType>{attribute.type}</AttributeType>
            </AttributeItem>
          ))}
        </AttributeList>
      </Section>

      <Section>
        <SectionTitle>Dados da API</SectionTitle>
        <DataButton
          onClick={handleFetchData}
          disabled={isLoading || !selectedEntity.apiEndpoint}
        >
          {isLoading ? 'Carregando...' : 'Buscar Dados'}
        </DataButton>

        <DataSection>
          {isLoading && (
            <LoadingSpinner>Carregando dados...</LoadingSpinner>
          )}

          {entityData?.error && (
            <ErrorMessage>{entityData.error}</ErrorMessage>
          )}

          {entityData && !entityData.error && !isLoading && (
            <div>
              {Array.isArray(entityData) ? (
                entityData.slice(0, 10).map((item, index) => (
                  <DataItem key={index}>
                    <pre>{JSON.stringify(item, null, 2)}</pre>
                  </DataItem>
                ))
              ) : (
                <DataItem>
                  <pre>{JSON.stringify(entityData, null, 2)}</pre>
                </DataItem>
              )}
            </div>
          )}

          {!entityData && !isLoading && (
            <p style={{ color: '#999', textAlign: 'center' }}>
              Nenhum dado carregado
            </p>
          )}
        </DataSection>
      </Section>
    </DetailsContainer>
  );
};

export default EntityDetails;