import { Request, Response } from "express";

import { sendSuccess } from "../../libs/response";
import { ERROR_CODE } from "../../eroors/errorCode";
import { AppError } from "../../eroors/AppError";
import dbClient from "../../libs/dbClient";
import { createRequestContext } from "../../types/requestContext";
import { toTaskListDto } from "../../types/dto/task";

// =====================================
// 関数
// =====================================
export const listTaskHandler = async (req: Request, res: Response) => {
  // RequestContext を作成
  const context = createRequestContext(req);

  // ユーザー情報の取得
  const userId = context.user?.sub;
  if (!userId) {
    throw new AppError({
      code: ERROR_CODE.UNAUTHORIZED,
      debugMessage: "ユーザー情報が取得できません",
    });
  }

  // 自分のタスク一覧を取得
  const tasks = await dbClient.task.findMany({
    where: {
      assignedTo: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 作成したタスクをレスポンス用に整形する
  const dto = toTaskListDto(tasks);
  sendSuccess(res, dto);
  return;
};
