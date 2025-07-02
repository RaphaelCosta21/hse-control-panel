import * as React from "react";
import {
  Panel,
  PanelType,
  Stack,
  Text,
  ChoiceGroup,
  TextField,
  PrimaryButton,
  DefaultButton,
  MessageBar,
  MessageBarType,
  Label,
  Separator,
} from "@fluentui/react";
import { IFormListItem } from "../../../types/IControlPanelData";
import { IHSEFormEvaluation } from "../../../types/IHSEFormEvaluation";
import styles from "./FormEvaluation.module.scss";

export interface IFormEvaluationProps {
  isOpen: boolean;
  onDismiss: () => void;
  form: IFormListItem | undefined;
  onSaveEvaluation: (evaluation: IHSEFormEvaluation) => Promise<void>;
}

export const FormEvaluation: React.FC<IFormEvaluationProps> = ({
  isOpen,
  onDismiss,
  form,
  onSaveEvaluation,
}) => {
  const [status, setStatus] = React.useState<string>("Em Análise");
  const [comments, setComments] = React.useState<string>("");
  const [observations, setObservations] = React.useState<string>("");
  const [saving, setSaving] = React.useState<boolean>(false);
  const [success, setSuccess] = React.useState<boolean>(false);

  const statusOptions = [
    { key: "Em Análise", text: "🔄 Em Análise" },
    { key: "Aprovado", text: "✅ Aprovado" },
    { key: "Rejeitado", text: "❌ Rejeitado" },
    { key: "Pendente Informações", text: "⏳ Pendente Informações" },
  ];

  const handleSave = async (): Promise<void> => {
    if (!form) return;

    try {
      setSaving(true);

      const evaluation: IHSEFormEvaluation = {
        formId: form.id,
        status: status as
          | "Em Análise"
          | "Aprovado"
          | "Rejeitado"
          | "Pendente Informações",
        comentarios: comments,
        observacoes: observations,
        avaliador: "Admin HSE", // TODO: Get from context
        dataAvaliacao: new Date(),
      };

      await onSaveEvaluation(evaluation);
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        // Não fechar automaticamente - deixar o usuário fechar
        // onDismiss();
      }, 2000);
    } catch (error) {
      console.error("Erro ao salvar avaliação:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = (
    _: React.FormEvent<HTMLElement | HTMLInputElement>,
    option?: { key: string; text: string }
  ): void => {
    if (option) {
      setStatus(option.key);
    }
  };

  if (!form) return null;

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={(e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        onDismiss();
      }}
      type={PanelType.medium}
      headerText={`Avaliação: ${form.empresa}`}
      className={styles.evaluationPanel}
      isBlocking={false}
      isLightDismiss={true}
    >
      <Stack tokens={{ childrenGap: 20 }}>
        {success && (
          <MessageBar messageBarType={MessageBarType.success}>
            Avaliação salva com sucesso!
          </MessageBar>
        )}

        {/* Form Info */}
        <Stack tokens={{ childrenGap: 8 }}>
          <Text variant="large" block>
            🏢 {form.empresa}
          </Text>
          <Text variant="medium" block>
            CNPJ: {form.cnpj} | Status Atual: {form.status}
          </Text>
        </Stack>

        <Separator />

        {/* Status Selection */}
        <Stack tokens={{ childrenGap: 12 }}>
          <Label required>🎯 Novo Status da Avaliação</Label>
          <ChoiceGroup
            options={statusOptions}
            selectedKey={status}
            onChange={handleStatusChange}
          />
        </Stack>

        {/* Comments */}
        <Stack tokens={{ childrenGap: 12 }}>
          <Label required>💬 Comentários Gerais</Label>
          <TextField
            multiline
            rows={4}
            value={comments}
            onChange={(_, value) => setComments(value || "")}
            placeholder="Comentários sobre a avaliação do formulário..."
          />
        </Stack>

        {/* Observations */}
        <Stack tokens={{ childrenGap: 12 }}>
          <Label>📝 Observações Específicas</Label>
          <TextField
            multiline
            rows={3}
            value={observations}
            onChange={(_, value) => setObservations(value || "")}
            placeholder="Observações detalhadas, pendências, etc..."
          />
        </Stack>

        {/* Actions */}
        <Stack horizontal horizontalAlign="end" tokens={{ childrenGap: 12 }}>
          <DefaultButton
            text="Cancelar"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDismiss();
            }}
            disabled={saving}
          />
          <PrimaryButton
            text={saving ? "Salvando..." : "💾 Salvar Avaliação"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSave().catch(console.error);
            }}
            disabled={saving || !comments.trim()}
          />
        </Stack>
      </Stack>
    </Panel>
  );
};
