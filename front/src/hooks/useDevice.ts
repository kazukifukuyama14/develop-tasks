import { useTheme, useMediaQuery } from "@mui/material";

export const useDevice = () => {
  const theme = useTheme();

  /**
   * md以下（例: タブレットやスマホ）なら true を返す
   */
  const isTabletOrDown = useMediaQuery(theme.breakpoints.down("md"));

  return {
    isTabletOrDown,
  };
};
