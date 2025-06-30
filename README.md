# 📊 StackOverflow ER - Sistema de Consultas Dinâmicas

Um sistema completo para visualização e consulta de dados do StackOverflow com interface gráfica de diagrama ER e construtor de consultas dinâmicas.

## ⚠️ Aviso Importante sobre Obtenção de Dados

**Este projeto utiliza dados obtidos através de engenharia reversa da API do StackOverflow.**

Os dados utilizados nesta aplicação são obtidos através da API disponível em: [https://github.com/el-yawd/stackoverflow/tree/main/api](https://github.com/el-yawd/stackoverflow/tree/main/api)

Esta API realiza engenharia reversa dos dados oficiais do StackOverflow para popular o banco de dados local. **Este projeto é apenas uma interface de consulta e visualização** - não possui funcionalidades de coleta ou engenharia reversa de dados.

### 📋 Responsabilidades
- **Interface de Consulta**: Este projeto fornece apenas a interface para consultar dados já coletados
- **Coleta de Dados**: A coleta e engenharia reversa são responsabilidade da API mencionada acima
- **Uso Educacional**: Este projeto é destinado a fins educacionais e de demonstração

---

## 🚀 Funcionalidades

### ✨ Interface Principal
- **Diagrama ER Interativo**: Visualização gráfica das entidades e relacionamentos
- **Seleção Intuitiva**: Clique simples para ver detalhes, Ctrl+Clique para adicionar à consulta
- **Interface Responsiva**: Sidebar redimensionável com abas organizadas
- **Tema Escuro**: Interface moderna com tema escuro para melhor experiência

### 🔍 Construtor de Consultas Dinâmicas
- **Seleção de Tabelas**: Adicione/remova tabelas da consulta com um clique
- **Seleção de Campos**: Escolha campos específicos de cada tabela
- **JOINs Automáticos**: Sistema inteligente que gera JOINs automaticamente
- **Filtros Avançados**: Suporte a múltiplos operadores e tipos de dados
- **Validação em Tempo Real**: Verificação automática de sintaxe e conectividade
- **Ordenação e Limite**: Controle de ordenação e limite de resultados

### 📋 Detalhes das Entidades
- **Informações Completas**: Visualização de todos os campos e tipos
- **Relacionamentos**: Mapeamento claro das relações entre entidades
- **Estatísticas**: Contadores e informações sobre cada entidade

### 📊 Resultados de Consultas
- **Tabela Interativa**: Exibição dos resultados em formato tabular
- **Informações de Execução**: Tempo de execução e número de registros
- **SQL Gerado**: Visualização da query SQL executada
- **Dados Estruturados**: Resultados organizados e legíveis
- **Exportação**: Download dos resultados em CSV e JSON

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18.2.0**: Biblioteca JavaScript para construção de interfaces
- **TypeScript 5.3.3**: Superset do JavaScript com tipagem estática
- **Styled Components 6.1.19**: CSS-in-JS para estilização
- **Axios 1.6.7**: Cliente HTTP para requisições à API

### Backend
- **Node.js**: Runtime JavaScript no servidor
- **Express 4.18.2**: Framework web para Node.js
- **TypeScript 5.3.3**: Tipagem estática no backend
- **Prisma 5.22.0**: ORM moderno para banco de dados
- **PostgreSQL**: Sistema de gerenciamento de banco de dados

### Ferramentas de Desenvolvimento
- **Nodemon 3.0.3**: Reinicialização automática do servidor
- **ts-node 10.9.2**: Execução de TypeScript diretamente
- **CORS 2.8.5**: Middleware para Cross-Origin Resource Sharing

## 🏗️ Arquitetura

### Estrutura do Projeto
```
front-stack/
├── stackoverflow-er-backend/          # Backend Node.js + TypeScript
│   ├── src/
│   │   ├── controllers/               # Lógica de negócio
│   │   │   └── customQueryController.ts
│   │   ├── routes/                    # Definição de rotas
│   │   │   └── customQueryRoutes.ts
│   │   ├── prismaClient.ts            # Cliente Prisma
│   │   └── server.ts                  # Servidor Express
│   ├── prisma/
│   │   └── schema.prisma              # Schema do banco de dados
│   ├── scripts/
│   │   └── populate-question-tags.js  # Script de população
│   └── package.json
├── stackoverflow-er-frontend/         # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/                # Componentes React
│   │   │   ├── ERDiagram/             # Diagrama ER interativo
│   │   │   ├── EntityDetails/         # Detalhes das entidades
│   │   │   ├── QueryBuilder/          # Construtor de consultas
│   │   │   └── QueryResults/          # Exibição de resultados
│   │   ├── contexts/
│   │   │   └── ERContext.tsx          # Contexto global React
│   │   ├── services/
│   │   │   └── apiService.ts          # Comunicação com API
│   │   ├── types/
│   │   │   └── ERTypes.ts             # Definições de tipos
│   │   ├── data/
│   │   │   └── mockData.ts            # Dados de exemplo
│   │   └── styles/
│   │       └── GlobalStyles.ts        # Estilos globais
│   └── package.json
└── README.md
```

## 🗄️ Modelo de Dados

### Entidades Principais
- **Users**: Usuários do StackOverflow
- **Questions**: Perguntas feitas pelos usuários
- **Answers**: Respostas para as perguntas
- **Comments**: Comentários em perguntas e respostas
- **Tags**: Tags para categorização
- **QuestionTags**: Tabela de junção para relacionar perguntas e tags

### Relacionamentos
- Users → Questions (1:N)
- Users → Answers (1:N)
- Users → Comments (1:N)
- Questions → Answers (1:N)
- Questions → Comments (1:N)
- Answers → Comments (1:N)
- Questions ↔ Tags (N:N via QuestionTags)

### Campos das Tabelas

#### Users
- `user_id` (INTEGER, PK)
- `name` (VARCHAR(50))
- `reputation` (INTEGER)
- `link` (TEXT)

#### Questions
- `question_id` (INTEGER, PK)
- `title` (VARCHAR(255))
- `answer_count` (INTEGER)
- `view_count` (INTEGER)
- `creation_date` (DATE)
- `score` (INTEGER)
- `user_id` (INTEGER, FK)

#### Answers
- `answers_id` (INTEGER, PK)
- `body` (TEXT)
- `creation_date` (DATE)
- `score` (INTEGER)
- `is_accepted` (BOOLEAN)
- `user_id` (INTEGER, FK)
- `question_id` (INTEGER, FK)

#### Comments
- `comment_id` (INTEGER, PK)
- `body` (TEXT)
- `creation_date` (DATE)
- `user_id` (INTEGER, FK)
- `answer_id` (INTEGER, FK)
- `question_id` (INTEGER, FK)

#### Tags
- `tag_id` (INTEGER, PK)
- `name` (TEXT)
- `count` (INTEGER)

#### QuestionTags
- `question_id` (INTEGER, PK/FK)
- `tag_id` (INTEGER, PK/FK)

## 🚀 Instalação e Configuração

### Pré-requisitos
- **Node.js** (versão 16 ou superior)
- **PostgreSQL** (versão 12 ou superior)
- **npm** ou **yarn**

### 1. Clone o Repositório
```bash
git clone <url-do-repositorio>
cd front-stack
```

### 2. Configuração do Backend

```bash
cd stackoverflow-er-backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp config.example.txt .env
```

Edite o arquivo `.env` com suas configurações:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/stackoverflow_db"
PORT=3002
```

```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrações (se necessário)
npx prisma migrate dev

# Popular dados de exemplo
node scripts/populate-question-tags.js

# Iniciar servidor de desenvolvimento
npm run dev
```

### 3. Configuração do Frontend

```bash
cd stackoverflow-er-frontend

# Instalar dependências
npm install

# Iniciar aplicação
npm start
```

### 4. Acessar a Aplicação
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3002

## 📝 Como Usar

### Navegação Básica
1. **Visualizar Entidades**: Clique simples em qualquer entidade no diagrama
2. **Adicionar à Consulta**: Ctrl+Clique para adicionar/remover tabelas
3. **Redimensionar**: Arraste a borda da sidebar para ajustar o tamanho
4. **Alternar Abas**: Use as abas "Detalhes", "Consulta" e "Resultados"

### Construindo Consultas
1. **Selecionar Tabelas**: Use Ctrl+Clique no diagrama ou botões na aba "Consulta"
2. **Escolher Campos**: Marque os campos desejados de cada tabela
3. **Configurar JOINs**: O sistema gera JOINs automaticamente
4. **Adicionar Filtros**: Configure condições de filtro conforme necessário
5. **Executar**: Clique em "Executar Consulta" para ver os resultados

### Exemplos de Consultas
- **Usuários com alta reputação**: `users` com filtro `reputation > 1000`
- **Perguntas com score alto**: `questions` com filtro `score > 10`
- **Tags populares**: `tags` com filtro `count >= 100`
- **Perguntas recentes**: `questions` com filtro `creation_date >= "2023-01-01"`

### Exportação de Resultados
- **CSV**: Clique em "📥 Exportar" → "📄 Exportar como CSV"
- **JSON**: Clique em "📥 Exportar" → "📋 Exportar como JSON"

## 🔧 API Endpoints

### Base URL: `http://localhost:3002/api`

#### Consultas Dinâmicas
- **POST** `/custom-query/execute` - Executar consulta
- **POST** `/custom-query/validate` - Validar consulta
- **POST** `/custom-query/auto-joins` - Gerar JOINs automáticos
- **GET** `/custom-query/schema` - Obter informações do schema

#### Health Check
- **GET** `/health` - Verificar status da API e conexão com banco

### Exemplo de Uso da API

```javascript
// Executar consulta
const response = await fetch('http://localhost:3002/api/custom-query/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    selectedTables: ['questions'],
    selectedFields: [
      { table: 'questions', name: 'question_id', displayName: 'ID', type: 'integer' },
      { table: 'questions', name: 'title', displayName: 'Título', type: 'text' },
      { table: 'questions', name: 'score', displayName: 'Score', type: 'integer' }
    ],
    joins: [],
    filters: [
      {
        id: 'filter1',
        field: 'questions.score',
        operator: '>',
        value: 10
      }
    ]
  })
});

const result = await response.json();
```

## 🔒 Segurança

### Medidas Implementadas
- **Validação de Entrada**: Todos os parâmetros são validados
- **Prevenção de SQL Injection**: Uso de parâmetros preparados
- **Sanitização**: Limpeza de dados de entrada
- **CORS**: Configurado para permitir requisições do frontend

### Boas Práticas
- **Parâmetros Preparados**: Todas as queries usam parâmetros
- **Validação de Schema**: Verificação contra schema definido
- **Limitação de Resultados**: Controle de quantidade de dados retornados
- **Logs de Auditoria**: Registro de consultas executadas

## 📊 Performance

### Otimizações Implementadas
- **JOINs Otimizados**: Sistema remove JOINs desnecessários
- **Índices**: Uso de índices em chaves primárias e estrangeiras
- **Limitação**: Controle de quantidade de resultados
- **Cache**: Cache de configurações de schema

---

**StackOverflow ER** - Transformando dados em insights visuais! 🚀 