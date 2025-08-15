import * as React from "react";
import {
  Stack,
  Text,
  Icon,
  Label,
  MessageBar,
  MessageBarType,
  DefaultButton,
  TextField,
  Pivot,
  PivotItem,
} from "@fluentui/react";
import { IConformidadeLegal, IAnexos } from "../../../../types/IHSEFormData";
import styles from "./ConformidadeLegalSection.module.scss";

export interface IConformidadeLegalSectionProps {
  data: IConformidadeLegal;
  anexos: IAnexos;
  isReviewing: boolean;
}

interface INormaRegulamentadora {
  numero: string;
  titulo: string;
  descricao: string;
  obrigatoria: boolean;
}

const normasRegulamentadoras: INormaRegulamentadora[] = [
  {
    numero: "NR-1",
    titulo: "Disposições Gerais",
    descricao: "Estabelece disposições gerais sobre SST",
    obrigatoria: true,
  },
  {
    numero: "NR-4",
    titulo: "SESMT",
    descricao:
      "Serviços Especializados em Engenharia de Segurança e Medicina do Trabalho",
    obrigatoria: true,
  },
  {
    numero: "NR-5",
    titulo: "CIPA",
    descricao: "Comissão Interna de Prevenção de Acidentes",
    obrigatoria: true,
  },
  {
    numero: "NR-6",
    titulo: "EPI",
    descricao: "Equipamento de Proteção Individual",
    obrigatoria: true,
  },
  {
    numero: "NR-7",
    titulo: "PCMSO",
    descricao: "Programa de Controle Médico de Saúde Ocupacional",
    obrigatoria: true,
  },
  {
    numero: "NR-8",
    titulo: "Edificações",
    descricao: "Estabelece requisitos técnicos para edificações",
    obrigatoria: false,
  },
  {
    numero: "NR-9",
    titulo: "PPRA",
    descricao: "Programa de Prevenção de Riscos Ambientais",
    obrigatoria: true,
  },
  {
    numero: "NR-10",
    titulo: "Eletricidade",
    descricao: "Segurança em instalações e serviços em eletricidade",
    obrigatoria: false,
  },
  {
    numero: "NR-11",
    titulo: "Transporte de Materiais",
    descricao: "Transporte, movimentação, armazenagem e manuseio de materiais",
    obrigatoria: false,
  },
  {
    numero: "NR-12",
    titulo: "Máquinas e Equipamentos",
    descricao: "Segurança no trabalho em máquinas e equipamentos",
    obrigatoria: false,
  },
  {
    numero: "NR-15",
    titulo: "Atividades Insalubres",
    descricao: "Caracterização de atividades ou operações insalubres",
    obrigatoria: false,
  },
  {
    numero: "NR-16",
    titulo: "Atividades Perigosas",
    descricao: "Caracterização de atividades ou operações perigosas",
    obrigatoria: false,
  },
  {
    numero: "NR-17",
    titulo: "Ergonomia",
    descricao: "Condições de trabalho relacionadas à ergonomia",
    obrigatoria: false,
  },
  {
    numero: "NR-18",
    titulo: "Construção Civil",
    descricao: "Condições e meio ambiente de trabalho na construção civil",
    obrigatoria: false,
  },
  {
    numero: "NR-20",
    titulo: "Líquidos Combustíveis",
    descricao: "Segurança e saúde no trabalho com inflamáveis e combustíveis",
    obrigatoria: false,
  },
  {
    numero: "NR-35",
    titulo: "Trabalho em Altura",
    descricao: "Trabalho em altura",
    obrigatoria: false,
  },
];

