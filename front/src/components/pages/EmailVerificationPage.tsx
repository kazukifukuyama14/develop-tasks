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
import { confirmSignUp, resendSignUpCode } from "aws-amplify/auth";
import { useSnackbar } from "notistack";
import { useLocation } from "react-router-dom";
import { usePublicNavigate } from "../../routes/usePublicNavigate";

interface LocationState {
  username?: string;
  email?: string;
}

const EmailVerificationPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState;

  const [formData, setFormData] = useState({
    username: state?.username || "",
    confirmationCode: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = usePublicNavigate();

  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username: formData.username,
        confirmationCode: formData.confirmationCode,
      });

      console.log("確認成功:", { isSignUpComplete, nextStep });
      enqueueSnackbar("メール確認が完了しました。ログインしてください。", {
        variant: "success",
      });
      navigate.login();
    } catch (error: any) {
      console.error("確認エラー:", error);
      const errorMessage = error.message || "確認に失敗しました";
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmationCode = async () => {
    if (!formData.username) {
      setError("ユーザー名を入力してください");
      return;
    }

    try {
      await resendSignUpCode({
        username: formData.username,
      });
      enqueueSnackbar("確認コードを再送信しました。", { variant: "info" });
      setError("");
    } catch (error: any) {
      console.error("再送信エラー:", error);
      enqueueSnackbar("確認コードの再送信に失敗しました。", {
        variant: "error",
      });
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
              メール確認
            </Typography>

            {state?.email && (
              <Typography
                variant="body1"
                gutterBottom
                align="center"
                sx={{ mb: 3 }}
              >
                {state.email} に確認コードを送信しました。
              </Typography>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleConfirmSignUp}>
              <TextField
                fullWidth
                name="username"
                label="ユーザー名"
                value={formData.username}
                onChange={handleInputChange}
                margin="normal"
                required
                disabled={!!state?.username}
                helperText={
                  state?.username
                    ? "登録時のユーザー名"
                    : "サインアップ時に入力したユーザー名"
                }
              />

              <TextField
                fullWidth
                name="confirmationCode"
                label="確認コード"
                value={formData.confirmationCode}
                onChange={handleInputChange}
                margin="normal"
                required
                helperText="メールに記載された6桁のコードを入力してください"
                inputProps={{ maxLength: 6 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? "確認中..." : "確認"}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={handleResendConfirmationCode}
                disabled={loading}
                sx={{ mb: 2 }}
              >
                確認コードを再送信
              </Button>
            </Box>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="body2">
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate.login()}
                  sx={{ cursor: "pointer" }}
                >
                  ログインページに戻る
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default EmailVerificationPage;
