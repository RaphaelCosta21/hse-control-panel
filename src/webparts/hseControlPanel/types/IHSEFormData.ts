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

export interface IAnexos {
  // Dados Gerais - Anexo Obrigatório
  resumoEstatisticoMensal: string; // REM - obrigatório

  // Anexos Condicionais (baseados em respostas "SIM")
  documentosSESMT?: string;
  documentosCIPA?: string;
  caEPIs?: string;
  pcmso?: string;
  aso?: string;
  ppra?: string;

  // Anexos adicionais de dados gerais
  contratoSocial?: string;
  cartaoCNPJ?: string;

  // Index signature para anexos dinâmicos
  [categoria: string]: string | undefined;
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
    | "Pendente Informações";
  dataSubmissao?: Date;
  dataUltimaModificacao?: Date;
  observacoes?: string;
  anexos: IAnexos;

  // Campos de revisão
  analisadoPor?: string;
  dataAnalise?: Date;
  comentariosRevisao?: string;
}
