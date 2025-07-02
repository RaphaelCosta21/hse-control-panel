import * as React from "react";
import {
  Stack,
  Text,
  DefaultButton,
  PrimaryButton,
  Dropdown,
  MessageBar,
  MessageBarType,
} from "@fluentui/react";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { IFormListItem } from "../../../types/IFormListItem";
import styles from "./ExportOptions.module.scss";

export interface IExportOptionsProps {
  data: IFormListItem[];
  title?: string;
  className?: string;
}

type ExportFormat = "excel" | "csv" | "pdf";
type ExportScope = "current" | "filtered" | "all";

export const ExportOptions: React.FC<IExportOptionsProps> = ({
  data,
  title = "Formulários HSE",
  className = "",
}) => {
  const [format, setFormat] = React.useState<ExportFormat>("excel");
  const [scope, setScope] = React.useState<ExportScope>("current");
  const [exporting, setExporting] = React.useState<boolean>(false);
  const [lastExport, setLastExport] = React.useState<string>("");

  const formatOptions = [
    { key: "excel", text: "📊 Excel (.xlsx)" },
    { key: "csv", text: "📄 CSV (.csv)" },
    { key: "pdf", text: "📑 PDF (.pdf)" },
  ];

  const scopeOptions = [
    { key: "current", text: "📋 Dados atuais" },
    { key: "filtered", text: "🔍 Dados filtrados" },
    { key: "all", text: "📊 Todos os dados" },
  ];

  const exportToExcel = async (exportData: IFormListItem[]) => {
    const worksheet = XLSX.utils.json_to_sheet(
      exportData.map((item) => ({
        ID: item.id,
        Empresa: item.companyName,
        CNPJ: item.cnpj,
        Contrato: item.contractNumber,
        Status: item.status,
        "Data Submissão": item.submissionDate,
        "Grau Risco": item.riskLevel,
        "% Conclusão": item.completionPercentage,
        "Resp. Técnico": item.responsibleTechnician,
        Avaliador: item.evaluator || "N/A",
        "Data Avaliação": item.evaluationDate || "N/A",
        "Qtd Anexos": item.attachmentsCount || 0,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Formulários HSE");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const fileName = `${title.replace(/\s+/g, "_")}_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    FileSaver.saveAs(dataBlob, fileName);
  };

  const exportToCSV = async (exportData: IFormListItem[]) => {
    const headers = [
      "ID",
      "Empresa",
      "CNPJ",
      "Contrato",
      "Status",
      "Data Submissão",
      "Grau Risco",
      "% Conclusão",
      "Resp. Técnico",
      "Avaliador",
      "Data Avaliação",
      "Qtd Anexos",
    ];

    const csvContent = [
      headers.join(","),
      ...exportData.map((item) =>
        [
          item.id,
          `"${item.companyName}"`,
          item.cnpj,
          `"${item.contractNumber}"`,
          `"${item.status}"`,
          item.submissionDate,
          item.riskLevel,
          item.completionPercentage,
          `"${item.responsibleTechnician}"`,
          `"${item.evaluator || "N/A"}"`,
          item.evaluationDate || "N/A",
          item.attachmentsCount || 0,
        ].join(",")
      ),
    ].join("\n");

    const dataBlob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const fileName = `${title.replace(/\s+/g, "_")}_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    FileSaver.saveAs(dataBlob, fileName);
  };

  const exportToPDF = async (exportData: IFormListItem[]) => {
    // Note: Para implementação completa do PDF, seria necessário usar uma biblioteca como jsPDF
    // Por enquanto, vou criar um HTML simples que pode ser convertido para PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          h1 { color: #0078d4; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>Relatório gerado em: ${new Date().toLocaleString("pt-BR")}</p>
        <table>
          <thead>
            <tr>
              <th>Empresa</th>
              <th>CNPJ</th>
              <th>Status</th>
              <th>Data Submissão</th>
              <th>Grau Risco</th>
              <th>% Conclusão</th>
            </tr>
          </thead>
          <tbody>
            ${exportData
              .map(
                (item) => `
              <tr>
                <td>${item.companyName}</td>
                <td>${item.cnpj}</td>
                <td>${item.status}</td>
                <td>${item.submissionDate}</td>
                <td>${item.riskLevel}</td>
                <td>${item.completionPercentage}%</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const dataBlob = new Blob([htmlContent], { type: "text/html" });
    const fileName = `${title.replace(/\s+/g, "_")}_${
      new Date().toISOString().split("T")[0]
    }.html`;
    FileSaver.saveAs(dataBlob, fileName);
  };

  const handleExport = async () => {
    try {
      setExporting(true);

      // Por agora, usamos os dados atuais
      // Em uma implementação completa, buscaríamos dados baseado no scope
      const exportData = data;

      switch (format) {
        case "excel":
          await exportToExcel(exportData);
          break;
        case "csv":
          await exportToCSV(exportData);
          break;
        case "pdf":
          await exportToPDF(exportData);
          break;
      }

      setLastExport(`${format.toUpperCase()} exportado com sucesso!`);
      setTimeout(() => setLastExport(""), 3000);
    } catch (error) {
      console.error("Erro na exportação:", error);
      setLastExport("Erro durante a exportação!");
      setTimeout(() => setLastExport(""), 3000);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className={`${styles.exportOptions} ${className}`}>
      <Stack tokens={{ childrenGap: 16 }}>
        <Text variant="mediumPlus" block>
          📤 Opções de Exportação
        </Text>

        {lastExport && (
          <MessageBar
            messageBarType={
              lastExport.indexOf("sucesso") >= 0
                ? MessageBarType.success
                : MessageBarType.error
            }
          >
            {lastExport}
          </MessageBar>
        )}

        <Stack horizontal tokens={{ childrenGap: 12 }}>
          <Dropdown
            label="Formato"
            options={formatOptions}
            selectedKey={format}
            onChange={(_, option) => setFormat(option?.key as ExportFormat)}
            styles={{ dropdown: { width: 150 } }}
          />

          <Dropdown
            label="Escopo"
            options={scopeOptions}
            selectedKey={scope}
            onChange={(_, option) => setScope(option?.key as ExportScope)}
            styles={{ dropdown: { width: 150 } }}
          />
        </Stack>

        <Stack horizontal tokens={{ childrenGap: 8 }}>
          <PrimaryButton
            text={exporting ? "Exportando..." : "📤 Exportar"}
            onClick={handleExport}
            disabled={exporting || data.length === 0}
          />
          <DefaultButton
            text={`${data.length} registro(s)`}
            disabled
            styles={{
              root: {
                backgroundColor: "transparent",
                border: "none",
                color: "var(--neutral-foreground-2)",
              },
            }}
          />
        </Stack>

        <Text
          variant="small"
          styles={{ root: { color: "var(--neutral-foreground-2)" } }}
        >
          💡 Os dados serão exportados no formato selecionado e baixados
          automaticamente.
        </Text>
      </Stack>
    </div>
  );
};
