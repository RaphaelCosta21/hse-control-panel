import * as React from "react";
import { Icon } from "@fluentui/react";
import styles from "./MetricCard.module.scss";

export interface IMetricCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: "primary" | "success" | "warning" | "danger" | "info";
  trend?: string;
  className?: string;
  onClick?: () => void;
}

const MetricCard: React.FC<IMetricCardProps> = ({
  title,
  value,
  icon,
  color,
  trend,
  className = "",
  onClick,
}) => {
  const getColorClass = (color: string): string => {
    switch (color) {
      case "primary":
        return styles.primary;
      case "success":
        return styles.success;
      case "warning":
        return styles.warning;
      case "danger":
        return styles.danger;
      case "info":
        return styles.info;
      default:
        return styles.primary;
    }
  };

  return (
    <div
      className={`${styles.metricCard} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={styles.cardHeader}>
        <div className={`${styles.cardIcon} ${getColorClass(color)}`}>
          <Icon iconName={icon} />
        </div>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.cardValue}>{value}</div>
        <div className={styles.cardTitle}>{title}</div>
        {trend && <div className={styles.cardTrend}>{trend}</div>}
      </div>
    </div>
  );
};

export default MetricCard;
