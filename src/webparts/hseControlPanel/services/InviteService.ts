import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFx, SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import {
  ICreateInviteData,
  IInviteItem,
  IInviteResult,
} from "../types/IConfigurationData";

export class InviteService {
  private sp: SPFI;
  private readonly listName = "hse-control-panel-invites";

  constructor(context: WebPartContext) {
    this.sp = spfi().using(SPFx(context));
    console.log("InviteService initialized with list:", this.listName);
  }

  /**
   * Cria um novo convite para fornecedor
   */
  public async createInvite(data: ICreateInviteData): Promise<IInviteResult> {
    try {
      // Verificar se já existe convite recente para este email (últimos 7 dias)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const existingInvites = await this.sp.web.lists
        .getByTitle(this.listName)
        .items.filter(
          `FornecedorEmail eq '${
            data.fornecedorEmail
          }' and DataEnvio ge '${sevenDaysAgo.toISOString()}'`
        )();

      if (existingInvites.length > 0) {
        return {
          success: false,
          message:
            "Já foi enviado um convite para este fornecedor nos últimos 7 dias",
        };
      }

      // Criar item na lista
      const now = new Date();
      const result = await this.sp.web.lists
        .getByTitle(this.listName)
        .items.add({
          Title: `Convite - ${data.fornecedorEmail}`,
          FornecedorEmail: data.fornecedorEmail,
          ConvidadoPor: data.convidadoPor,
          DataEnvio: now.toISOString(),
        });

      console.log("Resultado completo da criação:", result);

      // Verificar se o resultado tem a estrutura esperada
      let itemId: number | undefined = undefined;

      if (result && typeof result === "object") {
        // Tentar diferentes estruturas possíveis de resposta do SharePoint
        if (
          result.data &&
          typeof result.data === "object" &&
          "Id" in result.data
        ) {
          itemId = result.data.Id;
        } else if ("Id" in result) {
          itemId = result.Id;
        } else if (
          result.item &&
          typeof result.item === "object" &&
          "Id" in result.item
        ) {
          itemId = result.item.Id;
        }
      }

      console.log("Convite criado com sucesso. ID extraído:", itemId);

      return {
        success: true,
        message:
          "Convite enviado com sucesso! O Power Automate processará automaticamente.",
        inviteId: itemId,
      };
    } catch (error) {
      console.error("Erro ao criar convite:", error);
      return {
        success: false,
        message: `Erro interno ao enviar convite: ${error.message}`,
      };
    }
  }

  /**
   * Obtém lista de todos os convites
   */
  public async getInvites(limit?: number): Promise<IInviteItem[]> {
    try {
      let query = this.sp.web.lists
        .getByTitle(this.listName)
        .items.select(
          "Id",
          "Title",
          "FornecedorEmail",
          "ConvidadoPor",
          "DataEnvio",
          "Created",
          "Modified"
        )
        .orderBy("DataEnvio", false);

      if (limit) {
        query = query.top(limit);
      }

      const items = await query();
      return items as IInviteItem[];
    } catch (error) {
      console.error("Erro ao buscar convites:", error);
      return [];
    }
  }

  /**
   * Obtém convites enviados por um usuário específico
   */
  public async getInvitesByUser(
    userEmail: string,
    limit?: number
  ): Promise<IInviteItem[]> {
    try {
      let query = this.sp.web.lists
        .getByTitle(this.listName)
        .items.select(
          "Id",
          "Title",
          "FornecedorEmail",
          "ConvidadoPor",
          "DataEnvio",
          "Created",
          "Modified"
        )
        .filter(`ConvidadoPor eq '${userEmail}'`)
        .orderBy("DataEnvio", false);

      if (limit) {
        query = query.top(limit);
      }

      const items = await query();
      return items as IInviteItem[];
    } catch (error) {
      console.error("Erro ao buscar convites do usuário:", error);
      return [];
    }
  }

  /**
   * Verifica se um email já foi convidado recentemente
   */
  public async checkRecentInvite(
    email: string,
    days: number = 7
  ): Promise<boolean> {
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - days);

      const existingInvites = await this.sp.web.lists
        .getByTitle(this.listName)
        .items.filter(
          `FornecedorEmail eq '${email}' and DataEnvio ge '${daysAgo.toISOString()}'`
        )
        .top(1)();

      return existingInvites.length > 0;
    } catch (error) {
      console.error("Erro ao verificar convite recente:", error);
      return false;
    }
  }
}
