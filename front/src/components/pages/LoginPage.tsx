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
import { signIn } from "aws-amplify/auth";
import { useSnackbar } from "notistack";
import { useLocation } from "react-router-dom";
import { useAppNavigate } from "../../routes/useAppNavigate";
import { usePublicNavigate } from "../../routes/usePublicNavigate";

interface LocationState {
  from?: {
    pathname: string;
  };
}

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();
  const appNavigate = useAppNavigate();
  const publicNavigate = usePublicNavigate();

  const state = location.state as LocationState;
  const from = state?.from?.pathname || "/";

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("ログイン試行:", { username: formData.username });

    try {
      const { isSignedIn, nextStep } = await signIn({
        username: formData.username,
        password: formData.password,
      });

      console.log("サインイン成功:", { isSignedIn, nextStep });
      enqueueSnackbar(`ようこそ、${formData.username}さん！`, {
        variant: "success",
      });

      // 元のページまたはトップページにリダイレクト
      if (from === "/") {
        appNavigate.top();
      } else {
        window.location.href = from;
      }
    } catch (error: any) {
      console.error("サインインエラー:", error);
      console.error("エラーの詳細:", {
        name: error.name,
        message: error.message,
        code: error.code,
      });

      let errorMessage = "サインインに失敗しました";

      // エラーメッセージをより具体的に
      if (error.name === "NotAuthorizedException") {
        errorMessage = "ユーザー名またはパスワードが正しくありません";
      } else if (error.name === "UserNotConfirmedException") {
        errorMessage = "メール確認が完了していません。確認ページに移動します。";
        enqueueSnackbar(errorMessage, { variant: "warning" });
        // メール確認ページに遷移
        publicNavigate.emailVerify({ state: { username: formData.username } });
        return;
      } else if (error.name === "UserNotFoundException") {
        errorMessage = "ユーザーが見つかりません";
      } else {
        errorMessage = error.message || "サインインに失敗しました";
      }

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
              ログイン
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSignIn}>
              <TextField
                fullWidth
                name="username"
                label="メールアドレス"
                type="email"
                value={formData.username}
                onChange={handleInputChange}
                margin="normal"
                required
                autoComplete="email"
                helperText="登録時に使用したメールアドレスを入力してください"
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
                autoComplete="current-password"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? "ログイン中..." : "ログイン"}
              </Button>
            </Box>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="body2">
                アカウントをお持ちでない方は{" "}
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => publicNavigate.signup()}
                  sx={{ cursor: "pointer" }}
                >
                  新規登録
                </Link>
              </Typography>
            </Box>

            {/* テスト用の情報表示 */}
            <Box sx={{ mt: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
              <Typography variant="caption" display="block" gutterBottom>
                テスト用アカウント:
              </Typography>
              <Typography variant="caption" display="block">
                メール: test@example.com
              </Typography>
              <Typography variant="caption" display="block">
                パスワード: TestPass123!
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default LoginPage;
