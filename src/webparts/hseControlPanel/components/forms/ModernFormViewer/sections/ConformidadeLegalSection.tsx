import * as React from "react";
import {
  Stack,
  Text,
  Icon,
  Label,
  MessageBar,
  MessageBarType,
  DefaultButton,
} from "@fluentui/react";
import {
  IConformidadeLegal,
  IAnexos,
  IFileMetadata,
} from "../../../../types/IHSEFormData";
import { SharePointService } from "../../../../services/SharePointService";
import styles from "./ConformidadeLegalSection.module.scss";

export interface IConformidadeLegalSectionProps {
  data: IConformidadeLegal;
  anexos: IAnexos;
  isReviewing: boolean;
  cnpj: string;
  empresa: string;
  id: string;
  sharePointService?: SharePointService;
}

interface IQuestao {
  id: string;
  texto: string;
}

interface ISectionData {
  id: string;
  titulo: string;
  obrigatoria: boolean;
  categoria: "obrigatorias" | "opcionais" | "outros";
  questoes: IQuestao[];
  anexos: string[];
}

interface ISectionFormData {
  aplicavel: boolean;
  questao1?: {
    resposta: "SIM" | "NAO" | "NA";
  };
  questao2?: {
    resposta: "SIM" | "NAO" | "NA";
  };
  questao3?: {
    resposta: "SIM" | "NAO" | "NA";
  };
  questao4?: {
    resposta: "SIM" | "NAO" | "NA";
  };
  questao5?: {
    resposta: "SIM" | "NAO" | "NA";
  };
  questao6?: {
    resposta: "SIM" | "NAO" | "NA";
  };
  comentarios?: string;
}

