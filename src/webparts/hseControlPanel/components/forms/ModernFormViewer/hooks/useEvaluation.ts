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

  // useEffect para resgatar dados de avaliação salvos no SharePoint
  React.useEffect(() => {
    if (!formData) return;

    console.log("🔍 [useEvaluation] Verificando dados salvos:", formData);

    // Verificar se há dados de avaliação salvos - formData pode ter uma estrutura aninhada
    const formDataWithMetadata = formData as unknown as {
      metadata?: {
        Avaliacao?: Record<string, unknown>;
        historicoStatusChange?: Record<
          string,
          { dataAlteracao?: string; email?: string; usuario?: string }
        >;
      };
      historicoStatusChange?: Record<
        string,
        { dataAlteracao?: string; email?: string; usuario?: string }
      >;
    };

    const metadata = formDataWithMetadata?.metadata;
    const historicoStatusChange =
      formDataWithMetadata?.historicoStatusChange ||
      metadata?.historicoStatusChange;

    console.log("📊 [useEvaluation] Metadata encontrada:", metadata);
    console.log(
      "📅 [useEvaluation] Histórico de status:",
      historicoStatusChange
    );

    // Tentar buscar dados de avaliação em diferentes estruturas possíveis
    let avaliacaoData: {
      HSEResponsavel?: string;
      Comentarios?: string;
      Resultado?: string;
    } | null = null;

    if (metadata?.Avaliacao) {
      const firstEvaluationKey = Object.keys(metadata.Avaliacao)[0];
      avaliacaoData = (metadata.Avaliacao[firstEvaluationKey] ||
        metadata.Avaliacao["0"]) as {
        HSEResponsavel?: string;
        Comentarios?: string;
        Resultado?: string;
      };
    }

    if (avaliacaoData) {
      console.log(
        "📋 [useEvaluation] Dados de avaliação encontrados:",
        avaliacaoData
      );

      // Restaurar responsável HSE
      if (avaliacaoData.HSEResponsavel) {
        const responsavelPersona: IPersonaProps = {
          text: avaliacaoData.HSEResponsavel,
          secondaryText: "", // Email pode estar no histórico
          id: avaliacaoData.HSEResponsavel,
        };

        // Tentar buscar email do histórico de status
        if (historicoStatusChange) {
          // Buscar a entrada mais recente de "Em Análise"
          const entradasEmAnalise = Object.keys(historicoStatusChange)
            .filter((key) => key.includes("Em Análise"))
            .map((key) => ({
              key,
              data: historicoStatusChange[key],
              dataAlteracao: new Date(
                historicoStatusChange[key].dataAlteracao || ""
              ),
            }))
            .sort(
              (a, b) => b.dataAlteracao.getTime() - a.dataAlteracao.getTime()
            );

          if (entradasEmAnalise.length > 0) {
            responsavelPersona.secondaryText =
              entradasEmAnalise[0].data.email || "";
          }
        }

        setSelectedHSEResponsible(responsavelPersona);
        console.log(
          "👤 [useEvaluation] Responsável HSE restaurado:",
          responsavelPersona
        );
      }

      // Restaurar comentários
      if (avaliacaoData.Comentarios) {
        setEvaluationComments(avaliacaoData.Comentarios);
        console.log(
          "💬 [useEvaluation] Comentários restaurados:",
          avaliacaoData.Comentarios
        );
      }

      // Restaurar resultado
      if (avaliacaoData.Resultado) {
        const resultado = avaliacaoData.Resultado as
          | "Aprovado"
          | "Pendente Info."
          | "Rejeitado";
        setEvaluationResult(resultado);
        console.log("✅ [useEvaluation] Resultado restaurado:", resultado);
      }
    }

    // Caso não tenha encontrado dados em metadata.Avaliacao, tentar buscar do histórico
    if (!avaliacaoData && historicoStatusChange) {
      // Buscar a entrada mais recente de "Em Análise"
      const entradasEmAnalise = Object.keys(historicoStatusChange)
        .filter((key) => key.includes("Em Análise"))
        .map((key) => ({
          key,
          data: historicoStatusChange[key],
          dataAlteracao: new Date(
            historicoStatusChange[key].dataAlteracao || ""
          ),
        }))
        .sort((a, b) => b.dataAlteracao.getTime() - a.dataAlteracao.getTime());

      if (entradasEmAnalise.length > 0 && entradasEmAnalise[0].data.usuario) {
        const ultimaEntrada = entradasEmAnalise[0].data;
        const responsavelPersona: IPersonaProps = {
          text: ultimaEntrada.usuario,
          secondaryText: ultimaEntrada.email || "",
          id: ultimaEntrada.usuario,
        };
        setSelectedHSEResponsible(responsavelPersona);
        console.log(
          "👤 [useEvaluation] Responsável HSE restaurado do histórico (fallback):",
          responsavelPersona
        );
      }
    }

    // Verificar se a avaliação já foi iniciada (status Em Análise)
    if (formData.status === "Em Análise" && historicoStatusChange) {
      // Buscar a entrada mais recente de "Em Análise" caso haja múltiplas
      let ultimaEntradaEmAnalise = historicoStatusChange["Em Análise"];

      // Se há múltiplas entradas, buscar todas as chaves que começam com "Em Análise"
      const entradasEmAnalise = Object.keys(historicoStatusChange)
        .filter((key) => key.includes("Em Análise"))
        .map((key) => ({
          key,
          data: historicoStatusChange[key],
          dataAlteracao: new Date(
            historicoStatusChange[key].dataAlteracao || ""
          ),
        }))
        .sort((a, b) => b.dataAlteracao.getTime() - a.dataAlteracao.getTime()); // Mais recente primeiro

      if (entradasEmAnalise.length > 0) {
        ultimaEntradaEmAnalise = entradasEmAnalise[0].data;

        setEvaluationStarted(true);

        // Restaurar responsável HSE se não foi restaurado antes
        if (!selectedHSEResponsible && ultimaEntradaEmAnalise.usuario) {
          const responsavelPersona: IPersonaProps = {
            text: ultimaEntradaEmAnalise.usuario,
            secondaryText: ultimaEntradaEmAnalise.email || "",
            id: ultimaEntradaEmAnalise.usuario,
          };
          setSelectedHSEResponsible(responsavelPersona);
          console.log(
            "👤 [useEvaluation] Responsável HSE restaurado do histórico:",
            responsavelPersona
          );
        }

        // Restaurar data de início
        const dataInicio = ultimaEntradaEmAnalise.dataAlteracao;
        if (dataInicio) {
          const dataFormatada = new Date(dataInicio).toLocaleString("pt-BR");
          setStartDate(dataFormatada);
          console.log(
            "📅 [useEvaluation] Data de início restaurada:",
            dataFormatada
          );
        }
      }
    }
  }, [formData]);

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
            ? "Pendente Info."
            : evaluationResult;
        const updatedForm: IFormListItem = {
          ...form,
          status: mappedStatus as "Aprovado" | "Rejeitado" | "Pendente Info.",
        };
        onFormUpdate(updatedForm);
      }

      // Recarregar dados do formulário para refletir as mudanças
      if (reloadFormData) {
        await reloadFormData();
      }

      // Fechar diálogos
      setShowSendConfirmation(false);

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
  ]);

  return {
    // States
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
