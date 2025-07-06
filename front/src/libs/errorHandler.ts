import axios, { AxiosError } from "axios";

import type { ApiError, ApiResponse } from "@/types/response";
import logger from "./logger";
import notify from "./notify";

/**
 * どこから来たエラーでもエラーをSnackbarで表示
 * ついでにデバッグ用ログを出力するユーティリティ
 *
 * @param error  unknown なエラー
 * @param defaultMessage  想定外エラー時に表示するフォールバックメッセージ
 */
export function handleError(
  error: unknown,
  {
    defaultMessage = "予期しないエラーが発生しました。",
  }: {
    defaultMessage?: string;
  } = {}
): void {
  // ① Axios のレスポンス付きエラー
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<ApiResponse<unknown>>;
    const apiErr = axiosErr.response?.data?.error as ApiError | undefined;

    if (apiErr) {
      logger.warn("API ERROR:", {
        code: apiErr.errorCode,
        message: apiErr.message,
        details: apiErr.details,
        url: axiosErr.config?.url,
        status: axiosErr.response?.status,
      });
      notify.error(apiErr.message ?? defaultMessage);
      return;
    }

    // ② Axios ネットワーク / 設定エラー
    logger.error("AXIOS ERROR:", {
      message: axiosErr.message,
      url: axiosErr.config?.url,
      status: axiosErr.response?.status,
    });
    notify.error(axiosErr.message || defaultMessage);
    return;
  }

  // ③ 通常の JS Error
  if (error instanceof Error) {
    logger.error("JS ERROR:", error);
    notify.error(error.message || defaultMessage);
    return;
  }

  // ④ 想定外
  logger.error("UNKNOWN ERROR:", error);
  notify.error(defaultMessage);
}
