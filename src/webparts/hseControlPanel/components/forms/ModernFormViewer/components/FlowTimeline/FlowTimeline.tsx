import * as React from "react";
import { IHSEFormData } from "../../../../../types/IHSEFormData";
import styles from "./FlowTimeline.module.scss";

export interface IFlowTimelineProps {
  formData: IHSEFormData;
}

export interface ITimelineStep {
  status: string;
  timestamp: string;
  user: string;
  email: string;
  duration?: string;
  isCurrentStatus?: boolean;
  hasRestrictions?: boolean;
  restrictionsCount?: number;
}

interface IHistoricoEntry {
  status: string;
  dataAlteracao: string;
  usuario: string;
  email: string;
}

const statusColors: { [key: string]: string } = {
  "Em Andamento": "#ffb366", // Laranja mais suave
  Enviado: "#5a9fd4", // Azul mais suave
  "Em Análise": "#a688d4", // Roxo mais suave
  Aprovado: "#4a9c4a", // Verde mais suave
  Rejeitado: "#d16666", // Vermelho mais suave
  "Pendente Info.": "#c87bbbff", // Roxo mais suave
};

const FlowTimeline: React.FC<IFlowTimelineProps> = ({ formData }) => {
  const [timelineSteps, setTimelineSteps] = React.useState<ITimelineStep[]>([]);
  const [totalProcessTime, setTotalProcessTime] = React.useState<string>("");

  // Função para verificar se uma avaliação tem restrições
  const checkEvaluationRestrictions = (
    timestamp: string
  ): { hasRestrictions: boolean; restrictionsCount: number } => {
    try {
      console.log("🔍 Verificando restrições para timestamp:", timestamp);

      const formDataWithMetadata = formData as unknown as {
        metadata?: {
          Avaliacao?: {
            [key: string]: {
              HSEResponsavel?: string;
              DataInicio?: string;
              DataFim?: string;
              Comentarios?: string;
              StatusAvaliacao?: string;
              Restricao?: string; // "Sim" ou "Não"
              CamposRestricao?: Array<{
                id: number;
                secao: string;
                campo: string;
                nomeExibicao: string;
                motivo?: string;
              }>;
            };
          } & {
            QuantidadeAvaliacao?: number;
          };
        };
      };

      const avaliacaoObj = formDataWithMetadata?.metadata?.Avaliacao;
      console.log("🔍 Objeto Avaliacao encontrado:", avaliacaoObj);

      if (!avaliacaoObj) {
        console.log("🔍 Nenhuma avaliação encontrada");
        return { hasRestrictions: false, restrictionsCount: 0 };
      }

      // Percorrer as chaves numéricas do objeto de avaliação
      const avaliacaoKeys = Object.keys(avaliacaoObj).filter(
        (key) => key !== "QuantidadeAvaliacao"
      );
      console.log("🔍 Chaves de avaliação encontradas:", avaliacaoKeys);

      for (const key of avaliacaoKeys) {
        const avaliacao = avaliacaoObj[key];
        console.log(`🔍 Verificando avaliação [${key}]:`, avaliacao);

        // Verificar se Restricao é "Sim" e há campos de restrição
        if (
          avaliacao.Restricao === "Sim" &&
          avaliacao.CamposRestricao &&
          avaliacao.CamposRestricao.length > 0
        ) {
          console.log(
            "🔍 Restrições encontradas:",
            avaliacao.CamposRestricao.length
          );
          return {
            hasRestrictions: true,
            restrictionsCount: avaliacao.CamposRestricao.length,
          };
        }
      }

      console.log("🔍 Nenhuma restrição encontrada");
      return { hasRestrictions: false, restrictionsCount: 0 };
    } catch (error) {
      console.error("Erro ao verificar restrições de avaliação:", error);
      return { hasRestrictions: false, restrictionsCount: 0 };
    }
  };

  // Função para normalizar historicoStatusChange sempre para array
  const normalizeHistoricoToArray = (historico: unknown): IHistoricoEntry[] => {
    console.log("🔍 normalizeHistoricoToArray - Entrada:", historico);

    if (!historico) {
      console.log("🔍 normalizeHistoricoToArray - Histórico vazio");
      return [];
    }

    if (Array.isArray(historico)) {
      console.log(
        "🔍 normalizeHistoricoToArray - Já é array, retornando:",
        historico
      );
      return historico as IHistoricoEntry[];
    }

    // Se for um objeto com chaves numéricas (como "0", "1", "2"), converter para array
    if (typeof historico === "object" && historico !== null) {
      const historicoObj = historico as Record<string, unknown>;
      const keys = Object.keys(historicoObj);
      console.log("🔍 normalizeHistoricoToArray - Chaves do objeto:", keys);

      // Verificar se as chaves são numéricas sequenciais
      const numericKeys = keys
        .filter((key) => /^\d+$/.test(key))
        .sort((a, b) => parseInt(a) - parseInt(b));

      console.log(
        "🔍 normalizeHistoricoToArray - Chaves numéricas:",
        numericKeys
      );

      if (numericKeys.length > 0) {
        // Converter objeto com chaves numéricas para array
        const result = numericKeys.map(
          (key) => historicoObj[key] as IHistoricoEntry
        );
        console.log(
          "🔍 normalizeHistoricoToArray - Convertido para array:",
          result
        );
        return result;
      }
    }

    console.log(
      "🔍 normalizeHistoricoToArray - Formato não reconhecido, retornando array vazio"
    );
    return [];
  };

  const calculateDuration = (start: Date, end: Date): string => {
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h`;
    } else if (diffHours > 0) {
      return `${diffHours}h`;
    } else {
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${diffMinutes}m`;
    }
  };

  const calculateTotalProcessTime = (steps: ITimelineStep[]): string => {
    if (steps.length === 0) return "";

    const firstStep = steps[0];
    const lastStep = steps[steps.length - 1];

    const startDate = new Date(firstStep.timestamp);
    const endDate = new Date(lastStep.timestamp);

    const diffMs = endDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} dias, ${diffHours} horas`;
    } else if (diffHours > 0) {
      return `${diffHours} horas, ${diffMinutes} minutos`;
    } else {
      return `${diffMinutes} minutos`;
    }
  };

  const processTimelineArrayData = (
    historicoArray: IHistoricoEntry[],
    currentStatus: string
  ): ITimelineStep[] => {
    try {
      const steps: ITimelineStep[] = [];

      // Ordenar por dataAlteracao (mais antigo primeiro)
      const sortedEntries = [...historicoArray].sort((a, b) => {
        return (
          new Date(a.dataAlteracao).getTime() -
          new Date(b.dataAlteracao).getTime()
        );
      });

      sortedEntries.forEach((entry, index) => {
        let duration = "";

        // Calcular duração se não for o último step
        if (index < sortedEntries.length - 1) {
          const currentTime = new Date(entry.dataAlteracao);
          const nextTime = new Date(sortedEntries[index + 1].dataAlteracao);
          duration = calculateDuration(currentTime, nextTime);
        } else if (entry.status !== currentStatus) {
          // Se não é o status atual, calcular até agora
          const currentTime = new Date(entry.dataAlteracao);
          const now = new Date();
          duration = calculateDuration(currentTime, now);
        }

        // Verificar se é uma aprovação com restrições
        let hasRestrictions = false;
        let restrictionsCount = 0;
        if (entry.status === "Aprovado") {
          const restrictions = checkEvaluationRestrictions(entry.dataAlteracao);
          hasRestrictions = restrictions.hasRestrictions;
          restrictionsCount = restrictions.restrictionsCount;
        }

        steps.push({
          status: entry.status,
          timestamp: entry.dataAlteracao,
          user: entry.usuario || "",
          email: entry.email || "",
          duration: duration,
          isCurrentStatus: entry.status === currentStatus,
          hasRestrictions: hasRestrictions,
          restrictionsCount: restrictionsCount,
        });
      });

      return steps;
    } catch (error) {
      console.error("Erro ao processar histórico array:", error);
      return [];
    }
  };

  React.useEffect(() => {
    // Verificar múltiplas estruturas possíveis para encontrar o histórico
    const formDataExtended = formData as IHSEFormData & {
      metadata?: {
        historicoStatusChange?: IHistoricoEntry[];
      };
      status?: string;
    };

    // Tentar buscar histórico em diferentes locais
    let historicoField: IHistoricoEntry[] = [];

    // 1. Primeiro, tentar em formData.metadata.historicoStatusChange (estrutura completa do JSON)
    if (formDataExtended.metadata?.historicoStatusChange) {
      console.log(
        "🔍 FlowTimeline - Histórico encontrado em metadata:",
        formDataExtended.metadata.historicoStatusChange
      );
      historicoField = normalizeHistoricoToArray(
        formDataExtended.metadata.historicoStatusChange
      );
    }
    // 2. Segundo, tentar em formData.historicoStatusChange (interface IHSEFormData)
    else if (formData.historicoStatusChange) {
      console.log(
        "🔍 FlowTimeline - Histórico encontrado em root:",
        formData.historicoStatusChange
      );
      historicoField = normalizeHistoricoToArray(
        formData.historicoStatusChange
      );
    }

    const currentStatus =
      formDataExtended.status || formData.status || "Em Andamento";

    console.log("🔍 FlowTimeline - Dados recebidos:", {
      hasMetadata: !!formDataExtended.metadata,
      hasHistoricoInMetadata:
        !!formDataExtended.metadata?.historicoStatusChange,
      hasHistoricoInRoot: !!formData.historicoStatusChange,
      historicoField,
      currentStatus,
      isArray: Array.isArray(historicoField),
      fullFormData: formData,
    });

    if (historicoField && historicoField.length > 0) {
      console.log("🔍 FlowTimeline - Processando histórico como array");
      const steps = processTimelineArrayData(historicoField, currentStatus);
      setTimelineSteps(steps);
      setTotalProcessTime(calculateTotalProcessTime(steps));
    } else {
      console.log(
        "🔍 FlowTimeline - Nenhum histórico encontrado, criando entrada básica"
      );
      // Se não há histórico, criar entrada básica baseada no status atual
      const currentStep: ITimelineStep = {
        status: currentStatus,
        timestamp: new Date().toISOString(),
        user: "Sistema",
        email: "",
        isCurrentStatus: true,
      };
      setTimelineSteps([currentStep]);
      setTotalProcessTime("");
    }
  }, [
    formData,
    calculateDuration,
    processTimelineArrayData,
    calculateTotalProcessTime,
  ]);

  const formatDate = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return timestamp;
    }
  };

  if (!timelineSteps.length) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📋</div>
        <h3>Nenhum histórico disponível</h3>
        <p>
          O histórico de status será exibido aqui quando houver mudanças no
          formulário.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.timelineContainer}>
      {totalProcessTime && (
        <div className={styles.totalTime}>
          <span className={styles.totalTimeIcon}>⏰</span>
          <span className={styles.totalTimeText}>
            <strong>Tempo total do processo:</strong> {totalProcessTime}
          </span>
        </div>
      )}

      <div className={styles.timeline}>
        {timelineSteps.map((step, index) => (
          <div key={index} className={styles.timelineItem}>
            <div className={styles.timelineStep}>
              <div
                className={`${styles.stepBlock} ${
                  step.isCurrentStatus ? styles.currentStep : ""
                }`}
                style={{
                  backgroundColor: statusColors[step.status] || "#0078d4",
                }}
              >
                <div className={styles.stepNumber}>{index + 1}</div>
                <div className={styles.stepStatus}>
                  {step.status}{" "}
                  {step.hasRestrictions && (
                    <span
                      className={styles.restrictionBadge}
                      title={`Aprovação com ${
                        step.restrictionsCount
                      } restrição${step.restrictionsCount !== 1 ? "ões" : ""}`}
                    >
                      ⚠️ {step.restrictionsCount}{" "}
                      {step.restrictionsCount !== 1
                        ? "restrições"
                        : "restrição"}
                    </span>
                  )}
                </div>
                <div className={styles.stepDate}>
                  {formatDate(step.timestamp)}
                </div>
                {step.user && (
                  <div className={styles.stepUser}>👤 {step.user}</div>
                )}
              </div>

              {index < timelineSteps.length - 1 && (
                <div className={styles.arrowContainer}>
                  <div className={styles.arrow}>
                    <div className={styles.arrowLine} />
                    <div className={styles.arrowHead}>▶</div>
                  </div>
                  {step.duration && (
                    <div className={styles.duration}>⏱️ {step.duration}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlowTimeline;
