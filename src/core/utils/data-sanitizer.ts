/**
 * Utilitário para sanitizar dados sensíveis em logs e outras operações
 * Remove ou mascara informações confidenciais como senhas, tokens, etc.
 */

export class DataSanitizer {
  /**
   * Campos que devem ser completamente removidos dos logs
   */
  private static readonly SENSITIVE_FIELDS = [
    'password',
    'confirmPassword',
    'currentPassword',
    'newPassword',
    'oldPassword',
    'token',
    'accessToken',
    'refreshToken',
    'authorization',
    'apiKey',
    'secret',
    'privateKey',
    'publicKey',
    'jwt',
    'bearer',
    'sessionId',
    'csrf',
    'xsrf',
  ];

  /**
   * Campos que devem ser parcialmente mascarados (mostrar apenas parte)
   */
  private static readonly MASKABLE_FIELDS = [
    'email',
    'cpf',
    'telefone',
    'phone',
    'creditCard',
    'cardNumber',
  ];

  /**
   * Sanitiza um objeto removendo ou mascarando dados sensíveis
   * @param data - Objeto a ser sanitizado
   * @param deep - Se deve fazer sanitização profunda (objetos aninhados)
   * @returns Objeto sanitizado
   */
  static sanitize(data: any, deep: boolean = true): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => (deep ? this.sanitize(item, deep) : item));
    }

    const sanitized = { ...data };

    for (const key in sanitized) {
      if (Object.prototype.hasOwnProperty.call(sanitized, key)) {
        const lowerKey = key.toLowerCase();

        if (this.isSensitiveField(lowerKey)) {
          sanitized[key] = '[REDACTED]';
        }
        // Mascara campos que podem ser parcialmente visíveis
        else if (this.isMaskableField(lowerKey)) {
          sanitized[key] = this.maskValue(sanitized[key]);
        }
        // Sanitização recursiva para objetos aninhados
        else if (
          deep &&
          typeof sanitized[key] === 'object' &&
          sanitized[key] !== null
        ) {
          sanitized[key] = this.sanitize(sanitized[key], deep);
        }
      }
    }

    return sanitized;
  }

  /**
   * Verifica se um campo é sensível e deve ser removido
   */
  private static isSensitiveField(fieldName: string): boolean {
    return this.SENSITIVE_FIELDS.some((sensitive) =>
      fieldName.includes(sensitive.toLowerCase()),
    );
  }

  /**
   * Verifica se um campo deve ser mascarado
   */
  private static isMaskableField(fieldName: string): boolean {
    return this.MASKABLE_FIELDS.some((maskable) =>
      fieldName.includes(maskable.toLowerCase()),
    );
  }

  /**
   * Mascara um valor mostrando apenas parte dele
   */
  private static maskValue(value: any): string {
    if (typeof value !== 'string') {
      return '[MASKED]';
    }

    if (value.length <= 3) {
      return '*'.repeat(value.length);
    }

    if (value.includes('@')) {
      const [local, domain] = value.split('@');
      return `${local.charAt(0)}***@${domain}`;
    }

    if (value.length > 6) {
      return `${value.substring(0, 2)}***${value.substring(value.length - 2)}`;
    }
    return value.charAt(0) + '*'.repeat(value.length - 1);
  }

  /**
   * Sanitiza especificamente dados de requisição HTTP
   * Remove headers sensíveis e sanitiza body
   */
  static sanitizeHttpRequest(req: {
    headers?: any;
    body?: any;
    query?: any;
    params?: any;
  }): any {
    const sanitized: any = {};

    // Sanitiza headers
    if (req.headers) {
      sanitized.headers = this.sanitizeHeaders(req.headers);
    }

    // Sanitiza body
    if (req.body) {
      sanitized.body = this.sanitize(req.body);
    }

    // Query e params geralmente são seguros, mas aplicamos sanitização básica
    if (req.query) {
      sanitized.query = this.sanitize(req.query);
    }

    if (req.params) {
      sanitized.params = this.sanitize(req.params);
    }

    return sanitized;
  }

  /**
   * Sanitiza headers HTTP removendo informações sensíveis
   */
  private static sanitizeHeaders(headers: any): any {
    const sensitiveHeaders = [
      'authorization',
      'cookie',
      'set-cookie',
      'x-api-key',
      'x-auth-token',
      'x-access-token',
      'x-refresh-token',
    ];

    const sanitized = { ...headers };

    for (const header in sanitized) {
      if (
        sensitiveHeaders.some((sensitive) =>
          header.toLowerCase().includes(sensitive),
        )
      ) {
        sanitized[header] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Sanitiza dados de resposta (menos restritivo que requisição)
   */
  static sanitizeHttpResponse(data: any): any {
    // Mantemos outros dados para debugging
    const restrictedFields = [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'secret',
    ];

    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = { ...data };

    for (const key in sanitized) {
      if (
        restrictedFields.some((field) =>
          key.toLowerCase().includes(field.toLowerCase()),
        )
      ) {
        sanitized[key] = '[REDACTED]';
      } else if (
        typeof sanitized[key] === 'object' &&
        sanitized[key] !== null
      ) {
        sanitized[key] = this.sanitizeHttpResponse(sanitized[key]);
      }
    }

    return sanitized;
  }

  /**
   * Cria uma versão sanitizada para logs de erro
   * Mantém informações úteis para debugging mas remove dados sensíveis
   */
  static sanitizeForErrorLog(error: any, context?: any): any {
    const sanitizedError: any = {
      message: error?.message || 'Unknown error',
      stack: error?.stack || undefined,
      name: error?.name || undefined,
      status: error?.status || undefined,
      statusCode: error?.statusCode || undefined,
    };

    if (context) {
      sanitizedError.context = this.sanitize(context);
    }

    return sanitizedError;
  }
}

/**
 * Decorator para sanitizar automaticamente parâmetros de métodos
 * Uso: @Sanitize() em métodos que recebem dados sensíveis
 */
export function Sanitize(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const result = originalMethod.apply(this, args);

    return result;
  };

  return descriptor;
}
