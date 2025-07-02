// Constantes do sistema HSE Control Panel

// Status de formulários
export const FORM_STATUS = {
  EM_ANDAMENTO: "Em Andamento",
  ENVIADO: "Enviado",
  EM_ANALISE: "Em Análise",
  APROVADO: "Aprovado",
  REJEITADO: "Rejeitado",
  PENDENTE_INFORMACOES: "Pendente Informações"
} as const;

// Graus de risco
export const RISK_LEVELS = {
  NIVEL_1: "1",
  NIVEL_2: "2", 
  NIVEL_3: "3",
  NIVEL_4: "4"
} as const;

// Prioridades de avaliação
export const EVALUATION_PRIORITY = {
  ALTA: "Alta",
  MEDIA: "Média",
  BAIXA: "Baixa"
} as const;

// Configurações do SharePoint
export const SHAREPOINT_CONFIG = {
  DEFAULT_LIST_NAME: "HSE_Suppliers",
  DEFAULT_LIBRARY_NAME: "anexos-contratadas",
  EMAIL_HISTORY_LIST: "HSE_Email_History",
  CONFIG_LIST: "hse-control-panel-config"
} as const;

// Configurações de UI
export const UI_CONFIG = {
  ITEMS_PER_PAGE: 25,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png"],
  NOTIFICATION_TIMEOUT: 5000
} as const;

// Cores do tema
export const THEME_COLORS = {
  PRIMARY: "#0078d4",
  SECONDARY: "#106ebe",
  SUCCESS: "#107c10",
  WARNING: "#ff8c00",
  ERROR: "#d13438",
  INFO: "#0078d4"
} as const;
