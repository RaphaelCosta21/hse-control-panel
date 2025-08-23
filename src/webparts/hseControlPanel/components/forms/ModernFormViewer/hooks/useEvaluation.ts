import * as React from "react";
import { IPersonaProps } from "@fluentui/react";
import { IFormListItem } from "../../../../types/IControlPanelData";
import { IHSEFormData } from "../../../../types/IHSEFormData";
import { SharePointService } from "../../../../services/SharePointService";

export interface IEvaluationHookProps {
  form: IFormListItem | undefined;
  formData: IHSEFormData | undefined;
  sharePointService: SharePointService;
  onFormUpdate?: (updatedForm: IFormListItem) => void;
  reloadFormData?: () => Promise<void>;
}

export const useEvaluation = ({
  form,
  formData,
  sharePointService,
  onFormUpdate,
  reloadFormData,
}: IEvaluationHookProps): {
  showEvaluationDetails: boolean;
  setShowEvaluationDetails: React.Dispatch<React.SetStateAction<boolean>>;
  selectedHSEResponsible: IPersonaProps | undefined;
  setSelectedHSEResponsible: React.Dispatch<
    React.SetStateAction<IPersonaProps | undefined>
  >;
  evaluationStarted: boolean;
  setEvaluationStarted: React.Dispatch<React.SetStateAction<boolean>>;
  evaluationResult: "Aprovado" | "Pendente Info." | "Rejeitado";
  setEvaluationResult: React.Dispatch<
    React.SetStateAction<"Aprovado" | "Pendente Info." | "Rejeitado">
  >;
  evaluationComments: string;
  setEvaluationComments: React.Dispatch<React.SetStateAction<string>>;
  startDate: string;
  setStartDate: React.Dispatch<React.SetStateAction<string>>;
  showStartConfirmation: boolean;
  setShowStartConfirmation: React.Dispatch<React.SetStateAction<boolean>>;
  showSendConfirmation: boolean;
  setShowSendConfirmation: React.Dispatch<React.SetStateAction<boolean>>;
  submittingReview: boolean;
  setSubmittingReview: React.Dispatch<React.SetStateAction<boolean>>;
  handleStartEvaluation: () => Promise<void>;
  handleSendEvaluation: () => Promise<void>;
} => {
  const [showEvaluationDetails, setShowEvaluationDetails] =
    React.useState(false);
  const [selectedHSEResponsible, setSelectedHSEResponsible] = React.useState<
    IPersonaProps | undefined
  >(undefined);
  const [evaluationStarted, setEvaluationStarted] = React.useState(false);
  const [evaluationResult, setEvaluationResult] = React.useState<
    "Aprovado" | "Pendente Info." | "Rejeitado"
  >("Aprovado");
  const [evaluationComments, setEvaluationComments] = React.useState("");
  const [startDate, setStartDate] = React.useState<string>("");
  const [showStartConfirmation, setShowStartConfirmation] =
    React.useState(false);
  const [showSendConfirmation, setShowSendConfirmation] = React.useState(false);
  const [submittingReview, setSubmittingReview] = React.useState(false);

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

      // Chamar callback de atualização se fornecido
      if (onFormUpdate) {
        const updatedForm: IFormListItem = {
          ...form,
          status: "Em Análise",
        };
        onFormUpdate(updatedForm);
      }

      // Recarregar dados do formulário para refletir as mudanças
      if (reloadFormData) {
        await reloadFormData();
      }

      // Fechar diálogos de confirmação
      setShowStartConfirmation(false);

      console.log("✅ Avaliação iniciada com sucesso");
    } catch (error) {
      console.error("Erro ao iniciar avaliação:", error);
      throw new Error("Erro ao iniciar avaliação. Tente novamente.");
    } finally {
      setSubmittingReview(false);
    }
  }, [
    form,
    selectedHSEResponsible,
    formData,
    sharePointService,
    onFormUpdate,
    reloadFormData,
    setShowStartConfirmation,
  ]);

  const handleSendEvaluation = React.useCallback(async () => {
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

      // Recarregar dados do formulário para refletir as mudanças
      if (reloadFormData) {
        await reloadFormData();
      }

      // Fechar diálogos
      setShowSendConfirmation(false);
      setShowEvaluationDetails(false);

      // Notificar sucesso
      alert("Avaliação enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
      alert("Erro ao enviar avaliação. Tente novamente.");
    }
  }, [
    form,
    selectedHSEResponsible,
    evaluationResult,
    evaluationComments,
    sharePointService,
    onFormUpdate,
    reloadFormData,
    setShowSendConfirmation,
    setShowEvaluationDetails,
  ]);

  return {
    // States
    showEvaluationDetails,
    setShowEvaluationDetails,
    selectedHSEResponsible,
    setSelectedHSEResponsible,
    evaluationStarted,
    setEvaluationStarted,
    evaluationResult,
    setEvaluationResult,
    evaluationComments,
    setEvaluationComments,
    startDate,
    setStartDate,
    showStartConfirmation,
    setShowStartConfirmation,
    showSendConfirmation,
    setShowSendConfirmation,
    submittingReview,
    setSubmittingReview,

    // Handlers
    handleStartEvaluation,
    handleSendEvaluation,
  };
};
