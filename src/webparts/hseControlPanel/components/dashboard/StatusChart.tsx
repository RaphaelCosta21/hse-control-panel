import * as React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { IDashboardMetrics } from "../../types/IControlPanelData";
import styles from "./StatusChart.module.scss";

export interface IStatusChartProps {
  data: IDashboardMetrics;
}

const StatusChart: React.FC<IStatusChartProps> = ({ data }) => {
  const chartData = [
    {
      name: "Pendentes",
      value: data.pendingReview,
      color: "#ff8c00",
    },
    {
      name: "Aprovados",
      value: data.approved,
      color: "#107c10",
    },
    {
      name: "Rejeitados",
      value: data.rejected,
      color: "#d13438",
    },
  ];

  const COLORS = ["#ff8c00", "#107c10", "#d13438"];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className={styles.tooltip}>
          <p>{`${data.name}: ${data.value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.statusChart}>
      <h3>Distribuição por Status</h3>

      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
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
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartStats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Total:</span>
          <span className={styles.statValue}>{data.totalSubmissions}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Tempo médio:</span>
          <span className={styles.statValue}>
            {data.averageReviewTime} dias
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatusChart;
