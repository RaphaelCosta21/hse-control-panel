import * as React from "react";
import {
  Dropdown,
  IDropdownOption,
  DatePicker,
  DefaultButton,
} from "@fluentui/react";
import { IFormsFilters } from "../../../types/IControlPanelData";
import styles from "./FormFilters.module.scss";

export interface IFormFiltersProps {
  onStatusChange?: (status: string) => void;
  onRiskChange?: (risk: string) => void;
  onDateRangeChange?: (startDate?: Date, endDate?: Date) => void;
  onReset?: () => void;
  selectedStatus?: string;
  selectedRisk?: string;
  startDate?: Date;
  endDate?: Date;
  className?: string;
  // Props for AdvancedFilters compatibility
  filters?: IFormsFilters;
  onFiltersChange?: (newFilters: Partial<IFormsFilters>) => void;
  showSearch?: boolean;
}

const FormFilters: React.FC<IFormFiltersProps> = ({
  onStatusChange,
  onRiskChange,
  onDateRangeChange,
  onReset,
  selectedStatus,
  selectedRisk,
  startDate,
  endDate,
  className = "",
  // New props for compatibility
  filters,
  onFiltersChange,
  showSearch = true,
}) => {
  // Use legacy props or new filters prop
  const currentStatus = selectedStatus || filters?.status || "";
  const currentRisk = selectedRisk || filters?.grauRisco || "";

  const handleStatusChange = (
    event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ) => {
    const newStatus = option?.key as string;
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
    if (onFiltersChange) {
      onFiltersChange({ status: newStatus });
    }
  };

  const handleRiskChange = (
    event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ) => {
    const newRisk = option?.key as string;
    if (onRiskChange) {
      onRiskChange(newRisk);
    }
    if (onFiltersChange) {
      onFiltersChange({ grauRisco: newRisk });
    }
  };
  const statusOptions: IDropdownOption[] = [
    { key: "", text: "Todos os Status" },
    { key: "Em Análise", text: "🔄 Em Análise" },
    { key: "Aprovado", text: "✅ Aprovado" },
    { key: "Rejeitado", text: "❌ Rejeitado" },
    { key: "Pendente Informações", text: "⏳ Pendente Informações" },
    { key: "Enviado", text: "📤 Enviado" },
  ];

  const riskOptions: IDropdownOption[] = [
    { key: "", text: "Todos os Riscos" },
    { key: "1", text: "🟢 Risco 1 (Baixo)" },
    { key: "2", text: "🟡 Risco 2 (Médio)" },
    { key: "3", text: "🟠 Risco 3 (Alto)" },
    { key: "4", text: "🔴 Risco 4 (Crítico)" },
  ];

  return (
    <div className={`${styles.formFilters} ${className}`}>
      <div className={styles.filtersRow}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Status:</label>
          <Dropdown
            options={statusOptions}
            selectedKey={currentStatus}
            onChange={handleStatusChange}
            placeholder="Selecionar status"
            className={styles.filterDropdown}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Risco:</label>
          <Dropdown
            options={riskOptions}
            selectedKey={currentRisk}
            onChange={handleRiskChange}
            placeholder="Selecionar risco"
            className={styles.filterDropdown}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Data Início:</label>
          <DatePicker
            value={startDate || filters?.dataInicio}
            onSelectDate={(date) =>
              onDateRangeChange &&
              onDateRangeChange(date || undefined, endDate || filters?.dataFim)
            }
            placeholder="Data inicial"
            className={styles.datePicker}
            formatDate={(date) =>
              date ? date.toLocaleDateString("pt-BR") : ""
            }
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Data Fim:</label>
          <DatePicker
            value={endDate || filters?.dataFim}
            onSelectDate={(date) =>
              onDateRangeChange &&
              onDateRangeChange(
                startDate || filters?.dataInicio,
                date || undefined
              )
            }
            placeholder="Data final"
            className={styles.datePicker}
            formatDate={(date) =>
              date ? date.toLocaleDateString("pt-BR") : ""
            }
          />
        </div>

        <div className={styles.filterActions}>
          <DefaultButton
            text="🔄 Limpar Filtros"
            onClick={() => {
              if (onReset) onReset();
              if (onFiltersChange) onFiltersChange({});
            }}
            className={styles.resetButton}
          />
        </div>
      </div>
    </div>
  );
};

export default FormFilters;
