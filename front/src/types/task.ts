export const AppTaskStatus = {
  Pending: "PENDING",
  InProgress: "IN_PROGRESS",
  Done: "DONE",
} as const;

export type AppTaskStatusType =
  (typeof AppTaskStatus)[keyof typeof AppTaskStatus];

/**
 * AppTaskStatus型を返します。
 * 不正な文字列の場合エラーを返します。
 */
export const toAppTaskStatus = (status: string): AppTaskStatusType => {
  const values = Object.values(AppTaskStatus);
  if (values.includes(status as AppTaskStatusType)) {
    return status as AppTaskStatusType;
  }
  throw new Error(`Invalid AppTaskStatus: ${status}`);
};

/**
 * アプリ側で利用するタスク詳細の型
 */
export type TaskDetail = {
  id: string;
  title: string;
  status: AppTaskStatusType;
  description?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * アプリ側で利用するタスク一覧の型
 */
export type TaskList = TaskDetail[];

/**
 * レスポンスで利用するタスク詳細の型
 * 今回はアプリ内部の構造と同じだが、将来的にレスポンス用に変える場合に備えて別名型にしている。
 */
export type TaskDetailResponse = TaskDetail;

/**
 * レスポンスで利用するタスク一覧の型
 * 今回はアプリ内部の構造と同じだが、将来的にレスポンス用に変える場合に備えて別名型にしている。
 */
export type TaskListResponse = TaskList;
