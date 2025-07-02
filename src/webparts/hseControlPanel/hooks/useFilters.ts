import * as React from "react";
import { IFormsFilters } from "../types/IControlPanelData";

export interface IFiltersHookData {
  filters: IFormsFilters;
  activeFiltersCount: number;
  updateFilter: (key: keyof IFormsFilters, value: any) => void;
  updateFilters: (newFilters: Partial<IFormsFilters>) => void;
  clearFilters: () => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

export const useFilters = (
  initialFilters?: IFormsFilters
): IFiltersHookData => {
  const [filters, setFilters] = React.useState<IFormsFilters>(
    initialFilters || {}
  );

  const updateFilter = React.useCallback(
    (key: keyof IFormsFilters, value: any) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value === "" ? undefined : value,
      }));
    },
    []
  );

  const updateFilters = React.useCallback(
    (newFilters: Partial<IFormsFilters>) => {
      setFilters((prev) => ({
        ...prev,
        ...newFilters,
      }));
    },
    []
  );

  const clearFilters = React.useCallback(() => {
    setFilters({});
  }, []);

  const resetFilters = React.useCallback(() => {
    setFilters(initialFilters || {});
  }, [initialFilters]);

  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    for (const key in filters) {
      if (filters.hasOwnProperty(key)) {
        const value = (filters as any)[key];
        if (value !== undefined && value !== "" && value !== null) {
          count++;
        }
      }
    }
    return count;
  }, [filters]);

  const hasActiveFilters = React.useMemo(() => {
    return activeFiltersCount > 0;
  }, [activeFiltersCount]);

  return {
    filters,
    activeFiltersCount,
    updateFilter,
    updateFilters,
    clearFilters,
    resetFilters,
    hasActiveFilters,
  };
};
