import * as React from "react";
import {
  Stack,
  Text,
  PrimaryButton,
  DefaultButton,
  DetailsList,
  IColumn,
  SelectionMode,
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
  SearchBox,
  List,
  FocusZone,
  FocusZoneDirection,
} from "@fluentui/react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import styles from "../SettingsPage.module.scss";
import { MembersService } from "../../../services/MembersService";
import {
  ITeamMember,
  IMembersData,
  ISharePointUser,
} from "../../../types/IMember";

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

  // Estados para busca de pessoas
  userSearchText: string;
  searchResults: ISharePointUser[];
  selectedUser: ISharePointUser | undefined;
  showUserPicker: boolean;
  searchingUsers: boolean;
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
      membersData: { hseMembers: [], comprasMembers: [] },
      loading: true,
      showAddDialog: false,
      showEditDialog: false,
      selectedMember: undefined,
      newMember: { team: "HSE", isActive: true },
      message: "",
      messageType: MessageBarType.info,
      saving: false,

      // Estados para busca de pessoas
      userSearchText: "",
      searchResults: [],
      selectedUser: undefined,
      showUserPicker: false,
      searchingUsers: false,
    };
  }

  public componentDidMount(): void {
    this.loadMembers();
  }

  private async loadMembers(): Promise<void> {
    this.setState({ loading: true });
    try {
      const membersData = await this.membersService.getTeamMembers();
      this.setState({ membersData, loading: false });
    } catch (error) {
      this.setState({
        loading: false,
        message: "Erro ao carregar membros da equipe",
        messageType: MessageBarType.error,
      });
    }
  }

  private getColumns(): IColumn[] {
    return [
      {
        key: "photo",
        name: "",
        fieldName: "photo",
        minWidth: 60,
        maxWidth: 60,
        onRender: (item: ITeamMember) => (
          <Persona
            imageUrl={item.photoUrl}
            text={item.name}
            size={PersonaSize.size32}
            presence={
              item.isActive ? PersonaPresence.online : PersonaPresence.offline
            }
          />
        ),
      },
      {
        key: "name",
        name: "Nome",
        fieldName: "name",
        minWidth: 150,
        maxWidth: 200,
        isResizable: true,
      },
      {
        key: "email",
        name: "Email",
        fieldName: "email",
        minWidth: 200,
        maxWidth: 250,
        isResizable: true,
      },
      {
        key: "role",
        name: "Cargo",
        fieldName: "role",
        minWidth: 120,
        maxWidth: 150,
        isResizable: true,
      },
      {
        key: "team",
        name: "Equipe",
        fieldName: "team",
        minWidth: 80,
        maxWidth: 100,
        onRender: (item: ITeamMember) => (
          <Text
            styles={{
              root: {
                padding: "4px 8px",
                borderRadius: "12px",
                backgroundColor: item.team === "HSE" ? "#e1f5fe" : "#f3e5f5",
                color: item.team === "HSE" ? "#01579b" : "#4a148c",
                fontSize: "12px",
                fontWeight: "500",
              },
            }}
          >
            {item.team}
          </Text>
        ),
      },
      {
        key: "status",
        name: "Status",
        fieldName: "isActive",
        minWidth: 80,
        maxWidth: 100,
        onRender: (item: ITeamMember) => (
          <Text
            styles={{
              root: {
                color: item.isActive
                  ? "var(--success-color)"
                  : "var(--warning-color)",
                fontWeight: "500",
              },
            }}
          >
            {item.isActive ? "Ativo" : "Inativo"}
          </Text>
        ),
      },
    ];
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
  ];

  private async handleSearchUsers(searchText: string): Promise<void> {
    if (!searchText || searchText.length < 2) {
      this.setState({ searchResults: [], showUserPicker: false });
      return;
    }

    this.setState({ searchingUsers: true, userSearchText: searchText });

    try {
      const users = await this.membersService.searchUsers(searchText);
      this.setState({
        searchResults: users,
        showUserPicker: users.length > 0,
        searchingUsers: false,
      });
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      this.setState({
        searchingUsers: false,
        searchResults: [],
        showUserPicker: false,
      });
    }
  }

  private handleSelectUser(user: ISharePointUser): void {
    this.setState({
      selectedUser: user,
      userSearchText: user.displayName,
      showUserPicker: false,
      newMember: {
        ...this.state.newMember,
        name: user.displayName,
        email: user.email,
        role: user.jobTitle || "",
      },
    });
  }

  private async handleAddMember(): Promise<void> {
    const { newMember } = this.state;

    if (!newMember.name || !newMember.email || !newMember.role) {
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
      userSearchText,
      searchResults,
      selectedUser,
      showUserPicker,
      searchingUsers,
    } = this.state;

    const allMembers = [
      ...membersData.hseMembers,
      ...membersData.comprasMembers,
    ];

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
            <div className={styles.statsCard}>
              <Text
                variant="medium"
                styles={{
                  root: { fontWeight: "600", color: "var(--primary-color)" },
                }}
              >
                Equipe HSE
              </Text>
              <Text variant="xLarge" styles={{ root: { fontWeight: "700" } }}>
                {membersData.hseMembers.length}
              </Text>
              <Text variant="small">
                {membersData.hseMembers.filter((m) => m.isActive).length} ativos
              </Text>
            </div>

            <div className={styles.statsCard}>
              <Text
                variant="medium"
                styles={{
                  root: { fontWeight: "600", color: "var(--secondary-color)" },
                }}
              >
                Equipe Compras
              </Text>
              <Text variant="xLarge" styles={{ root: { fontWeight: "700" } }}>
                {membersData.comprasMembers.length}
              </Text>
              <Text variant="small">
                {membersData.comprasMembers.filter((m) => m.isActive).length}{" "}
                ativos
              </Text>
            </div>
          </Stack>

          {/* Members List */}
          <DetailsList
            items={allMembers}
            columns={this.getColumns()}
            selectionMode={SelectionMode.single}
            onItemInvoked={(item) =>
              this.setState({ selectedMember: item, showEditDialog: true })
            }
            onRenderRow={(props) => {
              if (props) {
                return (
                  <div
                    {...props}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      this.handleRemoveMember(props.item);
                    }}
                  />
                );
              }
              return null;
            }}
          />

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
              {/* Seletor de Pessoas */}
              <Stack>
                <Text
                  variant="medium"
                  styles={{ root: { fontWeight: "600", marginBottom: "8px" } }}
                >
                  👤 Selecionar Pessoa *
                </Text>
                <SearchBox
                  placeholder="Digite o nome da pessoa para buscar..."
                  value={userSearchText}
                  onChange={(_, value) => {
                    this.setState({ userSearchText: value || "" });
                    if (value && value.length >= 2) {
                      this.handleSearchUsers(value).catch(console.error);
                    } else {
                      this.setState({
                        showUserPicker: false,
                        searchResults: [],
                      });
                    }
                  }}
                  onSearch={(value) =>
                    this.handleSearchUsers(value).catch(console.error)
                  }
                />

                {/* Lista de resultados da busca */}
                {showUserPicker && searchResults.length > 0 && (
                  <Stack
                    styles={{
                      root: {
                        border: "1px solid var(--neutral-lighter)",
                        borderRadius: "4px",
                        maxHeight: "200px",
                        overflowY: "auto",
                        backgroundColor: "white",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    {searchResults.map((user, index) => (
                      <Stack
                        key={index}
                        horizontal
                        verticalAlign="center"
                        tokens={{ childrenGap: 12 }}
                        styles={{
                          root: {
                            padding: "8px 12px",
                            cursor: "pointer",
                            ":hover": {
                              backgroundColor: "var(--neutral-lighter-alt)",
                            },
                          },
                        }}
                        onClick={() => this.handleSelectUser(user)}
                      >
                        <Persona
                          text={user.displayName}
                          secondaryText={user.email}
                          tertiaryText={user.jobTitle}
                          size={PersonaSize.size32}
                          imageUrl={user.photoUrl}
                        />
                      </Stack>
                    ))}
                  </Stack>
                )}

                {searchingUsers && (
                  <Stack
                    horizontal
                    verticalAlign="center"
                    tokens={{ childrenGap: 8 }}
                  >
                    <Spinner size={0} />
                    <Text variant="small">Buscando pessoas...</Text>
                  </Stack>
                )}
              </Stack>

              {/* Campos preenchidos automaticamente */}
              {selectedUser && (
                <Stack tokens={{ childrenGap: 10 }}>
                  <MessageBar messageBarType={MessageBarType.success}>
                    ✅ Pessoa selecionada:{" "}
                    <strong>{selectedUser.displayName}</strong>
                  </MessageBar>

                  <TextField
                    label="Nome (preenchido automaticamente)"
                    value={newMember.name || ""}
                    disabled
                  />

                  <TextField
                    label="Email (preenchido automaticamente)"
                    value={newMember.email || ""}
                    disabled
                  />

                  <TextField
                    label="Cargo *"
                    value={newMember.role || ""}
                    onChange={(_, value) =>
                      this.setState({
                        newMember: { ...newMember, role: value },
                      })
                    }
                    placeholder="Cargo pode ser editado se necessário"
                    required
                  />
                </Stack>
              )}

              {/* Campos manuais como fallback */}
              {!selectedUser && (
                <Stack tokens={{ childrenGap: 10 }}>
                  <Text
                    variant="small"
                    styles={{
                      root: {
                        color: "var(--neutral-secondary)",
                        fontStyle: "italic",
                      },
                    }}
                  >
                    💡 Ou preencha manualmente caso não encontre a pessoa:
                  </Text>

                  <TextField
                    label="Nome *"
                    value={newMember.name || ""}
                    onChange={(_, value) =>
                      this.setState({
                        newMember: { ...newMember, name: value },
                      })
                    }
                    required
                  />

                  <TextField
                    label="Email *"
                    value={newMember.email || ""}
                    onChange={(_, value) =>
                      this.setState({
                        newMember: { ...newMember, email: value },
                      })
                    }
                    required
                  />

                  <TextField
                    label="Cargo *"
                    value={newMember.role || ""}
                    onChange={(_, value) =>
                      this.setState({
                        newMember: { ...newMember, role: value },
                      })
                    }
                    required
                  />
                </Stack>
              )}

              <Dropdown
                label="Equipe *"
                options={this.teamOptions}
                selectedKey={newMember.team}
                onChange={(_, option) =>
                  this.setState({
                    newMember: {
                      ...newMember,
                      team: option?.key as "HSE" | "Compras",
                    },
                  })
                }
                required
              />

              <Toggle
                label="Membro ativo"
                checked={newMember.isActive}
                onChange={(_, checked) =>
                  this.setState({
                    newMember: { ...newMember, isActive: checked },
                  })
                }
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
                  label="Nome *"
                  value={selectedMember.name}
                  onChange={(_, value) =>
                    this.setState({
                      selectedMember: { ...selectedMember, name: value || "" },
                    })
                  }
                  required
                />

                <TextField
                  label="Email *"
                  value={selectedMember.email}
                  onChange={(_, value) =>
                    this.setState({
                      selectedMember: { ...selectedMember, email: value || "" },
                    })
                  }
                  required
                />

                <TextField
                  label="Cargo *"
                  value={selectedMember.role}
                  onChange={(_, value) =>
                    this.setState({
                      selectedMember: { ...selectedMember, role: value || "" },
                    })
                  }
                  required
                />

                <Dropdown
                  label="Equipe *"
                  options={this.teamOptions}
                  selectedKey={selectedMember.team}
                  onChange={(_, option) =>
                    this.setState({
                      selectedMember: {
                        ...selectedMember,
                        team: option?.key as "HSE" | "Compras",
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
                    onClick={() => {
                      this.setState({ showEditDialog: false });
                      this.handleRemoveMember(selectedMember);
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
