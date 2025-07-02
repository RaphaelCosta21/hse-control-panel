import * as React from "react";
import { Stack, DatePicker, DefaultButton, Text, Icon } from "@fluentui/react";
import styles from "./DateRangePicker.module.scss";

export interface IDateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onDateRangeChange: (startDate?: Date, endDate?: Date) => void;
  label?: string;
  className?: string;
}

export const DateRangePicker: React.FC<IDateRangePickerProps> = ({
  startDate,
  endDate,
  onDateRangeChange,
  label = "Período",
  className = "",
}) => {
  const [localStartDate, setLocalStartDate] = React.useState<Date | undefined>(
    startDate
  );
  const [localEndDate, setLocalEndDate] = React.useState<Date | undefined>(
    endDate
  );

  const handleStartDateChange = (date: Date | null | undefined) => {
    setLocalStartDate(date || undefined);
    onDateRangeChange(date || undefined, localEndDate);
  };

  const handleEndDateChange = (date: Date | null | undefined) => {
    setLocalEndDate(date || undefined);
    onDateRangeChange(localStartDate, date || undefined);
  };

  const handleClear = () => {
    setLocalStartDate(undefined);
    setLocalEndDate(undefined);
    onDateRangeChange(undefined, undefined);
  };

  const getQuickRangeButtons = () => [
    {
      text: "Últimos 7 dias",
      onClick: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 7);
        setLocalStartDate(start);
        setLocalEndDate(end);
        onDateRangeChange(start, end);
      },
    },
    {
      text: "Últimos 30 dias",
      onClick: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        setLocalStartDate(start);
        setLocalEndDate(end);
        onDateRangeChange(start, end);
      },
    },
    {
      text: "Este mês",
      onClick: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        setLocalStartDate(start);
        setLocalEndDate(end);
        onDateRangeChange(start, end);
      },
    },
  ];

  return (
    <div className={`${styles.dateRangePicker} ${className}`}>
      <Stack tokens={{ childrenGap: 12 }}>
        <Stack
          horizontal
          horizontalAlign="space-between"
          verticalAlign="center"
        >
          <Text variant="medium" block>
            📅 {label}
          </Text>
          {(localStartDate || localEndDate) && (
            <DefaultButton
              text="Limpar"
              iconProps={{ iconName: "Clear" }}
              onClick={handleClear}
              styles={{ root: { minWidth: "auto" } }}
            />
          )}
        </Stack>

        <Stack horizontal tokens={{ childrenGap: 12 }}>
          <DatePicker
            label="Data Início"
            value={localStartDate}
            onSelectDate={handleStartDateChange}
            placeholder="Selecione..."
            ariaLabel="Data de início"
            maxDate={localEndDate}
          />
          <div className={styles.dateRangeSeparator}>
            <Icon iconName="ChevronRight" />
          </div>
          <DatePicker
            label="Data Fim"
            value={localEndDate}
            onSelectDate={handleEndDateChange}
            placeholder="Selecione..."
            ariaLabel="Data de fim"
            minDate={localStartDate}
          />
        </Stack>

        <Stack horizontal wrap tokens={{ childrenGap: 8 }}>
          {getQuickRangeButtons().map((button, index) => (
            <DefaultButton
              key={index}
              text={button.text}
              onClick={button.onClick}
              styles={{
                root: {
                  fontSize: "12px",
                  padding: "4px 8px",
                  minWidth: "auto",
                },
              }}
            />
          ))}
        </Stack>
      </Stack>
    </div>
  );
};

export default DateRangePicker;
