import * as React from "react";
import {
  Stack,
  Text,
  DetailsList,
  IColumn,
  DetailsListLayoutMode,
  SelectionMode,
  MessageBar,
  MessageBarType,
  Icon,
  TooltipHost,
  DefaultButton,
  Dropdown,
  IDropdownOption,
  SearchBox,
} from "@fluentui/react";
import {
  IRevalidationItem,
  IReportComponentProps,
} from "../types/IReportTypes";
import { SharePointService } from "../../../services/SharePointService";
import styles from "./RevalidationReport.module.scss";

export interface IRevalidationReportProps extends IReportComponentProps {}

export const RevalidationReport: React.FC<IRevalidationReportProps> = ({
  context,
  serviceConfig,
}) => {
  const [revalidationItems, setRevalidationItems] = React.useState<
    IRevalidationItem[]
  >([]);
  const [filteredItems, setFilteredItems] = React.useState<IRevalidationItem[]>(
    []
  );
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Estados dos filtros
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [companyFilter, setCompanyFilter] = React.useState<string>("");
  const [selectedCompany, setSelectedCompany] = React.useState<string>("all");

  // SharePoint Service instance
  const sharePointService = React.useMemo(
    () =>
      new SharePointService(
        context,
        serviceConfig.listConfigs.hseFormsList.listName
      ),
    [context, serviceConfig]
  );

  // Extrair empresas únicas para o dropdown
  const uniqueCompanies = React.useMemo(() => {
    const companies = revalidationItems
      .map((item) => item.companyName)
      .filter((company, index, arr) => arr.indexOf(company) === index)
      .sort();

    return [
      { key: "all", text: "Todas as Empresas" },
      ...companies.map((company) => ({ key: company, text: company })),
    ] as IDropdownOption[];
  }, [revalidationItems]);

  const loadRevalidationData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar apenas formulários aprovados
      const rawItems = await sharePointService.getFormsList();
      const approvedForms = rawItems.filter(
        (item) => item.StatusAvaliacao === "Aprovado"
      );

      const revalidationData: IRevalidationItem[] = approvedForms.map(
        (item) => {
          // Data de aprovação (usar Modified como proxy)
          const approvalDate = new Date(item.Modified);

          // Próxima revalidação: 1 ano após aprovação
          const nextRevalidationDate = new Date(approvalDate);
          nextRevalidationDate.setFullYear(
            nextRevalidationDate.getFullYear() + 1
          );

          // Calcular dias até expiração
          const today = new Date();
          const daysUntilExpiration = Math.ceil(
            (nextRevalidationDate.getTime() - today.getTime()) /
              (1000 * 60 * 60 * 24)
          );

          // Determinar status baseado nos dias
          let status: "Em Dia" | "Próximo do Vencimento" | "Vencido";
          if (daysUntilExpiration < 0) {
            status = "Vencido";
          } else if (daysUntilExpiration <= 90) {
            status = "Próximo do Vencimento";
          } else {
            status = "Em Dia";
          }

          return {
            id: item.Id,
            companyName: item.Title || "",
            cnpj: item.CNPJ || "",
            approvalDate,
            nextRevalidationDate,
            daysUntilExpiration,
            status,
            riskLevel: parseInt(item.GrauRisco || "1", 10) as 1 | 2 | 3 | 4,
            responsibleTechnician: item.NomePreenchimento || "N/A",
            approvedBy: "Sistema", // Pode ser extraído do JSON DadosFormulario se necessário
          };
        }
      );

      // Ordenar por data de vencimento (mais próximos primeiro)
      revalidationData.sort(
        (a, b) => a.daysUntilExpiration - b.daysUntilExpiration
      );

      setRevalidationItems(revalidationData);
    } catch (err) {
      console.error("Erro ao carregar dados de revalidação:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [sharePointService]);

  // Função para aplicar filtros
  const applyFilters = React.useCallback(() => {
    let filtered = [...revalidationItems];

    // Filtro por status
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    // Filtro por empresa dropdown
    if (selectedCompany !== "all") {
      filtered = filtered.filter(
        (item) => item.companyName === selectedCompany
      );
    }

    // Filtro por empresa (busca parcial, case-insensitive)
    if (companyFilter.trim()) {
      filtered = filtered.filter((item) =>
        item.companyName.toLowerCase().includes(companyFilter.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [revalidationItems, statusFilter, selectedCompany, companyFilter]);

  React.useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  React.useEffect(() => {
    loadRevalidationData().catch(console.error);
  }, [loadRevalidationData]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCNPJ = (cnpj: string): string => {
    const numbers = cnpj.replace(/\D/g, "");
    if (numbers.length === 14) {
      return numbers.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5"
      );
    }
    return cnpj;
  };

  const getStatusIcon = (status: string): JSX.Element | null => {
    switch (status) {
      case "Em Dia":
        return <Icon iconName="CheckMark" className={styles.statusIconGreen} />;
      case "Próximo do Vencimento":
        return <Icon iconName="Warning" className={styles.statusIconYellow} />;
      case "Vencido":
        return <Icon iconName="ErrorBadge" className={styles.statusIconRed} />;
      default:
        return null;
    }
  };

  const columns: IColumn[] = [
    {
      key: "status",
      name: "Status",
      fieldName: "status",
      minWidth: 120,
      maxWidth: 150,
      isResizable: true,
      onRender: (item: IRevalidationItem) => (
        <div className={styles.statusCell}>
          {getStatusIcon(item.status)}
          <span className={styles.statusText}>{item.status}</span>
        </div>
      ),
    },
    {
      key: "company",
      name: "Empresa/CNPJ",
      fieldName: "companyName",
      minWidth: 200,
      maxWidth: 280,
      isResizable: true,
      onRender: (item: IRevalidationItem) => (
        <div className={styles.companyCell}>
          <div className={styles.companyName}>🏢 {item.companyName}</div>
          <div className={styles.companyCNPJ}>
            CNPJ: {formatCNPJ(item.cnpj)}
          </div>
        </div>
      ),
    },
    {
      key: "approvalDate",
      name: "Data de Aprovação",
      fieldName: "approvalDate",
      minWidth: 120,
      maxWidth: 150,
      isResizable: true,
      onRender: (item: IRevalidationItem) => (
        <span className={styles.dateCell}>{formatDate(item.approvalDate)}</span>
      ),
    },
    {
      key: "nextRevalidationDate",
      name: "Próxima Revalidação",
      fieldName: "nextRevalidationDate",
      minWidth: 120,
      maxWidth: 150,
      isResizable: true,
      onRender: (item: IRevalidationItem) => (
        <span className={styles.dateCell}>
          {formatDate(item.nextRevalidationDate)}
        </span>
      ),
    },
    {
      key: "daysUntilExpiration",
      name: "Dias para Vencer",
      fieldName: "daysUntilExpiration",
      minWidth: 100,
      maxWidth: 120,
      isResizable: true,
      onRender: (item: IRevalidationItem) => {
        const className =
          item.daysUntilExpiration < 0
            ? styles.daysExpired
            : item.daysUntilExpiration <= 30
            ? styles.daysCritical
            : item.daysUntilExpiration <= 90
            ? styles.daysWarning
            : styles.daysOk;

        return (
          <TooltipHost
            content={
              item.daysUntilExpiration < 0
                ? `Vencido há ${Math.abs(item.daysUntilExpiration)} dias`
                : `${item.daysUntilExpiration} dias restantes`
            }
          >
            <span className={className}>
              {item.daysUntilExpiration < 0
                ? `${Math.abs(item.daysUntilExpiration)} dias atraso`
                : `${item.daysUntilExpiration} dias`}
            </span>
          </TooltipHost>
        );
      },
    },
    {
      key: "responsibleTechnician",
      name: "Responsável Técnico",
      fieldName: "responsibleTechnician",
      minWidth: 150,
      maxWidth: 200,
      isResizable: true,
      onRender: (item: IRevalidationItem) => (
        <span>👤 {item.responsibleTechnician}</span>
      ),
    },
    {
      key: "actions",
      name: "Ações",
      fieldName: "actions",
      minWidth: 120,
      maxWidth: 150,
      isResizable: false,
      onRender: (item: IRevalidationItem) => (
        <DefaultButton
          text="Notificar"
          iconProps={{ iconName: "Mail" }}
          onClick={() => console.log(`Notificar empresa ${item.companyName}`)}
          className={styles.actionButton}
        />
      ),
    },
  ];

  // Estatísticas baseadas nos itens filtrados
  const totalItems = filteredItems.length;
  const expiredItems = filteredItems.filter(
    (item) => item.status === "Vencido"
  ).length;
  const warningItems = filteredItems.filter(
    (item) => item.status === "Próximo do Vencimento"
  ).length;
  const okItems = filteredItems.filter(
    (item) => item.status === "Em Dia"
  ).length;

  if (loading) {
    return (
      <div className={styles.loading}>
        <Text variant="large">Carregando dados de revalidação...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
    );
  }

  return (
    <div className={styles.revalidationReport}>
      <div className={styles.header}>
        <Stack tokens={{ childrenGap: 8 }}>
          <Text variant="xLarge">🔄 Revalidação de Formulários Aprovados</Text>
          <Text variant="medium" className={styles.description}>
            Monitoramento de formulários que precisam ser revalidados anualmente
          </Text>
        </Stack>
      </div>

      {/* Filtros */}
      <div className={styles.filters}>
        <Stack horizontal tokens={{ childrenGap: 16 }} wrap>
          <Dropdown
            label="Status"
            selectedKey={statusFilter}
            onChange={(event, option) =>
              setStatusFilter((option?.key as string) || "all")
            }
            options={
              [
                { key: "all", text: "Todos os Status" },
                { key: "Em Dia", text: "Em Dia" },
                { key: "Próximo do Vencimento", text: "Próximo do Vencimento" },
                { key: "Vencido", text: "Vencido" },
              ] as IDropdownOption[]
            }
            styles={{ root: { minWidth: 200 } }}
          />
          <Dropdown
            label="Empresa"
            selectedKey={selectedCompany}
            onChange={(event, option) =>
              setSelectedCompany((option?.key as string) || "all")
            }
            options={uniqueCompanies}
            styles={{ root: { minWidth: 250 } }}
          />
          <SearchBox
            placeholder="Buscar por empresa..."
            value={companyFilter}
            onChange={(event, newValue) => setCompanyFilter(newValue || "")}
            styles={{ root: { minWidth: 250 } }}
          />
        </Stack>
      </div>

      <div className={styles.statistics}>
        <Stack horizontal tokens={{ childrenGap: 16 }}>
          <div className={styles.statCard}>
            <Text variant="large" className={styles.statNumber}>
              {totalItems}
            </Text>
            <Text variant="medium">Total</Text>
          </div>
          <div className={`${styles.statCard} ${styles.statCardRed}`}>
            <Text variant="large" className={styles.statNumber}>
              {expiredItems}
            </Text>
            <Text variant="medium">Vencidos</Text>
          </div>
          <div className={`${styles.statCard} ${styles.statCardYellow}`}>
            <Text variant="large" className={styles.statNumber}>
              {warningItems}
            </Text>
            <Text variant="medium">Próx. Vencimento</Text>
          </div>
          <div className={`${styles.statCard} ${styles.statCardGreen}`}>
            <Text variant="large" className={styles.statNumber}>
              {okItems}
            </Text>
            <Text variant="medium">Em Dia</Text>
          </div>
        </Stack>
      </div>

      <div className={styles.tableContainer}>
        <DetailsList
          items={filteredItems}
          columns={columns}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          isHeaderVisible={true}
          className={styles.detailsList}
        />

        {filteredItems.length === 0 && !loading && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <div className={styles.emptyText}>
              {revalidationItems.length === 0
                ? "Nenhum formulário aprovado encontrado"
                : "Nenhum item encontrado com os filtros aplicados"}
            </div>
            <div className={styles.emptySubtext}>
              Formulários aprovados aparecerão aqui para monitoramento de
              revalidação
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
