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
import { IServicosEspeciais, IAnexos } from "../../../../types/IHSEFormData";
import styles from "./ServicosEspeciaisSection.module.scss";

export interface IServicosEspeciaisSectionProps {
  data: IServicosEspeciais;
  anexos: IAnexos;
  isReviewing: boolean;
}

interface IServicoCategoria {
  titulo: string;
  icon: string;
  descricao: string;
  servicos: IServicoItem[];
}

interface IServicoItem {
  key: string;
  nome: string;
  descricao: string;
  obrigatorio: boolean;
}

const servicosMaritimos: IServicoCategoria[] = [
  {
    titulo: "Certificados Marítimos",
    icon: "Ferry",
    descricao: "Documentação para operações aquaviárias",
    servicos: [
      {
        key: "certificadoAquaviario",
        nome: "Certificado Aquaviário",
        descricao: "Certificado para navegação em águas interiores",
        obrigatorio: true,
      },
      {
        key: "habilitacaoANTAQ",
        nome: "Habilitação ANTAQ",
        descricao: "Registro na Agência Nacional de Transportes Aquaviários",
        obrigatorio: true,
      },
    ],
  },
  {
    titulo: "Equipamentos de Elevação",
    icon: "StreamingOn",
    descricao: "Certificações para equipamentos de movimentação",
    servicos: [
      {
        key: "certificadoGuindaste",
        nome: "Certificado de Guindaste",
        descricao: "Inspeção e certificação de guindastes",
        obrigatorio: false,
      },
      {
        key: "certificadoGuincho",
        nome: "Certificado de Guincho",
        descricao: "Inspeção e certificação de guinchos",
        obrigatorio: false,
      },
      {
        key: "certificadoPonte",
        nome: "Certificado de Ponte Rolante",
        descricao: "Inspeção e certificação de pontes rolantes",
        obrigatorio: false,
      },
    ],
  },
  {
    titulo: "Serviços Especializados",
    icon: "WorkforceManagement",
    descricao: "Capacitações e certificações especiais",
    servicos: [
      {
        key: "soldaSubaquatica",
        nome: "Solda Subaquática",
        descricao: "Certificação para soldagem subaquática",
        obrigatorio: false,
      },
      {
        key: "inspecaoNDT",
        nome: "Inspeção NDT",
        descricao: "Ensaios não destrutivos",
        obrigatorio: false,
      },
    ],
  },
];

