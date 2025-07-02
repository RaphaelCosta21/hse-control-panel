import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IAttachmentMetadata } from "../types/IAttachmentMetadata";

export class SharePointFileService {
  private context: WebPartContext;
  private libraryName: string;

  constructor(
    context: WebPartContext,
    libraryName: string = "anexos-contratadas"
  ) {
    this.context = context;
    this.libraryName = libraryName;
  }

  /**
   * Upload de arquivo para biblioteca do SharePoint
   */
  public async uploadFile(
    file: File,
    category: string,
    formId: number,
    description?: string
  ): Promise<IAttachmentMetadata> {
    try {
      // TODO: Implementar upload real usando PnPjs
      // Por enquanto, retorna mock para não quebrar a compilação
      console.log(`Uploading file to library: ${this.libraryName}`);

      const metadata: IAttachmentMetadata = {
        id: `${Date.now()}-${file.name}`,
        name: file.name,
        size: file.size,
        type: file.type,
        category,
        uploadedDate: new Date(),
        uploadedBy: this.context.pageContext.user.displayName,
        description: description || "",
        url: `#mock-url-${file.name}`,
      };

      return metadata;
    } catch (error) {
      console.error("Erro ao fazer upload do arquivo:", error);
      throw new Error(`Falha no upload: ${error.message}`);
    }
  }

  /**
   * Download de arquivo da biblioteca
   */
  public async downloadFile(fileId: string): Promise<Blob> {
    try {
      // TODO: Implementar download real usando PnPjs
      throw new Error("Download não implementado ainda");
    } catch (error) {
      console.error("Erro ao fazer download do arquivo:", error);
      throw new Error(`Falha no download: ${error.message}`);
    }
  }

  /**
   * Lista anexos de um formulário
   */
  public async getFormAttachments(
    formId: number
  ): Promise<IAttachmentMetadata[]> {
    try {
      // TODO: Implementar busca real usando PnPjs
      // Por enquanto, retorna array vazio
      return [];
    } catch (error) {
      console.error("Erro ao buscar anexos:", error);
      throw new Error(`Falha ao buscar anexos: ${error.message}`);
    }
  }

  /**
   * Remove arquivo da biblioteca
   */
  public async deleteFile(fileId: string): Promise<void> {
    try {
      // TODO: Implementar remoção real usando PnPjs
      console.log(`Mock: Arquivo ${fileId} removido`);
    } catch (error) {
      console.error("Erro ao remover arquivo:", error);
      throw new Error(`Falha ao remover arquivo: ${error.message}`);
    }
  }

  /**
   * Atualiza metadados do arquivo
   */
  public async updateFileMetadata(
    fileId: string,
    metadata: Partial<IAttachmentMetadata>
  ): Promise<void> {
    try {
      // TODO: Implementar atualização real usando PnPjs
      console.log(`Mock: Metadados do arquivo ${fileId} atualizados`, metadata);
    } catch (error) {
      console.error("Erro ao atualizar metadados:", error);
      throw new Error(`Falha ao atualizar metadados: ${error.message}`);
    }
  }
}
