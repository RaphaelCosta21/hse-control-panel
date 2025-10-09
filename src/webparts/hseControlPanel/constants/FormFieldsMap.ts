// Mapeamento de campos do formulário para seleção de restrições baseado na estrutura real

export interface IFormFieldOption {
  id: string;
  secao: string;
  campo: string;
  nomeExibicao: string;
  categoria: string;
}

export const FORM_FIELDS_MAP: IFormFieldOption[] = [
  // ========== DADOS GERAIS ==========

  // 1.1) Informações da Empresa
  {
    id: "dadosGerais.informacoesEmpresa",
    secao: "dadosGerais",
    campo: "informacoesEmpresa",
    nomeExibicao: "Informações da Empresa",
    categoria: "Dados Gerais",
  },

  // 1.2) Recursos Humanos
  {
    id: "dadosGerais.recursosHumanos",
    secao: "dadosGerais",
    campo: "recursosHumanos",
    nomeExibicao: "Recursos Humanos",
    categoria: "Dados Gerais",
  },

  // 1.3) SESMT - Serviços Especializados
  {
    id: "dadosGerais.sesmt",
    secao: "dadosGerais",
    campo: "sesmt",
    nomeExibicao: "SESMT - Serviços Especializados",
    categoria: "Dados Gerais",
  },

  // 1.4) Resumo Estatístico Mensal de Acidentes
  {
    id: "dadosGerais.rem",
    secao: "dadosGerais",
    campo: "rem",
    nomeExibicao: "Resumo Estatístico Mensal de Acidentes",
    categoria: "Dados Gerais",
  },

  // ========== CONFORMIDADE LEGAL ==========

  // 2.1) NR 01 - Disposições Gerais
  {
    id: "conformidadeLegal.nr01",
    secao: "conformidadeLegal",
    campo: "nr01",
    nomeExibicao: "NR 01 - Disposições Gerais",
    categoria: "Conformidade Legal",
  },

  // 2.2) NR 04 - SESMT
  {
    id: "conformidadeLegal.nr04",
    secao: "conformidadeLegal",
    campo: "nr04",
    nomeExibicao: "NR 04 - SESMT",
    categoria: "Conformidade Legal",
  },

  // 2.3) NR 05 - CIPA
  {
    id: "conformidadeLegal.nr05",
    secao: "conformidadeLegal",
    campo: "nr05",
    nomeExibicao: "NR 05 - CIPA",
    categoria: "Conformidade Legal",
  },

  // 2.4) NR 06 - EPI
  {
    id: "conformidadeLegal.nr06",
    secao: "conformidadeLegal",
    campo: "nr06",
    nomeExibicao: "NR 06 - EPI",
    categoria: "Conformidade Legal",
  },

  // 2.5) NR 07 - PCMSO
  {
    id: "conformidadeLegal.nr07",
    secao: "conformidadeLegal",
    campo: "nr07",
    nomeExibicao: "NR 07 - PCMSO",
    categoria: "Conformidade Legal",
  },

  // 2.6) NR 10 - Instalações e Serviços em Eletricidade
  {
    id: "conformidadeLegal.nr10",
    secao: "conformidadeLegal",
    campo: "nr10",
    nomeExibicao: "NR 10 - Instalações e Serviços em Eletricidade",
    categoria: "Conformidade Legal",
  },

  // 2.7) NR 11 - Transporte, Movimentação, Armazenagem e Manuseio de Materiais
  {
    id: "conformidadeLegal.nr11",
    secao: "conformidadeLegal",
    campo: "nr11",
    nomeExibicao:
      "NR 11 - Transporte, Movimentação, Armazenagem e Manuseio de Materiais",
    categoria: "Conformidade Legal",
  },

  // 2.8) NR 12 - Máquinas e Equipamentos
  {
    id: "conformidadeLegal.nr12",
    secao: "conformidadeLegal",
    campo: "nr12",
    nomeExibicao: "NR 12 - Máquinas e Equipamentos",
    categoria: "Conformidade Legal",
  },

  // 2.9) NR 13 - Caldeiras e Vasos de Pressão
  {
    id: "conformidadeLegal.nr13",
    secao: "conformidadeLegal",
    campo: "nr13",
    nomeExibicao: "NR 13 - Caldeiras e Vasos de Pressão",
    categoria: "Conformidade Legal",
  },

  // 2.10) NR 15 - Atividades e Operações Insalubres
  {
    id: "conformidadeLegal.nr15",
    secao: "conformidadeLegal",
    campo: "nr15",
    nomeExibicao: "NR 15 - Atividades e Operações Insalubres",
    categoria: "Conformidade Legal",
  },

  // 2.11) NR 16 - Atividades e Operações Perigosas
  {
    id: "conformidadeLegal.nr16",
    secao: "conformidadeLegal",
    campo: "nr16",
    nomeExibicao: "NR 16 - Atividades e Operações Perigosas",
    categoria: "Conformidade Legal",
  },

  // 2.12) NR 23 - Proteção Contra Incêndios
  {
    id: "conformidadeLegal.nr23",
    secao: "conformidadeLegal",
    campo: "nr23",
    nomeExibicao: "NR 23 - Proteção Contra Incêndios",
    categoria: "Conformidade Legal",
  },

  // 2.13) Licenças Ambientais
  {
    id: "conformidadeLegal.licencasAmbientais",
    secao: "conformidadeLegal",
    campo: "licencasAmbientais",
    nomeExibicao: "Licenças Ambientais",
    categoria: "Conformidade Legal",
  },

  // 2.14) Legislação Marítima
  {
    id: "conformidadeLegal.legislacaoMaritima",
    secao: "conformidadeLegal",
    campo: "legislacaoMaritima",
    nomeExibicao: "Legislação Marítima",
    categoria: "Conformidade Legal",
  },

  // 2.15) Treinamentos Obrigatórios
  {
    id: "conformidadeLegal.treinamentos",
    secao: "conformidadeLegal",
    campo: "treinamentos",
    nomeExibicao: "Treinamentos Obrigatórios",
    categoria: "Conformidade Legal",
  },

  // 2.16) Gestão de SMS (Saúde, Meio Ambiente e Segurança)
  {
    id: "conformidadeLegal.gestaoSMS",
    secao: "conformidadeLegal",
    campo: "gestaoSMS",
    nomeExibicao: "Gestão de SMS (Saúde, Meio Ambiente e Segurança)",
    categoria: "Conformidade Legal",
  },

  // ========== SERVIÇOS ESPECIAIS ==========

  // 3.1) Fornecedores de Embarcações
  {
    id: "servicosEspeciais.fornecedorEmbarcacoes",
    secao: "servicosEspeciais",
    campo: "fornecedorEmbarcacoes",
    nomeExibicao: "Fornecedores de Embarcações",
    categoria: "Serviços Especiais",
  },

  // 3.2) Fornecedor de Içamento
  {
    id: "servicosEspeciais.fornecedorIcamento",
    secao: "servicosEspeciais",
    campo: "fornecedorIcamento",
    nomeExibicao: "Fornecedor de Içamento",
    categoria: "Serviços Especiais",
  },
];

// Helper function para obter opções por categoria
export const getFieldsByCategory = (categoria: string): IFormFieldOption[] => {
  return FORM_FIELDS_MAP.filter((field) => field.categoria === categoria);
};

// Helper function para obter todas as categorias únicas
export const getCategories = (): string[] => {
  return Array.from(new Set(FORM_FIELDS_MAP.map((field) => field.categoria)));
};

// Helper function para encontrar campo por ID
export const getFieldById = (id: string): IFormFieldOption | undefined => {
  return FORM_FIELDS_MAP.find((field) => field.id === id);
};
