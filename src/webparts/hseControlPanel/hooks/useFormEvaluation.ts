import * as React from "react";
import { IHSEFormEvaluation } from "../types/IHSEFormEvaluation";

export interface IFormEvaluationHookData {
  evaluation: IHSEFormEvaluation | null;
  loading: boolean;
  error: string | null;
  saveEvaluation: (evaluation: IHSEFormEvaluation) => Promise<void>;
  updateFormStatus: (formId: number, status: string) => Promise<void>;
  getEvaluationHistory: (formId: number) => Promise<IHSEFormEvaluation[]>;
}

export const useFormEvaluation = (formId?: number): IFormEvaluationHookData => {
  const [evaluation, setEvaluation] = React.useState<IHSEFormEvaluation | null>(
    null
  );
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const saveEvaluation = React.useCallback(
    async (newEvaluation: IHSEFormEvaluation) => {
      try {
        setLoading(true);
        setError(null);

        // TODO: Implementar salvamento real via SharePoint
        console.log("Salvando avaliação:", newEvaluation);

        // Simular delay de API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setEvaluation(newEvaluation);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao salvar avaliação"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateFormStatus = React.useCallback(
    async (formId: number, status: string) => {
      try {
        setLoading(true);
        setError(null);

        // TODO: Implementar atualização real via SharePoint
        console.log("Atualizando status:", { formId, status });

        // Simular delay de API
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao atualizar status"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getEvaluationHistory = React.useCallback(
    async (formId: number): Promise<IHSEFormEvaluation[]> => {
      try {
        setLoading(true);
        setError(null);

        // TODO: Implementar busca real via SharePoint
        console.log("Buscando histórico para:", formId);

        // Simular delay de API
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock history data
        const mockHistory: IHSEFormEvaluation[] = [
          {
            id: 1,
            formId: formId,
            status: "Em Análise",
            comentarios: "Documentação inicial analisada",
            observacoes: "Aguardando esclarecimentos sobre NR-12",
            avaliador: "Admin HSE",
            dataAvaliacao: new Date("2024-06-10"),
          },
          {
            id: 2,
            formId: formId,
            status: "Pendente Informações",
            comentarios: "Solicitadas informações adicionais",
            observacoes: "Certificação NR-12 pendente",
            avaliador: "Admin HSE",
            dataAvaliacao: new Date("2024-06-11"),
          },
        ];

        return mockHistory;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao buscar histórico"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Load evaluation data when formId changes
  React.useEffect(() => {
    if (formId) {
      // TODO: Load existing evaluation if any
      console.log("Loading evaluation for form:", formId);
    }
  }, [formId]);

  return {
    evaluation,
    loading,
    error,
    saveEvaluation,
    updateFormStatus,
    getEvaluationHistory,
  };
};
