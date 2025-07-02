// Formatadores para dados do HSE Control Panel

/**
 * Formata CNPJ
 */
export const formatCNPJ = (cnpj: string): string => {
  const cleanCNPJ = cnpj.replace(/[^\d]/g, "");
  
  if (cleanCNPJ.length !== 14) return cnpj;
  
  return cleanCNPJ.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
};

/**
 * Formata telefone
 */
export const formatPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/[^\d]/g, "");
  
  if (cleanPhone.length === 10) {
    return cleanPhone.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  } else if (cleanPhone.length === 11) {
    return cleanPhone.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }
  
  return phone;
};

/**
 * Formata data para exibição
 */
export const formatDate = (date: Date | string): string => {
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(parsedDate.getTime())) return "";
  
  return parsedDate.toLocaleDateString("pt-BR");
};

/**
 * Formata data e hora para exibição
 */
export const formatDateTime = (date: Date | string): string => {
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(parsedDate.getTime())) return "";
  
  return parsedDate.toLocaleString("pt-BR");
};

/**
 * Formata tamanho de arquivo
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Formata percentual
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(0)}%`;
};

/**
 * Formata status para exibição
 */
export const formatStatus = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    "Em Andamento": "Em Andamento",
    "Enviado": "Enviado",
    "Em Análise": "Em Análise", 
    "Aprovado": "Aprovado",
    "Rejeitado": "Rejeitado",
    "Pendente Informações": "Pendente Informações"
  };
  
  return statusMap[status] || status;
};

/**
 * Formata grau de risco
 */
export const formatRiskLevel = (level: string): string => {
  const riskMap: { [key: string]: string } = {
    "1": "Baixo",
    "2": "Médio", 
    "3": "Alto",
    "4": "Muito Alto"
  };
  
  return riskMap[level] || `Nível ${level}`;
};

/**
 * Formata texto limitando o tamanho
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Formata nome próprio (primeira letra maiúscula)
 */
export const formatProperName = (name: string): string => {
  return name
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Remove formatação de CNPJ
 */
export const unformatCNPJ = (cnpj: string): string => {
  return cnpj.replace(/[^\d]/g, "");
};

/**
 * Remove formatação de telefone
 */
export const unformatPhone = (phone: string): string => {
  return phone.replace(/[^\d]/g, "");
};
