import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsFutureDateConstraint implements ValidatorConstraintInterface {
  validate(dateString: any): boolean {
    if (!dateString) return true; // Data é opcional
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      
      // Verificar se é uma data válida
      if (isNaN(date.getTime())) return false;
      
      // Verificar se é no futuro
      return date > now;
    } catch {
      return false;
    }
  }

  defaultMessage(): string {
    return 'Data deve ser no futuro';
  }
}

export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsFutureDateConstraint,
    });
  };
}