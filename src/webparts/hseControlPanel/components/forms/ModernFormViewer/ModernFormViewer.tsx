import * as React from "react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import {
  Panel,
  PanelType,
  Stack,
  Text,
  CommandBar,
  ICommandBarItemProps,
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType,
  Pivot,
  PivotItem,
  DefaultButton,
  PrimaryButton,
  Dialog,
  DialogType,
  DialogFooter,
  TextField,
  Dropdown,
  IDropdownOption,
  PersonaSize,
  IPersonaProps,
} from "@fluentui/react";
import { UserCard } from "../../ui";
import { IFormListItem } from "../../../types/IControlPanelData";
import { IHSEFormData } from "../../../types/IHSEFormData";
import { SharePointService } from "../../../services/SharePointService";
import { MembersService } from "../../../services/MembersService";
import DadosGeraisSection from "./sections/DadosGeraisSection";
import ConformidadeLegalSection from "./sections/ConformidadeLegalSection";
import ServicosEspeciaisSection from "./sections/ServicosEspeciaisSection";
import styles from "./ModernFormViewer.module.scss";

export interface IModernFormViewerProps {
  isOpen: boolean;
  onDismiss: () => void;
  form: IFormListItem | undefined;
  sharePointService: SharePointService;
  context: WebPartContext;
  onFormUpdate?: (updatedForm: IFormListItem) => void;
  currentUser?: {
    name: string;
    email: string;
    photoUrl?: string;
  };
}

interface IReviewData {
  status: "Aprovado" | "Rejeitado" | "Pendente Informações";
  comments: string;
  reviewer: {
    name: string;
    email: string;
    photoUrl?: string;
  };
  reviewDate: Date;
}

