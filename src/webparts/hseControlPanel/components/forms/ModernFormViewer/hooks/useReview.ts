import * as React from "react";
import { IFormListItem } from "../../../../types/IControlPanelData";

export interface IReviewHookProps {
  form: IFormListItem | undefined;
  currentUser?: {
    name: string;
    email: string;
    photoUrl?: string;
  };
  onFormUpdate?: (updatedForm: IFormListItem) => void;
  onDismiss: () => void;
}

export const useReview = ({
  form,
  currentUser,
  onFormUpdate,
  onDismiss,
}: IReviewHookProps) => {
  const [showReviewDialog, setShowReviewDialog] = React.useState(false);
  const [reviewStatus, setReviewStatus] = React.useState<
    "Aprovado" | "Rejeitado" | "Pendente Informações"
  >("Aprovado");
  const [reviewComments, setReviewComments] = React.useState("");
  const [submittingReview, setSubmittingReview] = React.useState(false);
  const [isReviewing, setIsReviewing] = React.useState(false);

  const handleStartReview = React.useCallback(() => {
    setShowReviewDialog(true);
  }, []);

  const handleConfirmStartReview = React.useCallback(async () => {
    if (!form || !currentUser) return;

    try {
      setSubmittingReview(true);

      // Atualizar o formulário com o avaliador atribuído
      const updatedForm: IFormListItem = {
        ...form,
        status: "Em Análise",
        avaliadorAtribuido: {
          name: currentUser.name,
          email: currentUser.email,
          photoUrl: currentUser.photoUrl,
          isActive: true,
        },
      };

      // Implementar chamada para SharePoint aqui
      console.log("Iniciando revisão:", updatedForm);

      setIsReviewing(true);
      setShowReviewDialog(false);

      if (onFormUpdate) {
        onFormUpdate(updatedForm);
      }
    } catch (err) {
      console.error("Erro ao iniciar revisão:", err);
      throw new Error("Erro ao iniciar revisão. Tente novamente.");
    } finally {
      setSubmittingReview(false);
    }
  }, [form, currentUser, onFormUpdate]);

  const handleFinishReview = React.useCallback(async () => {
    if (!form || !currentUser) return;

    try {
      setSubmittingReview(true);

      const reviewData = {
        status: reviewStatus,
        comments: reviewComments,
        reviewer: {
          name: currentUser.name,
          email: currentUser.email,
          photoUrl: currentUser.photoUrl,
        },
        reviewDate: new Date(),
      };

      // Implementar chamada para SharePoint aqui
      console.log("Finalizando revisão:", reviewData);

      const updatedForm: IFormListItem = {
        ...form,
        status:
          reviewStatus === "Pendente Informações"
            ? "Pendente Informações"
            : reviewStatus,
        dataAvaliacao: new Date(),
      };

      setIsReviewing(false);

      if (onFormUpdate) {
        onFormUpdate(updatedForm);
      }

      onDismiss();
    } catch (err) {
      console.error("Erro ao finalizar revisão:", err);
      throw new Error("Erro ao finalizar revisão. Tente novamente.");
    } finally {
      setSubmittingReview(false);
    }
  }, [
    form,
    currentUser,
    reviewStatus,
    reviewComments,
    onFormUpdate,
    onDismiss,
  ]);

  return {
    // States
    showReviewDialog,
    setShowReviewDialog,
    reviewStatus,
    setReviewStatus,
    reviewComments,
    setReviewComments,
    submittingReview,
    setSubmittingReview,
    isReviewing,
    setIsReviewing,

    // Handlers
    handleStartReview,
    handleConfirmStartReview,
    handleFinishReview,
  };
};
