import * as React from "react";
import {
  Stack,
  Text,
  DetailsList,
  IColumn,
  SelectionMode,
  CommandBar,
  ICommandBarItemProps,
  MessageBar,
  MessageBarType,
  Dialog,
  DialogType,
  DialogFooter,
  PrimaryButton,
  DefaultButton,
  Spinner,
  SpinnerSize,
} from "@fluentui/react";
import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { IReportComponentProps, IInviteItem } from "../types/IReportTypes";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import styles from "./InvitesReport.module.scss";

const InvitesReport: React.FC<IReportComponentProps> = ({
  context,
  serviceConfig,
}) => {
  const [invites, setInvites] = React.useState<IInviteItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [selectedInvite, setSelectedInvite] = React.useState<
    IInviteItem | undefined
  >(undefined);
  const [showConfirmDialog, setShowConfirmDialog] =
    React.useState<boolean>(false);
  const [resending, setResending] = React.useState<boolean>(false);
  const [successMessage, setSuccessMessage] = React.useState<
    string | undefined
  >(undefined);

  const loadInvites = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(undefined);

      const sp = spfi().using(SPFx(context));
      const items = await sp.web.lists
        .getByTitle("hse-control-panel-invites")
        .items.select(
          "Id",
          "Title",
          "FornecedorEmail",
          "ConvidadoPor",
          "DataEnvio"
        )
        .orderBy("DataEnvio", false)();

      const mappedItems: IInviteItem[] = items.map(
        (item: {
          Id: number;
          Title?: string;
          FornecedorEmail?: string;
          ConvidadoPor?: string;
          DataEnvio?: string;
        }) => ({
          id: item.Id,
          Title: item.Title || "Sem título",
          FornecedorEmail: item.FornecedorEmail || "",
          ConvidadoPor: item.ConvidadoPor || "",
          DataEnvio: item.DataEnvio ? new Date(item.DataEnvio) : new Date(),
        })
      );

      setInvites(mappedItems);
    } catch (err) {
      console.error("Erro ao carregar convites:", err);
      setError("Erro ao carregar a lista de convites realizados.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadInvites().catch(console.error);
  }, [context]);

  const handleResendInvite = (invite: IInviteItem): void => {
    setSelectedInvite(invite);
    setShowConfirmDialog(true);
  };

  const confirmResendInvite = async (): Promise<void> => {
    if (!selectedInvite) return;

    try {
      setResending(true);
      setError(undefined);

      const sp = spfi().using(SPFx(context));
      // Adicionar na lista de reenvios
      await sp.web.lists.getByTitle("hse-control-panel-reinvites").items.add({
        Title: selectedInvite.Title,
        FornecedorEmail: selectedInvite.FornecedorEmail,
        ConvidadoPor: selectedInvite.ConvidadoPor,
        DataEnvio: new Date().toISOString(),
      });

      setSuccessMessage(
        `Convite reenviado com sucesso para ${selectedInvite.FornecedorEmail}!`
      );
      setShowConfirmDialog(false);
      setSelectedInvite(undefined);

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(undefined);
      }, 5000);
    } catch (err) {
      console.error("Erro ao reenviar convite:", err);
      setError("Erro ao reenviar o convite. Tente novamente.");
    } finally {
      setResending(false);
    }
  };

  const columns: IColumn[] = [
    {
      key: "fornecedorEmail",
      name: "Email do Fornecedor",
      fieldName: "FornecedorEmail",
      minWidth: 200,
      maxWidth: 300,
      isResizable: true,
      onRender: (item: IInviteItem) => (
        <Text variant="medium">{item.FornecedorEmail}</Text>
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
        <Text variant="medium">{item.ConvidadoPor}</Text>
      ),
    },
    {
      key: "dataEnvio",
      name: "Data do Convite",
      fieldName: "DataEnvio",
      minWidth: 120,
      maxWidth: 150,
      isResizable: true,
      onRender: (item: IInviteItem) => (
        <Text variant="medium">
          {format(item.DataEnvio, "dd/MM/yyyy HH:mm", { locale: ptBR })}
        </Text>
      ),
    },
    {
      key: "actions",
      name: "Ações",
      fieldName: "",
      minWidth: 100,
      maxWidth: 120,
      isResizable: false,
      onRender: (item: IInviteItem) => (
        <PrimaryButton
          text="Reenviar"
          iconProps={{ iconName: "Send" }}
          onClick={() => handleResendInvite(item)}
          disabled={resending}
          styles={{
            root: {
              minWidth: 80,
              height: 28,
            },
          }}
        />
      ),
    },
  ];

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: "refresh",
      text: "Atualizar",
      iconProps: { iconName: "Refresh" },
      onClick: () => {
        loadInvites().catch(console.error);
      },
      disabled: loading,
    },
  ];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size={SpinnerSize.large} label="Carregando convites..." />
      </div>
    );
  }

  return (
    <div className={styles.invitesReport}>
      <Stack tokens={{ childrenGap: 16 }}>
        <div className={styles.header}>
          <Text variant="xLarge" as="h1">
            📧 Convites Realizados
          </Text>
          <div>
            <Text variant="medium" className={styles.description}>
              Visualize todos os convites enviados aos fornecedores e reenvie
              quando necessário
            </Text>
          </div>
        </div>

        <CommandBar items={commandBarItems} className={styles.commandBar} />

        {error && (
          <MessageBar
            messageBarType={MessageBarType.error}
            onDismiss={() => setError(undefined)}
          >
            {error}
          </MessageBar>
        )}

        {successMessage && (
          <MessageBar
            messageBarType={MessageBarType.success}
            onDismiss={() => setSuccessMessage(undefined)}
          >
            {successMessage}
          </MessageBar>
        )}

        <div className={styles.tableContainer}>
          <DetailsList
            items={invites}
            columns={columns}
            selectionMode={SelectionMode.none}
            layoutMode={1}
            isHeaderVisible={true}
            className={styles.detailsList}
          />

          {invites.length === 0 && !loading && (
            <div className={styles.emptyState}>
              <Text variant="large">📭 Nenhum convite encontrado</Text>
              <Text variant="medium">
                Quando convites forem enviados, eles aparecerão aqui.
              </Text>
            </div>
          )}
        </div>

        <Dialog
          hidden={!showConfirmDialog}
          onDismiss={() => setShowConfirmDialog(false)}
          dialogContentProps={{
            type: DialogType.normal,
            title: "Confirmar Reenvio de Convite",
            subText: selectedInvite
              ? `Tem certeza que deseja reenviar o convite para ${selectedInvite.FornecedorEmail}?`
              : "",
          }}
          modalProps={{
            isBlocking: true,
            styles: { main: { maxWidth: 450 } },
          }}
        >
          <DialogFooter>
            <PrimaryButton
              onClick={confirmResendInvite}
              text="Sim, Reenviar"
              disabled={resending}
            />
            <DefaultButton
              onClick={() => setShowConfirmDialog(false)}
              text="Cancelar"
              disabled={resending}
            />
          </DialogFooter>
        </Dialog>
      </Stack>
    </div>
  );
};

export default InvitesReport;
