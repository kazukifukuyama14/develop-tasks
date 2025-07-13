import { useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { ja } from "date-fns/locale";
import { z } from "zod";
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
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import { zodResolver } from "@hookform/resolvers/zod";
import { AppTaskStatus, type TaskList } from "@/types/task";
import { taskStatusSchema } from "@/schemas/schema";
import { handleError } from "@/libs/handleError";
import { createTask } from "@/api/task";
import { TaskKey } from "@/hooks/useTask";
import notify from "@/libs/notify";

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
type CreateTaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const CreateTaskModal = ({ isOpen, onClose }: CreateTaskModalProps) => {
  const queryClient = useQueryClient();
  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      status: AppTaskStatus.Pending,
    },
  });

  const handleClose = () => {
    reset(); // モーダルを閉じる場合、入力をクリア
    onClose();
  };

  const onSubmit = async (data: FormValues) => {
    try {
      // 作成リクエストを送信
      const created = await createTask(data);

      // 作成したタスクをキャッシュに追加
      queryClient.setQueryData<TaskList | undefined>(TaskKey.list(), (prev) => {
        if (!prev) return undefined;

        return [created, ...prev];
      });

      // メッセージ表示後にモーダルを閉じる
      notify.info("作成しました。");
      handleClose();
    } catch (e) {
      handleError(e);
    }
  };

  return (
    <Dialog open={isOpen} maxWidth="sm" fullWidth onClose={handleClose}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <AddCircleOutlineIcon color="primary" />
            <Typography variant="h6">タスクを追加</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Controller
            name="title"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="タイトル"
                fullWidth
                autoFocus
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
                label="説明"
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
                    minDate={new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                )}
              />
            </LocalizationProvider>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>キャンセル</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            作成
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateTaskModal;
