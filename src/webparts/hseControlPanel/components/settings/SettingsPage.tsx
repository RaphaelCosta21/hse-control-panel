import * as React from "react";
import {
  Stack,
  Text,
  Spinner,
  MessageBar,
  MessageBarType,
  DefaultButton,
  PrimaryButton,
  TextField,
  Toggle,
  Separator,
  Icon,
} from "@fluentui/react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import styles from "./SettingsPage.module.scss";
import { ConfigurationService } from "../../services/ConfigurationService";
import {
  IProcessedConfiguration,
  ISaveConfigurationResult,
} from "../../types/IConfigurationData";

export interface ISettingsPageProps {
  context: WebPartContext;
  onBack?: () => void;
}

export interface ISettingsPageState {
  configurations: IProcessedConfiguration[];
  loading: boolean;
  saving: boolean;
  error: string | undefined;
  saveMessage: string | undefined;
  saveMessageType: MessageBarType;
  formValues: { [key: string]: string | number | boolean };
  hasChanges: boolean;
}

export class SettingsPage extends React.Component<
  ISettingsPageProps,
  ISettingsPageState
> {
  private configService: ConfigurationService;

  constructor(props: ISettingsPageProps) {
    super(props);

    this.configService = new ConfigurationService(props.context);

    this.state = {
      configurations: [],
      loading: true,
      saving: false,
      error: undefined,
      saveMessage: undefined,
      saveMessageType: MessageBarType.success,
      formValues: {},
      hasChanges: false,
    };
  }

  public async componentDidMount(): Promise<void> {
    await this.loadConfigurations();
  }

  private async loadConfigurations(): Promise<void> {
    try {
      this.setState({ loading: true, error: undefined });

      const configurations =
        await this.configService.getEssentialConfigurations();
      const initialValues: { [key: string]: string | number | boolean } = {};

      configurations.forEach((config) => {
        initialValues[config.key] = config.value;
      });

      this.setState({
        configurations,
        formValues: initialValues,
        loading: false,
        hasChanges: false,
      });
    } catch (error) {
      this.setState({
        error: `Erro ao carregar configurações: ${error.message}`,
        loading: false,
      });
    }
  }

  private handleValueChange = (
    key: string,
    value: string | number | boolean
  ): void => {
    this.setState((prevState) => ({
      formValues: {
        ...prevState.formValues,
        [key]: value,
      },
      hasChanges: true,
      saveMessage: undefined,
    }));
  };

  private handleSave = async (): Promise<void> => {
    try {
      this.setState({ saving: true, saveMessage: undefined });

      // Converte valores para string para salvar no SharePoint
      const configsToSave: { [key: string]: string } = {};
      Object.keys(this.state.formValues).forEach((key) => {
        const value = this.state.formValues[key];
        configsToSave[key] = String(value);
      });

      const result: ISaveConfigurationResult =
        await this.configService.saveMultipleConfigurations(configsToSave);

      if (result.success) {
        this.setState({
          saving: false,
          hasChanges: false,
          saveMessage: result.message,
          saveMessageType: MessageBarType.success,
        });

        // Recarrega as configurações para atualizar a tela
        setTimeout(() => {
          this.loadConfigurations().catch(console.error);
        }, 1000);
      } else {
        this.setState({
          saving: false,
          saveMessage: result.message,
          saveMessageType: MessageBarType.error,
        });
      }
    } catch (error) {
      this.setState({
        saving: false,
        saveMessage: `Erro ao salvar configurações: ${error.message}`,
        saveMessageType: MessageBarType.error,
      });
    }
  };

  private handleReset = (): void => {
    const initialValues: { [key: string]: string | number | boolean } = {};
    this.state.configurations.forEach((config) => {
      initialValues[config.key] = config.value;
    });

    this.setState({
      formValues: initialValues,
      hasChanges: false,
      saveMessage: undefined,
    });
  };

  private renderConfigurationField = (
    config: IProcessedConfiguration
  ): JSX.Element => {
    const currentValue = this.state.formValues[config.key];

    switch (config.inputType) {
      case "boolean":
        return (
          <Toggle
            label={config.title}
            checked={Boolean(currentValue)}
            onChange={(_, checked) =>
              this.handleValueChange(config.key, Boolean(checked))
            }
            onText="Ativado"
            offText="Desativado"
          />
        );

      case "number":
        return (
          <TextField
            label={config.title}
            type="number"
            value={String(currentValue || "")}
            placeholder={config.placeholder}
            onChange={(_, value) =>
              this.handleValueChange(config.key, parseInt(value || "0", 10))
            }
            required={config.validation?.required}
            min={config.validation?.min}
            max={config.validation?.max}
          />
        );

      case "textarea":
        return (
          <TextField
            label={config.title}
            multiline
            rows={4}
            value={String(currentValue || "")}
            placeholder={config.placeholder}
            onChange={(_, value) =>
              this.handleValueChange(config.key, value || "")
            }
            required={config.validation?.required}
          />
        );

      default:
        return (
          <TextField
            label={config.title}
            value={String(currentValue || "")}
            placeholder={config.placeholder}
            onChange={(_, value) =>
              this.handleValueChange(config.key, value || "")
            }
            required={config.validation?.required}
          />
        );
    }
  };

  private groupConfigurationsByType = (): {
    [type: string]: IProcessedConfiguration[];
  } => {
    const groups: { [type: string]: IProcessedConfiguration[] } = {
      NOTIFICATION_CONFIG: [],
      DEADLINE_CONFIG: [],
      EMAIL_TEMPLATE: [],
    };

    this.state.configurations.forEach((config) => {
      if (groups[config.type]) {
        groups[config.type].push(config);
      }
    });

    return groups;
  };

  private renderConfigurationGroup = (
    type: string,
    configs: IProcessedConfiguration[]
  ): JSX.Element | undefined => {
    if (configs.length === 0) return undefined;

    const groupTitles: { [key: string]: string } = {
      NOTIFICATION_CONFIG: "Configurações de Notificação",
      DEADLINE_CONFIG: "Configurações de Prazo",
      EMAIL_TEMPLATE: "Templates de Email",
    };

    const groupIcons: { [key: string]: string } = {
      NOTIFICATION_CONFIG: "Ringer",
      DEADLINE_CONFIG: "Clock",
      EMAIL_TEMPLATE: "Mail",
    };

    return (
      <div key={type} className={styles.configGroup}>
        <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
          <Icon iconName={groupIcons[type]} className={styles.groupIcon} />
          <Text variant="large" className={styles.groupTitle}>
            {groupTitles[type]}
          </Text>
        </Stack>

        <div className={styles.configFields}>
          {configs.map((config) => (
            <div key={config.key} className={styles.configField}>
              {this.renderConfigurationField(config)}
              {config.description && (
                <Text variant="small" className={styles.fieldDescription}>
                  {config.description}
                </Text>
              )}
            </div>
          ))}
        </div>

        <Separator />
      </div>
    );
  };

  public render(): React.ReactElement {
    const { loading, saving, error, saveMessage, saveMessageType, hasChanges } =
      this.state;

    if (loading) {
      return (
        <div className={styles.settingsPage}>
          <div className={styles.loadingContainer}>
            <Spinner size={3} label="Carregando configurações..." />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.settingsPage}>
          <div className={styles.header}>
            <Stack
              horizontal
              horizontalAlign="space-between"
              verticalAlign="center"
            >
              <Stack
                horizontal
                verticalAlign="center"
                tokens={{ childrenGap: 12 }}
              >
                <Icon iconName="Settings" className={styles.headerIcon} />
                <Text variant="xLarge">⚙️ Configurações do Sistema</Text>
              </Stack>

              {this.props.onBack && (
                <DefaultButton
                  iconProps={{ iconName: "Back" }}
                  onClick={this.props.onBack}
                >
                  Voltar
                </DefaultButton>
              )}
            </Stack>
          </div>

          <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
        </div>
      );
    }

    const configGroups = this.groupConfigurationsByType();

    return (
      <div className={styles.settingsPage}>
        <div className={styles.header}>
          <Stack
            horizontal
            horizontalAlign="space-between"
            verticalAlign="center"
          >
            <Stack
              horizontal
              verticalAlign="center"
              tokens={{ childrenGap: 12 }}
            >
              <Icon iconName="Settings" className={styles.headerIcon} />
              <Text variant="xLarge">⚙️ Configurações do Sistema</Text>
            </Stack>

            {this.props.onBack && (
              <DefaultButton
                iconProps={{ iconName: "Back" }}
                onClick={this.props.onBack}
              >
                Voltar
              </DefaultButton>
            )}
          </Stack>

          <Text variant="medium" className={styles.headerDescription}>
            Gerencie as configurações essenciais do HSE Control Panel
          </Text>
        </div>

        {saveMessage && (
          <MessageBar
            messageBarType={saveMessageType}
            onDismiss={() => this.setState({ saveMessage: undefined })}
          >
            {saveMessage}
          </MessageBar>
        )}

        <div className={styles.content}>
          <form className={styles.settingsForm}>
            {Object.keys(configGroups).map((type) =>
              this.renderConfigurationGroup(type, configGroups[type])
            )}
          </form>
        </div>

        <div className={styles.footer}>
          <Stack horizontal horizontalAlign="end" tokens={{ childrenGap: 12 }}>
            <DefaultButton
              text="Resetar"
              iconProps={{ iconName: "Undo" }}
              onClick={this.handleReset}
              disabled={!hasChanges || saving}
            />

            <PrimaryButton
              text={saving ? "Salvando..." : "Salvar Configurações"}
              iconProps={{ iconName: saving ? undefined : "Save" }}
              onClick={this.handleSave}
              disabled={!hasChanges || saving}
            >
              {saving && <Spinner size={1} />}
            </PrimaryButton>
          </Stack>
        </div>
      </div>
    );
  }
}
