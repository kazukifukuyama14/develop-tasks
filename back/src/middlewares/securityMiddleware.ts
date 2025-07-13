import express from "express";
import cors from "cors";
import helmet from "helmet";

import appConfig from "../libs/appConfig";

/**
 * CORS_ORIGIN 環境変数からオリジンを取得・パースする関数。
 * 複数オリジンが設定されている場合はカンマ区切りで分割して返す。
 *
 * @throws CORS_ORIGIN が未定義または空の場合はエラーをスロー
 */
export const getCorsOrigins = (): string[] | string => {
  const raw = appConfig.corsOrigin;

  const origins = raw.split(",").map((origin) => origin.trim());

  return origins.length === 1 ? origins[0] : origins;
};

/**
 * セキュリティミドルウェア群をひとまとめにした Express ミドルウェア。
 * - CORS
 * - Helmet（Content-Security-Policy は除外）
 */
export const securityMiddleware: express.RequestHandler = (req, res, next) => {
  // CORS用ミドルウェアを生成して即時実行
  cors({
    origin: appConfig.corsOrigin,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })(req, res, (err) => {
    if (err) return next(err);

    // Helmet適用（CSPは無効化）
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: false,
    })(req, res, next);
  });
};
