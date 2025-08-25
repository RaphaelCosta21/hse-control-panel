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
  onCompanyChange?: (company: string) => void;
  onRevisorChange?: (revisor: string) => void;
  onDateRangeChange?: (startDate?: Date, endDate?: Date) => void;
  onReset?: () => void;
  selectedStatus?: string;
  selectedCompany?: string;
  selectedRevisor?: string;
  startDate?: Date;
  endDate?: Date;
  className?: string;
  // Props for AdvancedFilters compatibility
  filters?: IFormsFilters;
  onFiltersChange?: (newFilters: Partial<IFormsFilters>) => void;
  showSearch?: boolean;
  companies?: string[];
  revisors?: string[];
}

const FormFilters: React.FC<IFormFiltersProps> = ({
  onStatusChange,
  onCompanyChange,
  onRevisorChange,
  onDateRangeChange,
  onReset,
  selectedStatus,
  selectedCompany,
  selectedRevisor,
  startDate,
  endDate,
  className = "",
  // New props for compatibility
  filters,
  onFiltersChange,
  showSearch = true,
  companies = [],
  revisors = [],
}) => {
  // Use legacy props or new filters prop
  const currentStatus = selectedStatus || filters?.status || "";
  const currentCompany = selectedCompany || filters?.empresa || "";
  const currentRevisor = selectedRevisor || filters?.revisor || "";

  const handleStatusChange = (
    event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ): void => {
    const newStatus = option?.key as string;
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
    if (onFiltersChange) {
      onFiltersChange({ status: newStatus });
    }
  };

  const handleCompanyChange = (
    event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ): void => {
    const newCompany = option?.key as string;
    if (onCompanyChange) {
      onCompanyChange(newCompany);
    }
    if (onFiltersChange) {
      onFiltersChange({ empresa: newCompany });
    }
  };

  const handleRevisorChange = (
    event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ): void => {
    const newRevisor = option?.key as string;
    if (onRevisorChange) {
      onRevisorChange(newRevisor);
    }
    if (onFiltersChange) {
      onFiltersChange({ revisor: newRevisor });
    }
  };
  const statusOptions: IDropdownOption[] = [
    { key: "", text: "Todos os Status" },
    { key: "Em Andamento", text: "🔄 Em Andamento" },
    { key: "Enviado", text: "📤 Enviado" },
    { key: "Em Análise", text: "� Em Análise" },
    { key: "Aprovado", text: "✅ Aprovado" },
    { key: "Rejeitado", text: "❌ Rejeitado" },
    { key: "Pendente Informações", text: "⏳ Pendente Informações" },
  ];

  const companyOptions: IDropdownOption[] = [
    { key: "", text: "Todas as Empresas" },
    ...companies.map((company) => ({ key: company, text: company })),
  ];

  const revisorOptions: IDropdownOption[] = [
    { key: "", text: "Todos os Revisores" },
    ...revisors.map((revisor) => ({ key: revisor, text: revisor })),
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
          <label className={styles.filterLabel}>Empresa:</label>
          <Dropdown
            options={companyOptions}
            selectedKey={currentCompany}
            onChange={handleCompanyChange}
            placeholder="Selecionar empresa"
            className={styles.filterDropdown}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Revisor:</label>
          <Dropdown
            options={revisorOptions}
            selectedKey={currentRevisor}
            onChange={handleRevisorChange}
            placeholder="Selecionar revisor"
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
