# Segurança da Aplicação

## Visão Geral

Esta aplicação implementa um sistema de segurança **secure-by-default** com múltiplas camadas de proteção:
- Todas as rotas são protegidas por padrão
- Rate limiting global e específico para autenticação
- Bloqueio automático por tentativas excessivas
- Logs detalhados de tentativas de login
- Sistema de refresh tokens seguro

## Arquitetura de Segurança

### Global Auth Guard (`GlobalAuthGuard`)

- **Localização**: `src/core/guards/global-auth.guard.ts`
- **Funcionamento**: Aplicado globalmente a todas as rotas
- **Comportamento**:
  - Verifica se a rota tem o decorator `@IsPublic()`
  - Se for pública: permite acesso
  - Se não for pública: exige token JWT válido

### Decorator @IsPublic()

- **Localização**: `src/core/decorators/is-public.decorator.ts`
- **Uso**: Marcar rotas que devem ser acessíveis sem autenticação
- **Exemplo**:
```typescript
@Post('login')
@IsPublic()
async login(@Body() loginDto: LoginDto) {
  // código...
}
```

### Rotas Públicas Atuais

- `GET /` - Home page
- `POST /auth/login` - Login (com rate limiting específico)
- `POST /auth/register` - Registro (com rate limiting específico)
- `POST /auth/forgot-password` - Esqueci minha senha (com rate limiting específico)
- `POST /auth/reset-password` - Reset de senha
- `POST /auth/activate` - Ativação de conta
- `POST /auth/resend-activation` - Reenvio de ativação
- `POST /auth/refresh` - Refresh token

### Rotas Protegidas

Todas as outras rotas requerem token JWT válido:

