import { Request, Response, NextFunction } from "express";
import { CognitoJwtVerifier } from "aws-jwt-verify";

import { ERROR_CODE } from "../eroors/errorCode";
import appConfig from "../libs/appConfig";
import { sendError } from "../libs/response";
import { AppRole, AppRoleType } from "../types/appRole";

// Cognito 設定
const USER_POOL_ID = appConfig.cognitoUserPoolId;
const CLIENT_ID = appConfig.cognitoClientId;

// Verifier インスタンスの作成
const verifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID,
  tokenUse: "id",
  clientId: CLIENT_ID,
});

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.log.warn({ authHeader }, "不正なヘッダー");
    sendError(res, ERROR_CODE.UNAUTHORIZED);
    return;
  }

  const token = authHeader.split(" ")[1];

  const payload = await verifier.verify(token);

  const sub = payload.sub;
  const email = typeof payload.email === "string" ? payload.email : undefined;

  // Cognitoのグループからロールを取得（1ユーザー = 1グループ前提）
  let role: AppRoleType = AppRole.Member;
  const groups = payload["cognito:groups"] as string[] | undefined;
  if (groups?.includes(AppRole.Admin)) {
    role = AppRole.Admin;
  }

  if (!sub || !email) {
    sendError(res, ERROR_CODE.INVALID_TOKEN);
    return;
  }

  req.user = {
    sub: sub,
    email: email,
    role: role,
  };

  next();
};
