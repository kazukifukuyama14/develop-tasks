import { Response } from "express";

import { ERROR_DEFINITION, ErrorCodeType } from "../eroors/errorCode";
import { ApiError, ApiResponse } from "../types/response";

/**
 * 成功時のレス位ポンスを作成
 */
export function sendSuccess<T = any>(
  res: Response,
  data: T,
  statusCode: number = 200
): void {
  const response: ApiResponse<T> = { data };
  res.status(statusCode).json(response);
}

type SendErrorOptions = {
  details?: Record<string, any>;
  overrideMessage?: string;
  overrideStatusCode?: number;
};

// エラー時レスポンス
export function sendError(
  res: Response,
  errorCode: ErrorCodeType,
  options: SendErrorOptions = {}
): void {
  const definition = ERROR_DEFINITION[errorCode];

  const error: ApiError = {
    errorCode,
    message: options.overrideMessage ?? definition.message,
    details: options.details,
  };

  const response: ApiResponse = { data: null, error };
  res
    .status(options.overrideStatusCode ?? definition.statusCode)
    .json(response);
}
