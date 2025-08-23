import * as React from "react";
import {
  Stack,
  Text,
  MessageBar,
  MessageBarType,
  PersonaSize,
} from "@fluentui/react";
import { UserCard } from "../../../../ui";
import { IHSEFormData } from "../../../../../types/IHSEFormData";
import styles from "./FormHeader.module.scss";

export interface IFormHeaderProps {
  formData: IHSEFormData;
  isReviewing: boolean;
}

const FormHeader: React.FC<IFormHeaderProps> = ({ formData, isReviewing }) => {
  return (
    <div className={styles.header}>
      <Stack tokens={{ childrenGap: 20 }}>
        {/* Linha principal com título e informações da empresa */}
        <Stack
          horizontal
          horizontalAlign="space-between"
          verticalAlign="center"
        >
          <Stack.Item grow>
            <Stack tokens={{ childrenGap: 8 }}>
              <Text variant="xxLarge" className={styles.title}>
                📋 Formulário HSE
              </Text>
              <Stack
                horizontal
                tokens={{ childrenGap: 16 }}
                verticalAlign="center"
              >
                <div className={styles.companyInfo}>
                  <Text variant="large" className={styles.companyName}>
                    {formData?.dadosGerais.empresa}
                  </Text>
                </div>
                <div className={styles.cnpjInfo}>
                  <Text className={styles.cnpjLabel}>CNPJ:</Text>
                  <Text className={styles.cnpjValue}>
                    {formData?.dadosGerais.cnpj}
                  </Text>
                </div>
              </Stack>
            </Stack>
          </Stack.Item>

          {formData?.analisadoPor && (
            <Stack.Item>
              <div className={styles.reviewerSection}>
                <span className={styles.reviewerLabel}>Analisado por:</span>
                <div className={styles.reviewerCard}>
                  <UserCard
                    user={{
                      name: formData.analisadoPor,
                      email: "",
                      photoUrl: undefined,
                      isActive: true,
                    }}
                    size={PersonaSize.size32}
                  />
                </div>
              </div>
            </Stack.Item>
          )}
        </Stack>

        {/* Linha de status e informações adicionais */}
        <Stack
          horizontal
          horizontalAlign="space-between"
          verticalAlign="center"
        >
          <Stack horizontal tokens={{ childrenGap: 24 }} verticalAlign="center">
            <div className={styles.statusInfo}>
              <Text className={styles.infoLabel}>Status:</Text>
              <span
                className={`${styles.statusBadge} ${
                  formData?.status
                    ? styles[
                        `status${formData.status.replace(
                          /\s+/g,
                          ""
                        )}` as keyof typeof styles
                      ]
                    : ""
                }`}
              >
                {formData?.status === "Aprovado" && "✅"}
                {formData?.status === "Rejeitado" && "❌"}
                {formData?.status === "Em Análise" && "🔄"}
                {formData?.status === "Enviado" && "📤"}
                {formData?.status === "Pendente Informações" && "⚠️"}
                {formData?.status === "Em Andamento" && "⏳"} {formData?.status}
              </span>
            </div>

            {formData?.dataEnvio && (
              <div className={styles.dateInfo}>
                <Text className={styles.infoLabel}>Data de Envio:</Text>
                <Text className={styles.infoValue}>
                  {new Date(formData.dataEnvio).toLocaleDateString("pt-BR")}
                </Text>
              </div>
            )}

            {formData?.dataAvaliacao && (
              <div className={styles.dateInfo}>
                <Text className={styles.infoLabel}>Data de Avaliação:</Text>
                <Text className={styles.infoValue}>
                  {new Date(formData.dataAvaliacao).toLocaleDateString("pt-BR")}
                </Text>
              </div>
            )}
          </Stack>
        </Stack>
      </Stack>

      {isReviewing && (
        <MessageBar
          messageBarType={MessageBarType.info}
          className={styles.reviewingAlert}
        >
          🔍 <strong>Modo Revisão Ativo:</strong> Você está revisando este
          formulário.
        </MessageBar>
      )}
    </div>
  );
};

export default FormHeader;
