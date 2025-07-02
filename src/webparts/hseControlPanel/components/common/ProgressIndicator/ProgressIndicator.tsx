import * as React from "react";
import {
  ProgressIndicator as FluentProgressIndicator,
  Text,
  Stack,
} from "@fluentui/react";
import styles from "./ProgressIndicator.module.scss";

export interface IProgressIndicatorProps {
  percentComplete: number;
  label?: string;
  description?: string;
  showPercentage?: boolean;
  barHeight?: "small" | "medium" | "large";
  className?: string;
}

const ProgressIndicator: React.FC<IProgressIndicatorProps> = ({
  percentComplete,
  label,
  description,
  showPercentage = true,
  barHeight = "medium",
  className,
}) => {
  const normalizedPercent = Math.max(0, Math.min(100, percentComplete)) / 100;

  return (
    <div
      className={`${styles.progressIndicator} ${styles[barHeight]} ${
        className || ""
      }`}
    >
      <Stack tokens={{ childrenGap: 4 }}>
        {label && (
          <div className={styles.labelRow}>
            <Text variant="medium" className={styles.label}>
              {label}
            </Text>
            {showPercentage && (
              <Text variant="medium" className={styles.percentage}>
                {Math.round(percentComplete)}%
              </Text>
            )}
          </div>
        )}

        <FluentProgressIndicator
          percentComplete={normalizedPercent}
          className={styles.progressBar}
        />

        {description && (
          <Text variant="small" className={styles.description}>
            {description}
          </Text>
        )}
      </Stack>
    </div>
  );
};

export default ProgressIndicator;
