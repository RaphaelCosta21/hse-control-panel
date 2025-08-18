import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFx, SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import { IHSEFormData, IFileMetadata } from "../types/IHSEFormData";
import { IAttachmentMetadata } from "../types/IAttachmentMetadata";

export class SharePointService {
  private sp: SPFI;
  private listName: string;

  constructor(context: WebPartContext, listName: string = "hse-new-register") {
    this.sp = spfi().using(SPFx(context));
    this.listName = listName;
    console.log(
      "SharePointService initialized with context and list:",
      listName
    );
  }

  /**
   * Salva dados temporários do formulário HSE
   */
  public async saveFormData(
    formData: IHSEFormData,
    attachments: { [key: string]: IAttachmentMetadata[] } = {}
  ): Promise<number> {
    try {
      const attachmentCount = this.getAttachmentCount(attachments);

      const updateData = {
        Title: formData.dadosGerais.empresa,
        CNPJ: formData.dadosGerais.cnpj,
        StatusAvaliacao: "Em Andamento",
        GrauRisco: formData.grauRisco,
        PercentualConclusao: formData.percentualConclusao,
        DadosFormulario: JSON.stringify(formData),
        UltimaModificacao: new Date().toISOString(),
        EmailPreenchimento: formData.dadosGerais.email,
        NomePreenchimento: formData.dadosGerais.responsavelTecnico,
        AnexosCount: attachmentCount,
      };

      if (formData.id) {
        await this.sp.web.lists
          .getByTitle(this.listName)
          .items.getById(formData.id)
          .update(updateData);
        return formData.id;
      } else {
        const result = await this.sp.web.lists
          .getByTitle(this.listName)
          .items.add(updateData);
        return result.data.Id;
      }
    } catch (error) {
      console.error("Erro ao salvar dados do formulário:", error);
      throw new Error(`Falha ao salvar: ${error.message}`);
    }
  }

  /**
   * Obtém lista de formulários HSE
   */
  public async getFormsList(): Promise<any[]> {
    try {
      const items = await this.sp.web.lists
        .getByTitle(this.listName)
        .items.select(
          "Id",
          "Title",
          "CNPJ",
          "StatusAvaliacao",
          "GrauRisco",
          "PercentualConclusao",
          "EmailPreenchimento",
          "NomePreenchimento",
          "AnexosCount",
          "Modified",
          "Created"
        )
        .orderBy("Created", false)();

      return items;
    } catch (error) {
      console.error("Erro ao obter lista de formulários:", error);
      throw new Error(`Falha ao obter formulários: ${error.message}`);
    }
  }

  /**
   * Obtém dados completos de um formulário específico
   */
  public async getFormDetails(formId: number): Promise<{
    Id: number;
    Title: string;
    CNPJ: string;
    StatusAvaliacao: string;
    GrauRisco: string;
    PercentualConclusao: number;
    EmailPreenchimento: string;
    NomePreenchimento: string;
    AnexosCount: number;
    Modified: string;
    Created: string;
    DadosFormulario: string;
  }> {
    try {
      const item = await this.sp.web.lists
        .getByTitle(this.listName)
        .items.getById(formId)
        .select(
          "Id",
          "Title",
          "CNPJ",
          "StatusAvaliacao",
          "GrauRisco",
          "PercentualConclusao",
          "EmailPreenchimento",
          "NomePreenchimento",
          "AnexosCount",
          "Modified",
          "Created",
          "DadosFormulario"
        )();

      return item;
    } catch (error) {
      console.error("Erro ao obter detalhes do formulário:", error);
      throw new Error(`Falha ao obter detalhes: ${error.message}`);
    }
  }

  /**
   * Obtém estatísticas de formulários
   */
  public async getFormsStatistics(): Promise<{
    total: number;
    pendentes: number;
    aprovados: number;
    rejeitados: number;
    emAndamento: number;
  }> {
    try {
      const items = await this.sp.web.lists
        .getByTitle(this.listName)
        .items.select("StatusAvaliacao")();

      const stats = {
        total: items.length,
        pendentes: 0,
        aprovados: 0,
        rejeitados: 0,
        emAndamento: 0,
      };

      items.forEach((item) => {
        switch (item.StatusAvaliacao) {
          case "Pendente":
            stats.pendentes++;
            break;
          case "Aprovado":
            stats.aprovados++;
            break;
          case "Rejeitado":
            stats.rejeitados++;
            break;
          case "Em Andamento":
          case "Submetido para Avaliação":
            stats.emAndamento++;
            break;
        }
      });

      return stats;
    } catch (error) {
      console.error("Erro ao obter estatísticas:", error);
      throw new Error(`Falha ao obter estatísticas: ${error.message}`);
    }
  }

