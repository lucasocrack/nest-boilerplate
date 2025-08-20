# NestJS Prisma Boilerplate

Este é um projeto boilerplate para iniciar aplicações com [NestJS](https://nestjs.com/) e [Prisma](https://www.prisma.io/). Ele vem com uma série de funcionalidades pré-configuradas para acelerar o seu desenvolvimento.

Criado e mantido por [lucascampos42](https://github.com/lucascampos42).

## Funcionalidades

*   **Framework:** [NestJS](https://nestjs.com/) - Um framework Node.js progressivo para construir aplicações server-side eficientes e escaláveis.
*   **ORM:** [Prisma](https://www.prisma.io/) - ORM de próxima geração para Node.js e TypeScript.
*   **Autenticação:** Autenticação completa com JWT (login e registro).
*   **Autorização:** Controle de acesso baseado em papéis (Role-Based Access Control - RBAC) com guards.
*   **Notificações de Segurança:** Sistema de alertas por e-mail para logins suspeitos, múltiplas tentativas de login e bloqueios de conta.
*   **Logs de Ações do Usuário:** Middleware para registrar automaticamente as ações dos usuários em uma tabela de log no banco de dados.
*   **Docker:** Configuração completa com `Dockerfile` e `docker-compose.yml` para um ambiente de desenvolvimento e produção containerizado.
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

### Populando o Banco de Dados (Seeding)

Este projeto inclui um script de seed para popular o banco de dados com dados iniciais. Atualmente, ele cria um usuário administrador padrão.

Para rodar o script de seed, execute o seguinte comando:

```bash
npm run seed
```

O usuário administrador será criado com as seguintes credenciais:
- **E-mail:** `admin@admin.com`
- **Senha:** `12345678`

## Rodando a Aplicação

### Com NPM

```bash
# Modo de desenvolvimento
$ npm run start:dev
```

### Com Docker

1.  Construa a imagem Docker:
    ```bash
    docker-compose build
    ```
2.  Inicie os containers:
    ```bash
    docker-compose up
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

## Rodando os Testes

```bash
# Testes unitários
$ npm run test

# Testes end-to-end (e2e)
# Certifique-se de ter um banco de dados de teste rodando
$ npm run test:e2e
```

## Documentação do Código

Este projeto utiliza o [Compodoc](https://compodoc.app/) para gerar documentação automática dos módulos, serviços e controladores.

### Como Gerar a Documentação

```bash
# Gerar documentação estática
npx compodoc -p tsconfig.json

# ou 
$ npm run compodoc

```

## Licença

Este projeto é licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.
