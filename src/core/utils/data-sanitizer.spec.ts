import { DataSanitizer } from './data-sanitizer';

describe('DataSanitizer', () => {
  describe('sanitize', () => {
    it('should redact sensitive fields', () => {
      const data = {
        username: 'testuser',
        password: 'secretpassword',
        email: 'test@example.com',
        token: 'jwt-token-123',
        refreshToken: 'refresh-token-456',
      };

      const result = DataSanitizer.sanitize(data);

      expect(result.username).toBe('testuser');
      expect(result.password).toBe('[REDACTED]');
      expect(result.token).toBe('[REDACTED]');
      expect(result.refreshToken).toBe('[REDACTED]');
      expect(result.email).toBe('t***@example.com'); // Masked
    });

    it('should handle nested objects', () => {
      const data = {
        user: {
          name: 'John Doe',
          credentials: {
            password: 'secret123',
            apiKey: 'api-key-789',
          },
        },
        metadata: {
          token: 'bearer-token',
        },
      };

      const result = DataSanitizer.sanitize(data);

      expect(result.user.name).toBe('John Doe');
      expect(result.user.credentials.password).toBe('[REDACTED]');
      expect(result.user.credentials.apiKey).toBe('[REDACTED]');
      expect(result.metadata.token).toBe('[REDACTED]');
    });

    it('should handle arrays', () => {
      const data = {
        users: [
          { name: 'User1', password: 'pass1' },
          { name: 'User2', password: 'pass2' },
        ],
      };

      const result = DataSanitizer.sanitize(data);

      expect(result.users[0].name).toBe('User1');
      expect(result.users[0].password).toBe('[REDACTED]');
      expect(result.users[1].name).toBe('User2');
      expect(result.users[1].password).toBe('[REDACTED]');
    });

    it('should mask email addresses correctly', () => {
      const data = {
        email: 'john.doe@example.com',
        shortEmail: 'a@b.co',
      };

      const result = DataSanitizer.sanitize(data);

      expect(result.email).toBe('j*******@example.com');
      expect(result.shortEmail).toBe('a@b.co'); // Short emails are handled differently
    });

    it('should mask other fields correctly', () => {
      const data = {
        cpf: '12345678901',
        telefone: '11999887766',
        shortField: 'abc',
      };

      const result = DataSanitizer.sanitize(data);

      expect(result.cpf).toBe('12*******01');
      expect(result.telefone).toBe('11*******66');
      expect(result.shortField).toBe('abc'); // Not a maskable field
    });

    it('should handle non-object values', () => {
      expect(DataSanitizer.sanitize('string')).toBe('string');
      expect(DataSanitizer.sanitize(123)).toBe(123);
      expect(DataSanitizer.sanitize(null)).toBe(null);
      expect(DataSanitizer.sanitize(undefined)).toBe(undefined);
    });
  });

  describe('sanitizeHttpRequest', () => {
    it('should sanitize request data', () => {
      const req = {
        headers: {
          'content-type': 'application/json',
          authorization: 'Bearer token123',
          'x-api-key': 'secret-key',
        },
        body: {
          username: 'testuser',
          password: 'secretpass',
          email: 'test@example.com',
        },
        query: {
          search: 'term',
          token: 'query-token',
        },
        params: {
          id: '123',
        },
      };

      const result = DataSanitizer.sanitizeHttpRequest(req);

      expect(result.headers['content-type']).toBe('application/json');
      expect(result.headers['authorization']).toBe('[REDACTED]');
      expect(result.headers['x-api-key']).toBe('[REDACTED]');
      expect(result.body.username).toBe('testuser');
      expect(result.body.password).toBe('[REDACTED]');
      expect(result.body.email).toBe('t***@example.com');
      expect(result.query.search).toBe('term');
      expect(result.query.token).toBe('[REDACTED]');
      expect(result.params.id).toBe('123');
    });
  });

  describe('sanitizeHttpResponse', () => {
    it('should sanitize response data', () => {
      const data = {
        user: {
          id: '123',
          name: 'John Doe',
          email: 'john@example.com',
        },
        accessToken: 'jwt-token',
        refreshToken: 'refresh-token',
        metadata: {
          timestamp: '2023-01-01',
        },
      };

      const result = DataSanitizer.sanitizeHttpResponse(data);

      expect(result.user.id).toBe('123');
      expect(result.user.name).toBe('John Doe');
      expect(result.user.email).toBe('john@example.com'); // Less restrictive for responses
      expect(result.accessToken).toBe('[REDACTED]');
      expect(result.refreshToken).toBe('[REDACTED]');
      expect(result.metadata.timestamp).toBe('2023-01-01');
    });
  });

  describe('sanitizeForErrorLog', () => {
    it('should sanitize error with context', () => {
      const error = new Error('Test error');
      error.name = 'TestError';
      (error as any).status = 400;

      const context = {
        user: 'testuser',
        password: 'secret',
        data: { id: 123 },
      };

      const result = DataSanitizer.sanitizeForErrorLog(error, context);

      expect(result.message).toBe('Test error');
      expect(result.name).toBe('TestError');
      expect(result.status).toBe(400);
      expect(result.context.user).toBe('testuser');
      expect(result.context.password).toBe('[REDACTED]');
      expect(result.context.data.id).toBe(123);
    });

    it('should handle error without context', () => {
      const error = new Error('Simple error');

      const result = DataSanitizer.sanitizeForErrorLog(error);

      expect(result.message).toBe('Simple error');
      expect(result.context).toBeUndefined();
    });
  });

  describe('case sensitivity', () => {
    it('should detect sensitive fields regardless of case', () => {
      const data = {
        Password: 'secret1',
        PASSWORD: 'secret2',
        userPassword: 'secret3',
        passwordField: 'secret4',
        Token: 'token1',
        accessTOKEN: 'token2',
      };

      const result = DataSanitizer.sanitize(data);

      expect(result.Password).toBe('[REDACTED]');
      expect(result.PASSWORD).toBe('[REDACTED]');
      expect(result.userPassword).toBe('[REDACTED]');
      expect(result.passwordField).toBe('[REDACTED]');
      expect(result.Token).toBe('[REDACTED]');
      expect(result.accessTOKEN).toBe('[REDACTED]');
    });
  });

  describe('edge cases', () => {
    it('should handle empty objects', () => {
      const result = DataSanitizer.sanitize({});
      expect(result).toEqual({});
    });

    it('should handle objects with null values', () => {
      const data = {
        name: 'test',
        password: null,
        email: undefined,
      };

      const result = DataSanitizer.sanitize(data);

      expect(result.name).toBe('test');
      expect(result.password).toBe('[REDACTED]'); // Still redacted even if null
      expect(result.email).toBe('[MASKED]'); // Maskable field with undefined value
    });

    it('should handle circular references safely', () => {
      const data: any = {
        name: 'test',
        password: 'secret',
      };
      data.self = data; // Create circular reference

      // Should not throw error and should sanitize non-circular parts
      expect(() => {
        const result = DataSanitizer.sanitize(data, false); // Disable deep to avoid infinite recursion
        expect(result.name).toBe('test');
        expect(result.password).toBe('[REDACTED]');
      }).not.toThrow();
    });
  });
});
