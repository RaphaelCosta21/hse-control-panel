import * as React from "react";
import {
  Stack,
  Text,
  PrimaryButton,
  DefaultButton,
  CommandBar,
  ICommandBarItemProps,
  Dialog,
  DialogType,
  DialogFooter,
  TextField,
  Dropdown,
  IDropdownOption,
  Toggle,
  MessageBar,
  MessageBarType,
  Spinner,
  Persona,
  PersonaSize,
  PersonaPresence,
} from "@fluentui/react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { PeoplePicker } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { LivePersona } from "@pnp/spfx-controls-react/lib/LivePersona";
import styles from "../SettingsPage.module.scss";
import { MembersService } from "../../../services/MembersService";
import { ITeamMember, IMembersData } from "../../../types/IMember";

export interface IMembersManagementProps {
  context: WebPartContext;
  onBack: () => void;
}

interface IMembersManagementState {
  membersData: IMembersData;
  loading: boolean;
  showAddDialog: boolean;
  showEditDialog: boolean;
  selectedMember: ITeamMember | undefined;
  newMember: Partial<ITeamMember>;
  message: string;
  messageType: MessageBarType;
  saving: boolean;
}

export class MembersManagement extends React.Component<
  IMembersManagementProps,
  IMembersManagementState
> {
  private membersService: MembersService;

  constructor(props: IMembersManagementProps) {
    super(props);

    this.membersService = new MembersService(props.context);

    this.state = {
      membersData: { hseMembers: [], comprasMembers: [], outrosMembers: [] },
      loading: true,
      showAddDialog: false,
      showEditDialog: false,
      selectedMember: undefined,
      newMember: { team: "HSE", isActive: true },
      message: "",
      messageType: MessageBarType.info,
      saving: false,
    };
  }

  public componentDidMount(): void {
    this.loadMembers().catch(console.error);
  }

  private async loadMembers(): Promise<void> {
    this.setState({ loading: true });
    try {
      const membersData = await this.membersService.getTeamMembers();
      this.setState({ membersData, loading: false });
    } catch (error) {
      console.error("Erro ao carregar membros:", error);
      this.setState({
        loading: false,
        message: "Erro ao carregar membros da equipe",
        messageType: MessageBarType.error,
      });
    }
  }

  private getCommandBarItems(): ICommandBarItemProps[] {
    return [
      {
        key: "addMember",
        text: "Adicionar Membro",
        iconProps: { iconName: "AddFriend" },
        onClick: () => this.setState({ showAddDialog: true }),
      },
      {
        key: "refresh",
        text: "Atualizar",
        iconProps: { iconName: "Refresh" },
        onClick: () => this.loadMembers(),
      },
    ];
  }

  private teamOptions: IDropdownOption[] = [
    { key: "HSE", text: "HSE" },
    { key: "Compras", text: "Compras" },
    { key: "Outros", text: "Outros" },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private onPeoplePickerChange = async (items: any[]): Promise<void> => {
    if (items && items.length > 0) {
      const selectedPerson = items[0];
      console.log("Selected person data:", selectedPerson);

      // Primeiro, define valores básicos
      const basicInfo = {
        name: selectedPerson.text || selectedPerson.displayName || "",
        email:
          selectedPerson.secondaryText ||
          selectedPerson.email ||
          selectedPerson.loginName ||
          "",
        role:
          selectedPerson.tertiaryText ||
          selectedPerson.jobTitle ||
          selectedPerson.optionalText ||
          "",
      };

      // Tenta buscar informações mais detalhadas via Microsoft Graph API
      if (selectedPerson.id || selectedPerson.loginName || basicInfo.email) {
        try {
          const graphClient =
            await this.props.context.msGraphClientFactory.getClient("3");
          let userQuery = "";

          // Prioriza ID, depois loginName, depois email
          if (selectedPerson.id) {
            userQuery = selectedPerson.id;
          } else if (selectedPerson.loginName) {
            userQuery = selectedPerson.loginName;
          } else {
            userQuery = basicInfo.email;
          }

          const user = await graphClient.api(`/users/${userQuery}`).get();
          console.log("User data from Graph API:", user);

          // Atualiza com informações mais completas do Graph API
          if (user.displayName) basicInfo.name = user.displayName;
          if (user.mail || user.userPrincipalName)
            basicInfo.email = user.mail || user.userPrincipalName;
          if (user.jobTitle) basicInfo.role = user.jobTitle;
        } catch (error) {
          console.warn("Erro ao buscar dados via Graph API:", error);
          // Se falhar com ID/loginName, tenta buscar pelo email
          if (
            basicInfo.email &&
            basicInfo.email !== (selectedPerson.id || selectedPerson.loginName)
          ) {
            try {
              const graphClient =
                await this.props.context.msGraphClientFactory.getClient("3");
              const users = await graphClient
                .api(
                  `/users?$filter=mail eq '${basicInfo.email}' or userPrincipalName eq '${basicInfo.email}'`
                )
                .get();

              if (users.value && users.value.length > 0) {
                const user = users.value[0];
                console.log("User data from Graph API (by email):", user);

                if (user.displayName) basicInfo.name = user.displayName;
                if (user.jobTitle) basicInfo.role = user.jobTitle;
              }
            } catch (emailError) {
              console.warn(
                "Erro ao buscar dados via Graph API por email:",
                emailError
              );
            }
          }
        }
      }

      this.setState({
        newMember: {
          ...this.state.newMember,
          ...basicInfo,
          role: basicInfo.role || "Cargo não informado",
        },
      });
    } else {
      this.setState({
        newMember: {
          ...this.state.newMember,
          name: "",
          email: "",
          role: "",
        },
      });
    }
  };

  private async handleAddMember(): Promise<void> {
    const { newMember } = this.state;

    if (!newMember.name || !newMember.email) {
      this.setState({
        message: "Por favor, preencha todos os campos obrigatórios",
        messageType: MessageBarType.error,
      });
      return;
    }

    this.setState({ saving: true });

    try {
      const success = await this.membersService.addTeamMember(
        newMember as Omit<ITeamMember, "id" | "photoUrl">
      );

      if (success) {
        this.setState({
          message: "Membro adicionado com sucesso!",
          messageType: MessageBarType.success,
          showAddDialog: false,
          newMember: { team: "HSE", isActive: true },
        });
        await this.loadMembers();
      } else {
        throw new Error("Falha ao adicionar membro");
      }
    } catch (error) {
      console.error("Erro ao adicionar membro:", error);
      this.setState({
        message: "Erro ao adicionar membro",
        messageType: MessageBarType.error,
      });
    }

    this.setState({ saving: false });
  }

  private async handleEditMember(): Promise<void> {
    const { selectedMember } = this.state;

    if (!selectedMember) return;

    this.setState({ saving: true });

    try {
      const success = await this.membersService.updateTeamMember(
        selectedMember.id,
        selectedMember
      );

      if (success) {
        this.setState({
          message: "Membro atualizado com sucesso!",
          messageType: MessageBarType.success,
          showEditDialog: false,
          selectedMember: undefined,
        });
        await this.loadMembers();
      } else {
        throw new Error("Falha ao atualizar membro");
      }
    } catch (error) {
      console.error("Erro ao atualizar membro:", error);
      this.setState({
        message: "Erro ao atualizar membro",
        messageType: MessageBarType.error,
      });
    }

    this.setState({ saving: false });
  }

  private async handleRemoveMember(member: ITeamMember): Promise<void> {
    if (!confirm(`Tem certeza que deseja remover ${member.name} da equipe?`)) {
      return;
    }

    try {
      const success = await this.membersService.removeTeamMember(member.id);

      if (success) {
        this.setState({
          message: "Membro removido com sucesso!",
          messageType: MessageBarType.success,
        });
        await this.loadMembers();
      } else {
        throw new Error("Falha ao remover membro");
      }
    } catch (error) {
      console.error("Erro ao remover membro:", error);
      this.setState({
        message: "Erro ao remover membro",
        messageType: MessageBarType.error,
      });
    }
  }

  public render(): React.ReactElement<IMembersManagementProps> {
    const {
      membersData,
      loading,
      showAddDialog,
      showEditDialog,
      selectedMember,
      newMember,
      message,
      messageType,
      saving,
    } = this.state;

    if (loading) {
      return (
        <Stack
          horizontalAlign="center"
          verticalAlign="center"
          styles={{ root: { height: "400px" } }}
        >
          <Spinner size={3} label="Carregando membros da equipe..." />
        </Stack>
      );
    }

    return (
      <div className={styles.settingsContainer}>
        <Stack tokens={{ childrenGap: 20 }}>
          {/* Header */}
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
              <DefaultButton
                iconProps={{ iconName: "Back" }}
                onClick={this.props.onBack}
                ariaLabel="Voltar"
              />
              <Text variant="xLarge" styles={{ root: { fontWeight: "600" } }}>
                👥 Gerenciar Membros das Equipes
              </Text>
            </Stack>
          </Stack>

          {/* Message Bar */}
          {message && (
            <MessageBar
              messageBarType={messageType}
              isMultiline={false}
              onDismiss={() => this.setState({ message: "" })}
            >
              {message}
            </MessageBar>
          )}

          {/* Command Bar */}
          <CommandBar items={this.getCommandBarItems()} />

          {/* Statistics */}
          <Stack horizontal tokens={{ childrenGap: 20 }}>
            <div
              style={{
                padding: "20px",
                borderRadius: "12px",
                backgroundColor: "white",
                border: "2px solid #e3f2fd",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                minWidth: "160px",
                textAlign: "center",
              }}
            >
              <Text
                variant="large"
                styles={{
                  root: {
                    fontWeight: "700",
                    color: "#1976d2",
                    marginBottom: "8px",
                    display: "block",
                  },
                }}
              >
                {membersData.hseMembers.length}
              </Text>
              <Text
                variant="medium"
                styles={{
                  root: {
                    fontWeight: "600",
                    color: "#1976d2",
                    marginBottom: "4px",
                    display: "block",
                  },
                }}
              >
                Equipe HSE
              </Text>
              <Text
                variant="small"
                styles={{
                  root: {
                    color: "#666",
                    fontWeight: "500",
                  },
                }}
              >
                {membersData.hseMembers.filter((m) => m.isActive).length} ativos
              </Text>
            </div>

            <div
              style={{
                padding: "20px",
                borderRadius: "12px",
                backgroundColor: "white",
                border: "2px solid #f3e5f5",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                minWidth: "160px",
                textAlign: "center",
              }}
            >
              <Text
                variant="large"
                styles={{
                  root: {
                    fontWeight: "700",
                    color: "#7b1fa2",
                    marginBottom: "8px",
                    display: "block",
                  },
                }}
              >
                {membersData.comprasMembers.length}
              </Text>
              <Text
                variant="medium"
                styles={{
                  root: {
                    fontWeight: "600",
                    color: "#7b1fa2",
                    marginBottom: "4px",
                    display: "block",
                  },
                }}
              >
                Equipe Compras
              </Text>
              <Text
                variant="small"
                styles={{
                  root: {
                    color: "#666",
                    fontWeight: "500",
                  },
                }}
              >
                {membersData.comprasMembers.filter((m) => m.isActive).length}{" "}
                ativos
              </Text>
            </div>

            <div
              style={{
                padding: "20px",
                borderRadius: "12px",
                backgroundColor: "white",
                border: "2px solid #ede7f6",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                minWidth: "160px",
                textAlign: "center",
              }}
            >
              <Text
                variant="large"
                styles={{
                  root: {
                    fontWeight: "700",
                    color: "#6a1b9a",
                    marginBottom: "8px",
                    display: "block",
                  },
                }}
              >
                {membersData.outrosMembers.length}
              </Text>
              <Text
                variant="medium"
                styles={{
                  root: {
                    fontWeight: "600",
                    color: "#6a1b9a",
                    marginBottom: "4px",
                    display: "block",
                  },
                }}
              >
                Outros
              </Text>
              <Text
                variant="small"
                styles={{
                  root: {
                    color: "#666",
                    fontWeight: "500",
                  },
                }}
              >
                {membersData.outrosMembers.filter((m) => m.isActive).length}{" "}
                ativos
              </Text>
            </div>
          </Stack>

          {/* Members by Team */}
          <Stack tokens={{ childrenGap: 30 }}>
            {/* HSE Team */}
            {membersData.hseMembers.length > 0 && (
              <Stack tokens={{ childrenGap: 15 }}>
                <Text
                  variant="large"
                  styles={{
                    root: { fontWeight: "600", color: "var(--primary-color)" },
                  }}
                >
                  🛡️ Equipe HSE ({membersData.hseMembers.length})
                </Text>
                <Stack horizontal wrap tokens={{ childrenGap: 15 }}>
                  {membersData.hseMembers.map((member) => (
                    <div
                      key={member.id}
                      onClick={() =>
                        this.setState({
                          selectedMember: member,
                          showEditDialog: true,
                        })
                      }
                      style={{
                        cursor: "pointer",
                        border: "1px solid #e1f5fe",
                        borderRadius: "8px",
                        padding: "16px",
                        backgroundColor: "white",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        minWidth: "280px",
                        maxWidth: "420px",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(0,0,0,0.15)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 2px 4px rgba(0,0,0,0.1)";
                        e.currentTarget.style.transform = "translateY(0px)";
                      }}
                    >
                      <Stack tokens={{ childrenGap: 8 }}>
                        <Stack
                          horizontal
                          verticalAlign="center"
                          tokens={{ childrenGap: 12 }}
                        >
                          <Persona
                            imageUrl={member.photoUrl}
                            text={member.name}
                            size={PersonaSize.size40}
                            presence={
                              member.isActive
                                ? PersonaPresence.online
                                : PersonaPresence.offline
                            }
                          />
                          <Stack>
                            <Text
                              variant="medium"
                              styles={{ root: { fontWeight: "600" } }}
                            >
                              {member.name}
                            </Text>
                            <Text
                              variant="small"
                              styles={{ root: { color: "#666" } }}
                            >
                              {member.email}
                            </Text>
                            <Text
                              variant="small"
                              styles={{
                                root: {
                                  color: "#1976d2",
                                  fontWeight: "600",
                                  marginTop: "2px",
                                },
                              }}
                            >
                              {member.role || "Cargo não informado"}
                            </Text>
                          </Stack>
                        </Stack>
                        <Stack
                          horizontal
                          horizontalAlign="space-between"
                          verticalAlign="center"
                        >
                          <Text
                            variant="small"
                            styles={{
                              root: {
                                padding: "4px 8px",
                                borderRadius: "12px",
                                backgroundColor: "#e1f5fe",
                                color: "#01579b",
                                fontSize: "11px",
                                fontWeight: "500",
                              },
                            }}
                          >
                            HSE
                          </Text>
                          <Text
                            variant="small"
                            styles={{
                              root: {
                                color: member.isActive ? "#4caf50" : "#ff9800",
                                fontWeight: "500",
                              },
                            }}
                          >
                            {member.isActive ? "Ativo" : "Inativo"}
                          </Text>
                        </Stack>
                      </Stack>
                    </div>
                  ))}
                </Stack>
              </Stack>
            )}

            {/* Compras Team */}
            {membersData.comprasMembers.length > 0 && (
              <Stack tokens={{ childrenGap: 15 }}>
                <Text
                  variant="large"
                  styles={{
                    root: {
                      fontWeight: "600",
                      color: "var(--secondary-color)",
                    },
                  }}
                >
                  🛒 Equipe Compras ({membersData.comprasMembers.length})
                </Text>
                <Stack horizontal wrap tokens={{ childrenGap: 15 }}>
                  {membersData.comprasMembers.map((member) => (
                    <div
                      key={member.id}
                      onClick={() =>
                        this.setState({
                          selectedMember: member,
                          showEditDialog: true,
                        })
                      }
                      style={{
                        cursor: "pointer",
                        border: "1px solid #f3e5f5",
                        borderRadius: "8px",
                        padding: "16px",
                        backgroundColor: "white",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        minWidth: "280px",
                        maxWidth: "420px",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(0,0,0,0.15)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 2px 4px rgba(0,0,0,0.1)";
                        e.currentTarget.style.transform = "translateY(0px)";
                      }}
                    >
                      <Stack tokens={{ childrenGap: 8 }}>
                        <Stack
                          horizontal
                          verticalAlign="center"
                          tokens={{ childrenGap: 12 }}
                        >
                          <Persona
                            imageUrl={member.photoUrl}
                            text={member.name}
                            size={PersonaSize.size40}
                            presence={
                              member.isActive
                                ? PersonaPresence.online
                                : PersonaPresence.offline
                            }
                          />
                          <Stack>
                            <Text
                              variant="medium"
                              styles={{ root: { fontWeight: "600" } }}
                            >
                              {member.name}
                            </Text>
                            <Text
                              variant="small"
                              styles={{ root: { color: "#666" } }}
                            >
                              {member.email}
                            </Text>
                            <Text
                              variant="small"
                              styles={{
                                root: {
                                  color: "#7b1fa2",
                                  fontWeight: "600",
                                  marginTop: "2px",
                                },
                              }}
                            >
                              {member.role || "Cargo não informado"}
                            </Text>
                          </Stack>
                        </Stack>
                        <Stack
                          horizontal
                          horizontalAlign="space-between"
                          verticalAlign="center"
                        >
                          <Text
                            variant="small"
                            styles={{
                              root: {
                                padding: "4px 8px",
                                borderRadius: "12px",
                                backgroundColor: "#f3e5f5",
                                color: "#4a148c",
                                fontSize: "11px",
                                fontWeight: "500",
                              },
                            }}
                          >
                            Compras
                          </Text>
                          <Text
                            variant="small"
                            styles={{
                              root: {
                                color: member.isActive ? "#4caf50" : "#ff9800",
                                fontWeight: "500",
                              },
                            }}
                          >
                            {member.isActive ? "Ativo" : "Inativo"}
                          </Text>
                        </Stack>
                      </Stack>
                    </div>
                  ))}
                </Stack>
              </Stack>
            )}

            {/* Outros Team */}
            {membersData.outrosMembers.length > 0 && (
              <Stack tokens={{ childrenGap: 15 }}>
                <Text
                  variant="large"
                  styles={{ root: { fontWeight: "600", color: "#6B46C1" } }}
                >
                  👥 Outros ({membersData.outrosMembers.length})
                </Text>
                <Stack horizontal wrap tokens={{ childrenGap: 15 }}>
                  {membersData.outrosMembers.map((member) => (
                    <div
                      key={member.id}
                      onClick={() =>
                        this.setState({
                          selectedMember: member,
                          showEditDialog: true,
                        })
                      }
                      style={{
                        cursor: "pointer",
                        border: "1px solid #ede9fe",
                        borderRadius: "8px",
                        padding: "16px",
                        backgroundColor: "white",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        minWidth: "280px",
                        maxWidth: "420px",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(0,0,0,0.15)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 2px 4px rgba(0,0,0,0.1)";
                        e.currentTarget.style.transform = "translateY(0px)";
                      }}
                    >
                      <Stack tokens={{ childrenGap: 8 }}>
                        <Stack
                          horizontal
                          verticalAlign="center"
                          tokens={{ childrenGap: 12 }}
                        >
                          <Persona
                            imageUrl={member.photoUrl}
                            text={member.name}
                            size={PersonaSize.size40}
                            presence={
                              member.isActive
                                ? PersonaPresence.online
                                : PersonaPresence.offline
                            }
                          />
                          <Stack>
                            <Text
                              variant="medium"
                              styles={{ root: { fontWeight: "600" } }}
                            >
                              {member.name}
                            </Text>
                            <Text
                              variant="small"
                              styles={{ root: { color: "#666" } }}
                            >
                              {member.email}
                            </Text>
                            <Text
                              variant="small"
                              styles={{
                                root: {
                                  color: "#6a1b9a",
                                  fontWeight: "600",
                                  marginTop: "2px",
                                },
                              }}
                            >
                              {member.role || "Cargo não informado"}
                            </Text>
                          </Stack>
                        </Stack>
                        <Stack
                          horizontal
                          horizontalAlign="space-between"
                          verticalAlign="center"
                        >
                          <Text
                            variant="small"
                            styles={{
                              root: {
                                padding: "4px 8px",
                                borderRadius: "12px",
                                backgroundColor: "#ede9fe",
                                color: "#6B46C1",
                                fontSize: "11px",
                                fontWeight: "500",
                              },
                            }}
                          >
                            Outros
                          </Text>
                          <Text
                            variant="small"
                            styles={{
                              root: {
                                color: member.isActive ? "#4caf50" : "#ff9800",
                                fontWeight: "500",
                              },
                            }}
                          >
                            {member.isActive ? "Ativo" : "Inativo"}
                          </Text>
                        </Stack>
                      </Stack>
                    </div>
                  ))}
                </Stack>
              </Stack>
            )}

            {/* Empty State */}
            {membersData.hseMembers.length === 0 &&
              membersData.comprasMembers.length === 0 &&
              membersData.outrosMembers.length === 0 && (
                <Stack
                  horizontalAlign="center"
                  verticalAlign="center"
                  tokens={{ childrenGap: 16 }}
                  styles={{
                    root: {
                      padding: "40px",
                      textAlign: "center",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "8px",
                      border: "1px dashed #dee2e6",
                    },
                  }}
                >
                  <Text
                    variant="xLarge"
                    styles={{ root: { color: "#6c757d" } }}
                  >
                    👥
                  </Text>
                  <Text
                    variant="large"
                    styles={{ root: { fontWeight: "600", color: "#495057" } }}
                  >
                    Nenhum membro cadastrado
                  </Text>
                  <Text
                    variant="medium"
                    styles={{ root: { color: "#6c757d" } }}
                  >
                    Clique em &quot;Adicionar Membro&quot; para começar a
                    gerenciar as equipes
                  </Text>
                </Stack>
              )}
          </Stack>

          {/* Add Member Dialog */}
          <Dialog
            hidden={!showAddDialog}
            onDismiss={() => this.setState({ showAddDialog: false })}
            dialogContentProps={{
              type: DialogType.normal,
              title: "➕ Adicionar Novo Membro",
              subText: "Adicione um novo membro à equipe HSE ou Compras",
            }}
            minWidth={500}
          >
            <Stack tokens={{ childrenGap: 15 }}>
              {/* PeoplePicker */}
              <Stack>
                <Text
                  variant="medium"
                  styles={{ root: { fontWeight: "600", marginBottom: "8px" } }}
                >
                  👤 Selecionar Pessoa *
                </Text>
                <PeoplePicker
                  context={{
                    absoluteUrl: this.props.context.pageContext.web.absoluteUrl,
                    msGraphClientFactory:
                      this.props.context.msGraphClientFactory,
                    spHttpClient: this.props.context.spHttpClient,
                  }}
                  titleText=""
                  personSelectionLimit={1}
                  groupName={""}
                  showtooltip={true}
                  required={true}
                  disabled={false}
                  onChange={this.onPeoplePickerChange}
                  showHiddenInUI={false}
                  principalTypes={[1, 2]}
                  resolveDelay={1000}
                  placeholder="Digite o nome da pessoa para buscar..."
                  ensureUser={true}
                  suggestionsLimit={10}
                />

                {/* Prévia das informações capturadas */}
                {newMember.name && (
                  <Stack
                    styles={{
                      root: {
                        marginTop: "12px",
                        padding: "16px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                        border: "1px solid #e9ecef",
                      },
                    }}
                    tokens={{ childrenGap: 12 }}
                  >
                    <Text
                      variant="small"
                      styles={{ root: { fontWeight: "600", color: "#495057" } }}
                    >
                      📋 Informações detectadas:
                    </Text>

                    {/* LivePersona para mostrar informações completas - oculto mas funcional */}
                    {newMember.email && (
                      <div style={{ display: "none" }}>
                        <LivePersona
                          upn={newMember.email}
                          template={"<div>{{displayName}} - {{jobTitle}}</div>"}
                          serviceScope={this.props.context.serviceScope}
                        />
                      </div>
                    )}

                    <Stack tokens={{ childrenGap: 8 }}>
                      <Text variant="small">
                        <span style={{ fontWeight: "500" }}>👤 Nome:</span>{" "}
                        {newMember.name}
                      </Text>
                      <Text variant="small">
                        <span style={{ fontWeight: "500" }}>📧 Email:</span>{" "}
                        {newMember.email}
                      </Text>
                      <Text variant="small">
                        <span style={{ fontWeight: "500" }}>💼 Cargo:</span>{" "}
                        <span
                          style={{
                            color:
                              newMember.role === "Cargo não informado"
                                ? "#dc3545"
                                : "#28a745",
                            fontWeight: "600",
                          }}
                        >
                          {newMember.role}
                        </span>
                      </Text>
                    </Stack>
                  </Stack>
                )}
              </Stack>

              <Dropdown
                label="Equipe *"
                options={this.teamOptions}
                selectedKey={newMember.team}
                onChange={(_, option) =>
                  this.setState({
                    newMember: {
                      ...newMember,
                      team: option?.key as "HSE" | "Compras" | "Outros",
                    },
                  })
                }
                required
              />
            </Stack>

            <DialogFooter>
              <PrimaryButton
                onClick={() => this.handleAddMember()}
                text="Adicionar"
                disabled={saving}
              />
              <DefaultButton
                onClick={() => this.setState({ showAddDialog: false })}
                text="Cancelar"
                disabled={saving}
              />
            </DialogFooter>
          </Dialog>

          {/* Edit Member Dialog */}
          <Dialog
            hidden={!showEditDialog}
            onDismiss={() => this.setState({ showEditDialog: false })}
            dialogContentProps={{
              type: DialogType.normal,
              title: "✏️ Editar Membro",
              subText: selectedMember
                ? `Editando informações de ${selectedMember.name}`
                : "",
            }}
            minWidth={500}
          >
            {selectedMember && (
              <Stack tokens={{ childrenGap: 15 }}>
                <TextField
                  label="Nome"
                  value={selectedMember.name}
                  disabled
                  styles={{
                    root: { opacity: 0.7 },
                  }}
                />

                <TextField
                  label="Email"
                  value={selectedMember.email}
                  disabled
                  styles={{
                    root: { opacity: 0.7 },
                  }}
                />

                <TextField
                  label="Cargo"
                  value={selectedMember.role}
                  disabled
                  styles={{
                    root: { opacity: 0.7 },
                  }}
                />

                <Dropdown
                  label="Equipe *"
                  options={this.teamOptions}
                  selectedKey={selectedMember.team}
                  onChange={(_, option) =>
                    this.setState({
                      selectedMember: {
                        ...selectedMember,
                        team: option?.key as "HSE" | "Compras" | "Outros",
                      },
                    })
                  }
                  required
                />

                <Toggle
                  label="Membro ativo"
                  checked={selectedMember.isActive}
                  onChange={(_, checked) =>
                    this.setState({
                      selectedMember: {
                        ...selectedMember,
                        isActive: !!checked,
                      },
                    })
                  }
                />

                <Stack horizontal horizontalAlign="space-between">
                  <DefaultButton
                    text="🗑️ Remover Membro"
                    onClick={async () => {
                      this.setState({ showEditDialog: false });
                      await this.handleRemoveMember(selectedMember);
                    }}
                    styles={{
                      root: { color: "var(--error-color)" },
                      rootHovered: {
                        backgroundColor: "var(--error-background)",
                      },
                    }}
                  />
                </Stack>
              </Stack>
            )}

            <DialogFooter>
              <PrimaryButton
                onClick={() => this.handleEditMember()}
                text="Salvar"
                disabled={saving}
              />
              <DefaultButton
                onClick={() => this.setState({ showEditDialog: false })}
                text="Cancelar"
                disabled={saving}
              />
            </DialogFooter>
          </Dialog>
        </Stack>
      </div>
    );
  }
}
