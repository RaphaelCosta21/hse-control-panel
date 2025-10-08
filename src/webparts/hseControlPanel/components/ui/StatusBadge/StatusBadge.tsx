import * as React from "react";
import styles from "./StatusBadge.module.scss";

export interface IStatusBadgeProps {
  status:
    | "Em Andamento"
    | "Enviado"
    | "Em Análise"
    | "Aprovado"
    | "Rejeitado"
    | "Pendente Info."
    | "Cancelado";
  className?: string;
}

const StatusBadge: React.FC<IStatusBadgeProps> = ({
  status,
  className = "",
}) => {
  const getStatusClass = (status: string): string => {
    switch (status) {
      case "Em Andamento":
        return styles.inProgress;
      case "Enviado":
        return styles.submitted;
      case "Em Análise":
        return styles.review;
      case "Aprovado":
        return styles.approved;
      case "Rejeitado":
        return styles.rejected;
      case "Pendente Info.":
        return styles.pending;
      case "Cancelado":
        return styles.cancelled;
      default:
        return styles.default;
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case "Em Andamento":
        return "⏳";
      case "Enviado":
        return "📤";
      case "Em Análise":
        return "🔍";
      case "Aprovado":
        return "✅";
      case "Rejeitado":
        return "❌";
      case "Pendente Info.":
        return "⚠️";
      case "Cancelado":
        return "🚫";
      default:
        return "📄";
    }
  };

  return (
    <span
      className={`${styles.statusBadge} ${getStatusClass(status)} ${className}`}
    >
      <span className={styles.icon}>{getStatusIcon(status)}</span>
      <span className={styles.text}>{status}</span>
    </span>
  );
};

export default StatusBadge;
