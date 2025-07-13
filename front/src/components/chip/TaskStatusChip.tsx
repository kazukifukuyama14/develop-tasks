import { Chip } from "@mui/material";

import type { AppTaskStatusType } from "@/types/task";

type Props = {
  status: AppTaskStatusType;
};

const statusConfig: Record<
  AppTaskStatusType,
  {
    label: string;
    color:
      | "default"
      | "primary"
      | "secondary"
      | "success"
      | "error"
      | "warning"
      | "info";
  }
> = {
  PENDING: {
    label: "未着手",
    color: "default",
  },
  IN_PROGRESS: {
    label: "進行中",
    color: "primary",
  },
  DONE: {
    label: "完了",
    color: "info",
  },
};

const TaskStatusChip = ({ status }: Props) => {
  const config = statusConfig[status];

  return <Chip label={config.label} color={config.color} size="small" />;
};

export default TaskStatusChip;
