import { Request, Response } from "express";
import { z } from "zod";

import { TaskStatusEnum } from "../../schemas/schema";
import { sendError, sendSuccess } from "../../libs/response";
import { ERROR_CODE } from "../../eroors/errorCode";
import { toPrismaTaskStatus } from "../../types/taskStatus";
import { AppError } from "../../eroors/AppError";
import { generateUlid } from "../../libs/idGenerator";
import dbClient from "../../libs/dbClient";
import { toTaskDto } from "../../types/dto/task";
import { createRequestContext } from "../../types/requestContext";

// =====================================
// 検証用スキーマ
// =====================================
const today = new Date();
today.setHours(0, 0, 0, 0); // 時刻を 00:00:00 に揃える

const schema = z.object({
  title: z.string(),
  description: z.string().optional(),
  dueDate: z
    .date()
    .min(today, { message: "日付は今日以降を指定してください" })
    .optional(),
  status: TaskStatusEnum,
});

// =====================================
// 関数
// =====================================
export const createTaskHandler = async (req: Request, res: Response) => {
  // RequestContext を作成
  const context = createRequestContext(req);

  // 入力値の検証
  const parsedBodyResult = schema.safeParse(req.body.data);
  if (!parsedBodyResult.success) {
    context.log.warn(
      { error: parsedBodyResult.error.issues },
      "zodパースエラー"
    );
    sendError(res, ERROR_CODE.VALIDATION_ERROR);
    return;
  }
  const { title, status, dueDate, description } = parsedBodyResult.data;
  const prismaTaskStatus = !!status ? toPrismaTaskStatus(status) : undefined;

  // ユーザー情報の取得
  const userId = context.user?.sub;
  if (!userId) {
    throw new AppError({
      code: ERROR_CODE.UNAUTHORIZED,
      debugMessage: "ユーザー情報が取得できません",
    });
  }

  // タスクをDBに保存する
  const taskId = generateUlid();
  const task = await dbClient.task.create({
    data: {
      id: taskId,
      title,
      description,
      status: prismaTaskStatus,
      dueDate,
      assignedTo: userId,
    },
  });

  // 作成したタスクをレスポンス用に整形する
  const dto = toTaskDto(task);
  sendSuccess(res, dto);
  return;
};
