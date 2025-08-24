// Interfaces para Dashboard e Control Panel
export interface IDashboardMetrics {
  totalSubmissions: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  averageReviewTime: number; // em dias
  recentActivity: IActivityItem[];
}

export interface IActivityItem {
  id: number;
  type: "Submission" | "Evaluation" | "Approval" | "Rejection";
  description: string;
  timestamp: Date;
  user: string;
  formId?: number;
}

export interface IFormListItem {
  id: number;
  empresa: string;
  cnpj: string;
  status:
    | "Em Andamento"
    | "Enviado"
    | "Em Análise"
    | "Aprovado"
    | "Rejeitado"
    | "Pendente Informações";
  dataSubmissao: Date;
  dataAvaliacao?: Date;
  avaliador?: string;
  grauRisco: string;
  percentualConclusao: number;
  prioridade?: "Alta" | "Média" | "Baixa";
  criadoPor?: string;
  emailPreenchimento?: string;
  nomePreenchimento?: string;
  anexosCount?: number;
  metadata?: any; // JSON metadata from SharePoint list
  DadosFormulario?: any; // JSON data from SharePoint column DadosFormulario
  // Additional properties for table display
  companyName?: string;
  submissionDate?: string;
  riskLevel?: 1 | 2 | 3 | 4;
  completionPercentage?: number;
  // Dados do avaliador atribuído
  avaliadorAtribuido?: {
    name: string;
    email: string;
    photoUrl?: string;
    isActive?: boolean;
  };
  // Usuário responsável pela análise atual (extraído do JSON DadosFormulario)
  usuarioAnalise?: {
    name: string;
    email: string;
    photoUrl?: string;
    isActive?: boolean;
  };
}

export interface IFormsFilters {
  status?: string;
  grauRisco?: string;
  dataInicio?: Date;
  dataFim?: Date;
  empresa?: string;
  avaliador?: string;
  prioridade?: string;
  cnpj?: string;
}
