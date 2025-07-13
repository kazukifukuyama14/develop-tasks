import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Link,
} from "@mui/material";
import { signUp } from "aws-amplify/auth";
import { useSnackbar } from "notistack";
import { usePublicNavigate } from "../../routes/usePublicNavigate";

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = usePublicNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // パスワード確認
    if (formData.password !== formData.confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    setLoading(true);

    try {
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: formData.username,
        password: formData.password,
        options: {
          userAttributes: {
            email: formData.email,
          },
        },
      });

      console.log("サインアップ成功:", { isSignUpComplete, userId, nextStep });
      enqueueSnackbar(
        "登録が完了しました。確認コードをメールで送信しました。",
        { variant: "success" }
      );

      // メール確認ページに遷移（ユーザー名とメールアドレスを渡す）
      navigate.emailVerify({
        state: {
          username: formData.username,
          email: formData.email,
        },
      });
    } catch (error: any) {
      console.error("サインアップエラー:", error);
      const errorMessage = error.message || "サインアップに失敗しました";
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Card>
          <CardContent>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              新規登録
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSignUp}>
              <TextField
                fullWidth
                name="username"
                label="ユーザー名"
                value={formData.username}
                onChange={handleInputChange}
                margin="normal"
                required
                helperText="英数字で入力してください"
                autoComplete="username"
              />

              <TextField
                fullWidth
                name="email"
                label="メールアドレス"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
                required
                helperText="確認コードの送信先になります"
                autoComplete="email"
              />

              <TextField
                fullWidth
                name="password"
                label="パスワード"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                margin="normal"
                required
                helperText="8文字以上で入力してください"
                autoComplete="new-password"
              />

              <TextField
                fullWidth
                name="confirmPassword"
                label="パスワード（確認）"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                margin="normal"
                required
                helperText="上記と同じパスワードを入力してください"
                autoComplete="new-password"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? "登録中..." : "新規登録"}
              </Button>
            </Box>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="body2">
                すでにアカウントをお持ちの方は{" "}
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate.login()}
                  sx={{ cursor: "pointer" }}
                >
                  ログイン
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default SignupPage;
