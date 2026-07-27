import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Valida o dígito verificador do CNPJ (mesma regra do @CNPJ do backend),
 * aceitando o valor com ou sem máscara.
 */
export function cnpjValido(valor: string): boolean {
  const digitos = valor.replace(/\D/g, '');
  if (digitos.length !== 14 || /^(\d)\1{13}$/.test(digitos)) {
    return false;
  }

  const calcularDv = (base: string): number => {
    let peso = base.length - 7;
    let soma = 0;
    for (const c of base) {
      soma += Number(c) * peso;
      peso = peso === 2 ? 9 : peso - 1;
    }
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  return (
    calcularDv(digitos.slice(0, 12)) === Number(digitos[12]) &&
    calcularDv(digitos.slice(0, 13)) === Number(digitos[13])
  );
}

export const cnpjValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor = control.value as string | null;
  if (!valor) {
    return null;
  }
  return cnpjValido(valor) ? null : { cnpj: true };
};
