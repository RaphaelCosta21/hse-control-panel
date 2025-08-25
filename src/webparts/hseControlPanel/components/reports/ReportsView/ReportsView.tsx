import * as React from "react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ISharePointConfig } from "../../../types/ISharePointConfig";
import ReportsContainer from "../ReportsContainer/ReportsContainer";

export interface IReportsViewProps {
  context: WebPartContext;
  serviceConfig: ISharePointConfig;
}

const ReportsView: React.FC<IReportsViewProps> = ({
  context,
  serviceConfig,
}) => {
  return <ReportsContainer context={context} serviceConfig={serviceConfig} />;
};

export default ReportsView;
