# StackOverflow-ER Frontend

Frontend React para visualização e consulta do banco de dados StackOverflow-ER.

## 🚀 Objetivo

Permitir a visualização de entidades, relacionamentos e resultados de consultas ad-hoc ao banco PostgreSQL populado, integrando com o backend via API REST.

## ⚙️ Pré-requisitos

- Node.js >= 16.x
- npm >= 8.x

## 🛠️ Instalação

```bash
npm install
```

## 🔧 Configuração

- Por padrão, o frontend espera que o backend esteja rodando em `http://localhost:3002`.
- Para alterar, edite o arquivo `.env` (crie se não existir):

```
REACT_APP_API_URL=http://localhost:3002
```

## ▶️ Como rodar

```bash
npm start
```
Acesse [http://localhost:3000](http://localhost:3000).

## 🗂️ Estrutura de Pastas

- `src/components/` – Componentes React (diagrama ER, detalhes de entidades)
- `src/services/` – Serviços de integração com a API
- `src/data/` – Dados mockados (remover para produção)
- `src/types/` – Tipos TypeScript

## 🔗 Integração com o Backend

- O frontend consome os endpoints REST do backend para listar usuários, perguntas, respostas e estatísticas.
- Certifique-se de que o backend está rodando antes de iniciar o frontend.

## 🤝 Contribuição

Pull requests são bem-vindos! Siga o padrão de código e descreva bem suas alterações.

## 📄 Licença

MIT
