# Segurança da Aplicação

## Visão Geral

Esta aplicação implementa um sistema de segurança **secure-by-default**, onde todas as rotas são protegidas por padrão e devem ser explicitamente marcadas como públicas quando necessário.

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
- `POST /auth/login` - Login
- `POST /auth/register` - Registro
- `POST /auth/forgot-password` - Esqueci minha senha
- `POST /auth/reset-password` - Reset de senha
- `POST /auth/activate` - Ativação de conta
- `POST /auth/resend-activation` - Reenvio de ativação

### Rotas Protegidas

Todas as outras rotas requerem token JWT válido:

- `GET /auth/me` - Perfil do usuário
- `POST /auth/logout` - Logout
- `GET /users` - Listar usuários
- `GET /users/:id` - Buscar usuário
- `PATCH /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Deletar usuário
- `GET /logs` - Logs do sistema

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
2. **Clareza**: Rotas públicas são explicitamente marcadas
3. **Padronização**: Todas as respostas de erro seguem o mesmo formato
4. **Manutenibilidade**: Fácil identificação de rotas públicas vs protegidas
5. **Flexibilidade**: Permite diferentes tipos de autenticação no futuro

## Troubleshooting

### "Token de acesso é obrigatório"
- Rota não marcada com `@IsPublic()` e sem token
- **Solução**: Adicionar `@IsPublic()` se for rota pública, ou enviar token válido

### "Token de acesso inválido ou expirado"
- Token JWT inválido ou expirado
- **Solução**: Fazer login novamente para obter novo token

### Rota não funcionando após mudanças
- Verificar se `@IsPublic()` foi adicionado às rotas públicas
- Verificar se import do decorator está correto
