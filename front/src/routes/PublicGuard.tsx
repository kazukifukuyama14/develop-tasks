import { useEffect, useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import { CircularProgress, Box } from "@mui/material";

import { Outlet } from "react-router-dom";
import { useAppNavigate } from "./useAppNavigate";

const PublicGuard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useAppNavigate();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        await getCurrentUser(); // すでにログイン済み
        navigate.top();
      } catch {
        // 未ログインならそのまま表示
      } finally {
        setIsLoading(false);
      }
    };

    checkLogin();
  }, [navigate]);

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

  return (
    <>
      <Outlet />
    </>
  );
};

export default PublicGuard;
