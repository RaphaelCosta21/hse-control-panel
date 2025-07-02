// Constantes específicas dos formulários HSE

// Seções do formulário
export const FORM_SECTIONS = {
  DADOS_GERAIS: "dados-gerais",
  CONFORMIDADE_LEGAL: "conformidade-legal", 
  SERVICOS_ESPECIAIS: "servicos-especiais",
  ANEXOS: "anexos"
} as const;

// Campos obrigatórios por seção
export const REQUIRED_FIELDS = {
  DADOS_GERAIS: [
    "empresa",
    "cnpj", 
    "endereco",
    "telefone",
    "email",
    "responsavelTecnico",
    "responsavelTecnicoEmail",
    "responsavelTecnicoTelefone"
  ],
  CONFORMIDADE_LEGAL: [
    "possuiLicencaAmbiental",
    "possuiCertificadoISO14001",
    "possuiCIPAConstituida"
  ],
  SERVICOS_ESPECIAIS: [
    "realizaServicosAltura",
    "realizaServicosEspacosConfinados", 
    "realizaServicosEletricos",
    "realizaServicosQuentes",
    "possuiProcedimentosEscritos",
    "possuiTreinamentoEspecifico"
  ]
} as const;

// Categorias de anexos
export const ATTACHMENT_CATEGORIES = {
  LICENCA_AMBIENTAL: {
    key: "licenca-ambiental",
    name: "Licença Ambiental",
    required: true,
    allowMultiple: false,
    acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
    maxSize: 10
  },
  CERTIFICADO_ISO: {
    key: "certificado-iso",
    name: "Certificado ISO 14001",
    required: true,
    allowMultiple: false,
    acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
    maxSize: 10
  },
  ATA_CIPA: {
    key: "ata-cipa", 
    name: "Ata de Constituição da CIPA",
    required: true,
    allowMultiple: false,
    acceptedTypes: [".pdf", ".doc", ".docx"],
    maxSize: 10
  },
  PROCEDIMENTOS: {
    key: "procedimentos",
    name: "Procedimentos Escritos",
    required: false,
    allowMultiple: true,
    acceptedTypes: [".pdf", ".doc", ".docx"],
    maxSize: 10
  },
  CERTIFICADOS_TREINAMENTO: {
    key: "certificados-treinamento",
    name: "Certificados de Treinamento",
    required: false,
    allowMultiple: true,
    acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
    maxSize: 5
  },
  OUTROS: {
    key: "outros",
    name: "Outros Documentos",
    required: false,
    allowMultiple: true,
    acceptedTypes: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png"],
    maxSize: 10
  }
} as const;

// Mensagens de validação
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: "Este campo é obrigatório",
  INVALID_CNPJ: "CNPJ inválido",
  INVALID_EMAIL: "Email inválido",
  INVALID_PHONE: "Telefone inválido",
  INVALID_DATE: "Data inválida",
  FILE_TOO_LARGE: "Arquivo muito grande",
  INVALID_FILE_TYPE: "Tipo de arquivo não permitido",
  MIN_LENGTH: "Mínimo de {0} caracteres",
  MAX_LENGTH: "Máximo de {0} caracteres"
} as const;

// Labels dos campos
export const FIELD_LABELS = {
  EMPRESA: "Nome da Empresa",
  CNPJ: "CNPJ",
  ENDERECO: "Endereço",
  TELEFONE: "Telefone",
  EMAIL: "Email",
  RESPONSAVEL_TECNICO: "Responsável Técnico",
  RESPONSAVEL_TECNICO_EMAIL: "Email do Responsável",
  RESPONSAVEL_TECNICO_TELEFONE: "Telefone do Responsável",
  POSSUI_LICENCA_AMBIENTAL: "Possui Licença Ambiental?",
  NUMERO_LICENCA_AMBIENTAL: "Número da Licença",
  VALIDADE_LICENCA_AMBIENTAL: "Validade da Licença",
  POSSUI_ISO14001: "Possui Certificado ISO 14001?",
  NUMERO_ISO14001: "Número do Certificado",
  VALIDADE_ISO14001: "Validade do Certificado",
  POSSUI_CIPA: "Possui CIPA Constituída?",
  NUMERO_ATA_CIPA: "Número da Ata",
  VALIDADE_ATA_CIPA: "Validade da Ata",
  SERVICOS_ALTURA: "Realiza Serviços em Altura?",
  SERVICOS_ESPACOS_CONFINADOS: "Realiza Serviços em Espaços Confinados?",
  SERVICOS_ELETRICOS: "Realiza Serviços Elétricos?",
  SERVICOS_QUENTES: "Realiza Serviços Quentes?",
  PROCEDIMENTOS_ESCRITOS: "Possui Procedimentos Escritos?",
  TREINAMENTO_ESPECIFICO: "Possui Treinamento Específico?"
} as const;