const conformidadeSections: ISectionData[] = [
  // NORMAS REGULAMENTADORAS OBRIGATÓRIAS
  {
    id: "nr01",
    titulo: "NR 01 - Disposições Gerais",
    obrigatoria: true,
    categoria: "obrigatorias",
    questoes: [
      {
        id: "questao1",
        texto:
          "A CONTRATADA tem conhecimento, cumpre e faz cumprir as disposições legais e regulamentares sobre segurança e medicina do trabalho determinadas na legislação federal, estadual e/ou municipal?",
      },
      {
        id: "questao2",
        texto:
          "Elabora ordens de serviços sobre segurança e saúde, conscientizando seus empregados quanto aos riscos existentes e os seus mecanismos de prevenção e controle?",
      },
    ],
    anexos: [],
  },
  {
    id: "nr04",
    titulo: "NR 04 - SESMT",
    obrigatoria: true,
    categoria: "obrigatorias",
    questoes: [
      {
        id: "questao1",
        texto: "A CONTRATADA possui SESMT registrado no órgão regional do MTE?",
      },
      {
        id: "questao2",
        texto: "O SESMT está dimensionado para quadro atual de empregados?",
      },
    ],
    anexos: [
      "SESMT - Serviços Especializados em Engenharia de Segurança e Medicina do Trabalho",
    ],
  },
  {
    id: "nr05",
    titulo: "NR 05 - CIPA",
    obrigatoria: true,
    categoria: "obrigatorias",
    questoes: [
      {
        id: "questao1",
        texto: "A CONTRATADA possui CIPA registrada no órgão regional do MTE?",
      },
      {
        id: "questao2",
        texto: "A CIPA está dimensionada para quadro atual de empregados?",
      },
    ],
    anexos: ["CIPA - Comissão Interna de Prevenção de Acidentes"],
  },
  {
    id: "nr06",
    titulo: "NR 06 - EPI",
    obrigatoria: true,
    categoria: "obrigatorias",
    questoes: [
      {
        id: "questao1",
        texto:
          "A CONTRATADA fornece EPI adequado ao risco, em perfeito estado de conservação e funcionamento, com preenchimento de cautela e gratuitamente a seus empregados conforme disposições contidas na NR-6?",
      },
      {
        id: "questao2",
        texto:
          "A CONTRATADA orienta os empregados quanto à obrigatoriedade do uso, guarda, manutenção e substituição do EPI?",
      },
    ],
    anexos: [
      "CA EPI - Certificado de Aprovação de Equipamentos de Proteção Individual",
    ],
  },
  {
    id: "nr07",
    titulo: "NR 07 - PCMSO",
    obrigatoria: true,
    categoria: "obrigatorias",
    questoes: [
      {
        id: "questao1",
        texto: "A CONTRATADA elabora e implementa PCMSO?",
      },
      {
        id: "questao2",
        texto:
          "A CONTRATADA realiza os exames médicos previstos na NR 7? Controle de ASO.",
      },
      {
        id: "questao3",
        texto:
          "A CONTRATADA tem arquivo comprovando que realizou e custeou os exames previstos na NR 7?",
      },
    ],
    anexos: [
      "PCMSO - Programa de Controle Médico de Saúde Ocupacional",
      "ASO - Atestado de Saúde Ocupacional",
    ],
  },
  // NORMAS REGULAMENTADORAS OPCIONAIS
  {
    id: "nr10",
    titulo: "NR 10 - Instalações e Serviços em Eletricidade",
    obrigatoria: false,
    categoria: "opcionais",
    questoes: [
      {
        id: "questao1",
        texto:
          "As instalações elétricas estão de acordo com a norma regulamentadora?",
      },
      {
        id: "questao2",
        texto:
          "As instalações elétricas foram projetadas de acordo com as normas técnicas brasileiras e/ou internacionais vigentes?",
      },
      {
        id: "questao3",
        texto:
          "Os profissionais são habilitados para trabalhos com eletricidade?",
      },
    ],
    anexos: [
      "NR 10 - Projeto de Instalações Elétricas",
      "NR 10 - Certificação de Profissionais",
    ],
  },
  {
    id: "nr11",
    titulo:
      "NR 11 - Transporte, Movimentação, Armazenagem e Manuseio de Materiais",
    obrigatoria: false,
    categoria: "opcionais",
    questoes: [
      {
        id: "questao1",
        texto:
          "Os equipamentos utilizados na movimentação de materiais estão dentro das condições especiais de segurança?",
      },
      {
        id: "questao2",
        texto:
          "Os operadores de transporte possuem habilitação, sendo submetidos a treinamento específico?",
      },
    ],
    anexos: ["NR 11 - Certificado de Treinamento"],
  },
  {
    id: "nr12",
    titulo: "NR 12 - Máquinas e Equipamentos",
    obrigatoria: false,
    categoria: "opcionais",
    questoes: [
      {
        id: "questao1",
        texto:
          "A CONTRATADA possui um plano de Inspeção/Manutenção para as máquinas e equipamentos?",
      },
      {
        id: "questao2",
        texto:
          "Os dispositivos de acionamento, partida e parada estão em conformidade com a NR?",
      },
    ],
    anexos: [
      "NR 12 - Plano de Inspeção de Máquinas",
      "NR 12 - Evidência de Dispositivos de Segurança",
    ],
  },
  {
    id: "nr13",
    titulo: "NR 13 - Caldeiras e Vasos de Pressão",
    obrigatoria: false,
    categoria: "opcionais",
    questoes: [
      {
        id: "questao1",
        texto:
          "A CONTRATADA possui uma sistemática de calibração e manutenção dos Equipamentos Críticos e instrumentos contemplados nesta NR?",
      },
    ],
    anexos: [
      "NR 13 - Evidência de Sistemática de Caldeiras e Vasos de Pressão",
    ],
  },
  {
    id: "nr15",
    titulo: "NR 15 - Atividades e Operações Insalubres",
    obrigatoria: false,
    categoria: "opcionais",
    questoes: [
      {
        id: "questao1",
        texto:
          "A CONTRATADA atende aos requisitos estabelecidos na NR 15 e em seus anexos, no que se refere às atividades e operações insalubres?",
      },
    ],
    anexos: ["NR 15 - Laudo de Insalubridade"],
  },
  {
    id: "nr16",
    titulo: "NR 16 - Atividades e Operações Perigosas",
    obrigatoria: false,
    categoria: "opcionais",
    questoes: [
      {
        id: "questao1",
        texto:
          "A CONTRATADA atende aos requisitos estabelecidos na NR 16 e em seus anexos, no que se refere às atividades e operações perigosas?",
      },
    ],
    anexos: ["NR 16 - Laudo de Periculosidade"],
  },
  {
    id: "nr23",
    titulo: "NR 23 - Proteção Contra Incêndios",
    obrigatoria: false,
    categoria: "opcionais",
    questoes: [
      {
        id: "questao1",
        texto:
          "Os equipamentos de Combate a Incêndios encontram-se devidamente identificados e com a manutenção em dia?",
      },
      {
        id: "questao2",
        texto:
          "Os equipamentos de Combate a Incêndios encontram-se distribuídos e em quantidade de acordo com o que é estabelecido na NR? Favor inserir quantitativo no campo de comentários deste bloco",
      },
      {
        id: "questao3",
        texto: "O Extintor de incêndio possui a certificação do INMETRO?",
      },
    ],
    anexos: ["NR 23 - Laudo de Manutenção de Proteção Contra Incêndios"],
  },
  // OUTROS ITENS DE CONFORMIDADE
  {
    id: "licencasAmbientais",
    titulo: "Licenças Ambientais",
    obrigatoria: false,
    categoria: "outros",
    questoes: [
      {
        id: "questao1",
        texto:
          "A CONTRATADA possui licença de operação emitida pelo órgão ambiental competente?",
      },
    ],
    anexos: ["Licenças Ambientais - Licença de Operação"],
  },
  {
    id: "legislacaoMaritima",
    titulo: "Legislação Marítima",
    obrigatoria: false,
    categoria: "outros",
    questoes: [
      {
        id: "questao1",
        texto:
          "A CONTRATADA está em conformidade com os regulamentos do MODU CODE?",
      },
      {
        id: "questao2",
        texto:
          "A CONTRATADA está em conformidade com os regulamentos da NORMAN?",
      },
      {
        id: "questao3",
        texto:
          "A CONTRATADA está em conformidade com os regulamentos da MARPOL?",
      },
      {
        id: "questao4",
        texto: "A CONTRATADA está em conformidade com os regulamentos da STCW?",
      },
      {
        id: "questao5",
        texto:
          "A CONTRATADA está em conformidade com os regulamentos do ISM CODE?",
      },
      {
        id: "questao6",
        texto:
          "A CONTRATADA está em conformidade com os regulamentos do SOLAS?",
      },
    ],
    anexos: [],
  },
  {
    id: "treinamentosObrigatorios",
    titulo: "Treinamentos Obrigatórios",
    obrigatoria: false,
    categoria: "outros",
    questoes: [
      {
        id: "questao1",
        texto:
          "A CONTRATADA tem Programa Educativo contemplando a temática de Prevenção de Acidentes, Meio Ambiente e Doenças do Trabalho?",
      },
      {
        id: "questao2",
        texto:
          "Todos os empregados recebem treinamento admissional e periódico, visando executar suas funções com segurança?",
      },
      {
        id: "questao3",
        texto:
          "Nos treinamentos os empregados recebem cópias ou têm os procedimentos em local acessível, para que as operações sejam realizadas com segurança e ambientalmente corretas?",
      },
    ],
    anexos: [
      "Treinamentos - Certificado de Programa de Treinamento",
      "Treinamentos - Evidência de Treinamento",
    ],
  },
  {
    id: "gestaoSMS",
    titulo: "Gestão de SMS (Saúde, Meio Ambiente e Segurança)",
    obrigatoria: false,
    categoria: "outros",
    questoes: [
      {
        id: "questao1",
        texto:
          "A CONTRATADA tem procedimento para análise e registro de acidentes?",
      },
      {
        id: "questao2",
        texto: "A CONTRATADA realiza inspeções de SMS programadas?",
      },
      {
        id: "questao3",
        texto:
          "A CONTRATADA tem procedimento para minimização e disposição de resíduos?",
      },
      {
        id: "questao4",
        texto:
          "A CONTRATADA divulga as Metas e Programa de Segurança, Meio Ambiente e Saúde?",
      },
      {
        id: "questao5",
        texto:
          "A CONTRATADA tem um Programa das Atividades de Segurança Meio Ambiente e Saúde para o ano em curso?",
      },
    ],
    anexos: [
      "SMS - Procedimento de Acidentes",
      "SMS - Calendário de Inspeções",
      "SMS - Procedimento de Resíduos",
      "SMS - Metas e Objetivos",
      "SMS - Programa Anual",
    ],
  },
];

