import * as React from "react";
import {
  Stack,
  Text,
  DefaultButton,
  Nav,
  INavLinkGroup,
} from "@fluentui/react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import styles from "./SettingsPage.module.scss";
import { MembersManagement } from "./members/MembersManagement";
import { EmailTemplatesPage } from "./EmailTemplatesPage";
import { NotificationsPage } from "./NotificationsPage";

export interface ISettingsNavigationProps {
  context: WebPartContext;
  onBack?: () => void;
}

interface ISettingsNavigationState {
  selectedKey: string;
  isPanelOpen: boolean;
}

export class SettingsNavigation extends React.Component<
  ISettingsNavigationProps,
  ISettingsNavigationState
> {
  constructor(props: ISettingsNavigationProps) {
    super(props);

    this.state = {
      selectedKey: "main",
      isPanelOpen: false,
    };
  }

  private getNavGroups(): INavLinkGroup[] {
    return [
      {
        name: "Configurações",
        links: [
          {
            name: "Geral",
            key: "main",
            url: "#",
            iconProps: { iconName: "Settings" },
            onClick: () => this.setState({ selectedKey: "main" }),
          },
        ],
      },
      {
        name: "Gerenciamento",
        links: [
          {
            name: "Notificações",
            key: "notifications",
            url: "#",
            iconProps: { iconName: "Ringer" },
            onClick: () => this.setState({ selectedKey: "notifications" }),
          },
          {
            name: "Templates de Email",
            key: "email-templates",
            url: "#",
            iconProps: { iconName: "Mail" },
            onClick: () => this.setState({ selectedKey: "email-templates" }),
          },
          {
            name: "Membros das Equipes",
            key: "members",
            url: "#",
            iconProps: { iconName: "People" },
            onClick: () => this.setState({ selectedKey: "members" }),
          },
        ],
      },
    ];
  }

  private renderMainSettings(): React.ReactElement {
    return (
      <Stack tokens={{ childrenGap: 20 }}>
        <Text variant="xLarge" styles={{ root: { fontWeight: "600" } }}>
          ⚙️ Configurações Gerais do Sistema
        </Text>

        <Stack tokens={{ childrenGap: 15 }}>
          <div className={styles.configGroup}>
            <div className={styles.groupHeader}>
              <Text variant="large" styles={{ root: { fontWeight: "600" } }}>
                🔔 Configurações de Notificação
              </Text>
            </div>
            <Text variant="medium">
              Gerencie como e quando as notificações são enviadas aos usuários
              do sistema.
            </Text>
            <div>
              <DefaultButton
                text="Configurar Notificações"
                iconProps={{ iconName: "Ringer" }}
                onClick={() => this.setState({ selectedKey: "notifications" })}
                styles={{ root: { marginTop: "8px" } }}
              />
            </div>
          </div>

          <div className={styles.configGroup}>
            <div className={styles.groupHeader}>
              <Text variant="large" styles={{ root: { fontWeight: "600" } }}>
                📧 Templates de Email
              </Text>
            </div>
            <Text variant="medium">
              Configure os templates de email para aprovações, lembretes e
              notificações automáticas.
            </Text>
            <div>
              <DefaultButton
                text="Gerenciar Templates"
                iconProps={{ iconName: "Mail" }}
                onClick={() =>
                  this.setState({ selectedKey: "email-templates" })
                }
                styles={{ root: { marginTop: "8px" } }}
              />
            </div>
          </div>

          <div className={styles.configGroup}>
            <div className={styles.groupHeader}>
              <Text variant="large" styles={{ root: { fontWeight: "600" } }}>
                👥 Equipes HSE e Compras
              </Text>
            </div>
            <Text variant="medium">
              Gerencie os membros das equipes HSE e Compras que têm acesso ao
              sistema.
            </Text>
            <div>
              <DefaultButton
                text="Gerenciar Membros"
                iconProps={{ iconName: "People" }}
                onClick={() => this.setState({ selectedKey: "members" })}
                styles={{ root: { marginTop: "8px" } }}
              />
            </div>
          </div>
        </Stack>
      </Stack>
    );
  }

  private renderNotifications(): React.ReactElement {
    return (
      <NotificationsPage
        context={this.props.context}
        onBack={() => this.setState({ selectedKey: "main" })}
      />
    );
  }

  private renderEmailTemplates(): React.ReactElement {
    return (
      <EmailTemplatesPage
        context={this.props.context}
        onBack={() => this.setState({ selectedKey: "main" })}
      />
    );
  }

  private renderCurrentPage(): React.ReactElement {
    const { selectedKey } = this.state;

    switch (selectedKey) {
      case "notifications":
        return this.renderNotifications();
      case "email-templates":
        return this.renderEmailTemplates();
      case "members":
        return (
          <MembersManagement
            context={this.props.context}
            onBack={() => this.setState({ selectedKey: "main" })}
          />
        );
      default:
        return this.renderMainSettings();
    }
  }

  public render(): React.ReactElement<ISettingsNavigationProps> {
    const { selectedKey } = this.state;

    return (
      <div className={styles.settingsPage}>
        <Stack horizontal styles={{ root: { height: "100%" } }}>
          {/* Navigation Sidebar */}
          <div
            style={{
              width: "250px",
              borderRight: "1px solid var(--neutral-lighter)",
            }}
          >
            <Stack
              tokens={{ childrenGap: 20 }}
              styles={{
                root: { padding: "20px", borderRight: "1px solid #d1d1d1" },
              }}
            >
              <Nav
                groups={this.getNavGroups()}
                selectedKey={selectedKey}
                styles={{
                  root: {
                    width: "100%",
                  },
                  linkText: {
                    fontSize: "14px",
                  },
                }}
              />
            </Stack>
          </div>

          {/* Main Content */}
          <div style={{ flex: 1, padding: "20px", overflow: "auto" }}>
            {this.renderCurrentPage()}
          </div>
        </Stack>
      </div>
    );
  }
}
