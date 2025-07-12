import "source-map-support/register";
import "dotenv/config";

import app from "./app";
import appConfig from "./libs/appConfig";
import logger from "./libs/logger";
import dbClient from "./libs/dbClient";

const PORT = appConfig.port;
const version = appConfig.shortSHA;
const buildTime = appConfig.buildTime;
const nodeEnv = appConfig.nodeEnv;

const server = app.listen(PORT, () => {
  logger.info(
    {
      PORT: PORT,
      VERSION: version,
      BUILD_TIME: buildTime,
      NODE_ENV: nodeEnv,
    },
    "🚀 Server started"
  );
});

async function gracefulShutdown() {
  try {
    logger.info("🛑 Gracefully shutting down...");
    await dbClient.$disconnect(); // Prismaクローズ
    logger.info("✅ Prisma disconnected.");
    server.close(() => {
      logger.info("✅ Server closed.");
      process.exit(0);
    });
  } catch (err) {
    logger.error({ err }, "❌ Error during shutdown");
    process.exit(1);
  }
}

// アプリケーションが手動停止（Ctrl+C）されたときにシャットダウン処理を実行
process.on("SIGINT", gracefulShutdown);

// ECS環境で正常終了（SIGTERM）が発行されたときの処理
process.on("SIGTERM", gracefulShutdown);

// Promiseの.catch漏れなど、未処理のPromiseエラーを検知
// Expressのエンドポイント外での非同期処理や、アプリ起動時の await のミスなどで発生する。
process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "💥 Unhandled Rejection");
});

// try-catchに捕まらなかったエラー（例：同期処理中の例外）を検知
// Expressのルーティング外の初期化コードなどでエラーが出た場合、ここで拾って安全にプロセスを終了させる。
process.on("uncaughtException", (err) => {
  logger.error({ err }, "💥 Uncaught Exception");
  process.exit(1);
});
