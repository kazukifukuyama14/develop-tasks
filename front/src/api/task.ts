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