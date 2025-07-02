import * as React from "react";
import {
  Stack,
  Text,
  Dropdown,
  PrimaryButton,
  DefaultButton,
} from "@fluentui/react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { IFormListItem } from "../../../types/IFormListItem";
import styles from "./ReportCharts.module.scss";

export interface IReportChartsProps {
  data: IFormListItem[];
  className?: string;
}

type ChartType = "status" | "risk" | "timeline" | "completion";

export const ReportCharts: React.FC<IReportChartsProps> = ({
  data,
  className = "",
}) => {
  const [chartType, setChartType] = React.useState<ChartType>("status");

  const chartOptions = [
    { key: "status", text: "📊 Distribuição por Status" },
    { key: "risk", text: "⚠️ Distribuição por Risco" },
    { key: "timeline", text: "📈 Linha do Tempo" },
    { key: "completion", text: "✅ Taxa de Conclusão" },
  ];

  const getStatusData = () => {
    const statusCount = data.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const result = [];
    for (const status in statusCount) {
      if (statusCount.hasOwnProperty(status)) {
        const count = statusCount[status];
        result.push({
          name: status,
          value: count,
          percentage: ((count / data.length) * 100).toFixed(1),
        });
      }
    }
    return result;
  };

  const getRiskData = () => {
    const riskCount = data.reduce((acc, item) => {
      const risk = `Nível ${item.riskLevel}`;
      acc[risk] = (acc[risk] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const result = [];
    for (const risk in riskCount) {
      if (riskCount.hasOwnProperty(risk)) {
        const count = riskCount[risk];
        result.push({
          name: risk,
          value: count,
          percentage: ((count / data.length) * 100).toFixed(1),
        });
      }
    }
    return result;
  };

  const getTimelineData = () => {
    // Agrupamento por mês
    const monthlyData = data.reduce((acc, item) => {
      const date = new Date(item.submissionDate);
      const month = date.getMonth() + 1;
      const monthStr = month < 10 ? `0${month}` : `${month}`;
      const monthKey = `${date.getFullYear()}-${monthStr}`;
      acc[monthKey] = (acc[monthKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const result = [];
    for (const month in monthlyData) {
      if (monthlyData.hasOwnProperty(month)) {
        result.push({
          month: month,
          submissoes: monthlyData[month],
        });
      }
    }

    return result.sort((a, b) => a.month.localeCompare(b.month));
  };

  const getCompletionData = () => {
    const ranges = [
      { range: "0-25%", min: 0, max: 25 },
      { range: "26-50%", min: 26, max: 50 },
      { range: "51-75%", min: 51, max: 75 },
      { range: "76-100%", min: 76, max: 100 },
    ];

    return ranges.map((range) => {
      const count = data.filter(
        (item) =>
          item.completionPercentage >= range.min &&
          item.completionPercentage <= range.max
      ).length;

      return {
        name: range.range,
        value: count,
        percentage: ((count / data.length) * 100).toFixed(1),
      };
    });
  };

  const renderChart = () => {
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

    switch (chartType) {
      case "status":
        const statusData = getStatusData();
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }: any) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case "risk":
        const riskData = getRiskData();
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );

      case "timeline":
        const timelineData = getTimelineData();
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="submissoes" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        );

      case "completion":
        const completionData = getCompletionData();
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={completionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return <Text>Tipo de gráfico não suportado</Text>;
    }
  };

  const getChartDescription = () => {
    switch (chartType) {
      case "status":
        return "Visualização da distribuição de formulários por status de avaliação.";
      case "risk":
        return "Distribuição de formulários por grau de risco (1-4).";
      case "timeline":
        return "Evolução das submissões ao longo do tempo.";
      case "completion":
        return "Distribuição de formulários por faixa de conclusão.";
      default:
        return "";
    }
  };

  const exportChart = () => {
    // Implementação básica de exportação
    // Em uma implementação completa, seria possível exportar o gráfico como imagem
    console.log("Exportar gráfico:", chartType);
  };

  return (
    <div className={`${styles.reportCharts} ${className}`}>
      <Stack tokens={{ childrenGap: 16 }}>
        <Stack
          horizontal
          horizontalAlign="space-between"
          verticalAlign="center"
        >
          <Text variant="large" block>
            📊 Gráficos e Análises
          </Text>
          <Stack horizontal tokens={{ childrenGap: 8 }}>
            <Dropdown
              options={chartOptions}
              selectedKey={chartType}
              onChange={(_, option) => setChartType(option?.key as ChartType)}
              styles={{ dropdown: { width: 200 } }}
            />
            <DefaultButton
              text="📥 Exportar"
              onClick={exportChart}
              iconProps={{ iconName: "Download" }}
            />
          </Stack>
        </Stack>

        <Text
          variant="medium"
          styles={{ root: { color: "var(--neutral-foreground-2)" } }}
        >
          {getChartDescription()}
        </Text>

        <div className={styles.chartContainer}>
          {data.length > 0 ? (
            renderChart()
          ) : (
            <div className={styles.noData}>
              <Text variant="large">📊</Text>
              <Text variant="medium">
                Nenhum dado disponível para exibir gráficos
              </Text>
            </div>
          )}
        </div>

        <Stack
          horizontal
          horizontalAlign="space-between"
          verticalAlign="center"
        >
          <Text
            variant="small"
            styles={{ root: { color: "var(--neutral-foreground-2)" } }}
          >
            📊 {data.length} registro(s) • Atualizado em tempo real
          </Text>
          <PrimaryButton
            text="🔄 Atualizar"
            onClick={() => window.location.reload()}
            styles={{ root: { minWidth: "auto" } }}
          />
        </Stack>
      </Stack>
    </div>
  );
};
