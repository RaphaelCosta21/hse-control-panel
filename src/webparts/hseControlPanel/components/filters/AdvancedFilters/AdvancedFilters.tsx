import * as React from "react";
import {
  Stack,
  Panel,
  PanelType,
  DefaultButton,
  PrimaryButton,
  Text,
  Separator,
} from "@fluentui/react";
import SearchBox from "../SearchBox";
import FormFilters from "../FormFilters";
import DateRangePicker from "../DateRangePicker";
import { IFormsFilters } from "../../../types/IControlPanelData";
import styles from "./AdvancedFilters.module.scss";

export interface IAdvancedFiltersProps {
  isOpen: boolean;
  onDismiss: () => void;
  filters: IFormsFilters;
  onFiltersChange: (filters: IFormsFilters) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export const AdvancedFilters: React.FC<IAdvancedFiltersProps> = ({
  isOpen,
  onDismiss,
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
}) => {
  const [localFilters, setLocalFilters] =
    React.useState<IFormsFilters>(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleSearchChange = (searchTerm: string) => {
    setLocalFilters({
      ...localFilters,
      empresa: searchTerm,
    });
  };

  const handleBasicFiltersChange = (newFilters: Partial<IFormsFilters>) => {
    setLocalFilters({
      ...localFilters,
      ...newFilters,
    });
  };

  const handleDateRangeChange = (startDate?: Date, endDate?: Date) => {
    setLocalFilters({
      ...localFilters,
      dataInicio: startDate,
      dataFim: endDate,
    });
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApplyFilters();
    onDismiss();
  };

  const handleClear = () => {
    const clearedFilters: IFormsFilters = {};
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onClearFilters();
  };

  const hasActiveFilters = Object.keys(localFilters).some((key) => {
    const value = (localFilters as any)[key];
    return value !== undefined && value !== "" && value !== null;
  });

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDismiss}
      type={PanelType.medium}
      headerText="🔍 Filtros Avançados"
      className={styles.advancedFiltersPanel}
    >
      <Stack tokens={{ childrenGap: 20 }}>
        <Text variant="medium" block>
          Configure filtros detalhados para refinar sua busca de formulários
          HSE.
        </Text>

        <Separator />

        {/* Search */}
        <Stack tokens={{ childrenGap: 12 }}>
          <Text variant="mediumPlus" block>
            🔍 Busca Textual
          </Text>
          <SearchBox
            placeholder="Buscar por empresa, CNPJ ou avaliador..."
            value={localFilters.empresa || ""}
            onSearch={handleSearchChange}
            onClear={() => handleSearchChange("")}
          />
        </Stack>

        <Separator />

        {/* Basic Filters */}
        <Stack tokens={{ childrenGap: 12 }}>
          <Text variant="mediumPlus" block>
            📊 Filtros Básicos
          </Text>
          <FormFilters
            filters={localFilters}
            onFiltersChange={handleBasicFiltersChange}
            showSearch={false}
          />
        </Stack>

        <Separator />

        {/* Date Range */}
        <Stack tokens={{ childrenGap: 12 }}>
          <Text variant="mediumPlus" block>
            📅 Período de Submissão
          </Text>
          <DateRangePicker
            startDate={localFilters.dataInicio}
            endDate={localFilters.dataFim}
            onDateRangeChange={handleDateRangeChange}
            label="Filtrar por período"
          />
        </Stack>

        <Separator />

        {/* Actions */}
        <Stack
          horizontal
          horizontalAlign="space-between"
          tokens={{ childrenGap: 12 }}
        >
          <DefaultButton
            text="🗑️ Limpar Tudo"
            onClick={handleClear}
            disabled={!hasActiveFilters}
          />
          <Stack horizontal tokens={{ childrenGap: 8 }}>
            <DefaultButton text="Cancelar" onClick={onDismiss} />
            <PrimaryButton text="✅ Aplicar Filtros" onClick={handleApply} />
          </Stack>
        </Stack>

        {hasActiveFilters && (
          <div className={styles.activeFiltersInfo}>
            <Text
              variant="small"
              styles={{ root: { color: "var(--palette-theme-primary)" } }}
            >
              ℹ️{" "}
              {
                Object.keys(localFilters).filter((key) => {
                  const v = (localFilters as any)[key];
                  return v !== undefined && v !== "";
                }).length
              }{" "}
              filtro(s) ativo(s)
            </Text>
          </div>
        )}
      </Stack>
    </Panel>
  );
};
