import * as React from "react";
import styles from "./RiskBadge.module.scss";

export interface IRiskBadgeProps {
  level: "1" | "2" | "3" | "4";
  className?: string;
  showLabel?: boolean;
}

const RiskBadge: React.FC<IRiskBadgeProps> = ({
  level,
  className = "",
  showLabel = true,
}) => {
  const getRiskClass = (level: string): string => {
    switch (level) {
      case "1":
        return styles.level1;
      case "2":
        return styles.level2;
      case "3":
        return styles.level3;
      case "4":
        return styles.level4;
      default:
        return styles.level1;
    }
  };

  const getRiskLabel = (level: string): string => {
    switch (level) {
      case "1":
        return "Baixo";
      case "2":
        return "Médio";
      case "3":
        return "Alto";
      case "4":
        return "Muito Alto";
      default:
        return "Baixo";
    }
  };

  return (
    <span className={`${styles.riskBadge} ${getRiskClass(level)} ${className}`}>
      <span className={styles.level}>{level}</span>
      {showLabel && <span className={styles.label}>{getRiskLabel(level)}</span>}
    </span>
  );
};

export default RiskBadge;
