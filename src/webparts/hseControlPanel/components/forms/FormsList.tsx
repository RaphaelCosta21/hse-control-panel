import * as React from "react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import {
  ICommandBarItemProps,
  CommandBar,
  MessageBar,
  MessageBarType,
  Stack,
  Text,
} from "@fluentui/react";
import { SearchBox, FormFilters } from "../filters";
import FormsTable from "./FormsTable/FormsTable";
import ModernFormViewer from "./ModernFormViewer/ModernFormViewer";
import { IFormListItem } from "../../types/IControlPanelData";
import { ISharePointConfig } from "../../types/ISharePointConfig";
import { SharePointService } from "../../services/SharePointService";
import { PDFGeneratorService } from "../../services/pdfGenerator";
import { IFormsFilters } from "../../types/IControlPanelData";
import styles from "./FormsList.module.scss";

export interface IFormsListProps {
  context: WebPartContext;
  serviceConfig: ISharePointConfig;
}

const FormsList: React.FC<IFormsListProps> = ({ context, serviceConfig }) => {
  const [forms, setForms] = React.useState<IFormListItem[]>([]);
  const [filteredForms, setFilteredForms] = React.useState<IFormListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filters, setFilters] = React.useState<IFormsFilters>({});

  // Modal state
  const [selectedForm, setSelectedForm] = React.useState<
    IFormListItem | undefined
  >(undefined);
  const [isViewerOpen, setIsViewerOpen] = React.useState(false);

  // SharePoint Service instance
  const sharePointService = React.useMemo(
    () =>
      new SharePointService(
        context,
        serviceConfig.listConfigs.hseFormsList.listName
      ),
    [context, serviceConfig]
  );

  // Função auxiliar para extrair dados do avaliador
  const extractAssignedReviewer = React.useCallback(
    (item: Record<string, any>) => {
      try {
        // Verifica se tem avaliador atribuído na coluna AvaliadorResponsavel
        if (item.AvaliadorResponsavel) {
          return {
            name: item.AvaliadorResponsavel.Title || item.AvaliadorResponsavel,
            email: item.AvaliadorResponsavel.EMail || "",
            photoUrl: undefined, // Será carregado posteriormente se necessário
            isActive: true,
          };
        }

        // Fallback: verifica se tem dados no JSON DadosFormulario
        if (item.DadosFormulario) {
          const dadosFormulario =
            typeof item.DadosFormulario === "string"
              ? JSON.parse(item.DadosFormulario)
              : item.DadosFormulario;

          if (dadosFormulario?.metadata?.avaliadorAtribuido) {
            return dadosFormulario.metadata.avaliadorAtribuido;
          }
        }

        return undefined;
      } catch (error) {
        console.error("Erro ao extrair dados do avaliador:", error);
        return undefined;
      }
    },
    []
  );

  // Load real data from SharePoint
  const loadForms = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const rawItems = await sharePointService.getFormsList();

      // Convert SharePoint items to IFormListItem format
      const convertedForms: IFormListItem[] = rawItems.map((item) => ({
        id: item.Id,
        empresa: item.Title || "",
        cnpj: item.CNPJ || "",
        status: item.StatusAvaliacao || "Em Andamento",
        dataSubmissao: new Date(item.Created),
        grauRisco: item.GrauRisco || "1",
        percentualConclusao: item.PercentualConclusao || 0,
        emailPreenchimento: item.EmailPreenchimento || "",
        nomePreenchimento: item.NomePreenchimento || "",
        anexosCount: item.AnexosCount || 0,
        dataAvaliacao: item.Modified ? new Date(item.Modified) : undefined,
        criadoPor: item.NomePreenchimento || "Sistema",
        // Deprecated fields for backward compatibility
        prioridade: "Média", // Default value since we removed PrioridadeAvaliacao
        companyName: item.Title || "",
        submissionDate: item.Created,
        riskLevel: parseInt(item.GrauRisco || "1", 10) as 1 | 2 | 3 | 4,
        completionPercentage: item.PercentualConclusao || 0,
        // Novo campo: dados do avaliador atribuído
        avaliadorAtribuido: extractAssignedReviewer(item),
      }));

      setForms(convertedForms);
      setFilteredForms(convertedForms);
    } catch (err) {
      console.error("Erro ao carregar formulários:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      // Fallback to empty array instead of mock data
      setForms([]);
      setFilteredForms([]);
    } finally {
      setLoading(false);
    }
  }, [sharePointService]);

  // Use real data instead of mock
  React.useEffect(() => {
    loadForms().catch(console.error);
  }, [loadForms]);

  // Apply filters
  React.useEffect(() => {
    let filtered = [...forms];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (form) =>
          form.empresa.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
          form.cnpj.indexOf(searchTerm.replace(/\D/g, "")) !== -1
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((form) => form.status === filters.status);
    }

    // Risk filter
    if (filters.grauRisco) {
      filtered = filtered.filter(
        (form) => form.grauRisco === filters.grauRisco
      );
    }

    // Date range filter
    if (filters.dataInicio || filters.dataFim) {
      filtered = filtered.filter((form) => {
        const formDate = form.dataSubmissao;
        if (filters.dataInicio && formDate < filters.dataInicio) return false;
        if (filters.dataFim && formDate > filters.dataFim) return false;
        return true;
      });
    }

    setFilteredForms(filtered);
  }, [forms, searchTerm, filters]);

  const handleResetFilters = React.useCallback(() => {
    setSearchTerm("");
    setFilters({});
  }, []);

  const handleFiltersChange = React.useCallback(
    (newFilters: Partial<IFormsFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    },
    []
  );

  const handleDateRangeChange = React.useCallback(
    (start?: Date, end?: Date) => {
      setFilters((prev) => ({ ...prev, dataInicio: start, dataFim: end }));
    },
    []
  );

  const handleView = React.useCallback(
    (form: IFormListItem) => {
      console.log("🔍 [FormsList] Clicou em Visualizar - Form ID:", form.id);
      console.log("🔍 [FormsList] Dados do formulário:", form);
      console.log("🔍 [FormsList] SharePointService:", sharePointService);

      setSelectedForm(form);
      setIsViewerOpen(true);

      console.log(
        "🔍 [FormsList] Estado após setters - selectedForm definido e isViewerOpen=true"
      );
    },
    [sharePointService]
  );

  const handleExport = React.useCallback(async (form: IFormListItem) => {
    console.log("Exportar formulário:", form);

    try {
      // TODO: Implementar geração de Excel ou outro formato
      // Por enquanto, simular download
      const link = document.createElement("a");
      link.href = "#";
      link.download = `HSE_Dados_${form.empresa.replace(/\s+/g, "_")}_${
        form.id
      }.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("Dados exportados com sucesso");
    } catch (err) {
      console.error("Erro ao exportar dados:", err);
      alert("Erro ao exportar dados. Tente novamente.");
    }
  }, []);

  const handleDownloadPDF = React.useCallback(
    async (form: IFormListItem) => {
      console.log("🔽 [FormsList] Gerando PDF para formulário:", form.id);

      try {
        // Buscar dados completos do formulário
        const formDetails = await sharePointService.getFormDetails(form.id);

        if (!formDetails || !formDetails.DadosFormulario) {
          throw new Error("Dados do formulário não encontrados");
        }

        // Parse dos dados JSON
        const formData = JSON.parse(formDetails.DadosFormulario);

        // Gerar HTML do PDF com estilos otimizados para impressão
        const htmlContent = PDFGeneratorService.generateFormHTML(
          formData,
          context.pageContext.user.displayName,
          context.pageContext.user.email
        );

        // Criar nova aba com o HTML
        const newWindow = window.open("", "_blank");

        if (newWindow) {
          newWindow.document.write(htmlContent);
          newWindow.document.close();

          // Definir título da aba
          newWindow.document.title = `HSE Formulário - ${form.empresa}`;

          console.log(
            "✅ [FormsList] HTML aberto em nova aba para impressão/PDF"
          );
        } else {
          throw new Error(
            "Não foi possível abrir nova aba. Verifique se pop-ups estão bloqueados."
          );
        }
      } catch (err) {
        console.error("❌ [FormsList] Erro ao gerar PDF:", err);
        alert(`Erro ao gerar PDF: ${err.message || err}`);
      }
    },
    [sharePointService, context]
  );

  const handleFormUpdate = React.useCallback(
    (updatedForm: IFormListItem) => {
      // Atualizar o form na lista
      const updatedForms = forms.map((f) =>
        f.id === updatedForm.id ? updatedForm : f
      );
      setForms(updatedForms);

      // Aplicar filtros novamente
      setFilteredForms(updatedForms);
    },
    [forms]
  );

  const handleCloseViewer = React.useCallback(() => {
    console.log("❌ [FormsList] Fechando ModernFormViewer");
    setIsViewerOpen(false);
    setSelectedForm(undefined);
    console.log(
      "❌ [FormsList] Estado após fechar - isViewerOpen=false, selectedForm=undefined"
    );
  }, []);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: "export",
      text: "Exportar Dados",
      iconProps: { iconName: "Download" },
      onClick: () => console.log("Exportar todos os dados"),
    },
    {
      key: "refresh",
      text: "Atualizar",
      iconProps: { iconName: "Refresh" },
      onClick: () => loadForms().catch(console.error),
    },
  ];

  if (error) {
    return (
      <div className={styles.formsList}>
        <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
      </div>
    );
  }

  return (
    <div className={styles.formsList}>
      <div className={styles.header}>
        <Stack
          horizontal
          horizontalAlign="space-between"
          verticalAlign="center"
        >
          <Text variant="xLarge" className={styles.title}>
            📋 Gestão de Formulários HSE
          </Text>
          <CommandBar items={commandBarItems} className={styles.commandBar} />
        </Stack>
      </div>

      <div className={styles.filtersSection}>
        <Stack horizontal tokens={{ childrenGap: 16 }} wrap>
          <div className={styles.searchContainer}>
            <SearchBox
              placeholder="Buscar empresa, CNPJ..."
              value={searchTerm}
              onChange={setSearchTerm}
              onSearch={setSearchTerm}
            />
          </div>
          <div className={styles.filtersContainer}>
            <FormFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onDateRangeChange={handleDateRangeChange}
              onReset={handleResetFilters}
            />
          </div>
        </Stack>
      </div>

      <div className={styles.tableSection}>
        <FormsTable
          forms={filteredForms}
          loading={loading}
          onView={handleView}
          onExport={handleExport}
          onDownloadPDF={handleDownloadPDF}
        />
      </div>

      <div className={styles.footer}>
        <Text variant="small" className={styles.footerText}>
          📊 Mostrando {filteredForms.length} de {forms.length} formulários
        </Text>
      </div>

      {/* Modern Form Viewer */}
      <ModernFormViewer
        isOpen={isViewerOpen}
        onDismiss={handleCloseViewer}
        form={selectedForm}
        sharePointService={sharePointService}
        onFormUpdate={handleFormUpdate}
        currentUser={{
          name:
            context.pageContext.user.displayName ||
            context.pageContext.user.loginName,
          email: context.pageContext.user.email,
          photoUrl: undefined,
        }}
      />
    </div>
  );
};

export default FormsList;
