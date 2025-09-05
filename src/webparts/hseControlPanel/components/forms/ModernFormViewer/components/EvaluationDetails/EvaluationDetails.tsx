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
  // Removido a verificação showEvaluationDetails pois a seção deve sempre aparecer

  const shouldShowEvaluationSection =
    formData.status === "Em Andamento" ||
    formData.status === "Enviado" ||
    formData.status === "Em Análise" ||
    formData.status === "Aprovado" ||
    formData.status === "Rejeitado" ||
    formData.status === "Pendente Info.";

  if (!shouldShowEvaluationSection) {
    return null;
  }

  // Função para buscar todas as avaliações
  const getAllAvaliacoes = (): Array<{
    indice: string;
    HSEResponsavel?: string;
    Comentarios?: string;
    DataInicio?: string;
    DataFim?: string;
    StatusAvaliacao?: string;
  }> => {
    const metadata = (
      formData as unknown as {
        metadata?: {
          Avaliacao?: Record<string, unknown>;
        };
      }
    )?.metadata;

    const avaliacaoData = metadata?.Avaliacao;
    const todasAvaliacoes: Array<{
      indice: string;
      HSEResponsavel?: string;
      Comentarios?: string;
      DataInicio?: string;
      DataFim?: string;
      StatusAvaliacao?: string;
    }> = [];

    if (avaliacaoData) {
      const quantidadeAvaliacao =
        (avaliacaoData.QuantidadeAvaliacao as number) || 0;

      // Coletar todas as avaliações
      for (let i = 0; i < quantidadeAvaliacao; i++) {
        const avaliacaoAtual = avaliacaoData[i.toString()] as {
          HSEResponsavel?: string;
          Comentarios?: string;
          DataInicio?: string;
          DataFim?: string;
          StatusAvaliacao?: string;
        };

        if (avaliacaoAtual) {
          todasAvaliacoes.push({
            indice: i.toString(),
            ...avaliacaoAtual,
          });
        }
      }
    }

    return todasAvaliacoes;
  };

  // Função para renderizar histórico de avaliações
  const renderHistoricoAvaliacoes = (
    todasAvaliacoes: Array<{
      indice: string;
      HSEResponsavel?: string;
      Comentarios?: string;
      DataInicio?: string;
      DataFim?: string;
      StatusAvaliacao?: string;
    }>
  ): JSX.Element | null => {
    if (todasAvaliacoes.length === 0) return null;

    return (
      <Stack tokens={{ childrenGap: 12 }} style={{ marginTop: "20px" }}>
        <Text variant="mediumPlus" style={{ fontWeight: "bold" }}>
          📋 Histórico de Avaliações ({todasAvaliacoes.length} avaliação
          {todasAvaliacoes.length > 1 ? "ões" : ""})
        </Text>
        {todasAvaliacoes.map((avaliacao, index) => (
          <Stack
            key={avaliacao.indice}
            tokens={{ childrenGap: 4 }}
            style={{
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              backgroundColor:
                index === todasAvaliacoes.length - 1 ? "#f0f8ff" : "#f9f9f9",
            }}
          >
            <Text style={{ fontWeight: "bold" }}>
              Avaliação #{parseInt(avaliacao.indice) + 1}{" "}
              {index === todasAvaliacoes.length - 1 && "(Mais Recente)"}
            </Text>
            <Text>
              <strong>Responsável:</strong> {avaliacao.HSEResponsavel || "N/A"}
            </Text>
            <Text>
              <strong>Status:</strong> {avaliacao.StatusAvaliacao || "N/A"}
            </Text>
            {avaliacao.DataInicio && (
              <Text>
                <strong>Início:</strong>{" "}
                {new Date(avaliacao.DataInicio).toLocaleString("pt-BR")}
              </Text>
            )}
            {avaliacao.DataFim && (
              <Text>
                <strong>Conclusão:</strong>{" "}
                {new Date(avaliacao.DataFim).toLocaleString("pt-BR")}
              </Text>
            )}
            <Text>
              <strong>Comentários:</strong> {avaliacao.Comentarios || "N/A"}
            </Text>
          </Stack>
        ))}
      </Stack>
    );
  };

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

    // Buscar dados da ÚLTIMA avaliação (mais recente)
    let evaluationData: {
      HSEResponsavel?: string;
      Comentarios?: string;
      DataInicio?: string;
      DataFim?: string;
    } = {};

    const todasAvaliacoes: Array<{
      indice: string;
      HSEResponsavel?: string;
      Comentarios?: string;
      DataInicio?: string;
      DataFim?: string;
      StatusAvaliacao?: string;
    }> = [];

    if (avaliacaoData) {
      const quantidadeAvaliacao =
        (avaliacaoData.QuantidadeAvaliacao as number) || 0;

      // Coletar todas as avaliações
      for (let i = 0; i < quantidadeAvaliacao; i++) {
        const avaliacaoAtual = avaliacaoData[i.toString()] as {
          HSEResponsavel?: string;
          Comentarios?: string;
          DataInicio?: string;
          DataFim?: string;
          StatusAvaliacao?: string;
        };

        if (avaliacaoAtual) {
          todasAvaliacoes.push({
            indice: i.toString(),
            ...avaliacaoAtual,
          });
        }
      }

      // Pegar a ÚLTIMA avaliação (mais recente) para exibir nos detalhes principais
      if (quantidadeAvaliacao > 0) {
        const ultimaAvaliacaoIndex = (quantidadeAvaliacao - 1).toString();
        evaluationData = avaliacaoData[ultimaAvaliacaoIndex] as {
          HSEResponsavel?: string;
          Comentarios?: string;
          DataInicio?: string;
          DataFim?: string;
        };
      }
    }

    // Buscar datas - PRIMEIRO da estrutura Avaliacao, depois do histórico como fallback
    let dataInicio = "N/A";
    let dataConclusao = "N/A";

    // Priorizar datas da estrutura Avaliacao
    if (evaluationData.DataInicio) {
      dataInicio = new Date(evaluationData.DataInicio).toLocaleString("pt-BR");
    }

    if (evaluationData.DataFim) {
      dataConclusao = new Date(evaluationData.DataFim).toLocaleString("pt-BR");
    }

    // Fallback para histórico se não encontrou nas datas da Avaliacao
    if (
      (dataInicio === "N/A" || dataConclusao === "N/A") &&
      historicoStatusChange
    ) {
      // Converter histórico para array se estiver em formato de objeto
      let historicoArray: Array<{ status: string; dataAlteracao?: string }> =
        [];

      if (Array.isArray(historicoStatusChange)) {
        historicoArray = historicoStatusChange;
      } else if (typeof historicoStatusChange === "object") {
        // Converter objeto com chaves numéricas para array
        historicoArray = Object.values(historicoStatusChange) as Array<{
          status: string;
          dataAlteracao?: string;
        }>;
      }

      // Data de início = quando foi para "Em Análise" (se não encontrou na Avaliacao)
      if (dataInicio === "N/A") {
        const emAnaliseEntry = historicoArray.find(
          (entry: { status: string; dataAlteracao?: string }) =>
            entry.status === "Em Análise"
        );
        if (emAnaliseEntry?.dataAlteracao) {
          dataInicio = new Date(emAnaliseEntry.dataAlteracao).toLocaleString(
            "pt-BR"
          );
        }
      }

      // Data de conclusão = data do status atual (se não encontrou na Avaliacao)
      if (dataConclusao === "N/A") {
        const currentStatus = formData.status;
        const statusEntry = historicoArray
          .slice()
          .reverse()
          .find(
            (entry: { status: string; dataAlteracao?: string }) =>
              entry.status === currentStatus
          );

        if (statusEntry?.dataAlteracao) {
          dataConclusao = new Date(statusEntry.dataAlteracao).toLocaleString(
            "pt-BR"
          );
        }
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
        <Text>
          <strong>Comentários:</strong> {evaluationData.Comentarios || "N/A"}
        </Text>

        {/* Mostrar histórico de todas as avaliações se houver mais de uma */}
        {todasAvaliacoes.length > 1 && (
          <Stack tokens={{ childrenGap: 12 }} style={{ marginTop: "20px" }}>
            <Text variant="mediumPlus" style={{ fontWeight: "bold" }}>
              📋 Histórico de Avaliações ({todasAvaliacoes.length} avaliações)
            </Text>
            {todasAvaliacoes.map((avaliacao, index) => (
              <Stack
                key={avaliacao.indice}
                tokens={{ childrenGap: 4 }}
                style={{
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor:
                    index === todasAvaliacoes.length - 1
                      ? "#f0f8ff"
                      : "#f9f9f9",
                }}
              >
                <Text style={{ fontWeight: "bold" }}>
                  Avaliação #{parseInt(avaliacao.indice) + 1}{" "}
                  {index === todasAvaliacoes.length - 1 && "(Mais Recente)"}
                </Text>
                <Text>
                  <strong>Responsável:</strong>{" "}
                  {avaliacao.HSEResponsavel || "N/A"}
                </Text>
                <Text>
                  <strong>Status:</strong> {avaliacao.StatusAvaliacao || "N/A"}
                </Text>
                {avaliacao.DataInicio && (
                  <Text>
                    <strong>Início:</strong>{" "}
                    {new Date(avaliacao.DataInicio).toLocaleString("pt-BR")}
                  </Text>
                )}
                {avaliacao.DataFim && (
                  <Text>
                    <strong>Conclusão:</strong>{" "}
                    {new Date(avaliacao.DataFim).toLocaleString("pt-BR")}
                  </Text>
                )}
                <Text>
                  <strong>Comentários:</strong> {avaliacao.Comentarios || "N/A"}
                </Text>
              </Stack>
            ))}
          </Stack>
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
            {/* Mostrar histórico de avaliações anteriores, se existir */}
            {renderHistoricoAvaliacoes(getAllAvaliacoes())}

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
                  text: "⏳ Pendente Info.",
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
            {renderEvaluationFinalized()}
          </Stack>
        )}
      </Stack>
    </div>
  );
};

export default EvaluationDetails;
