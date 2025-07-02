import * as React from "react";
import { SearchBox as FluentSearchBox, ISearchBoxProps } from "@fluentui/react";
import styles from "./SearchBox.module.scss";

export interface ISearchBoxComponentProps
  extends Omit<ISearchBoxProps, "onChange"> {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  className?: string;
}

const SearchBoxComponent: React.FC<ISearchBoxComponentProps> = ({
  placeholder = "Buscar empresa, CNPJ...",
  value,
  onChange,
  onSearch,
  className = "",
  ...props
}) => {
  return (
    <div className={`${styles.searchBoxContainer} ${className}`}>
      <FluentSearchBox
        placeholder={placeholder}
        value={value}
        onChange={(_, newValue) => onChange && onChange(newValue || "")}
        onSearch={onSearch}
        className={styles.searchBox}
        {...props}
      />
    </div>
  );
};

export default SearchBoxComponent;
