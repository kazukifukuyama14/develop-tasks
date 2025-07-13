import { Request, Response } from "express";
import { z } from "zod";

import { TaskStatusEnum, ULIDSchema } from "../../schemas/schema";
import { sendError, sendSuccess } from "../../libs/response";
import { ERROR_CODE } from "../../eroors/errorCode";
import { toPrismaTaskStatus } from "../../types/taskStatus";
import { AppError } from "../../eroors/AppError";
import dbClient from "../../libs/dbClient";
import { toTaskDto } from "../../types/dto/task";
import { createRequestContext } from "../../types/requestContext";

// =====================================
// 検証用スキーマ
// =====================================
const paramsSchema = z.object({
  taskId: ULIDSchema,
});

const today = new Date();
today.setHours(0, 0, 0, 0); // 時刻を 00:00:00 に揃える

const bodySchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  dueDate: z
    .date()
    .min(today, { message: "日付は今日以降を指定してください" })
    .optional(),
  taskStatus: TaskStatusEnum.optional(),
});

// =====================================
// 関数
// =====================================
export const updateTaskHandler = async (req: Request, res: Response) => {
  // RequestContext を作成
  const context = createRequestContext(req);

  // パスパラメータの検証
  const parsedParamsResult = paramsSchema.safeParse(req.params);
  if (!parsedParamsResult.success) {
    context.log.warn(
      { error: parsedParamsResult.error.issues },
      "zodパースエラー"
    );
    sendError(res, ERROR_CODE.VALIDATION_ERROR);
    return;
  }
  const { taskId } = parsedParamsResult.data;

  // ボディの検証
  const parsedBodyResult = bodySchema.safeParse(req.body.data);
  if (!parsedBodyResult.success) {
    context.log.warn(
      { error: parsedBodyResult.error.issues },
      "zodパースエラー"
    );
    sendError(res, ERROR_CODE.VALIDATION_ERROR);
    return;
  }
  const { title, taskStatus, dueDate, description } = parsedBodyResult.data;
  const prismaTaskStatus = !!taskStatus
    ? toPrismaTaskStatus(taskStatus)
    : undefined;

  // ユーザー情報の取得
  const userId = context.user?.sub;
  if (!userId) {
    throw new AppError({
      code: ERROR_CODE.UNAUTHORIZED,
      debugMessage: "ユーザー情報が取得できません",
    });
  }

  // タスクをDBに保存する
  const task = await dbClient.task.update({
    where: {
      id: taskId,
      assignedTo: userId,
    },
    data: {
      title,
      description,
      status: prismaTaskStatus,
      dueDate,
    },
  });

  // 作成したタスクをレスポンス用に整形する
  const dto = toTaskDto(task);
  sendSuccess(res, dto);
  return;
};