  /**
   * Atualiza o status de um formulário HSE
   */
  public async updateFormStatus(
    itemId: number,
    newStatus: string
  ): Promise<void> {
    try {
      await this.sp.web.lists
        .getByTitle(this.listName)
        .items.getById(itemId)
        .update({
          StatusAvaliacao: newStatus,
        });
    } catch (error) {
      console.error("Erro ao atualizar status do formulário:", error);
      throw new Error("Erro ao atualizar status do formulário");
    }
  }

  private getAttachmentCount(attachments: {
    [key: string]: IAttachmentMetadata[];
  }): number {
    let count = 0;
    for (const key in attachments) {
      if (Object.prototype.hasOwnProperty.call(attachments, key)) {
        count += attachments[key].length;
      }
    }
    return count;
  }

  /**
   * Obtém a URL de um anexo baseado no seu ID
   * @param attachmentId ID do anexo
   * @returns Promise<string> URL do anexo ou string vazia se não encontrado
   */
  /**
   * Obtém a URL de um anexo baseado no seu ID e dados do formulário
   * Estrutura: anexos-contratadas/{CNPJ}-{empresa}-{ID}/{categoria}/{arquivo}
   * @param attachmentId ID do anexo
   * @param formData Dados do formulário para construir o caminho
   * @returns Promise<IFileMetadata | undefined>
   */
  public async getAttachmentById(
    attachmentId: string,
    formData: {
      id: number;
      cnpj: string;
      empresa: string;
      categoria: string;
      fileName: string;
    }
  ): Promise<IFileMetadata | undefined> {
    try {
      console.log(`Construindo URL para anexo ID: ${attachmentId}`, formData);

      // Construir o caminho baseado na estrutura do SharePoint
      const empresaNormalizada = formData.empresa
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "_")
        .toLowerCase();
      const folderPath = `${formData.cnpj}-${empresaNormalizada}-${formData.id}`;
      const categoria = formData.categoria.toUpperCase();

      // URL completa do arquivo
      const siteUrl =
        "https://oceaneering.sharepoint.com/sites/OPGSSRBrazilExternalWebapps";
      const fileUrl = `${siteUrl}/anexoscontratadas/${folderPath}/${categoria}/${formData.fileName}`;

      console.log(`URL construída: ${fileUrl}`);

      // Retornar o objeto IFileMetadata com as informações disponíveis
      return {
        id: attachmentId,
        fileName: formData.fileName,
        fileSize: 0, // Não sabemos o tamanho sem acessar o arquivo
        uploadDate: new Date().toISOString(),
        url: fileUrl,
        category: formData.categoria,
        subcategory: "geral",
        originalName: formData.fileName,
        fileType: this.getFileTypeFromExtension(formData.fileName),
        sharePointPath: `/sites/OPGSSRBrazilExternalWebapps/anexoscontratadas/${folderPath}/${categoria}/${formData.fileName}`,
      };
    } catch (error) {
      console.error("Erro ao construir URL do anexo:", error);
      return undefined;
    }
  }

  /**
   * Obtém o tipo de arquivo baseado na extensão
   */
  private getFileTypeFromExtension(fileName: string): string {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return "application/pdf";
      case "doc":
      case "docx":
        return "application/msword";
      case "xls":
      case "xlsx":
        return "application/vnd.ms-excel";
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      default:
        return "application/octet-stream";
    }
  }

  /**
   * Obtém a URL de um anexo baseado no seu ID (método legado)
   * @param attachmentId ID do anexo
   * @returns Promise<string> URL do anexo ou string vazia se não encontrado
   */
  public async getAttachmentUrl(attachmentId: string): Promise<string> {
    try {
      console.log(`Tentando obter URL para anexo ID: ${attachmentId}`);

      // Por enquanto, retornar uma URL de exemplo
      // Em produção, isso deveria fazer uma consulta real ao SharePoint
      // para encontrar o arquivo baseado no ID

      // Exemplo de implementação que você poderia usar:
      // 1. Consultar a biblioteca de documentos HSE
      // 2. Procurar pelo arquivo com metadata que contenha o ID
      // 3. Retornar a URL absoluta do arquivo

      // Por enquanto, simular uma URL baseada no ID
      if (attachmentId.indexOf("local_") === 0) {
        // Para IDs locais (anexos que ainda não foram salvos no SharePoint)
        console.log(`Anexo com ID local detectado: ${attachmentId}`);
        return ""; // Não tem URL ainda
      }

      // Para IDs reais do SharePoint, construir URL
      // Este é um exemplo - você precisará ajustar conforme sua implementação
      const siteUrl = window.location.origin + "/sites/hse"; // Ajustar conforme necessário
      const libraryUrl = `${siteUrl}/AnexosHSE`; // Nome da biblioteca de anexos

      // Retornar URL do anexo (exemplo)
      return `${libraryUrl}/${attachmentId}`;
    } catch (error) {
      console.error("Erro ao obter URL do anexo:", error);
      return "";
    }
  }
}
