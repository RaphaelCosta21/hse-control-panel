import * as React from "react";
import { IHSEFormData } from "../types/IHSEFormData";
import { IAttachmentMetadata } from "../types/IAttachmentMetadata";

export interface IHSEFormHookData {
  formData: IHSEFormData | null;
  attachments: { [category: string]: IAttachmentMetadata[] };
  loading: boolean;
  error: string | null;
  saving: boolean;
  loadForm: (formId: number) => Promise<void>;
  saveForm: (
    data: IHSEFormData,
    attachments: { [category: string]: IAttachmentMetadata[] }
  ) => Promise<number>;
  submitForm: (
    data: IHSEFormData,
    attachments: { [category: string]: IAttachmentMetadata[] }
  ) => Promise<number>;
  clearForm: () => void;
}

export const useHSEForm = (initialFormId?: number): IHSEFormHookData => {
  const [formData, setFormData] = React.useState<IHSEFormData | null>(null);
  const [attachments, setAttachments] = React.useState<{
    [category: string]: IAttachmentMetadata[];
  }>({});
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState<boolean>(false);

  const loadForm = React.useCallback(async (formId: number) => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Implementar busca real via SharePoint
      console.log("Loading form:", formId);

      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock form data
      const mockFormData: IHSEFormData = {
        id: formId,
        dadosGerais: {
          empresa: "Petrobras",
          cnpj: "33.000.167/0001-01",
          endereco: "Rio de Janeiro, RJ",
          telefone: "(21) 1234-5678",
          email: "contato@petrobras.com.br",
          responsavelTecnico: "João Silva",
          responsavelTecnicoEmail: "joao.silva@petrobras.com.br",
          responsavelTecnicoTelefone: "(21) 9876-5432",
        },
        conformidadeLegal: {
          possuiLicencaAmbiental: true,
          numeroLicencaAmbiental: "LA123456",
          validadeLicencaAmbiental: new Date("2025-12-31"),
          possuiCertificadoISO14001: true,
          numeroCertificadoISO14001: "ISO123456",
          validadeCertificadoISO14001: new Date("2025-06-30"),
          possuiCIPAConstituida: true,
          numeroAtaCIPA: "CIPA001",
          validadeAtaCIPA: new Date("2025-12-31"),
        },
        servicosEspeciais: {
          realizaServicosAltura: true,
          realizaServicosEspacosConfinados: false,
          realizaServicosEletricos: true,
          realizaServicosQuentes: false,
          possuiProcedimentosEscritos: true,
          possuiTreinamentoEspecifico: true,
        },
        grauRisco: "4",
        percentualConclusao: 95,
        status: "Em Análise",
        dataSubmissao: new Date("2024-06-10"),
      };

      setFormData(mockFormData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar formulário"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const saveForm = React.useCallback(
    async (
      data: IHSEFormData,
      formAttachments: { [category: string]: IAttachmentMetadata[] }
    ): Promise<number> => {
      try {
        setSaving(true);
        setError(null);

        // TODO: Implementar salvamento real via SharePoint
        console.log("Saving form:", { data, formAttachments });

        // Simular delay de API
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setFormData(data);
        setAttachments(formAttachments);

        return data.id || Date.now(); // Mock ID
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao salvar formulário"
        );
        throw err;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const submitForm = React.useCallback(
    async (
      data: IHSEFormData,
      formAttachments: { [category: string]: IAttachmentMetadata[] }
    ): Promise<number> => {
      try {
        setSaving(true);
        setError(null);

        // TODO: Implementar submissão real via SharePoint
        console.log("Submitting form:", { data, formAttachments });

        // Simular delay de API
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const submittedData = {
          ...data,
          status: "Enviado" as const,
          dataSubmissao: new Date(),
        };

        setFormData(submittedData);
        setAttachments(formAttachments);

        return submittedData.id || Date.now(); // Mock ID
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao submeter formulário"
        );
        throw err;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const clearForm = React.useCallback(() => {
    setFormData(null);
    setAttachments({});
    setError(null);
  }, []);

  // Load initial form if provided
  React.useEffect(() => {
    if (initialFormId) {
      loadForm(initialFormId);
    }
  }, [initialFormId, loadForm]);

  return {
    formData,
    attachments,
    loading,
    error,
    saving,
    loadForm,
    saveForm,
    submitForm,
    clearForm,
  };
};
