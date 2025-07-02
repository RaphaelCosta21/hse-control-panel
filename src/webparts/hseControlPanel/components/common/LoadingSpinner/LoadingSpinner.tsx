import * as React from "react";
import { Spinner, SpinnerSize } from "@fluentui/react";
import styles from "./LoadingSpinner.module.scss";

export interface ILoadingSpinnerProps {
  size?: SpinnerSize;
  label?: string;
  className?: string;
}

const LoadingSpinner: React.FC<ILoadingSpinnerProps> = ({
  size = SpinnerSize.medium,
  label = "Carregando...",
  className = ""
}) => {
  return (
    <div className={`${styles.loadingSpinner} ${className}`}>
      <Spinner size={size} label={label} />
    </div>
  );
};

export default LoadingSpinner;
