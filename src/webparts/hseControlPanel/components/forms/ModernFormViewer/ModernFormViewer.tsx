import * as React from "react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import {
  Panel,
  PanelType,
  CommandBar,
  ICommandBarItemProps,
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType,
  Pivot,
  PivotItem,
} from "@fluentui/react";
import { IFormListItem } from "../../../types/IControlPanelData";
import { SharePointService } from "../../../services/SharePointService";
import DadosGeraisSection from "./sections/DadosGeraisSection";
import ConformidadeLegalSection from "./sections/ConformidadeLegalSection";
import ServicosEspeciaisSection from "./sections/ServicosEspeciaisSection";
import { FormHeader, EvaluationDetails, ReviewDialogs } from "./components";
import { useEvaluation, useReview, useFormData } from "./hooks";
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

const ModernFormViewer: React.FC<IModernFormViewerProps> = ({
  isOpen,
  onDismiss,
  form,
  sharePointService,
  context,
  onFormUpdate,
  currentUser,
}) => {
  // Hooks para gerenciar dados do formulário
  const {
    formData,
    loading,
    error,
    hseMembersList,
    selectedTab,
    setSelectedTab,
    loadFormData,
  } = useFormData({
    form,
    sharePointService,
    context,
  });

  // Hooks para gerenciar revisão
  const {
    showReviewDialog,
    setShowReviewDialog,
    reviewStatus,
    setReviewStatus,
    reviewComments,
    setReviewComments,
    submittingReview,
    isReviewing,
    setIsReviewing,
    handleStartReview,
    handleConfirmStartReview,
    handleFinishReview,
  } = useReview({
    form,
    currentUser,
    onFormUpdate,
    onDismiss,
  });

  // Hooks para gerenciar avaliação
  const {
    showEvaluationDetails,
    setShowEvaluationDetails,
    selectedHSEResponsible,
    setSelectedHSEResponsible,
    evaluationStarted,
    evaluationResult,
    setEvaluationResult,
    evaluationComments,
    setEvaluationComments,
    startDate,
    showStartConfirmation,
    setShowStartConfirmation,
    showSendConfirmation,
    setShowSendConfirmation,
    handleStartEvaluation,
    handleSendEvaluation,
  } = useEvaluation({
    form,
    formData,
    sharePointService,
    onFormUpdate,
    reloadFormData: loadFormData,
  });

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

    // Mostrar botão "Detalhes Avaliação" para todos os status válidos
    const validStatuses = [
      "Em Andamento",
      "Enviado",
      "Em Análise",
      "Aprovado",
      "Rejeitado",
      "Pendente Informações",
    ];

    if (validStatuses.includes(formData.status) && currentUser) {
      return [
        {
          key: "evaluationDetails",
          text: "Detalhes Avaliação",
          iconProps: { iconName: "ReviewSolid" },
          onClick: () => {
            setShowEvaluationDetails(!showEvaluationDetails);
          },
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
    setShowEvaluationDetails,
    handleStartReview,
    handleFinishReview,
  ]);

  const renderHeader = (): React.ReactElement => {
    if (!formData) {
      return <div />;
    }
    return <FormHeader formData={formData} isReviewing={isReviewing} />;
  };

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
        {/* Componente de Avaliação Detalhada */}
        <EvaluationDetails
          formData={formData}
          showEvaluationDetails={showEvaluationDetails}
          evaluationStarted={evaluationStarted}
          selectedHSEResponsible={selectedHSEResponsible}
          evaluationResult={evaluationResult}
          evaluationComments={evaluationComments}
          startDate={startDate}
          hseMembersList={hseMembersList}
          setSelectedHSEResponsible={setSelectedHSEResponsible}
          setEvaluationResult={setEvaluationResult}
          setEvaluationComments={setEvaluationComments}
          setShowStartConfirmation={setShowStartConfirmation}
          setShowSendConfirmation={setShowSendConfirmation}
        />

        {/* Abas do formulário */}
        <Pivot
          selectedKey={selectedTab}
          onLinkClick={(item) =>
            setSelectedTab(item?.props.itemKey || "dadosGerais")
          }
          className={styles.pivot}
        >
          <PivotItem headerText="📊 Dados Gerais" itemKey="dadosGerais">
            <div className={styles.pivotItem}>
              <DadosGeraisSection
                data={formData.dadosGerais}
                anexos={formData.anexos}
                isReviewing={isReviewing}
                cnpj={formData.dadosGerais?.cnpj || ""}
                empresa={formData.dadosGerais?.empresa || ""}
                sharePointService={sharePointService}
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
                cnpj={formData.dadosGerais?.cnpj || ""}
                empresa={formData.dadosGerais?.empresa || ""}
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

      {/* Componente de Diálogos de Revisão */}
      <ReviewDialogs
        showReviewDialog={showReviewDialog}
        setShowReviewDialog={setShowReviewDialog}
        handleConfirmStartReview={handleConfirmStartReview}
        submittingReview={submittingReview}
        isReviewing={isReviewing}
        setIsReviewing={setIsReviewing}
        reviewStatus={reviewStatus}
        setReviewStatus={setReviewStatus}
        reviewComments={reviewComments}
        setReviewComments={setReviewComments}
        handleFinishReview={handleFinishReview}
        showStartConfirmation={showStartConfirmation}
        setShowStartConfirmation={setShowStartConfirmation}
        selectedHSEResponsible={selectedHSEResponsible}
        handleStartEvaluation={handleStartEvaluation}
        showSendConfirmation={showSendConfirmation}
        setShowSendConfirmation={setShowSendConfirmation}
        evaluationResult={evaluationResult}
        handleSendEvaluation={handleSendEvaluation}
      />
    </>
  );
};

export default ModernFormViewer;
