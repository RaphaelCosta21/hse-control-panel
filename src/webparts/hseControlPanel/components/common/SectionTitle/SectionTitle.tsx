import * as React from "react";
import { Text } from "@fluentui/react";
import styles from "./SectionTitle.module.scss";

export interface ISectionTitleProps {
  title: string;
  subtitle?: boolean;
  description?: string;
  icon?: string;
}

const SectionTitle: React.FC<ISectionTitleProps> = ({
  title,
  subtitle = false,
  description,
  icon,
}) => {
  const variant = subtitle ? "large" : "xLarge";
  const className = subtitle ? styles.subtitle : styles.mainTitle;

  return (
    <div className={styles.sectionTitle}>
      <div className={styles.titleRow}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <Text variant={variant} className={className}>
          {title}
        </Text>
      </div>
      {description && (
        <Text variant="medium" className={styles.description}>
          {description}
        </Text>
      )}
    </div>
  );
};

export default SectionTitle;
