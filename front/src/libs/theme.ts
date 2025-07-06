import { createTheme } from "@mui/material/styles";

// マテリアルUIの設定
export const theme = createTheme({
  palette: {
    primary: {
      main: "#424242",
      contrastText: "#ffffff",
    },
    error: {
      main: "#d32f2f",
      contrastText: "#ffffff",
    },
    success: {
      main: "#2e7d32",
    },
    warning: {
      main: "#ed6c02",
    },
    background: {
      default: "#f5f5f5",
    },
  },
});
