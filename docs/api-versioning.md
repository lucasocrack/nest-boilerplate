# Versionamento de API

## Visão Geral

Este projeto implementa versionamento de API usando o sistema nativo do NestJS, permitindo múltiplas versões da API coexistirem e garantindo backward compatibility.

## Configuração

### Configuração Principal

O versionamento está configurado no arquivo `main.ts`:

```typescript
app.enableVersioning({
  type: VersioningType.URI,
  prefix: 'v',
  defaultVersion: '1',
});
```

### Formato de URLs

- **Versão 1 (padrão)**: `/v1/auth/signin` ou `/auth/signin`
- **Versão 2**: `/v2/auth/signin`
- **Versão específica**: `/v{version}/endpoint`

## Estrutura de Versões

### Versão 1 (v1) - Atual

- **Status**: Estável e em produção
- **Endpoints**: Todos os controllers principais
- **Características**:
  - Autenticação JWT básica
  - Respostas padrão
  - Funcionalidades core completas

### Versão 2 (v2) - Exemplo

- **Status**: Demonstração/Desenvolvimento
- **Endpoints**: Auth endpoints aprimorados
- **Características**:
  - Respostas com metadados adicionais
  - Informações de contexto (IP, User-Agent, timestamp)
  - Backward compatibility mantida

## Implementação de Novas Versões

### 1. Criando um Controller Versionado

```typescript
@Controller({ path: 'auth', version: '2' })
export class AuthV2Controller {
  // Implementação da nova versão
}
```

### 2. Registrando no Módulo

```typescript
@Module({
  controllers: [AuthController, AuthV2Controller],
  // ...
})
export class AuthModule {}
```

### 3. Documentação no Swagger

```typescript
@ApiTags('Autenticação v2')
@ApiOperation({ 
  summary: 'Endpoint v2 com funcionalidades aprimoradas',
  description: 'Versão 2 com melhorias...'
})
```

## Estratégias de Versionamento

### 1. Backward Compatibility

- **Princípio**: Versões antigas continuam funcionando
- **Implementação**: Manter controllers v1 ativos
- **Deprecação**: Gradual com avisos prévios

### 2. Evolução de Endpoints

#### Adição de Campos (Compatível)
```typescript
// v1
{ access_token: string, refresh_token: string }

// v2 (adiciona campos)
{ 
  access_token: string, 
  refresh_token: string,
  metadata: { ... } // Novo campo
}
```

#### Mudança de Estrutura (Incompatível)
```typescript
// v1
{ user: { id, name, email } }

// v2 (estrutura diferente)
{ 
  user: { 
    profile: { id, name, email },
    preferences: { ... }
  } 
}
```

### 3. Reutilização de Serviços

```typescript
@Controller({ path: 'auth', version: '2' })
export class AuthV2Controller {
  constructor(private readonly authService: AuthService) {}
  
  async signIn(dto: SignInDto, req: Request) {
    // Reutiliza o mesmo service
    const result = await this.authService.signIn(dto, ip, userAgent);
    
    // Adapta a resposta para v2
    return {
      ...result,
      metadata: { /* dados adicionais */ }
    };
  }
}
```

## Boas Práticas

### 1. Planejamento de Versões

- **Versionamento Semântico**: Major.Minor.Patch
- **Ciclo de Vida**: Desenvolvimento → Estável → Deprecated → Removida
- **Comunicação**: Avisos prévios de deprecação

### 2. Documentação

- **Swagger Tags**: Separar por versão (`Auth v1`, `Auth v2`)
- **Descrições**: Explicar diferenças entre versões
- **Exemplos**: Mostrar migração entre versões

### 3. Testes

```typescript
describe('Auth v1', () => {
  it('should maintain backward compatibility', () => {
    // Testes para v1
  });
});

describe('Auth v2', () => {
  it('should provide enhanced features', () => {
    // Testes para v2
  });
});
```

### 4. Monitoramento

- **Métricas por Versão**: Uso de cada versão
- **Logs**: Identificar versão nas requisições
- **Alertas**: Uso de versões deprecated

## Migração de Clientes

### 1. Comunicação

```markdown
## Migração v1 → v2

### Mudanças:
- Resposta inclui campo `metadata`
- Novos campos de contexto

### Timeline:
- v2 disponível: 01/01/2024
- v1 deprecated: 01/06/2024
- v1 removida: 01/01/2025
```

### 2. Guia de Migração

```typescript
// v1 (antigo)
const response = await fetch('/v1/auth/signin', { ... });
const { access_token } = await response.json();

// v2 (novo)
const response = await fetch('/v2/auth/signin', { ... });
const { access_token, metadata } = await response.json();
```

## Configurações Avançadas

### 1. Versionamento por Header

```typescript
app.enableVersioning({
  type: VersioningType.HEADER,
  header: 'X-API-Version',
});
```

### 2. Versionamento por Media Type

```typescript
app.enableVersioning({
  type: VersioningType.MEDIA_TYPE,
  key: 'v=',
});
```

### 3. Múltiplas Versões Suportadas

```typescript
@Controller({ path: 'auth', version: ['1', '2'] })
export class AuthController {
  @Version('1')
  signInV1() { /* implementação v1 */ }
  
  @Version('2')
  signInV2() { /* implementação v2 */ }
}
```

## Exemplo Prático

### Cenário: Adicionando Metadados de Segurança

**v1 (atual)**:
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 900
}
```

**v2 (nova)**:
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 900,
  "metadata": {
    "loginTime": "2024-01-01T10:00:00Z",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "apiVersion": "v2"
  }
}
```

### Implementação

1. **Manter v1 inalterada** para backward compatibility
2. **Criar AuthV2Controller** com resposta aprimorada
3. **Documentar diferenças** no Swagger
4. **Comunicar migração** aos clientes
5. **Monitorar uso** de ambas versões

## Conclusão

O sistema de versionamento implementado permite:

- ✅ **Evolução contínua** da API
- ✅ **Backward compatibility** garantida
- ✅ **Migração gradual** de clientes
- ✅ **Documentação clara** das versões
- ✅ **Flexibilidade** para diferentes estratégias

Este approach garante que a API possa evoluir sem quebrar integrações existentes, mantendo a estabilidade do sistema em produção.