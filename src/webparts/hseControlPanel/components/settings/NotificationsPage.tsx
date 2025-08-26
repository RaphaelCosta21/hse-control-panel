import * as React from "react";
import {
  Stack,
  Text,
  Spinner,
  MessageBar,
  MessageBarType,
  DefaultButton,
  TextField,
  Icon,
  Toggle,
  Separator,
} from "@fluentui/react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import styles from "./NotificationsPage.module.scss";
import { ConfigurationService } from "../../services/ConfigurationService";
import {
  IProcessedConfiguration,
  ISaveConfigurationResult,
} from "../../types/IConfigurationData";

export interface INotificationsPageProps {
  context: WebPartContext;
  onBack?: () => void;
}

export interface INotificationsPageState {
  configs: IProcessedConfiguration[];
  loading: boolean;
  saving: boolean;
  error: string | undefined;
  saveMessage: string | undefined;
  saveMessageType: MessageBarType;
  formValues: {
    evaluation_deadline_days: string;
    reminder_frequency_days: string;
    notify_on_submission: boolean;
  };
  hasChanges: boolean;
}

export class NotificationsPage extends React.Component<
  INotificationsPageProps,
  INotificationsPageState
> {
  private configService: ConfigurationService;

  constructor(props: INotificationsPageProps) {
    super(props);

    this.configService = new ConfigurationService(props.context);

    this.state = {
      configs: [],
      loading: true,
      saving: false,
      error: undefined,
      saveMessage: undefined,
      saveMessageType: MessageBarType.success,
      formValues: {
        evaluation_deadline_days: "15",
        reminder_frequency_days: "5",
        notify_on_submission: false,
      },
      hasChanges: false,
    };
  }

  public async componentDidMount(): Promise<void> {
    await this.loadConfigurations();
  }

  private loadConfigurations = async (): Promise<void> => {
    try {
      this.setState({ loading: true, error: undefined });

      const configurations =
        await this.configService.getEssentialConfigurations();

      // Filtrar apenas as configurações de notificação
      const notificationConfigs = configurations.filter((config) =>
        [
          "evaluation_deadline_days",
          "reminder_frequency_days",
          "notify_on_submission",
        ].includes(config.key)
      );

      // Extrair valores para o formulário
      const formValues = {
        evaluation_deadline_days: this.getConfigValue(
          notificationConfigs,
          "evaluation_deadline_days",
          "15"
        ),
        reminder_frequency_days: this.getConfigValue(
          notificationConfigs,
          "reminder_frequency_days",
          "5"
        ),
        notify_on_submission:
          this.getConfigValue(
            notificationConfigs,
            "notify_on_submission",
            "false"
          ) === "true",
      };

      this.setState({
        configs: notificationConfigs,
        formValues,
        loading: false,
        hasChanges: false,
      });
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      this.setState({
        error: "Erro ao carregar configurações de notificação.",
        loading: false,
      });
    }
  };

  private getConfigValue = (
    configs: IProcessedConfiguration[],
    key: string,
    defaultValue: string
  ): string => {
    const config = configs.find((c) => c.key === key);
    return config?.value ? String(config.value) : defaultValue;
  };

  private handleFieldChange = (
    field: keyof typeof this.state.formValues,
    value: string | boolean
  ): void => {
    const updatedValues = { ...this.state.formValues };

    if (field === "notify_on_submission" && typeof value === "boolean") {
      updatedValues[field] = value;
    } else if (
      (field === "evaluation_deadline_days" ||
        field === "reminder_frequency_days") &&
      typeof value === "string"
    ) {
      updatedValues[field] = value;
    }

    this.setState({
      formValues: updatedValues,
      hasChanges: true,
      saveMessage: undefined,
    });
  };

  private handleSave = async (): Promise<void> => {
    try {
      this.setState({ saving: true, saveMessage: undefined });

      const { formValues } = this.state;

      // Preparar configurações para salvar
      const configurationsToSave = [
        {
          key: "evaluation_deadline_days",
          value: formValues.evaluation_deadline_days,
          type: "DEADLINE_CONFIG" as const,
        },
        {
          key: "reminder_frequency_days",
          value: formValues.reminder_frequency_days,
          type: "NOTIFICATION_CONFIG" as const,
        },
        {
          key: "notify_on_submission",
          value: formValues.notify_on_submission.toString(),
          type: "NOTIFICATION_CONFIG" as const,
        },
      ];

      // Salvar cada configuração
      const savePromises = configurationsToSave.map((config) =>
        this.configService.saveConfiguration(config.key, config.value)
      );

      const results: ISaveConfigurationResult[] = await Promise.all(
        savePromises
      );

      // Verificar se houve algum erro
      const hasErrors = results.some((result) => !result.success);

      if (hasErrors) {
        const errorMessages = results
          .filter((result) => !result.success)
          .map((result) => result.message)
          .join("; ");

        this.setState({
          saveMessage: `Erro ao salvar algumas configurações: ${errorMessages}`,
          saveMessageType: MessageBarType.error,
          saving: false,
        });
      } else {
        this.setState({
          saveMessage: "Configurações de notificação salvas com sucesso!",
          saveMessageType: MessageBarType.success,
          saving: false,
          hasChanges: false,
        });

        // Recarregar configurações
        setTimeout(() => {
          this.loadConfigurations().catch((error) =>
            console.error("Erro ao recarregar configurações:", error)
          );
        }, 1000);
      }
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      this.setState({
        saveMessage: "Erro ao salvar configurações de notificação.",
        saveMessageType: MessageBarType.error,
        saving: false,
      });
    }
  };

  private handleReset = (): void => {
    this.loadConfigurations().catch((error) =>
      console.error("Erro ao recarregar configurações:", error)
    );
  };

  public render(): React.ReactElement {
    const {
      loading,
      saving,
      error,
      saveMessage,
      saveMessageType,
      formValues,
      hasChanges,
    } = this.state;

    if (loading) {
      return (
        <div className={styles.notificationsPage}>
          <div className={styles.loadingContainer}>
            <Spinner size={3} label="Carregando configurações..." />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.notificationsPage}>
          <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
        </div>
      );
    }

    return (
      <div className={styles.notificationsPage}>
        <div className={styles.header}>
          <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 16 }}>
            <Icon iconName="Ringer" className={styles.headerIcon} />
            <div>
              <Text variant="xLarge" as="h1">
                Configurações de Notificação
              </Text>
              <div>
                <Text variant="medium" className={styles.headerDescription}>
                  Configure prazos e frequência de notificações automáticas do
                  sistema
                </Text>
              </div>
            </div>
          </Stack>
        </div>

        {saveMessage && (
          <MessageBar
            messageBarType={saveMessageType}
            className={styles.messageBar}
            onDismiss={() => this.setState({ saveMessage: undefined })}
          >
            {saveMessage}
          </MessageBar>
        )}

        <div className={styles.content}>
          <div className={styles.configSection}>
            <div className={styles.configCard}>
              <div className={styles.configHeader}>
                <Icon iconName="Clock" className={styles.configIcon} />
                <div>
                  <Text variant="large" className={styles.configTitle}>
                    Prazo de Avaliação (dias)
                  </Text>
                  <div>
                    <Text variant="small" className={styles.configDescription}>
                      Define quantos dias o fornecedor tem para preencher o
                      formulário HSE
                    </Text>
                  </div>
                </div>
              </div>
              <div className={styles.configContent}>
                <TextField
                  label="Prazo em dias"
                  value={formValues.evaluation_deadline_days}
                  onChange={(_, value) =>
                    this.handleFieldChange(
                      "evaluation_deadline_days",
                      value || "15"
                    )
                  }
                  type="number"
                  min="1"
                  max="365"
                  suffix="dias"
                  description="Este valor será usado como {prazo} nos emails enviados aos fornecedores"
                />
              </div>
            </div>

            <div className={styles.configCard}>
              <div className={styles.configHeader}>
                <Icon iconName="Ringer" className={styles.configIcon} />
                <div>
                  <Text variant="large" className={styles.configTitle}>
                    Frequência de Lembrete (dias)
                  </Text>
                  <div>
                    <Text variant="small" className={styles.configDescription}>
                      Define de quantos em quantos dias o sistema enviará
                      lembretes automáticos
                    </Text>
                  </div>
                </div>
              </div>
              <div className={styles.configContent}>
                <TextField
                  label="Frequência em dias"
                  value={formValues.reminder_frequency_days}
                  onChange={(_, value) =>
                    this.handleFieldChange(
                      "reminder_frequency_days",
                      value || "5"
                    )
                  }
                  type="number"
                  min="1"
                  max="30"
                  suffix="dias"
                  description="Intervalo entre envios de emails de lembrete para formulários pendentes"
                />
              </div>
            </div>

            <div className={styles.configCard}>
              <div className={styles.configHeader}>
                <Icon iconName="Mail" className={styles.configIcon} />
                <div>
                  <Text variant="large" className={styles.configTitle}>
                    Notificar Submissões
                  </Text>
                  <div>
                    <Text variant="small" className={styles.configDescription}>
                      Ativa ou desativa o envio automático de emails de lembrete
                    </Text>
                  </div>
                </div>
              </div>
              <div className={styles.configContent}>
                <Toggle
                  label="Enviar lembretes automáticos"
                  checked={formValues.notify_on_submission}
                  onChange={(_, checked) =>
                    this.handleFieldChange(
                      "notify_on_submission",
                      checked || false
                    )
                  }
                  onText="Ativado"
                  offText="Desativado"
                />
                <Text variant="small" className={styles.toggleDescription}>
                  {formValues.notify_on_submission
                    ? "O sistema enviará lembretes automáticos baseado na frequência configurada"
                    : "Nenhum lembrete automático será enviado pelo sistema"}
                </Text>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className={styles.footer}>
          <Stack horizontal tokens={{ childrenGap: 12 }}>
            <DefaultButton
              text="Resetar"
              iconProps={{ iconName: "Refresh" }}
              onClick={this.handleReset}
              disabled={saving || !hasChanges}
            />
            <DefaultButton
              text={saving ? "Salvando..." : "Salvar Configurações"}
              iconProps={{ iconName: saving ? "Sync" : "Save" }}
              onClick={this.handleSave}
              disabled={saving || !hasChanges}
              primary
            />
          </Stack>
        </div>
      </div>
    );
  }
}