- `GET /auth/me` - Perfil do usuário
- `POST /auth/logout` - Logout
- `GET /users` - Listar usuários
- `GET /users/:id` - Buscar usuário
- `PATCH /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Deletar usuário
- `GET /logs` - Logs do sistema

## Rate Limiting e Proteção contra Ataques

### ThrottlerModule (Rate Limiting)

- **Localização**: Configurado em `app.module.ts`
- **Configurações**:
  - **Global**: 3 níveis de proteção
    - `short`: 10 requisições por 1 minuto
    - `medium`: 20 requisições por 10 minutos
    - `long`: 100 requisições por 1 hora
  - **Autenticação**: 5 tentativas por minuto para rotas de login/registro

### Decorator @AuthThrottle()

- **Localização**: `src/core/decorators/auth-throttle.decorator.ts`
- **Uso**: Aplicado automaticamente às rotas de autenticação
- **Proteção**: Limita tentativas de login/registro a 5 por minuto

### Bloqueio Automático por Tentativas Excessivas

- **Modelo User**: Campos `loginAttempts` e `lastFailedLogin`
- **Lógica**: Implementada em `auth.service.ts`
- **Comportamento**:
  - Após 5 tentativas de login incorretas: conta bloqueada por 15 minutos
  - Reset automático do contador após login bem-sucedido
  - Desbloqueio automático após período de 15 minutos

```typescript
// Exemplo de uso no modelo User
model User {
  // ... outros campos
  loginAttempts Int @default(0)
  lastFailedLogin DateTime?
}
```

### Logs de Tentativas de Login

- **Status Atual**: ⚠️ **Parcial** - O middleware atual não registra erros (statusCode >= 400)
- **Localização**: `src/application/log/middleware/log.middleware.ts`
- **Limitação**: Linha 14-16 do middleware exclui logs de erros:
```typescript
if (statusCode >= 400) {
  return; // Don't log client or server errors for now
}
```

#### 💡 **Recomendação**: Implementar Logs Específicos para Falhas de Login

**Solução Sugerida**: Criar um sistema de logs dedicado para tentativas de autenticação:

```typescript
// Em auth.service.ts - método signIn
private async logFailedLogin(email: string, ip: string, userAgent: string) {
  await this.logService.createLog({
    route: '/auth/login',
    method: 'POST',
    details: {
      email,
      ip,
      userAgent,
      reason: 'invalid_credentials',
      timestamp: new Date(),
    },
    level: 'SECURITY_WARNING'
  });
}
```

**Benefícios**:
- Rastreamento de tentativas de força bruta
- Identificação de IPs suspeitos
- Análise de padrões de ataque
- Compliance com requisitos de auditoria

## Tratamento de Exceções

### Global Exception Filter (`GlobalExceptionFilter`)

- **Localização**: `src/core/filters/global-exception.filter.ts`
- **Função**: Padroniza todas as respostas de erro
- **Formato das respostas**:
```json
{
  "statusCode": 401,
  "message": "Token de acesso é obrigatório",
  "error": "Unauthorized", 
  "timestamp": "2025-08-11T04:25:54.203Z",
  "path": "/users"
}
```

### Exceções Customizadas

- **Localização**: `src/core/exceptions/custom-exceptions.ts`
- **Tipos disponíveis**:
  - `BadRequestException` (400)
  - `UnauthorizedException` (401)
  - `ForbiddenException` (403)
  - `NotFoundException` (404)
  - `ConflictException` (409)
  - `UnprocessableEntityException` (422)
  - `InternalServerErrorException` (500)

## Como Adicionar Novas Rotas

### Rota Protegida (padrão)
```typescript
@Controller('exemplo')
export class ExemploController {
  @Get()
  async buscarTodos() {
    // Esta rota está automaticamente protegida
    return this.exemploService.findAll();
  }
}
```

### Rota Pública
```typescript
@Controller('exemplo')
export class ExemploController {
  @Get('publico')
  @IsPublic()
  async rotaPublica() {
    // Esta rota é acessível sem autenticação
    return { message: 'Dados públicos' };
  }
}
```

## Benefícios desta Arquitetura

1. **Segurança por Padrão**: Impossível criar rotas desprotegidas acidentalmente
2. **Proteção contra Ataques**: Rate limiting e bloqueio automático previnem ataques de força bruta
3. **Clareza**: Rotas públicas são explicitamente marcadas
4. **Padronização**: Todas as respostas de erro seguem o mesmo formato
5. **Manutenibilidade**: Fácil identificação de rotas públicas vs protegidas
6. **Monitoramento**: Logs detalhados permitem análise de tentativas de acesso
7. **Flexibilidade**: Permite diferentes tipos de autenticação no futuro
8. **Escalabilidade**: Rate limiting protege contra sobrecarga do sistema

## Troubleshooting

### Problemas de Autenticação

#### "Token de acesso é obrigatório"
- Rota não marcada com `@IsPublic()` e sem token
- **Solução**: Adicionar `@IsPublic()` se for rota pública, ou enviar token válido

#### "Token de acesso inválido ou expirado"
- Token JWT inválido ou expirado
- **Solução**: Fazer login novamente para obter novo token

#### Rota não funcionando após mudanças
- Verificar se `@IsPublic()` foi adicionado às rotas públicas
- Verificar se import do decorator está correto

### Problemas de Rate Limiting

#### "Too Many Requests" (429)
- Muitas requisições em pouco tempo
- **Solução**: Aguardar o período de reset do rate limit
- **Prevenção**: Implementar retry com backoff exponencial no frontend

#### Rate limiting não funcionando
- Verificar se `ThrottlerModule` está configurado em `app.module.ts`
- Verificar se `ThrottlerGuard` está registrado como `APP_GUARD`

### Problemas de Bloqueio de Conta

#### "Conta temporariamente bloqueada"
- Muitas tentativas de login incorretas (5 tentativas)
- **Solução**: Aguardar 15 minutos ou usar recuperação de senha
- **Prevenção**: Verificar credenciais antes de tentar login

#### Contador de tentativas não resetando
- Verificar se campos `loginAttempts` e `lastFailedLogin` existem no modelo User
- Verificar se migração do banco foi aplicada corretamente

### Problemas de Logs

#### Logs de tentativas de login não aparecendo
- Verificar configuração do sistema de logs
- Verificar se middleware de logging está ativo
- Verificar nível de log configurado

## Configurações de Segurança

### Variáveis de Ambiente

```env
# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
REFRESH_TOKEN_TTL=7d

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=10

