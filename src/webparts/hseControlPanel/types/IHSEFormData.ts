// Interfaces principais do formulário HSE
// Baseado na documentação completa do FORMULARIO_HSE_DOCUMENTACAO.md

export interface IDadosGerais {
  // Campos Obrigatórios
  empresa: string;
  cnpj: string;
  numeroContrato: string;
  dataInicioContrato: Date;
  dataTerminoContrato: Date;
  responsavelTecnico: string;
  atividadePrincipalCNAE: string;
  grauRisco: "1" | "2" | "3" | "4";
  gerenteContratoMarine: string;

  // Campos Opcionais
  escopoServico?: string;
  totalEmpregados?: number;
  empregadosParaServico?: number;

  // SESMT
  possuiSESMT: boolean;
  numeroComponentesSESMT?: number;

  // Index signature para campos dinâmicos
  [key: string]: unknown;
}

export interface INormaRegulamentadora {
  aplicavel: boolean;
  questoes: {
    [questaoId: string]: {
      resposta: "SIM" | "NAO";
      anexoObrigatorio: boolean;
      anexoEnviado?: string;
    };
  };
  comentarios?: string;
}

export interface IConformidadeLegal {
  nr01: INormaRegulamentadora; // Disposições Gerais
  nr04: INormaRegulamentadora; // SESMT
  nr05: INormaRegulamentadora; // CIPA
  nr06: INormaRegulamentadora; // EPI
  nr07: INormaRegulamentadora; // PCMSO
  nr09: INormaRegulamentadora; // PPRA
  nr10: INormaRegulamentadora; // Eletricidade
  nr11: INormaRegulamentadora; // Transporte/Movimentação
  nr12: INormaRegulamentadora; // Máquinas e Equipamentos
  nr13: INormaRegulamentadora; // Caldeiras e Vasos
  nr15: INormaRegulamentadora; // Atividades Insalubres
  nr23: INormaRegulamentadora; // Proteção Contra Incêndios
  licencasAmbientais: INormaRegulamentadora;
  legislacaoMaritima: INormaRegulamentadora;
  treinamentosObrigatorios: INormaRegulamentadora;
  gestaoSMS: INormaRegulamentadora;

  // Index signature para campos dinâmicos
  [key: string]: unknown;
}

export interface IServicosEspeciais {
  // Seleção de Serviços
  fornecedorEmbarcacoes: boolean;
  fornecedorIcamentoCarga: boolean;

  // Certificados Marítimos (se aplicável)
  certificadosMaritimos?: {
    iopp?: string;
    registroArmador?: string;
    propriedadeMaritima?: string;
    arqueacao?: string;
    segurancaNavegacao?: string;
    classificacaoCasco?: string;
    classificacaoMaquinas?: string;
    bordaLivre?: string;
    seguroDepem?: string;
    autorizacaoAntaq?: string;
    tripulacaoSeguranca?: string;
    agulhaMagnetica?: string;
    balsaInflavel?: string;
    licencaRadio?: string;
  };

  // Documentos de Içamento (se aplicável)
  documentosIcamento?: {
    testeCarga?: string;
    registroCREA?: string;
    art?: string;
    planoManutencao?: string;
    monitoramentoFumaca?: string;
    certificacaoEquipamentos?: string;
  };

  // Index signature para campos dinâmicos
  [key: string]: unknown;
}

// Interface para metadados de arquivo individual
export interface IFileMetadata {
  id: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  sharePointPath: string;
  category: string;
  subcategory: string;
  originalName: string;
  fileType: string;
  url: string;
}

export interface IAnexos {
  // 🏢 DADOS GERAIS - REM (Resumo Estatístico Mensal de Acidentes)
  rem?: IFileMetadata[];

  // 👥 CONFORMIDADE LEGAL - SESMT e Recursos Humanos
  sesmt?: IFileMetadata[];
  cipa?: IFileMetadata[];

