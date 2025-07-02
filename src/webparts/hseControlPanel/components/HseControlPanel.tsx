import * as React from "react";
import { Pivot, PivotItem, Stack, Icon, Text } from "@fluentui/react";
import styles from "./HseControlPanel.module.scss";
import type { IHseControlPanelProps } from "./IHseControlPanelProps";
import { escape } from "@microsoft/sp-lodash-subset";
import { Dashboard } from "./dashboard";
import { FormsList } from "./forms";
import { SettingsPage } from "./settings";
import { getDefaultSharePointConfig } from "../config/sharePointConfig";

const HseControlPanel: React.FC<IHseControlPanelProps> = ({
  description,
  isDarkTheme,
  environmentMessage,
  hasTeamsContext,
  userDisplayName,
  context,
}) => {
  const [activeTab, setActiveTab] = React.useState("dashboard");

  const serviceConfig = getDefaultSharePointConfig();

  const handleTabChange = (item?: PivotItem): void => {
    if (item) {
      setActiveTab(item.props.itemKey || "dashboard");
    }
  };

  return (
    <section
      className={`${styles.hseControlPanel} ${
        hasTeamsContext ? styles.teams : ""
      }`}
    >
      <div className={styles.header}>
        <Stack
          horizontal
          horizontalAlign="space-between"
          verticalAlign="center"
        >
          <div className={styles.welcome}>
            <Stack
              horizontal
              verticalAlign="center"
              tokens={{ childrenGap: 12 }}
            >
              <img
                alt=""
                src={
                  isDarkTheme
                    ? require("../assets/welcome-dark.png")
                    : require("../assets/welcome-light.png")
                }
                className={styles.welcomeImage}
              />
              <div>
                <Text variant="xLarge" className={styles.title}>
                  🏢 HSE Control Panel
                </Text>
                <Text variant="small" className={styles.subtitle}>
                  Gestão e Avaliação HSE
                </Text>
              </div>
            </Stack>
          </div>

          <div className={styles.userInfo}>
            <Stack
              horizontal
              verticalAlign="center"
              tokens={{ childrenGap: 8 }}
            >
              <Icon iconName="Contact" />
              <Text variant="medium">👤 {escape(userDisplayName)}</Text>
              <Icon iconName="Settings" className={styles.settingsIcon} />
            </Stack>
          </div>
        </Stack>
      </div>

      <div className={styles.navigation}>
        <Pivot
          selectedKey={activeTab}
          onLinkClick={handleTabChange}
          className={styles.pivot}
        >
          <PivotItem
            itemKey="dashboard"
            headerText="📊 Dashboard"
            itemIcon="BarChartHorizontal"
          />
          <PivotItem
            itemKey="forms"
            headerText="📋 Formulários"
            itemIcon="FileTemplate"
          />
          <PivotItem
            itemKey="reports"
            headerText="📈 Relatórios"
            itemIcon="ReportDocument"
          />
          <PivotItem
            itemKey="settings"
            headerText="⚙️ Configurações"
            itemIcon="Settings"
          />
        </Pivot>
      </div>

      <div className={styles.mainContent}>
        {activeTab === "dashboard" && (
          <Dashboard
            context={context}
            serviceConfig={serviceConfig}
            onNavigateToSettings={() => setActiveTab("settings")}
          />
        )}

        {activeTab === "forms" && (
          <FormsList context={context} serviceConfig={serviceConfig} />
        )}

        {activeTab === "reports" && (
          <div className={styles.comingSoon}>
            <Icon iconName="ReportDocument" className={styles.comingSoonIcon} />
            <Text variant="large">📈 Relatórios</Text>
            <Text variant="medium">Em desenvolvimento...</Text>
          </div>
        )}

        {activeTab === "settings" && (
          <SettingsPage
            context={context}
            onBack={() => setActiveTab("dashboard")}
          />
        )}
      </div>

      {description && (
        <div className={styles.footer}>
          <Text variant="small" className={styles.footerText}>
            {environmentMessage} | Configuração: {escape(description)}
          </Text>
        </div>
      )}
    </section>
  );
};

export default HseControlPanel;
