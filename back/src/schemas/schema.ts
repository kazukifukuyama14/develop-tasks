import { z } from "zod";
import { AppTaskStatus } from "../types/taskStatus";

export const ULIDSchema = z
  .string()
  .length(26, { message: "値は26文字である必要があります" })
  .regex(/^[0-9A-HJKMNP-TV-Z]{26}$/, {
    message: "値の形式が異なります。",
  });

export const TaskStatusEnum = z.enum([
  AppTaskStatus.done,
  AppTaskStatus.inProgress,
  AppTaskStatus.pending,
]);
