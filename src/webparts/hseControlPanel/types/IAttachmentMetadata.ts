// Interface para metadados de anexos
export interface IAttachmentMetadata {
  id?: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  category: string;
  uploadedDate: Date;
  uploadedBy: string;
  description?: string;
}

// Interface para categoria de anexos
export interface IAttachmentCategory {
  key: string;
  name: string;
  required: boolean;
  allowMultiple: boolean;
  acceptedTypes: string[];
  maxSize: number;
}
