import "source-map-support/register";
import express from "express";
import "dotenv/config";

import appConfig from "./libs/appConfig";

const PORT = appConfig.port;
const version = appConfig.shortSHA;
const buildTime = appConfig.buildTime;
const nodeEnv = appConfig.nodeEnv;

const app = express();

app.get("/public/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    version,
    buildTime,
    nodeEnv,
  });
});

app.listen(PORT, () => {
  console.log(
    {
      PORT: PORT,
      VERSION: version,
      BUILD_TIME: buildTime,
      NODE_ENV: nodeEnv,
    },
    "🚀 Server started"
  );
});
