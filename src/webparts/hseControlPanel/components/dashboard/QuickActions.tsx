import * as React from "react";
import { DefaultButton, PrimaryButton } from "@fluentui/react";
import styles from "./QuickActions.module.scss";

export interface IQuickActionsProps {
  onNewInvite?: () => void;
  onMonthlyReport?: () => void;
  onExportData?: () => void;
  onSettings?: () => void;
  onEmailCenter?: () => void;
}

const QuickActions: React.FC<IQuickActionsProps> = ({
  onNewInvite,
  onMonthlyReport,
  onExportData,
  onSettings,
  onEmailCenter,
}) => {
  const actions = [
    {
      title: "Novo Convite",
      icon: "Add",
      onClick: onNewInvite,
      type: "primary" as const,
      description: "Convidar nova empresa",
    },
    {
      title: "Relatório Mensal",
      icon: "BarChart4",
      onClick: onMonthlyReport,
      type: "default" as const,
      description: "Gerar relatório do mês",
    },
    {
      title: "Exportar Dados",
      icon: "Download",
      onClick: onExportData,
      type: "default" as const,
      description: "Baixar dados em Excel",
    },
    {
      title: "Configurações",
      icon: "Settings",
      onClick: onSettings,
      type: "default" as const,
      description: "Ajustar configurações",
    },
    {
      title: "Centro de Emails",
      icon: "Mail",
      onClick: onEmailCenter,
      type: "default" as const,
      description: "Gerenciar comunicações",
    },
  ];

  return (
    <div className={styles.quickActions}>
      <div className={styles.header}>
        <h3>📋 Ações Rápidas</h3>
      </div>

      <div className={styles.actionsGrid}>
        {actions.map((action, index) => (
          <div key={index} className={styles.actionItem}>
            {action.type === "primary" ? (
              <PrimaryButton
                iconProps={{ iconName: action.icon }}
                onClick={action.onClick}
                className={styles.actionButton}
                title={action.description}
              >
                {action.title}
              </PrimaryButton>
            ) : (
              <DefaultButton
                iconProps={{ iconName: action.icon }}
                onClick={action.onClick}
                className={styles.actionButton}
                title={action.description}
              >
                {action.title}
              </DefaultButton>
            )}
            <span className={styles.actionDescription}>
              {action.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
