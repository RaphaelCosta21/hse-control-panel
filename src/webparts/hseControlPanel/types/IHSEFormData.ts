// Interfaces principais do formulário HSE
// NOTA: Esta é uma versão base. No projeto real, reutilizaremos exatamente do HSE Supplier Register

export interface IDadosGerais {
  [key: string]: unknown;
}

export interface IConformidadeLegal {
  // Index signature para permitir qualquer campo dinâmico
  [key: string]: unknown;
}

export interface IServicosEspeciais {
  // Index signature para permitir qualquer campo dinâmico
  [key: string]: unknown;
}

export interface IHSEFormData {
  id?: number;
  dadosGerais: IDadosGerais;
  conformidadeLegal: IConformidadeLegal;
  servicosEspeciais: IServicosEspeciais;
  grauRisco: "1" | "2" | "3" | "4";
  percentualConclusao: number;
  status: "Em Andamento" | "Enviado" | "Em Análise" | "Aprovado" | "Rejeitado";
  dataSubmissao?: Date;
  dataUltimaModificacao?: Date;
  observacoes?: string;
  anexos?: {
    [category: string]: import("./IAttachmentMetadata").IAttachmentMetadata[];
  };
}
