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
import styles from "./ConformidadeLegalSection.module.scss";

export interface IConformidadeLegalSectionProps {
  data: IConformidadeLegal;
  anexos: IAnexos;
  isReviewing: boolean;
  cnpj: string;
  empresa: string;
  id: string;
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
}) => {
  const [expandedSections, setExpandedSections] = React.useState<string[]>([]);

  const toggleSection = (sectionId: string): void => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const getSectionData = (sectionId: string): unknown => {
    return data[sectionId as keyof IConformidadeLegal];
  };

  const getQuestaoResposta = (
    sectionId: string,
    questaoId: string
  ): "SIM" | "NAO" | undefined => {
    const sectionData = getSectionData(sectionId) as any;
    return sectionData?.questoes?.[questaoId]?.resposta;
  };

  const getSectionStatus = (
    sectionId: string
  ): "completo" | "incompleto" | "nao_aplicavel" => {
    const sectionData = getSectionData(sectionId) as any;
    if (!sectionData || !sectionData.aplicavel) return "nao_aplicavel";

    const section = conformidadeSections.find((s) => s.id === sectionId);
    if (!section) return "nao_aplicavel";

    const todasRespondidas = section.questoes.every(
      (questao) => getQuestaoResposta(sectionId, questao.id) !== undefined
    );

    return todasRespondidas ? "completo" : "incompleto";
  };

  const handleAnexoAction = async (anexoNome: string): Promise<void> => {
    try {
      // TODO: Implementar visualização do anexo
      console.log("Visualizar anexo:", anexoNome);
    } catch (error) {
      console.error("Erro ao abrir anexo:", error);
    }
  };

  const renderAnexo = (anexoNome: string): React.ReactElement => {
    // Buscar o anexo correspondente nos dados
    const anexoKey = anexoNome
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");

    const anexoData = anexos[anexoKey as keyof IAnexos] as IFileMetadata[];
    const arquivo = anexoData?.[0]; // Pegar o primeiro arquivo se existir

    return (
      <div key={anexoNome} className={styles.anexoItem}>
        <div className={styles.anexoDetails}>
          <Icon iconName="Attach" className={styles.anexoIcon} />
          <div>
            <Text variant="small">{anexoNome}</Text>
            {arquivo && (
              <Text variant="xSmall">
                {arquivo.fileName} • {(arquivo.fileSize / 1024).toFixed(1)} KB •{" "}
                {arquivo.uploadDate}
              </Text>
            )}
          </div>
        </div>
        <div className={styles.anexoActions}>
          <DefaultButton
            iconProps={{ iconName: "View" }}
            text="Visualizar"
            onClick={() => handleAnexoAction(anexoNome)}
            disabled={!arquivo}
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
        {resposta && (
          <div
            className={`${styles.toggleValue} ${
              resposta === "SIM" ? styles.positive : styles.negative
            }`}
          >
            <Icon iconName={resposta === "SIM" ? "CheckMark" : "Cancel"} />
            <Text variant="small">Resposta: {resposta}</Text>
          </div>
        )}
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
    const sectionData = getSectionData(section.id);

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
            {(sectionData as any)?.comentarios && (
              <div className={styles.field} style={{ marginTop: "16px" }}>
                <Label>Comentários:</Label>
                <Text variant="small" className={styles.observacoes}>
                  {(sectionData as any).comentarios}
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
