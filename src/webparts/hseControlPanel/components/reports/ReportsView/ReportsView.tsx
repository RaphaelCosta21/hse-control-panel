import * as React from "react";
import {
  CommandBar,
  ICommandBarItemProps,
  Stack,
  Text,
  Separator,
} from "@fluentui/react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ReportCharts } from "../ReportCharts/ReportCharts";
import { ExportOptions } from "../ExportOptions/ExportOptions";
import { ISharePointConfig } from "../../../types/ISharePointConfig";
import { IFormListItem } from "../../../types/IFormListItem";
// import styles from "./ReportsView.module.scss";

export interface IReportsViewProps {
  context: WebPartContext;
  serviceConfig: ISharePointConfig;
}

const ReportsView: React.FC<IReportsViewProps> = ({
  context,
  serviceConfig,
}) => {
  const [data, setData] = React.useState<IFormListItem[]>([]);

  React.useEffect(() => {
    // Load mock data for now
    const mockData: IFormListItem[] = [
      {
        id: 1,
        companyName: "Petrobras",
        cnpj: "33.000.167/0001-01",
        contractNumber: "HSE-2024-001",
        status: "Em Análise",
        submissionDate: "2024-06-10",
        riskLevel: 4,
        completionPercentage: 95,
        responsibleTechnician: "João Silva",
        lastModified: "2024-06-10",
        evaluator: "Admin HSE",
        evaluationDate: "2024-06-11",
        attachmentsCount: 12,
      },
      {
        id: 2,
        companyName: "Vale S.A.",
        cnpj: "33.592.510/0001-01",
        contractNumber: "HSE-2024-002",
        status: "Aprovado",
        submissionDate: "2024-06-08",
        riskLevel: 3,
        completionPercentage: 100,
        responsibleTechnician: "Maria Santos",
        lastModified: "2024-06-09",
        evaluator: "Admin HSE",
        evaluationDate: "2024-06-09",
        attachmentsCount: 8,
      },
    ];
    setData(mockData);
  }, []);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: "refresh",
      text: "Atualizar Dados",
      iconProps: { iconName: "Refresh" },
      onClick: () => console.log("Atualizando dados..."),
    },
    {
      key: "export",
      text: "Exportar Relatório",
      iconProps: { iconName: "Download" },
      onClick: () => console.log("Exportar relatório"),
    },
    {
      key: "schedule",
      text: "Agendar Envio",
      iconProps: { iconName: "Calendar" },
      onClick: () => console.log("Agendar relatório"),
    },
  ];

  return (
    <div>
      <div>
        <Stack
          horizontal
          horizontalAlign="space-between"
          verticalAlign="center"
        >
          <Text variant="xLarge">📈 Relatórios HSE</Text>
          <CommandBar items={commandBarItems} />
        </Stack>
      </div>

      <div>
        <div>
          <ReportCharts data={data} />
        </div>

        <Separator />

        <div>
          <ExportOptions data={data} title="Relatório HSE" />
        </div>
      </div>

      <Separator />

      <div>
        <Text variant="large">🚧 Módulo em Desenvolvimento</Text>
        <Text variant="medium">
          Funcionalidades de relatórios detalhados serão implementadas na
          próxima fase
        </Text>
      </div>
    </div>
  );
};

export default ReportsView;
