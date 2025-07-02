// Validadores para formulários HSE

/**
 * Valida CNPJ
 */
export const validateCNPJ = (cnpj: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/[^\d]/g, "");

  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) return false;

  // Verifica se não são todos os dígitos iguais
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false;

  // Validação dos dígitos verificadores
  let tamanho = cleanCNPJ.length - 2;
  let numeros = cleanCNPJ.substring(0, tamanho);
  const digitos = cleanCNPJ.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  tamanho = tamanho + 1;
  numeros = cleanCNPJ.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === parseInt(digitos.charAt(1));
};

/**
 * Valida email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida telefone brasileiro
 */
export const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/[^\d]/g, "");
  // Aceita telefones com 10 ou 11 dígitos (com ou sem celular)
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

/**
 * Valida se o campo não está vazio
 */
export const validateRequired = (value: string): boolean => {
  return value !== null && value !== undefined && value.trim().length > 0;
};

/**
 * Valida tamanho mínimo
 */
export const validateMinLength = (
  value: string,
  minLength: number
): boolean => {
  return !!value && value.length >= minLength;
};

/**
 * Valida tamanho máximo
 */
export const validateMaxLength = (
  value: string,
  maxLength: number
): boolean => {
  return !!value && value.length <= maxLength;
};

/**
 * Valida se a data é válida e não é no futuro
 */
export const validatePastDate = (date: Date | string): boolean => {
  const inputDate = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  return inputDate <= today;
};

/**
 * Valida se a data é válida e não é no passado
 */
export const validateFutureDate = (date: Date | string): boolean => {
  const inputDate = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  return inputDate >= today;
};

/**
 * Valida extensão de arquivo
 */
export const validateFileExtension = (
  fileName: string,
  allowedExtensions: string[]
): boolean => {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf("."));
  return allowedExtensions.indexOf(extension) !== -1;
};

/**
 * Valida tamanho de arquivo
 */
export const validateFileSize = (
  fileSize: number,
  maxSizeInMB: number
): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return fileSize <= maxSizeInBytes;
};
