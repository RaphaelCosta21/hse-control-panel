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
  IServicosEspeciais,
  IAnexos,
  IFileMetadata,
} from "../../../../types/IHSEFormData";
import { SharePointService } from "../../../../services/SharePointService";
import styles from "./ServicosEspeciaisSection.module.scss";

export interface IServicosEspeciaisSectionProps {
  data: IServicosEspeciais;
  anexos: IAnexos;
  isReviewing: boolean;
  cnpj: string;
  empresa: string;
  id: string;
  sharePointService?: SharePointService;
}

interface IAnexoInfo {
  id: string;
  nome: string;
  descricao: string;
}

interface ISectionData {
  id: string;
  titulo: string;
  aplicavel: boolean;
  anexos: IAnexoInfo[];
}

// Dados das seções baseados nas imagens fornecidas
const servicosEspeciaisSections: ISectionData[] = [
  {
    id: "fornecedorEmbarcacoes",
    titulo: "Fornecedor de Embarcações",
    aplicavel: false, // Será definido dinamicamente
    anexos: [
      {
        id: "iopp",
        nome: "IOPP",
        descricao: "Certificado Internacional de Prevenção à Poluição por Óleo",
      },
      {
        id: "registroArmador",
        nome: "Registro de Armador",
        descricao: "Registro do armador da embarcação.",
      },
      {
        id: "propriedadeMaritima",
        nome: "Propriedade Marítima",
        descricao: "Documento de propriedade da embarcação.",
      },
      {
        id: "arqueacao",
        nome: "Arqueação",
        descricao: "Certificado de arqueação da embarcação.",
      },
      {
        id: "segurancaNavegacao",
        nome: "Segurança de Navegação",
        descricao: "Certificado de segurança de navegação.",
      },
      {
        id: "classificacaoCasco",
        nome: "Classificação de Casco",
        descricao: "Certificado de classificação do casco da embarcação.",
      },
      {
        id: "classificacaoMaquinas",
        nome: "Classificação de Máquinas",
        descricao: "Certificado de classificação das máquinas da embarcação.",
      },
      {
        id: "bordaLivre",
        nome: "Borda Livre",
        descricao: "Certificado de borda livre da embarcação.",
      },
      {
        id: "seguroDepem",
        nome: "Seguro DEPEM",
        descricao:
          "Seguro obrigatório de danos pessoais causados por embarcações.",
      },
      {
        id: "autorizacaoAntaq",
        nome: "Autorização ANTAQ",
        descricao:
          "Autorização da Agência Nacional de Transportes Aquaviários.",
      },
      {
        id: "tripulacaoSeguranca",
        nome: "Tripulação de Segurança",
        descricao: "Documento de tripulação mínima de segurança.",
      },
      {
        id: "agulhaMagnetica",
        nome: "Agulha Magnética",
        descricao: "Certificado de agulha magnética da embarcação.",
      },
      {
        id: "balsaInflavel",
        nome: "Balsa Inflável",
        descricao: "Certificado de balsa inflável de salvatagem.",
      },
      {
        id: "licencaRadio",
        nome: "Licença de Rádio",
        descricao: "Licença de estação de rádio da embarcação.",
      },
    ],
  },
  {
    id: "fornecedorIcamento",
    titulo: "Fornecedor de Içamento",
    aplicavel: false, // Será definido dinamicamente
    anexos: [
      {
        id: "testeCarga",
        nome: "Teste de Carga",
        descricao:
          "Certificado de teste de carga para equipamentos de içamento.",
      },
      {
        id: "registroCREA",
        nome: "Registro CREA (Engenheiro)",
        descricao: "Registro de engenheiro responsável no CREA.",
      },
      {
        id: "art",
        nome: "ART (Anotação de Responsabilidade Técnica)",
        descricao: "Anotação de Responsabilidade Técnica",
      },
      {
        id: "planoManutencao",
        nome: "Plano de Manutenção",
        descricao: "Plano de manutenção dos equipamentos de içamento.",
      },
      {
        id: "monitoramentoFumaca",
        nome: "Monitoramento de Fumaça",
        descricao: "Evidência de monitoramento de emissão de fumaça preta.",
      },
      {
        id: "certificacaoEquipamentos",
        nome: "Certificação de Equipamentos",
        descricao: "Certificado de conformidade dos equipamentos de içamento.",
      },
    ],
  },
];

