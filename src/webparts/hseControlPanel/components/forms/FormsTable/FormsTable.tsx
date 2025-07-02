import * as React from "react";
import {
  DetailsList,
  IColumn,
  DetailsListLayoutMode,
  SelectionMode,
  IconButton,
  ProgressIndicator,
} from "@fluentui/react";
import { StatusBadge, RiskBadge } from "../../ui";
import { IFormListItem } from "../../../types/IControlPanelData";
import styles from "./FormsTable.module.scss";

export interface IFormsTableProps {
  forms: IFormListItem[];
  onView?: (form: IFormListItem) => void;
  onExport?: (form: IFormListItem) => void;
  loading?: boolean;
  className?: string;
}

const FormsTable: React.FC<IFormsTableProps> = ({
  forms,
  onView,
  onExport,
  loading = false,
  className = "",
}) => {
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatCNPJ = (cnpj: string): string => {
    // Format CNPJ to XX.XXX.XXX/XXXX-XX
    const numbers = cnpj.replace(/\D/g, "");
    if (numbers.length === 14) {
      return numbers.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5"
      );
    }
    return cnpj;
  };

  const columns: IColumn[] = [
    {
      key: "company",
      name: "Empresa/CNPJ",
      fieldName: "companyName",
      minWidth: 200,
      maxWidth: 280,
      isResizable: true,
      onRender: (item: IFormListItem) => (
        <div className={styles.companyCell}>
          <div className={styles.companyName}>
            🏢 {item.companyName || item.empresa}
          </div>
          <div className={styles.companyCNPJ}>
            CNPJ: {formatCNPJ(item.cnpj)}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      name: "Status",
      fieldName: "status",
      minWidth: 120,
      maxWidth: 150,
      isResizable: true,
      onRender: (item: IFormListItem) => <StatusBadge status={item.status} />,
    },
    {
      key: "submissionDate",
      name: "Data Sub.",
      fieldName: "submissionDate",
      minWidth: 80,
      maxWidth: 100,
      isResizable: true,
      onRender: (item: IFormListItem) => (
        <span className={styles.dateCell}>
          {formatDate(
            item.submissionDate || item.dataSubmissao?.toString() || ""
          )}
        </span>
      ),
    },
    {
      key: "riskLevel",
      name: "Risco",
      fieldName: "riskLevel",
      minWidth: 80,
      maxWidth: 100,
      isResizable: true,
      onRender: (item: IFormListItem) => (
        <RiskBadge
          level={
            String(item.riskLevel || parseInt(item.grauRisco)) as
              | "1"
              | "2"
              | "3"
              | "4"
          }
        />
      ),
    },
    {
      key: "completionPercentage",
      name: "% Concl.",
      fieldName: "completionPercentage",
      minWidth: 120,
      maxWidth: 150,
      isResizable: true,
      onRender: (item: IFormListItem) => {
        const percentage =
          item.completionPercentage || item.percentualConclusao;
        return (
          <div className={styles.progressCell}>
            <ProgressIndicator
              percentComplete={percentage / 100}
              description={`${percentage}%`}
              className={styles.progressBar}
            />
          </div>
        );
      },
    },
    {
      key: "createdBy",
      name: "Criado Por",
      fieldName: "criadoPor",
      minWidth: 120,
      maxWidth: 180,
      isResizable: true,
      onRender: (item: IFormListItem) => (
        <div className={styles.companyCell}>
          <span className={styles.companyName}>
            👤 {item.criadoPor || "Sistema"}
          </span>
        </div>
      ),
    },
    {
      key: "attachments",
      name: "Anexos",
      fieldName: "attachments",
      minWidth: 60,
      maxWidth: 80,
      isResizable: false,
      onRender: (item: IFormListItem) => {
        const hasAttachments = item.anexosCount && item.anexosCount > 0;
        return (
          <div className={styles.attachmentCell}>
            {hasAttachments ? (
              <IconButton
                iconProps={{ iconName: "Attach", style: { color: "#0078d4" } }}
                title={`${item.anexosCount} anexo(s)`}
                onClick={() => onView && onView(item)}
                className={styles.attachmentButton}
              />
            ) : (
              <span style={{ color: "#a19f9d" }}>—</span>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      name: "Ações",
      fieldName: "actions",
      minWidth: 80,
      maxWidth: 100,
      isResizable: false,
      onRender: (item: IFormListItem) => (
        <div className={styles.actionsCell}>
          <IconButton
            iconProps={{ iconName: "View" }}
            title="Visualizar"
            onClick={() => onView && onView(item)}
            className={styles.actionButton}
          />
          <IconButton
            iconProps={{ iconName: "PDF" }}
            title="Exportar PDF"
            onClick={() => onExport && onExport(item)}
            className={styles.actionButton}
          />
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className={`${styles.formsTable} ${className}`}>
        <div className={styles.loadingContainer}>
          <div>Carregando formulários...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.formsTable} ${className}`}>
      <DetailsList
        items={forms}
        columns={columns}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
        isHeaderVisible={true}
        className={styles.detailsList}
      />

      {forms.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <div className={styles.emptyText}>Nenhum formulário encontrado</div>
          <div className={styles.emptySubtext}>
            Ajuste os filtros ou aguarde novas submissões
          </div>
        </div>
      )}
    </div>
  );
};

export default FormsTable;
