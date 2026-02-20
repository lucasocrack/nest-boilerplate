import { ValidationUtils } from './validation.utils';

describe('ValidationUtils', () => {
  describe('normalizeCpf', () => {
    it('should return empty string if cpf is empty, null or undefined', () => {
      expect(ValidationUtils.normalizeCpf('')).toBe('');
      expect(ValidationUtils.normalizeCpf(null as any)).toBe('');
      expect(ValidationUtils.normalizeCpf(undefined as any)).toBe('');
    });

    it('should remove dots and hyphens from cpf', () => {
      expect(ValidationUtils.normalizeCpf('123.456.789-00')).toBe('12345678900');
    });

    it('should return the same string if it contains only numbers', () => {
      expect(ValidationUtils.normalizeCpf('12345678900')).toBe('12345678900');
    });

    it('should handle partial formatting', () => {
      expect(ValidationUtils.normalizeCpf('123.456789-00')).toBe('12345678900');
    });
  });

  describe('isValidCpf', () => {
    it('should return false if cpf is empty, null or undefined', () => {
      expect(ValidationUtils.isValidCpf('')).toBe(false);
      expect(ValidationUtils.isValidCpf(null as any)).toBe(false);
      expect(ValidationUtils.isValidCpf(undefined as any)).toBe(false);
    });

    it('should return false if cpf does not have 11 digits', () => {
      expect(ValidationUtils.isValidCpf('123')).toBe(false);
      expect(ValidationUtils.isValidCpf('123456789012')).toBe(false);
    });

    it('should return false if all digits are equal', () => {
      expect(ValidationUtils.isValidCpf('00000000000')).toBe(false);
      expect(ValidationUtils.isValidCpf('11111111111')).toBe(false);
      expect(ValidationUtils.isValidCpf('99999999999')).toBe(false);
    });

    it('should return true for a valid cpf', () => {
      // Generated valid CPF: 22615624113
      expect(ValidationUtils.isValidCpf('22615624113')).toBe(true);
      // Valid formatted CPF
      expect(ValidationUtils.isValidCpf('226.156.241-13')).toBe(true);
    });

    it('should return false for an invalid cpf with correct length', () => {
      // Invalid checksum (last digit changed from 3 to 4)
      expect(ValidationUtils.isValidCpf('22615624114')).toBe(false);
      // Another invalid checksum
      expect(ValidationUtils.isValidCpf('12345678900')).toBe(false);
    });
  });
});
