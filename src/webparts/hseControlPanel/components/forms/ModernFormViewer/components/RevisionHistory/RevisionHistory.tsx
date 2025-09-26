import * as React from "react";
import {
  Stack,
  Text,
  Icon,
  DetailsList,
  IColumn,
  DetailsListLayoutMode,
  SelectionMode,
} from "@fluentui/react";
import styles from "./RevisionHistory.module.scss";

export interface IRevisionHistoryItem {
  numeroRevisao: number;
  data: string;
  usuario: string;
  email: string;
  tipoOperacao: string;
  alteracoes: Array<{
    campo: string;
    tipo: "adicionado" | "alterado" | "removido";
    valorAnterior?: string | boolean;
    valorNovo?: string | boolean;
  }>;
  totalAlteracoes: number;
  resumo: string;
}

export interface IRevisionHistoryProps {
  historicoRevisoes: IRevisionHistoryItem[];
}

const RevisionHistory: React.FC<IRevisionHistoryProps> = ({
  historicoRevisoes,
}) => {
  // Removido cardTokens pois Card não está disponível

  // Função para formatar data
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Função para obter ícone do tipo de operação
  const getOperationIcon = (tipoOperacao: string): string => {
    switch (tipoOperacao) {
      case "Rascunho Criado":
        return "DocumentAdd";
      case "Formulário Enviado":
        return "Send";
      case "Formulário Editado":
        return "Edit";
      default:
        return "History";
    }
  };

  // Função para obter cor do tipo de operação
  const getOperationColor = (tipoOperacao: string): string => {
    switch (tipoOperacao) {
      case "Rascunho Criado":
        return "#28a745";
      case "Formulário Enviado":
        return "#007bff";
      case "Formulário Editado":
        return "#ffc107";
      default:
        return "#6c757d";
    }
  };

  // Colunas para a lista de alterações
  const alteracoesColumns: IColumn[] = [
    {
      key: "tipo",
      name: "Tipo",
      fieldName: "tipo",
      minWidth: 80,
      maxWidth: 100,
      onRender: (item) => {
        const iconName =
          item.tipo === "adicionado"
            ? "Add"
            : item.tipo === "alterado"
            ? "Edit"
            : "Delete";
        const color =
          item.tipo === "adicionado"
            ? "#28a745"
            : item.tipo === "alterado"
            ? "#ffc107"
            : "#dc3545";
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Icon iconName={iconName} style={{ color, fontSize: "14px" }} />
            <Text
              variant="small"
              style={{ color, fontWeight: "600", textTransform: "capitalize" }}
            >
              {item.tipo}
            </Text>
          </div>
        );
      },
    },
    {
      key: "campo",
      name: "Campo",
      fieldName: "campo",
      minWidth: 200,
      maxWidth: 300,
      onRender: (item) => (
        <Text
          variant="small"
          style={{ fontFamily: "monospace", color: "#495057" }}
        >
          {item.campo}
        </Text>
      ),
    },
    {
      key: "valor",
      name: "Valor",
      fieldName: "valor",
      minWidth: 200,
      onRender: (item) => {
        if (item.tipo === "alterado") {
          return (
            <div>
              <Text
                variant="small"
                style={{ color: "#dc3545", textDecoration: "line-through" }}
              >
                {String(item.valorAnterior)}
              </Text>
              <br />
              <Text
                variant="small"
                style={{ color: "#28a745", fontWeight: "600" }}
              >
                {String(item.valorNovo)}
              </Text>
            </div>
          );
        } else {
          return (
            <Text
              variant="small"
              style={{ color: "#28a745", fontWeight: "600" }}
            >
              {String(item.valorNovo)}
            </Text>
          );
        }
      },
    },
  ];

  if (!historicoRevisoes || historicoRevisoes.length === 0) {
    return (
      <div className={styles.revisionHistory}>
        <Stack
          horizontalAlign="center"
          verticalAlign="center"
          tokens={{ childrenGap: 16 }}
        >
          <Icon
            iconName="History"
            style={{ fontSize: "48px", color: "#6c757d" }}
          />
          <Text variant="large" style={{ color: "#6c757d" }}>
            Nenhum histórico de revisões encontrado
          </Text>
        </Stack>
      </div>
    );
  }

  return (
    <div className={styles.revisionHistory}>
      <Stack tokens={{ childrenGap: 24 }}>
        {/* Cabeçalho */}
        <Stack
          horizontal
          horizontalAlign="space-between"
          verticalAlign="center"
        >
          <div>
            <Text
              variant="xxLarge"
              style={{ fontWeight: "700", color: "#2c3e50" }}
            >
              📜 Timeline
            </Text>
          </div>
          <div className={styles.revisionCounter}>
            <Text
              variant="large"
              style={{ fontWeight: "600", color: "#fdfdfdff" }}
            >
              {historicoRevisoes.length} Revisões
            </Text>
          </div>
        </Stack>

        {/* Timeline das revisões */}
        <div className={styles.timeline}>
          {historicoRevisoes
            .slice()
            .reverse() // Mostrar mais recente primeiro
            .map((revisao, index) => (
              <div key={revisao.numeroRevisao} className={styles.timelineItem}>
                {/* Linha da timeline */}
                {index < historicoRevisoes.length - 1 && (
                  <div className={styles.timelineLine} />
                )}

                {/* Ícone da timeline */}
                <div
                  className={styles.timelineIcon}
                  style={{
                    backgroundColor: getOperationColor(revisao.tipoOperacao),
                  }}
                >
                  <Icon
                    iconName={getOperationIcon(revisao.tipoOperacao)}
                    style={{ color: "white", fontSize: "16px" }}
                  />
                </div>

                {/* Card da revisão */}
                <div className={styles.revisionCard}>
                  <Stack tokens={{ childrenGap: 16 }}>
                    {/* Cabeçalho da revisão */}
                    <Stack tokens={{ childrenGap: 8 }}>
                      {/* Primeira linha: Número da revisão e data */}
                      <Stack
                        horizontal
                        horizontalAlign="space-between"
                        verticalAlign="center"
                      >
                        <Text
                          variant="large"
                          style={{ fontWeight: "700", color: "#2c3e50" }}
                        >
                          Revisão #{revisao.numeroRevisao}
                        </Text>
                        <Text
                          variant="medium"
                          style={{ fontWeight: "600", color: "#495057" }}
                        >
                          {formatDate(revisao.data)}
                        </Text>
                      </Stack>

                      {/* Segunda linha: Tipo de operação e autor */}
                      <Stack
                        horizontal
                        horizontalAlign="space-between"
                        verticalAlign="center"
                      >
                        <Text
                          variant="medium"
                          style={{
                            color: getOperationColor(revisao.tipoOperacao),
                            fontWeight: "600",
                          }}
                        >
                          {revisao.tipoOperacao}
                        </Text>
                        <Text variant="small" style={{ color: "#6c757d" }}>
                          por {revisao.usuario}
                        </Text>
                      </Stack>
                    </Stack>

                    {/* Resumo */}
                    <div className={styles.summarySection}>
                      <Text
                        variant="medium"
                        style={{ fontWeight: "600", color: "#495057" }}
                      >
                        {revisao.resumo}
                      </Text>
                    </div>

                    {/* Lista de alterações */}
                    <div className={styles.changesSection}>
                      <Text
                        variant="mediumPlus"
                        style={{
                          fontWeight: "600",
                          color: "#2c3e50",
                          marginBottom: "12px",
                        }}
                      >
                        📋 Detalhes das Alterações
                      </Text>
                      <DetailsList
                        items={revisao.alteracoes}
                        columns={alteracoesColumns}
                        layoutMode={DetailsListLayoutMode.justified}
                        selectionMode={SelectionMode.none}
                        compact={true}
                        className={styles.changesList}
                      />
                    </div>
                  </Stack>
                </div>
              </div>
            ))}
        </div>
      </Stack>
    </div>
  );
};

export default RevisionHistory;
