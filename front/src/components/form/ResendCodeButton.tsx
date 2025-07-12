import { useState, useEffect } from "react";
import { resendSignUpCode } from "aws-amplify/auth";
import { Button, CircularProgress } from "@mui/material";

import notify from "@/libs/notify";
import { handleError } from "@/libs/handleError";

const COOLDOWN_SEC = 60;

const ResendCodeButton = ({ username }: { username: string }) => {
  const [cooldown, setCooldown] = useState(0);
  const [isLoading, setLoading] = useState(false);

  // カウントダウン
  useEffect(() => {
    if (cooldown === 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleResend = async () => {
    try {
      setLoading(true);
      await resendSignUpCode({ username });
      notify.info("確認コードを再送しました");
      setCooldown(COOLDOWN_SEC);
    } catch (e) {
      handleError(e, {
        defaultMessage: "再送に失敗しました。時間をおいて再試行してください",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="text"
      size="small"
      onClick={handleResend}
      disabled={isLoading || cooldown > 0}
      startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
    >
      {cooldown > 0 ? `再送 (${cooldown})` : "確認コードを再送"}
    </Button>
  );
};

export default ResendCodeButton;
