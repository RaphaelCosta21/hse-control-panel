// Mock data para testar a nova coluna "Análise por"
// Este arquivo pode ser usado para simular dados durante desenvolvimento

export const mockFormularios = [
  {
    Id: 1,
    Title: "Petrobras S.A.",
    CNPJ: "33.000.167/0001-01",
    StatusAvaliacao: "Em Análise",
    Created: "2024-08-10T09:00:00Z",
    Modified: "2024-08-12T14:30:00Z",
    GrauRisco: "4",
    PercentualConclusao: 95,
    EmailPreenchimento: "contrato@petrobras.com.br",
    NomePreenchimento: "João Silva",
    AnexosCount: 8,
    // Exemplo com avaliador atribuído
    AvaliadorResponsavel: {
      Title: "Maria Santos",
      EMail: "maria.santos@oceaneering.com",
      Id: 25,
    },
    DadosFormulario: JSON.stringify({
      // ... outros dados do formulário
      metadata: {
        avaliadorAtribuido: {
          name: "Maria Santos",
          email: "maria.santos@oceaneering.com",
          photoUrl:
            "/_layouts/15/userphoto.aspx?size=L&username=maria.santos@oceaneering.com",
          isActive: true,
        },
      },
    }),
  },
  {
    Id: 2,
    Title: "Vale S.A.",
    CNPJ: "33.592.510/0001-54",
    StatusAvaliacao: "Aprovado",
    Created: "2024-08-08T11:15:00Z",
    Modified: "2024-08-11T16:45:00Z",
    GrauRisco: "3",
    PercentualConclusao: 100,
    EmailPreenchimento: "fornecedor@vale.com",
    NomePreenchimento: "Ana Costa",
    AnexosCount: 12,
    // Exemplo com avaliador atribuído
    AvaliadorResponsavel: {
      Title: "Carlos Oliveira",
      EMail: "carlos.oliveira@oceaneering.com",
      Id: 31,
    },
  },
  {
    Id: 3,
    Title: "Sabesp",
    CNPJ: "43.776.517/0001-80",
    StatusAvaliacao: "Pendente Informações",
    Created: "2024-08-05T08:30:00Z",
    Modified: "2024-08-07T13:20:00Z",
    GrauRisco: "2",
    PercentualConclusao: 75,
    EmailPreenchimento: "suprimentos@sabesp.com.br",
    NomePreenchimento: "Pedro Ferreira",
    AnexosCount: 4,
    // Exemplo SEM avaliador atribuído (irá mostrar "Não atribuído")
    AvaliadorResponsavel: null,
  },
  {
    Id: 4,
    Title: "Empresa ABC Ltda",
    CNPJ: "12.345.678/0001-90",
    StatusAvaliacao: "Rejeitado",
    Created: "2024-08-02T14:00:00Z",
    Modified: "2024-08-04T10:15:00Z",
    GrauRisco: "4",
    PercentualConclusao: 85,
    EmailPreenchimento: "contato@empresaabc.com.br",
    NomePreenchimento: "Roberto Lima",
    AnexosCount: 3,
    // Exemplo com avaliador no DadosFormulario JSON
    DadosFormulario: JSON.stringify({
      metadata: {
        avaliadorAtribuido: {
          name: "Laura Mendes",
          email: "laura.mendes@oceaneering.com",
          photoUrl:
            "/_layouts/15/userphoto.aspx?size=L&username=laura.mendes@oceaneering.com",
          isActive: true,
        },
      },
    }),
  },
  {
    Id: 5,
    Title: "Tech Solutions Corp",
    CNPJ: "98.765.432/0001-21",
    StatusAvaliacao: "Em Andamento",
    Created: "2024-08-14T10:45:00Z",
    Modified: "2024-08-14T10:45:00Z",
    GrauRisco: "1",
    PercentualConclusao: 45,
    EmailPreenchimento: "procurement@techsolutions.com",
    NomePreenchimento: "Sandra Torres",
    AnexosCount: 2,
    // Exemplo SEM avaliador - mostrará "Não atribuído"
  },
];

// Dados mock de membros da equipe HSE (para simular PeoplePicker)
export const mockAvaliadores = [
  {
    name: "Maria Santos",
    email: "maria.santos@oceaneering.com",
    photoUrl:
      "/_layouts/15/userphoto.aspx?size=L&username=maria.santos@oceaneering.com",
    isActive: true,
    team: "HSE",
    role: "Especialista HSE Senior",
  },
  {
    name: "Carlos Oliveira",
    email: "carlos.oliveira@oceaneering.com",
    photoUrl:
      "/_layouts/15/userphoto.aspx?size=L&username=carlos.oliveira@oceaneering.com",
    isActive: true,
    team: "HSE",
    role: "Analista HSE",
  },
  {
    name: "Laura Mendes",
    email: "laura.mendes@oceaneering.com",
    photoUrl:
      "/_layouts/15/userphoto.aspx?size=L&username=laura.mendes@oceaneering.com",
    isActive: true,
    team: "HSE",
    role: "Coordenadora HSE",
  },
  {
    name: "Ricardo Almeida",
    email: "ricardo.almeida@oceaneering.com",
    photoUrl:
      "/_layouts/15/userphoto.aspx?size=L&username=ricardo.almeida@oceaneering.com",
    isActive: true,
    team: "HSE",
    role: "Gerente HSE",
  },
];

// Função auxiliar para simular atribuição de avaliador
export const atribuirAvaliador = (
  formularioId: number,
  avaliador: (typeof mockAvaliadores)[0]
) => {
  console.log(
    `Atribuindo avaliador ${avaliador.name} ao formulário ${formularioId}`
  );

  // Em implementação real, isso faria:
  // 1. Update na coluna AvaliadorResponsavel do SharePoint
  // 2. Update no JSON DadosFormulario.metadata.avaliadorAtribuido
  // 3. Envio de notificação para o avaliador
  // 4. Atualização do status do formulário para "Em Análise"

  return {
    success: true,
    message: `Avaliador ${avaliador.name} atribuído com sucesso!`,
    data: {
      formularioId,
      avaliador,
      dataAtribuicao: new Date().toISOString(),
    },
  };
};
