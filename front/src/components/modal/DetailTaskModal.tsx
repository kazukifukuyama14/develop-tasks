import { useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ja } from "date-fns/locale";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

import { AppTaskStatus, type TaskList } from "@/types/task";
import { taskStatusSchema } from "@/schemas/schema";
import { TaskKey, useTaskListQuery } from "@/hooks/useTask";
import { toDate } from "@/utils/date";
import { deleteTask, updateTask } from "@/api/task";
import { handleError } from "@/libs/handleError";

// =====================================
// スキーマ
// =====================================
const schema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  description: z.string().optional(),
  status: taskStatusSchema,
  dueDate: z.date().optional(),
});

type FormValues = z.infer<typeof schema>;

// =====================================
// コンポーネント
// =====================================
export type DetailTaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
};

const DetailTaskModal = ({ isOpen, onClose, taskId }: DetailTaskModalProps) => {
  const queryClient = useQueryClient();

  // 対象のタスクを取得します。今回はリストから直接取得してますが、後々は詳細を直接取得したほうが良いでしょう。
  // 将来的にはこっち
  // const { data: task, isLoading } = useTaskDetailQuery(taskId);
  const { data: tasks = [] } = useTaskListQuery();
  const task = tasks.find((t) => t.id === taskId);

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: task
      ? {
          title: task.title,
          description: task.description ?? "",
          status: task.status,
          dueDate: task.dueDate ? toDate(task.dueDate) : undefined,
        }
      : {
          title: "",
          description: "",
          status: "PENDING",
          dueDate: undefined,
        },
  });

  // モーダルが閉じられたらフォームをリセット
  const handleClose = () => {
    reset();
    onClose();
  };

  // 更新処理
  const onSubmit = async (data: FormValues) => {
    if (!task) return;
    try {
      // 更新リクエスト送信
      const updatedTask = await updateTask({
        taskId,
        ...data,
      });

      // キャッシュ更新
      queryClient.setQueryData<TaskList | undefined>(TaskKey.list(), (prev) => {
        if (!prev) return undefined;

        return prev.map((task) =>
          task.id === taskId ? { ...updatedTask } : task
        );
      });

      // モーダルを閉じる
      handleClose();
    } catch (e) {
      handleError(e);
    }
  };

  // 削除処理
  const handleDelete = async () => {
    if (!task) return;
    if (!confirm("本当に削除しますか？")) return;
    try {
      // 削除リクエスト送信
      await deleteTask(task.id);

      // キャッシュから削除
      queryClient.setQueryData<TaskList | undefined>(TaskKey.list(), (prev) => {
        if (!prev) return undefined;

        return prev.filter((task) => task.id !== taskId);
      });

      // モーダルを閉じる
      handleClose();
    } catch (e) {
      handleError(e);
    }
  };

  return (
    <Dialog open={isOpen} maxWidth="sm" fullWidth onClose={handleClose}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* ---------- header ---------- */}
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <EditIcon color="primary" />
            <Typography variant="h6">タスク詳細</Typography>
            {/* 保存していない変更がある場合のみ表示 */}
            {isDirty && (
              <Typography variant="caption" color="warning.main" ml={2}>
                変更があります
              </Typography>
            )}
          </Stack>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <HighlightOffIcon />
          </IconButton>
        </DialogTitle>

        {/* ---------- content ---------- */}
        <DialogContent dividers>
          <Controller
            name="title"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="タイトル"
                fullWidth
                margin="normal"
                required
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="詳細"
                fullWidth
                margin="normal"
                multiline
                minRows={3}
              />
            )}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={2}>
            <FormControl fullWidth required>
              <InputLabel id="status-label">ステータス</InputLabel>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select {...field} labelId="status-label" label="ステータス">
                    <MenuItem value={AppTaskStatus.Pending}>未着手</MenuItem>
                    <MenuItem value={AppTaskStatus.InProgress}>進行中</MenuItem>
                    <MenuItem value={AppTaskStatus.Done}>完了</MenuItem>
                  </Select>
                )}
              />
            </FormControl>

            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={ja}
            >
              <Controller
                name="dueDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    value={field.value ?? null}
                    onChange={(date) => field.onChange(date)}
                    label="期限"
                    slotProps={{
                      textField: { fullWidth: true },
                    }}
                    minDate={new Date()}
                  />
                )}
              />
            </LocalizationProvider>
          </Stack>
        </DialogContent>

        {/* ---------- actions ---------- */}
        <DialogActions>
          <IconButton
            aria-label="delete"
            color="error"
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            <DeleteIcon />
          </IconButton>
          <Button onClick={handleClose}>閉じる</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || !isDirty}
          >
            保存
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DetailTaskModal;
