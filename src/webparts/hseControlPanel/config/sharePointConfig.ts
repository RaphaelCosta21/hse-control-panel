import { ISharePointConfig } from "../types/ISharePointConfig";

export const getDefaultSharePointConfig = (): ISharePointConfig => {
  return {
    siteUrl: "",
    listConfigs: {
      hseFormsList: {
        listName: "hse-new-register", // MESMA lista do HSE Supplier Register
        titleField: "Title",
        idField: "ID",
      },
      attachmentsList: {
        listName: "anexos-contratadas", // MESMA biblioteca do HSE Supplier Register
        titleField: "Title",
        idField: "ID",
      },
      evaluationsList: {
        listName: "hse-evaluations", // Lista para avaliações
        titleField: "Title",
        idField: "ID",
      },
      configurationsList: {
        listName: "hse-control-panel-config", // Lista para configurações do sistema
        titleField: "Title",
        idField: "ID",
      },
      invitesList: {
        listName: "hse-control-panel-invites", // Lista para convites de fornecedores
        titleField: "Title",
        idField: "ID",
      },
    },
    defaultFields: {
      created: "Created",
      modified: "Modified",
      author: "Author",
      editor: "Editor",
    },
  };
};
