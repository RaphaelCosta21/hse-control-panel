import * as React from "react";
import { Stack, TextField, MessageBar, MessageBarType } from "@fluentui/react";
import { IHSEFormData } from "../../../types/IHSEFormData";
import SectionTitle from "../../common/SectionTitle";
import styles from "./ServicosViewer.module.scss";

export interface IServicosViewerProps {
  formData: IHSEFormData;
  isReadOnly?: boolean;
}

const ServicosViewer: React.FC<IServicosViewerProps> = ({
  formData,
  isReadOnly = true,
}) => {
  const servicos = formData.servicosEspeciais;

  // Renderizar dinamicamente todos os campos disponíveis
  const renderDynamicFields = (): React.ReactElement => {
    if (!servicos || Object.keys(servicos).length === 0) {
      return (
        <MessageBar messageBarType={MessageBarType.info}>
          Nenhum dado de serviços especiais disponível.
        </MessageBar>
      );
    }

    return (
      <>
        {Object.keys(servicos).map((key: string) => {
          const value = servicos[key];

          // Converter o valor para string de forma segura
          const displayValue =
            typeof value === "boolean"
              ? value
                ? "Sim"
                : "Não"
              : typeof value === "object" && value !== null
              ? JSON.stringify(value, null, 2)
              : String(value || "");

          // Criar um label mais legível
          const label = key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str: string) => str.toUpperCase())
            .replace(/fornecedor/gi, "Fornecedor de ")
            .replace(/embarcacoes/gi, "Embarcações")
            .replace(/icamento/gi, "Içamento");

          return (
            <TextField
              key={key}
              label={label}
              value={displayValue}
              readOnly={isReadOnly}
              multiline={typeof value === "object"}
              rows={typeof value === "object" ? 3 : 1}
            />
          );
        })}
      </>
    );
  };

  return (
    <div className={styles.servicosViewer}>
      <Stack tokens={{ childrenGap: 24 }}>
        <SectionTitle title="Serviços Especiais" />

        <Stack tokens={{ childrenGap: 16 }}>{renderDynamicFields()}</Stack>
      </Stack>
    </div>
  );
};

export default ServicosViewer;