const ServicosEspeciaisSection: React.FC<IServicosEspeciaisSectionProps> = ({
  data,
  anexos,
  isReviewing,
  cnpj,
  empresa,
  id,
  sharePointService,
}) => {
  console.log("🎯 [ServicosEspeciais] Dados recebidos:", {
    data,
    anexos,
    cnpj,
    empresa,
    id,
  });

  const [expandedSections, setExpandedSections] = React.useState<string[]>([]);

  const toggleSection = (sectionId: string): void => {
    setExpandedSections((prev) =>
      prev.indexOf(sectionId) !== -1
        ? prev.filter((sid) => sid !== sectionId)
        : [...prev, sectionId]
    );
  };

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

  // Verificar se uma seção é aplicável
  const isSectionApplicable = (sectionId: string): boolean => {
    console.log("🔍 [ServicosEspeciais] Verificando seção:", {
      sectionId,
      data,
      valorNoData: data?.[sectionId as keyof IServicosEspeciais],
    });

    if (!data) return false;

    // Mapear IDs para as propriedades corretas no JSON
    const propertyMap: { [key: string]: string } = {
      fornecedorEmbarcacoes: "fornecedorEmbarcacoes",
      fornecedorIcamento: "fornecedorIcamento",
    };

    const propertyName = propertyMap[sectionId] || sectionId;
    const value = data[propertyName as keyof IServicosEspeciais];

    console.log("🔍 [ServicosEspeciais] Verificando valor:", {
      sectionId,
      propertyName,
      value,
      isTrue: value === true,
    });

    return value === true;
  };

  // Verificar se uma seção foi selecionada (aplicável)
  const isSectionSelected = (sectionId: string): boolean => {
    return isSectionApplicable(sectionId);
  };

  // Mapeamento de anexos para chaves do objeto anexos
  const getAnexoKey = (anexoId: string): string => {
    // As chaves já estão no formato correto conforme a interface IAnexos
    return anexoId;
  };

  const handleAnexoAction = (anexo: IFileMetadata): void => {
    if (anexo.url && anexo.url.trim() !== "") {
      console.log("🔗 [ServicosEspeciais] Abrindo anexo com URL:", anexo.url);
      window.open(anexo.url, "_blank");
    } else {
      console.warn("⚠️ [ServicosEspeciais] Anexo sem URL:", anexo);
      alert(
        `Não foi possível visualizar o arquivo.\n\nArquivo: ${
          anexo.originalName || anexo.fileName
        }\nMotivo: URL não encontrada no JSON`
      );
    }
  };

  const renderAnexo = (anexoInfo: IAnexoInfo): React.ReactElement => {
    const anexoKey = getAnexoKey(anexoInfo.id);
    const anexoData = anexos[anexoKey as keyof IAnexos] as IFileMetadata[];

    console.log("📎 [ServicosEspeciais] Renderizando anexo:", {
      anexoInfo,
      anexoKey,
      anexoData,
      todasChavesAnexos: Object.keys(anexos || {}),
    });

    // Se existem arquivos anexados, renderizar com dados reais
    if (anexoData && anexoData.length > 0) {
      return (
        <div key={anexoInfo.id} className={styles.anexoItem}>
          <div className={styles.anexoDetails}>
            <Icon iconName="Attach" className={styles.anexoIcon} />
            <div>
              <Text
                variant="small"
                style={{ fontWeight: 600, color: "#0078d4" }}
              >
                {anexoInfo.nome}
              </Text>
              <Text variant="xSmall" style={{ color: "#605e5c" }}>
                {anexoInfo.descricao}
              </Text>
              {anexoData.map((anexo, index) => (
                <div
                  key={anexo.id || index}
                  style={{
                    marginTop: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
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
                  <DefaultButton
                    iconProps={{ iconName: "View" }}
                    onClick={() => handleAnexoAction(anexo)}
                    title="Clique para visualizar o arquivo"
                    styles={{
                      root: {
                        minWidth: "32px",
                        width: "32px",
                        height: "32px",
                        padding: "0",
                      },
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Caso contrário, renderizar anexo sem arquivo anexado
    return (
      <div key={anexoInfo.id} className={styles.anexoItem}>
        <div className={styles.anexoDetails}>
          <Icon iconName="Attach" className={styles.anexoIcon} />
          <div>
            <Text variant="small">{anexoInfo.nome}</Text>
          </div>
          <div>
            <Text variant="xSmall" style={{ color: "#605e5c" }}>
              {anexoInfo.descricao}
            </Text>
          </div>
          <div>
            <Text variant="xSmall" style={{ color: "#d13438" }}>
              Arquivo não anexado
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

  const renderStatusIcon = (isSelected: boolean): React.ReactElement => {
    if (isSelected) {
      return <Icon iconName="CheckMark" className={styles.statusComplete} />;
    }
    return <Icon iconName="Cancel" className={styles.statusNotSelected} />;
  };

  const renderSection = (section: ISectionData): React.ReactElement => {
    const isExpanded = expandedSections.indexOf(section.id) !== -1;
    const isSelected = isSectionSelected(section.id);

    // Atualizar a seção com o status correto
    const sectionWithStatus = {
      ...section,
      aplicavel: isSelected,
    };

    return (
      <div
        key={section.id}
        className={`${styles.servicoCard} ${
          isSelected ? styles.selected : styles.notSelected
        }`}
      >
        <div
          className={styles.servicoHeader}
          onClick={() => toggleSection(section.id)}
        >
          <div className={styles.servicoTitle}>
            <div>
              <Text variant="medium" className={styles.servicoNome}>
                {section.titulo}
              </Text>
            </div>
            <div className={styles.servicoStatus}>
              {renderStatusIcon(isSelected)}
              <Text variant="small" className={styles.statusLabel}>
                {isSelected ? "SELECIONADO" : "NÃO SELECIONADO"}
              </Text>
            </div>
          </div>
          <Icon
            iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
            style={{ cursor: "pointer" }}
          />
        </div>

        {isExpanded && (
          <div className={styles.servicoContent}>
            {/* Status da seção */}
            <div className={styles.field} style={{ marginBottom: "16px" }}>
              <Text variant="small" style={{ fontWeight: 600 }}>
                Status:{" "}
                {isSelected
                  ? "✅ Serviço selecionado"
                  : "❌ Serviço não selecionado"}
              </Text>
            </div>

            {/* Anexos */}
            {sectionWithStatus.anexos.length > 0 && (
              <div className={styles.field} style={{ marginTop: "16px" }}>
                <Label>Documentos Relacionados:</Label>
                <Stack tokens={{ childrenGap: 8 }}>
                  {sectionWithStatus.anexos.map((anexo) => renderAnexo(anexo))}
                </Stack>
              </div>
            )}
          </div>
        )}
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
          ⚖️ <strong>Modo Revisão:</strong> Verifique os serviços especiais
          aplicáveis e sua documentação.
        </MessageBar>
      )}

      <Stack tokens={{ childrenGap: 24 }}>
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
              🚢 SERVIÇOS ESPECIAIS
            </Text>
          </div>
          <div className={styles.servicosGrid}>
            {servicosEspeciaisSections.map((section) => renderSection(section))}
          </div>
        </div>
      </Stack>
    </div>
  );
};

export default ServicosEspeciaisSection;
