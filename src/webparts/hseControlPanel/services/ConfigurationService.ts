import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFx, SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import {
  IConfigurationItem,
  IProcessedConfiguration,
  ISaveConfigurationResult,
  ConfigType,
} from "../types/IConfigurationData";

export class ConfigurationService {
  private sp: SPFI;
  private configListName: string;

  constructor(
    context: WebPartContext,
    configListName: string = "hse-control-panel-config"
  ) {
    this.sp = spfi().using(SPFx(context));
    this.configListName = configListName;
    console.log("ConfigurationService initialized with list:", configListName);
  }

  /**
   * Obtém todas as configurações da lista SharePoint
   */
  public async getAllConfigurations(): Promise<IConfigurationItem[]> {
    try {
      const items = await this.sp.web.lists
        .getByTitle(this.configListName)
        .items.select(
          "Id",
          "Title",
          "ConfigKey",
          "ConfigType",
          "ConfigValue",
          "Modified",
          "Created"
        )
        .orderBy("Title", true)();

      return items as IConfigurationItem[];
    } catch (error) {
      console.error("Erro ao obter configurações:", error);
      throw new Error(`Falha ao obter configurações: ${error.message}`);
    }
  }

  /**
   * Obtém configurações essenciais processadas para o formulário
   */
  public async getEssentialConfigurations(): Promise<
    IProcessedConfiguration[]
  > {
    try {
      const rawConfigs = await this.getAllConfigurations();
      return this.processConfigurations(rawConfigs);
    } catch (error) {
      console.error("Erro ao obter configurações essenciais:", error);
      throw new Error(
        `Falha ao obter configurações essenciais: ${error.message}`
      );
    }
  }

  /**
   * Salva ou atualiza uma configuração específica
   */
  public async saveConfiguration(
    configKey: string,
    configValue: string
  ): Promise<ISaveConfigurationResult> {
    try {
      // Busca se a configuração já existe
      const existingItems = await this.sp.web.lists
        .getByTitle(this.configListName)
        .items.filter(`ConfigKey eq '${configKey}'`)
        .select("Id", "Title", "ConfigKey", "ConfigType", "ConfigValue")();

      const configInfo = this.getConfigurationInfo(configKey);

      const updateData = {
        Title: configInfo.title,
        ConfigKey: configKey,
        ConfigType: configInfo.type,
        ConfigValue: configValue,
      };

      if (existingItems.length > 0) {
        // Atualiza configuração existente
        await this.sp.web.lists
          .getByTitle(this.configListName)
          .items.getById(existingItems[0].Id)
          .update(updateData);
      } else {
        // Cria nova configuração
        await this.sp.web.lists
          .getByTitle(this.configListName)
          .items.add(updateData);
      }

      return {
        success: true,
        message: "Configuração salva com sucesso",
        updatedConfigurations: await this.getAllConfigurations(),
      };
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      return {
        success: false,
        message: `Erro ao salvar configuração: ${error.message}`,
      };
    }
  }

  /**
   * Salva múltiplas configurações de uma só vez
   */
  public async saveMultipleConfigurations(configurations: {
    [key: string]: string;
  }): Promise<ISaveConfigurationResult> {
    try {
      const configKeys = Object.keys(configurations);
      const savePromises = configKeys.map((key: string) =>
        this.saveConfiguration(key, configurations[key])
      );

      const results = await Promise.all(savePromises);
      const hasError = results.some(
        (result: ISaveConfigurationResult) => !result.success
      );

      if (hasError) {
        return {
          success: false,
          message: "Algumas configurações falharam ao salvar",
        };
      }

      return {
        success: true,
        message: "Todas as configurações foram salvas com sucesso",
        updatedConfigurations: await this.getAllConfigurations(),
      };
    } catch (error) {
      console.error("Erro ao salvar múltiplas configurações:", error);
      return {
        success: false,
        message: `Erro ao salvar configurações: ${error.message}`,
      };
    }
  }

  /**
   * Processa configurações brutas para formato de formulário
   */
  private processConfigurations(
    rawConfigs: IConfigurationItem[]
  ): IProcessedConfiguration[] {
    const essentialKeys = [
      "notify_on_submission",
      "reminder_frequency_days",
      "evaluation_deadline_days",
      "email_rejection",
      "email_approval",
      "email_reminder",
      "email_new_supplier",
    ];

    const processedConfigs: IProcessedConfiguration[] = [];

    // Processa configurações existentes
    rawConfigs.forEach((config) => {
      if (essentialKeys.indexOf(config.ConfigKey) !== -1) {
        processedConfigs.push(this.convertToProcessedConfig(config));
      }
    });

    // Adiciona configurações faltantes com valores padrão
    essentialKeys.forEach((key) => {
      let configExists = false;
      for (let i = 0; i < processedConfigs.length; i++) {
        if (processedConfigs[i].key === key) {
          configExists = true;
          break;
        }
      }
      if (!configExists) {
        processedConfigs.push(this.createDefaultConfig(key));
      }
    });

    // Ordena por tipo e depois por título
    return processedConfigs.sort((a, b) => {
      if (a.type !== b.type) {
        const typeOrder = {
          NOTIFICATION_CONFIG: 0,
          DEADLINE_CONFIG: 1,
          EMAIL_TEMPLATE: 2,
        };
        return typeOrder[a.type] - typeOrder[b.type];
      }
      return a.title.localeCompare(b.title);
    });
  }

