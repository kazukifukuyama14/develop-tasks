import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUp } from "aws-amplify/auth";
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
import { handleError } from "@/libs/handleError";
import { usePublicNavigate } from "@/routes/usePublicNavigate";
import PasswordTextField from "../form/PasswordTextField";

// =============================================
// Zod schema & Types
// =============================================
const userSchema = z
  .object({
    email: z
      .string()
      .email({ message: "メールアドレス形式で入力してください" }),
    password: z
      .string()
      .min(8, { message: "パスワードは8文字以上で入力してください" }),
    confirmPassword: z.string(),
    name: z.string().min(1, { message: "ユーザー名を入力してください" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードと確認用パスワードが一致しません",
    path: ["confirmPassword"],
  });

type UserFormInput = z.infer<typeof userSchema>;

// =============================================
// Component
// =============================================
const SignupPage = () => {
  const publicNavigate = usePublicNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormInput>({
    resolver: zodResolver(userSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: UserFormInput) => {
    try {
      const { email, password, name } = data;
      const res = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            name,
          },
        },
      });

      if (res.nextStep?.signUpStep === "CONFIRM_SIGN_UP") {
        // 確認コード入力画面へ
        publicNavigate.emailVerify({
          state: { username: email }, // 後で confirmSignUp に渡すため保持
        });
      }
    } catch (err) {
      handleError(err, { defaultMessage: "登録に失敗しました" });
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
            <PasswordTextField
              label="パスワード（確認用）"
              autoComplete="new-password"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              {...register("confirmPassword")}
              fullWidth
            />
            <TextField
              label="ユーザー名"
              autoComplete="name"
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register("name")}
              fullWidth
            />
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              送信
            </Button>
            <Typography textAlign="center" variant="body2">
              すでにアカウントをお持ちですか？
              <MuiLink
                component="button"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault(); // フォームsubmit誤発火防止
                  setTimeout(() => publicNavigate.login(), 0);
                }}
              >
                ログイン
              </MuiLink>
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignupPage;
