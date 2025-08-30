import * as React from "react";
import {
  Dialog,
  DialogType,
  DialogFooter,
  PrimaryButton,
  DefaultButton,
  Stack,
  Text,
  Dropdown,
  TextField,
  IDropdownOption,
  IPersonaProps,
} from "@fluentui/react";

export interface IReviewDialogsProps {
  // Start Review Dialog
  showReviewDialog: boolean;
  setShowReviewDialog: (show: boolean) => void;
  handleConfirmStartReview: () => Promise<void>;
  submittingReview: boolean;

  // Review Progress Dialog
  isReviewing: boolean;
  setIsReviewing: (reviewing: boolean) => void;
  reviewStatus: "Aprovado" | "Rejeitado" | "Pendente Info.";
  setReviewStatus: (
    status: "Aprovado" | "Rejeitado" | "Pendente Info."
  ) => void;
  reviewComments: string;
  setReviewComments: (comments: string) => void;
  handleFinishReview: () => Promise<void>;

  // Start Confirmation Dialog
  showStartConfirmation: boolean;
  setShowStartConfirmation: (show: boolean) => void;
  selectedHSEResponsible: IPersonaProps | undefined;
  handleStartEvaluation: () => Promise<void>;

  // Send Confirmation Dialog
  showSendConfirmation: boolean;
  setShowSendConfirmation: (show: boolean) => void;
  evaluationResult: "Aprovado" | "Pendente Info." | "Rejeitado";
  handleSendEvaluation: () => Promise<void>;
}

const ReviewDialogs: React.FC<IReviewDialogsProps> = ({
  showReviewDialog,
  setShowReviewDialog,
  handleConfirmStartReview,
  submittingReview,
  isReviewing,
  setIsReviewing,
  reviewStatus,
  setReviewStatus,
  reviewComments,
  setReviewComments,
  handleFinishReview,
  showStartConfirmation,
  setShowStartConfirmation,
  selectedHSEResponsible,
  handleStartEvaluation,
  showSendConfirmation,
  setShowSendConfirmation,
  evaluationResult,
  handleSendEvaluation,
}) => {
  const reviewStatusOptions: IDropdownOption[] = [
    { key: "Aprovado", text: "✅ Aprovado" },
    { key: "Rejeitado", text: "❌ Rejeitado" },
    { key: "Pendente Info.", text: "⚠️ Pendente Info." },
  ];

  return (
    <>
      {/* Dialog para iniciar revisão */}
      <Dialog
        hidden={!showReviewDialog}
        onDismiss={() => setShowReviewDialog(false)}
        dialogContentProps={{
          type: DialogType.normal,
          title: "🔍 Iniciar Revisão",
          subText:
            "Deseja iniciar a revisão deste formulário? Você será atribuído como revisor.",
        }}
      >
        <DialogFooter>
          <PrimaryButton
            onClick={handleConfirmStartReview}
            disabled={submittingReview}
            text={submittingReview ? "Iniciando..." : "Sim, Iniciar Revisão"}
          />
          <DefaultButton
            onClick={() => setShowReviewDialog(false)}
            text="Cancelar"
          />
        </DialogFooter>
      </Dialog>

      {/* Dialog para finalizar revisão */}
      {isReviewing && (
        <Dialog
          hidden={false}
          onDismiss={() => {}}
          dialogContentProps={{
            type: DialogType.normal,
            title: "✅ Finalizar Revisão",
            subText: "Defina o resultado da revisão deste formulário.",
          }}
          modalProps={{ isBlocking: true }}
        >
          <Stack tokens={{ childrenGap: 16 }}>
            <Dropdown
              label="Status da Revisão"
              options={reviewStatusOptions}
              selectedKey={reviewStatus}
              onChange={(_, option) =>
                setReviewStatus(
                  option?.key as "Aprovado" | "Rejeitado" | "Pendente Info."
                )
              }
            />
            <TextField
              label="Comentários"
              multiline
              rows={4}
              value={reviewComments}
              onChange={(_, value) => setReviewComments(value || "")}
              placeholder="Digite seus comentários sobre a revisão..."
            />
          </Stack>
          <DialogFooter>
            <PrimaryButton
              onClick={handleFinishReview}
              disabled={submittingReview}
              text={submittingReview ? "Finalizando..." : "Finalizar Revisão"}
            />
            <DefaultButton
              onClick={() => setIsReviewing(false)}
              text="Continuar Revisando"
            />
          </DialogFooter>
        </Dialog>
      )}

      {/* Diálogo para confirmar início da avaliação */}
      <Dialog
        hidden={!showStartConfirmation}
        onDismiss={() => setShowStartConfirmation(false)}
        dialogContentProps={{
          type: DialogType.normal,
          title: "🚀 Iniciar Avaliação",
          subText: `Deseja iniciar a avaliação deste formulário com ${selectedHSEResponsible?.text}?`,
        }}
        modalProps={{ isBlocking: true, dragOptions: undefined }}
      >
        <Stack tokens={{ childrenGap: 12 }}>
          <Text>
            ⚠️ <strong>Atenção:</strong> Após iniciar a avaliação:
          </Text>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>O status será alterado para &quot;Em Análise&quot;</li>
            <li>O responsável HSE não poderá ser alterado</li>
            <li>Esta ação não pode ser desfeita</li>
          </ul>
        </Stack>
        <DialogFooter>
          <PrimaryButton
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("✅ Botão confirmar avaliação clicado");
              try {
                await handleStartEvaluation();
                console.log("✅ Avaliação iniciada com sucesso");
                setShowStartConfirmation(false);
              } catch (error) {
                console.error("❌ Erro ao iniciar avaliação:", error);
              }
            }}
            text="Sim, Iniciar Avaliação"
          />
          <DefaultButton
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("❌ Cancelar avaliação clicado");
              setShowStartConfirmation(false);
            }}
            text="Cancelar"
          />
        </DialogFooter>
      </Dialog>

      {/* Diálogo para confirmar envio da avaliação */}
      <Dialog
        hidden={!showSendConfirmation}
        onDismiss={() => setShowSendConfirmation(false)}
        dialogContentProps={{
          type: DialogType.normal,
          title: "📤 Enviar Avaliação",
          subText: `Confirma o envio da avaliação com resultado "${evaluationResult}"? Esta ação irá atualizar o status do formulário.`,
        }}
      >
        <DialogFooter>
          <PrimaryButton
            onClick={handleSendEvaluation}
            text="Sim, Enviar Avaliação"
          />
          <DefaultButton
            onClick={() => setShowSendConfirmation(false)}
            text="Cancelar"
          />
        </DialogFooter>
      </Dialog>
    </>
  );
};

export default ReviewDialogs;
