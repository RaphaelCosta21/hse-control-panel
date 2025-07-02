import * as React from "react";
import MetricCard from "../ui/MetricCard/MetricCard";
import { IDashboardMetrics } from "../../types/IControlPanelData";
import styles from "./MetricsCards.module.scss";

export interface IMetricsCardsProps {
  metrics: IDashboardMetrics;
}

const MetricsCards: React.FC<IMetricsCardsProps> = ({ metrics }) => {
  // Primeira linha - métricas principais conforme visual preview
  const firstRowCards = [
    {
      title: "TOTAL Submissões",
      value: metrics.totalSubmissions,
      icon: "FileText",
      color: "primary" as const,
      trend: "+12% este mês",
    },
    {
      title: "PENDENTES",
      value: metrics.pendingReview,
      icon: "Clock",
      color: "warning" as const,
      trend: "Em análise",
    },
    {
      title: "APROVADOS",
      value: metrics.approved,
      icon: "CheckCircle",
      color: "success" as const,
      trend: "+8% vs mês anterior",
    },
    {
      title: "REJEITADOS",
      value: metrics.rejected || 25,
      icon: "XCircle",
      color: "danger" as const,
      trend: "Requer atenção",
    },
  ];

  // Segunda linha - métricas secundárias conforme visual preview
  const secondRowCards = [
    {
      title: "DIAS MÉDIOS p/ Revisão",
      value: `${metrics.averageReviewTime}`,
      icon: "Timer",
      color: "info" as const,
      trend: "-0.5 dias vs média",
    },
    {
      title: "AGUARDANDO INFO",
      value: 15,
      icon: "Info",
      color: "warning" as const,
      trend: "Pendente resposta",
    },
    {
      title: "EM ANÁLISE",
      value: 8,
      icon: "Processing",
      color: "info" as const,
      trend: "Em progresso",
    },
    {
      title: "+12% ESTE MÊS",
      value: "↗️",
      icon: "TrendingUp",
      color: "success" as const,
      trend: "Crescimento contínuo",
    },
  ];

  return (
    <div className={styles.metricsContainer}>
      <div className={styles.metricsRow}>
        {firstRowCards.map((card, index) => (
          <MetricCard key={`first-${index}`} {...card} />
        ))}
      </div>
      <div className={styles.metricsRow}>
        {secondRowCards.map((card, index) => (
          <MetricCard key={`second-${index}`} {...card} />
        ))}
      </div>
    </div>
  );
};

export default MetricsCards;
