import * as React from "react";
import {
  Dropdown,
  IDropdownOption,
  PrimaryButton,
  DefaultButton,
} from "@fluentui/react";
import styles from "./FilterPanel.module.scss";

export interface IFilterPanelProps {
  onApplyFilters: (filters: any) => void;
  onClearFilters: () => void;
  isVisible?: boolean;
}

export interface IFilterState {
  status: string;
  riskLevel: string;
  dateRange: string;
}

const FilterPanel: React.FC<IFilterPanelProps> = ({
  onApplyFilters,
  onClearFilters,
  isVisible = true,
}) => {
  const [filters, setFilters] = React.useState<IFilterState>({
    status: "",
    riskLevel: "",
    dateRange: "",
  });

  const statusOptions: IDropdownOption[] = [
    { key: "", text: "Todos os Status" },
    { key: "pending", text: "Pendente" },
    { key: "approved", text: "Aprovado" },
    { key: "rejected", text: "Rejeitado" },
    { key: "in_review", text: "Em Análise" },
  ];

  const riskLevelOptions: IDropdownOption[] = [
    { key: "", text: "Todos os Níveis" },
    { key: "low", text: "Baixo" },
    { key: "medium", text: "Médio" },
    { key: "high", text: "Alto" },
    { key: "critical", text: "Crítico" },
  ];

  const dateRangeOptions: IDropdownOption[] = [
    { key: "", text: "Todo o período" },
    { key: "last_week", text: "Última semana" },
    { key: "last_month", text: "Último mês" },
    { key: "last_quarter", text: "Último trimestre" },
    { key: "last_year", text: "Último ano" },
  ];

  const handleFilterChange = (key: keyof IFilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
  };

  const handleClearFilters = () => {
    setFilters({
      status: "",
      riskLevel: "",
      dateRange: "",
    });
    onClearFilters();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.filterPanel}>
      <div className={styles.filterHeader}>
        <h3>Filtros</h3>
      </div>

      <div className={styles.filterContent}>
        <div className={styles.filterGroup}>
          <Dropdown
            label="Status"
            options={statusOptions}
            selectedKey={filters.status}
            onChange={(_, option) =>
              option && handleFilterChange("status", option.key as string)
            }
          />
        </div>

        <div className={styles.filterGroup}>
          <Dropdown
            label="Nível de Risco"
            options={riskLevelOptions}
            selectedKey={filters.riskLevel}
            onChange={(_, option) =>
              option && handleFilterChange("riskLevel", option.key as string)
            }
          />
        </div>

        <div className={styles.filterGroup}>
          <Dropdown
            label="Período"
            options={dateRangeOptions}
            selectedKey={filters.dateRange}
            onChange={(_, option) =>
              option && handleFilterChange("dateRange", option.key as string)
            }
          />
        </div>
      </div>

      <div className={styles.filterActions}>
        <PrimaryButton text="Aplicar Filtros" onClick={handleApplyFilters} />
        <DefaultButton text="Limpar" onClick={handleClearFilters} />
      </div>
    </div>
  );
};

export default FilterPanel;