# Account Security
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCK_TIME=15m
```

### Modelo User - Campos de Segurança

```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  password        String
  // ... outros campos
  
  // Campos de segurança para bloqueio automático
  loginAttempts   Int       @default(0)  // Contador de tentativas de login
  lastFailedLogin DateTime?              // Timestamp da última tentativa falhada
  
  // Campos para refresh token
  refreshToken    String?
  tokenVersion    Int       @default(0)
  
  @@map("users")
}
```

### Configurações Recomendadas

1. **JWT Tokens**:
   - Access Token: 15 minutos (curto para segurança)
   - Refresh Token: 7 dias (permite renovação sem re-login)

2. **Rate Limiting**:
   - Global: Configuração em 3 níveis para diferentes janelas de tempo
   - Autenticação: Limite específico mais restritivo (5/min)

3. **Bloqueio de Conta**:
   - Máximo 5 tentativas de login incorretas
   - Bloqueio por 15 minutos
   - Reset automático após login bem-sucedido

## Fluxo de Refresh Token

- Endpoint público: `POST /auth/refresh`
- Request body:
```json
{ "refreshToken": "<token>" }
```
- Retorno:
```json
{ "access_token": "...", "refresh_token": "..." }
```
- Implementação:
  - Assina refresh tokens com segredo próprio `JWT_REFRESH_SECRET` e TTL `REFRESH_TOKEN_TTL` (padrão: 7d)
  - Valida `tokenVersion` para invalidar tokens no logout/rotate
  - Incremento de `tokenVersion` e limpeza de `refreshToken` no logout

## Melhores Práticas de Implementação

### Frontend

1. **Interceptors HTTP**: Implementar retry automático com backoff exponencial
2. **Token Management**: Armazenar tokens de forma segura (httpOnly cookies)
3. **Error Handling**: Tratar adequadamente erros 429 (Too Many Requests)
4. **User Feedback**: Informar usuário sobre bloqueios temporários

### Backend

1. **Logs Estruturados**: Usar formato JSON para facilitar análise
2. **Monitoramento**: Implementar alertas para tentativas de ataque
3. **Rate Limiting**: Ajustar limites conforme necessidade da aplicação
4. **Database Indexes**: Criar índices nos campos de segurança para performance

```sql
-- Índices recomendados para performance
CREATE INDEX idx_users_login_attempts ON users(loginAttempts);
CREATE INDEX idx_users_last_failed_login ON users(lastFailedLogin);
```

## Códigos de Status HTTP Padronizados

### 📋 Guia de Códigos de Resposta

Esta API segue um padrão consistente de códigos HTTP com descrições claras:

#### ✅ **Success (2xx)**
- **200 Success**: O raro momento em que tudo funciona
- **201 Success**: Criado. E você jurando que não ia dar certo
- **204 Success**: OK, mas sem resposta... tipo ghosting

#### 🔄 **Redirect (3xx)**
- **301 Redirect**: Mudou de endereço, mas te avisa
- **302 Redirect**: Mudou temporariamente (vida de nômade)

#### ❌ **Client Error (4xx)**
- **400 Client Error**: A culpa é do usuário. Sempre
- **401 Client Error**: Você não tem permissão, jovem gafanhoto
- **403 Client Error**: Mesmo com permissão, não entra
- **404 Client Error**: O clássico: só existe em produção
- **429 Client Error**: Muitas requisições (rate limiting ativo)

#### 💥 **Server Error (5xx)**
- **500 Server Error**: Hora de culpar a infra
- **501 Server Error**: "Ainda não implementado" (e talvez nunca seja)
- **502 Server Error**: O servidor surtou, tente mais tarde
- **503 Server Error**: O serviço decidiu tirar férias
- **504 Server Error**: O servidor está te ignorando

### 🛠️ **Implementação na API**

Todos os endpoints seguem este padrão de resposta:

```typescript
// Exemplo de resposta de erro padronizada
{
  "statusCode": 401,
  "message": "Você não tem permissão, jovem gafanhoto",
  "error": "Unauthorized",
  "timestamp": "2025-08-20T03:55:54.203Z",
  "path": "/users"
}
```

```typescript
// Exemplo de resposta de sucesso
{
  "statusCode": 200,
  "data": { /* dados da resposta */ },
  "message": "O raro momento em que tudo funciona"
}
```

### 📝 **Boas Práticas para Desenvolvedores**

1. **Consistência**: Sempre use os códigos apropriados para cada situação
2. **Mensagens Claras**: As mensagens devem ser informativas e, quando apropriado, com um toque de humor
3. **Logs Detalhados**: Erros 5xx devem sempre gerar logs detalhados para debugging
4. **Rate Limiting**: Código 429 é automaticamente retornado pelo ThrottlerModule
5. **Documentação**: Mantenha a documentação atualizada com novos endpoints e códigos
