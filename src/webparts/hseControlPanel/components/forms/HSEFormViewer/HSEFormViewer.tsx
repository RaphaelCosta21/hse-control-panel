import * as React from "react";
import { Stack, Pivot, PivotItem } from "@fluentui/react";
import { IHSEFormData } from "../../../types/IHSEFormData";
import DadosGeraisViewer from "../DadosGeraisViewer";
import ConformidadeViewer from "../ConformidadeViewer";
import ServicosViewer from "../ServicosViewer";
import AttachmentViewer from "../AttachmentViewer";
import SectionTitle from "../../common/SectionTitle";
import styles from "./HSEFormViewer.module.scss";

export interface IHSEFormViewerProps {
  formData: IHSEFormData;
  isReadOnly?: boolean;
  onFormDataChange?: (formData: IHSEFormData) => void;
}

const HSEFormViewer: React.FC<IHSEFormViewerProps> = ({
  formData,
  isReadOnly = true,
  onFormDataChange,
}) => {
  const [selectedTab, setSelectedTab] = React.useState<string>("dadosGerais");

  const handleTabChange = (item?: PivotItem): void => {
    if (item?.props.itemKey) {
      setSelectedTab(item.props.itemKey);
    }
  };

  return (
    <div className={styles.hseFormViewer}>
      <Stack tokens={{ childrenGap: 20 }}>
        <SectionTitle
          title="Visualização do Formulário HSE"
          description="Dados completos do fornecedor para avaliação"
        />

        <div className={styles.formContainer}>
          <Pivot
            selectedKey={selectedTab}
            onLinkClick={handleTabChange}
            headersOnly={false}
            className={styles.formTabs}
            styles={{
              root: {
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                border: "1px solid #e1e5ea",
                overflow: "hidden",
              },
              link: {
                padding: "12px 20px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#6c757d",
                borderBottom: "3px solid transparent",
                transition: "all 0.2s ease",
              },
              linkIsSelected: {
                backgroundColor: "#f8f9fa",
                color: "#0078d4",
                borderBottomColor: "#0078d4",
              },
            }}
          >
            <PivotItem headerText="Dados Gerais" itemKey="dadosGerais">
              <div
                className={styles.tabContent}
                style={{
                  padding: "24px",
                  backgroundColor: "#fafbfc",
                  minHeight: "400px",
                }}
              >
                <DadosGeraisViewer
                  formData={formData}
                  isReadOnly={isReadOnly}
                />
              </div>
            </PivotItem>

            <PivotItem headerText="Conformidade Legal" itemKey="conformidade">
              <div
                className={styles.tabContent}
                style={{
                  padding: "24px",
                  backgroundColor: "#fafbfc",
                  minHeight: "400px",
                }}
              >
                <ConformidadeViewer
                  formData={formData}
                  isReadOnly={isReadOnly}
                />
              </div>
            </PivotItem>

            <PivotItem headerText="Serviços Especiais" itemKey="servicos">
              <div
                className={styles.tabContent}
                style={{
                  padding: "24px",
                  backgroundColor: "#fafbfc",
                  minHeight: "400px",
                }}
              >
                <ServicosViewer formData={formData} isReadOnly={isReadOnly} />
              </div>
            </PivotItem>

            <PivotItem headerText="Anexos" itemKey="anexos">
              <div
                className={styles.tabContent}
                style={{
                  padding: "24px",
                  backgroundColor: "#fafbfc",
                  minHeight: "400px",
                }}
              >
                <AttachmentViewer
                  attachments={{}}
                  formId={formData.id || 0}
                  companyName={
                    typeof formData.dadosGerais?.empresa === "string"
                      ? formData.dadosGerais.empresa
                      : ""
                  }
                  onDownloadFile={(attachment) => {
                    console.log("Download file:", attachment);
                  }}
                  onPreviewFile={(attachment) => {
                    console.log("Preview file:", attachment);
                  }}
                />
              </div>
            </PivotItem>
          </Pivot>
        </div>

        {!isReadOnly && (
          <div className={styles.formActions}>
            <Stack horizontal tokens={{ childrenGap: 12 }}>
              {/* Actions would be implemented here */}
            </Stack>
          </div>
        )}
      </Stack>
    </div>
  );
};

export default HSEFormViewer;
