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
  // Adicionar outros tipos de dados de relatório aqui futuramente
}
