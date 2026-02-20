import { ValidationUtils } from './validation.utils';

describe('ValidationUtils', () => {
  describe('normalizeCpf', () => {
    it('should remove dots and hyphens from CPF', () => {
      expect(ValidationUtils.normalizeCpf('123.456.789-01')).toBe('12345678901');
    });

    it('should return same string if no dots or hyphens are present', () => {
      expect(ValidationUtils.normalizeCpf('12345678901')).toBe('12345678901');
    });

    it('should return empty string if input is empty', () => {
      expect(ValidationUtils.normalizeCpf('')).toBe('');
    });

    it('should return empty string if input is null or undefined', () => {
      expect(ValidationUtils.normalizeCpf(null as any)).toBe('');
      expect(ValidationUtils.normalizeCpf(undefined as any)).toBe('');
    });
  });

  describe('isValidCpf', () => {
    it('should return true for valid CPFs', () => {
      expect(ValidationUtils.isValidCpf('12345678909')).toBe(true);
      expect(ValidationUtils.isValidCpf('11144477735')).toBe(true);
      expect(ValidationUtils.isValidCpf('123.456.789-09')).toBe(true);
      expect(ValidationUtils.isValidCpf('111.444.777-35')).toBe(true);
    });

    it('should return false for CPFs with invalid verification digits', () => {
      expect(ValidationUtils.isValidCpf('12345678900')).toBe(false);
      expect(ValidationUtils.isValidCpf('11144477730')).toBe(false);
    });

    it('should return false for CPFs with all same digits', () => {
      expect(ValidationUtils.isValidCpf('00000000000')).toBe(false);
      expect(ValidationUtils.isValidCpf('11111111111')).toBe(false);
      expect(ValidationUtils.isValidCpf('99999999999')).toBe(false);
    });

    it('should return false for CPFs with invalid length', () => {
      expect(ValidationUtils.isValidCpf('123')).toBe(false);
      expect(ValidationUtils.isValidCpf('1234567890')).toBe(false);
      expect(ValidationUtils.isValidCpf('123456789012')).toBe(false);
    });

    it('should return false for empty, null or undefined input', () => {
      expect(ValidationUtils.isValidCpf('')).toBe(false);
      expect(ValidationUtils.isValidCpf(null as any)).toBe(false);
      expect(ValidationUtils.isValidCpf(undefined as any)).toBe(false);
    });

    it('should return false for CPFs with letters or special characters (other than . and -)', () => {
      expect(ValidationUtils.isValidCpf('1234567890a')).toBe(false);
      expect(ValidationUtils.isValidCpf('123.456.789-0!')).toBe(false);
    });
  });
});
