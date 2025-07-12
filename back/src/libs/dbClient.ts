import { Prisma, PrismaClient } from "../generated/prisma";

import { isProduction } from "./appConfig";
import logger from "./logger";

const prismaLogLevels = isProduction
  ? ([
      { emit: "event", level: "error" },
      { emit: "event", level: "warn" },
    ] as const)
  : ([
      { emit: "event", level: "query" },
      { emit: "event", level: "info" },
      { emit: "event", level: "warn" },
      { emit: "event", level: "error" },
    ] as const);

type PrismaLogLevels = (typeof prismaLogLevels)[number]["level"];

declare global {
  var prisma:
    | PrismaClient<Prisma.PrismaClientOptions, PrismaLogLevels>
    | undefined;
}

/**
 * アプリケーション全体で共有される PrismaClient インスタンス。
 *
 * @example
 * const users = await dbClient.user.findMany();
 */
const dbClient =
  globalThis.prisma ||
  new PrismaClient({
    log: [...prismaLogLevels],
  });

if (!isProduction) {
  globalThis.prisma = dbClient;
}

// PrismaのログをpinoのJSONで整形して出力
if (!isProduction) {
  dbClient.$on("query", (e) => {
    logger.debug({
      type: "prisma.query",
      query: e.query,
      params: e.params,
      duration: e.duration,
    });
  });

  dbClient.$on("info", (e) => {
    logger.info({
      type: "prisma.info",
      message: e.message,
    });
  });
}

dbClient.$on("warn", (e) => {
  logger.warn({
    type: "prisma.warn",
    message: e.message,
  });
});

dbClient.$on("error", (e) => {
  logger.error({
    type: "prisma.error",
    message: e.message,
    target: e.target,
  });
});

export default dbClient;
