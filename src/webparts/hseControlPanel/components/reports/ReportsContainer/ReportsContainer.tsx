import * as React from "react";
import {
  Stack,
  Text,
  Nav,
  INavLinkGroup,
  INavLink,
  CommandBar,
  ICommandBarItemProps,
} from "@fluentui/react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ISharePointConfig } from "../../../types/ISharePointConfig";
import { RevalidationReport } from "../RevalidationReport/RevalidationReport";
import { IReportMenuItem } from "../types/IReportTypes";
import styles from "./ReportsContainer.module.scss";

export interface IReportsContainerProps {
  context: WebPartContext;
  serviceConfig: ISharePointConfig;
}

const ReportsContainer: React.FC<IReportsContainerProps> = ({
  context,
  serviceConfig,
}) => {
  const [selectedReportKey, setSelectedReportKey] =
    React.useState<string>("revalidation");

  // Configuração dos relatórios disponíveis
  const reportMenuItems: IReportMenuItem[] = [
    {
      key: "revalidation",
      text: "Revalidação de Formulários",
      iconName: "Refresh",
      component: RevalidationReport,
    },
    // Futuros relatórios serão adicionados aqui
    // {
    //   key: "compliance",
    //   text: "Análise de Conformidade",
    //   iconName: "ComplianceAudit",
    //   component: ComplianceReport,
    // },
  ];

  const navGroups: INavLinkGroup[] = [
    {
      name: "Relatórios Disponíveis",
      links: reportMenuItems.map((item) => ({
        key: item.key,
        name: item.text,
        iconProps: { iconName: item.iconName },
        url: "",
        onClick: (ev?: React.MouseEvent<HTMLElement>, item?: INavLink) => {
          ev?.preventDefault();
          if (item?.key) {
            setSelectedReportKey(item.key);
          }
        },
      })),
    },
  ];

  const currentReport = reportMenuItems.find(
    (item) => item.key === selectedReportKey
  );
  const CurrentReportComponent = currentReport?.component;

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
  ];

  return (
    <div className={styles.reportsContainer}>
      <div className={styles.header}>
        <Stack
          horizontal
          horizontalAlign="space-between"
          verticalAlign="center"
        >
          <Text variant="xLarge">📈 Relatórios HSE</Text>
          <CommandBar items={commandBarItems} className={styles.commandBar} />
        </Stack>
      </div>

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <Nav
            groups={navGroups}
            selectedKey={selectedReportKey}
            className={styles.nav}
          />
        </div>

        <div className={styles.reportContent}>
          {CurrentReportComponent ? (
            React.createElement(CurrentReportComponent, {
              context,
              serviceConfig,
            })
          ) : (
            <div className={styles.noReport}>
              <Text variant="large">
                Selecione um relatório no menu lateral
              </Text>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsContainer;
