import { WebPartContext } from "@microsoft/sp-webpart-base";
import { SharePointService } from "./SharePointService";
import { ISharePointConfig } from "../types/ISharePointConfig";
import { IDashboardMetrics } from "../types/IControlPanelData";
import { IHSEFormData } from "../types/IHSEFormData";

export class HSEFormServiceSimple {
  private sharePointService: SharePointService;

  constructor(context: WebPartContext, config: ISharePointConfig) {
    console.log("HSEFormServiceSimple initialized with:", !!context, !!config);
    this.sharePointService = new SharePointService(context, "HSE_Suppliers");
  }

  // Basic method implementations that don't break compilation
  public async getFormById(formId: number): Promise<IHSEFormData | undefined> {
    // TODO: Implement
    return undefined;
  }

  public async getFormsWithFilters(filters: any): Promise<any[]> {
    // TODO: Implement
    return [];
  }

  public async getAllForms(): Promise<any[]> {
    return this.sharePointService.getFormsList();
  }

  public async updateFormEvaluation(
    formId: number,
    evaluation: any
  ): Promise<void> {
    // TODO: Implement
  }

  public async getDashboardMetrics(): Promise<IDashboardMetrics> {
    // Return mock data for now
    return {
      totalSubmissions: 45,
      pendingReview: 12,
      approved: 28,
      rejected: 5,
      averageReviewTime: 5.2,
      recentActivity: [
        {
          id: 1,
          type: "Submission",
          description: "Novo formulário HSE submetido",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          user: "Sistema",
        },
      ],
    };
  }
}
