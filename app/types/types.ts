export interface InspectResult {
  status: number;
  headers: Record<string, string>;
  contentType: string;
  contentLength: string | null;
  lastModified: string | null;
  etag: string | null;
  preview: string | null;
}

export interface FileMetadata {
  name: string;
  sizeFormatted: string;
  mimeType: string;
  lastModifiedFormatted: string;
  statusCode: number;
  statusText: string;
  isSuccess: boolean;
}

export interface SecurityHeaderAssessment {
  name: string;
  value: string | null;
  isSet: boolean;
  status: 'secure' | 'warning' | 'missing';
  description: string;
}
