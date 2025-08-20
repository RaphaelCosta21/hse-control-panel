import * as React from "react";
import { Pivot, PivotItem, Stack, Icon, Text } from "@fluentui/react";
import styles from "./HseControlPanel.module.scss";
// Import SharePoint overrides para personalizar a interface
import "../styles/sharepoint-overrides.scss";
import type { IHseControlPanelProps } from "./IHseControlPanelProps";
import { escape } from "@microsoft/sp-lodash-subset";
import { Dashboard } from "./dashboard";
import { FormsList } from "./forms";
import { SettingsNavigation } from "./settings";
import { Footer } from "./common/Footer";
import { getDefaultSharePointConfig } from "../config/sharePointConfig";
import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/profiles";

const HseControlPanel: React.FC<IHseControlPanelProps> = ({
  description,
  isDarkTheme,
  environmentMessage,
  hasTeamsContext,
  userDisplayName,
  context,
}) => {
  const [activeTab, setActiveTab] = React.useState("dashboard");
  const [userPhotoUrl, setUserPhotoUrl] = React.useState<string>("");

  const serviceConfig = getDefaultSharePointConfig();

  // Buscar foto do usuário do SharePoint
  React.useEffect(() => {
    const getUserPhoto = async (): Promise<void> => {
      try {
        if (context?.pageContext?.user?.loginName) {
          // Configurar PnPjs
          const sp = spfi().using(SPFx(context));

          try {
            // Tentar buscar via PnPjs primeiro
            const userPhoto = await sp.profiles.getUserProfilePropertyFor(
              context.pageContext.user.loginName,
              "PictureURL"
            );
            if (userPhoto && userPhoto !== "") {
              setUserPhotoUrl(userPhoto);
              return;
            }
          } catch (pnpError) {
            console.log("PnP método falhou, tentando URLs diretas:", pnpError);
          }

          // Fallback para URLs diretas do SharePoint
          const possibleUrls = [
            // URL direta do SharePoint Online
            `${
              context.pageContext.web.absoluteUrl
            }/_layouts/15/userphoto.aspx?size=L&username=${encodeURIComponent(
              context.pageContext.user.loginName
            )}`,
            // URL alternativa
            `${
              context.pageContext.web.absoluteUrl
            }/_layouts/15/userphoto.aspx?size=M&accountname=${encodeURIComponent(
              context.pageContext.user.loginName
            )}`,
            // URL do perfil do usuário
            `/_layouts/15/userphoto.aspx?size=L&username=${encodeURIComponent(
              context.pageContext.user.loginName
            )}`,
          ];

          // Testar a primeira URL
          const img = new Image();
          img.onload = () => {
            setUserPhotoUrl(possibleUrls[0]);
          };
          img.onerror = () => {
            console.log("Não foi possível carregar a foto do usuário");
            // Manter ícone padrão
          };
          img.src = possibleUrls[0];
        }
      } catch (error) {
        console.log("Erro ao buscar foto do usuário:", error);
        // Manter ícone padrão em caso de erro
      }
    };

    getUserPhoto().catch(console.error);
  }, [context]);

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
              tokens={{ childrenGap: 16 }}
            >
              <div className={styles.logoContainer}>
                <img
                  src={require("../assets/logo-white.png")}
                  alt="Oceaneering Logo"
                  className={styles.oceaneeringLogo}
                />
              </div>
              <div className={styles.titleContainer}>
                <Text variant="xLarge" className={styles.title}>
                  Sistema HSE
                </Text>
                <Text variant="medium" className={styles.subtitle}>
                  Auto-avaliação para Contratadas
                </Text>
                <Text variant="small" className={styles.systemName}>
                  HSE Control Panel
                </Text>
              </div>
            </Stack>
          </div>

          <div className={styles.userInfo}>
            <Stack
              horizontal
              verticalAlign="center"
              tokens={{ childrenGap: 12 }}
            >
              <div className={styles.userDetails}>
                <Text variant="medium" className={styles.userName}>
                  Bem vindo, {escape(userDisplayName)}
                </Text>
              </div>
              <div className={styles.userAvatar}>
                {userPhotoUrl ? (
                  <img
                    src={userPhotoUrl}
                    alt={`Foto de ${userDisplayName}`}
                    className={styles.userPhoto}
                    onError={(e) => {
                      console.log("Erro ao carregar foto:", userPhotoUrl);
                      setUserPhotoUrl("");
                    }}
                    onLoad={() => {
                      console.log("Foto carregada com sucesso:", userPhotoUrl);
                    }}
                  />
                ) : (
                  <Icon iconName="Contact" />
                )}
              </div>
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
          <PivotItem itemKey="dashboard" headerText="📊 Dashboard" />
          <PivotItem itemKey="forms" headerText="📋 Formulários" />
          <PivotItem itemKey="reports" headerText="📈 Relatórios" />
          <PivotItem itemKey="settings" headerText="⚙️ Configurações" />
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
          <SettingsNavigation
            context={context}
            onBack={() => setActiveTab("dashboard")}
          />
        )}
      </div>

      {/* Footer personalizado */}
      <Footer />
    </section>
  );
};

export default HseControlPanel;
