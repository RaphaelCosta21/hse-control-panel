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
  Icon,
} from "@fluentui/react";
import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { IReportComponentProps, IInviteItem } from "../types/IReportTypes";
import { format, differenceInHours, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import styles from "./InvitesReport.module.scss";

// Interface para métricas
interface IInvitesMetrics {
  totalInvites: number;
  uniqueCompaniesInvited: number;
  companiesStarted: number;
  companiesRemaining: number;
  averageTimeToStart: string;
}

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
  const [metrics, setMetrics] = React.useState<IInvitesMetrics>({
    totalInvites: 0,
    uniqueCompaniesInvited: 0,
    companiesStarted: 0,
    companiesRemaining: 0,
    averageTimeToStart: "Calculando...",
  });

  // Função para calcular métricas
  const calculateMetrics = async (): Promise<void> => {
    try {
      console.log("Iniciando cálculo de métricas...");
      const sp = spfi().using(SPFx(context));

      // Adicionar logging para diagnóstico
      console.log("Buscando convites...");

      // 1. Buscar todos os convites
      const allInvites: Array<{
        Id: number;
        FornecedorEmail?: string;
        DataEnvio?: string;
      }> = await sp.web.lists
        .getByTitle("hse-control-panel-invites")
        .items.select("Id", "FornecedorEmail", "DataEnvio")
        .top(5000)();

      console.log(`Total de convites encontrados: ${allInvites.length}`);

      // Exibir amostra dos dados para debug
      console.log("Amostra de convites:", allInvites.slice(0, 3));

      // 2. Buscar formulários iniciados
      console.log("Buscando formulários...");
      const allForms: Array<{
        Id: number;
        Title?: string;
        EmailPreenchimento?: string;
        DadosFormulario?: string;
      }> = await sp.web.lists
        .getByTitle("hse-new-register")
        .items.select("Id", "Title", "EmailPreenchimento", "DadosFormulario")
        .top(5000)();

      console.log(`Total de formulários encontrados: ${allForms.length}`);
      console.log("Amostra de formulários:", allForms.slice(0, 3));

      // Filtrar e-mails válidos com mais robustez
      const validInviteEmails = allInvites
        .filter(
          (item) =>
            typeof item.FornecedorEmail === "string" &&
            item.FornecedorEmail.includes("@")
        )
        .map((item) => item.FornecedorEmail!.toLowerCase());

      // Calcular empresas convidadas únicas (por email)
      const uniqueEmails = new Set(validInviteEmails);
      const uniqueCompaniesCount = uniqueEmails.size;

      console.log(`Emails únicos encontrados: ${uniqueCompaniesCount}`);

      // Calcular empresas que iniciaram o processo (com formulário criado)
      const startedCompanies = new Set<string>();
      const formCreationTimes: number[] = [];

      allForms.forEach((form) => {
        if (
          typeof form.EmailPreenchimento === "string" &&
          form.EmailPreenchimento.includes("@")
        ) {
          const email = form.EmailPreenchimento.toLowerCase();
          startedCompanies.add(email);

          // Apenas processar tempos para emails que foram convidados
          if (uniqueEmails.has(email) && form.DadosFormulario) {
            try {
              // Usar JSON.parse com validação extra
              let formData;
              try {
                formData = JSON.parse(form.DadosFormulario);
              } catch (jsonError) {
                console.error("Erro ao parsear JSON:", jsonError);
                return; // Skip this form
              }

              if (
                formData &&
                formData.metadata &&
                formData.metadata.dataCriacao
              ) {
                const formCreationDate = new Date(
                  formData.metadata.dataCriacao
                );
                console.log(`Form data para ${email}:`, {
                  dataCriacao: formData.metadata.dataCriacao,
                  parsed: formCreationDate,
                });

                // Encontrar o convite correspondente
                const matchingInvite = allInvites.find(
                  (invite) =>
                    invite.FornecedorEmail &&
                    invite.FornecedorEmail.toLowerCase() === email
                );

                if (matchingInvite && matchingInvite.DataEnvio) {
                  const inviteDate = new Date(matchingInvite.DataEnvio);
                  console.log(`Convite encontrado para ${email}:`, {
                    dataEnvio: matchingInvite.DataEnvio,
                    parsed: inviteDate,
                  });

                  // Verificar se as datas são válidas
                  if (
                    !isNaN(formCreationDate.getTime()) &&
                    !isNaN(inviteDate.getTime())
                  ) {
                    // Calcular diferença em horas
                    const hoursToStart = differenceInHours(
                      formCreationDate,
                      inviteDate
                    );
                    console.log(
                      `Diferença em horas para ${email}: ${hoursToStart}`
                    );

                    if (hoursToStart >= 0) {
                      formCreationTimes.push(hoursToStart);
                    }
                  }
                }
              }
            } catch (error) {
              console.error(
                `Erro ao processar dados do formulário para ${email}:`,
                error
              );
            }
          }
        }
      });

      console.log(
        `Empresas que iniciaram o processo: ${startedCompanies.size}`
      );
      console.log(`Tempos de criação encontrados: ${formCreationTimes.length}`);

      // Calcular empresas pendentes
      const companiesRemaining = uniqueCompaniesCount - startedCompanies.size;

      // Calcular tempo médio até início
      let averageTimeString = "Sem dados";
      if (formCreationTimes.length > 0) {
        const totalHours = formCreationTimes.reduce(
          (sum, time) => sum + time,
          0
        );
        const averageHours = Math.round(totalHours / formCreationTimes.length);

        console.log(`Total de horas: ${totalHours}, Média: ${averageHours}`);

        if (averageHours > 48) {
          const days = Math.floor(averageHours / 24);
          averageTimeString = `${days} dia${days > 1 ? "s" : ""}`;
        } else {
          averageTimeString = `${averageHours} hora${
            averageHours > 1 ? "s" : ""
          }`;
        }
      }

      // Atualizar métricas
      setMetrics({
        totalInvites: allInvites.length,
        uniqueCompaniesInvited: uniqueCompaniesCount,
        companiesStarted: startedCompanies.size,
        companiesRemaining,
        averageTimeToStart: averageTimeString,
      });

      console.log("Métricas calculadas:", {
        totalInvites: allInvites.length,
        uniqueCompaniesInvited: uniqueCompaniesCount,
        companiesStarted: startedCompanies.size,
        companiesRemaining,
        averageTimeToStart: averageTimeString,
      });
    } catch (err) {
      console.error("Erro ao calcular métricas:", err);
      setError("Erro ao calcular métricas de convites.");
    }
  };

  const loadInvites = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(undefined);

      const sp = spfi().using(SPFx(context));

      // Buscar convites
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

      // Buscar formulários para verificar quais empresas já iniciaram
      const formsItems = await sp.web.lists
        .getByTitle("hse-new-register")
        .items.select("Id", "EmailPreenchimento")
        .top(5000)();

      // Criar set de emails que já iniciaram
      const startedEmails = new Set<string>(
        formsItems
          .filter(
            (form: { EmailPreenchimento?: string }) =>
              typeof form.EmailPreenchimento === "string" &&
              form.EmailPreenchimento.includes("@")
          )
          .map((form: { EmailPreenchimento?: string }) =>
            form.EmailPreenchimento!.toLowerCase()
          )
      );

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
          hasStarted: item.FornecedorEmail
            ? startedEmails.has(item.FornecedorEmail.toLowerCase())
            : false,
        })
      );

      setInvites(mappedItems);

      // Calcular métricas após carregar convites
      await calculateMetrics();
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

  // Função auxiliar para ordenar a lista
  const copyAndSort = <T,>(
    items: T[],
    columnKey: string,
    isSortedDescending?: boolean
  ): T[] => {
    const key = columnKey as keyof T;
    return items.slice().sort((a: T, b: T) => {
      const aValue = a[key];
      const bValue = b[key];

      // Tratamento especial para datas
      if (aValue instanceof Date && bValue instanceof Date) {
        return isSortedDescending
          ? bValue.getTime() - aValue.getTime()
          : aValue.getTime() - bValue.getTime();
      }

      // Tratamento especial para booleanos (status)
      if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        if (aValue === bValue) return 0;
        if (isSortedDescending) {
          return aValue ? -1 : 1;
        }
        return aValue ? 1 : -1;
      }

      // Tratamento para strings e outros tipos
      if (aValue < bValue) {
        return isSortedDescending ? 1 : -1;
      }
      if (aValue > bValue) {
        return isSortedDescending ? -1 : 1;
      }
      return 0;
    });
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
      key: "status",
      name: "Status",
      fieldName: "hasStarted",
      minWidth: 150,
      maxWidth: 200,
      isResizable: true,
      isSorted: false,
      isSortedDescending: false,
      onColumnClick: (ev, column) => {
        const newColumns = columns.slice();
        const currColumn = newColumns.filter(
          (currCol) => column.key === currCol.key
        )[0];
        newColumns.forEach((newCol) => {
          if (newCol === currColumn) {
            currColumn.isSortedDescending = !currColumn.isSortedDescending;
            currColumn.isSorted = true;
          } else {
            newCol.isSorted = false;
            newCol.isSortedDescending = true;
          }
        });
        const newItems = copyAndSort(
          invites,
          currColumn.fieldName!,
          currColumn.isSortedDescending
        );
        setInvites(newItems);
      },
      onRender: (item: IInviteItem) => {
        const daysPending = item.hasStarted
          ? 0
          : differenceInDays(new Date(), item.DataEnvio);

        return (
          <Stack horizontal tokens={{ childrenGap: 6 }} verticalAlign="center">
            <Icon
              iconName={item.hasStarted ? "CheckMark" : "Clock"}
              styles={{
                root: {
                  color: item.hasStarted ? "#107c10" : "#d83b01",
                  fontSize: 16,
                },
              }}
            />
            <Text
              variant="medium"
              styles={{
                root: {
                  color: item.hasStarted ? "#107c10" : "#d83b01",
                  fontWeight: 600,
                },
              }}
            >
              {item.hasStarted
                ? "Iniciado"
                : `Pendente, há ${daysPending} dia${
                    daysPending !== 1 ? "s" : ""
                  }`}
            </Text>
          </Stack>
        );
      },
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
      isSorted: false,
      isSortedDescending: false,
      onColumnClick: (ev, column) => {
        const newColumns = columns.slice();
        const currColumn = newColumns.filter(
          (currCol) => column.key === currCol.key
        )[0];
        newColumns.forEach((newCol) => {
          if (newCol === currColumn) {
            currColumn.isSortedDescending = !currColumn.isSortedDescending;
            currColumn.isSorted = true;
          } else {
            newCol.isSorted = false;
            newCol.isSortedDescending = true;
          }
        });
        const newItems = copyAndSort(
          invites,
          currColumn.fieldName!,
          currColumn.isSortedDescending
        );
        setInvites(newItems);
      },
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

  // Função para renderizar os cards de métricas
  const renderMetricsCards = (): JSX.Element => {
    return (
      <div className={styles.metricsContainer}>
        <Stack
          horizontal
          tokens={{ childrenGap: 16 }}
          wrap
          className={styles.metricsStack}
        >
          {/* Card 1: Empresas convidadas */}
          <div className={styles.metricCard}>
            <Stack tokens={{ childrenGap: 8 }}>
              <Stack
                horizontal
                tokens={{ childrenGap: 8 }}
                verticalAlign="center"
              >
                <Icon
                  iconName="Mail"
                  className={styles.metricIcon}
                  styles={{ root: { color: "#0078d4", fontSize: 24 } }}
                />
                <Text variant="large" className={styles.metricTitle}>
                  Empresas Convidadas
                </Text>
              </Stack>
              <Text variant="xxLarge" className={styles.metricValue}>
                {metrics.uniqueCompaniesInvited}
              </Text>
              <Text variant="small" className={styles.metricDescription}>
                Total de empresas únicas que receberam convite
              </Text>
            </Stack>
          </div>

          {/* Card 2: Empresas que iniciaram */}
          <div className={styles.metricCard}>
            <Stack tokens={{ childrenGap: 8 }}>
              <Stack
                horizontal
                tokens={{ childrenGap: 8 }}
                verticalAlign="center"
              >
                <Icon
                  iconName="CheckMark"
                  className={styles.metricIcon}
                  styles={{ root: { color: "#107c10", fontSize: 24 } }}
                />
                <Text variant="large" className={styles.metricTitle}>
                  Iniciaram o Processo
                </Text>
              </Stack>
              <Text variant="xxLarge" className={styles.metricValue}>
                {metrics.companiesStarted}
              </Text>
              <Text variant="small" className={styles.metricDescription}>
                Empresas que já criaram formulário
              </Text>
            </Stack>
          </div>

          {/* Card 3: Empresas pendentes */}
          <div className={styles.metricCard}>
            <Stack tokens={{ childrenGap: 8 }}>
              <Stack
                horizontal
                tokens={{ childrenGap: 8 }}
                verticalAlign="center"
              >
                <Icon
                  iconName="Clock"
                  className={styles.metricIcon}
                  styles={{ root: { color: "#d83b01", fontSize: 24 } }}
                />
                <Text variant="large" className={styles.metricTitle}>
                  Pendentes de Início
                </Text>
              </Stack>
              <Text variant="xxLarge" className={styles.metricValue}>
                {metrics.companiesRemaining}
              </Text>
              <Text variant="small" className={styles.metricDescription}>
                Empresas que ainda não iniciaram o preenchimento
              </Text>
            </Stack>
          </div>

          {/* Card 4: Tempo médio */}
          <div className={styles.metricCard}>
            <Stack tokens={{ childrenGap: 8 }}>
              <Stack
                horizontal
                tokens={{ childrenGap: 8 }}
                verticalAlign="center"
              >
                <Icon
                  iconName="TimeEntry"
                  className={styles.metricIcon}
                  styles={{ root: { color: "#8764b8", fontSize: 24 } }}
                />
                <Text variant="large" className={styles.metricTitle}>
                  Tempo Médio de Início
                </Text>
              </Stack>
              <Text variant="xxLarge" className={styles.metricValue}>
                {metrics.averageTimeToStart}
              </Text>
              <Text variant="small" className={styles.metricDescription}>
                Tempo médio entre convite e início do preenchimento
              </Text>
            </Stack>
          </div>
        </Stack>
      </div>
    );
  };

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

        {/* Cards de métricas */}
        {renderMetricsCards()}

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