  // 🛡️ CONFORMIDADE LEGAL - EPIs e Saúde Ocupacional
  caEPI?: IFileMetadata[];
  pcmso?: IFileMetadata[];
  aso?: IFileMetadata[];

  // 📋 CONFORMIDADE LEGAL - Sistema de Gestão SMS
  smsProcedimentoAcidentes?: IFileMetadata[];
  smsCalendarioInspecoes?: IFileMetadata[];
  smsProcedimentoResiduos?: IFileMetadata[];
  smsMetasObjetivos?: IFileMetadata[];
  smsProgramaAnual?: IFileMetadata[];

  // 🎓 CONFORMIDADE LEGAL - Treinamentos
  certificadoProgramaTreinamento?: IFileMetadata[];
  evidenciaTreinamento?: IFileMetadata[];

  // ⚖️ CONFORMIDADE LEGAL - Licenças
  licencaOperacao?: IFileMetadata[];

  // 🔧 CONFORMIDADE LEGAL - Normas Regulamentadoras
  nr23LaudoManutencao?: IFileMetadata[];
  nr16LaudoPericulosidade?: IFileMetadata[];
  nr15LaudoInsalubridade?: IFileMetadata[];
  nr13EvidenciaSistematica?: IFileMetadata[];
  nr12EvidenciaDispositivo?: IFileMetadata[];
  nr12PlanoInspecao?: IFileMetadata[];
  nr11CertificadoTreinamento?: IFileMetadata[];
  nr10ProjetoInstalacoes?: IFileMetadata[];
  nr10CertificacaoProfissionais?: IFileMetadata[];

  // 🚢 SERVIÇOS ESPECIAIS - Documentação Marítima
  iopp?: IFileMetadata[];
  registroArmador?: IFileMetadata[];
  propriedadeMaritima?: IFileMetadata[];
  arqueacao?: IFileMetadata[];
  segurancaNavegacao?: IFileMetadata[];
  classificacaoCasco?: IFileMetadata[];
  classificacaoMaquinas?: IFileMetadata[];
  bordaLivre?: IFileMetadata[];
  seguroDepem?: IFileMetadata[];
  autorizacaoAntaq?: IFileMetadata[];
  tripulacaoSeguranca?: IFileMetadata[];
  agulhaMagnetica?: IFileMetadata[];
  balsaInflavel?: IFileMetadata[];
  licencaRadio?: IFileMetadata[];

  // 🏗️ SERVIÇOS ESPECIAIS - Equipamentos e Certificações
  testeCarga?: IFileMetadata[];
  registroCREA?: IFileMetadata[];
  art?: IFileMetadata[];
  planoManutencao?: IFileMetadata[];
  monitoramentoFumaca?: IFileMetadata[];
  certificacaoEquipamentos?: IFileMetadata[];

  // Index signature para outras categorias dinâmicas
  [categoria: string]: IFileMetadata[] | undefined;
}

export interface IHSEFormData {
  id?: number;
  dadosGerais: IDadosGerais;
  conformidadeLegal: IConformidadeLegal;
  servicosEspeciais: IServicosEspeciais;
  grauRisco: "1" | "2" | "3" | "4";
  percentualConclusao: number;
  status:
    | "Em Andamento"
    | "Enviado"
    | "Em Análise"
    | "Aprovado"
    | "Rejeitado"
    | "Pendente Info.";
  dataSubmissao?: Date;
  dataUltimaModificacao?: Date;
  dataEnvio?: Date; // Campo adicionado
  dataAvaliacao?: Date; // Campo adicionado
  observacoes?: string;
  anexos: IAnexos;

  // Campos de revisão
  analisadoPor?: string;
  dataAnalise?: Date;
  comentariosRevisao?: string;

  // Histórico de mudanças de status (array apenas)
  historicoStatusChange?: IStatusChangeArray[];
}

export interface IStatusChangeArray {
  status: string;
  dataAlteracao: string;
  usuario: string;
  email: string;
}