const ServicosEspeciaisSection: React.FC<IServicosEspeciaisSectionProps> = ({
  data,
  anexos,
  isReviewing,
}) => {
  const getServicoData = (servicoKey: string): any => {
    return data[servicoKey as keyof IServicosEspeciais];
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return "N/A";
    return date.toLocaleDateString("pt-BR");
  };

  const diasParaVencimento = (dataVencimento: Date | undefined): number => {
    if (!dataVencimento) return 0;
    const hoje = new Date();
    const diff = dataVencimento.getTime() - hoje.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const getStatusCertificado = (
    servicoData: { possui?: boolean; dataVencimento?: Date } | undefined
  ): "ativo" | "vencido" | "vencendo" | "ausente" => {
    if (!servicoData || !servicoData.possui) return "ausente";
    if (!servicoData.dataVencimento) return "ativo";

    const dias = diasParaVencimento(servicoData.dataVencimento);
    if (dias < 0) return "vencido";
    if (dias <= 30) return "vencendo";
    return "ativo";
  };

  const renderStatusBadge = (
    status: "ativo" | "vencido" | "vencendo" | "ausente"
  ): React.ReactElement => {
    const configs = {
      ativo: {
        icon: "CheckMark",
        text: "Ativo",
        className: styles.statusAtivo,
      },
      vencido: {
        icon: "ErrorBadge",
        text: "Vencido",
        className: styles.statusVencido,
      },
      vencendo: {
        icon: "Warning",
        text: "Vencendo",
        className: styles.statusVencendo,
      },
      ausente: {
        icon: "Cancel",
        text: "Ausente",
        className: styles.statusAusente,
      },
    };

    const config = configs[status];
    return (
      <span className={`${styles.statusBadge} ${config.className}`}>
        <Icon iconName={config.icon} />
        {config.text}
      </span>
    );
  };

  const renderServicoCard = (servico: IServicoItem): React.ReactElement => {
    const servicoData = getServicoData(servico.key);
    const status = getStatusCertificado(servicoData);

    return (
      <div
        key={servico.key}
        className={`${styles.servicoCard} ${
          servico.obrigatorio ? styles.obrigatorio : styles.opcional
        }`}
      >
        <div className={styles.servicoHeader}>
          <div className={styles.servicoInfo}>
            <Text variant="medium" className={styles.servicoNome}>
              {servico.nome}
            </Text>
            <Text variant="small" className={styles.servicoDescricao}>
              {servico.descricao}
            </Text>
            <Text variant="small" className={styles.servicoTipo}>
              {servico.obrigatorio ? "🔴 Obrigatório" : "🟡 Opcional"}
            </Text>
          </div>
          <div className={styles.servicoStatus}>
            {renderStatusBadge(status)}
          </div>
        </div>

        {servicoData && servicoData.possui && (
          <div className={styles.servicoDetalhes}>
            <Stack tokens={{ childrenGap: 12 }}>
              {servicoData.numeroRegistro && (
                <div className={styles.detalheItem}>
                  <Label>Número de Registro:</Label>
                  <Text>{servicoData.numeroRegistro}</Text>
                </div>
              )}

              {servicoData.numeroSerie && (
                <div className={styles.detalheItem}>
                  <Label>Número de Série:</Label>
                  <Text>{servicoData.numeroSerie}</Text>
                </div>
              )}

              {servicoData.dataVencimento && (
                <div className={styles.detalheItem}>
                  <Label>Data de Vencimento:</Label>
                  <div className={styles.dataVencimento}>
                    <Text>{formatDate(servicoData.dataVencimento)}</Text>
                    {status === "vencendo" && (
                      <Text variant="small" className={styles.alertaVencimento}>
                        ⚠️ Vence em{" "}
                        {diasParaVencimento(servicoData.dataVencimento)} dias
                      </Text>
                    )}
                    {status === "vencido" && (
                      <Text variant="small" className={styles.alertaVencido}>
                        🚫 Vencido há{" "}
                        {Math.abs(
                          diasParaVencimento(servicoData.dataVencimento)
                        )}{" "}
                        dias
                      </Text>
                    )}
                  </div>
                </div>
              )}

              {servicoData.certificacoes &&
                servicoData.certificacoes.length > 0 && (
                  <div className={styles.detalheItem}>
                    <Label>Certificações:</Label>
                    <div className={styles.certificacoesList}>
                      {servicoData.certificacoes.map(
                        (cert: string, index: number) => (
                          <span key={index} className={styles.certificacaoTag}>
                            {cert}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

              {servicoData.metodos && servicoData.metodos.length > 0 && (
                <div className={styles.detalheItem}>
                  <Label>Métodos:</Label>
                  <div className={styles.metodosList}>
                    {servicoData.metodos.map(
                      (metodo: string, index: number) => (
                        <span key={index} className={styles.metodoTag}>
                          {metodo}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              {servicoData.anexo && (
                <div className={styles.detalheItem}>
                  <Label>Anexo:</Label>
                  <div className={styles.anexoItem}>
                    <Icon iconName="Attach" className={styles.anexoIcon} />
                    <Text>{servicoData.anexo}</Text>
                    <div className={styles.anexoActions}>
                      <DefaultButton
                        iconProps={{ iconName: "Download" }}
                        text="Baixar"
                        onClick={() =>
                          console.log(`Download ${servicoData.anexo}`)
                        }
                      />
                      <DefaultButton
                        iconProps={{ iconName: "View" }}
                        text="Visualizar"
                        onClick={() =>
                          console.log(`Visualizar ${servicoData.anexo}`)
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {servicoData.anexos && servicoData.anexos.length > 0 && (
                <div className={styles.detalheItem}>
                  <Label>Anexos Múltiplos:</Label>
                  <div className={styles.anexosList}>
                    {servicoData.anexos.map((anexo: string, index: number) => (
                      <div key={index} className={styles.anexoItem}>
                        <Icon iconName="Attach" className={styles.anexoIcon} />
                        <Text>{anexo}</Text>
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
                    ))}
                  </div>
                </div>
              )}
            </Stack>
          </div>
        )}

        {(!servicoData || !servicoData.possui) && (
          <div className={styles.servicoAusente}>
            <MessageBar messageBarType={MessageBarType.warning}>
              Este serviço não foi informado no formulário.
            </MessageBar>
          </div>
        )}
      </div>
    );
  };

  const renderCategoriaSection = (
    categoria: IServicoCategoria
  ): React.ReactElement => (
    <div key={categoria.titulo} className={styles.categoriaSection}>
      <div className={styles.categoriaHeader}>
        <Icon iconName={categoria.icon} className={styles.categoriaIcon} />
        <div>
          <Text variant="xLarge" className={styles.categoriaTitulo}>
            {categoria.titulo}
          </Text>
          <Text variant="medium" className={styles.categoriaDescricao}>
            {categoria.descricao}
          </Text>
        </div>
      </div>

      <div className={styles.servicosGrid}>
        {categoria.servicos.map((servico) => renderServicoCard(servico))}
      </div>
    </div>
  );

  const renderResumo = (): React.ReactElement => {
    const totalServicos = servicosMaritimos.reduce(
      (acc, cat) => acc + cat.servicos.length,
      0
    );
    const servicosAtivos = servicosMaritimos.reduce((acc, cat) => {
      return (
        acc +
        cat.servicos.filter(
          (s) => getStatusCertificado(getServicoData(s.key)) === "ativo"
        ).length
      );
    }, 0);
    const servicosVencendo = servicosMaritimos.reduce((acc, cat) => {
      return (
        acc +
        cat.servicos.filter(
          (s) => getStatusCertificado(getServicoData(s.key)) === "vencendo"
        ).length
      );
    }, 0);
    const servicosVencidos = servicosMaritimos.reduce((acc, cat) => {
      return (
        acc +
        cat.servicos.filter(
          (s) => getStatusCertificado(getServicoData(s.key)) === "vencido"
        ).length
      );
    }, 0);

    return (
      <div className={styles.resumoSection}>
        <div className={styles.resumoCard}>
          <Icon iconName="CheckMark" className={styles.resumoIconAtivo} />
          <div>
            <Text variant="xLarge">{servicosAtivos}</Text>
            <Text variant="small">Ativos</Text>
          </div>
        </div>

        <div className={styles.resumoCard}>
          <Icon iconName="Warning" className={styles.resumoIconVencendo} />
          <div>
            <Text variant="xLarge">{servicosVencendo}</Text>
            <Text variant="small">Vencendo</Text>
          </div>
        </div>

        <div className={styles.resumoCard}>
          <Icon iconName="ErrorBadge" className={styles.resumoIconVencido} />
          <div>
            <Text variant="xLarge">{servicosVencidos}</Text>
            <Text variant="small">Vencidos</Text>
          </div>
        </div>

        <div className={styles.resumoCard}>
          <Icon iconName="Cancel" className={styles.resumoIconAusente} />
          <div>
            <Text variant="xLarge">
              {totalServicos -
                servicosAtivos -
                servicosVencendo -
                servicosVencidos}
            </Text>
            <Text variant="small">Ausentes</Text>
          </div>
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
          🚢 <strong>Modo Revisão:</strong> Verifique as certificações e
          validades dos serviços especializados.
        </MessageBar>
      )}

      {renderResumo()}

      <Stack tokens={{ childrenGap: 32 }}>
        {servicosMaritimos.map((categoria) =>
          renderCategoriaSection(categoria)
        )}
      </Stack>
    </div>
  );
};

export default ServicosEspeciaisSection;
