import * as React from "react";
import {
  DetailsList,
  IColumn,
  DetailsListLayoutMode,
  SelectionMode,
  DefaultButton,
} from "@fluentui/react";
import { StatusBadge, UserCard } from "../../ui";
import { IFormListItem } from "../../../types/IControlPanelData";
import styles from "./FormsTable.module.scss";

export interface IFormsTableProps {
  forms: IFormListItem[];
  onView?: (form: IFormListItem) => void;
  onExport?: (form: IFormListItem) => void;
  onStartReview?: (form: IFormListItem) => void;
  onDownloadPDF?: (form: IFormListItem) => void;
  onDownloadAttachments?: (form: IFormListItem) => void;
  loading?: boolean;
  className?: string;
}

const FormsTable: React.FC<IFormsTableProps> = ({
  forms,
  onView,
  onExport,
  onStartReview,
  onDownloadPDF,
  onDownloadAttachments,
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

  // Função para extrair data de criação do JSON DadosFormulario
  const getCreationDate = (item: IFormListItem): string => {
    try {
      // O JSON está na propriedade DadosFormulario
      let dadosFormulario = null;

      if (item.metadata) {
        dadosFormulario =
          typeof item.metadata === "string"
            ? JSON.parse(item.metadata)
            : item.metadata;
      } else if (item.DadosFormulario) {
        dadosFormulario =
          typeof item.DadosFormulario === "string"
            ? JSON.parse(item.DadosFormulario)
            : item.DadosFormulario;
      }

      if (
        dadosFormulario &&
        dadosFormulario.metadata &&
        dadosFormulario.metadata.historicoStatusChange
      ) {
        const statusChange = dadosFormulario.metadata.historicoStatusChange;

        // Procura por "Em Andamento" no histórico de status
        if (
          statusChange["Em Andamento"] &&
          statusChange["Em Andamento"].dataAlteracao
        ) {
          return formatDate(statusChange["Em Andamento"].dataAlteracao);
        }
      }

      // Fallback para dataSubmissao se não encontrar no metadata
      if (item.dataSubmissao) {
        return formatDate(item.dataSubmissao.toString());
      }

      return "N/A";
    } catch (error) {
      console.error("Erro ao extrair data de criação:", error);
      return "N/A";
    }
  };

  // Função para extrair data do último status do JSON DadosFormulario
  const getLastStatusDate = (item: IFormListItem): string => {
    try {
      // O JSON está na propriedade DadosFormulario
      let dadosFormulario = null;

      if (item.metadata) {
        dadosFormulario =
          typeof item.metadata === "string"
            ? JSON.parse(item.metadata)
            : item.metadata;
      } else if (item.DadosFormulario) {
        dadosFormulario =
          typeof item.DadosFormulario === "string"
            ? JSON.parse(item.DadosFormulario)
            : item.DadosFormulario;
      }

      if (
        dadosFormulario &&
        dadosFormulario.metadata &&
        dadosFormulario.metadata.historicoStatusChange
      ) {
        const statusChange = dadosFormulario.metadata.historicoStatusChange;

        // Pega todas as chaves de status e encontra a mais recente
        const statusKeys = Object.keys(statusChange);
        let ultimaData = null;

        for (const status of statusKeys) {
          const statusData = statusChange[status];
          if (statusData && statusData.dataAlteracao) {
            if (
              !ultimaData ||
              new Date(statusData.dataAlteracao) > new Date(ultimaData)
            ) {
              ultimaData = statusData.dataAlteracao;
            }
          }
        }

        if (ultimaData) {
          return formatDate(ultimaData);
        }
      }

      // Fallback para dataAvaliacao ou dataSubmissao
      if (item.dataAvaliacao) {
        return formatDate(item.dataAvaliacao.toString());
      } else if (item.dataSubmissao) {
        return formatDate(item.dataSubmissao.toString());
      }

      return "N/A";
    } catch (error) {
      console.error("Erro ao extrair data do último status:", error);
      return "N/A";
    }
  };

  // Função para extrair número da revisão do JSON DadosFormulario
  const getRevisionNumber = (item: IFormListItem): string => {
    try {
      // O JSON está na propriedade DadosFormulario ou similar
      let dadosFormulario = null;

      // Tenta diferentes propriedades onde pode estar o JSON
      if (item.metadata) {
        dadosFormulario =
          typeof item.metadata === "string"
            ? JSON.parse(item.metadata)
            : item.metadata;
      } else if (item.DadosFormulario) {
        dadosFormulario =
          typeof item.DadosFormulario === "string"
            ? JSON.parse(item.DadosFormulario)
            : item.DadosFormulario;
      }

      if (
        dadosFormulario &&
        dadosFormulario.metadata &&
        dadosFormulario.metadata.historicoRevisoes
      ) {
        const historicoRevisoes = dadosFormulario.metadata.historicoRevisoes;

        if (Array.isArray(historicoRevisoes) && historicoRevisoes.length > 0) {
          // Pega o último item do array de revisões
          const ultimaRevisao = historicoRevisoes[historicoRevisoes.length - 1];

          if (ultimaRevisao && ultimaRevisao.numeroRevisao !== undefined) {
            return `Rev. ${ultimaRevisao.numeroRevisao}`;
          }
        }
      }

      return "Rev. 1";
    } catch (error) {
      console.error("Erro ao extrair número da revisão:", error);
      return "Rev. 1";
    }
  };

  // Função para extrair criado por do JSON DadosFormulario
  const getCreatedBy = (item: IFormListItem): string => {
    try {
      // O JSON está na propriedade DadosFormulario
      let dadosFormulario = null;

      if (item.metadata) {
        dadosFormulario =
          typeof item.metadata === "string"
            ? JSON.parse(item.metadata)
            : item.metadata;
      } else if (item.DadosFormulario) {
        dadosFormulario =
          typeof item.DadosFormulario === "string"
            ? JSON.parse(item.DadosFormulario)
            : item.DadosFormulario;
      }

      if (
        dadosFormulario &&
        dadosFormulario.metadata &&
        dadosFormulario.metadata.historicoStatusChange
      ) {
        const statusChange = dadosFormulario.metadata.historicoStatusChange;

        // Procura por "Em Andamento" no histórico de status para pegar quem criou
        if (
          statusChange["Em Andamento"] &&
          statusChange["Em Andamento"].usuario
        ) {
          return statusChange["Em Andamento"].usuario;
        }
      }

      // Fallback para propriedades diretas do item
      return item.criadoPor || item.nomePreenchimento || "Sistema";
    } catch (error) {
      console.error("Erro ao extrair criado por:", error);
      return "Sistema";
    }
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
      key: "creationDate",
      name: "Data de Criação",
      fieldName: "creationDate",
      minWidth: 100,
      maxWidth: 120,
      isResizable: true,
      onRender: (item: IFormListItem) => (
        <span className={styles.dateCell}>{getCreationDate(item)}</span>
      ),
    },
    {
      key: "lastStatusDate",
      name: "Data do Status Atual",
      fieldName: "lastStatusDate",
      minWidth: 100,
      maxWidth: 120,
      isResizable: true,
      onRender: (item: IFormListItem) => (
        <span className={styles.dateCell}>{getLastStatusDate(item)}</span>
      ),
    },
    {
      key: "createdBy",
      name: "Criado Por",
      fieldName: "criadoPor",
      minWidth: 120,
      maxWidth: 150,
      isResizable: true,
      onRender: (item: IFormListItem) => (
        <div className={styles.companyCell}>
          <span className={styles.companyName}>👤 {getCreatedBy(item)}</span>
        </div>
      ),
    },
    {
      key: "revisionNumber",
      name: "Revisão Atual",
      fieldName: "revisionNumber",
      minWidth: 100,
      maxWidth: 120,
      isResizable: true,
      onRender: (item: IFormListItem) => (
        <div className={styles.companyCell}>
          <span className={styles.companyName}>
            📝 {getRevisionNumber(item)}
          </span>
        </div>
      ),
    },
    {
      key: "assignedReviewer",
      name: "Revisor",
      fieldName: "assignedReviewer",
      minWidth: 150,
      maxWidth: 200,
      isResizable: true,
      onRender: (item: IFormListItem) => {
        // Usa o usuário de análise já processado pelo FormsList
        if (item.usuarioAnalise) {
          return (
            <UserCard
              user={item.usuarioAnalise}
              showNotSelected={false}
              className={styles.userCell}
            />
          );
        } else {
          // Fallback para avaliador atribuído se não tiver usuário de análise
          return (
            <UserCard
              user={item.avaliadorAtribuido}
              showNotSelected={true}
              className={styles.userCell}
            />
          );
        }
      },
    },
    {
      key: "actions",
      name: "Ações",
      fieldName: "actions",
      minWidth: 180,
      maxWidth: 200,
      isResizable: false,
      onRender: (item: IFormListItem) => {
        return (
          <div className={styles.actionsCell}>
            <DefaultButton
              text="Visualizar"
              iconProps={{ iconName: "View" }}
              onClick={() => onView && onView(item)}
              className={styles.actionButton}
              style={{ marginRight: "8px" }}
            />
            <DefaultButton
              text="Download Form"
              iconProps={{ iconName: "PDF" }}
              onClick={() => onDownloadPDF && onDownloadPDF(item)}
              className={styles.actionButton}
            />
          </div>
        );
      },
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
