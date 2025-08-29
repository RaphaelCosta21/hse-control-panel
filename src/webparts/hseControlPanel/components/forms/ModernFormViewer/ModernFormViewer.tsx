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
import { FlowTimeline } from "./components/FlowTimeline";
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
  // Estado para gerenciar a página principal
  const [selectedMainPage, setSelectedMainPage] = React.useState<string>(
    "avaliacao-documentos"
  );

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

    // Removido o botão "Ver Avaliação" pois a seção estará sempre visível
    return [];
  }, [
    formData,
    isReviewing,
    currentUser,
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

        {/* Navegação principal entre páginas */}
        <div
          style={{
            background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
            borderRadius: "8px 8px 0 0",
            marginTop: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            border: "1px solid #dee2e6",
            borderBottom: "none",
          }}
        >
          <Pivot
            selectedKey={selectedMainPage}
            onLinkClick={(item) =>
              setSelectedMainPage(item?.props.itemKey || "avaliacao-documentos")
            }
            className={styles.pivot}
            style={{
              background: "transparent",
              borderBottom: "none",
            }}
            linkSize="large"
            linkFormat="tabs"
          >
            <PivotItem
              headerText="📋 Dados do Formulário"
              itemKey="avaliacao-documentos"
              style={{ color: "#495057", fontWeight: "600", fontSize: "16px" }}
            >
              <div
                style={{
                  backgroundColor: "#ffffff",
                  padding: "0",
                  borderRadius: "0 0 8px 8px",
                  minHeight: "500px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  border: "1px solid #dee2e6",
                  borderTop: "3px solid rgb(3, 120, 124)",
                }}
              >
                {/* Cabeçalho da seção */}
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
                    padding: "20px 24px",
                    borderBottom: "1px solid #e9ecef",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      background: "linear-gradient(135deg, #17a2b8, #138496)",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "18px",
                      boxShadow: "0 2px 4px rgba(23, 162, 184, 0.3)",
                    }}
                  >
                    📋
                  </div>
                  <div>
                    <h3
                      style={{
                        margin: "0",
                        fontSize: "20px",
                        fontWeight: "600",
                        color: "#2c3e50",
                      }}
                    >
                      Dados do Formulário HSE
                    </h3>
                    <p
                      style={{
                        margin: "4px 0 0 0",
                        fontSize: "14px",
                        color: "#6c757d",
                      }}
                    >
                      Informações detalhadas sobre dados gerais, conformidade
                      legal e serviços especiais
                    </p>
                  </div>
                </div>

                {/* Sub-abas com design diferenciado */}
                <div style={{ padding: "0 24px" }}>
                  <Pivot
                    selectedKey={selectedTab}
                    onLinkClick={(item) =>
                      setSelectedTab(item?.props.itemKey || "dadosGerais")
                    }
                    className={styles.pivot}
                    style={{
                      marginTop: "0",
                      borderBottom: "1px solid #e9ecef",
                    }}
                    linkSize="normal"
                    linkFormat="links"
                  >
                    <PivotItem
                      headerText="📊 Dados Gerais"
                      itemKey="dadosGerais"
                    >
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
                          empresa={String(
                            formData.dadosGerais?.nomeEmpresa || ""
                          )}
                          id={String(formData.dadosGerais?.id || "")}
                          sharePointService={sharePointService}
                        />
                      </div>
                    </PivotItem>
                  </Pivot>
                </div>
              </div>
            </PivotItem>

            <PivotItem
              headerText="🔄 Fluxo Detalhado"
              itemKey="fluxo-detalhado"
              style={{ color: "#495057", fontWeight: "600", fontSize: "16px" }}
            >
              <div
                style={{
                  backgroundColor: "#ffffff",
                  padding: "0",
                  borderRadius: "0 0 8px 8px",
                  minHeight: "500px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  border: "1px solid #dee2e6",
                  borderTop: "3px solid rgb(3, 120, 124)",
                }}
              >
                {/* Cabeçalho da seção */}
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
                    padding: "20px 24px",
                    borderBottom: "1px solid #e9ecef",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      background: "linear-gradient(135deg, #28a745, #20c997)",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "18px",
                      boxShadow: "0 2px 4px rgba(40, 167, 69, 0.3)",
                    }}
                  >
                    🔄
                  </div>
                  <div>
                    <h3
                      style={{
                        margin: "0",
                        fontSize: "20px",
                        fontWeight: "600",
                        color: "#2c3e50",
                      }}
                    >
                      Timeline do Processo
                    </h3>
                    <p
                      style={{
                        margin: "4px 0 0 0",
                        fontSize: "14px",
                        color: "#6c757d",
                      }}
                    >
                      Acompanhamento detalhado do fluxo de avaliação HSE
                    </p>
                  </div>
                </div>

                {/* Conteúdo do FlowTimeline */}
                {formData && <FlowTimeline formData={formData} />}
              </div>
            </PivotItem>
          </Pivot>
        </div>
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