  /**
   * Converte configuração bruta para processada
   */
  private convertToProcessedConfig(
    config: IConfigurationItem
  ): IProcessedConfiguration {
    const configInfo = this.getConfigurationInfo(config.ConfigKey);

    let processedValue: string | number | boolean = config.ConfigValue;

    // Converte valores conforme o tipo
    if (configInfo.inputType === "boolean") {
      processedValue = config.ConfigValue.toLowerCase() === "true";
    } else if (configInfo.inputType === "number") {
      processedValue = parseInt(config.ConfigValue, 10) || 0;
    }

    return {
      key: config.ConfigKey,
      title: configInfo.title,
      description: configInfo.description,
      type: config.ConfigType,
      value: processedValue,
      inputType: configInfo.inputType,
      placeholder: configInfo.placeholder,
      validation: configInfo.validation,
    };
  }

  /**
   * Cria configuração padrão para chaves faltantes
   */
  private createDefaultConfig(key: string): IProcessedConfiguration {
    const configInfo = this.getConfigurationInfo(key);

    let defaultValue: string | number | boolean = "";
    if (configInfo.inputType === "boolean") {
      defaultValue = key === "notify_on_submission" ? true : false;
    } else if (configInfo.inputType === "number") {
      defaultValue =
        key === "reminder_frequency_days"
          ? 7
          : key === "evaluation_deadline_days"
          ? 15
          : 0;
    }

    return {
      key,
      title: configInfo.title,
      description: configInfo.description,
      type: configInfo.type,
      value: defaultValue,
      inputType: configInfo.inputType,
      placeholder: configInfo.placeholder,
      validation: configInfo.validation,
    };
  }

  /**
   * Obtém informações de metadados para uma chave de configuração
   */
  private getConfigurationInfo(key: string): {
    title: string;
    description: string;
    type: ConfigType;
    inputType: "text" | "number" | "boolean" | "textarea";
    placeholder?: string;
    validation?: {
      required?: boolean;
      min?: number;
      max?: number;
      pattern?: string;
    };
  } {
    interface IConfigMeta {
      [key: string]: {
        title: string;
        description: string;
        type: ConfigType;
        inputType: "text" | "number" | "boolean" | "textarea";
        placeholder?: string;
        validation?: {
          required?: boolean;
          min?: number;
          max?: number;
          pattern?: string;
        };
      };
    }

    const configMeta: IConfigMeta = {
      notify_on_submission: {
        title: "Notificar Submissões",
        description: "Enviar notificação quando novo formulário for submetido",
        type: "NOTIFICATION_CONFIG" as ConfigType,
        inputType: "boolean" as const,
      },
      reminder_frequency_days: {
        title: "Frequência de Lembrete (dias)",
        description: "Intervalo em dias para envio de lembretes automáticos",
        type: "NOTIFICATION_CONFIG" as ConfigType,
        inputType: "number" as const,
        placeholder: "Ex: 7",
        validation: { required: true, min: 1, max: 30 },
      },
      evaluation_deadline_days: {
        title: "Prazo de Avaliação (dias)",
        description: "Prazo limite para conclusão da avaliação HSE",
        type: "DEADLINE_CONFIG" as ConfigType,
        inputType: "number" as const,
        placeholder: "Ex: 15",
        validation: { required: true, min: 1, max: 90 },
      },
      email_rejection: {
        title: "Template Email - Rejeição",
        description: "Modelo de email enviado quando fornecedor é rejeitado",
        type: "EMAIL_TEMPLATE" as ConfigType,
        inputType: "textarea" as const,
        placeholder: "Prezado fornecedor, infelizmente...",
        validation: { required: true },
      },
      email_approval: {
        title: "Template Email - Aprovação",
        description: "Modelo de email enviado quando fornecedor é aprovado",
        type: "EMAIL_TEMPLATE" as ConfigType,
        inputType: "textarea" as const,
        placeholder: "Parabéns! Sua empresa foi aprovada...",
        validation: { required: true },
      },
      email_reminder: {
        title: "Template Email - Lembrete",
        description: "Modelo de email para lembretes automáticos",
        type: "EMAIL_TEMPLATE" as ConfigType,
        inputType: "textarea" as const,
        placeholder: "Este é um lembrete sobre...",
        validation: { required: true },
      },
      email_new_supplier: {
        title: "Template Email - Novo Fornecedor",
        description: "Modelo de email de boas-vindas para novos fornecedores",
        type: "EMAIL_TEMPLATE" as ConfigType,
        inputType: "textarea" as const,
        placeholder: "Bem-vindo ao processo de avaliação HSE...",
        validation: { required: true },
      },
    };

    return (
      configMeta[key] || {
        title: key,
        description: "Configuração personalizada",
        type: "NOTIFICATION_CONFIG" as ConfigType,
        inputType: "text" as const,
      }
    );
  }
}
