import * as React from "react";
import { IPersonaProps } from "@fluentui/react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IFormListItem } from "../../../../types/IControlPanelData";
import { IHSEFormData } from "../../../../types/IHSEFormData";
import { SharePointService } from "../../../../services/SharePointService";
import { MembersService } from "../../../../services/MembersService";
import { ITeamMember } from "../../../../types/IMember";

export interface IFormDataHookProps {
  form: IFormListItem | undefined;
  sharePointService: SharePointService;
  context: WebPartContext;
}

export const useFormData = ({
  form,
  sharePointService,
  context,
}: IFormDataHookProps): {
  formData: IHSEFormData | undefined;
  setFormData: React.Dispatch<React.SetStateAction<IHSEFormData | undefined>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | undefined;
  setError: React.Dispatch<React.SetStateAction<string | undefined>>;
  hseMembersList: IPersonaProps[];
  setHseMembersList: React.Dispatch<React.SetStateAction<IPersonaProps[]>>;
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
  loadFormData: () => Promise<void>;
} => {
  const [formData, setFormData] = React.useState<IHSEFormData | undefined>(
    undefined
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [hseMembersList, setHseMembersList] = React.useState<IPersonaProps[]>(
    []
  );
  const [selectedTab, setSelectedTab] = React.useState("dadosGerais");

  // Função para criar dados básicos do formulário
  const createBasicFormData = React.useCallback(
    (formDetails: {
      Id: number;
      Title: string;
      CNPJ: string;
      StatusAvaliacao: string;
      GrauRisco: string;
      PercentualConclusao: number;
      EmailPreenchimento: string;
      NomePreenchimento: string;
    }): IHSEFormData => {
      return {
        id: formDetails.Id,
        grauRisco: (formDetails.GrauRisco || "2") as "1" | "2" | "3" | "4",
        percentualConclusao: formDetails.PercentualConclusao || 0,
        status: (formDetails.StatusAvaliacao || "Em Andamento") as
          | "Em Andamento"
          | "Enviado"
          | "Em Análise"
          | "Aprovado"
          | "Rejeitado"
          | "Pendente Informações",
        dadosGerais: {
          empresa: formDetails.Title || "",
          cnpj: formDetails.CNPJ || "",
          numeroContrato: "",
          dataInicioContrato: new Date(),
          dataTerminoContrato: new Date(),
          responsavelTecnico: formDetails.NomePreenchimento || "",
          email: formDetails.EmailPreenchimento || "",
          atividadePrincipalCNAE: "",
          grauRisco: (formDetails.GrauRisco || "2") as "1" | "2" | "3" | "4",
          gerenteContratoMarine: "",
          escopoServico: "",
          totalEmpregados: 0,
          empregadosParaServico: 0,
          possuiSESMT: false,
          numeroComponentesSESMT: 0,
        },
        conformidadeLegal: {
          nr01: { aplicavel: false, questoes: {}, comentarios: "" },
          nr04: { aplicavel: false, questoes: {}, comentarios: "" },
          nr05: { aplicavel: false, questoes: {}, comentarios: "" },
          nr06: { aplicavel: false, questoes: {}, comentarios: "" },
          nr07: { aplicavel: false, questoes: {}, comentarios: "" },
          nr09: { aplicavel: false, questoes: {}, comentarios: "" },
          nr10: { aplicavel: false, questoes: {}, comentarios: "" },
          nr11: { aplicavel: false, questoes: {}, comentarios: "" },
          nr12: { aplicavel: false, questoes: {}, comentarios: "" },
          nr13: { aplicavel: false, questoes: {}, comentarios: "" },
          nr15: { aplicavel: false, questoes: {}, comentarios: "" },
          nr23: { aplicavel: false, questoes: {}, comentarios: "" },
          licencasAmbientais: {
            aplicavel: false,
            questoes: {},
            comentarios: "",
          },
          legislacaoMaritima: {
            aplicavel: false,
            questoes: {},
            comentarios: "",
          },
          treinamentosObrigatorios: {
            aplicavel: false,
            questoes: {},
            comentarios: "",
          },
          gestaoSMS: { aplicavel: false, questoes: {}, comentarios: "" },
        },
        servicosEspeciais: {
          fornecedorEmbarcacoes: false,
          fornecedorIcamentoCarga: false,
        },
        anexos: {
          rem: [], // Array vazio por padrão
        },
      };
    },
    []
  );

  const loadFormData = React.useCallback(async () => {
    if (!form) {
      return;
    }

    try {
      setLoading(true);
      setError(undefined);

      // Carregar dados reais do SharePoint
      const formDetails = await sharePointService.getFormDetails(form.id);

      if (formDetails?.DadosFormulario) {
        try {
          const parsedData = JSON.parse(formDetails.DadosFormulario);

          // SEMPRE usar o status da coluna SharePoint, não do JSON
          parsedData.status = formDetails.StatusAvaliacao || "Em Andamento";

          setFormData(parsedData);
        } catch {
          // Se não conseguir parsear, usar dados básicos do formulário
          const basicData = createBasicFormData(formDetails);
          setFormData(basicData);
        }
      } else {
        // Se não há dados de formulário, criar estrutura básica
        const basicData = createBasicFormData(formDetails);
        setFormData(basicData);
      }
    } catch (error) {
      console.error("❌ [ModernFormViewer] Erro ao carregar dados:", error);
      setError("Erro ao carregar dados do formulário. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [form, sharePointService, createBasicFormData]);

  // Carregar membros HSE
  React.useEffect(() => {
    const loadHSEMembers = async (): Promise<void> => {
      try {
        const membersService = new MembersService(context);
        const membersData = await membersService.getTeamMembers();

        const formattedMembers: IPersonaProps[] = membersData.hseMembers.map(
          (member: ITeamMember) => ({
            id: member.id.toString(),
            text: member.name,
            secondaryText: member.email,
            imageUrl: member.photoUrl,
          })
        );

        setHseMembersList(formattedMembers);
      } catch (error) {
        console.error("Erro ao carregar membros HSE:", error);
      }
    };

    if (context) {
      loadHSEMembers().catch(console.error);
    }
  }, [context]);

  // Carregar dados quando o form mudar
  React.useEffect(() => {
    if (form) {
      loadFormData().catch(console.error);
    }
  }, [form, loadFormData]);

  return {
    formData,
    setFormData,
    loading,
    setLoading,
    error,
    setError,
    hseMembersList,
    setHseMembersList,
    selectedTab,
    setSelectedTab,
    loadFormData,
  };
};
