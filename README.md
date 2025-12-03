# Frontend Agenda Cultural

Aplicação web moderna e minimalista para gerenciamento de eventos culturais, desenvolvida com React, TypeScript e Vite.

## 🚀 Funcionalidades

### Para Usuários
- ✅ Visualizar eventos culturais
- ✅ Buscar eventos por título
- ✅ Inscrever-se em eventos
- ✅ Salvar eventos favoritos
- ✅ Ver detalhes completos dos eventos

### Para Promoters
- ✅ Criar e gerenciar eventos
- ✅ Visualizar status de aprovação dos eventos
- ✅ Editar eventos pendentes ou aprovados
- ✅ Ver número de inscritos

### Para Administradores
- ✅ Aprovar/rejeitar promoters
- ✅ Aprovar/rejeitar eventos
- ✅ Visualizar todos os eventos pendentes

## 🛠️ Tecnologias

- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **React Router DOM** - Roteamento
- **React Query** - Gerenciamento de estado servidor
- **Zustand** - Gerenciamento de estado cliente
- **React Hook Form** - Formulários
- **Zod** - Validação de schemas
- **Axios** - Cliente HTTP
- **date-fns** - Formatação de datas
- **Lucide React** - Ícones
- **React Hot Toast** - Notificações

## 📦 Instalação

1. Clone o repositório
```bash
git clone <repo-url>
cd frontend-agenda-cultural
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure:
```env
VITE_API_URL=http://localhost:3000/api
```

4. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (Button, Input, Card, etc)
│   └── layout/         # Componentes de layout (Header, Footer)
├── pages/              # Páginas da aplicação
├── services/           # Serviços de API
│   └── api/           # Clientes HTTP
├── stores/            # Stores Zustand
├── contexts/          # Contexts React
├── types/            # Tipos TypeScript
├── hooks/            # Custom hooks
└── utils/            # Funções utilitárias
```

## 🎨 Design System

O projeto utiliza um design system minimalista com:

- **Cores**: Paleta baseada em Indigo, Rosa e Verde
- **Tipografia**: Inter ou System UI
- **Espaçamentos**: Base de 4px
- **Componentes**: Botões, Inputs, Cards com border-radius de 8-12px

## 📱 Rotas

- `/` - Landing Page (lista de eventos)
- `/login` - Login
- `/registro` - Registro
- `/eventos` - Lista de eventos
- `/eventos/:id` - Detalhes do evento
- `/meus-eventos` - Eventos do promoter (requer autenticação + promoter)
- `/criar-evento` - Criar evento (requer autenticação + promoter)
- `/eventos-salvos` - Eventos salvos (requer autenticação)
- `/perfil` - Perfil do usuário (requer autenticação)
- `/admin` - Painel admin (requer autenticação + admin)
  - `/admin/promoters` - Aprovar promoters
  - `/admin/eventos` - Aprovar eventos

## 🔐 Autenticação

A aplicação utiliza JWT tokens armazenados no localStorage:
- `token` - Token de acesso
- `refreshToken` - Token de refresh

O sistema inclui interceptors automáticos para:
- Adicionar token nas requisições
- Renovar token automaticamente quando expirado
- Redirecionar para login em caso de erro 401

## 🚀 Scripts

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa o linter

## 🐳 Docker

O projeto inclui configuração Docker para facilitar o deploy. Veja [DOCKER.md](./DOCKER.md) para instruções detalhadas.

### Execução Rápida com Docker

```bash
# Usando Docker Compose (recomendado)
docker-compose up -d

# A aplicação estará disponível em http://localhost:3000
```

### Build e Deploy

```bash
# Build da imagem
docker build -t agenda-cultural-frontend .

# Executar container
docker run -d -p 3000:80 --name agenda-cultural-frontend agenda-cultural-frontend
```

Para mais informações, consulte [DOCKER.md](./DOCKER.md).

## 📝 Notas

- A aplicação espera uma API backend rodando em `http://localhost:3000/api`
- Certifique-se de que o backend está configurado e rodando antes de iniciar o frontend
- As rotas protegidas redirecionam automaticamente para `/login` se o usuário não estiver autenticado
- Para produção, configure a variável `VITE_API_URL` com a URL do seu backend

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
