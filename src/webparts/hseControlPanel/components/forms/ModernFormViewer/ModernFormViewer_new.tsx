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
  Dropdown,                  user={{
                    name: "Não atribuído",
                    email: "",
                    photoUrl: undefined,
                    isActive: true,
                  }}
                  size={PersonaSize.size32}
                />ownOption,
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

  const loadFormData = React.useCallback(async () => {
    if (!form) return;

    try {
      setLoading(true);
      setError(undefined);

      // Simular carregamento de dados (implementar com SharePoint)
      const mockFormData: IHSEFormData = {
        id: form.id,
        grauRisco: (form.grauRisco || "2") as "1" | "2" | "3" | "4",
        percentualConclusao: 85,
        status: form.status,
        dadosGerais: {
          empresa: form.empresa,
          cnpj: form.cnpj,
          numeroContrato: "CTR-2024-001",
          dataInicioContrato: new Date("2024-01-15"),
          dataTerminoContrato: new Date("2024-12-31"),
          responsavelTecnico: "João Silva Santos",
          atividadePrincipalCNAE: "4950-7/00",
          grauRisco: (form.grauRisco || "2") as "1" | "2" | "3" | "4",
          gerenteContratoMarine: "Carlos Eduardo Oliveira",
          escopoServico:
            "Serviços de manutenção preventiva e corretiva em equipamentos marítimos",
          totalEmpregados: 45,
          empregadosParaServico: 12,
          possuiSESMT: true,
          numeroComponentesSESMT: 3,
        },
        conformidadeLegal: {
          nr01: { aplicavel: true, questoes: {}, comentarios: "" },
          nr04: { aplicavel: true, questoes: {}, comentarios: "" },
          nr05: { aplicavel: true, questoes: {}, comentarios: "" },
          nr06: { aplicavel: true, questoes: {}, comentarios: "" },
          nr07: { aplicavel: true, questoes: {}, comentarios: "" },
          nr09: { aplicavel: true, questoes: {}, comentarios: "" },
          nr10: { aplicavel: true, questoes: {}, comentarios: "" },
          nr11: { aplicavel: true, questoes: {}, comentarios: "" },
          nr12: { aplicavel: true, questoes: {}, comentarios: "" },
          nr13: { aplicavel: true, questoes: {}, comentarios: "" },
          nr15: { aplicavel: true, questoes: {}, comentarios: "" },
          nr23: { aplicavel: true, questoes: {}, comentarios: "" },
          licencasAmbientais: {
            aplicavel: true,
            questoes: {},
            comentarios: "",
          },
          legislacaoMaritima: {
            aplicavel: true,
            questoes: {},
            comentarios: "",
          },
          treinamentosObrigatorios: {
            aplicavel: true,
            questoes: {},
            comentarios: "",
          },
          gestaoSMS: { aplicavel: true, questoes: {}, comentarios: "" },
        },
        servicosEspeciais: {
          fornecedorEmbarcacoes: false,
          fornecedorIcamentoCarga: true,
        },
        anexos: {
          resumoEstatisticoMensal: "rem_2024.pdf",
        },
      };

      setFormData(mockFormData);
    } catch (err) {
      console.error("Erro ao carregar dados do formulário:", err);
      setError("Erro ao carregar os dados do formulário. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [form]);

  // Load form data when form changes
  React.useEffect(() => {
    if (form && isOpen) {
      void loadFormData();
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
                  hidePersonaDetails={false}
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
              isReviewing={isReviewing}
            />
          </div>
        </PivotItem>
      </Pivot>
    );
  };

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
