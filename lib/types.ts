export type UploadState = 
  | { status: 'idle' }
  | { status: 'uploading', progress: number }
  | { status: 'analyzing', attempt: number, maxAttempts: number }
  | { status: 'success', data: any }
  | { status: 'error', message: string, canRetry: boolean };