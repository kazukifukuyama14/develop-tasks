import { z } from "zod";

import { AppTaskStatus } from "@/types/task";

export const taskStatusSchema = z.enum([
  AppTaskStatus.Done,
  AppTaskStatus.InProgress,
  AppTaskStatus.Pending,
]);
