import * as React from "react";
import {
  Panel,
  PanelType,
  Stack,
  Text,
  DefaultButton,
  PrimaryButton,
  Separator,
} from "@fluentui/react";
import { IFormListItem } from "../../../types/IFormListItem";
import HSEFormViewer from "../HSEFormViewer/HSEFormViewer";
import AttachmentViewer from "../AttachmentViewer/AttachmentViewer";
import styles from "./FormDetails.module.scss";

export interface IFormDetailsProps {
  isOpen: boolean;
  onDismiss: () => void;
  form: IFormListItem | null;
  onStartEvaluation?: (formId: number) => void;
  onViewAttachments?: (formId: number) => void;
}

export const FormDetails: React.FC<IFormDetailsProps> = ({
  isOpen,
  onDismiss,
  form,
  onStartEvaluation,
  onViewAttachments,
}) => {
  const [showAttachments, setShowAttachments] = React.useState(false);

  if (!form) return null;

  const handleStartEvaluation = () => {
    if (onStartEvaluation) {
      onStartEvaluation(form.id);
    }
  };

  const handleViewAttachments = () => {
    setShowAttachments(true);
    if (onViewAttachments) {
      onViewAttachments(form.id);
    }
  };

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDismiss}
      type={PanelType.large}
      headerText={`Detalhes: ${form.companyName}`}
      className={styles.formDetailsPanel}
    >
      <Stack tokens={{ childrenGap: 16 }}>
        {/* Header Info */}
        <Stack
          horizontal
          horizontalAlign="space-between"
          verticalAlign="center"
        >
          <Stack tokens={{ childrenGap: 8 }}>
            <Text variant="xLarge" block>
              🏢 {form.companyName}
            </Text>
            <Text variant="medium" block>
              CNPJ: {form.cnpj}
            </Text>
            <Text variant="medium" block>
              Contrato: {form.contractNumber}
            </Text>
          </Stack>
          <Stack tokens={{ childrenGap: 8 }}>
            <PrimaryButton
              text="🔍 Iniciar Avaliação"
              onClick={handleStartEvaluation}
              disabled={
                form.status === "Aprovado" || form.status === "Rejeitado"
              }
            />
            <DefaultButton
              text="📎 Ver Anexos"
              onClick={handleViewAttachments}
            />
          </Stack>
        </Stack>

        <Separator />

        {/* Form Viewer */}
        <div className={styles.formContent}>
          {showAttachments ? (
            <Stack tokens={{ childrenGap: 12 }}>
              <DefaultButton
                text="⬅️ Voltar aos Dados"
                onClick={() => setShowAttachments(false)}
              />
              <AttachmentViewer
                attachments={form.formData?.attachments || {}}
                formId={form.id}
                companyName={form.companyName}
              />
            </Stack>
          ) : (
            <HSEFormViewer formData={form.formData} />
          )}
        </div>

        {/* Footer Actions */}
        <Stack horizontal horizontalAlign="end" tokens={{ childrenGap: 8 }}>
          <DefaultButton text="Fechar" onClick={onDismiss} />
        </Stack>
      </Stack>
    </Panel>
  );
};
