import * as React from "react";
import {
  Panel,
  PanelType,
  Stack,
  Text,
  MessageBar,
  MessageBarType,
  CommandBar,
  ICommandBarItemProps,
  Spinner,
  SpinnerSize,
} from "@fluentui/react";
import HSEFormViewer from "../HSEFormViewer/HSEFormViewer";
import { FormEvaluation } from "../FormEvaluation/FormEvaluation";
import { IFormListItem } from "../../../types/IControlPanelData";
import {
  IHSEFormData,
  IConformidadeLegal,
  IServicosEspeciais,
} from "../../../types/IHSEFormData";
import { IHSEFormEvaluation } from "../../../types/IHSEFormEvaluation";
import { SharePointService } from "../../../services/SharePointService";
import styles from "./FormViewerModal.module.scss";

export interface IFormViewerModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  form: IFormListItem | undefined;
  sharePointService: SharePointService;
  onFormUpdate?: (updatedForm: IFormListItem) => void;
}

const FormViewerModal: React.FC<IFormViewerModalProps> = ({
  isOpen,
  onDismiss,
  form,
  sharePointService,
  onFormUpdate,
}) => {
  const [formData, setFormData] = React.useState<IHSEFormData | undefined>(
    undefined
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [showEvaluation, setShowEvaluation] = React.useState(false);
  const [currentForm, setCurrentForm] = React.useState<
    IFormListItem | undefined
  >(form);

  // Função auxiliar para converter dados do SharePoint para a estrutura IHSEFormData
  const convertSharePointDataToFormData = React.useCallback(
    (
      rawData: unknown,
      formDetails: {
        Id: number;
        Title: string;
        CNPJ: string;
        StatusAvaliacao: string;
        GrauRisco: string;
        PercentualConclusao: number;
        EmailPreenchimento: string;
        NomePreenchimento: string;
        AnexosCount: number;
        Modified: string;
        Created: string;
        DadosFormulario: string;
      },
      formItem: IFormListItem
    ): IHSEFormData => {
      console.log("convertSharePointDataToFormData - rawData:", rawData);
      console.log(
        "convertSharePointDataToFormData - formDetails:",
        formDetails
      );
      console.log("convertSharePointDataToFormData - formItem:", formItem);

      // Safe cast para trabalhar com o objeto JSON
      const data = rawData as Record<string, unknown>;
      const getSafeValue = (path: string, fallback: string = ""): string => {
        const parts = path.split(".");
        let current: unknown = data;
        for (const part of parts) {
          if (current && typeof current === "object" && part in current) {
            current = (current as Record<string, unknown>)[part];
          } else {
            return fallback;
          }
        }
        return typeof current === "string" ? current : fallback;
      };

      // (Removido getBooleanValue: não é mais utilizado)

      // Usar todos os campos dinâmicos do JSON de dadosGerais
      const dadosGerais = (data.dadosGerais as Record<string, unknown>) || {};

      // Usar todos os campos dinâmicos do JSON de conformidadeLegal
      const conformidadeLegal =
        (data.conformidadeLegal as Record<string, unknown>) || {};

      // Usar todos os campos dinâmicos do JSON de servicosEspeciais
      const servicosEspeciais =
        (data.servicosEspeciais as Record<string, unknown>) || {};

      // Mapear status
      const statusMap: Record<
        string,
        "Em Andamento" | "Enviado" | "Em Análise" | "Aprovado" | "Rejeitado"
      > = {
        "Pendente Informações": "Em Análise",
        "Em Andamento": "Em Andamento",
        Enviado: "Enviado",
        "Em Análise": "Em Análise",
        Aprovado: "Aprovado",
        Rejeitado: "Rejeitado",
      };

      const convertedData: IHSEFormData = {
        id: formDetails.Id,
        dadosGerais,
        conformidadeLegal: conformidadeLegal as IConformidadeLegal,
        servicosEspeciais: servicosEspeciais as IServicosEspeciais,
        grauRisco: (getSafeValue("dadosGerais.grauRisco") ||
          formDetails.GrauRisco ||
          "3") as "1" | "2" | "3" | "4",
        percentualConclusao:
          formDetails.PercentualConclusao ||
          Number(getSafeValue("percentualConclusao")) ||
          0,
        status: statusMap[formDetails.StatusAvaliacao] || "Em Andamento",
        dataSubmissao: new Date(formDetails.Created),
        dataUltimaModificacao: new Date(formDetails.Modified),
        observacoes:
          getSafeValue("observacoes") ||
          "Dados convertidos do sistema SharePoint",
        anexos: (data.anexos as IHSEFormData["anexos"]) || {},
      };

      console.log(
        "convertSharePointDataToFormData - convertedData:",
        convertedData
      );
      return convertedData;
    },
    []
  );

  const loadFormData = React.useCallback(async (): Promise<void> => {
    if (!form) return;

    try {
      setLoading(true);
      setError(undefined);

      // Buscar dados completos do SharePoint
      const formDetails = await sharePointService.getFormDetails(form.id);

      console.log("FormViewerModal - formDetails:", formDetails);
      console.log(
        "FormViewerModal - DadosFormulario raw:",
        formDetails.DadosFormulario
      );

      // Tentar fazer parse do JSON armazenado
      if (formDetails.DadosFormulario) {
        try {
          const rawData = JSON.parse(formDetails.DadosFormulario);
          console.log("FormViewerModal - rawData parsed:", rawData);

          // Converter estrutura do JSON para a interface IHSEFormData
          const formData = convertSharePointDataToFormData(
            rawData,
            formDetails,
            form
          );
          console.log("FormViewerModal - formData converted:", formData);
          setFormData(formData);
        } catch (parseError) {
          console.warn("Erro ao fazer parse do DadosFormulario:", parseError);
          setError("Erro ao ler os dados do formulário. O JSON está inválido.");
          setFormData(undefined);
        }
      } else {
        setError("Nenhum dado encontrado no formulário.");
        setFormData(undefined);
      }
    } catch (err) {
      console.error("Erro ao carregar dados do formulário:", err);
      setError("Erro ao carregar dados detalhados do formulário");
      setFormData(undefined);
    } finally {
      setLoading(false);
    }
  }, [form, sharePointService, convertSharePointDataToFormData]);

  // Load detailed form data when form changes
  React.useEffect(() => {
    if (form && isOpen) {
      loadFormData().catch(console.error);
      setCurrentForm(form);
    }
  }, [form, isOpen, loadFormData]);

  const handleStartReview = React.useCallback(async (): Promise<void> => {
    if (!currentForm) return;

    try {
      // Alterar status para "Em Análise"
      await sharePointService.updateFormStatus(currentForm.id, "Em Análise");

      // Atualizar estado local
      const updatedForm = { ...currentForm, status: "Em Análise" as const };
      setCurrentForm(updatedForm);

      // Notificar componente pai
      if (onFormUpdate) {
        onFormUpdate(updatedForm);
      }

      // Abrir painel de avaliação
      setShowEvaluation(true);
    } catch (err) {
      console.error("Erro ao iniciar revisão:", err);
      setError("Erro ao iniciar revisão. Tente novamente.");
    }
  }, [currentForm, sharePointService, onFormUpdate]);

  const handleSaveEvaluation = React.useCallback(
    async (evaluation: IHSEFormEvaluation): Promise<void> => {
      if (!currentForm) return;

      try {
        // TODO: Implement saveFormEvaluation in SharePointService
        // await sharePointService.saveFormEvaluation(evaluation);

        // For now, just update the status
        await sharePointService.updateFormStatus(
          currentForm.id,
          evaluation.status
        );

        // Atualizar estado local
        const updatedForm = { ...currentForm, status: evaluation.status };
        setCurrentForm(updatedForm);

        // Notificar componente pai
        if (onFormUpdate) {
          onFormUpdate(updatedForm);
        }

        setShowEvaluation(false);
      } catch (err) {
        console.error("Erro ao salvar avaliação:", err);
        throw err; // Re-throw para que o FormEvaluation possa lidar
      }
    },
    [currentForm, sharePointService, onFormUpdate]
  );

  const handleExportPDF = React.useCallback(async (): Promise<void> => {
    if (!currentForm) return;

    try {
      // TODO: Implement real PDF export
      console.log("Exportando PDF do formulário:", currentForm);

      // Simular download
      const link = document.createElement("a");
      link.href = "#";
      link.download = `HSE_Formulario_${currentForm.empresa.replace(
        /\s+/g,
        "_"
      )}_${currentForm.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Erro ao exportar PDF:", err);
      setError("Erro ao exportar PDF");
    }
  }, [currentForm]);

  const getCommandBarItems = (): ICommandBarItemProps[] => {
    const items: ICommandBarItemProps[] = [
      {
        key: "export",
        text: "Exportar PDF",
        iconProps: { iconName: "PDF" },
        onClick: () => {
          handleExportPDF().catch(console.error);
        },
      },
    ];

    // Só mostrar "Iniciar Revisão" se não estiver em análise
    if (
      currentForm &&
      currentForm.status !== "Em Análise" &&
      currentForm.status !== "Aprovado" &&
      currentForm.status !== "Rejeitado"
    ) {
      items.unshift({
        key: "startReview",
        text: "Iniciar Revisão",
        iconProps: { iconName: "ReviewSolid" },
        onClick: () => {
          handleStartReview().catch(console.error);
        },
        buttonStyles: {
          root: {
            backgroundColor: "#0078d4",
            color: "white",
          },
          rootHovered: {
            backgroundColor: "#106ebe",
          },
        },
      });
    }

    // Mostrar "Avaliar" se já estiver em análise
    if (currentForm && currentForm.status === "Em Análise") {
      items.unshift({
        key: "evaluate",
        text: "Avaliar",
        iconProps: { iconName: "EditNote" },
        onClick: () => setShowEvaluation(true),
        buttonStyles: {
          root: {
            backgroundColor: "#ca5010",
            color: "white",
          },
          rootHovered: {
            backgroundColor: "#a74109",
          },
        },
      });
    }

    return items;
  };

  if (!form) return null;

  return (
    <>
      <Panel
        isOpen={isOpen}
        onDismiss={onDismiss}
        type={PanelType.extraLarge}
        headerText={`📋 Formulário HSE - ${form.empresa}`}
        className={styles.formViewerModal}
        isBlocking={false}
        isLightDismiss={false}
        layerProps={{ eventBubblingEnabled: false }}
      >
        <div className={styles.modalContent}>
          {error && (
            <MessageBar
              messageBarType={MessageBarType.error}
              onDismiss={() => setError(undefined)}
            >
              {error}
            </MessageBar>
          )}

          <Stack tokens={{ childrenGap: 16 }}>
            {/* Header with form info and actions */}
            <Stack tokens={{ childrenGap: 12 }}>
              <Stack
                horizontal
                horizontalAlign="space-between"
                verticalAlign="center"
              >
                <Stack tokens={{ childrenGap: 4 }}>
                  <Text variant="large" block>
                    🏢 {currentForm?.empresa}
                  </Text>
                  <Text variant="medium" block>
                    CNPJ: {currentForm?.cnpj} | Status:{" "}
                    <strong>{currentForm?.status}</strong> | Criado por:{" "}
                    {currentForm?.criadoPor}
                  </Text>
                </Stack>
              </Stack>

              <CommandBar
                items={getCommandBarItems()}
                className={styles.commandBar}
              />
            </Stack>

            {/* Form content */}
            {loading ? (
              <div className={styles.loadingContainer}>
                <Spinner
                  size={SpinnerSize.large}
                  label="Carregando dados do formulário..."
                />
              </div>
            ) : formData ? (
              <div className={styles.formContent}>
                <HSEFormViewer formData={formData} isReadOnly={true} />
              </div>
            ) : (
              <MessageBar messageBarType={MessageBarType.warning}>
                Não foi possível carregar os dados detalhados do formulário.
              </MessageBar>
            )}
          </Stack>
        </div>
      </Panel>

      {/* Evaluation Panel */}
      {showEvaluation && currentForm && (
        <FormEvaluation
          isOpen={showEvaluation}
          onDismiss={() => setShowEvaluation(false)}
          form={currentForm}
          onSaveEvaluation={handleSaveEvaluation}
        />
      )}
    </>
  );
};

export default FormViewerModal;
