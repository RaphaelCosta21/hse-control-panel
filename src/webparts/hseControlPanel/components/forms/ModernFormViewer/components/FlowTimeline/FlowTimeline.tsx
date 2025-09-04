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

  // Função para normalizar historicoStatusChange sempre para array
  const normalizeHistoricoToArray = (historico: unknown): IHistoricoEntry[] => {
    if (!historico) return [];

    if (Array.isArray(historico)) {
      return historico as IHistoricoEntry[];
    }

    // Se for um objeto com chaves numéricas (como "0", "1", "2"), converter para array
    if (typeof historico === "object" && historico !== null) {
      const historicoObj = historico as Record<string, unknown>;
      const keys = Object.keys(historicoObj);

      // Verificar se as chaves são numéricas sequenciais
      const numericKeys = keys
        .filter((key) => /^\d+$/.test(key))
        .sort((a, b) => parseInt(a) - parseInt(b));

      if (numericKeys.length > 0) {
        // Converter objeto com chaves numéricas para array
        return numericKeys.map((key) => historicoObj[key] as IHistoricoEntry);
      }
    }

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

        steps.push({
          status: entry.status,
          timestamp: entry.dataAlteracao,
          user: entry.usuario || "",
          email: entry.email || "",
          duration: duration,
          isCurrentStatus: entry.status === currentStatus,
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
      historicoField = normalizeHistoricoToArray(
        formDataExtended.metadata.historicoStatusChange
      );
    }
    // 2. Segundo, tentar em formData.historicoStatusChange (interface IHSEFormData)
    else if (formData.historicoStatusChange) {
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
                <div className={styles.stepStatus}>{step.status}</div>
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
