/**
 * アプリケーション共通のエラーコード定義。
 * APIレスポンスやログなどで一貫性を保つために使用します。
 */
export const ERROR_CODE = {
  // 汎用エラー
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  UNEXPECTED_ERROR: "UNEXPECTED_ERROR",

  // ユーザー関連
  USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
  USER_NOT_FOUND: "USER_NOT_FOUND",

  // DB制約
  UNIQUE_CONSTRAINT_VIOLATION: "UNIQUE_CONSTRAINT_VIOLATION",
  FOREIGN_KEY_CONSTRAINT_VIOLATION: "FOREIGN_KEY_CONSTRAINT_VIOLATION",
  RECORD_NOT_FOUND: "RECORD_NOT_FOUND",

  // Prisma内部系
  PRISMA_VALIDATION_ERROR: "PRISMA_VALIDATION_ERROR",
  PRISMA_UNKNOWN_ERROR: "PRISMA_UNKNOWN_ERROR",

  // バリデーション
  VALIDATION_ERROR: "VALIDATION_ERROR",

  // トークン関連
  INVALID_ROLE: "INVALID_ROLE",
  INVALID_TOKEN: "INVALID_TOKEN",
} as const;

/** エラーコード型 */
export type ErrorCodeType = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];

/**
 * エラーコードに対応する HTTP ステータスコードとユーザー向けメッセージ。
 * APIレスポンス整形時に参照されます。
 */
export const ERROR_DEFINITION: Record<
  ErrorCodeType,
  { statusCode: number; message: string }
> = {
  // 汎用
  BAD_REQUEST: { statusCode: 400, message: "リクエストが不正です。" },
  UNAUTHORIZED: { statusCode: 401, message: "認証に失敗しました。" },
  FORBIDDEN: { statusCode: 403, message: "権限がありません。" },
  NOT_FOUND: { statusCode: 404, message: "リソースが見つかりません。" },
  CONFLICT: { statusCode: 409, message: "リクエストが競合しました。" },
  INTERNAL_ERROR: { statusCode: 500, message: "内部エラーが発生しました。" },
  UNEXPECTED_ERROR: {
    statusCode: 500,
    message: "予期しないエラーが発生しました。",
  },

  // ユーザー関連
  USER_ALREADY_EXISTS: {
    statusCode: 409,
    message: "既に登録済みのユーザーです。",
  },
  USER_NOT_FOUND: {
    statusCode: 404,
    message: "ユーザーが見つかりません。",
  },

  // DB系
  UNIQUE_CONSTRAINT_VIOLATION: {
    statusCode: 409,
    message: "この値は既に使用されています。",
  },
  FOREIGN_KEY_CONSTRAINT_VIOLATION: {
    statusCode: 400,
    message: "外部キー制約に違反しています。",
  },
  RECORD_NOT_FOUND: {
    statusCode: 404,
    message: "対象のデータが存在しません。",
  },

  // Prisma
  PRISMA_VALIDATION_ERROR: {
    statusCode: 400,
    message: "内部データ処理に失敗しました。",
  },
  PRISMA_UNKNOWN_ERROR: {
    statusCode: 500,
    message: "データベースの内部エラーが発生しました。",
  },

  // バリデーション
  VALIDATION_ERROR: {
    statusCode: 400,
    message: "入力内容に不備があります。",
  },

  INVALID_ROLE: {
    statusCode: 403,
    message: "不正なロールです。",
  },
  INVALID_TOKEN: {
    statusCode: 403,
    message: "不正なトークンです。",
  },
};
