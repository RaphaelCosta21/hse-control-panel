import * as React from "react";
import {
  Modal,
  Stack,
  TextField,
  PrimaryButton,
  DefaultButton,
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize,
  Pivot,
  PivotItem,
  DetailsList,
  IColumn,
  SelectionMode,
  Text,
  Icon,
  Dialog,
  DialogType,
  DialogFooter,
} from "@fluentui/react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { InviteService } from "../../services/InviteService";
import { IInviteItem } from "../../types/IConfigurationData";
import styles from "./InviteModal.module.scss";

export interface IInviteModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  onInviteSent: () => void;
  context: WebPartContext;
}

export const InviteModal: React.FC<IInviteModalProps> = ({
  isOpen,
  onDismiss,
  onInviteSent,
  context,
}) => {
  const [selectedTab, setSelectedTab] = React.useState<string>("novo");
  const [fornecedorEmail, setFornecedorEmail] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>("");
  const [success, setSuccess] = React.useState<string>("");
  const [invites, setInvites] = React.useState<IInviteItem[]>([]);
  const [loadingHistory, setLoadingHistory] = React.useState<boolean>(false);
  const [showConfirmDialog, setShowConfirmDialog] =
    React.useState<boolean>(false);

  const inviteService = React.useMemo(
    () => new InviteService(context),
    [context]
  );

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  const loadInviteHistory = async (): Promise<void> => {
    setLoadingHistory(true);
    try {
      const history = await inviteService.getInvites(50); // Últimos 50 convites
      setInvites(history);
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
      setError("Erro ao carregar histórico de convites");
    } finally {
      setLoadingHistory(false);
    }
  };

  const canSend =
    fornecedorEmail && isValidEmail(fornecedorEmail) && !isLoading;

  const handleSendInvite = (): void => {
    if (!fornecedorEmail || !isValidEmail(fornecedorEmail)) {
      setError("Email do fornecedor é obrigatório e deve ser válido");
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmSend = async (): Promise<void> => {
    setShowConfirmDialog(false);
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const currentUserEmail = context.pageContext.user.email || "";
      const result = await inviteService.createInvite({
        fornecedorEmail,
        convidadoPor: currentUserEmail,
      });

      if (result.success) {
        setSuccess(result.message || "Convite enviado com sucesso!");
        setFornecedorEmail("");
        onInviteSent();

        // Atualizar histórico se estiver na aba de histórico
        if (selectedTab === "historico") {
          await loadInviteHistory();
        }

        setTimeout(() => {
          setSuccess("");
        }, 5000);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar convite");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSend = (): void => {
    setShowConfirmDialog(false);
  };

  const handleTabChange = (item?: PivotItem): void => {
    if (item?.props.itemKey) {
      setSelectedTab(item.props.itemKey);
      if (item.props.itemKey === "historico") {
        loadInviteHistory().catch(console.error);
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent): void => {
    if (event.key === "Enter" && canSend) {
      handleSendInvite();
    }
  };

  const handleClear = (): void => {
    setFornecedorEmail("");
    setError("");
    setSuccess("");
  };

  const inviteColumns: IColumn[] = [
    {
      key: "fornecedorEmail",
      name: "Email do Fornecedor",
      fieldName: "FornecedorEmail",
      minWidth: 200,
      maxWidth: 300,
      isResizable: true,
      onRender: (item: IInviteItem) => (
        <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
          <Icon iconName="Mail" className={styles.emailIcon} />
          <Text>{item.FornecedorEmail}</Text>
        </Stack>
      ),
    },
    {
      key: "convidadoPor",
      name: "Convidado Por",
      fieldName: "ConvidadoPor",
      minWidth: 150,
      maxWidth: 200,
      isResizable: true,
      onRender: (item: IInviteItem) => (
        <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
          <Icon iconName="Contact" className={styles.userIcon} />
          <Text>{item.ConvidadoPor}</Text>
        </Stack>
      ),
    },
    {
      key: "dataEnvio",
      name: "Data de Envio",
      fieldName: "DataEnvio",
      minWidth: 130,
      maxWidth: 150,
      isResizable: true,
      onRender: (item: IInviteItem) => (
        <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
          <Icon iconName="Calendar" className={styles.dateIcon} />
          <Text>{formatDate(item.DataEnvio)}</Text>
        </Stack>
      ),
    },
  ];

  return (
    <>
      <Modal
        isOpen={isOpen}
        onDismiss={onDismiss}
        isBlocking={isLoading}
        containerClassName={styles.modalContainer}
      >
        <div className={styles.modalContent}>
          <Stack tokens={{ childrenGap: 20 }}>
            <div className={styles.modalHeader}>
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
                  <Icon iconName="UserOptional" className={styles.headerIcon} />
                  <div>
                    <Text variant="xLarge" className={styles.title}>
                      Gerenciar Convites
                    </Text>
                    <Text variant="medium" className={styles.subtitle}>
                      Convide fornecedores e visualize o histórico
                    </Text>
                  </div>
                </Stack>

                <DefaultButton
                  iconProps={{ iconName: "Cancel" }}
                  onClick={onDismiss}
                  title="Fechar"
                />
              </Stack>
            </div>

            <Pivot
              selectedKey={selectedTab}
              onLinkClick={handleTabChange}
              className={styles.pivotTabs}
            >
              <PivotItem
                headerText="Novo Convite"
                itemKey="novo"
                itemIcon="Add"
              >
                <Stack
                  tokens={{ childrenGap: 16 }}
                  className={styles.tabContent}
                >
                  {error && (
                    <MessageBar
                      messageBarType={MessageBarType.error}
                      onDismiss={() => setError("")}
                    >
                      {error}
                    </MessageBar>
                  )}

                  {success && (
                    <MessageBar
                      messageBarType={MessageBarType.success}
                      onDismiss={() => setSuccess("")}
                    >
                      {success}
                    </MessageBar>
                  )}

                  <div className={styles.formSection}>
                    <TextField
                      label="Email do Fornecedor *"
                      placeholder="exemplo@empresa.com.br"
                      value={fornecedorEmail}
                      onChange={(_, newValue) =>
                        setFornecedorEmail(newValue || "")
                      }
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                      required
                      iconProps={{ iconName: "Mail" }}
                      errorMessage={
                        fornecedorEmail && !isValidEmail(fornecedorEmail)
                          ? "Email inválido"
                          : undefined
                      }
                      description="O fornecedor receberá um email com instruções para preencher o formulário HSE"
                    />
                  </div>

                  <Stack
                    horizontal
                    horizontalAlign="space-between"
                    className={styles.formActions}
                  >
                    <DefaultButton
                      text="Limpar"
                      iconProps={{ iconName: "Clear" }}
                      onClick={handleClear}
                      disabled={isLoading || !fornecedorEmail}
                    />

                    <Stack horizontal tokens={{ childrenGap: 10 }}>
                      <DefaultButton
                        text="Cancelar"
                        onClick={onDismiss}
                        disabled={isLoading}
                      />
                      <PrimaryButton
                        text={isLoading ? "Enviando..." : "Enviar Convite"}
                        onClick={handleSendInvite}
                        disabled={!canSend}
                        iconProps={isLoading ? undefined : { iconName: "Send" }}
                      />
                    </Stack>
                  </Stack>

                  {isLoading && (
                    <Stack
                      horizontalAlign="center"
                      tokens={{ childrenGap: 10 }}
                    >
                      <Spinner
                        size={SpinnerSize.medium}
                        label="Enviando convite..."
                      />
                    </Stack>
                  )}
                </Stack>
              </PivotItem>

              <PivotItem
                headerText="Histórico"
                itemKey="historico"
                itemIcon="History"
              >
                <Stack
                  tokens={{ childrenGap: 16 }}
                  className={styles.tabContent}
                >
                  <div className={styles.historyHeader}>
                    <Stack
                      horizontal
                      horizontalAlign="space-between"
                      verticalAlign="center"
                    >
                      <Text
                        variant="mediumPlus"
                        className={styles.historyTitle}
                      >
                        Convites Enviados
                      </Text>
                      <DefaultButton
                        text="Atualizar"
                        iconProps={{ iconName: "Refresh" }}
                        onClick={loadInviteHistory}
                        disabled={loadingHistory}
                      />
                    </Stack>
                  </div>

                  {loadingHistory ? (
                    <Stack
                      horizontalAlign="center"
                      tokens={{ childrenGap: 10 }}
                    >
                      <Spinner
                        size={SpinnerSize.medium}
                        label="Carregando histórico..."
                      />
                    </Stack>
                  ) : invites.length > 0 ? (
                    <div className={styles.invitesContainer}>
                      <DetailsList
                        items={invites}
                        columns={inviteColumns}
                        selectionMode={SelectionMode.none}
                        compact={false}
                        className={styles.invitesList}
                        layoutMode={1} // FixedColumns
                      />
                      <Text variant="small" className={styles.invitesCount}>
                        Total: {invites.length} convite(s) enviado(s)
                      </Text>
                    </div>
                  ) : (
                    <MessageBar messageBarType={MessageBarType.info}>
                      <Stack
                        horizontal
                        verticalAlign="center"
                        tokens={{ childrenGap: 8 }}
                      >
                        <Icon iconName="Info" />
                        <Text>Nenhum convite foi enviado ainda</Text>
                      </Stack>
                    </MessageBar>
                  )}
                </Stack>
              </PivotItem>
            </Pivot>
          </Stack>
        </div>
      </Modal>

      <Dialog
        hidden={!showConfirmDialog}
        onDismiss={handleCancelSend}
        dialogContentProps={{
          type: DialogType.normal,
          title: "Confirmar Envio do Convite",
          subText: `Tem certeza que deseja enviar o convite para ${fornecedorEmail}? O fornecedor receberá um email com instruções para preencher o formulário HSE.`,
        }}
        modalProps={{
          isBlocking: true,
          styles: { main: { maxWidth: 450 } },
        }}
      >
        <DialogFooter>
          <PrimaryButton
            onClick={handleConfirmSend}
            text="Sim, Enviar"
            iconProps={{ iconName: "Send" }}
          />
          <DefaultButton onClick={handleCancelSend} text="Cancelar" />
        </DialogFooter>
      </Dialog>
    </>
  );
};
