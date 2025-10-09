// Interfaces para Restrições de Campos
export interface IFieldRestriction {
  id: number;
  secao: string;
  campo: string;
  nomeExibicao: string;
  motivo: string;
}

// Interfaces para Avaliação de Formulários HSE
export interface IHSEFormEvaluation {
  id?: number;
  formId: number;
  status: "Em Análise" | "Aprovado" | "Rejeitado" | "Pendente Info.";
  comentarios: string;
  observacoes: string;
  questoesPendentes?: string[];
  documentosPendentes?: string[];
  avaliador: string;
  dataAvaliacao: Date;
  prioridade?: "Alta" | "Média" | "Baixa";
  notificacaoEnviada?: boolean;
  restricao?: "Sim" | "Não";
  camposRestricao?: IFieldRestriction[];
}

export interface IEvaluationHistory {
  id: number;
  formId: number;
  statusAnterior: string;
  statusNovo: string;
  avaliador: string;
  dataAvaliacao: Date;
  comentarios: string;
  observacoes: string;
  tipoAcao: "Avaliação" | "Aprovação" | "Rejeição" | "Solicitação Info";
}

export interface IFormEvaluationStatus {
  status: "Em Análise" | "Aprovado" | "Rejeitado" | "Pendente Info.";
  dataStatus: Date;
  avaliador: string;
  comentarios?: string;
}
