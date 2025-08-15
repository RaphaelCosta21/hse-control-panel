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
import { IDadosGerais, IAnexos } from "../../../../types/IHSEFormData";
import styles from "./DadosGeraisSection.module.scss";

export interface IDadosGeraisSectionProps {
  data: IDadosGerais;
  anexos: IAnexos;
  isReviewing: boolean;
}

const DadosGeraisSection: React.FC<IDadosGeraisSectionProps> = ({
  data,
  anexos,
  isReviewing,
}) => {
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("pt-BR");
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString("pt-BR");
  };

  const getGrauRiscoColor = (grau: string): string => {
    switch (grau) {
      case "1": return "#107c10"; // Verde
      case "2": return "#ff8c00"; // Laranja
      case "3": return "#d13438"; // Vermelho
      case "4": return "#8b0000"; // Vermelho escuro
      default: return "#605e5c"; // Cinza
    }
  };

  const getGrauRiscoText = (grau: string): string => {
    switch (grau) {
      case "1": return "Grau 1 - Baixo";
      case "2": return "Grau 2 - Médio";
      case "3": return "Grau 3 - Alto";
      case "4": return "Grau 4 - Muito Alto";
      default: return `Grau ${grau}`;
    }
  };

  const renderInfoCard = (title: string, icon: string, children: React.ReactNode, highlight?: boolean): React.ReactElement => (
    <div className={`${styles.infoCard} ${highlight ? styles.highlight : ""}`}>
      <div className={styles.cardHeader}>
        <Icon iconName={icon} className={styles.cardIcon} />
        <Text variant="large" className={styles.cardTitle}>{title}</Text>
      </div>
      <div className={styles.cardContent}>
        {children}
      </div>
    </div>
  );

  const renderField = (label: string, value: string | number | boolean, type: "text" | "number" | "boolean" = "text"): React.ReactElement => (
    <div className={styles.field}>
      <Label className={styles.fieldLabel}>{label}</Label>
      <div className={styles.fieldValue}>
        {type === "boolean" ? (
          <span className={`${styles.booleanValue} ${value ? styles.positive : styles.negative}`}>
            <Icon iconName={value ? "CheckMark" : "Cancel"} />
            {value ? "Sim" : "Não"}
          </span>
        ) : (
          <Text variant="medium">{value.toString()}</Text>
        )}
      </div>
    </div>
  );

  const renderAnexo = (titulo: string, nomeArquivo: string | undefined): React.ReactElement | null => {
    if (!nomeArquivo) return null;

    return (
      <div className={styles.documentCard}>
        <div className={styles.documentHeader}>
          <Icon iconName="Attach" className={styles.documentIcon} />
          <Text variant="medium" className={styles.documentTitle}>{titulo}</Text>
        </div>
        <Text variant="small" className={styles.documentName}>{nomeArquivo}</Text>
        <div className={styles.documentActions}>
          <DefaultButton
            iconProps={{ iconName: "Download" }}
            text="Baixar"
            onClick={() => console.log(`Download ${nomeArquivo}`)}
            className={styles.documentButton}
          />
          <DefaultButton
            iconProps={{ iconName: "View" }}
            text="Visualizar"
            onClick={() => console.log(`Visualizar ${nomeArquivo}`)}
            className={styles.documentButton}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {isReviewing && (
        <MessageBar messageBarType={MessageBarType.info} className={styles.reviewAlert}>
          🔍 <strong>Modo Revisão:</strong> Verifique cuidadosamente todas as informações empresariais e contratuais.
        </MessageBar>
      )}

      <Stack tokens={{ childrenGap: 24 }}>
        {/* Informações da Empresa */}
        {renderInfoCard("🏢 Informações da Empresa", "Building", (
          <Stack tokens={{ childrenGap: 16 }}>
            <Stack horizontal tokens={{ childrenGap: 32 }}>
              <Stack.Item grow>
                {renderField("Razão Social", data.empresa as string)}
              </Stack.Item>
              <Stack.Item>
                {renderField("CNPJ", data.cnpj as string)}
              </Stack.Item>
            </Stack>
            
            <Stack horizontal tokens={{ childrenGap: 32 }}>
              <Stack.Item grow>
                {renderField("Atividade Principal (CNAE)", data.atividadePrincipalCNAE as string)}
              </Stack.Item>
              <Stack.Item>
                <div className={styles.field}>
                  <Label className={styles.fieldLabel}>Grau de Risco</Label>
                  <div className={styles.fieldValue}>
                    <span 
                      className={styles.grauRisco}
                      style={{ backgroundColor: getGrauRiscoColor(data.grauRisco as string) }}
                    >
                      {getGrauRiscoText(data.grauRisco as string)}
                    </span>
                  </div>
                </div>
              </Stack.Item>
            </Stack>
          </Stack>
        ), true)}

        {/* Informações Contratuais */}
        {renderInfoCard("📋 Informações Contratuais", "ContactCard", (
          <Stack tokens={{ childrenGap: 16 }}>
            <Stack horizontal tokens={{ childrenGap: 32 }}>
              <Stack.Item grow>
                {renderField("Número do Contrato", data.numeroContrato as string)}
              </Stack.Item>
              <Stack.Item>
                {renderField("Gerente do Contrato (Marine)", data.gerenteContratoMarine as string)}
              </Stack.Item>
            </Stack>
            
            <Stack horizontal tokens={{ childrenGap: 32 }}>
              <Stack.Item>
                {renderField("Data de Início", formatDate(data.dataInicioContrato as Date))}
              </Stack.Item>
              <Stack.Item>
                {renderField("Data de Término", formatDate(data.dataTerminoContrato as Date))}
              </Stack.Item>
            </Stack>
            
            <Separator />
            
            {renderField("Escopo do Serviço", data.escopoServico as string)}
          </Stack>
        ))}

        {/* Recursos Humanos */}
        {renderInfoCard("👥 Recursos Humanos", "People", (
          <Stack tokens={{ childrenGap: 16 }}>
            <Stack horizontal tokens={{ childrenGap: 32 }}>
              <Stack.Item>
                {renderField("Total de Empregados", formatCurrency(data.totalEmpregados as number), "number")}
              </Stack.Item>
              <Stack.Item>
                {renderField("Empregados para o Serviço", formatCurrency(data.empregadosParaServico as number), "number")}
              </Stack.Item>
              <Stack.Item grow>
                {renderField("Responsável Técnico", data.responsavelTecnico as string)}
              </Stack.Item>
            </Stack>
          </Stack>
        ))}

        {/* SESMT */}
        {renderInfoCard("🛡️ SESMT - Serviços Especializados", "Shield", (
          <Stack tokens={{ childrenGap: 16 }}>
            <Stack horizontal tokens={{ childrenGap: 32 }} verticalAlign="center">
              <Stack.Item>
                {renderField("Possui SESMT", data.possuiSESMT as boolean, "boolean")}
              </Stack.Item>
              {data.possuiSESMT && data.numeroComponentesSESMT && (
                <Stack.Item>
                  {renderField("Número de Componentes", formatCurrency(data.numeroComponentesSESMT as number), "number")}
                </Stack.Item>
              )}
            </Stack>
          </Stack>
        ))}

        {/* Anexos */}
        <div className={styles.anexosCard}>
          <div className={styles.cardHeader}>
            <Icon iconName="Attach" className={styles.cardIcon} />
            <Text variant="large" className={styles.cardTitle}>📎 Documentos Anexos</Text>
          </div>
          <div className={styles.cardContent}>
            <Stack horizontal wrap tokens={{ childrenGap: 16 }}>
              {renderAnexo("Contrato Social", anexos.contratoSocial)}
              {renderAnexo("Cartão CNPJ", anexos.cartaoCNPJ)}
              
              {!anexos.contratoSocial && !anexos.cartaoCNPJ && (
                <MessageBar messageBarType={MessageBarType.warning}>
                  ⚠️ Nenhum documento foi anexado para esta seção.
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