const ModernFormViewer: React.FC<IModernFormViewerProps> = ({
  isOpen,
  onDismiss,
  form,
  sharePointService,
  context,
  onFormUpdate,
  currentUser,
}) => {
  console.log("🎭 [ModernFormViewer] Componente renderizado");
  console.log("🎭 [ModernFormViewer] Props:", {
    isOpen,
    form,
    sharePointService,
    currentUser,
  });

  // Função para obter classe CSS de status
  const getStatusClass = React.useCallback((status?: string): string => {
    if (!status) return "";
    const statusKey = `status${status.replace(/\s+/g, "")}`;
    const statusClasses: Record<string, string> = {
      statusAprovado: styles.statusAprovado || "",
      statusRejeitado: styles.statusRejeitado || "",
      statusEmAnálise: styles.statusEmAnálise || "",
      statusEnviado: styles.statusEnviado || "",
      statusPendenteInformações: styles.statusPendenteInformações || "",
      statusEmAndamento: styles.statusEmAndamento || "",
    };
    return statusClasses[statusKey] || "";
  }, []);

  const [formData, setFormData] = React.useState<IHSEFormData | undefined>(
    undefined
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [showReviewDialog, setShowReviewDialog] = React.useState(false);
  const [reviewStatus, setReviewStatus] = React.useState<
    "Aprovado" | "Rejeitado" | "Pendente Informações"
  >("Aprovado");
  const [reviewComments, setReviewComments] = React.useState("");
  const [submittingReview, setSubmittingReview] = React.useState(false);
  const [isReviewing, setIsReviewing] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState("dadosGerais");

  // Estados para a nova seção de avaliação detalhada
  const [showEvaluationDetails, setShowEvaluationDetails] =
    React.useState(false);
  const [selectedHSEResponsible, setSelectedHSEResponsible] =
    React.useState<IPersonaProps | null>(null);
  const [evaluationStarted, setEvaluationStarted] = React.useState(false);
  const [evaluationResult, setEvaluationResult] = React.useState<
    "Aprovado" | "Pendente Info." | "Rejeitado"
  >("Aprovado");
  const [evaluationComments, setEvaluationComments] = React.useState("");
  const [startDate, setStartDate] = React.useState<string>("");
  const [showStartConfirmation, setShowStartConfirmation] =
    React.useState(false);
  const [showSendConfirmation, setShowSendConfirmation] = React.useState(false);
  const [hseMembersList, setHseMembersList] = React.useState<IPersonaProps[]>(
    []
  );

  // Função para criar dados básicos do formulário
  const createBasicFormData = (formDetails: {
    Id: number;
    Title: string;
    CNPJ: string;
    StatusAvaliacao: string;
    GrauRisco: string;
    PercentualConclusao: number;
    EmailPreenchimento: string;
    NomePreenchimento: string;
  }): IHSEFormData => {
    return {
      id: formDetails.Id,
      grauRisco: (formDetails.GrauRisco || "2") as "1" | "2" | "3" | "4",
      percentualConclusao: formDetails.PercentualConclusao || 0,
      status: (formDetails.StatusAvaliacao || "Em Andamento") as
        | "Em Andamento"
        | "Enviado"
        | "Em Análise"
        | "Aprovado"
        | "Rejeitado"
        | "Pendente Informações",
      dadosGerais: {
        empresa: formDetails.Title || "",
        cnpj: formDetails.CNPJ || "",
        numeroContrato: "",
        dataInicioContrato: new Date(),
        dataTerminoContrato: new Date(),
        responsavelTecnico: formDetails.NomePreenchimento || "",
        email: formDetails.EmailPreenchimento || "",
        atividadePrincipalCNAE: "",
        grauRisco: (formDetails.GrauRisco || "2") as "1" | "2" | "3" | "4",
        gerenteContratoMarine: "",
        escopoServico: "",
        totalEmpregados: 0,
        empregadosParaServico: 0,
        possuiSESMT: false,
        numeroComponentesSESMT: 0,
      },
      conformidadeLegal: {
        nr01: { aplicavel: false, questoes: {}, comentarios: "" },
        nr04: { aplicavel: false, questoes: {}, comentarios: "" },
        nr05: { aplicavel: false, questoes: {}, comentarios: "" },
        nr06: { aplicavel: false, questoes: {}, comentarios: "" },
        nr07: { aplicavel: false, questoes: {}, comentarios: "" },
        nr09: { aplicavel: false, questoes: {}, comentarios: "" },
        nr10: { aplicavel: false, questoes: {}, comentarios: "" },
        nr11: { aplicavel: false, questoes: {}, comentarios: "" },
        nr12: { aplicavel: false, questoes: {}, comentarios: "" },
        nr13: { aplicavel: false, questoes: {}, comentarios: "" },
        nr15: { aplicavel: false, questoes: {}, comentarios: "" },
        nr23: { aplicavel: false, questoes: {}, comentarios: "" },
        licencasAmbientais: { aplicavel: false, questoes: {}, comentarios: "" },
        legislacaoMaritima: { aplicavel: false, questoes: {}, comentarios: "" },
        treinamentosObrigatorios: {
          aplicavel: false,
          questoes: {},
          comentarios: "",
        },
        gestaoSMS: { aplicavel: false, questoes: {}, comentarios: "" },
      },
      servicosEspeciais: {
        fornecedorEmbarcacoes: false,
        fornecedorIcamentoCarga: false,
      },
      anexos: {
        rem: [], // Array vazio por padrão
      },
    };
  };

  const loadFormData = React.useCallback(async () => {
    console.log("📊 [ModernFormViewer] loadFormData iniciado");
    console.log("📊 [ModernFormViewer] Form:", form);

    if (!form) {
      console.log("❌ [ModernFormViewer] Form é null/undefined, saindo");
      return;
    }

    try {
      console.log("⏳ [ModernFormViewer] Iniciando carregamento de dados");
      setLoading(true);
      setError(undefined);

      console.log(
        "🔗 [ModernFormViewer] Chamando sharePointService.getFormDetails com ID:",
        form.id
      );
      // Carregar dados reais do SharePoint
      const formDetails = await sharePointService.getFormDetails(form.id);

      console.log(
        "📋 [ModernFormViewer] Dados retornados do SharePoint:",
        formDetails
      );

      let realFormData: IHSEFormData;

      if (formDetails.DadosFormulario) {
        console.log(
          "💾 [ModernFormViewer] Usando dados salvos do campo DadosFormulario"
        );
        // Se temos dados salvos no campo DadosFormulario, usar eles
        try {
          const parsedData = JSON.parse(formDetails.DadosFormulario);
          console.log(
            "📄 [ModernFormViewer] Dados parseados com sucesso:",
            parsedData
          );
          realFormData = {
            ...parsedData,
            id: formDetails.Id,
            grauRisco: formDetails.GrauRisco as "1" | "2" | "3" | "4",
            percentualConclusao: formDetails.PercentualConclusao,
            status: formDetails.StatusAvaliacao as
              | "Em Andamento"
              | "Enviado"
              | "Em Análise"
              | "Aprovado"
              | "Rejeitado"
              | "Pendente Informações",
          };
        } catch (parseError) {
          console.warn(
            "⚠️ [ModernFormViewer] Erro ao analisar dados do formulário, usando dados básicos:",
            parseError
          );
          realFormData = createBasicFormData(formDetails);
        }
      } else {
        console.log(
          "🔧 [ModernFormViewer] Campo DadosFormulario vazio, criando estrutura básica"
        );
        // Criar estrutura básica com dados disponíveis
        realFormData = createBasicFormData(formDetails);
      }

      console.log(
        "✅ [ModernFormViewer] Form data final processado:",
        realFormData
      );
      setFormData(realFormData);
    } catch (err) {
      console.error(
        "❌ [ModernFormViewer] Erro ao carregar dados do formulário:",
        err
      );
      setError("Erro ao carregar os dados do formulário. Tente novamente.");
    } finally {
      console.log(
        "🏁 [ModernFormViewer] loadFormData finalizado, setLoading(false)"
      );
      setLoading(false);
    }
  }, [form, sharePointService]);

  // Load form data when form changes
  React.useEffect(() => {
    console.log(
      "🔄 [ModernFormViewer] useEffect triggered - form:",
      form,
      "isOpen:",
      isOpen
    );
    if (form && isOpen) {
      console.log(
        "🚀 [ModernFormViewer] Condições atendidas, chamando loadFormData"
      );
      loadFormData().catch(console.error);
    } else {
      console.log(
        "⏸️ [ModernFormViewer] Condições não atendidas para carregar dados"
      );
    }
  }, [form, isOpen, loadFormData]);

  // Load HSE members when component mounts
  React.useEffect(() => {
    const loadHSEMembers = async (): Promise<void> => {
      try {
        const membersService = new MembersService(context);
        const members = await membersService.getTeamMembers();
        const personaList = members.hseMembers.map((member) => ({
          text: member.name,
          secondaryText: member.email,
          id: member.id.toString(),
        }));
        setHseMembersList(personaList);
      } catch (error) {
        console.error("Erro ao carregar membros HSE:", error);
      }
    };

    if (context) {
      loadHSEMembers().catch(console.error);
    }
  }, [context]);

  const handleStartReview = React.useCallback(() => {
    setShowReviewDialog(true);
  }, []);

  const handleStartEvaluation = React.useCallback(async () => {
    console.log("🔄 handleStartEvaluation iniciado");
    if (!form || !selectedHSEResponsible) {
      console.log("❌ Form ou selectedHSEResponsible não disponível", {
        form,
        selectedHSEResponsible,
      });
      return;
    }

    try {
      console.log("⏳ Iniciando processo de avaliação...");
      setSubmittingReview(true);

      // Criar histórico de mudança de status (objeto, não array)
      const statusAtual = "Em Análise";
      const novoHistoricoStatus = {
        ...formData?.historicoStatusChange,
        [statusAtual]: {
          dataAlteracao: new Date().toISOString(),
          usuario: selectedHSEResponsible.text || "",
          email: selectedHSEResponsible.secondaryText || "",
        },
      };

      // Preparar dados da avaliação
      const evaluationData = {
        status: statusAtual,
        responsavel: {
          name: selectedHSEResponsible.text || "",
          email: selectedHSEResponsible.secondaryText || "",
          id: selectedHSEResponsible.id || "",
        },
        historicoStatusChange: novoHistoricoStatus,
        formData: formData,
      };

      // Atualizar o formulário no SharePoint com a nova estrutura
      await sharePointService.updateFormWithEvaluation(form.id, evaluationData);

      // Atualizar estados locais
      setEvaluationStarted(true);
      setStartDate(new Date().toLocaleString("pt-BR"));

      // Buscar dados atualizados do SharePoint após salvar
      const updatedFormDetails = await sharePointService.getFormDetails(
        form.id
      );
      if (updatedFormDetails?.DadosFormulario) {
        try {
          const parsedData = JSON.parse(updatedFormDetails.DadosFormulario);
          setFormData(parsedData);
        } catch (parseError) {
          console.warn("Erro ao parsear dados atualizados:", parseError);
        }
      }

      // Chamar callback de atualização se fornecido
      if (onFormUpdate) {
        const updatedForm: IFormListItem = {
          ...form,
          status: "Em Análise",
        };
        onFormUpdate(updatedForm);
      }

      console.log("✅ Avaliação iniciada com sucesso");
    } catch (error) {
      console.error("Erro ao iniciar avaliação:", error);
      setError("Erro ao iniciar avaliação. Tente novamente.");
    } finally {
      setSubmittingReview(false);
    }
  }, [form, selectedHSEResponsible, formData, sharePointService, onFormUpdate]);

  const handleConfirmStartReview = React.useCallback(async () => {
    if (!form || !currentUser) return;

    try {
      setSubmittingReview(true);

      // Atualizar o formulário com o avaliador atribuído
      const updatedForm: IFormListItem = {
        ...form,
        status: "Em Análise",
        avaliadorAtribuido: {
          name: currentUser.name,
          email: currentUser.email,
          photoUrl: currentUser.photoUrl,
          isActive: true,
        },
      };

      // Implementar chamada para SharePoint aqui
      console.log("Iniciando revisão:", updatedForm);

      setIsReviewing(true);
      setShowReviewDialog(false);

      if (onFormUpdate) {
        onFormUpdate(updatedForm);
      }
    } catch (err) {
      console.error("Erro ao iniciar revisão:", err);
      setError("Erro ao iniciar revisão. Tente novamente.");
    } finally {
      setSubmittingReview(false);
    }
  }, [form, currentUser, onFormUpdate]);

  const handleFinishReview = React.useCallback(async () => {
    if (!form || !currentUser) return;

    try {
      setSubmittingReview(true);

      const reviewData: IReviewData = {
        status: reviewStatus,
        comments: reviewComments,
        reviewer: {
          name: currentUser.name,
          email: currentUser.email,
          photoUrl: currentUser.photoUrl,
        },
        reviewDate: new Date(),
      };

      // Implementar chamada para SharePoint aqui
      console.log("Finalizando revisão:", reviewData);

      const updatedForm: IFormListItem = {
        ...form,
        status:
          reviewStatus === "Pendente Informações"
            ? "Pendente Informações"
            : reviewStatus,
        dataAvaliacao: new Date(),
      };

      setIsReviewing(false);

      if (onFormUpdate) {
        onFormUpdate(updatedForm);
      }

      onDismiss();
    } catch (err) {
      console.error("Erro ao finalizar revisão:", err);
      setError("Erro ao finalizar revisão. Tente novamente.");
    } finally {
      setSubmittingReview(false);
    }
  }, [
    form,
    currentUser,
    reviewStatus,
    reviewComments,
    onFormUpdate,
    onDismiss,
  ]);

  const reviewStatusOptions: IDropdownOption[] = [
    { key: "Aprovado", text: "✅ Aprovado" },
    { key: "Rejeitado", text: "❌ Rejeitado" },
    { key: "Pendente Informações", text: "⚠️ Pendente Informações" },
  ];

  const getCommandBarItems = React.useCallback((): ICommandBarItemProps[] => {
    if (!formData) return [];

    if (isReviewing) {
      return [
        {
          key: "finishReview",
          text: "Finalizar Revisão",
          iconProps: { iconName: "Completed" },
          onClick: () => {
            handleFinishReview().catch(console.error);
          },
          className: styles.primaryAction,
        },
      ];
    }

    if (formData.status === "Enviado" && currentUser) {
      return [
        {
          key: "evaluationDetails",
          text: "Detalhes Avaliação",
          iconProps: { iconName: "ReviewSolid" },
          onClick: () => setShowEvaluationDetails(!showEvaluationDetails),
          className: styles.primaryAction,
        },
      ];
    }

    // Mostrar botão de Detalhes Avaliação para outros status também
    if (
      (formData.status === "Em Análise" ||
        formData.status === "Aprovado" ||
        formData.status === "Rejeitado" ||
        formData.status === "Pendente Informações" ||
        formData.status === "Em Andamento") &&
      currentUser
    ) {
      return [
        {
          key: "evaluationDetails",
          text: "Detalhes Avaliação",
          iconProps: { iconName: "ReviewSolid" },
          onClick: () => setShowEvaluationDetails(!showEvaluationDetails),
          className: styles.primaryAction,
        },
      ];
    }

    return [];
  }, [
    formData,
    isReviewing,
    currentUser,
    showEvaluationDetails,
    handleStartReview,
    handleFinishReview,
  ]);

  const renderHeader = (): React.ReactElement => (
    <div className={styles.header}>
      <Stack tokens={{ childrenGap: 20 }}>
        {/* Linha principal com título e informações da empresa */}
        <Stack
          horizontal
          horizontalAlign="space-between"
          verticalAlign="center"
        >
          <Stack.Item grow>
            <Stack tokens={{ childrenGap: 8 }}>
              <Text variant="xxLarge" className={styles.title}>
                📋 Formulário HSE
              </Text>
              <Stack
                horizontal
                tokens={{ childrenGap: 16 }}
                verticalAlign="center"
              >
                <div className={styles.companyInfo}>
                  <Text variant="large" className={styles.companyName}>
                    {formData?.dadosGerais.empresa}
                  </Text>
                </div>
                <div className={styles.cnpjInfo}>
                  <Text className={styles.cnpjLabel}>CNPJ:</Text>
                  <Text className={styles.cnpjValue}>
                    {formData?.dadosGerais.cnpj}
                  </Text>
                </div>
              </Stack>
            </Stack>
          </Stack.Item>

          {formData?.analisadoPor && (
            <Stack.Item>
              <div className={styles.reviewerSection}>
                <span className={styles.reviewerLabel}>Analisado por:</span>
                <div className={styles.reviewerCard}>
                  <UserCard
                    user={{
                      name: formData.analisadoPor,
                      email: "",
                      photoUrl: undefined,
                      isActive: true,
                    }}
                    size={PersonaSize.size32}
                  />
                </div>
              </div>
            </Stack.Item>
          )}
        </Stack>

        {/* Linha de status e informações adicionais */}
        <Stack
          horizontal
          horizontalAlign="space-between"
          verticalAlign="center"
        >
          <Stack horizontal tokens={{ childrenGap: 24 }} verticalAlign="center">
            <div className={styles.statusInfo}>
              <Text className={styles.infoLabel}>Status:</Text>
              <span
                className={`${styles.statusBadge} ${
                  formData?.status
                    ? (styles as any)[
                        `status${formData.status.replace(/\s+/g, "")}`
                      ]
                    : ""
                }`}
              >
                {formData?.status === "Aprovado" && "✅"}
                {formData?.status === "Rejeitado" && "❌"}
                {formData?.status === "Em Análise" && "🔄"}
                {formData?.status === "Enviado" && "📤"}
                {formData?.status === "Pendente Informações" && "⚠️"}
                {formData?.status === "Em Andamento" && "⏳"} {formData?.status}
              </span>
            </div>

            {formData?.dataEnvio && (
              <div className={styles.dateInfo}>
                <Text className={styles.infoLabel}>Data de Envio:</Text>
                <Text className={styles.infoValue}>
                  {new Date(formData.dataEnvio).toLocaleDateString("pt-BR")}
                </Text>
              </div>
            )}

            {formData?.dataAvaliacao && (
              <div className={styles.dateInfo}>
                <Text className={styles.infoLabel}>Data de Avaliação:</Text>
                <Text className={styles.infoValue}>
                  {new Date(formData.dataAvaliacao).toLocaleDateString("pt-BR")}
                </Text>
              </div>
            )}
          </Stack>
        </Stack>
      </Stack>

      {isReviewing && (
        <MessageBar
          messageBarType={MessageBarType.info}
          className={styles.reviewingAlert}
        >
          🔍 <strong>Modo Revisão Ativo:</strong> Você está revisando este
          formulário.
        </MessageBar>
      )}
    </div>
  );

  const renderContent = (): React.ReactElement => {
    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <Spinner size={SpinnerSize.large} label="Carregando formulário..." />
        </div>
      );
    }

    if (error) {
      return (
        <MessageBar
          messageBarType={MessageBarType.error}
          className={styles.errorMessage}
        >
          {error}
        </MessageBar>
      );
    }

    if (!formData) {
      return (
        <div className={styles.emptyState}>
          <span>Nenhum formulário selecionado.</span>
        </div>
      );
    }

    return (
      <>
        {/* Seção de Avaliação Detalhada */}
        {(formData.status === "Enviado" ||
          formData.status === "Em Análise" ||
          formData.status === "Aprovado" ||
          formData.status === "Rejeitado" ||
          formData.status === "Pendente Informações") &&
          showEvaluationDetails && (
            <div className={styles.evaluationSection}>
              <Stack tokens={{ childrenGap: 20 }}>
                <Text variant="xLarge" className={styles.evaluationTitle}>
                  📋 Detalhes da Avaliação
                </Text>

                {/* Estado 1: Antes da avaliação - Formulário enviado, aguardando início */}
                {formData.status === "Enviado" && !evaluationStarted ? (
                  <Stack tokens={{ childrenGap: 16 }}>
                    <Text>
                      Selecione um responsável HSE para iniciar a avaliação:
                    </Text>
                    <Dropdown
                      label="Responsável HSE"
                      placeholder="Selecione um membro da equipe HSE"
                      options={hseMembersList.map((member) => ({
                        key: member.id || "",
                        text: member.text || "",
                      }))}
                      selectedKey={selectedHSEResponsible?.id}
                      onChange={(_, option) => {
                        const selectedMember = hseMembersList.find(
                          (m) => m.id === option?.key
                        );
                        setSelectedHSEResponsible(selectedMember || null);
                      }}
                    />
                    <Stack
                      horizontal
                      horizontalAlign="start"
                      tokens={{ childrenGap: 16 }}
                    >
                      <PrimaryButton
                        text="Iniciar Avaliação"
                        iconProps={{ iconName: "Play" }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("🚀 Botão Iniciar Avaliação clicado");
                          setShowStartConfirmation(true);
                        }}
                        disabled={!selectedHSEResponsible}
                      />
                    </Stack>
                  </Stack>
                ) : /* Estado 2: Durante a avaliação - Em análise, pode editar */
                formData.status === "Em Análise" ? (
                  <Stack tokens={{ childrenGap: 16 }}>
                    <Stack
                      horizontal
                      verticalAlign="center"
                      tokens={{ childrenGap: 8 }}
                    >
                      <Text>Status atual:</Text>
                      <Text className={styles.statusBadge}>🔄 Em Análise</Text>
                      <Text>desde {startDate}</Text>
                    </Stack>

                    <Text>Responsável: {selectedHSEResponsible?.text}</Text>

                    <Dropdown
                      label="Resultado da Avaliação"
                      selectedKey={evaluationResult}
                      onChange={(_, option) =>
                        setEvaluationResult(
                          option?.key as
                            | "Aprovado"
                            | "Pendente Info."
                            | "Rejeitado"
                        )
                      }
                      options={[
                        { key: "Aprovado", text: "✅ Aprovado" },
                        {
                          key: "Pendente Info.",
                          text: "⏳ Pendente Informações",
                        },
                        { key: "Rejeitado", text: "❌ Rejeitado" },
                      ]}
                    />

                    <TextField
                      label="Comentários da Avaliação"
                      multiline
                      rows={4}
                      value={evaluationComments}
                      onChange={(_, value) =>
                        setEvaluationComments(value || "")
                      }
                      placeholder="Digite seus comentários sobre a avaliação..."
                    />

                    <Stack
                      horizontal
                      horizontalAlign="start"
                      tokens={{ childrenGap: 16 }}
                    >
                      <PrimaryButton
                        text="Enviar Avaliação"
                        iconProps={{ iconName: "Send" }}
                        onClick={() => setShowSendConfirmation(true)}
                      />
                    </Stack>
                  </Stack>
                ) : (
                  /* Estado 3: Após a avaliação - Mostra informações somente leitura */
                  <Stack tokens={{ childrenGap: 16 }}>
                    <Text variant="large">📋 Avaliação Finalizada</Text>

                    {(() => {
                      // Debug: Log dos dados para verificar estrutura
                      console.log(
                        "🔍 [ModernFormViewer] Dados completos do formulário:",
                        formData
                      );
                      console.log(
                        "🔍 [ModernFormViewer] Metadata:",
                        (formData as unknown as Record<string, unknown>)
                          ?.metadata
                      );

                      const metadata = (
                        formData as unknown as {
                          metadata?: {
                            Avaliacao?: Record<string, unknown>;
                            historicoStatusChange?: Record<
                              string,
                              { dataAlteracao?: string; email?: string }
                            >;
                          };
                        }
                      )?.metadata;

                      const avaliacaoData = metadata?.Avaliacao;
                      const historicoStatusChange =
                        metadata?.historicoStatusChange;

                      console.log(
                        "🔍 [ModernFormViewer] Historico Status Change:",
                        historicoStatusChange
                      );

                      // Buscar dados de avaliação
                      let evaluationData: {
                        HSEResponsavel?: string;
                        Comentarios?: string;
                      } = {};

                      if (avaliacaoData) {
                        const firstEvaluationKey =
                          Object.keys(avaliacaoData)[0];
                        evaluationData = (avaliacaoData[firstEvaluationKey] ||
                          avaliacaoData["0"]) as {
                          HSEResponsavel?: string;
                          Comentarios?: string;
                        };
                      }

                      // Buscar datas do histórico de status
                      let dataInicio = "N/A";
                      let dataConclusao = "N/A";

                      if (historicoStatusChange) {
                        // Data de início = quando foi para "Em Análise"
                        if (
                          historicoStatusChange["Em Análise"]?.dataAlteracao
                        ) {
                          dataInicio = new Date(
                            historicoStatusChange["Em Análise"].dataAlteracao
                          ).toLocaleString("pt-BR");
                        }

                        // Data de conclusão = data do status atual (Aprovado, Rejeitado, ou Pendente Info)
                        const currentStatus = formData.status;
                        if (
                          currentStatus === "Aprovado" &&
                          historicoStatusChange.Aprovado?.dataAlteracao
                        ) {
                          dataConclusao = new Date(
                            historicoStatusChange.Aprovado.dataAlteracao
                          ).toLocaleString("pt-BR");
                        } else if (
                          currentStatus === "Rejeitado" &&
                          historicoStatusChange.Rejeitado?.dataAlteracao
                        ) {
                          dataConclusao = new Date(
                            historicoStatusChange.Rejeitado.dataAlteracao
                          ).toLocaleString("pt-BR");
                        } else if (
                          currentStatus === "Pendente Informações" &&
                          historicoStatusChange["Pendente Info"]?.dataAlteracao
                        ) {
                          dataConclusao = new Date(
                            historicoStatusChange["Pendente Info"].dataAlteracao
                          ).toLocaleString("pt-BR");
                        }
                      }

                      return (
                        <Stack tokens={{ childrenGap: 8 }}>
                          <Text>
                            <strong>Status:</strong> {formData.status}
                          </Text>
                          <Text>
                            <strong>Responsável HSE:</strong>{" "}
                            {evaluationData.HSEResponsavel || "N/A"}
                          </Text>
                          <Text>
                            <strong>Data de Início:</strong> {dataInicio}
                          </Text>
                          <Text>
                            <strong>Data de Conclusão:</strong> {dataConclusao}
                          </Text>
                          <Text>
                            <strong>Comentários:</strong>
                          </Text>
                          <div
                            style={{
                              padding: "8px 12px",
                              backgroundColor: "#f3f2f1",
                              borderRadius: "4px",
                              border: "1px solid #edebe9",
                            }}
                          >
                            <Text>
                              {evaluationData.Comentarios ||
                                "Nenhum comentário fornecido"}
                            </Text>
                          </div>
                        </Stack>
                      );
                    })()}
                  </Stack>
                )}
              </Stack>
            </div>
          )}

        <Pivot
          selectedKey={selectedTab}
          onLinkClick={(item) =>
            setSelectedTab(item?.props.itemKey || "dadosGerais")
          }
          className={styles.pivot}
        >
          <PivotItem headerText="🏢 Dados Gerais" itemKey="dadosGerais">
            <div className={styles.pivotItem}>
              <DadosGeraisSection
                data={formData.dadosGerais}
                anexos={formData.anexos}
                isReviewing={isReviewing}
                sharePointService={sharePointService}
                formId={formData.id}
                cnpj={formData.dadosGerais.cnpj}
                empresa={formData.dadosGerais.empresa}
              />
            </div>
          </PivotItem>
          <PivotItem
            headerText="⚖️ Conformidade Legal"
            itemKey="conformidadeLegal"
          >
            <div className={styles.pivotItem}>
              <ConformidadeLegalSection
                data={formData.conformidadeLegal}
                anexos={formData.anexos}
                isReviewing={isReviewing}
                cnpj={formData.dadosGerais.cnpj || ""}
                empresa={String(formData.dadosGerais.nomeEmpresa || "")}
                id={formData.id?.toString() || ""}
                sharePointService={sharePointService}
              />
            </div>
          </PivotItem>
          <PivotItem
            headerText="🚢 Serviços Especiais"
            itemKey="servicosEspeciais"
          >
            <div className={styles.pivotItem}>
              <ServicosEspeciaisSection
                data={formData.servicosEspeciais}
                anexos={formData.anexos}
                isReviewing={isReviewing}
                cnpj={formData.dadosGerais?.cnpj || ""}
                empresa={String(formData.dadosGerais?.nomeEmpresa || "")}
                id={String(formData.dadosGerais?.id || "")}
                sharePointService={sharePointService}
              />
            </div>
          </PivotItem>
        </Pivot>
      </>
    );
  };

  console.log(
    "🎨 [ModernFormViewer] Renderizando componente - isOpen:",
    isOpen,
    "formData:",
    formData,
    "loading:",
    loading
  );

  return (
    <>
      <Panel
        isOpen={isOpen}
        onDismiss={(e) => {
          console.log("⚠️ Panel onDismiss acionado", e);
          if (!showStartConfirmation && !showSendConfirmation) {
            console.log("✅ Fechando panel - nenhum dialog aberto");
            onDismiss();
          } else {
            console.log("❌ Impedindo fechamento do panel - dialog aberto");
          }
        }}
        type={PanelType.extraLarge}
        headerText=""
        closeButtonAriaLabel="Fechar"
        className={styles.panel}
      >
        <div className={styles.container}>
          {renderHeader()}

          <div className={styles.commandBar}>
            <CommandBar items={getCommandBarItems()} />
          </div>

          <div className={styles.content}>{renderContent()}</div>
        </div>
      </Panel>

      <Dialog
        hidden={!showReviewDialog}
        onDismiss={() => setShowReviewDialog(false)}
        dialogContentProps={{
          type: DialogType.normal,
          title: "🔍 Iniciar Revisão",
          subText:
            "Deseja iniciar a revisão deste formulário? Você será atribuído como revisor.",
        }}
      >
        <DialogFooter>
          <PrimaryButton
            onClick={handleConfirmStartReview}
            disabled={submittingReview}
            text={submittingReview ? "Iniciando..." : "Sim, Iniciar Revisão"}
          />
          <DefaultButton
            onClick={() => setShowReviewDialog(false)}
            text="Cancelar"
          />
        </DialogFooter>
      </Dialog>

      {isReviewing && (
        <Dialog
          hidden={false}
          onDismiss={() => {}}
          dialogContentProps={{
            type: DialogType.normal,
            title: "✅ Finalizar Revisão",
            subText: "Defina o resultado da revisão deste formulário.",
          }}
          modalProps={{ isBlocking: true }}
        >
          <Stack tokens={{ childrenGap: 16 }}>
            <Dropdown
              label="Status da Revisão"
              options={reviewStatusOptions}
              selectedKey={reviewStatus}
              onChange={(_, option) =>
                setReviewStatus(
                  option?.key as
                    | "Aprovado"
                    | "Rejeitado"
                    | "Pendente Informações"
                )
              }
            />
            <TextField
              label="Comentários"
              multiline
              rows={4}
              value={reviewComments}
              onChange={(_, value) => setReviewComments(value || "")}
              placeholder="Digite seus comentários sobre a revisão..."
            />
          </Stack>
          <DialogFooter>
            <PrimaryButton
              onClick={handleFinishReview}
              disabled={submittingReview}
              text={submittingReview ? "Finalizando..." : "Finalizar Revisão"}
            />
            <DefaultButton
              onClick={() => setIsReviewing(false)}
              text="Continuar Revisando"
            />
          </DialogFooter>
        </Dialog>
      )}

      {/* Diálogo para confirmar início da avaliação */}
      <Dialog
        hidden={!showStartConfirmation}
        onDismiss={() => setShowStartConfirmation(false)}
        dialogContentProps={{
          type: DialogType.normal,
          title: "🚀 Iniciar Avaliação",
          subText: `Deseja iniciar a avaliação deste formulário com ${selectedHSEResponsible?.text}?`,
        }}
        modalProps={{ isBlocking: true, dragOptions: undefined }}
      >
        <Stack tokens={{ childrenGap: 12 }}>
          <Text>
            ⚠️ <strong>Atenção:</strong> Após iniciar a avaliação:
          </Text>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>O status será alterado para &quot;Em Análise&quot;</li>
            <li>O responsável HSE não poderá ser alterado</li>
            <li>Esta ação não pode ser desfeita</li>
          </ul>
        </Stack>
        <DialogFooter>
          <PrimaryButton
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("✅ Botão confirmar avaliação clicado");
              try {
                await handleStartEvaluation();
                console.log("✅ Avaliação iniciada com sucesso");
                setShowStartConfirmation(false);
              } catch (error) {
                console.error("❌ Erro ao iniciar avaliação:", error);
              }
            }}
            text="Sim, Iniciar Avaliação"
          />
          <DefaultButton
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("❌ Cancelar avaliação clicado");
              setShowStartConfirmation(false);
            }}
            text="Cancelar"
          />
        </DialogFooter>
      </Dialog>

      {/* Diálogo para confirmar envio da avaliação */}
      <Dialog
        hidden={!showSendConfirmation}
        onDismiss={() => setShowSendConfirmation(false)}
        dialogContentProps={{
          type: DialogType.normal,
          title: "📤 Enviar Avaliação",
          subText: `Confirma o envio da avaliação com resultado "${evaluationResult}"? Esta ação irá atualizar o status do formulário.`,
        }}
      >
        <DialogFooter>
          <PrimaryButton
            onClick={async () => {
              try {
                if (!form || !selectedHSEResponsible || !evaluationResult) {
                  alert("Dados insuficientes para enviar avaliação.");
                  return;
                }

                console.log("🔄 Enviando avaliação...");

                // Chamar o novo método submitEvaluation
                await sharePointService.submitEvaluation(form.id, {
                  hseResponsavel: selectedHSEResponsible.text || "",
                  email: selectedHSEResponsible.secondaryText || "",
                  comentarios: evaluationComments,
                  statusAvaliacao: evaluationResult,
                });

                console.log("✅ Avaliação enviada com sucesso");

                setShowSendConfirmation(false);
                setShowEvaluationDetails(false);

                // Buscar dados atualizados após envio
                const updatedFormDetails =
                  await sharePointService.getFormDetails(form.id);
                if (updatedFormDetails?.DadosFormulario) {
                  try {
                    const parsedData = JSON.parse(
                      updatedFormDetails.DadosFormulario
                    );
                    setFormData(parsedData);
                  } catch (parseError) {
                    console.warn(
                      "Erro ao parsear dados atualizados:",
                      parseError
                    );
                  }
                }

                // Chamar callback de atualização se fornecido
                if (onFormUpdate) {
                  const mappedStatus =
                    evaluationResult === "Pendente Info."
                      ? "Pendente Informações"
                      : evaluationResult;
                  const updatedForm: IFormListItem = {
                    ...form,
                    status: mappedStatus as
                      | "Aprovado"
                      | "Rejeitado"
                      | "Pendente Informações",
                  };
                  onFormUpdate(updatedForm);
                }

                // Notificar sucesso
                alert("Avaliação enviada com sucesso!");
              } catch (error) {
                console.error("Erro ao enviar avaliação:", error);
                alert("Erro ao enviar avaliação. Tente novamente.");
              }
            }}
            text="Sim, Enviar Avaliação"
          />
          <DefaultButton
            onClick={() => setShowSendConfirmation(false)}
            text="Cancelar"
          />
        </DialogFooter>
      </Dialog>
    </>
  );
};

export default ModernFormViewer;
