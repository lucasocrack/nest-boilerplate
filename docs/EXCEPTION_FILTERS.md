# Exception Filters - Sistema de Tratamento de Exceções

Este documento descreve o sistema de Exception Filters implementado no projeto, que padroniza o tratamento de erros e exceções em toda a aplicação.

## Visão Geral

O sistema de Exception Filters é composto por filtros especializados que capturam diferentes tipos de exceções e as convertem em respostas HTTP consistentes e bem formatadas.

## Filtros Implementados

### 1. GlobalExceptionFilter

**Localização:** `src/core/filters/global-exception.filter.ts`

**Responsabilidade:** Filtro principal que captura todas as exceções não tratadas pelos filtros específicos.

**Características:**
- Trata `HttpException` do NestJS
- Gerencia erros de JWT (token expirado, inválido, etc.)
- Captura erros de tipo (`TypeError`, `SyntaxError`)
- Fornece logging estruturado para debugging
- Padroniza mensagens de erro em português

**Exemplo de resposta:**
```json
{
  "statusCode": 500,
  "message": "Erro interno do servidor",
  "error": "Internal Server Error",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/users"
}
```

### 2. ValidationExceptionFilter

**Localização:** `src/core/filters/validation-exception.filter.ts`

**Responsabilidade:** Trata especificamente erros de validação do `class-validator`.

**Características:**
- Captura `BadRequestException` com erros de validação
- Formata detalhes de validação de forma legível
- Agrupa erros por campo
- Mensagens em português

**Exemplo de resposta:**
```json
{
  "statusCode": 400,
  "message": "Dados de entrada inválidos",
  "error": "Validation Error",
  "details": {
    "email": ["Email deve ter um formato válido"],
    "password": ["Senha deve ter pelo menos 8 caracteres"]
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/auth/register"
}
```

### 3. PrismaExceptionFilter

**Localização:** `src/core/filters/prisma-exception.filter.ts`

**Responsabilidade:** Trata erros específicos do Prisma ORM.

**Características:**
- Converte códigos de erro Prisma em respostas HTTP apropriadas
- Trata violações de constraint única (P2002)
- Gerencia registros não encontrados (P2025)
- Oculta detalhes internos do banco de dados

**Códigos de erro tratados:**
- `P2002`: Violação de constraint única → 409 Conflict
- `P2025`: Registro não encontrado → 404 Not Found
- `P2003`: Violação de foreign key → 400 Bad Request
- `P2014`: Relação requerida violada → 400 Bad Request

### 4. AuthExceptionFilter

**Localização:** `src/core/filters/auth-exception.filter.ts`

**Responsabilidade:** Trata erros de autenticação e autorização.

**Características:**
- Captura `UnauthorizedException` e `ForbiddenException`
- Trata erros específicos de JWT
- Logging de segurança para auditoria
- Mensagens específicas para diferentes cenários de auth

**Exemplo de resposta:**
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Token de acesso expirado - faça login novamente",
  "error": "Unauthorized",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/users/profile"
}
```

## Configuração

### Configuração Global

O `GlobalExceptionFilter` está configurado globalmente no `app.module.ts`:

```typescript
{
  provide: APP_FILTER,
  useClass: GlobalExceptionFilter,
}
```

### Configuração Específica por Módulo

Para usar filtros específicos em módulos individuais:

```typescript
@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
  ],
})
export class UserModule {}
```

### Configuração por Controller

Para aplicar filtros específicos em controllers:

```typescript
@Controller('auth')
@UseFilters(AuthExceptionFilter)
export class AuthController {
  // ...
}
```

## Ordem de Execução

Os filtros são executados na seguinte ordem de prioridade:

1. **Filtros específicos** (por método/controller)
2. **Filtros de módulo**
3. **Filtros globais**

O primeiro filtro que capturar a exceção será responsável por tratá-la.

## Boas Práticas

### 1. Uso de Exceções Customizadas

Utilize as exceções customizadas definidas em `src/core/exceptions/custom-exceptions.ts`:

```typescript
import { BadRequestException } from '../core/exceptions/custom-exceptions';

throw new BadRequestException('Dados inválidos fornecidos');
```

### 2. Validação com class-validator

Use DTOs com validações para captura automática pelo `ValidationExceptionFilter`:

```typescript
export class CreateUserDto {
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  email: string;

  @IsStrongPassword({}, { message: 'Senha deve ser mais forte' })
  password: string;
}
```

### 3. Tratamento de Erros Prisma

Deixe que o `PrismaExceptionFilter` trate automaticamente erros do Prisma:

```typescript
// ❌ Não faça isso
try {
  await this.prisma.user.create({ data });
} catch (error) {
  if (error.code === 'P2002') {
    throw new ConflictException('Usuário já existe');
  }
}

// ✅ Faça isso
await this.prisma.user.create({ data }); // O filtro trata automaticamente
```

### 4. Logging de Segurança

O `AuthExceptionFilter` automaticamente registra tentativas de acesso não autorizado para auditoria.

### 5. Mensagens de Erro Consistentes

Todos os filtros retornam respostas no formato padronizado:

```typescript
interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
  details?: any; // Opcional, para informações adicionais
}
```

## Monitoramento e Debugging

### Logs Estruturados

Todos os filtros utilizam logging estruturado com contexto:

```typescript
this.logger.error('Erro capturado:', {
  type: exception.constructor.name,
  message: exception.message,
  url: request.url,
  method: request.method,
  stack: exception.stack
});
```

### Informações de Debug

Em ambiente de desenvolvimento, informações adicionais são incluídas nos logs para facilitar o debugging.

## Extensibilidade

### Criando Novos Filtros

Para criar um novo filtro específico:

```typescript
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';

@Catch(CustomException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: CustomException, host: ArgumentsHost) {
    // Implementação do tratamento
  }
}
```

### Adicionando ao Sistema

1. Crie o filtro em `src/core/filters/`
2. Adicione a exportação em `src/core/filters/index.ts`
3. Configure no módulo apropriado
4. Documente o comportamento

## Considerações de Segurança

- **Não exponha informações sensíveis** em mensagens de erro
- **Use logging para auditoria** de tentativas de acesso não autorizado
- **Padronize mensagens** para evitar vazamento de informações sobre a estrutura interna
- **Valide entrada** antes do processamento para evitar ataques de injeção

## Testes

Para testar os filtros de exceção:

```typescript
describe('ValidationExceptionFilter', () => {
  it('should format validation errors correctly', () => {
    const filter = new ValidationExceptionFilter();
    const mockHost = createMockArgumentsHost();
    const exception = new BadRequestException(validationErrors);
    
    filter.catch(exception, mockHost);
    
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'Dados de entrada inválidos',
      // ...
    });
  });
});
```

Este sistema de Exception Filters garante que todas as exceções sejam tratadas de forma consistente, proporcionando uma melhor experiência para os desenvolvedores e usuários da API.