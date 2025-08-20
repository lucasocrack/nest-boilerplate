# ResponseHelper - Guia de Uso

O `ResponseHelper` é um utilitário que facilita a criação de respostas padronizadas com mensagens humorísticas em toda a API.

## 📍 Localização

```
src/core/utils/response-helper.ts
```

## 🎯 Objetivo

Padronizar todas as respostas da API com:
- Códigos de status HTTP consistentes
- Mensagens humorísticas e memoráveis
- Estrutura de resposta uniforme
- Timestamps automáticos

## 🚀 Métodos Disponíveis

### `ResponseHelper.success(data, statusCode?, customMessage?)`

Cria uma resposta de sucesso genérica.

```typescript
// Uso básico
return ResponseHelper.success(users);
// Resultado: { statusCode: 200, message: "O raro momento em que tudo funciona", data: users, timestamp: "..." }

// Com código personalizado
return ResponseHelper.success(data, HttpStatus.ACCEPTED);
// Resultado: { statusCode: 202, message: "Aceito, mas ainda processando", data: data, timestamp: "..." }

// Com mensagem personalizada
return ResponseHelper.success(users, HttpStatus.OK, "Usuários encontrados com sucesso!");
// Resultado: { statusCode: 200, message: "Usuários encontrados com sucesso!", data: users, timestamp: "..." }
```

### `ResponseHelper.created(data, customMessage?)`

Cria uma resposta para recursos criados (201).

```typescript
@Post()
async createUser(@Body() createUserDto: CreateUserDto) {
  const user = await this.userService.create(createUserDto);
  return ResponseHelper.created(user);
}
// Resultado: { statusCode: 201, message: "Criado. E você jurando que não ia dar certo", data: user, timestamp: "..." }

// Com mensagem personalizada
return ResponseHelper.created(user, "Usuário criado com sucesso!");
```

### `ResponseHelper.noContent(customMessage?)`

Cria uma resposta sem conteúdo (204).

```typescript
@Delete(':id')
async deleteUser(@Param('id') id: string) {
  await this.userService.remove(id);
  return ResponseHelper.noContent();
}
// Resultado: { statusCode: 204, message: "OK, mas sem resposta... tipo ghosting", timestamp: "..." }

// Com mensagem personalizada
return ResponseHelper.noContent("Usuário removido com sucesso!");
```

### `ResponseHelper.custom(statusCode, data?, customMessage?)`

Cria uma resposta totalmente personalizada.

```typescript
// Resposta personalizada com dados
return ResponseHelper.custom(HttpStatus.PARTIAL_CONTENT, partialData);

// Resposta personalizada sem dados
return ResponseHelper.custom(HttpStatus.NOT_MODIFIED);

// Resposta personalizada com mensagem específica
return ResponseHelper.custom(HttpStatus.ACCEPTED, processData, "Processamento iniciado");
```

## 📋 Exemplos Práticos por Controller

### AuthController

```typescript
@Controller('auth')
export class AuthController {
  @Post('login')
  @IsPublic()
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return ResponseHelper.success(result, HttpStatus.OK, "Login realizado com sucesso!");
  }

  @Post('register')
  @IsPublic()
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.register(createUserDto);
    return ResponseHelper.created(user, "Conta criada! Verifique seu email para ativação.");
  }

  @Post('logout')
  async logout(@Req() req: AuthRequest) {
    await this.authService.logout(req.user.userId);
    return ResponseHelper.noContent("Logout realizado com sucesso!");
  }
}
```

### UserController

```typescript
@Controller('users')
export class UserController {
  @Get()
  async findAll(@Query() query: any) {
    const users = await this.userService.findAll(query);
    return ResponseHelper.success(users);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return ResponseHelper.success(user);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.userService.update(id, updateUserDto);
    return ResponseHelper.success(user, HttpStatus.OK, "Usuário atualizado com sucesso!");
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.userService.remove(id);
    return ResponseHelper.noContent();
  }

  @Post(':id/block')
  async blockUser(@Param('id') id: string) {
    await this.userService.blockUser(id);
    return ResponseHelper.success(null, HttpStatus.OK, "Usuário bloqueado com sucesso!");
  }
}
```

## 🎨 Mensagens Padrão por Código de Status

