import { useQuery } from "@tanstack/react-query";

import { getTaskList } from "@/api/task";

/**
 * タスクのキャッシュキー
 */
export const TaskKey = {
  all: ["task"] as const,
  list: () => [...TaskKey.all, "list"] as const,
  detail: (taskId: string) => [...TaskKey.all, "detail", taskId] as const,
} as const;

/**
 * タスク一覧を返す useQuery ラッパー
 */
export const useTaskListQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: TaskKey.list(),
    queryFn: getTaskList,
    enabled,
  });
};