const ConformidadeLegalSection: React.FC<IConformidadeLegalSectionProps> = ({
  data,
  anexos,
  isReviewing,
}) => {
  const [selectedNR, setSelectedNR] = React.useState("NR-1");

  const getNRData = (nrKey: string): any => {
    const key = nrKey.toLowerCase().replace("-", "");
    return data[key as keyof IConformidadeLegal];
  };

  const getNRStatus = (
    nrKey: string
  ): "completo" | "incompleto" | "nao_aplicavel" => {
    const nrData = getNRData(nrKey);
    if (!nrData) return "nao_aplicavel";
    if (nrData.possuiDocumento && nrData.observacoes) return "completo";
    if (nrData.possuiDocumento) return "incompleto";
    return "nao_aplicavel";
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

  const renderNRCard = (nr: INormaRegulamentadora): React.ReactElement => {
    const status = getNRStatus(nr.numero);
    const nrData = getNRData(nr.numero);

    return (
      <div
        className={`${styles.nrCard} ${
          nr.obrigatoria ? styles.mandatory : styles.optional
        }`}
      >
        <div className={styles.nrHeader}>
          <div className={styles.nrTitle}>
            <Text variant="large" className={styles.nrNumber}>
              {nr.numero}
            </Text>
            <div>
              <Text variant="medium" className={styles.nrName}>
                {nr.titulo}
              </Text>
              <Text variant="small" className={styles.nrDescription}>
                {nr.descricao}
              </Text>
            </div>
          </div>
          <div className={styles.nrStatus}>
            {renderStatusIcon(status)}
            <Text variant="small" className={styles.statusLabel}>
              {nr.obrigatoria ? "Obrigatória" : "Opcional"}
            </Text>
          </div>
        </div>

        {nrData && (
          <div className={styles.nrContent}>
            <Stack tokens={{ childrenGap: 12 }}>
              <div className={styles.field}>
                <Label>Possui Documento:</Label>
                <span
                  className={`${styles.toggleValue} ${
                    nrData.possuiDocumento ? styles.positive : styles.negative
                  }`}
                >
                  <Icon
                    iconName={nrData.possuiDocumento ? "CheckMark" : "Cancel"}
                  />
                  {nrData.possuiDocumento ? "Sim" : "Não"}
                </span>
              </div>

              {nrData.observacoes && (
                <div className={styles.field}>
                  <Label>Observações:</Label>
                  <Text variant="small" className={styles.observacoes}>
                    {nrData.observacoes}
                  </Text>
                </div>
              )}

              {nrData.anexo && (
                <div className={styles.field}>
                  <Label>Anexo:</Label>
                  <div className={styles.anexoItem}>
                    <Icon iconName="Attach" className={styles.anexoIcon} />
                    <Text variant="small">{nrData.anexo}</Text>
                    <div className={styles.anexoActions}>
                      <DefaultButton
                        iconProps={{ iconName: "Download" }}
                        text="Baixar"
                      />
                      <DefaultButton
                        iconProps={{ iconName: "View" }}
                        text="Visualizar"
                      />
                    </div>
                  </div>
                </div>
              )}
            </Stack>
          </div>
        )}
      </div>
    );
  };

  const renderNRList = (): React.ReactElement => (
    <div className={styles.nrList}>
      <div className={styles.nrSummary}>
        <div className={styles.summaryCard}>
          <Icon iconName="CheckMark" className={styles.summaryIconComplete} />
          <div>
            <Text variant="large">
              {
                normasRegulamentadoras.filter(
                  (nr) => getNRStatus(nr.numero) === "completo"
                ).length
              }
            </Text>
            <Text variant="small">Completas</Text>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <Icon iconName="Warning" className={styles.summaryIconIncomplete} />
          <div>
            <Text variant="large">
              {
                normasRegulamentadoras.filter(
                  (nr) => getNRStatus(nr.numero) === "incompleto"
                ).length
              }
            </Text>
            <Text variant="small">Incompletas</Text>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <Icon iconName="Cancel" className={styles.summaryIconNotApplicable} />
          <div>
            <Text variant="large">
              {
                normasRegulamentadoras.filter(
                  (nr) => getNRStatus(nr.numero) === "nao_aplicavel"
                ).length
              }
            </Text>
            <Text variant="small">N/A</Text>
          </div>
        </div>
      </div>

      <div className={styles.nrGrid}>
        {normasRegulamentadoras.map((nr) => renderNRCard(nr))}
      </div>
    </div>
  );

  const renderNRDetails = (): React.ReactElement => {
    let nr: any = null;
    for (let i = 0; i < normasRegulamentadoras.length; i++) {
      if (normasRegulamentadoras[i].numero === selectedNR) {
        nr = normasRegulamentadoras[i];
        break;
      }
    }
    if (!nr) return <div>Norma não encontrada</div>;

    const nrData = getNRData(selectedNR);

    return (
      <div className={styles.nrDetails}>
        <div className={styles.detailsHeader}>
          <Text variant="xLarge" className={styles.detailsTitle}>
            {nr.numero} - {nr.titulo}
          </Text>
          <Text variant="medium" className={styles.detailsDescription}>
            {nr.descricao}
          </Text>
        </div>

        <Stack tokens={{ childrenGap: 20 }}>
          {nrData ? (
            <>
              <div className={styles.detailsField}>
                <Label>Status do Documento:</Label>
                <div className={styles.statusBadge}>
                  {renderStatusIcon(getNRStatus(selectedNR))}
                  <Text>
                    {nrData.possuiDocumento
                      ? "Documento Presente"
                      : "Documento Ausente"}
                  </Text>
                </div>
              </div>

              <div className={styles.detailsField}>
                <Label>Observações:</Label>
                <TextField
                  multiline
                  rows={4}
                  value={nrData.observacoes || ""}
                  placeholder="Adicione observações sobre esta norma..."
                  readOnly={!isReviewing}
                />
              </div>

              {nrData.anexo && (
                <div className={styles.detailsField}>
                  <Label>Documento Anexado:</Label>
                  <div className={styles.anexoDetails}>
                    <Icon iconName="Attach" />
                    <Text>{nrData.anexo}</Text>
                    <DefaultButton
                      iconProps={{ iconName: "Download" }}
                      text="Baixar"
                    />
                    <DefaultButton
                      iconProps={{ iconName: "View" }}
                      text="Visualizar"
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <MessageBar messageBarType={MessageBarType.warning}>
              Esta norma não foi preenchida no formulário.
            </MessageBar>
          )}
        </Stack>
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
          Regulamentadoras aplicáveis.
        </MessageBar>
      )}

      <Pivot className={styles.pivot}>
        <PivotItem headerText="📋 Visão Geral" itemKey="overview">
          {renderNRList()}
        </PivotItem>
        <PivotItem headerText="🔍 Detalhes por NR" itemKey="details">
          <div className={styles.detailsContainer}>
            <div className={styles.nrSelector}>
              <Label>Selecionar Norma:</Label>
              <div className={styles.nrButtons}>
                {normasRegulamentadoras.map((nr) => (
                  <DefaultButton
                    key={nr.numero}
                    text={nr.numero}
                    onClick={() => setSelectedNR(nr.numero)}
                    className={
                      selectedNR === nr.numero
                        ? styles.selectedNR
                        : styles.nrButton
                    }
                  />
                ))}
              </div>
            </div>
            {renderNRDetails()}
          </div>
        </PivotItem>
      </Pivot>
    </div>
  );
};

export default ConformidadeLegalSection;
