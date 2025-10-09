import * as React from "react";
import {
  DetailsList,
  IColumn,
  DetailsListLayoutMode,
  SelectionMode,
  DefaultButton,
  Dialog,
  DialogType,
  DialogFooter,
  PrimaryButton,
  MessageBar,
  MessageBarType,
  Icon,
  TooltipHost,
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
  onCancelForm?: (form: IFormListItem) => void;
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
  onCancelForm,
  loading = false,
  className = "",
}) => {
  // Estados para gerenciar o modal de cancelamento
  const [showCancelDialog, setShowCancelDialog] =
    React.useState<boolean>(false);
  const [formToCancel, setFormToCancel] = React.useState<IFormListItem | null>(
    null
  );
  const [cancelling, setCancelling] = React.useState<boolean>(false);

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
        Array.isArray(dadosFormulario.metadata.historicoStatusChange)
      ) {
        const statusChange = dadosFormulario.metadata.historicoStatusChange;

        // Procura por "Em Andamento" no histórico de status (array)
        const emAndamentoEntry = statusChange.find(
          (entry: { status: string; dataAlteracao?: string }) =>
            entry.status === "Em Andamento"
        );

        if (emAndamentoEntry && emAndamentoEntry.dataAlteracao) {
          return formatDate(emAndamentoEntry.dataAlteracao);
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
        Array.isArray(dadosFormulario.metadata.historicoStatusChange)
      ) {
        const statusChange = dadosFormulario.metadata.historicoStatusChange;

        // Encontra a entrada mais recente no array
        let ultimaData = null;

        for (const entry of statusChange) {
          if (entry && entry.dataAlteracao) {
            if (
              !ultimaData ||
              new Date(entry.dataAlteracao) > new Date(ultimaData)
            ) {
              ultimaData = entry.dataAlteracao;
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
        Array.isArray(dadosFormulario.metadata.historicoStatusChange)
      ) {
        const statusChange = dadosFormulario.metadata.historicoStatusChange;

        // Procura por "Em Andamento" no histórico de status para pegar quem criou
        const emAndamentoEntry = statusChange.find(
          (entry: { status: string; usuario?: string }) =>
            entry.status === "Em Andamento"
        );

        if (emAndamentoEntry && emAndamentoEntry.usuario) {
          return emAndamentoEntry.usuario;
        }
      }

      // Fallback para propriedades diretas do item
      return item.criadoPor || item.nomePreenchimento || "Sistema";
    } catch (error) {
      console.error("Erro ao extrair criado por:", error);
      return "Sistema";
    }
  };

  // Função para verificar se o formulário tem restrições
  const checkFormHasRestrictions = (form: IFormListItem): boolean => {
    try {
      if (!form.DadosFormulario && !form.metadata) return false;

      let formData: any;

      // Tentar fazer parse se for string, ou usar diretamente se já for objeto
      if (form.DadosFormulario) {
        if (typeof form.DadosFormulario === "string") {
          formData = JSON.parse(form.DadosFormulario);
        } else {
          formData = form.DadosFormulario;
        }
      } else if (form.metadata) {
        if (typeof form.metadata === "string") {
          formData = JSON.parse(form.metadata);
        } else {
          formData = form.metadata;
        }
      }

      if (!formData?.metadata?.Avaliacao) return false;

      // Verificar QuantidadeAvaliacao
      const avaliacoes = formData.metadata.Avaliacao;
      const qtdAvaliacoes = Number(avaliacoes.QuantidadeAvaliacao || 0);

      if (qtdAvaliacoes === 0) return false;

      // A última avaliação está no índice (qtdAvaliacoes - 1)
      const ultimaAvaliacao = avaliacoes[qtdAvaliacoes - 1] || avaliacoes["0"];

      return ultimaAvaliacao?.Restricao === "Sim";
    } catch (error) {
      console.error("Erro ao verificar restrições:", error);
      return false;
    }
  };

  // Funções para gerenciar o cancelamento de formulários
  const handleCancelClick = (form: IFormListItem): void => {
    setFormToCancel(form);
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = async (): Promise<void> => {
    if (!formToCancel || !onCancelForm) return;

    setCancelling(true);
    try {
      await onCancelForm(formToCancel);
      setShowCancelDialog(false);
      setFormToCancel(null);
    } catch (error) {
      console.error("Erro ao cancelar formulário:", error);
    } finally {
      setCancelling(false);
    }
  };

  const handleCancelDialogDismiss = (): void => {
    if (!cancelling) {
      setShowCancelDialog(false);
      setFormToCancel(null);
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
      minWidth: 140,
      maxWidth: 180,
      isResizable: true,
      onRender: (item: IFormListItem) => {
        const hasRestrictions = checkFormHasRestrictions(item);
        return (
          <div className={styles.statusCell}>
            <StatusBadge status={item.status} />
            {hasRestrictions && (
              <TooltipHost content="Este formulário foi aprovado com restrições">
                <span className={styles.restrictionIndicator}>
                  <Icon iconName="Warning" className={styles.warningIcon} />
                </span>
              </TooltipHost>
            )}
          </div>
        );
      },
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
      name: "Avaliador HSE",
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
      maxWidth: 280,
      isResizable: false,
      onRender: (item: IFormListItem) => {
        // Verificar se deve mostrar o botão Cancelar
        const showCancelButton =
          item.status === "Em Andamento" || item.status === "Pendente Info.";

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
              style={{ marginRight: showCancelButton ? "8px" : "0px" }}
            />
            {showCancelButton && (
              <DefaultButton
                text="Cancelar Form"
                iconProps={{ iconName: "Cancel" }}
                onClick={() => handleCancelClick(item)}
                className={styles.actionButton}
                styles={{
                  root: {
                    backgroundColor: "#fff",
                    border: "1px solid #dc3545",
                    color: "#dc3545",
                  },
                  rootHovered: {
                    backgroundColor: "#dc3545",
                    color: "#fff",
                  },
                }}
              />
            )}
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

      {/* Modal de confirmação para cancelamento */}
      <Dialog
        hidden={!showCancelDialog}
        onDismiss={handleCancelDialogDismiss}
        dialogContentProps={{
          type: DialogType.normal,
          title: "Cancelar Formulário",
          closeButtonAriaLabel: "Fechar",
          subText: "Esta ação não pode ser desfeita.",
        }}
        modalProps={{
          isBlocking: true,
          styles: { main: { maxWidth: 450 } },
        }}
      >
        {formToCancel && (
          <div style={{ marginBottom: "20px" }}>
            <MessageBar messageBarType={MessageBarType.warning}>
              ⚠️ Atenção! Esta ação não pode ser desfeita.
            </MessageBar>
            <div style={{ marginTop: "16px" }}>
              <p>Você está prestes a cancelar o seguinte formulário:</p>
              <ul style={{ marginLeft: "20px" }}>
                <li>
                  <strong>Empresa:</strong>{" "}
                  {formToCancel.companyName || formToCancel.empresa}
                </li>
                <li>
                  <strong>CNPJ:</strong> {formatCNPJ(formToCancel.cnpj)}
                </li>
              </ul>
              <p>
                O formulário não aparecerá mais na listagem padrão após o
                cancelamento.
              </p>
            </div>
          </div>
        )}
        <DialogFooter>
          <DefaultButton
            onClick={handleCancelDialogDismiss}
            text="Não, voltar"
            disabled={cancelling}
          />
          <PrimaryButton
            onClick={handleCancelConfirm}
            text={cancelling ? "Cancelando..." : "Sim, cancelar"}
            disabled={cancelling}
            styles={{
              root: {
                backgroundColor: "#dc3545",
                borderColor: "#dc3545",
              },
              rootHovered: {
                backgroundColor: "#c82333",
                borderColor: "#bd2130",
              },
            }}
          />
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default FormsTable;
