import pino from "pino";

import { isProduction } from "./appConfig";

const loggerOption = {
  level: isProduction ? "info" : "debug",
  ...(isProduction
    ? {}
    : {
        transport: {
          target: "pino-pretty",
        },
      }),
};

/**
 * アプリケーション全体で使用する Pino ロガー。
 */
const logger = pino(loggerOption);

export default logger;
