import { Task } from "../../generated/prisma";
import { AppTaskStatusType, toAppTaskStatus } from "../taskStatus";

export type TaskDto = {
  id: string;
  title: string;
  description?: string;
  status: AppTaskStatusType;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type TaskListDto = TaskDto[];

/**
 * DBから取得した Task をレスポンス用に整形
 */
export const toTaskDto = (task: Task): TaskDto => {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? undefined,
    status: toAppTaskStatus(task.status),
    dueDate: task.dueDate ?? undefined,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
};

/**
 * DBから取得した Task[] をレスポンス用に整形
 */
export const toTaskListDto = (tasks: Task[]): TaskListDto => {
  return tasks.map((t) => toTaskDto(t));
};