const ConformidadeLegalSection: React.FC<IConformidadeLegalSectionProps> = ({
  data,
  anexos,
  isReviewing,
  cnpj,
  empresa,
  id,
  sharePointService,
}) => {
  console.log("🎯 [ConformidadeLegal] Dados recebidos:", {
    data,
    anexos,
    cnpj,
    empresa,
    id,
  });

  // Função auxiliar para formatar tamanho do arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Função auxiliar para formatar data de upload
  const formatUploadDate = (dateString: string): string => {
    if (!dateString) return "Data não disponível";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "Data inválida";
    }
  };

  // Debug específico para NR01
  console.log(
    "🔬 [ConformidadeLegal] Estrutura completa de conformidadeLegal:",
    data
  );
  console.log(
    "🔬 [ConformidadeLegal] Chaves disponíveis:",
    Object.keys(data || {})
  );
  console.log("🔬 [ConformidadeLegal] NR01 específica:", data?.nr01);

  // Testando acesso direto
  if (data?.nr01) {
    console.log("✅ [ConformidadeLegal] NR01 encontrada!");
    console.log("   - Aplicável:", data.nr01.aplicavel);
    console.log("   - Questões:", data.nr01.questoes);
    console.log("   - Questão1:", data.nr01.questoes?.questao1);
    console.log("   - Questão2:", data.nr01.questoes?.questao2);
    console.log("   - Comentários:", data.nr01.comentarios);
  } else {
    console.log("❌ [ConformidadeLegal] NR01 NÃO encontrada!");
  }

  const [expandedSections, setExpandedSections] = React.useState<string[]>([]);

  const toggleSection = (sectionId: string): void => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const getSectionData = (sectionId: string): unknown => {
    const result = data[sectionId as keyof IConformidadeLegal];
    console.log(`🗂️ [ConformidadeLegal] getSectionData(${sectionId}):`, result);
    return result;
  };

  const getQuestaoResposta = (
    sectionId: string,
    questaoId: string
  ): "SIM" | "NAO" | "NA" | undefined => {
    const sectionData = getSectionData(sectionId) as ISectionFormData;
    console.log(
      `🔍 [ConformidadeLegal] Buscando resposta para ${sectionId}.${questaoId}:`
    );
    console.log(`   - Dados da seção:`, sectionData);

    // Acessar diretamente a questão (questao1, questao2, etc.)
    const questaoData = sectionData?.[questaoId as keyof ISectionFormData];
    console.log(`   - Dados da questão (${questaoId}):`, questaoData);

    // Verifica se questaoData é um objeto com propriedade resposta
    const resposta =
      questaoData &&
      typeof questaoData === "object" &&
      "resposta" in questaoData
        ? (questaoData as { resposta?: "SIM" | "NAO" | "NA" }).resposta
        : undefined;

    console.log(
      `📝 [ConformidadeLegal] Resposta encontrada para ${sectionId}.${questaoId}:`,
      resposta
    );
    return resposta;
  };

  const getSectionComentarios = (sectionId: string): string | undefined => {
    const sectionData = getSectionData(sectionId) as ISectionFormData;
    const comentarios = sectionData?.comentarios;
    console.log(
      `💬 [ConformidadeLegal] Comentários para ${sectionId}:`,
      comentarios
    );
    return comentarios;
  };

  const getSectionStatus = (
    sectionId: string
  ): "completo" | "incompleto" | "nao_aplicavel" => {
    const sectionData = getSectionData(sectionId) as ISectionFormData;

    // Se a seção não é aplicável, retorna N/A
    if (!sectionData || !sectionData.aplicavel) return "nao_aplicavel";

    const section = conformidadeSections.find((s) => s.id === sectionId);
    if (!section) return "nao_aplicavel";

    // Verifica se todas as questões foram respondidas
    const todasRespondidas = section.questoes.every((questao) => {
      const resposta = getQuestaoResposta(sectionId, questao.id);
      return resposta === "SIM" || resposta === "NAO" || resposta === "NA";
    });

    return todasRespondidas ? "completo" : "incompleto";
  };

  // Mapeamento das chaves do JSON para os nomes reais das pastas SharePoint
  const getSharePointFolderName = (anexoKey: string): string => {
    const mapeamentoPastas: Record<string, string> = {
      // NR04 - SESMT
      "sesmt": "SESMT",

      // NR05 - CIPA  
      "cipa": "CIPA",

      // NR06 - EPI
      "caEPI": "EPI",

      // NR07 - PCMSO + ASO
      "pcmso": "PCMSO",
      "aso": "ASO",

      // NR10 - CERTIFICADO_PROFISSIONAIS + PROJETO_INSTALACOES
      "NR10_CERTIFICADO_PROFISSIONAIS": "NR10_CERTIFICADO_PROFISSIONAIS",
      "NR10_PROJETO_INSTALACOES": "NR10_PROJETO_INSTALACOES",

      // NR11 - CERTIFICADO_TREINAMENTO
      "NR11_CERTIFICADO_TREINAMENTO": "NR11_CERTIFICADO_TREINAMENTO",

      // NR12 - EVIDENCIA_DISPOSITIVO + PLANO_INSPECAO
      "NR12_EVIDENCIA_DISPOSITIVO": "NR12_EVIDENCIA_DISPOSITIVO",
      "NR12_PLANO_INSPECAO": "NR12_PLANO_INSPECAO",

      // NR13 - EVIDENCIA_SISTEMATICA
      "NR13_EVIDENCIA_SISTEMATICA": "NR13_EVIDENCIA_SISTEMATICA",

      // NR15 - LAUDO_INSALUBRIDADE
      "NR15_LAUDO_INSALUBRIDADE": "NR15_LAUDO_INSALUBRIDADE",

      // NR16 - LAUDO_PERICULOSIDADE
      "NR16_LAUDO_PERICULOSIDADE": "NR16_LAUDO_PERICULOSIDADE",

      // NR23 - LAUDO_MANUTENCAO
      "NR23_LAUDO_MANUTENCAO": "NR23_LAUDO_MANUTENCAO",

      // TREINAMENTOS OBRIGATÓRIOS
      "EVIDENCIA_TREINAMENTO": "EVIDENCIA_TREINAMENTO",
      "CERTIFICADO_PROGRAMA_TREINAMENTO": "CERTIFICADO_PROGRAMA_TREINAMENTO",

      // GESTÃO DE SMS
      "SMS_CALENDARIO_INSPECOES": "SMS_CALENDARIO_INSPECOES",
      "SMS_METAS_OBJETIVOS": "SMS_METAS_OBJETIVOS",
      "SMS_PROCEDIMENTO_ACIDENTES": "SMS_PROCEDIMENTO_ACIDENTES",
      "SMS_PROGRAMA_ANUAL": "SMS_PROGRAMA_ANUAL",
      "SMS_PROCEDIMENTO_RESIDUOS": "SMS_PROCEDIMENTO_RESIDUOS",

      // LICENÇAS AMBIENTAIS
      "LICENCA_OPERACAO": "LICENCA_OPERACAO",
    };

    return mapeamentoPastas[anexoKey] || anexoKey;
  };

  // Função para processar ações nos anexos (visualizar/download) - NOVA VERSÃO
  const handleAnexoAction = async (
    anexo: IFileMetadata,
    action: "view" | "download",
    anexoKey: string
  ): Promise<void> => {
    try {
      let attachmentData = anexo;

      // Se não tem URL definida e temos o SharePointService, tentar obter a URL
      if (
        (!anexo.url || anexo.url.trim() === "") &&
        sharePointService &&
        anexo.id &&
        id &&
        cnpj &&
        empresa
      ) {
        console.log(
          `🔗 [ConformidadeLegal] Buscando URL para anexo ID: ${anexo.id}`
        );

        const sharePointFolderName = getSharePointFolderName(anexoKey);
        console.log(
          `📁 [ConformidadeLegal] Mapeamento de pasta:`,
          {
            anexoKey,
            sharePointFolderName,
            anexoFileName: anexo.fileName || anexo.originalName
          }
        );

        const formData = {
          id: parseInt(id), // Converter string para number
          cnpj: cnpj,
          empresa: empresa,
          categoria: sharePointFolderName, // Usar o nome correto da pasta SharePoint
          fileName: anexo.fileName || anexo.originalName,
        };

        const attachmentInfo = await sharePointService.getAttachmentById(
          anexo.id,
          formData
        );
        if (attachmentInfo) {
          attachmentData = attachmentInfo;
        }
      }

      if (attachmentData.url && attachmentData.url.trim() !== "") {
        window.open(attachmentData.url, "_blank");
      } else {
        // Mostrar informações do anexo para debug
        const actionText = action === "view" ? "visualizar" : "baixar";
        alert(
          `Não foi possível ${actionText} o arquivo.\n\nArquivo: ${
            anexo.originalName || anexo.fileName
          }\nID: ${anexo.id}\nTamanho: ${formatFileSize(
            anexo.fileSize || 0
          )}\n\nVerifique se o arquivo existe no SharePoint.`
        );
      }
    } catch (error) {
      console.error(
        "❌ [ConformidadeLegal] Erro ao processar ação do anexo:",
        error
      );
      alert("Erro ao processar o arquivo. Tente novamente.");
    }
  };

  // Função antiga para compatibilidade - renderizar anexo por nome
  const handleAnexoActionAntigo = async (anexoNome: string): Promise<void> => {
    try {
      console.log(
        "🔗 [ConformidadeLegal] Tentando visualizar anexo:",
        anexoNome
      );

      // Buscar o anexo correspondente nos dados
      const anexoKey = anexoNome
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9]/g, "");

      console.log("🔗 [ConformidadeLegal] Chave do anexo:", anexoKey);
      console.log("🔗 [ConformidadeLegal] Anexos disponíveis:", anexos);

      const anexoData = anexos[anexoKey as keyof IAnexos] as IFileMetadata[];
      const arquivo = anexoData?.[0];

      if (arquivo && arquivo.url) {
        console.log("🔗 [ConformidadeLegal] Abrindo arquivo:", arquivo.url);
        window.open(arquivo.url, "_blank");
      } else {
        console.warn(
          "🔗 [ConformidadeLegal] Arquivo não encontrado ou sem URL:",
          arquivo
        );
        alert("Arquivo não encontrado ou indisponível para visualização.");
      }
    } catch (error) {
      console.error("Erro ao abrir anexo:", error);
      alert("Erro ao tentar visualizar o anexo.");
    }
  };

  // Mapeamento de nomes de anexos para chaves do objeto anexos (nomes das pastas SharePoint)
  const getAnexoKey = (anexoNome: string): string => {
    const mapeamento: Record<string, string> = {
      // NR01 - SEM ANEXO

      // NR04 - SESMT
      "SESMT - Dimensionamento": "sesmt",
      "SESMT - Atas de Reunião": "sesmt",
      "SESMT - Serviços Especializados em Engenharia de Segurança e Medicina do Trabalho": "sesmt",

      // NR05 - CIPA
      "CIPA - Comissão Interna de Prevenção de Acidentes": "cipa",

      // NR06 - EPI
      "CA EPI - Certificado de Aprovação de Equipamentos de Proteção Individual":
        "caEPI",
      "EPI - Certificado de Aprovação": "caEPI",

      // NR07 - PCMSO + ASO
      "PCMSO - Programa de Controle Médico de Saúde Ocupacional": "pcmso",
      "ASO - Atestado de Saúde Ocupacional": "aso",

      // NR10 - CERTIFICADO_PROFISSIONAIS + PROJETO_INSTALACOES
      "NR 10 - Certificado de Profissionais": "NR10_CERTIFICADO_PROFISSIONAIS",
      "NR 10 - Projeto de Instalações": "NR10_PROJETO_INSTALACOES",

      // NR11 - CERTIFICADO_TREINAMENTO
      "NR 11 - Certificado de Treinamento": "NR11_CERTIFICADO_TREINAMENTO",

      // NR12 - EVIDENCIA_DISPOSITIVO + PLANO_INSPECAO
      "NR 12 - Certificado de Máquinas": "NR12_EVIDENCIA_DISPOSITIVO",
      "NR 12 - Evidência de Dispositivo": "NR12_EVIDENCIA_DISPOSITIVO",
      "NR 12 - Plano de Inspeção": "NR12_PLANO_INSPECAO",

      // NR13 - EVIDENCIA_SISTEMATICA
      "NR 13 - Certificado de Caldeiras": "NR13_EVIDENCIA_SISTEMATICA",
      "NR 13 - Evidência Sistemática": "NR13_EVIDENCIA_SISTEMATICA",

      // NR15 - LAUDO_INSALUBRIDADE
      "NR 15 - Laudo de Insalubridade": "NR15_LAUDO_INSALUBRIDADE",

      // NR16 - LAUDO_PERICULOSIDADE
      "NR 16 - Laudo de Periculosidade": "NR16_LAUDO_PERICULOSIDADE",

      // NR23 - LAUDO_MANUTENCAO
      "NR 23 - Laudo de Manutenção de Proteção Contra Incêndios":
        "NR23_LAUDO_MANUTENCAO",

      // TREINAMENTOS OBRIGATÓRIOS - EVIDENCIA_TREINAMENTO + CERTIFICADO_PROGRAMA_TREINAMENTO
      "Evidência de Treinamento": "EVIDENCIA_TREINAMENTO",
      "Certificado de Programa de Treinamento":
        "CERTIFICADO_PROGRAMA_TREINAMENTO",

      // GESTÃO DE SMS - 5 pastas
      "SMS - Calendário de Inspeções": "SMS_CALENDARIO_INSPECOES",
      "SMS - Metas e Objetivos": "SMS_METAS_OBJETIVOS",
      "SMS - Procedimento de Acidentes": "SMS_PROCEDIMENTO_ACIDENTES",
      "SMS - Programa Anual": "SMS_PROGRAMA_ANUAL",
      "SMS - Procedimento de Resíduos": "SMS_PROCEDIMENTO_RESIDUOS",

      // LICENÇAS AMBIENTAIS - LICENCA_OPERACAO
      "Licenças Ambientais - Licença de Operação": "LICENCA_OPERACAO",
      "Licenças Ambientais - Licença de Instalação": "LICENCA_OPERACAO",

      // LEGISLAÇÃO MARÍTIMA - SEM ANEXO (não possui anexos)
    };

    return (
      mapeamento[anexoNome] ||
      anexoNome
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9]/g, "")
    );
  };

  const renderAnexo = (anexoNome: string): React.ReactElement => {
    // Buscar o anexo correspondente nos dados usando o mapeamento
    const anexoKey = getAnexoKey(anexoNome);
    const anexoData = anexos[anexoKey as keyof IAnexos] as IFileMetadata[];
    const arquivo = anexoData?.[0]; // Pegar o primeiro arquivo se existir

    console.log("📎 [ConformidadeLegal] Renderizando anexo:", {
      anexoNome,
      anexoKey,
      anexoData,
      arquivo,
      todasChavesAnexos: Object.keys(anexos || {}),
    });

    // Se existem arquivos anexados, renderizar com dados reais
    if (anexoData && anexoData.length > 0) {
      return (
        <div key={anexoNome} className={styles.anexoItem}>
          <div className={styles.anexoDetails}>
            <Icon iconName="Attach" className={styles.anexoIcon} />
            <div>
              <Text
                variant="small"
                style={{ fontWeight: 600, color: "#0078d4" }}
              >
                {anexoNome}
              </Text>
              {anexoData.map((anexo, index) => (
                <div key={anexo.id || index} style={{ marginTop: "4px" }}>
                  <Text variant="xSmall" style={{ color: "#107c10" }}>
                    📄 {anexo.originalName || anexo.fileName || "Arquivo"}
                  </Text>
                  <Text
                    variant="xSmall"
                    style={{ color: "#666", display: "block" }}
                  >
                    Tamanho: {formatFileSize(anexo.fileSize || 0)} | Upload:{" "}
                    {formatUploadDate(anexo.uploadDate || "")}
                  </Text>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.anexoActions}>
            <DefaultButton
              iconProps={{ iconName: "View" }}
              text="Visualizar"
              onClick={() => handleAnexoAction(anexoData[0], "view", anexoKey)}
              title="Clique para visualizar o arquivo"
            />
          </div>
        </div>
      );
    }

    // Caso contrário, renderizar anexo sem arquivo anexado
    return (
      <div key={anexoNome} className={styles.anexoItem}>
        <div className={styles.anexoDetails}>
          <Icon iconName="Attach" className={styles.anexoIcon} />
          <div>
            <Text variant="small">{anexoNome}</Text>
            <Text variant="xSmall" style={{ color: "#d13438" }}>
              Arquivo não anexado (chave: {anexoKey})
            </Text>
          </div>
        </div>
        <div className={styles.anexoActions}>
          <DefaultButton
            iconProps={{ iconName: "View" }}
            text="Visualizar"
            onClick={() => handleAnexoActionAntigo(anexoNome)}
            disabled={true}
            title="Arquivo não disponível"
          />
        </div>
      </div>
    );
  };

  const renderQuestao = (
    sectionId: string,
    questao: IQuestao
  ): React.ReactElement => {
    const resposta = getQuestaoResposta(sectionId, questao.id);

    return (
      <div key={questao.id} className={styles.field}>
        <div>
          <Text variant="small" style={{ fontWeight: 600, color: "#0078d4" }}>
            {questao.id.charAt(0).toUpperCase() + questao.id.slice(1)}
          </Text>
        </div>
        <Text variant="small" style={{ marginBottom: "8px" }}>
          {questao.texto}
        </Text>

        {/* Sempre mostrar a resposta ou indicar que não foi respondida */}
        <div
          className={`${styles.toggleValue} ${
            resposta === "SIM"
              ? styles.positive
              : resposta === "NAO"
              ? styles.negative
              : resposta === "NA"
              ? styles.statusNotApplicable
              : styles.statusIncomplete // Para quando não há resposta
          }`}
          style={{ marginTop: "8px" }}
        >
          <Icon
            iconName={
              resposta === "SIM"
                ? "CheckMark"
                : resposta === "NAO"
                ? "Cancel"
                : resposta === "NA"
                ? "Remove"
                : "Warning" // Para quando não há resposta
            }
          />
          <Text variant="small">Resposta: {resposta || "Não respondida"}</Text>
        </div>
      </div>
    );
  };

  const renderStatusIcon = (
    status: "completo" | "incompleto" | "nao_aplicavel"
  ): React.ReactElement => {
    switch (status) {
      case "completo":
        return <Icon iconName="CheckMark" className={styles.statusComplete} />;
      case "incompleto":
        return <Icon iconName="Warning" className={styles.statusIncomplete} />;
      default:
        return (
          <Icon iconName="Cancel" className={styles.statusNotApplicable} />
        );
    }
  };

  const renderSection = (section: ISectionData): React.ReactElement => {
    const isExpanded = expandedSections.includes(section.id);
    const status = getSectionStatus(section.id);

    return (
      <div
        key={section.id}
        className={`${styles.nrCard} ${
          section.obrigatoria ? styles.mandatory : styles.optional
        }`}
      >
        <div
          className={styles.nrHeader}
          onClick={() => toggleSection(section.id)}
        >
          <div className={styles.nrTitle}>
            <div>
              <Text variant="medium" className={styles.nrName}>
                {section.titulo}
              </Text>
              {section.obrigatoria && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    backgroundColor: "#ff8c00",
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "10px",
                    marginLeft: "8px",
                  }}
                >
                  <Icon iconName="Warning" style={{ marginRight: "4px" }} />
                  <Text variant="xSmall">OBRIGATÓRIO</Text>
                </div>
              )}
            </div>
            <div className={styles.nrStatus}>
              {renderStatusIcon(status)}
              <Text variant="small" className={styles.statusLabel}>
                {status === "completo"
                  ? "SELECIONADO"
                  : status === "incompleto"
                  ? "PENDENTE"
                  : "N/A"}
              </Text>
            </div>
          </div>
          <Icon
            iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
            style={{ cursor: "pointer" }}
          />
        </div>

        {isExpanded && (
          <div className={styles.nrContent}>
            {/* Questões */}
            <Stack tokens={{ childrenGap: 12 }}>
              {section.questoes.map((questao) =>
                renderQuestao(section.id, questao)
              )}
            </Stack>

            {/* Comentários */}
            {getSectionComentarios(section.id) && (
              <div className={styles.field} style={{ marginTop: "16px" }}>
                <Label>Comentários:</Label>
                <Text variant="small" className={styles.observacoes}>
                  {getSectionComentarios(section.id)}
                </Text>
              </div>
            )}

            {/* Anexos */}
            {section.anexos.length > 0 && (
              <div className={styles.field} style={{ marginTop: "16px" }}>
                <Label>Anexos Relacionados:</Label>
                <Stack tokens={{ childrenGap: 8 }}>
                  {section.anexos.map((anexo) => renderAnexo(anexo))}
                </Stack>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderCategorySection = (
    categoria: "obrigatorias" | "opcionais" | "outros",
    titulo: string
  ): React.ReactElement => {
    const sectionsInCategory = conformidadeSections.filter(
      (s) => s.categoria === categoria
    );

    return (
      <div style={{ marginBottom: "32px" }}>
        <div
          style={{
            backgroundColor: "#6c757d",
            color: "white",
            padding: "12px 16px",
            borderRadius: "4px",
            marginBottom: "16px",
          }}
        >
          <Text variant="large" style={{ color: "white", fontWeight: 600 }}>
            {titulo}
          </Text>
        </div>
        <div className={styles.nrGrid}>
          {sectionsInCategory.map((section) => renderSection(section))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {isReviewing && (
        <MessageBar
          messageBarType={MessageBarType.info}
          className={styles.reviewAlert}
        >
          ⚖️ <strong>Modo Revisão:</strong> Verifique o cumprimento das Normas
          Regulamentadoras e outros itens de conformidade aplicáveis.
        </MessageBar>
      )}

      <Stack tokens={{ childrenGap: 24 }}>
        {renderCategorySection(
          "obrigatorias",
          "📋 NORMAS REGULAMENTADORAS OBRIGATÓRIAS"
        )}
        {renderCategorySection(
          "opcionais",
          "📄 NORMAS REGULAMENTADORAS OPCIONAIS"
        )}
        {renderCategorySection("outros", "📝 OUTROS ITENS DE CONFORMIDADE")}
      </Stack>
    </div>
  );
};

export default ConformidadeLegalSection;
