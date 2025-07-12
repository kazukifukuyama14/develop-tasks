import { ErrorCodeType } from "./errorCode";

/**
 * アプリケーション内で使用する共通エラークラス。
 */
export class AppError extends Error {
  /** アプリケーション固有のエラーコード（例: USER_NOT_FOUND） */
  public code: ErrorCodeType;

  public details?: Record<string, unknown>;

  public cause?: unknown;
  public originalErrorType?: string; // ← 追加

  constructor({
    code,
    debugMessage,
    details,
    cause,
    originalErrorType,
  }: {
    code: ErrorCodeType;
    debugMessage: string;
    details?: Record<string, unknown>;
    cause?: unknown;
    originalErrorType?: string;
  }) {
    super(debugMessage);
    this.name = "AppError";
    this.code = code;
    this.details = details;
    this.cause = cause;
    this.originalErrorType = originalErrorType ?? cause?.constructor?.name;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }

    // 継承元（Error）との互換性を保つためのおまじない（重要）
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * 任意のエラーオブジェクトを AppError に変換します。
   *
   * - AppError の場合はそのまま返却（contextがあれば details にマージ）
   *
   * @param err 任意のエラーオブジェクト。ZodError, PrismaError, 通常の Error など
   * @param context エラーに付随する補足情報（リクエストボディやユーザーIDなど）
   * @returns AppError に変換されたエラーオブジェクト
   */
  static from(err: unknown, context?: Record<string, unknown>): AppError {
    if (err instanceof AppError) {
      // 補足情報を結合したいならここで追加
      if (context) {
        err.details = { ...(err.details || {}), ...context };
      }
      return err;
    }

    return new AppError({
      code: "UNEXPECTED_ERROR",
      debugMessage: "未知のエラー",
      cause: err,
      details: context,
    });
  }
}
