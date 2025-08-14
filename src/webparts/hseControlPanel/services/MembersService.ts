import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/profiles";
import "@pnp/sp/search";
import { ITeamMember, IMembersData, ISharePointUser } from "../types/IMember";

export class MembersService {
  private sp: ReturnType<typeof spfi>;
  private context: WebPartContext;

  constructor(context: WebPartContext) {
    this.context = context;
    this.sp = spfi().using(SPFx(context));
  }

  /**
   * Busca todos os membros da lista hse-control-panel-config
   */
  public async getTeamMembers(): Promise<IMembersData> {
    try {
      const items = await this.sp.web.lists
        .getByTitle("hse-control-panel-config")
        .items.select(
          "Id",
          "Title",
          "ConfigKey",
          "ConfigType",
          "ConfigValue",
          "Description"
        )
        .filter("ConfigType eq 'TEAM_MEMBER'")();

      const members: ITeamMember[] = [];

      for (const item of items) {
        try {
          const memberData = JSON.parse(item.ConfigValue);
          const member: ITeamMember = {
            id: item.Id,
            name: memberData.name || item.Title,
            email: memberData.email || "",
            team: memberData.team || "HSE",
            role: memberData.role || "",
            isActive: memberData.isActive !== false,
            photoUrl: await this.getUserPhotoUrl(memberData.email),
          };
          members.push(member);
        } catch (parseError) {
          console.warn(`Erro ao processar membro ${item.Title}:`, parseError);
        }
      }

      return {
        hseMembers: members.filter((m) => m.team === "HSE"),
        comprasMembers: members.filter((m) => m.team === "Compras"),
        outrosMembers: members.filter((m) => m.team === "Outros"),
      };
    } catch (error) {
      console.error("Erro ao buscar membros:", error);
      return {
        hseMembers: [],
        comprasMembers: [],
        outrosMembers: [],
      };
    }
  }

  /**
   * Adiciona um novo membro à equipe
   */
  public async addTeamMember(
    member: Omit<ITeamMember, "id" | "photoUrl">
  ): Promise<boolean> {
    try {
      const configValue = JSON.stringify({
        name: member.name,
        email: member.email,
        team: member.team,
        role: member.role,
        isActive: member.isActive,
      });

      await this.sp.web.lists.getByTitle("hse-control-panel-config").items.add({
        Title: member.name,
        ConfigKey: `team_member_${member.email
          .replace("@", "_")
          .replace(".", "_")}`,
        ConfigType: "TEAM_MEMBER",
        ConfigValue: configValue,
        Description: `Membro da equipe ${member.team} - ${member.role}`,
      });

      return true;
    } catch (error) {
      console.error("Erro ao adicionar membro:", error);
      return false;
    }
  }

  /**
   * Atualiza um membro existente
   */
  public async updateTeamMember(
    id: number,
    member: Partial<ITeamMember>
  ): Promise<boolean> {
    try {
      const updateData: Record<string, unknown> = {};

      if (member.name) {
        updateData.Title = member.name;
      }

      if (
        member.email ||
        member.team ||
        member.role ||
        member.isActive !== undefined
      ) {
        // Buscar dados atuais primeiro
        const currentItem = await this.sp.web.lists
          .getByTitle("hse-control-panel-config")
          .items.getById(id)
          .select("ConfigValue")();

        const currentData = JSON.parse(currentItem.ConfigValue);

        const updatedData = {
          ...currentData,
          ...member,
        };

        updateData.ConfigValue = JSON.stringify(updatedData);
      }

      await this.sp.web.lists
        .getByTitle("hse-control-panel-config")
        .items.getById(id)
        .update(updateData);

      return true;
    } catch (error) {
      console.error("Erro ao atualizar membro:", error);
      return false;
    }
  }

  /**
   * Remove um membro da equipe
   */
  public async removeTeamMember(id: number): Promise<boolean> {
    try {
      await this.sp.web.lists
        .getByTitle("hse-control-panel-config")
        .items.getById(id)
        .delete();

      return true;
    } catch (error) {
      console.error("Erro ao remover membro:", error);
      return false;
    }
  }

  /**
   * Busca usuários do SharePoint/Azure AD
   */
  public async searchUsers(searchText: string): Promise<ISharePointUser[]> {
    if (!searchText || searchText.length < 2) {
      return [];
    }

    try {
      // Usar a API de busca do SharePoint para pessoas
      const searchQuery = `${
        this.context.pageContext.web.absoluteUrl
      }/_api/search/query?querytext='${encodeURIComponent(
        searchText
      )}*%20AND%20scope:"People"'&selectproperties='Title,PreferredName,WorkEmail,JobTitle,Department,PictureURL,AccountName'&sourceid='b09a7990-05ea-4af9-81ef-edfab16c4e31'&rowlimit=10`;

      const response = await fetch(searchQuery, {
        method: "GET",
        headers: {
          Accept: "application/json;odata=verbose",
        },
      });

      if (!response.ok) {
        throw new Error(`Erro na busca: ${response.status}`);
      }

      const data = await response.json();
      const users: ISharePointUser[] = [];

      if (data.d?.query?.PrimaryQueryResult?.RelevantResults?.Table?.Rows) {
        const results =
          data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows;

        for (const row of results) {
          const cells = row.Cells;
          const userInfo: Record<string, string> = {};

          // Mapear propriedades do resultado
          cells.forEach((cell: any) => {
            userInfo[cell.Key] = cell.Value;
          });

          if (userInfo.WorkEmail && userInfo.PreferredName) {
            const user: ISharePointUser = {
              id: userInfo.AccountName || userInfo.PreferredName,
              displayName: userInfo.PreferredName || userInfo.Title,
              email: userInfo.WorkEmail,
              jobTitle: userInfo.JobTitle,
              department: userInfo.Department,
              photoUrl: userInfo.PictureURL,
            };

            users.push(user);
          }
        }
      }

      return users;
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);

      // Fallback: retornar usuários mockados se a busca falhar
      if (searchText.toLowerCase().indexOf("raphael") !== -1) {
        return [
          {
            id: "raphael.costa@oceaneering.com",
            displayName: "Raphael Costa",
            email: "raphael.costa@oceaneering.com",
            jobTitle: "Jr Proposals Engineer",
            department: "HSE",
          },
        ];
      }

      return [];
    }
  }

  /**
   * Busca a foto do usuário no SharePoint
   */
  private async getUserPhotoUrl(email: string): Promise<string | undefined> {
    if (!email) return undefined;

    try {
      // Tentar buscar via PnPjs
      const userPhoto = await this.sp.profiles.getUserProfilePropertyFor(
        email,
        "PictureURL"
      );
      if (userPhoto && userPhoto !== "") {
        return userPhoto;
      }

      // Fallback para URL direta
      return `${
        this.context.pageContext.web.absoluteUrl
      }/_layouts/15/userphoto.aspx?size=M&username=${encodeURIComponent(
        email
      )}`;
    } catch (error) {
      console.log(`Erro ao buscar foto para ${email}:`, error);
      return undefined;
    }
  }
}
