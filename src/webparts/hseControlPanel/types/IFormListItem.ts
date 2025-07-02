export interface IFormListItem {
  id: number;
  companyName: string;
  cnpj: string;
  contractNumber: string;
  status:
    | "Em Andamento"
    | "Enviado"
    | "Em Análise"
    | "Aprovado"
    | "Rejeitado"
    | "Pendente Informações";
  submissionDate: string;
  riskLevel: 1 | 2 | 3 | 4;
  completionPercentage: number;
  responsibleTechnician: string;
  lastModified: string;
  evaluator?: string;
  evaluationDate?: string;
  attachmentsCount?: number;
  formData?: any; // JSON data
}
