import * as React from "react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ISharePointConfig } from "../types/ISharePointConfig";
import { IDashboardMetrics } from "../types/IControlPanelData";

export interface IUseDashboardDataResult {
  metrics: IDashboardMetrics | null;
  loading: boolean;
  error: string | null;
  refreshData: () => void;
}

export const useDashboardDataSimple = (
  context: WebPartContext,
  serviceConfig: ISharePointConfig
): IUseDashboardDataResult => {
  const [metrics, setMetrics] = React.useState<IDashboardMetrics | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, provide mock data until we can connect the services
      const mockData: IDashboardMetrics = {
        totalSubmissions: 45,
        pendingReview: 12,
        approved: 28,
        rejected: 5,
        averageReviewTime: 5.2,
        recentActivity: [
          {
            id: 1,
            type: "Submission",
            description: "Novo formulário HSE submetido por Empresa ABC",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            user: "Empresa ABC",
          },
          {
            id: 2,
            type: "Approval",
            description: "Formulário da Empresa XYZ foi aprovado",
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            user: "Avaliador HSE",
          },
          {
            id: 3,
            type: "Evaluation",
            description: "Avaliação pendente para Empresa DEF",
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
            user: "Sistema",
          },
        ],
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMetrics(mockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [context, serviceConfig]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshData = React.useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    metrics,
    loading,
    error,
    refreshData,
  };
};
