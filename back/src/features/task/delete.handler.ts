import { Request, Response } from "express";
import { z } from "zod";

import { ULIDSchema } from "../../schemas/schema";
import { sendError } from "../../libs/response";
import { ERROR_CODE } from "../../eroors/errorCode";
import { AppError } from "../../eroors/AppError";
import dbClient from "../../libs/dbClient";
import { createRequestContext } from "../../types/requestContext";

// =====================================
// 検証用スキーマ
// =====================================
const schema = z.object({
  taskId: ULIDSchema,
});

// =====================================
// 関数
// =====================================
export const deleteTaskHandler = async (req: Request, res: Response) => {
  // RequestContext を作成
  const context = createRequestContext(req);

  // パスパラメータの検証
  const parsedParamsResult = schema.safeParse(req.params);
  if (!parsedParamsResult.success) {
    context.log.warn(
      { error: parsedParamsResult.error.issues },
      "zodパースエラー"
    );
    sendError(res, ERROR_CODE.VALIDATION_ERROR);
    return;
  }
  const { taskId } = parsedParamsResult.data;

  // ユーザー情報の取得
  const userId = context.user?.sub;
  if (!userId) {
    throw new AppError({
      code: ERROR_CODE.UNAUTHORIZED,
      debugMessage: "ユーザー情報が取得できません",
    });
  }

  // DBから削除
  await dbClient.task.delete({
    where: {
      id: taskId,
      assignedTo: userId,
    },
  });

  // 204 No Content でレスポンスを返す
  res.status(204).send();
  return;
};
