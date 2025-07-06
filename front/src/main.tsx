import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { SnackbarProvider } from "notistack";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import App from "./App.tsx";
import { theme } from "./libs/theme.ts";
import { NotifyInitializer } from "./components/NotifyInitializer";

import "./libs/amplify";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // エラー時の再試行は1回だけ
      refetchOnWindowFocus: false, // タブフォーカスでの再取得を無効化
      staleTime: 1000 * 60 * 10, // キャッシュを10分間有効に
      gcTime: 1000 * 60 * 15, // キャッシュを15分後に破棄（ガベージコレクション）
    },
    mutations: {
      retry: false, // POST/PUT/DELETEは再試行しない（安全性重視）
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider
          maxSnack={5}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          autoHideDuration={10_000}
          preventDuplicate
        >
          <NotifyInitializer />
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </SnackbarProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
