import * as React from "react";
import {
  Stack,
  Text,
  Spinner,
  MessageBar,
  MessageBarType,
  DefaultButton,
  TextField,
  Separator,
  Icon,
  Panel,
  PanelType,
  ActionButton,
} from "@fluentui/react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import styles from "./EmailTemplatesPage.module.scss";
import { ConfigurationService } from "../../services/ConfigurationService";
import {
  IProcessedConfiguration,
  ISaveConfigurationResult,
} from "../../types/IConfigurationData";

export interface IEmailTemplatesPageProps {
  context: WebPartContext;
  onBack?: () => void;
}

export interface IEmailTemplatesPageState {
  templates: IProcessedConfiguration[];
  loading: boolean;
  saving: boolean;
  error: string | undefined;
  saveMessage: string | undefined;
  saveMessageType: MessageBarType;
  formValues: { [key: string]: string };
  hasChanges: boolean;
  isEditPanelOpen: boolean;
  editingTemplate: string;
  tempEditValue: string;
}

interface IEmailTemplate {
  key: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  sampleData: {
    subject: string;
    body: string;
    footer: string;
  };
}

export class EmailTemplatesPage extends React.Component<
  IEmailTemplatesPageProps,
  IEmailTemplatesPageState
> {
  private configService: ConfigurationService;
  private emailTemplateDefinitions: { [key: string]: IEmailTemplate };
  private templateOrder: string[];

  constructor(props: IEmailTemplatesPageProps) {
    super(props);

    this.configService = new ConfigurationService(props.context);

    // Ordem específica dos templates
    this.templateOrder = [
      "email_new_supplier",
      "email_reminder",
      "email_formsent",
      "email_approval",
      "email_approval_restriction",
      "email_rejection",
      "email_pendente",
    ];

    // Definições dos templates de email com dados de exemplo (ordem específica)
    this.emailTemplateDefinitions = {
      email_new_supplier: {
        key: "email_new_supplier",
        title: "Novo Fornecedor",
        description: "Convite inicial para participar do processo",
        icon: "ContactCard",
        color: "#0078d4",
        sampleData: {
          subject: "Bem-vindo ao processo de cadastro HSE - Marine",
          body: `Olá {nome},

Você foi convidado para participar do processo de cadastro HSE da Marine.

Para preencher seu formulário, acesse o link abaixo:
{link}

Prazo para preenchimento: {prazo} dias

Em caso de dúvidas, entre em contato conosco: compassom@oceaneering.com - Macaé

Atenciosamente,
Equipe HSE - Oceaneering`,
          footer:
            "Este é um email automático do sistema HSE Control Panel.\nPor favor, não responda este email.",
        },
      },
      email_reminder: {
        key: "email_reminder",
        title: "Lembrete",
        description: "Lembretes automáticos para formulários pendentes",
        icon: "Ringer",
        color: "#ff8c00",
        sampleData: {
          subject: "Lembrete: Formulário HSE pendente - {empresa}",
          body: `Olá {nome},

Seu formulário HSE está pendente há {dias} dias.

Empresa: {empresa}
CNPJ: {cnpj}

Prazo restante: {prazo_restante} dias úteis

Por favor, acesse o link abaixo para finalizar o preenchimento:
{link}

Atenciosamente,
Equipe HSE - Marine`,
          footer:
            "Este é um email automático do sistema HSE Control Panel.\nPor favor, não responda este email.",
        },
      },
      email_formsent: {
        key: "email_formsent",
        title: "Enviado",
        description: "Confirmação de recebimento do formulário",
        icon: "Send",
        color: "#107c10",
        sampleData: {
          subject: "Formulário HSE Recebido - {empresa}",
          body: `Olá {nome},

Confirmamos o recebimento do seu formulário HSE.

Empresa: {empresa}
CNPJ: {cnpj}
Data de envio: {data_envio}

Seu formulário está em análise. Você receberá uma notificação quando a avaliação for concluída.

Prazo estimado de resposta: {prazo_resposta} dias úteis

Atenciosamente,
Equipe HSE - Marine`,
          footer:
            "Este é um email automático do sistema HSE Control Panel.\nPor favor, não responda este email.",
        },
      },
      email_approval: {
        key: "email_approval",
        title: "Aprovação",
        description: "Notificação de aprovação da empresa",
        icon: "CheckMark",
        color: "#107c10",
        sampleData: {
          subject: "Formulário HSE Aprovado - {empresa}",
          body: `Olá {nome},

Temos o prazer de informar que seu formulário HSE foi APROVADO!

Empresa: {empresa}
CNPJ: {cnpj}
Data de aprovação: {data_aprovacao}
Avaliador: {avaliador}

Parabéns! Sua empresa está apta para prestação de serviços.

Atenciosamente,
Equipe HSE - Marine`,
          footer:
            "Este é um email automático do sistema HSE Control Panel.\nPor favor, não responda este email.",
        },
      },
      email_approval_restriction: {
        key: "email_approval_restriction",
        title: "Aprovação com Restrição",
        description:
          "Notificação de aprovação com restrições que precisam ser corrigidas",
        icon: "Warning",
        color: "#f3b90c",
        sampleData: {
          subject: "Formulário HSE Aprovado com Restrições - {empresa}",
          body: `Olá {nome},

Seu formulário HSE foi APROVADO, porém foram identificadas algumas restrições que precisam ser corrigidas.

Empresa: {empresa}
CNPJ: {cnpj}
Data de aprovação: {data_aprovacao}
Avaliador: {avaliador}

Restrições aplicadas:
{lista_restricoes}

Por favor, acesse o link abaixo para visualizar o seu formulário, conferir as restrições e realizar as correções necessárias o mais rápido possível:
{link}

Após corrigir as restrições, submeta novamente o formulário para uma nova avaliação.

Atenciosamente,
Equipe HSE - Oceaneering Macaé - Brasil`,
          footer:
            "Este é um email automático do sistema HSE Control Panel.\nPor favor, não responda este email.",
        },
      },
      email_rejection: {
        key: "email_rejection",
        title: "Rejeição",
        description: "Notificação de rejeição com motivos",
        icon: "ErrorBadge",
        color: "#d13438",
        sampleData: {
          subject: "Formulário HSE Rejeitado - {empresa}",
          body: `Olá {nome},

Informamos que seu formulário HSE foi rejeitado.

Empresa: {empresa}
CNPJ: {cnpj}
Data de avaliação: {data_avaliacao}
Avaliador: {avaliador}

Motivos da rejeição:
{comentarios_avaliacao}

Você pode corrigir as pendências e reenviar o formulário.

Atenciosamente,
Equipe HSE - Marine`,
          footer:
            "Este é um email automático do sistema HSE Control Panel.\nPor favor, não responda este email.",
        },
      },
      email_pendente: {
        key: "email_pendente",
        title: "Pendente Info",
        description: "Solicitação de correções/informações adicionais",
        icon: "Info",
        color: "#ff8c00",
        sampleData: {
          subject:
            "Formulário HSE Pendente - Correções Necessárias - {empresa}",
          body: `Olá {nome},

Seu formulário HSE foi avaliado e identificamos que algumas informações precisam ser corrigidas ou complementadas.

Empresa: {empresa}
CNPJ: {cnpj}
Data de avaliação: {data_avaliacao}
Avaliador: {avaliador}

Motivos/Comentários da avaliação:
{comentarios_avaliacao}

Por favor, acesse o link abaixo para corrigir as pendências identificadas e reenviar o formulário:
{link}

Após as correções, submeta novamente o formulário para uma nova avaliação.

Atenciosamente,
Equipe HSE - Marine`,
          footer:
            "Este é um email automático do sistema HSE Control Panel.\nPor favor, não responda este email.",
        },
      },
    };

    this.state = {
      templates: [],
      loading: true,
      saving: false,
      error: undefined,
      saveMessage: undefined,
      saveMessageType: MessageBarType.success,
      formValues: {},
      hasChanges: false,
      isEditPanelOpen: false,
      editingTemplate: "",
      tempEditValue: "",
    };
  }

  public async componentDidMount(): Promise<void> {
    await this.loadTemplates();
  }

  private async loadTemplates(): Promise<void> {
    try {
      this.setState({ loading: true, error: undefined });

      const allConfigurations =
        await this.configService.getEssentialConfigurations();
      const emailTemplates = allConfigurations.filter(
        (config) => config.type === "EMAIL_TEMPLATE"
      );

      const initialValues: { [key: string]: string } = {};
      emailTemplates.forEach((template) => {
        initialValues[template.key] = String(template.value || "");
      });

      // Garantir que todos os templates tenham valores, mesmo que seja o padrão
      this.templateOrder.forEach((key) => {
        const templateDef = this.emailTemplateDefinitions[key];
        if (templateDef) {
          // Se não existe valor carregado ou está vazio, usar o template padrão
          if (!initialValues[key] || initialValues[key].trim() === "") {
            initialValues[key] = templateDef.sampleData.body;
          }
        }
      });

      // Se não existirem templates, criar com dados padrão
      const missingTemplates: IProcessedConfiguration[] = [];
      this.templateOrder.forEach((key) => {
        if (!emailTemplates.find((t) => t.key === key)) {
          const templateDef = this.emailTemplateDefinitions[key];
          if (templateDef) {
            missingTemplates.push({
              key: templateDef.key,
              title: templateDef.title,
              description: templateDef.description,
              type: "EMAIL_TEMPLATE",
              value: templateDef.sampleData.body,
              inputType: "textarea",
            });
          }
        }
      });

      const allTemplates = [...emailTemplates, ...missingTemplates];

      // Ordenar templates conforme a ordem especificada
      const orderedTemplates = this.templateOrder
        .map((key) => allTemplates.find((t) => t.key === key))
        .filter((t) => t !== undefined) as IProcessedConfiguration[];

      this.setState({
        templates: orderedTemplates,
        formValues: initialValues,
        loading: false,
        hasChanges: false,
      });
    } catch (error) {
      this.setState({
        error: `Erro ao carregar templates: ${error.message}`,
        loading: false,
      });
    }
  }

  private handleEdit = (templateKey: string): void => {
    const currentValue = this.state.formValues[templateKey] || "";
    const templateDef = this.emailTemplateDefinitions[templateKey];

    // Se não há valor carregado, usa o template padrão
    const editValue =
      currentValue || (templateDef ? templateDef.sampleData.body : "");

    this.setState({
      isEditPanelOpen: true,
      editingTemplate: templateKey,
      tempEditValue: editValue,
    });
  };

  private handleSaveTemplate = async (): Promise<void> => {
    try {
      this.setState({ saving: true, saveMessage: undefined });

      const { editingTemplate, tempEditValue } = this.state;

      // Atualiza apenas o template sendo editado
      const updatedValues = {
        ...this.state.formValues,
        [editingTemplate]: tempEditValue,
      };

      const result: ISaveConfigurationResult =
        await this.configService.saveConfiguration(
          editingTemplate,
          tempEditValue
        );

      if (result.success) {
        this.setState({
          saving: false,
          formValues: updatedValues,
          isEditPanelOpen: false,
          editingTemplate: "",
          tempEditValue: "",
          saveMessage: "Template salvo com sucesso!",
          saveMessageType: MessageBarType.success,
        });

        // Recarrega os templates para atualizar a tela
        setTimeout(() => {
          this.loadTemplates().catch(console.error);
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
        saveMessage: `Erro ao salvar template: ${error.message}`,
        saveMessageType: MessageBarType.error,
      });
    }
  };

  private handleResetTemplate = (): void => {
    const { editingTemplate } = this.state;
    const templateDef = this.emailTemplateDefinitions[editingTemplate];

    if (templateDef) {
      this.setState({
        tempEditValue: templateDef.sampleData.body,
      });
    }
  };

  private getPreviewContent = (
    templateKey: string
  ): { subject: string; body: string; footer: string } => {
    const templateValue = this.state.formValues[templateKey] || "";
    const templateDef = this.emailTemplateDefinitions[templateKey];

    if (!templateDef) return { subject: "", body: templateValue, footer: "" };

    // Tenta extrair os valores do JSON do ConfigValue
    let actualSubject = templateDef.sampleData.subject;
    let actualBody = templateDef.sampleData.body;
    let actualFooter = templateDef.sampleData.footer;

    try {
      // Se o valor é um JSON válido, extrai subject, body e footer
      const parsed = JSON.parse(templateValue);
      if (parsed && typeof parsed === "object") {
        actualSubject = parsed.subject || actualSubject;
        actualBody = parsed.body || actualBody;
        actualFooter = parsed.footer || actualFooter;
      }
    } catch {
      // Se não for JSON válido, usa o valor como body e mantém subject/footer padrão
      if (templateValue.trim()) {
        actualBody = templateValue;
      }
    }

    // Se não há valor carregado ou está vazio, usa os templates padrão
    if (!templateValue || templateValue.trim() === "") {
      actualSubject = templateDef.sampleData.subject;
      actualBody = templateDef.sampleData.body;
      actualFooter = templateDef.sampleData.footer;
    }

    return {
      subject: actualSubject,
      body: actualBody,
      footer: actualFooter,
    };
  };

  private formatEmailPreview = (
    subject: string,
    body: string,
    footer: string
  ): JSX.Element => {
    // Processa texto para destacar variáveis e converter <br>
    const processText = (text: string): JSX.Element[] => {
      // Substitui <br> por quebras de linha
      const withLineBreaks = text.replace(/<br\s*\/?>/gi, "\n");

      // Divide o texto e processa variáveis
      const parts = withLineBreaks.split(/(\{[^}]+\})/g);

      return parts.map((part, index) => {
        // Se é uma variável (entre chaves)
        if (part.match(/^\{[^}]+\}$/)) {
          return (
            <span key={index} className={styles.emailVariable}>
              {part}
            </span>
          );
        }

        // Se é texto normal, converte quebras de linha em <br>
        return (
          <React.Fragment key={index}>
            {part.split("\n").map((line, lineIndex, arr) => (
              <React.Fragment key={lineIndex}>
                {line}
                {lineIndex < arr.length - 1 && <br />}
              </React.Fragment>
            ))}
          </React.Fragment>
        );
      });
    };

    return (
      <div className={styles.emailPreview}>
        {/* Seção do Assunto */}
        <div className={styles.emailSubject}>
          <strong>Assunto:</strong> {processText(subject)}
        </div>

        <Separator />

        {/* Seção do Corpo */}
        <div className={styles.emailBody}>{processText(body)}</div>

        <Separator />

        {/* Seção do Footer */}
        <div className={styles.emailFooter}>{processText(footer)}</div>
      </div>
    );
  };

  private renderTemplateCard = (
    template: IProcessedConfiguration
  ): JSX.Element => {
    const templateDef = this.emailTemplateDefinitions[template.key];

    if (!templateDef) return <div />;

    const previewData = this.getPreviewContent(template.key);

    return (
      <div key={template.key} className={styles.templateCard}>
        <div className={styles.templateHeader}>
          <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 12 }}>
            <div
              className={styles.templateIcon}
              style={{ backgroundColor: templateDef.color }}
            >
              <Icon iconName={templateDef.icon} />
            </div>
            <div className={styles.templateInfo}>
              <Text variant="large" className={styles.templateTitle}>
                📧 Template Email - {templateDef.title}
              </Text>
              <Text variant="small" className={styles.templateDescription}>
                {templateDef.description}
              </Text>
            </div>
            <ActionButton
              iconProps={{ iconName: "Edit" }}
              text="Editar"
              onClick={() => this.handleEdit(template.key)}
              className={styles.editButton}
            />
          </Stack>
        </div>

        <div className={styles.templateContent}>
          <div className={styles.previewContent}>
            <Text variant="small" className={styles.previewLabel}>
              <Icon iconName="View" /> Preview do Email:
            </Text>
            <div className={styles.previewText}>
              {this.formatEmailPreview(
                previewData.subject,
                previewData.body,
                previewData.footer
              )}
            </div>
          </div>

          <div className={styles.templateVariables}>
            <Text variant="small" className={styles.variablesTitle}>
              <Icon iconName="Info" /> Variáveis disponíveis:
            </Text>
            <div className={styles.variablesList}>
              {[
                "{nome}",
                "{empresa}",
                "{cnpj}",
                "{data_envio}",
                "{avaliador}",
                "{link}",
                "{prazo}",
                "{comentarios_avaliacao}",
                "{lista_restricoes}",
              ].map((variable) => (
                <span key={variable} className={styles.variable}>
                  {variable}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  public render(): React.ReactElement {
    const {
      loading,
      saving,
      error,
      saveMessage,
      saveMessageType,
      isEditPanelOpen,
      editingTemplate,
      tempEditValue,
    } = this.state;

    if (loading) {
      return (
        <div className={styles.emailTemplatesPage}>
          <div className={styles.loadingContainer}>
            <Spinner size={3} label="Carregando templates..." />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.emailTemplatesPage}>
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
                <Icon iconName="Mail" className={styles.headerIcon} />
                <Text variant="xLarge">📧 Templates de Email</Text>
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

    const editingTemplateData = editingTemplate
      ? this.emailTemplateDefinitions[editingTemplate]
      : null;

    return (
      <div className={styles.emailTemplatesPage}>
        {/* Header */}
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
              <Icon iconName="Mail" className={styles.headerIcon} />
              <Text variant="xLarge">📧 Templates de Email</Text>
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
            Visualize e edite os templates de email enviados automaticamente
            pelo sistema
          </Text>
        </div>

        {/* Mensagens */}
        {saveMessage && (
          <MessageBar
            messageBarType={saveMessageType}
            onDismiss={() => this.setState({ saveMessage: undefined })}
            className={styles.messageBar}
          >
            {saveMessage}
          </MessageBar>
        )}

        {/* Conteúdo Principal */}
        <div className={styles.content}>
          <Stack tokens={{ childrenGap: 24 }}>
            {this.state.templates.map((template) =>
              this.renderTemplateCard(template)
            )}
          </Stack>
        </div>

        {/* Panel de Edição */}
        <Panel
          headerText={`Editar: ${editingTemplateData?.title || ""}`}
          isOpen={isEditPanelOpen}
          type={PanelType.large}
          onDismiss={() => this.setState({ isEditPanelOpen: false })}
          closeButtonAriaLabel="Fechar"
        >
          <div className={styles.editPanel}>
            <div className={styles.editHeader}>
              <Icon iconName="Edit" className={styles.editIcon} />
              <div>
                <Text variant="large">
                  📧 Template Email - {editingTemplateData?.title}
                </Text>
                <Text variant="small">{editingTemplateData?.description}</Text>
              </div>
            </div>

            <Separator />

            <div className={styles.editContent}>
              <TextField
                label="Conteúdo do Template"
                multiline
                rows={20}
                value={tempEditValue}
                onChange={(_, value) =>
                  this.setState({ tempEditValue: value || "" })
                }
                placeholder={editingTemplateData?.sampleData.body}
                className={styles.editTextArea}
              />

              <div className={styles.templateVariables}>
                <Text variant="small" className={styles.variablesTitle}>
                  <Icon iconName="Info" /> Variáveis disponíveis:
                </Text>
                <div className={styles.variablesList}>
                  {[
                    "{nome}",
                    "{empresa}",
                    "{cnpj}",
                    "{data_envio}",
                    "{data_avaliacao}",
                    "{data_aprovacao}",
                    "{avaliador}",
                    "{dias}",
                    "{prazo}",
                    "{prazo_restante}",
                    "{prazo_resposta}",
                    "{comentarios_avaliacao}",
                    "{link}",
                    "{lista_restricoes}",
                  ].map((variable) => (
                    <span key={variable} className={styles.variable}>
                      {variable}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer customizado */}
            <div className={styles.editFooter}>
              <DefaultButton
                text="Resetar"
                iconProps={{ iconName: "Undo" }}
                onClick={this.handleResetTemplate}
                disabled={saving}
              />
              <DefaultButton
                text={saving ? "Salvando..." : "Salvar Template"}
                iconProps={{ iconName: saving ? undefined : "Save" }}
                onClick={this.handleSaveTemplate}
                disabled={saving}
                primary={true}
              />
            </div>
          </div>
        </Panel>
      </div>
    );
  }
}
