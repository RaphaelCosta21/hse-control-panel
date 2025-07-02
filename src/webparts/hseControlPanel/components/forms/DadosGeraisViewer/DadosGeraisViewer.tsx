import * as React from "react";
import { Stack, Text, TextField } from "@fluentui/react";
import { IHSEFormData } from "../../../types/IHSEFormData";
import SectionTitle from "../../common/SectionTitle";
import styles from "./DadosGeraisViewer.module.scss";

export interface IDadosGeraisViewerProps {
  formData: IHSEFormData;
  isReadOnly?: boolean;
}

const DadosGeraisViewer: React.FC<IDadosGeraisViewerProps> = ({
  formData,
  isReadOnly = true,
}) => {
  const dadosGerais: Record<string, unknown> = formData.dadosGerais || {};

  const renderDynamicFields = (): React.ReactNode => {
    if (!dadosGerais || Object.keys(dadosGerais).length === 0) {
      return <Text variant="small">Nenhum dado geral disponível.</Text>;
    }
    return (
      <Stack tokens={{ childrenGap: 16 }}>
        {Object.keys(dadosGerais).map((key) => {
          const value = dadosGerais[key];
          const displayValue =
            typeof value === "boolean"
              ? value
                ? "Sim"
                : "Não"
              : typeof value === "object" && value !== null
              ? JSON.stringify(value, null, 2)
              : String(value ?? "");
          const label = key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str: string) => str.toUpperCase())
            .replace(/cnpj/gi, "CNPJ")
            .replace(/cep/gi, "CEP")
            .replace(/email/gi, "E-mail")
            .replace(/razao social/gi, "Razão Social");

          return (
            <div
              key={key}
              style={{
                backgroundColor: "#fafafa",
                padding: "16px",
                borderRadius: "6px",
                border: "1px solid #e1e5ea",
              }}
            >
              <TextField
                label={label}
                value={displayValue}
                readOnly={isReadOnly}
                multiline={typeof value === "object"}
                rows={typeof value === "object" ? 3 : 1}
                className={styles.field}
                styles={{
                  root: { marginBottom: 0 },
                  fieldGroup: {
                    backgroundColor:
                      typeof value === "boolean"
                        ? value
                          ? "#d4f6d4"
                          : "#ffd4d4"
                        : "#ffffff",
                    border: "1px solid #d1d5db",
                  },
                }}
              />
            </div>
          );
        })}
      </Stack>
    );
  };

  return (
    <div className={styles.dadosGeraisViewer}>
      <Stack tokens={{ childrenGap: 24 }}>
        <SectionTitle title="Dados Gerais do Fornecedor" />
        <Stack tokens={{ childrenGap: 16 }}>{renderDynamicFields()}</Stack>
      </Stack>
    </div>
  );
};

export default DadosGeraisViewer;
