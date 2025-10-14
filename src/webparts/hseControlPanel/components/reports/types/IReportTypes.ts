import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ISharePointConfig } from "../../../types/ISharePointConfig";

export interface IRevalidationItem {
  id: number;
  companyName: string;
  cnpj: string;
  approvalDate: Date;
  nextRevalidationDate: Date;
  daysUntilExpiration: number;
  status: "Em Dia" | "Próximo do Vencimento" | "Vencido";
  riskLevel: 1 | 2 | 3 | 4;
  responsibleTechnician: string;
  approvedBy: string;
}

export interface IInviteItem {
  id: number;
  Title: string;
  FornecedorEmail: string;
  ConvidadoPor: string;
  DataEnvio: Date;
  hasStarted?: boolean; // Indica se a empresa já iniciou o processo
}

export interface IReportComponentProps {
  context: WebPartContext;
  serviceConfig: ISharePointConfig;
}

export interface IReportMenuItem {
  key: string;
  text: string;
  iconName: string;
  component: React.ComponentType<IReportComponentProps>;
}

export interface IReportData {
  revalidationItems: IRevalidationItem[];
  inviteItems: IInviteItem[];
  // Adicionar outros tipos de dados de relatório aqui futuramente
}
