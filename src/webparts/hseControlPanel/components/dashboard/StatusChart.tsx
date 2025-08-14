import * as React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Icon } from "@fluentui/react";
import { IDashboardMetrics } from "../../types/IControlPanelData";
import styles from "./StatusChart.module.scss";

export interface IStatusChartProps {
  data: IDashboardMetrics;
}

interface ITooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
  }>;
}

const StatusChart: React.FC<IStatusChartProps> = ({ data }) => {
  const chartData = [
    {
      name: "Pendentes",
      value: data.pendingReview,
      color: "#F5B800",
      icon: "Clock",
    },
    {
      name: "Aprovados",
      value: data.approved,
      color: "#4A9B7E",
      icon: "CheckCircle",
    },
    {
      name: "Rejeitados",
      value: data.rejected,
      color: "#C8102E",
      icon: "XCircle",
    },
  ];

  // Cores oficiais da Oceaneering
  const COLORS = ["#F5B800", "#4A9B7E", "#C8102E"];

  const CustomTooltip: React.FC<ITooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className={styles.tooltip}>
          <p>{`${data.name}: ${data.value} formulários`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend: React.FC = () => (
    <div className={styles.legend}>
      {chartData.map((entry) => (
        <div key={entry.name} className={styles.legendItem}>
          <div
            className={styles.legendColor}
            style={{ backgroundColor: entry.color }}
          />
          <span>
            {entry.name}: {entry.value}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className={styles.statusChart}>
      <h3>
        <Icon iconName="DonutChart" />
        Distribuição por Status
      </h3>

      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <CustomLegend />

      <div className={styles.chartStats}>
        <div className={`${styles.statItem} ${styles.total}`}>
          <span className={styles.statLabel}>Total Submissões</span>
          <span className={styles.statValue}>{data.totalSubmissions}</span>
        </div>
        <div className={`${styles.statItem} ${styles.avg}`}>
          <span className={styles.statLabel}>Tempo Médio</span>
          <span className={styles.statValue}>{data.averageReviewTime}d</span>
        </div>
      </div>
    </div>
  );
};

export default StatusChart;
