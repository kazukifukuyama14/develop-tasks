import { getEnv } from "./env";

const isDev = getEnv("MODE", "development") === "development";

/**
 * ロガー
 *
 * - `debug` や `info` は開発モード（NODE_ENV === "development"）のときのみ出力されます。
 * - 出力はコンソールに装飾付きで表示され、ログ種別ごとに色分けされています。
 */
const logger = {
  debug: (...args: unknown[]) =>
    isDev &&
    console.info("%c[DEBUG]", "color: gray; font-weight: bold;", ...args),

  info: (...args: unknown[]) =>
    isDev &&
    console.info("%c[INFO]", "color: dodgerblue; font-weight: bold;", ...args),

  warn: (...args: unknown[]) =>
    console.warn("%c[WARN]", "color: orange; font-weight: bold;", ...args),

  error: (...args: unknown[]) =>
    console.error("%c[ERROR]", "color: red; font-weight: bold;", ...args),
};

export default logger;
