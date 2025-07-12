const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] ?? defaultValue;
  if (!value) {
    throw new Error(`環境変数 ${key} が設定されていません。`);
  }
  return value;
};

/**
 * アプリケーションで使用する環境変数をまとめた設定ファイル。
 * - `process.env` を直接使うのではなく、この `appConfig` 経由で参照することで、
 *   使用される環境変数が明示的になります。
 * - 値が設定されていない場合にはエラーで通知され、バグや設定漏れに早期に気づけます。
 */
const appConfig = {
  nodeEnv: getEnv("NODE_ENV", "development"),
  port: Number(getEnv("APP_PORT", "8080")),
  shortSHA: getEnv("SHORT_SHA", "local"),
  buildTime: getEnv("BUILD_TIME", new Date().toISOString()),
  corsOrigin: getEnv("CORS_ORIGIN"),
  cognitoUserPoolId: getEnv("COGNITO_USER_POOL_ID"),
  cognitoClientId: getEnv("COGNITO_CLIENT_ID"),
};

/**
 * アプリが「本番環境（production）」として動いているかどうかを判定します。
 */
export const isProduction = appConfig.nodeEnv === "production";

/**
 * アプリが「開発環境（development）」として動いているかどうかを判定します。
 */
export const isDevelopment = appConfig.nodeEnv === "development";

export default appConfig;
