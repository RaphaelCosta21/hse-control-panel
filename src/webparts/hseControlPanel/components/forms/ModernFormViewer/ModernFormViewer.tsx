import * as React from "react";
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
} from "@fluentui/react";
import { UserCard } from "../../ui";
import { IFormListItem } from "../../../types/IControlPanelData";
import { IHSEFormData } from "../../../types/IHSEFormData";
import { SharePointService } from "../../../services/SharePointService";
import DadosGeraisSection from "./sections/DadosGeraisSection";
import ConformidadeLegalSection from "./sections/ConformidadeLegalSection";
import ServicosEspeciaisSection from "./sections/ServicosEspeciaisSection";
import styles from "./ModernFormViewer.module.scss";

export interface IModernFormViewerProps {
  isOpen: boolean;
  onDismiss: () => void;
  form: IFormListItem | undefined;
  sharePointService: SharePointService;
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

  const handleStartReview = React.useCallback(() => {
    setShowReviewDialog(true);
  }, []);

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
          key: "startReview",
          text: "Iniciar Revisão",
          iconProps: { iconName: "ReviewSolid" },
          onClick: handleStartReview,
          className: styles.primaryAction,
        },
      ];
    }

    return [];
  }, [
    formData,
    isReviewing,
    currentUser,
    handleStartReview,
    handleFinishReview,
  ]);

  const renderHeader = (): React.ReactElement => (
    <div className={styles.header}>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
        <Stack.Item grow>
          <div className={styles.titleSection}>
            <Text variant="xLarge" className={styles.title}>
              📋 Formulário HSE - {formData?.dadosGerais.empresa}
            </Text>
            <Text className={styles.subtitle}>
              CNPJ: {formData?.dadosGerais.cnpj} • Status: {formData?.status}
            </Text>
          </div>
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
            />
          </div>
        </PivotItem>
      </Pivot>
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
        onDismiss={onDismiss}
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
    </>
  );
};

export default ModernFormViewer;
