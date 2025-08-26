// Tipos de configuração disponíveis
export type ConfigType =
  | "EMAIL_TEMPLATE"
  | "NOTIFICATION_CONFIG"
  | "DEADLINE_CONFIG";

// Interface para um item de configuração individual
export interface IConfigurationItem {
  Id?: number;
  Title: string;
  ConfigKey: string;
  ConfigType: ConfigType;
  ConfigValue: string;
  Modified?: string;
  Created?: string;
}

// Interface para dados de configuração processados
export interface IProcessedConfiguration {
  key: string;
  title: string;
  description: string;
  type: ConfigType;
  value: string | number | boolean;
  inputType: "text" | "number" | "boolean" | "textarea";
  placeholder?: string;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
}

// Configurações essenciais do sistema
export interface ISystemConfigurations {
  notify_on_submission: boolean;
  reminder_frequency_days: number;
  evaluation_deadline_days: number;
  email_rejection: string;
  email_approval: string;
  email_reminder: string;
  email_new_supplier: string;
  email_pendente: string;
  email_formsent: string;
}

// Interface para resultado de operação de salvamento
export interface ISaveConfigurationResult {
  success: boolean;
  message: string;
  updatedConfigurations?: IConfigurationItem[];
}

// ========================================
// INTERFACES PARA SISTEMA DE CONVITES
// ========================================

// Interface para dados de criação de convite
export interface ICreateInviteData {
  fornecedorEmail: string;
  convidadoPor: string;
}

// Interface para item de convite na lista SharePoint
export interface IInviteItem {
  Id?: number;
  Title: string;
  FornecedorEmail: string;
  ConvidadoPor: string;
  DataEnvio: string;
  Created?: string;
  Modified?: string;
}

// Interface para resultado de operação de convite
export interface IInviteResult {
  success: boolean;
  message: string;
  inviteId?: number;
}
