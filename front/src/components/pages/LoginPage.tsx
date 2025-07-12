import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "aws-amplify/auth";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Stack,
  Paper,
  Container,
  Link as MuiLink,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

import { usePublicNavigate } from "@/routes/usePublicNavigate";
import { handleError } from "@/libs/handleError";
import PasswordTextField from "../form/PasswordTextField";

// =============================================
// Zod schema & Types
// =============================================
const userSchema = z.object({
  email: z.string().email({ message: "メールアドレス形式で入力してください" }),
  password: z
    .string()
    .min(8, { message: "パスワードは8文字以上で入力してください" }),
});

type UserFormInput = z.infer<typeof userSchema>;

// =============================================
// Component
// =============================================
const LoginPage = () => {
  const location = useLocation();
  const publicNavigate = usePublicNavigate();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormInput>({
    resolver: zodResolver(userSchema),
    mode: "onBlur",
  });

  // 認証失敗で遷移してきた場合の遷移元
  const from = location.state?.from?.pathname || "/";

  const onSubmit = async (data: UserFormInput) => {
    try {
      const { email, password } = data;
      await signIn({
        username: email,
        password,
      });
      // 遷移元に遷移するために、useNavigateを使います。
      navigate(from, { replace: true });
    } catch (err) {
      handleError(err, { defaultMessage: "ログインに失敗しました。" });
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
              ログイン
            </Typography>
            <TextField
              label="メールアドレス"
              type="email"
              autoComplete="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register("email")}
              fullWidth
            />
            <PasswordTextField
              label="パスワード"
              autoComplete="new-password"
              error={!!errors.password}
              helperText={errors.password?.message}
              {...register("password")}
              fullWidth
            />
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              ログイン
            </Button>
            <Typography textAlign="center" variant="body2">
              アカウントをお持ちでないですか？
              <MuiLink
                component="button"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault();
                  setTimeout(() => publicNavigate.signup(), 0);
                }}
              >
                新規登録
              </MuiLink>
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
