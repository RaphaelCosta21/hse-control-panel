import * as React from "react";
import { DefaultButton, PrimaryButton, Icon } from "@fluentui/react";
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
}) => {
  const actions = [
    {
      title: "📨 Novo Convite",
      icon: "Add",
      onClick: onNewInvite,
      type: "primary" as const,
      description: "Enviar convite",
    },
    {
      title: "📊 Relatório",
      icon: "BarChart4",
      onClick: onMonthlyReport,
      type: "accent" as const,
      description: "Gerar relatório",
    },
    {
      title: "📁 Exportar",
      icon: "Download",
      onClick: onExportData,
      type: "success" as const,
      description: "Baixar Excel",
    },
    {
      title: "⚙️ Config",
      icon: "Settings",
      onClick: onSettings,
      type: "default" as const,
      description: "Configurações",
    },
  ];

  return (
    <div className={styles.quickActions}>
      <div className={styles.header}>
        <h3>
          <Icon iconName="Lightning" />
          Ações Rápidas
        </h3>
      </div>

      <div className={styles.actionsGrid}>
        {actions.map((action, index) => {
          const buttonProps = {
            iconProps: { iconName: action.icon },
            onClick: action.onClick,
            className: `${styles.actionButton} ${
              action.type === "accent"
                ? styles.accent
                : action.type === "success"
                ? styles.success
                : ""
            }`,
            title: action.description,
          };

          return (
            <div key={index} className={styles.actionItem}>
              {action.type === "primary" ? (
                <PrimaryButton {...buttonProps}>{action.title}</PrimaryButton>
              ) : (
                <DefaultButton {...buttonProps}>{action.title}</DefaultButton>
              )}
              <span className={styles.actionDescription}>
                {action.description}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
