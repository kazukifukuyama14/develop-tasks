import { Request, Response, NextFunction } from "express";

import { generateUlid } from "../libs/idGenerator";
import logger from "../libs/logger";
import { isProduction } from "../libs/appConfig";

export const accessLogMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // リクエストIDを生成
  const reqId = generateUlid();
  // リクエストIDをロガー、Request, ヘッダーにセット
  req.reqId = reqId;
  req.log = logger.child({ reqId });
  res.setHeader("X-Request-Id", reqId);

  const startTime = process.hrtime();

  // レスポンス終了時のログ
  res.on("finish", () => {
    // エラーログのみ出力（開発時は全て出力）
    if (res.statusCode <= 400 && isProduction) {
      return;
    }

    const diff = process.hrtime(startTime);
    const durationMs = diff[0] * 1000 + diff[1] / 1_000_000; // 秒 + ナノ秒

    const logBody: Record<string, any> = {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      userSub: req.user?.sub ?? "unknown",
      durationMs: durationMs.toFixed(1),
      ua: req.headers["user-agent"],
      ip: req.ip,
    };
    if (!isProduction) {
      logBody.debugBody = req.body;
    }

    req.log.info(logBody, "アクセスログ");
  });

  next();
};
