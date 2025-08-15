export interface IDadosGerais {
  empresa: string;
  cnpj: string;
  numeroContrato: string;
  dataInicioContrato: Date;
  dataTerminoContrato: Date;
  responsavelTecnico: string;
  atividadePrincipalCNAE: string;
  grauRisco: string;
  gerenteContratoMarine: string;
  escopoServico: string;
  totalEmpregados: number;
  empregadosParaServico: number;
  possuiSESMT: boolean;
  numeroComponentesSESMT?: number;
}

export interface IConformidadeLegal {
  nr1?: {
    possuiDocumento: boolean;
    observacoes?: string;
    anexo?: string;
  };
  nr4?: {
    possuiDocumento: boolean;
    observacoes?: string;
    anexo?: string;
  };
  nr5?: {
    possuiDocumento: boolean;
    observacoes?: string;
    anexo?: string;
  };
  nr6?: {
    possuiDocumento: boolean;
    observacoes?: string;
    anexo?: string;
  };
  nr7?: {
    possuiDocumento: boolean;
    observacoes?: string;
    anexo?: string;
  };
  nr8?: {
    possuiDocumento: boolean;
    observacoes?: string;
    anexo?: string;
  };
  nr9?: {
    possuiDocumento: boolean;
    observacoes?: string;
    anexo?: string;
  };
  nr10?: {
    possuiDocumento: boolean;
    observacoes?: string;
    anexo?: string;
  };
  nr11?: {
    possuiDocumento: boolean;
    observacoes?: string;
    anexo?: string;
  };
  nr12?: {
    possuiDocumento: boolean;
    observacoes?: string;
    anexo?: string;
  };
  nr15?: {
    possuiDocumento: boolean;
    observacoes?: string;
    anexo?: string;
  };
  nr16?: {
    possuiDocumento: boolean;
    observacoes?: string;
    anexo?: string;
  };
  nr17?: {
    possuiDocumento: boolean;
    observacoes?: string;
    anexo?: string;
  };
  nr18?: {
    possuiDocumento: boolean;
    observacoes?: string;
    anexo?: string;
  };
  nr20?: {
    possuiDocumento: boolean;
    observacoes?: string;
    anexo?: string;
  };
  nr35?: {
    possuiDocumento: boolean;
    observacoes?: string;
    anexo?: string;
  };
}

export interface IServicosEspecializados {
  // Certificados Marítimos
  certificadoAquaviario?: {
    possui: boolean;
    numeroRegistro?: string;
    dataVencimento?: Date;
    anexo?: string;
  };
  habilitacaoANTAQ?: {
    possui: boolean;
    numeroRegistro?: string;
    dataVencimento?: Date;
    anexo?: string;
  };

  // Equipamentos de Elevação/Movimentação
  certificadoGuindaste?: {
    possui: boolean;
    numeroSerie?: string;
    dataVencimento?: Date;
    anexo?: string;
  };
  certificadoGuincho?: {
    possui: boolean;
    numeroSerie?: string;
    dataVencimento?: Date;
    anexo?: string;
  };
  certificadoPonte?: {
    possui: boolean;
    numeroSerie?: string;
    dataVencimento?: Date;
    anexo?: string;
  };

  // Serviços Especiais
  soldaSubaquatica?: {
    realiza: boolean;
    certificacoes?: string[];
    anexos?: string[];
  };
  inspecaoNDT?: {
    realiza: boolean;
    metodos?: string[];
    certificacoes?: string[];
    anexos?: string[];
  };
}

export interface IAnexos {
  contratoSocial?: string;
  cartaoCNPJ?: string;
  planoEmergencia?: string;
  [key: string]: string | undefined;
}

export interface IHSEFormData {
  id: number;
  dadosGerais: IDadosGerais;
  conformidadeLegal: IConformidadeLegal;
  servicosEspeciais: IServicosEspecializados;
  anexos: IAnexos;
}
