import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFx, SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { IHSEFormData } from "../types/IHSEFormData";
import { IAttachmentMetadata } from "../types/IAttachmentMetadata";

export class SharePointService {
  private sp: SPFI;
  private listName: string;

  constructor(context: WebPartContext, listName: string = "HSE_Suppliers") {
    this.sp = spfi().using(SPFx(context));
    this.listName = listName;
    console.log(
      "SharePointService2 initialized with context and list:",
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
          "Created",
          "Author/Title",
          "Author/Email",
          "Author/Id"
        )
        .expand("Author")
        .orderBy("Created", false)();

      return items;
    } catch (error) {
      console.error("Erro ao obter lista de formulários:", error);
      throw new Error(`Falha ao obter formulários: ${error.message}`);
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
}
