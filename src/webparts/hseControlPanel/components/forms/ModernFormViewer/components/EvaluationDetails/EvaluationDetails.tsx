import * as React from "react";
import {
  Stack,
  Text,
  Dropdown,
  TextField,
  PrimaryButton,
  IPersonaProps,
} from "@fluentui/react";
import { IHSEFormData } from "../../../../../types/IHSEFormData";
import styles from "./EvaluationDetails.module.scss";

export interface IEvaluationDetailsProps {
  formData: IHSEFormData;
  showEvaluationDetails: boolean;
  evaluationStarted: boolean;
  selectedHSEResponsible: IPersonaProps | undefined;
  evaluationResult: "Aprovado" | "Pendente Info." | "Rejeitado";
  evaluationComments: string;
  startDate: string;
  hseMembersList: IPersonaProps[];
  setSelectedHSEResponsible: (responsible: IPersonaProps | undefined) => void;
  setEvaluationResult: (
    result: "Aprovado" | "Pendente Info." | "Rejeitado"
  ) => void;
  setEvaluationComments: (comments: string) => void;
  setShowStartConfirmation: (show: boolean) => void;
  setShowSendConfirmation: (show: boolean) => void;
}

const EvaluationDetails: React.FC<IEvaluationDetailsProps> = ({
  formData,
  showEvaluationDetails,
  evaluationStarted,
  selectedHSEResponsible,
  evaluationResult,
  evaluationComments,
  startDate,
  hseMembersList,
  setSelectedHSEResponsible,
  setEvaluationResult,
  setEvaluationComments,
  setShowStartConfirmation,
  setShowSendConfirmation,
}) => {
  if (!showEvaluationDetails) {
    return null;
  }

  const shouldShowEvaluationSection =
    formData.status === "Em Andamento" ||
    formData.status === "Enviado" ||
    formData.status === "Em Análise" ||
    formData.status === "Aprovado" ||
    formData.status === "Rejeitado" ||
    formData.status === "Pendente Informações";

  if (!shouldShowEvaluationSection) {
    return null;
  }

  const renderEvaluationFinalized = (): React.ReactElement => {
    // Debug: Log dos dados para verificar estrutura
    console.log(
      "🔍 [EvaluationDetails] Dados completos do formulário:",
      formData
    );

    const metadata = (
      formData as unknown as {
        metadata?: {
          Avaliacao?: Record<string, unknown>;
          historicoStatusChange?: Record<
            string,
            { dataAlteracao?: string; email?: string }
          >;
        };
      }
    )?.metadata;

    const avaliacaoData = metadata?.Avaliacao;
    const historicoStatusChange = metadata?.historicoStatusChange;

    // Buscar dados de avaliação
    let evaluationData: {
      HSEResponsavel?: string;
      Comentarios?: string;
    } = {};

    if (avaliacaoData) {
      const firstEvaluationKey = Object.keys(avaliacaoData)[0];
      evaluationData = (avaliacaoData[firstEvaluationKey] ||
        avaliacaoData["0"]) as {
        HSEResponsavel?: string;
        Comentarios?: string;
      };
    }

    // Buscar datas do histórico de status
    let dataInicio = "N/A";
    let dataConclusao = "N/A";

    if (historicoStatusChange) {
      // Data de início = quando foi para "Em Análise"
      if (historicoStatusChange["Em Análise"]?.dataAlteracao) {
        dataInicio = new Date(
          historicoStatusChange["Em Análise"].dataAlteracao
        ).toLocaleString("pt-BR");
      }

      // Data de conclusão = data do status atual
      const currentStatus = formData.status;
      if (
        currentStatus === "Aprovado" &&
        historicoStatusChange.Aprovado?.dataAlteracao
      ) {
        dataConclusao = new Date(
          historicoStatusChange.Aprovado.dataAlteracao
        ).toLocaleString("pt-BR");
      } else if (
        currentStatus === "Rejeitado" &&
        historicoStatusChange.Rejeitado?.dataAlteracao
      ) {
        dataConclusao = new Date(
          historicoStatusChange.Rejeitado.dataAlteracao
        ).toLocaleString("pt-BR");
      } else if (
        currentStatus === "Pendente Informações" &&
        historicoStatusChange["Pendente Info"]?.dataAlteracao
      ) {
        dataConclusao = new Date(
          historicoStatusChange["Pendente Info"].dataAlteracao
        ).toLocaleString("pt-BR");
      }
    }

    return (
      <Stack tokens={{ childrenGap: 8 }}>
        <Text>
          <strong>Status:</strong> {formData.status}
        </Text>
        <Text>
          <strong>Responsável HSE:</strong>{" "}
          {evaluationData.HSEResponsavel || "N/A"}
        </Text>
        <Text>
          <strong>Data de Início:</strong> {dataInicio}
        </Text>
        <Text>
          <strong>Data de Conclusão:</strong> {dataConclusao}
        </Text>
        {evaluationData.Comentarios && (
          <div className={styles.commentsSection}>
            <Text>
              <strong>Comentários:</strong>
            </Text>
            <div className={styles.commentsBox}>
              <Text>{evaluationData.Comentarios}</Text>
            </div>
          </div>
        )}
      </Stack>
    );
  };

  return (
    <div className={styles.evaluationSection}>
      <Stack tokens={{ childrenGap: 20 }}>
        <Text variant="xLarge" className={styles.evaluationTitle}>
          📋 Detalhes da Avaliação
        </Text>

        {/* Estado 1: Antes da avaliação - Formulário enviado, aguardando início */}
        {formData.status === "Enviado" && !evaluationStarted ? (
          <Stack tokens={{ childrenGap: 16 }}>
            <Text>Selecione um responsável HSE para iniciar a avaliação:</Text>
            <Dropdown
              label="Responsável HSE"
              placeholder="Selecione um membro da equipe HSE"
              options={hseMembersList.map((member) => ({
                key: member.id || "",
                text: member.text || "",
              }))}
              selectedKey={selectedHSEResponsible?.id}
              onChange={(_, option) => {
                const selectedMember = hseMembersList.find(
                  (m) => m.id === option?.key
                );
                setSelectedHSEResponsible(selectedMember || undefined);
              }}
            />
            <Stack
              horizontal
              horizontalAlign="start"
              tokens={{ childrenGap: 16 }}
            >
              <PrimaryButton
                text="Iniciar Avaliação"
                iconProps={{ iconName: "Play" }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("🚀 Botão Iniciar Avaliação clicado");
                  setShowStartConfirmation(true);
                }}
                disabled={!selectedHSEResponsible}
              />
            </Stack>
          </Stack>
        ) : formData.status === "Em Análise" ? (
          /* Estado 2: Durante a avaliação - Em análise, pode editar */
          <Stack tokens={{ childrenGap: 16 }}>
            <Stack
              horizontal
              verticalAlign="center"
              tokens={{ childrenGap: 8 }}
            >
              <Text>Status atual:</Text>
              <Text className={styles.statusBadge}>🔄 Em Análise</Text>
              <Text>desde {startDate}</Text>
            </Stack>

            <Text>Responsável: {selectedHSEResponsible?.text}</Text>

            <Dropdown
              label="Resultado da Avaliação"
              selectedKey={evaluationResult}
              onChange={(_, option) =>
                setEvaluationResult(
                  option?.key as "Aprovado" | "Pendente Info." | "Rejeitado"
                )
              }
              options={[
                { key: "Aprovado", text: "✅ Aprovado" },
                {
                  key: "Pendente Info.",
                  text: "⏳ Pendente Informações",
                },
                { key: "Rejeitado", text: "❌ Rejeitado" },
              ]}
            />

            <TextField
              label="Comentários da Avaliação"
              multiline
              rows={4}
              value={evaluationComments}
              onChange={(_, value) => setEvaluationComments(value || "")}
              placeholder="Digite seus comentários sobre a avaliação..."
            />

            <Stack
              horizontal
              horizontalAlign="start"
              tokens={{ childrenGap: 16 }}
            >
              <PrimaryButton
                text="Enviar Avaliação"
                iconProps={{ iconName: "Send" }}
                onClick={() => setShowSendConfirmation(true)}
              />
            </Stack>
          </Stack>
        ) : (
          /* Estado 3: Após a avaliação - Mostra informações somente leitura */
          <Stack tokens={{ childrenGap: 16 }}>
            <Text variant="large">📋 Avaliação Finalizada</Text>
            {renderEvaluationFinalized()}
          </Stack>
        )}
      </Stack>
    </div>
  );
};

export default EvaluationDetails;
