import * as React from "react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { MessageBar, MessageBarType } from "@fluentui/react";
import MetricsCards from "./MetricsCards";
import ActivityFeed from "./ActivityFeed";
import StatusChart from "./StatusChart";
import QuickActions from "./QuickActions";
import { InviteModal } from "../invites";
import { ISharePointConfig } from "../../types/ISharePointConfig";
import { IDashboardMetrics } from "../../types/IControlPanelData";
import styles from "./Dashboard.module.scss";

export interface IDashboardProps {
  context: WebPartContext;
  serviceConfig: ISharePointConfig;
  onNavigateToSettings?: () => void;
}

const Dashboard: React.FC<IDashboardProps> = ({
  context,
  serviceConfig,
  onNavigateToSettings,
}) => {
  const [metrics, setMetrics] = React.useState<IDashboardMetrics | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = React.useState<boolean>(false);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for now - conforme visual preview
      const mockData: IDashboardMetrics = {
        totalSubmissions: 142,
        pendingReview: 28,
        approved: 89,
        rejected: 25,
        averageReviewTime: 2.3,
        recentActivity: [
          {
            id: 1,
            type: "Evaluation",
            description: "🔄 Petrobras - Em análise (2h)",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            user: "Sistema",
          },
          {
            id: 2,
            type: "Approval",
            description: "✅ Vale S.A. - Aprovado (4h)",
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            user: "Avaliador HSE",
          },
          {
            id: 3,
            type: "Rejection",
            description: "❌ Empresa X - Rejeitado (1d)",
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            user: "Avaliador HSE",
          },
          {
            id: 4,
            type: "Submission",
            description: "⏳ Sabesp - Pendente info (2d)",
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            user: "Sistema",
          },
          {
            id: 5,
            type: "Submission",
            description: "📨 3 emails enviados hoje",
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
            user: "Sistema",
          },
        ],
      };

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMetrics(mockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [context, serviceConfig]);

  React.useEffect(() => {
    loadData().catch(console.error);
  }, [loadData]);

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingContainer}>
          <div>Carregando métricas do dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <MessageBar messageBarType={MessageBarType.error}>
          Erro ao carregar dados do dashboard: {error}
        </MessageBar>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h2>Dashboard HSE Control Panel</h2>
        <button onClick={loadData} className={styles.refreshButton}>
          🔄 Atualizar
        </button>
      </div>

      {metrics && (
        <>
          <MetricsCards metrics={metrics} />

          <div className={styles.dashboardGrid}>
            <div className={styles.chartSection}>
              <StatusChart data={metrics} />
            </div>

            <div className={styles.sidebarSection}>
              <div className={styles.activitySection}>
                <ActivityFeed activities={metrics.recentActivity} />
              </div>

              <div className={styles.quickActionsSection}>
                <QuickActions
                  onNewInvite={() => setShowInviteModal(true)}
                  onMonthlyReport={() => console.log("Relatório mensal")}
                  onExportData={() => console.log("Exportar dados")}
                  onSettings={
                    onNavigateToSettings || (() => console.log("Configurações"))
                  }
                  onEmailCenter={() => console.log("Centro de emails")}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal de Convites */}
      <InviteModal
        isOpen={showInviteModal}
        onDismiss={() => setShowInviteModal(false)}
        onInviteSent={() => {
          console.log("Convite enviado com sucesso!");
          // Aqui você pode adicionar lógica para atualizar métricas se necessário
        }}
        context={context}
      />
    </div>
  );
};

export default Dashboard;
