import * as React from "react";
import { Spinner, SpinnerSize, Text, Stack } from "@fluentui/react";
import styles from "./LoadingOverlay.module.scss";

export interface ILoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  showBackground?: boolean;
}

const LoadingOverlay: React.FC<ILoadingOverlayProps> = ({
  isVisible,
  message = "Carregando...",
  showBackground = true,
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`${styles.loadingOverlay} ${
        showBackground ? styles.withBackground : ""
      }`}
    >
      <div className={styles.loadingContent}>
        <Stack horizontalAlign="center" tokens={{ childrenGap: 16 }}>
          <Spinner size={SpinnerSize.large} />
          <Text variant="medium" className={styles.loadingMessage}>
            {message}
          </Text>
        </Stack>
      </div>
    </div>
  );
};

export default LoadingOverlay;
