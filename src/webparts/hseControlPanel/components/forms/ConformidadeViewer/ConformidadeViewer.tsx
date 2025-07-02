import * as React from "react";
import { Stack, MessageBar, MessageBarType } from "@fluentui/react";
import { IHSEFormData } from "../../../types/IHSEFormData";
import SectionTitle from "../../common/SectionTitle";
import styles from "./ConformidadeViewer.module.scss";

export interface IConformidadeViewerProps {
  formData: IHSEFormData;
  isReadOnly?: boolean;
}

const ConformidadeViewer: React.FC<IConformidadeViewerProps> = ({
  formData,
  isReadOnly = true,
}) => {
  const conformidade = formData.conformidadeLegal;

  // Função para formatar nomes das NRs e seções
  const formatSectionName = (key: string): string => {
    const sectionNames: Record<string, string> = {
      nr01: "NR 01 - Disposições Gerais",
      nr04: "NR 04 - Serviços Especializados em Engenharia de Segurança e Medicina do Trabalho",
      nr05: "NR 05 - Comissão Interna de Prevenção de Acidentes",
      nr06: "NR 06 - Equipamento de Proteção Individual",
      nr07: "NR 07 - Programa de Controle Médico de Saúde Ocupacional",
      nr09: "NR 09 - Programa de Prevenção de Riscos Ambientais",
      nr10: "NR 10 - Segurança em Instalações e Serviços em Eletricidade",
      nr11: "NR 11 - Transporte, Movimentação, Armazenagem e Manuseio de Materiais",
      nr12: "NR 12 - Segurança no Trabalho em Máquinas e Equipamentos",
      nr13: "NR 13 - Caldeiras, Vasos de Pressão e Tubulações",
      nr15: "NR 15 - Atividades e Operações Insalubres",
      nr23: "NR 23 - Proteção Contra Incêndios",
      licencasAmbientais: "Licenças Ambientais",
      legislacaoMaritima: "Legislação Marítima",
      treinamentos: "Treinamentos",
      gestaoSMS: "Gestão de SMS",
    };
    return sectionNames[key] || key.toUpperCase();
  };

  // Função para renderizar questões de uma seção
  const renderQuestions = (
    sectionData: Record<string, unknown>,
    sectionKey: string
  ): React.ReactNode => {
    if (!sectionData || typeof sectionData !== "object") return null;

    const questions: React.ReactNode[] = [];

    // Verificar se há campo "aplicavel"
    if ("aplicavel" in sectionData) {
      const isApplicable = Boolean(sectionData.aplicavel);
      questions.push(
        <div
          key={`${sectionKey}-aplicavel`}
          style={{
            backgroundColor: isApplicable ? "#d4f6d4" : "#ffd4d4",
            padding: "12px 16px",
            borderRadius: "6px",
            border: `2px solid ${isApplicable ? "#4caf50" : "#f44336"}`,
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontWeight: "600",
              color: isApplicable ? "#2e7d32" : "#d32f2f",
            }}
          >
            <span style={{ marginRight: "8px", fontSize: "16px" }}>
              {isApplicable ? "✓" : "✗"}
            </span>
            <span>Aplicável: {isApplicable ? "Sim" : "Não"}</span>
          </div>
        </div>
      );
    }

    // Renderizar todas as questões
    Object.keys(sectionData).forEach((questionKey) => {
      if (questionKey !== "aplicavel" && questionKey.indexOf("questao") === 0) {
        const questionData = sectionData[questionKey];
        if (
          questionData &&
          typeof questionData === "object" &&
          questionData !== null &&
          "resposta" in questionData
        ) {
          const resposta = (questionData as { resposta: string }).resposta;
          const isPositive = resposta === "SIM";
          const isNegative = resposta === "NAO";
          const questionNumber = questionKey.replace("questao", "");

          questions.push(
            <div
              key={`${sectionKey}-${questionKey}`}
              style={{
                backgroundColor: "#ffffff",
                padding: "12px 16px",
                borderRadius: "6px",
                border: "1px solid #e1e5ea",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontWeight: "500",
                    color: "#323130",
                    fontSize: "14px",
                  }}
                >
                  Questão {questionNumber}
                </span>
                <div
                  style={{
                    backgroundColor: isPositive
                      ? "#d4f6d4"
                      : isNegative
                      ? "#ffd4d4"
                      : "#fff3cd",
                    color: isPositive
                      ? "#2e7d32"
                      : isNegative
                      ? "#d32f2f"
                      : "#8a6d3b",
                    padding: "4px 12px",
                    borderRadius: "12px",
                    fontWeight: "600",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {isPositive && <span>✓</span>}
                  {isNegative && <span>✗</span>}
                  {resposta === "SIM"
                    ? "Sim"
                    : resposta === "NAO"
                    ? "Não"
                    : resposta}
                </div>
              </div>
            </div>
          );
        }
      }
    });

    return questions.length > 0 ? (
      <Stack tokens={{ childrenGap: 0 }}>{questions}</Stack>
    ) : null;
  };

  // Renderizar dinamicamente todos os campos disponíveis
  const renderDynamicFields = (): React.ReactElement => {
    if (!conformidade || Object.keys(conformidade).length === 0) {
      return (
        <MessageBar messageBarType={MessageBarType.info}>
          Nenhum dado de conformidade legal disponível.
        </MessageBar>
      );
    }

    return (
      <div>
        {Object.keys(conformidade).map((sectionKey) => {
          const sectionData = conformidade[sectionKey] as Record<
            string,
            unknown
          >;
          const sectionTitle = formatSectionName(sectionKey);
          const questionsContent = renderQuestions(sectionData, sectionKey);

          return questionsContent ? (
            <div
              key={sectionKey}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                border: "1px solid #e1e5ea",
                overflow: "hidden",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#0078d4",
                  padding: "16px 20px",
                  borderBottom: "1px solid #e1e5ea",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    color: "#ffffff",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  {sectionTitle}
                </h3>
              </div>
              <div style={{ padding: "16px 20px" }}>{questionsContent}</div>
            </div>
          ) : null;
        })}
      </div>
    );
  };

  return (
    <div className={styles.conformidadeViewer}>
      <Stack tokens={{ childrenGap: 24 }}>
        <SectionTitle title="Conformidade Legal" />
        <Stack tokens={{ childrenGap: 16 }}>{renderDynamicFields()}</Stack>
      </Stack>
    </div>
  );
};

export default ConformidadeViewer;
