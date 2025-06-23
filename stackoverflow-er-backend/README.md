# StackOverflow ER Backend

Backend da aplicação StackOverflow ER com Node.js, Express, TypeScript e Prisma ORM.

## 🚀 Configuração

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar banco de dados
1. Crie um arquivo `.env` na raiz do projeto
2. Configure a variável `DATABASE_URL` com sua conexão PostgreSQL:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/stackoverflow_db"
PORT=3001
```

### 3. Configurar Prisma
```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrações (se necessário)
npx prisma migrate dev
```

## 🏃‍♂️ Executar

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## 📊 Endpoints da API

### Health Check
- `GET /api/health` - Verificar status da API e conexão com banco

### Usuários
- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Buscar usuário por ID
- `GET /api/users/stats` - Estatísticas dos usuários

### Perguntas
- `GET /api/questions` - Listar perguntas
- `GET /api/questions/:id` - Buscar pergunta por ID
- `GET /api/questions/stats` - Estatísticas das perguntas

## 🗄️ Modelos do Banco

- **Users**: Usuários do sistema
- **Posts**: Posts gerais
- **Questions**: Perguntas
- **Answers**: Respostas
- **Comments**: Comentários
- **Tags**: Tags
- **QuestionTags**: Relacionamento entre perguntas e tags

## 🔧 Tecnologias

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- CORS 