import * as React from "react";
import { IPersonaProps } from "@fluentui/react";
import { IFormListItem } from "../../../../types/IControlPanelData";
import { IHSEFormData } from "../../../../types/IHSEFormData";
import { IFieldRestriction } from "../../../../types/IHSEFormEvaluation";
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
  evaluationResult: "" | "Aprovado" | "Pendente Info." | "Rejeitado";
  setEvaluationResult: React.Dispatch<
    React.SetStateAction<"" | "Aprovado" | "Pendente Info." | "Rejeitado">
  >;
  evaluationComments: string;
  setEvaluationComments: React.Dispatch<React.SetStateAction<string>>;
  hasRestrictions: boolean;
  setHasRestrictions: React.Dispatch<React.SetStateAction<boolean>>;
  fieldRestrictions: IFieldRestriction[];
  setFieldRestrictions: React.Dispatch<
    React.SetStateAction<IFieldRestriction[]>
  >;
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
    "" | "Aprovado" | "Pendente Info." | "Rejeitado"
  >("");
  const [evaluationComments, setEvaluationComments] = React.useState("");
  const [hasRestrictions, setHasRestrictions] = React.useState(false);
  const [fieldRestrictions, setFieldRestrictions] = React.useState<
    IFieldRestriction[]
  >([]);
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
        historicoStatusChange?: Array<{
          status: string;
          dataAlteracao?: string;
          email?: string;
          usuario?: string;
        }>;
      };
      historicoStatusChange?: Array<{
        status: string;
        dataAlteracao?: string;
        email?: string;
        usuario?: string;
      }>;
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
      DataInicio?: string;
      Restricao?: string;
      CamposRestricao?: Array<{
        id: number;
        secao: string;
        campo: string;
        nomeExibicao: string;
        motivo: string;
      }>;
    } | null = null;

    if (metadata?.Avaliacao) {
      const quantidadeAvaliacao =
        (metadata.Avaliacao.QuantidadeAvaliacao as number) || 0;

      // Buscar a ÚLTIMA avaliação (mais recente) ao invés da primeira
      let ultimaAvaliacaoKey = "0";
      if (quantidadeAvaliacao > 0) {
        ultimaAvaliacaoKey = (quantidadeAvaliacao - 1).toString();
      }

      console.log(
        `🔍 [useEvaluation] Buscando avaliação mais recente - Chave: ${ultimaAvaliacaoKey}, Total: ${quantidadeAvaliacao}`
      );

      avaliacaoData = metadata.Avaliacao[ultimaAvaliacaoKey] as {
        HSEResponsavel?: string;
        Comentarios?: string;
        Resultado?: string;
        DataInicio?: string;
        Restricao?: string;
        CamposRestricao?: Array<{
          id: number;
          secao: string;
          campo: string;
          nomeExibicao: string;
          motivo: string;
        }>;
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
        if (historicoStatusChange && Array.isArray(historicoStatusChange)) {
          // Buscar a entrada mais recente de "Em Análise"
          const entradasEmAnalise = historicoStatusChange
            .filter((entry) => entry.status === "Em Análise")
            .map((entry) => ({
              entry,
              dataAlteracao: new Date(entry.dataAlteracao || ""),
            }))
            .sort(
              (a, b) => b.dataAlteracao.getTime() - a.dataAlteracao.getTime()
            );

          if (entradasEmAnalise.length > 0) {
            responsavelPersona.secondaryText =
              entradasEmAnalise[0].entry.email || "";
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

      // Restaurar restrições
      if (avaliacaoData.Restricao) {
        setHasRestrictions(avaliacaoData.Restricao === "Sim");
        console.log(
          "🚫 [useEvaluation] Flag de restrições restaurada:",
          avaliacaoData.Restricao
        );
      }

      if (
        avaliacaoData.CamposRestricao &&
        Array.isArray(avaliacaoData.CamposRestricao)
      ) {
        setFieldRestrictions(avaliacaoData.CamposRestricao);
        console.log(
          "📝 [useEvaluation] Campos com restrições restaurados:",
          avaliacaoData.CamposRestricao
        );
      }

      // Restaurar data de início da Avaliacao
      if (avaliacaoData.DataInicio) {
        const dataFormatada = new Date(avaliacaoData.DataInicio).toLocaleString(
          "pt-BR"
        );
        setStartDate(dataFormatada);
        console.log(
          "📅 [useEvaluation] Data de início restaurada da Avaliacao:",
          dataFormatada
        );
        setEvaluationStarted(true);
      }
    }

    // Caso não tenha encontrado dados em metadata.Avaliacao, tentar buscar do histórico
    if (
      !avaliacaoData &&
      historicoStatusChange &&
      Array.isArray(historicoStatusChange)
    ) {
      // Buscar a entrada mais recente de "Em Análise"
      const entradasEmAnalise = historicoStatusChange
        .filter((entry) => entry.status === "Em Análise")
        .map((entry) => ({
          entry,
          dataAlteracao: new Date(entry.dataAlteracao || ""),
        }))
        .sort((a, b) => b.dataAlteracao.getTime() - a.dataAlteracao.getTime());

      if (entradasEmAnalise.length > 0 && entradasEmAnalise[0].entry.usuario) {
        const ultimaEntrada = entradasEmAnalise[0].entry;
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

    // Verificar se a avaliação já foi iniciada baseado no status atual
    // IMPORTANTE: Resetar evaluationStarted se status for "Enviado" para permitir múltiplas avaliações
    if (formData.status === "Enviado") {
      setEvaluationStarted(false);
    } else if (
      formData.status === "Em Análise" &&
      !avaliacaoData?.DataInicio && // Só se não encontrou DataInicio na Avaliacao
      historicoStatusChange &&
      Array.isArray(historicoStatusChange)
    ) {
      // Buscar a entrada mais recente de "Em Análise" caso haja múltiplas
      const entradasEmAnalise = historicoStatusChange
        .filter((entry) => entry.status === "Em Análise")
        .map((entry) => ({
          entry,
          dataAlteracao: new Date(entry.dataAlteracao || ""),
        }))
        .sort((a, b) => b.dataAlteracao.getTime() - a.dataAlteracao.getTime()); // Mais recente primeiro

      if (entradasEmAnalise.length > 0) {
        const ultimaEntradaEmAnalise = entradasEmAnalise[0].entry;

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

      // Criar dados da avaliação (o SharePointService vai gerenciar o histórico)
      const statusAtual = "Em Análise";

      // Preparar dados da avaliação
      const evaluationData = {
        status: statusAtual,
        responsavel: {
          name: selectedHSEResponsible.text || "",
          email: selectedHSEResponsible.secondaryText || "",
          id: selectedHSEResponsible.id || "",
        },
        formData: formData as unknown as Record<string, unknown>,
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
        restricao: hasRestrictions ? "Sim" : "Não",
        camposRestricao: hasRestrictions ? fieldRestrictions : [],
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
    hasRestrictions,
    fieldRestrictions,
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
    hasRestrictions,
    setHasRestrictions,
    fieldRestrictions,
    setFieldRestrictions,
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
