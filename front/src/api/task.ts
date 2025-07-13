import { apiV1Client } from "@/libs/apiClient";
import type { ApiResponse } from "@/types/response";
import {
  type TaskDetail,
  type TaskDetailResponse,
  type TaskList,
  type TaskListResponse,
} from "@/types/task";

/**
 * タスク一覧取得リクエスト送信
 */
export const getTaskList = async (): Promise<TaskList> => {
  const res = await apiV1Client.get<ApiResponse<TaskListResponse>>(
    "/tasks",
    {}
  );
  return res.data.data;
};

type CreateParams = {
  title: string;
  description?: string;
  status: string;
  dueDate?: Date;
};

/**
 * タスク作成リクエスト送信
 */
export const createTask = async (input: CreateParams): Promise<TaskDetail> => {
  const res = await apiV1Client.post<ApiResponse<TaskDetailResponse>>(
    "/tasks",
    {
      data: {
        ...input,
      },
    }
  );
  return res.data.data;
};

// ========== 追加する関数 ==========

type UpdateParams = {
  taskId: string;
  title: string;
  description?: string;
  status: string;
  dueDate?: Date;
};

/**
 * タスク更新リクエスト送信
 */
export const updateTask = async (input: UpdateParams): Promise<TaskDetail> => {
  const { taskId, ...data } = input;
  const res = await apiV1Client.patch<ApiResponse<TaskDetailResponse>>(
    `/tasks/${taskId}`,
    {
      data: {
        ...data,
      },
    }
  );
  return res.data.data;
};

/**
 * タスク削除リクエスト送信
 */
export const deleteTask = async (taskId: string): Promise<void> => {
  await apiV1Client.delete(`/tasks/${taskId}`);
};
