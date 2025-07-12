import express from "express";

import { accessLogMiddleware } from "./middlewares/accessLogMiddleware";
import { errorMiddleware } from "./middlewares/errorMiddleware";
import { securityMiddleware } from "./middlewares/securityMiddleware";
import publicRouter from "./routes/public/publicRouter";
import { ERROR_CODE } from "../src/eroors/errorCode";
import { sendError } from "./libs/response";

const app = express();

// リクエストボディのJSONを自動でパース（req.body に入るようになる）
app.use(express.json());

// ミドルウェア登録
app.use(accessLogMiddleware);
app.use(securityMiddleware);

// ルーティング配置
// ログインなしで使えるAPI（例: /public/health, /public/version）
app.use("/public", publicRouter);

// まだ作ってないけど、今後ここに認証付きルートを追加する予定
// app.use("/tasks", taskRouter);

// 404エラー用
app.use((_req, res) => {
  sendError(res, ERROR_CODE.NOT_FOUND);
});

// エラーハンドリングは最後！全てのエラーをここで処理
app.use(errorMiddleware);

export default app;
