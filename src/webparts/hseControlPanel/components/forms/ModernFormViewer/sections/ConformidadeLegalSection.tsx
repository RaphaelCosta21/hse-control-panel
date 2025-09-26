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
      "NR 10 - Certificado de Profissionais",
      "NR 10 - Projeto de Instalações Elétricas",
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
    id: "treinamentos",
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
      prev.indexOf(sectionId) !== -1
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

    let section: ISectionData | undefined;
    for (let i = 0; i < conformidadeSections.length; i++) {
      if (conformidadeSections[i].id === sectionId) {
        section = conformidadeSections[i];
        break;
      }
    }
    if (!section) return "nao_aplicavel";

    // Verifica se todas as questões foram respondidas
    let todasRespondidas = true;
    for (let i = 0; i < section.questoes.length; i++) {
      const questao = section.questoes[i];
      const resposta = getQuestaoResposta(sectionId, questao.id);
      if (resposta !== "SIM" && resposta !== "NAO" && resposta !== "NA") {
        todasRespondidas = false;
        break;
      }
    }

    return todasRespondidas ? "completo" : "incompleto";
  };

  // Função simplificada para anexos com URL completa no JSON
  const handleAnexoActionSimplificado = (anexo: IFileMetadata): void => {
    if (anexo.url && anexo.url.trim() !== "") {
      console.log("🔗 [ConformidadeLegal] Abrindo anexo com URL:", anexo.url);
      window.open(anexo.url, "_blank");
    } else {
      console.warn("⚠️ [ConformidadeLegal] Anexo sem URL:", anexo);
      alert(
        `Não foi possível visualizar o arquivo.\n\nArquivo: ${
          anexo.originalName || anexo.fileName
        }\nMotivo: URL não encontrada no JSON`
      );
    }
  };

  // Função para processar ações nos anexos (visualizar/download) - VERSÃO COMPLEXA (DESCONTINUADA)
  // Mapeamento de nomes de anexos para chaves do objeto anexos (nomes das pastas SharePoint)
  const getAnexoKey = (anexoNome: string): string => {
    const mapeamento: Record<string, string> = {
      // NR01 - SEM ANEXO

      // NR04 - SESMT
      "SESMT - Dimensionamento": "sesmt",
      "SESMT - Atas de Reunião": "sesmt",
      "SESMT - Serviços Especializados em Engenharia de Segurança e Medicina do Trabalho":
        "sesmt",

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
      "NR 10 - Certificado de Profissionais": "nr10CertificacaoProfissionais",
      "NR 10 - Projeto de Instalações Elétricas": "nr10ProjetoInstalacoes",

      // NR11 - CERTIFICADO_TREINAMENTO
      "NR 11 - Certificado de Treinamento": "nr11CertificadoTreinamento",

      // NR12 - EVIDENCIA_DISPOSITIVO + PLANO_INSPECAO
      "NR 12 - Certificado de Máquinas": "nr12EvidenciaDispositivo",
      "NR 12 - Evidência de Dispositivo": "nr12EvidenciaDispositivo",
      "NR 12 - Evidência de Dispositivos de Segurança":
        "nr12EvidenciaDispositivo",
      "NR 12 - Plano de Inspeção": "nr12PlanoInspecao",
      "NR 12 - Plano de Inspeção de Máquinas": "nr12PlanoInspecao",

      // NR13 - EVIDENCIA_SISTEMATICA
      "NR 13 - Certificado de Caldeiras": "nr13EvidenciaSistematica",
      "NR 13 - Evidência Sistemática": "nr13EvidenciaSistematica",
      "NR 13 - Evidência de Sistemática de Caldeiras e Vasos de Pressão":
        "nr13EvidenciaSistematica",

      // NR15 - LAUDO_INSALUBRIDADE
      "NR 15 - Laudo de Insalubridade": "nr15LaudoInsalubridade",

      // NR16 - LAUDO_PERICULOSIDADE
      "NR 16 - Laudo de Periculosidade": "nr16LaudoPericulosidade",

      // NR23 - LAUDO_MANUTENCAO
      "NR 23 - Laudo de Manutenção de Proteção Contra Incêndios":
        "nr23LaudoManutencao",

      // TREINAMENTOS OBRIGATÓRIOS - EVIDENCIA_TREINAMENTO + CERTIFICADO_PROGRAMA_TREINAMENTO
      "Treinamentos - Evidência de Treinamento": "evidenciaTreinamento",
      "Treinamentos - Certificado de Programa de Treinamento":
        "certificadoProgramaTreinamento",

      // GESTÃO DE SMS - 5 pastas
      "SMS - Calendário de Inspeções": "smsCalendarioInspecoes",
      "SMS - Metas e Objetivos": "smsMetasObjetivos",
      "SMS - Procedimento de Acidentes": "smsProcedimentoAcidentes",
      "SMS - Programa Anual": "smsProgramaAnual",
      "SMS - Procedimento de Resíduos": "smsProcedimentoResiduos",

      // LICENÇAS AMBIENTAIS - LICENCA_OPERACAO
      "Licenças Ambientais - Licença de Operação": "licencaOperacao",
      "Licenças Ambientais - Licença de Instalação": "licencaOperacao",

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
      tipoAnexoData: typeof anexoData,
      anexoDataLength: anexoData?.length,
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
              onClick={() => handleAnexoActionSimplificado(anexoData[0])}
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
          </div>
          <div>
            <Text variant="xSmall" style={{ color: "#d13438" }}>
              Arquivo não anexado (chave: {anexoKey})
            </Text>
          </div>
        </div>
        <div className={styles.anexoActions}>
          <DefaultButton
            iconProps={{ iconName: "View" }}
            text="Visualizar"
            onClick={() => {}} // Função vazia para anexos não disponíveis
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

  // Função para verificar se uma seção foi selecionada (aplicável)
  const isSectionSelected = (sectionId: string): boolean => {
    const sectionData = getSectionData(sectionId) as ISectionFormData;
    return !!(sectionData && sectionData.aplicavel);
  };

  const renderSection = (section: ISectionData): React.ReactElement => {
    const isExpanded = expandedSections.indexOf(section.id) !== -1;
    const status = getSectionStatus(section.id);
    const isSelected = isSectionSelected(section.id);

    return (
      <div
        key={section.id}
        className={`${styles.nrCard} ${
          isSelected ? styles.selected : styles.notSelected
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
    const sectionsInCategory: ISectionData[] = [];
    for (let i = 0; i < conformidadeSections.length; i++) {
      if (conformidadeSections[i].categoria === categoria) {
        sectionsInCategory.push(conformidadeSections[i]);
      }
    }

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
