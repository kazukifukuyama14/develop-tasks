import { apiV1Client } from "@/libs/apiClient";
import type { ApiResponse } from "@/types/response";
import { type TaskList, type TaskListResponse } from "@/types/task";

/**
 * タスク一覧取得リクエスト送信
 */
export const getTaskList = async (): Promise<TaskList> => {
  const res = await apiV1Client.get<ApiResponse<TaskListResponse>>(
    "/tasks",
    {}
  );
  const data = res.data.data;

  if (!data) {
    throw new Error(`不正なレスポンス: ${JSON.stringify(res.data)}`);
  }

  return data;
};
