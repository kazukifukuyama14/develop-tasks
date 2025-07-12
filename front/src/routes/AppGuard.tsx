import { useEffect, useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import { Outlet, useLocation } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";

import { usePublicNavigate } from "./usePublicNavigate";

const AppGuard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const navigate = usePublicNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await getCurrentUser(); // 認証済みなら成功
        setIsAuthed(true);
      } catch {
        // 再ログイン後に元の画面に戻れるように location を渡す
        navigate.login({ state: { from: location } });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, location]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return <>{isAuthed ? <Outlet /> : null}</>;
};

export default AppGuard;
