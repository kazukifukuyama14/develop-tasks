import { TaskStatus } from "../generated/prisma";

export const AppTaskStatus = {
  pending: "PENDING",
  inProgress: "IN_PROGRESS",
  done: "DONE",
} as const;

export type AppTaskStatusType =
  (typeof AppTaskStatus)[keyof typeof AppTaskStatus];

export function toPrismaTaskStatus(appStatus: AppTaskStatusType): TaskStatus {
  return appStatus as TaskStatus;
}

export function toAppTaskStatus(prismaStatus: TaskStatus): AppTaskStatusType {
  return prismaStatus as AppTaskStatusType;
}
