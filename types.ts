export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface PortraitStyle {
  id: string;
  title: string;
  description: string;
  prompt: string;
}

export interface GenerationResult {
  styleId: string;
  status: GenerationStatus;
  imageUrl?: string;
  error?: string;
}

export interface FileData {
  base64: string;
  mimeType: string;
}
