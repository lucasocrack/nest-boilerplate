# NestJS Prisma Boilerplate

Este é um projeto boilerplate para iniciar aplicações com [NestJS](https://nestjs.com/) e [Prisma](https://www.prisma.io/). Ele vem com uma série de funcionalidades pré-configuradas para acelerar o seu desenvolvimento, seguindo as melhores práticas de arquitetura e segurança.

Criado e mantido por [lucascampos42](https://github.com/lucascampos42).

## 🚀 Stack Tecnológica

### Core
- **[NestJS](https://nestjs.com/)** v11 - Framework Node.js progressivo com TypeScript
- **[Prisma](https://www.prisma.io/)** v6 - ORM de próxima geração com type-safety
- **[TypeScript](https://www.typescriptlang.org/)** v5 - Superset tipado do JavaScript
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional

### Autenticação & Segurança
- **[Passport](https://www.passportjs.org/)** - Middleware de autenticação
- **[JWT](https://jwt.io/)** - JSON Web Tokens para autenticação stateless
- **[bcrypt](https://www.npmjs.com/package/bcrypt)** - Hash de senhas
- **[@nestjs/throttler](https://www.npmjs.com/package/@nestjs/throttler)** - Rate limiting

### Validação & Transformação
- **[class-validator](https://www.npmjs.com/package/class-validator)** - Validação de DTOs
- **[class-transformer](https://www.npmjs.com/package/class-transformer)** - Transformação de objetos

### Documentação & API
- **[@nestjs/swagger](https://www.npmjs.com/package/@nestjs/swagger)** - Documentação OpenAPI
- **[@scalar/nestjs-api-reference](https://www.npmjs.com/package/@scalar/nestjs-api-reference)** - Interface moderna para documentação
- **[@compodoc/compodoc](https://www.npmjs.com/package/@compodoc/compodoc)** - Documentação do código

### E-mail & Notificações
- **[@nestjs-modules/mailer](https://www.npmjs.com/package/@nestjs-modules/mailer)** - Sistema de e-mail
- **[nodemailer](https://www.npmjs.com/package/nodemailer)** - Envio de e-mails

### Testes
- **[Jest](https://jestjs.io/)** - Framework de testes
- **[Supertest](https://www.npmjs.com/package/supertest)** - Testes de integração HTTP

### Desenvolvimento
- **[ESLint](https://eslint.org/)** - Linting de código
- **[Prettier](https://prettier.io/)** - Formatação de código
- **[Docker](https://www.docker.com/)** - Containerização (opcional)

## Funcionalidades

*   **Framework:** [NestJS](https://nestjs.com/) - Um framework Node.js progressivo para construir aplicações server-side eficientes e escaláveis.
*   **ORM:** [Prisma](https://www.prisma.io/) - ORM de próxima geração para Node.js e TypeScript.
*   **Autenticação:** Autenticação completa com JWT (login e registro).
*   **Autorização:** Controle de acesso baseado em papéis (Role-Based Access Control - RBAC) com guards.
*   **Notificações de Segurança:** Sistema de alertas por e-mail para logins suspeitos, múltiplas tentativas de login e bloqueios de conta.
*   **Logs de Ações do Usuário:** Middleware para registrar automaticamente as ações dos usuários em uma tabela de log no banco de dados.
*   **Docker (Opcional):** Configuração completa para um ambiente de desenvolvimento e produção containerizado. Veja o guia [DOCKER.md](./DOCKER.md) para detalhes.
*   **Testes:** Estrutura de testes com Jest para testes unitários e e2e.
*   **Validação:** Validação de DTOs com `class-validator`.
*   **Cliente de API:** Coleção do [Bruno](https://www.usebruno.com/) para testar a API.

## Como Começar

### Pré-requisitos

*   [Node.js](https://nodejs.org/en/) (v20 ou superior)
*   [Docker](https://www.docker.com/) (opcional, para rodar com Docker)
*   [NPM](https://www.npmjs.com/)

### Instalação

1.  Clone o repositório:
    ```bash
    git clone <URL_DO_REPOSITORIO>
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```

### Configuração do Banco de Dados

1.  Copie o arquivo `.env.example` para `.env`:
    ```bash
    cp .env.example .env
    ```
2.  Adicione a sua URL de conexão do PostgreSQL no arquivo `.env`:
    ```
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
    ```
3.  Rode as migrações do Prisma para criar as tabelas no banco de dados:
    ```bash
    npx prisma migrate dev
    ```

## ⚙️ Configuração de Ambiente

### Variáveis de Ambiente

O projeto utiliza diferentes arquivos de configuração para cada ambiente:

- **`.env`** - Desenvolvimento local
- **`.env.test`** - Testes automatizados
- **`.env.docker`** - Ambiente Docker

### Principais Variáveis

```bash
# Banco de Dados
DATABASE_URL="postgresql://user:password@localhost:5432/database"

# JWT
JWT_SECRET="seu-jwt-secret-super-seguro"
JWT_TTL="15m"                    # Token de acesso
JWT_REFRESH_SECRET="refresh-secret"
JWT_REFRESH_TTL="7d"             # Token de refresh

# E-mail
EMAIL_ENABLED=true               # Ativar/desativar envio de e-mails
MAIL_HOST="smtp.gmail.com"
MAIL_PORT=587
MAIL_USER="seu-email@gmail.com"
MAIL_PASS="sua-senha-de-app"
MAIL_FROM="noreply@seudominio.com"

# Rate Limiting
THROTTLE_TTL=60                  # Janela de tempo (segundos)
THROTTLE_LIMIT=10                # Máximo de requests por janela

# Aplicação
PORT=3099
NODE_ENV="development"
```

### Configuração de E-mail

Para configurar o envio de e-mails:

1. **Gmail:** Use senhas de aplicativo (App Passwords)
2. **Outros provedores:** Configure SMTP conforme documentação
3. **Desenvolvimento:** Defina `EMAIL_ENABLED=false` para desabilitar

### Segurança

⚠️ **Importante:**
- Nunca commite arquivos `.env` com dados sensíveis
- Use senhas fortes para JWT secrets
- Configure rate limiting adequadamente
- Use HTTPS em produção

### Populando o Banco de Dados (Seeding)

Este projeto inclui um script de seed para popular o banco de dados com dados iniciais. Atualmente, ele cria um usuário administrador padrão.

Para rodar o script de seed, execute o seguinte comando:

```bash
npm run seed
```

O usuário administrador será criado com as seguintes credenciais:
- **E-mail:** `admin@admin.com`
- **Senha:** `12345678`

## 🚀 Comandos Disponíveis

### Desenvolvimento

```bash
# Iniciar em modo de desenvolvimento (com hot reload)
npm run start:dev

# Iniciar em modo debug
npm run start:debug

# Iniciar aplicação + documentação simultaneamente
npm run start:all

# Build para produção
npm run build

# Iniciar versão de produção
npm run start:prod
```

### Banco de Dados

```bash
# Executar migrações
npx prisma migrate dev

# Executar migrações para ambiente de teste
npm run test:migrate

# Popular banco com dados iniciais
npm run seed

# Visualizar banco de dados (Prisma Studio)
npx prisma studio

# Gerar cliente Prisma após mudanças no schema
npx prisma generate
```

### Qualidade de Código

```bash
# Executar linting
npm run lint

# Formatar código
npm run format

# Gerar documentação do código
npm run compodoc
```

### Docker (Opcional)

```bash
# Construir e iniciar containers
docker-compose up --build

# Iniciar containers em background
docker-compose up -d

# Parar containers
docker-compose down
```

A aplicação estará disponível em `http://localhost:3099`.

## Notificações de Segurança

O sistema inclui notificações automáticas por e-mail para eventos de segurança importantes:

### Tipos de Alertas

*   **Login Suspeito:** Detecta logins após longos períodos de inatividade (30+ dias)
*   **Múltiplas Tentativas de Login:** Alerta a partir da 3ª tentativa de login falhada
*   **Conta Bloqueada:** Notifica quando a conta é temporariamente bloqueada por excesso de tentativas

### Configuração

As notificações são controladas pela variável de ambiente `EMAIL_ENABLED` no arquivo `.env`:

```env
# Controla o envio de e-mails (ativação de conta e notificações de segurança)
EMAIL_ENABLED=true
```

### Personalização

Os templates de e-mail estão localizados em `src/core/mail/templates/` e podem ser customizados conforme necessário.

## 🏗️ Arquitetura do Projeto

### Estrutura de Pastas

```
src/
├── application/              # Módulos de aplicação
│   ├── auth/                # Autenticação e autorização
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── entities/        # Entidades de domínio
│   │   └── repositories/    # Repositórios
│   ├── user/                # Gestão de usuários
│   └── home/                # Endpoint de saúde
├── core/                     # Funcionalidades centrais
│   ├── config/              # Configurações da aplicação
│   ├── decorators/          # Decorators customizados
│   ├── dto/                 # DTOs base
│   ├── entities/            # Entidades base
│   ├── exceptions/          # Exceções customizadas
│   ├── filters/             # Exception filters
│   ├── guards/              # Guards de autenticação/autorização
│   ├── interceptors/        # Interceptors
│   ├── interfaces/          # Interfaces compartilhadas
│   ├── mail/                # Sistema de e-mail
│   ├── utils/               # Utilitários
│   └── validators/          # Validadores customizados
└── main.ts                   # Ponto de entrada da aplicação
```

### Princípios Arquiteturais

- **🏛️ Clean Architecture:** Separação clara entre camadas
- **📦 Modularidade:** Cada feature é um módulo independente
- **🔄 Repository Pattern:** Abstração da camada de dados
- **🛡️ SOLID Principles:** Código maintível e extensível
- **🎯 Domain-Driven Design:** Foco no domínio do negócio
- **🔒 Security First:** Segurança em todas as camadas

### Fluxo de Dados

```
Client Request → Controller → Service → Repository → Database
                     ↓
              Guards/Interceptors
                     ↓
              Exception Filters
                     ↓
               Response
```

## 🧪 Testes

O projeto possui uma suíte completa de testes unitários e de integração (e2e) usando Jest.

### Configuração para Testes E2E

Antes de executar os testes e2e, certifique-se de:

1. **Configurar banco de dados de teste:**
   ```bash
   # Copiar arquivo de configuração de teste
   cp .env.example .env.test
   
   # Editar .env.test com URL do banco de teste
   # DATABASE_URL="postgresql://user:password@localhost:5432/nest_test"
   ```

2. **Executar migrações no banco de teste:**
   ```bash
   npm run test:migrate
   ```

### Comandos de Teste

```bash
# Executar todos os testes unitários
npm run test

# Executar testes em modo watch (re-executa ao salvar)
npm run test:watch

# Executar testes com relatório de cobertura
npm run test:cov

# Executar testes em modo debug
npm run test:debug

# Executar testes end-to-end (e2e)
npm run test:e2e
```

### Estrutura de Testes

```
test/
├── app.e2e-spec.ts          # Testes da aplicação principal
├── auth.e2e-spec.ts         # Testes de autenticação
├── user.e2e-spec.ts         # Testes de usuários
├── jest-e2e.json            # Configuração Jest para e2e
├── setup-e2e.ts             # Setup global para testes e2e
└── test-app.module.ts       # Módulo de teste

src/
└── **/*.spec.ts              # Testes unitários (ao lado dos arquivos)
```

### Cobertura de Testes

O projeto mantém alta cobertura de testes:
- **Testes Unitários:** Services, Repositories, Guards, Interceptors
- **Testes E2E:** Endpoints da API, Autenticação, Autorização
- **Mocks:** Banco de dados, E-mail, Serviços externos

### Executando Testes em CI/CD

```bash
# Comando completo para pipeline CI/CD
npm run lint && npm run test:cov && npm run test:e2e
```

## 📚 Documentação

### Documentação da API (OpenAPI/Swagger)

O projeto gera automaticamente documentação da API usando OpenAPI 3.0 com interface moderna do Scalar.

**Acessar a documentação:**
- **Desenvolvimento:** `http://localhost:3099/docs`
- **Produção:** `https://seu-dominio.com/docs`

**Características:**
- 📋 Documentação automática de todos os endpoints
- 🔧 Interface interativa para testar APIs
- 📝 Schemas de request/response detalhados
- 🔐 Suporte para autenticação JWT
- 📱 Interface responsiva e moderna

### Documentação do Código

Utilizamos [Compodoc](https://compodoc.app/) para gerar documentação automática dos módulos, serviços e controladores.

```bash
# Gerar documentação estática
npx compodoc -p tsconfig.json

# Gerar e servir documentação (modo watch)
npm run compodoc

# Iniciar app + documentação simultaneamente
npm run start:all
```

**A documentação inclui:**
- 🏗️ Arquitetura e estrutura dos módulos
- 📊 Gráficos de dependências
- 📖 Documentação de classes e métodos
- 🔍 Busca integrada
- 📈 Métricas de cobertura

### Cliente de API (Bruno)

O projeto inclui uma coleção completa do [Bruno](https://www.usebruno.com/) para testar a API:

```
bruno/
├── auth/                     # Endpoints de autenticação
│   ├── login.bru
│   ├── register.bru
│   ├── forgot-password.bru
│   └── reset-password.bru
├── users/                    # Endpoints de usuários
│   ├── get-all-users.bru
│   ├── get-user-by-id.bru
│   ├── update-user.bru
│   ├── delete-user.bru
│   └── create-user-admin.bru # 🔐 Criação administrativa (ADMIN only)
├── audit/                    # Logs de auditoria (ADMIN only)
├── monitoring/               # Métricas de performance (ADMIN only)
├── health/                   # Health checks (público)
└── environments/             # Configurações de ambiente
    ├── local.bru
    └── docker.bru
```

**Para usar:**
1. Instale o [Bruno](https://www.usebruno.com/)
2. Abra a pasta `bruno/` no Bruno
3. Configure o ambiente (local/docker)
4. Execute as requisições

## Licença

Este projeto é licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.
