# 🐳 Guia de Uso do Docker (Windows)

Este guia explica como usar o Docker para executar o projeto NestJS com PostgreSQL **especificamente no Windows**.

## 📋 Pré-requisitos (Windows)

- **Windows 10/11** com WSL2 habilitado
- **Docker Desktop for Windows** instalado e configurado
- **WSL2** configurado com distribuição Linux (Ubuntu recomendado)
- **PowerShell** ou **Git Bash** como terminal

### ⚙️ Configuração Inicial do Windows

1. **Habilitar WSL2**:
   ```powershell
   # Execute como Administrador
   dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
   dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
   ```

2. **Instalar Docker Desktop**:
   - Baixe do site oficial: https://www.docker.com/products/docker-desktop
   - Durante a instalação, marque "Use WSL 2 instead of Hyper-V"

3. **Configurar Docker Desktop**:
   - Abra Docker Desktop
   - Vá em Settings > General
   - Marque "Use the WSL 2 based engine"
   - Em Resources > WSL Integration, habilite sua distribuição Linux

## 🚀 Comandos Básicos

### Iniciar os containers
```bash
wsl docker compose up -d
```
Este comando:
- Inicia os containers em modo detached (background)
- Cria automaticamente o banco PostgreSQL
- Executa as migrações do Prisma
- Roda o seed inicial
- Inicia a aplicação NestJS na porta 3099

### Verificar status dos containers
```bash
wsl docker compose ps
```
Mostra o status de todos os containers (rodando, parado, etc.)

### Ver logs da aplicação
```bash
# Ver todos os logs da API
wsl docker compose logs api

# Ver logs em tempo real
wsl docker compose logs -f api

# Ver últimas 20 linhas
wsl docker compose logs api --tail=20

# Ver logs do banco de dados
wsl docker compose logs db
```

### Parar containers
```bash
# Parar containers (mantém volumes)
wsl docker compose down

# Parar e remover volumes (apaga dados do banco)
wsl docker compose down -v
```

### Reiniciar containers
```bash
# Reiniciar todos os containers
wsl docker compose restart

# Reiniciar apenas a API
wsl docker compose restart api
```

## 🔧 Comandos Avançados

### Executar comandos dentro do container
```bash
# Acessar shell do container da API
wsl docker compose exec api bash

# Executar comandos Prisma
wsl docker compose exec api npx prisma studio
wsl docker compose exec api npx prisma migrate reset
wsl docker compose exec api npm run seed

# Instalar novas dependências
wsl docker compose exec api npm install <pacote>
```

### Rebuild dos containers
```bash
# Rebuild e restart
wsl docker compose up -d --build

# Rebuild apenas a API
wsl docker compose build api
wsl docker compose up -d api
```

### Monitoramento
```bash
# Ver uso de recursos
wsl docker stats

# Ver informações detalhadas
wsl docker compose top
```

## 🌐 Acessos

- **API**: http://localhost:3099
- **Documentação Swagger**: http://localhost:3099/docs
- **Banco PostgreSQL**: 
  - Host: localhost
  - Porta: 5432
  - Database: nest_boilerplate
  - User: postgres
  - Password: postgres123

## 📁 Estrutura dos Containers

### Container `api`
- **Imagem**: Node.js 18 Alpine
- **Porta**: 3099
- **Volume**: Código fonte mapeado para desenvolvimento
- **Dependências**: Instala automaticamente via npm

### Container `db`
- **Imagem**: PostgreSQL 15 Alpine
- **Porta**: 5432
- **Volume**: `postgres_data` para persistência
- **Health Check**: Verifica conectividade automaticamente

## 🔄 Fluxo de Inicialização

1. **Banco de dados** inicia primeiro
2. **Health check** verifica se o PostgreSQL está pronto
3. **API** aguarda o banco estar saudável
4. **Prisma** sincroniza o schema (`db push`)
5. **Seed** executa dados iniciais
6. **NestJS** inicia na porta 3099

## 🛠️ Troubleshooting

### Container não inicia
```bash
# Ver logs detalhados
wsl docker compose logs api

# Verificar se as portas estão livres
netstat -an | findstr :3099
netstat -an | findstr :5432
```

### Problemas com banco de dados
```bash
# Reset completo do banco
wsl docker compose down -v
wsl docker compose up -d

# Executar migrações manualmente
wsl docker compose exec api npx prisma migrate reset
```

### Problemas específicos do Windows

**Problemas de permissão (WSL)**:
```bash
# Verificar se o Docker está rodando
wsl docker --version

# Reiniciar Docker Desktop se necessário
```

**Docker Desktop não inicia**:
```powershell
# Verificar se WSL2 está funcionando
wsl --list --verbose

# Reiniciar WSL2 se necessário
wsl --shutdown
# Aguarde alguns segundos e tente novamente
```

**Erro de conectividade WSL**:
```powershell
# Verificar se Docker Desktop está rodando
Get-Process "Docker Desktop"

# Reiniciar serviços do Docker
Restart-Service docker
```

**Problemas de performance no Windows**:
- Certifique-se que o projeto está na partição WSL2 (`\\wsl$\Ubuntu\home\user\`)
- Evite executar o projeto em drives Windows (C:, D:) para melhor performance
- Configure adequadamente a memória do WSL2 em `.wslconfig`

### Limpar cache do Docker
```bash
# Remover containers parados
wsl docker container prune

# Remover imagens não utilizadas
wsl docker image prune

# Limpeza completa (cuidado!)
wsl docker system prune -a
```

## 📝 Variáveis de Ambiente

O projeto usa o arquivo `.env.docker` para configurações específicas do Docker:

```env
DATABASE_URL="postgresql://postgres:postgres123@db:5432/nest_boilerplate"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
EMAIL_ENABLED="false"
# ... outras configurações
```

## 🔐 Dados Iniciais (Seed)

Após a inicialização, um usuário administrador é criado:

- **Email**: admin@example.com
- **Senha**: Admin123!
- **Role**: ADMIN

Use essas credenciais para fazer login inicial na aplicação.

## 📚 Comandos de Desenvolvimento

```bash
# Modo desenvolvimento com hot reload
wsl docker compose -f docker-compose.dev.yml up -d

# Executar testes
wsl docker compose exec api npm test
wsl docker compose exec api npm run test:e2e

# Verificar qualidade do código
wsl docker compose exec api npm run lint
wsl docker compose exec api npm run format
```

---

## 🪟 Notas Específicas do Windows

**💡 Dicas importantes para Windows**:
- Mantenha o **Docker Desktop** sempre atualizado
- Configure adequadamente o **WSL2** para melhor performance
- Use **PowerShell** como administrador quando necessário
- Prefira executar o projeto dentro do **sistema de arquivos WSL2** (`\\wsl$\Ubuntu\`)
- Configure o arquivo `.wslconfig` para otimizar recursos do WSL2

**🔧 Arquivo .wslconfig recomendado** (em `C:\Users\<seu-usuario>\.wslconfig`):
```ini
[wsl2]
memory=4GB
processors=2
swap=1GB
```

**📱 Atalhos úteis no Windows**:
- `Win + R` → `wsl` → Enter (abre terminal WSL)
- `Win + X` → `A` (abre PowerShell como administrador)
- Docker Desktop pode ser acessado via system tray

> Este guia foi otimizado especificamente para **Windows 10/11 com WSL2 e Docker Desktop**.