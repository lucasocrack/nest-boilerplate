export class ValidationUtils {
  /**
   * Normaliza o CPF removendo pontos e hífens
   */
  static normalizeCpf(cpf: string): string {
    if (!cpf) return '';
    return cpf.replace(/[.-]/g, '');
  }

  /**
   * Valida se o CPF é válido (algoritmo de verificação)
   */
  static isValidCpf(cpf: string): boolean {
    if (!cpf) return false;

    const normalizedCpf = this.normalizeCpf(cpf);

    // Verifica se tem 11 dígitos
    if (normalizedCpf.length !== 11) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(normalizedCpf)) return false;

    // Validação do algoritmo do CPF
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(normalizedCpf.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(normalizedCpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(normalizedCpf.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(normalizedCpf.charAt(10))) return false;

    return true;
  }
}
