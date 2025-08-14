export interface IMember {
  Id: number;
  Title: string;
  ConfigKey: string;
  ConfigType: string;
  ConfigValue: string;
  Description?: string;

  // Propriedades específicas para membros
  nome?: string;
  email?: string;
  equipe?: string;
  cargo?: string;
  ativo?: boolean;
  photo?: string;
}

export interface ITeamMember {
  id: number;
  name: string;
  email: string;
  team: "HSE" | "Compras";
  role: string;
  isActive: boolean;
  photoUrl?: string;
}

export interface IMembersData {
  hseMembers: ITeamMember[];
  comprasMembers: ITeamMember[];
}

export interface ISharePointUser {
  id: string;
  displayName: string;
  email: string;
  jobTitle?: string;
  department?: string;
  photoUrl?: string;
}
