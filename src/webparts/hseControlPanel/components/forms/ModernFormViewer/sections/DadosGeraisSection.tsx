import * as React from "react";
import {
  Stack,
  Text,
  Icon,
  Label,
  Separator,
  MessageBar,
  MessageBarType,
  DefaultButton,
} from "@fluentui/react";
import {
  IDadosGerais,
  IAnexos,
  IFileMetadata,
} from "../../../../types/IHSEFormData";
import { SharePointService } from "../../../../services/SharePointService";
import styles from "./DadosGeraisSection.module.scss";

export interface IDadosGeraisSectionProps {
  data: IDadosGerais;
  anexos: IAnexos;
  isReviewing: boolean;
  sharePointService?: SharePointService;
  formId?: number;
  cnpj?: string;
  empresa?: string;
}

const DadosGeraisSection: React.FC<IDadosGeraisSectionProps> = ({
  data,
  anexos,
  isReviewing,
  sharePointService,
  formId,
  cnpj,
  empresa,
}) => {
  const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null || isNaN(value))
      return "Não informado";
    return value.toLocaleString("pt-BR");
  };

  const formatCNPJ = (cnpj: string | undefined | null): string => {
    if (!cnpj) return "Não informado";

    // Remove todos os caracteres não numéricos
    const numericCNPJ = cnpj.replace(/\D/g, "");

    // Verifica se tem 14 dígitos
    if (numericCNPJ.length !== 14) return cnpj; // Retorna o valor original se não for válido

    // Formata o CNPJ: XX.XXX.XXX/XXXX-XX
    return numericCNPJ.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5"
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatUploadDate = (dateString: string): string => {
    if (!dateString) return "Data não informada";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-BR");
    } catch {
      return "Data inválida";
    }
  };

  const getGrauRiscoColor = (grau: string | undefined | null): string => {
    if (!grau) return "#605e5c";
    switch (grau) {
      case "1":
        return "#107c10";
      case "2":
        return "#ff8c00";
      case "3":
        return "#d13438";
      case "4":
        return "#8b0000";
      default:
        return "#605e5c";
    }
  };

  const getGrauRiscoText = (grau: string | undefined | null): string => {
    if (!grau) return "Não informado";
    switch (grau) {
      case "1":
        return "Grau 1 - Baixo";
      case "2":
        return "Grau 2 - Médio";
      case "3":
        return "Grau 3 - Alto";
      case "4":
        return "Grau 4 - Muito Alto";
      default:
        return `Grau ${grau}`;
    }
  };

  const handleAnexoAction = async (
    anexo: IFileMetadata,
    action: "view" | "download"
  ): Promise<void> => {
    try {
      let attachmentData = anexo;

      // Se não tem URL definida e temos o SharePointService, tentar obter a URL
      if (
        (!anexo.url || anexo.url.trim() === "") &&
        sharePointService &&
        anexo.id &&
        formId &&
        cnpj &&
        empresa
      ) {
        console.log(`Buscando URL para anexo ID: ${anexo.id}`);

        const formData = {
          id: formId,
          cnpj: cnpj,
          empresa: empresa,
          categoria: anexo.category,
          fileName: anexo.fileName || anexo.originalName,
        };

        const attachmentInfo = await sharePointService.getAttachmentById(
          anexo.id,
          formData
        );
        if (attachmentInfo) {
          attachmentData = attachmentInfo;
        }
      }

      if (attachmentData.url && attachmentData.url.trim() !== "") {
        window.open(attachmentData.url, "_blank");
      } else {
        // Mostrar informações do anexo para debug
        const actionText = action === "view" ? "visualizar" : "baixar";
        alert(
          `Não foi possível ${actionText} o arquivo.\n\nArquivo: ${
            anexo.originalName || anexo.fileName
          }\nID: ${anexo.id}\nTamanho: ${formatFileSize(
            anexo.fileSize || 0
          )}\n\nVerifique se o arquivo existe no SharePoint.`
        );
      }
    } catch (error) {
      console.error("Erro ao processar ação do anexo:", error);
      alert("Erro ao processar o arquivo. Tente novamente.");
    }
  };

  const renderInfoCard = (
    title: string,
    icon: string,
    children: React.ReactNode,
    highlight?: boolean
  ): React.ReactElement => (
    <div className={`${styles.infoCard} ${highlight ? styles.highlight : ""}`}>
      <div className={styles.cardHeader}>
        {/* <Icon iconName={icon} className={styles.cardIcon} /> */}
        <Text variant="large" className={styles.cardTitle}>
          {title}
        </Text>
      </div>
      <div className={styles.cardContent}>{children}</div>
    </div>
  );

  const renderField = (
    label: string,
    value: string | number | boolean | undefined | null,
    type: "text" | "number" | "boolean" = "text"
  ): React.ReactElement => (
    <div className={styles.field}>
      <Label className={styles.fieldLabel}>{label}</Label>
      <div className={styles.fieldValue}>
        {type === "boolean" ? (
          <span
            className={`${styles.booleanValue} ${
              value ? styles.positive : styles.negative
            }`}
          >
            <Icon iconName={value ? "CheckMark" : "Cancel"} />
            {value ? "Sim" : "Não"}
          </span>
        ) : (
          <Text variant="medium">{value?.toString() || "Não informado"}</Text>
        )}
      </div>
    </div>
  );

  const renderAnexo = (
    titulo: string,
    anexoData: string | IFileMetadata[] | undefined
  ): React.ReactElement | null => {
    // Se anexoData é undefined ou vazio, retorna null
    if (!anexoData) return null;

    // Se anexoData é um array (formato JSON dos anexos)
    if (Array.isArray(anexoData) && anexoData.length > 0) {
      return (
        <div className={styles.documentCard}>
          <div className={styles.documentHeader}>
            <Icon iconName="Attach" className={styles.documentIcon} />
            <Text variant="medium" className={styles.documentTitle}>
              {titulo}
            </Text>
          </div>
          {anexoData.map((anexo, index) => (
            <div key={anexo.id || index} className={styles.documentItem}>
              <Text variant="small" className={styles.documentName}>
                📄 {anexo.originalName || anexo.fileName || "Arquivo"}
              </Text>
              <Text variant="xSmall" className={styles.documentInfo}>
                Tamanho: {formatFileSize(anexo.fileSize || 0)} | Upload:{" "}
                {formatUploadDate(anexo.uploadDate || "")}
              </Text>
              <div className={styles.documentActions}>
                <DefaultButton
                  iconProps={{ iconName: "View" }}
                  text="Visualizar"
                  onClick={() => handleAnexoAction(anexo, "view")}
                  className={styles.documentButton}
                />
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Se anexoData é uma string (formato antigo)
    if (typeof anexoData === "string") {
      return (
        <div className={styles.documentCard}>
          <div className={styles.documentHeader}>
            <Icon iconName="Attach" className={styles.documentIcon} />
            <Text variant="medium" className={styles.documentTitle}>
              {titulo}
            </Text>
          </div>
          <Text variant="small" className={styles.documentName}>
            {anexoData}
          </Text>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={styles.container}>
      {isReviewing && (
        <MessageBar
          messageBarType={MessageBarType.info}
          className={styles.reviewAlert}
        >
          🔍 <strong>Modo Revisão:</strong> Verifique cuidadosamente todas as
          informações empresariais e contratuais.
        </MessageBar>
      )}

      <Stack tokens={{ childrenGap: 24 }}>
        {renderInfoCard(
          "🏢 Informações da Empresa",
          "Building",
          <Stack tokens={{ childrenGap: 16 }}>
            <Stack horizontal tokens={{ childrenGap: 32 }}>
              <Stack.Item grow>
                {renderField("Razão Social", data.empresa as string)}
              </Stack.Item>
              <Stack.Item>
                {renderField("CNPJ", formatCNPJ(data.cnpj as string))}
              </Stack.Item>
            </Stack>

            <Stack horizontal tokens={{ childrenGap: 32 }}>
              <Stack.Item grow>
                {renderField(
                  "Atividade Principal (CNAE)",
                  data.atividadePrincipalCNAE as string
                )}
              </Stack.Item>
              <Stack.Item>
                <div className={styles.field}>
                  <Label className={styles.fieldLabel}>Grau de Risco</Label>
                  <div className={styles.fieldValue}>
                    <span
                      className={styles.grauRisco}
                      style={{
                        backgroundColor: getGrauRiscoColor(
                          data.grauRisco as string
                        ),
                      }}
                    >
                      {getGrauRiscoText(data.grauRisco as string)}
                    </span>
                  </div>
                </div>
              </Stack.Item>
            </Stack>

            <Separator />

            {renderField("Escopo do Serviço", data.escopoServico as string)}
          </Stack>,
          true
        )}

        {renderInfoCard(
          "👥 Recursos Humanos",
          "People",
          <Stack tokens={{ childrenGap: 16 }}>
            <Stack horizontal tokens={{ childrenGap: 32 }}>
              <Stack.Item>
                {renderField(
                  "Total de Empregados",
                  formatNumber(data.totalEmpregados as number),
                  "number"
                )}
              </Stack.Item>
              <Stack.Item>
                {renderField(
                  "Empregados para o Serviço",
                  formatNumber(data.empregadosParaServico as number),
                  "number"
                )}
              </Stack.Item>
              <Stack.Item grow>
                {renderField(
                  "Responsável Técnico",
                  data.responsavelTecnico as string
                )}
              </Stack.Item>
            </Stack>
          </Stack>
        )}

        {renderInfoCard(
          "🛡️ SESMT - Serviços Especializados",
          "Shield",
          <Stack tokens={{ childrenGap: 16 }}>
            <Stack
              horizontal
              tokens={{ childrenGap: 32 }}
              verticalAlign="center"
            >
              <Stack.Item>
                {renderField(
                  "Possui SESMT",
                  data.possuiSESMT as boolean,
                  "boolean"
                )}
              </Stack.Item>
              {data.possuiSESMT && data.numeroComponentesSESMT && (
                <Stack.Item>
                  {renderField(
                    "Número de Componentes",
                    formatNumber(data.numeroComponentesSESMT as number),
                    "number"
                  )}
                </Stack.Item>
              )}
            </Stack>
          </Stack>
        )}

        <div className={styles.anexosCard}>
          <div className={styles.cardHeader}>
            {/* <Icon iconName="FileTemplate" className={styles.cardIcon} /> */}
            <Text variant="large" className={styles.cardTitle}>
              📊 Resumo Estatístico Mensal de Acidentes
            </Text>
          </div>
          <div className={styles.cardContent}>
            <Stack tokens={{ childrenGap: 16 }}>
              {anexos.rem &&
                anexos.rem.length > 0 &&
                renderAnexo("REM - Resumo Estatístico Mensal", anexos.rem)}
              {(!anexos.rem || anexos.rem.length === 0) && (
                <MessageBar
                  messageBarType={MessageBarType.warning}
                  className={styles.warningMessage}
                >
                  ⚠️ REM (Resumo Estatístico Mensal) não foi anexado.
                </MessageBar>
              )}
            </Stack>
          </div>
        </div>
      </Stack>
    </div>
  );
};

export default DadosGeraisSection;
