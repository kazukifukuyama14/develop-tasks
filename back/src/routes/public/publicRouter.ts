import { Router } from "express";

import appConfig from "../../libs/appConfig";
import dbClient from "../../libs/dbClient";

const publicRouter = Router();

// バージョン確認用のエンドポイント
publicRouter.get("/version", (_req, res) => {
  res.json({
    version: appConfig.shortSHA,
    buildTime: appConfig.buildTime,
  });
});

// ヘルスチェック用エンドポイント
publicRouter.get("/health", async (_req, res) => {
  await dbClient.$queryRaw`SELECT 1`;
  res.status(200).send("ok");
});

// 高負荷環境を作るためのエンドポイント
publicRouter.get("/stress", (_req, res) => {
  // 非同期でCPU負荷をかける処理を開始
  setTimeout(() => {
    const end = Date.now() + 10000; // 10秒間CPUを回す
    while (Date.now() < end) {
      Math.sqrt(Math.random() * Math.random());
    }
  }, 0);

  res.status(200).send("CPU stress triggered for 10 seconds");
});

export default publicRouter;
