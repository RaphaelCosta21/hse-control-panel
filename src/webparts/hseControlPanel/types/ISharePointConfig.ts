// Interface para configuração de lista do SharePoint
export interface IListConfig {
  listName: string;
  titleField: string;
  idField: string;
}

// Interface para configuração do SharePoint
export interface ISharePointConfig {
  siteUrl?: string;
  listConfigs: {
    hseFormsList: IListConfig;
    attachmentsList: IListConfig;
    evaluationsList: IListConfig;
    configurationsList: IListConfig;
    invitesList: IListConfig;
  };
  defaultFields: {
    created: string;
    modified: string;
    author: string;
    editor: string;
  };
}

// Interface para configuração do serviço HSE
export interface IHSEServiceConfig {
  listName: string;
  libraryName: string;
  siteUrl?: string;
  enableCache?: boolean;
  cacheTimeout?: number;
}