| Código | Mensagem Padrão |
|--------|------------------|
| 200 | "O raro momento em que tudo funciona" |
| 201 | "Criado. E você jurando que não ia dar certo" |
| 204 | "OK, mas sem resposta... tipo ghosting" |
| 301 | "Mudou de endereço, mas te avisa" |
| 302 | "Mudou temporariamente (vida de nômade)" |
| 400 | "A culpa é do usuário. Sempre" |
| 401 | "Você não tem permissão, jovem gafanhoto" |
| 403 | "Mesmo com permissão, não entra" |
| 404 | "O clássico: só existe em produção" |
| 429 | "Muitas requisições (rate limiting ativo)" |
| 500 | "Hora de culpar a infra" |
| 501 | "Ainda não implementado (e talvez nunca seja)" |
| 502 | "O servidor surtou, tente mais tarde" |
| 503 | "O serviço decidiu tirar férias" |
| 504 | "O servidor está te ignorando" |

## 🔄 Aplicação Automática

### ResponseFormatInterceptor

Todas as respostas de sucesso são automaticamente formatadas pelo interceptor:

```typescript
// Controller retorna:
return { message: 'Hello World' };

// Cliente recebe:
{
  "statusCode": 200,
  "message": "O raro momento em que tudo funciona",
  "data": { "message": "Hello World" },
  "timestamp": "2025-08-20T04:13:43.616Z"
}
```

### GlobalExceptionFilter

Todos os erros são automaticamente formatados:

```typescript
// Quando ocorre um erro 404:
{
  "statusCode": 404,
  "message": "O clássico: só existe em produção",
  "error": "Not Found",
  "timestamp": "2025-08-20T04:13:43.616Z",
  "path": "/users/999"
}
```

## 🎯 Quando Usar Cada Método

### Use `ResponseHelper.success()`
- Operações de leitura (GET)
- Operações de atualização (PATCH/PUT)
- Qualquer operação que retorna dados

### Use `ResponseHelper.created()`
- Criação de recursos (POST)
- Quando algo novo é adicionado ao sistema

### Use `ResponseHelper.noContent()`
- Operações de exclusão (DELETE)
- Operações que não retornam dados
- Ações que foram executadas mas não têm resposta

### Use `ResponseHelper.custom()`
- Códigos de status específicos (202, 206, etc.)
- Situações que não se encaixam nos métodos padrão
- Quando precisa de controle total sobre a resposta

## 💡 Dicas e Boas Práticas

### 1. Consistência
```typescript
// ✅ Bom: Usar o helper consistentemente
return ResponseHelper.success(data);

// ❌ Evitar: Misturar formatos
return { data, message: 'Success' };
```

### 2. Mensagens Personalizadas
```typescript
// ✅ Bom: Mensagens específicas para o contexto
return ResponseHelper.created(user, "Usuário criado! Verifique seu email.");

// ✅ Também bom: Usar mensagem padrão quando apropriado
return ResponseHelper.created(user);
```

### 3. Códigos de Status Apropriados
```typescript
// ✅ Bom: Código correto para a operação
return ResponseHelper.success(data, HttpStatus.ACCEPTED); // Para operações assíncronas

// ❌ Evitar: Código incorreto
return ResponseHelper.success(data, HttpStatus.CREATED); // Para operações de leitura
```

### 4. Tratamento de Erros
```typescript
// ✅ Bom: Deixar o GlobalExceptionFilter tratar erros
if (!user) {
  throw new NotFoundException('Usuário não encontrado');
}
return ResponseHelper.success(user);

// ❌ Evitar: Retornar erro como sucesso
if (!user) {
  return ResponseHelper.custom(404, null, 'Usuário não encontrado');
}
```

## 🧪 Testando Respostas

### Teste de Unidade
```typescript
describe('UserController', () => {
  it('should return formatted response', async () => {
    const result = await controller.findAll();
    
    expect(result).toHaveProperty('statusCode', 200);
    expect(result).toHaveProperty('message');
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('timestamp');
  });
});
```

### Teste E2E
```typescript
it('/users (GET)', () => {
  return request(app.getHttpServer())
    .get('/users')
    .expect(200)
    .expect((res) => {
      expect(res.body.message).toBe('O raro momento em que tudo funciona');
      expect(res.body.data).toBeDefined();
    });
});
```

## 🔗 Arquivos Relacionados

- **ResponseHelper**: `src/core/utils/response-helper.ts`
- **ResponseFormatInterceptor**: `src/core/interceptors/response-format.interceptor.ts`
- **GlobalExceptionFilter**: `src/core/filters/global-exception.filter.ts`
- **Documentação de Segurança**: `SECURITY.md`

---

*Este utilitário faz parte do sistema de padronização de respostas da API, garantindo consistência e personalidade em todas as interações.*