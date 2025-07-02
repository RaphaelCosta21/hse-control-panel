import { useState, useEffect, useCallback, useMemo } from "react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { HSEFormService } from "../services/HSEFormService";
import { IDashboardMetrics } from "../types/IControlPanelData";
import { ISharePointConfig } from "../types/ISharePointConfig";

interface IDashboardDataReturn {
  metrics?: IDashboardMetrics;
  loading: boolean;
  error?: string;
  refreshData: () => Promise<void>;
}

export const useDashboardData = (
  context: WebPartContext,
  config: ISharePointConfig
): IDashboardDataReturn => {
  const [metrics, setMetrics] = useState<IDashboardMetrics>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const hseFormService = useMemo(
    () => new HSEFormService(context, config),
    [context, config]
  );

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);

      const metricsData = await hseFormService.getDashboardMetrics();
      setMetrics(metricsData);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados do dashboard");
    } finally {
      setLoading(false);
    }
  }, [hseFormService]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    metrics,
    loading,
    error,
    refreshData: loadDashboardData,
  };
};
