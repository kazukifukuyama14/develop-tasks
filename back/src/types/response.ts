export type ApiError = {
  errorCode: string;
  message: string;
  details?: Record<string, unknown>;
};

export type ApiResponse<TData = unknown> = {
  data: TData;
  error?: ApiError;
};
