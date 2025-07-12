import { useLocation } from "react-router-dom";
import { confirmSignUp } from "aws-amplify/auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Stack,
  Paper,
  Container,
} from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePublicNavigate } from "@/routes/usePublicNavigate";
import { handleError } from "@/libs/handleError";
import ResendCodeButton from "../form/ResendCodeButton";
import notify from "@/libs/notify";

const schema = z.object({
  code: z.string().length(6, "6桁のコードを入力してください"),
});

type Input = z.infer<typeof schema>;

const ConfirmSignUpPage = () => {
  const publicNavigate = usePublicNavigate();
  const location = useLocation();
  const username = location.state?.username as string | undefined;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Input>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ code }: Input) => {
    if (!username) return;
    try {
      await confirmSignUp({ username, confirmationCode: code });
      notify.info("登録しました。");
      publicNavigate.login({ replace: true, state: { confirmed: true } });
    } catch (e) {
      handleError(e, { defaultMessage: "検証に失敗しました" });
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ my: 4, p: 4 }}>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ width: "100%", mx: "auto" }}
        >
          <Stack spacing={2}>
            <Typography variant="h5" component="h1" textAlign="center">
              ユーザー作成
            </Typography>
            <TextField
              label="コード"
              autoComplete="code"
              error={!!errors.code}
              helperText={errors.code?.message}
              {...register("code")}
              fullWidth
            />

            <Stack direction="row" spacing={2} justifyContent="space-between">
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              >
                送信
              </Button>
              {username && <ResendCodeButton username={username} />}
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default ConfirmSignUpPage;
