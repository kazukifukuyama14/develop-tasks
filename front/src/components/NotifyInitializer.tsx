import { useEffect } from "react";
import { useSnackbar } from "notistack";

import notify from "@/libs/notify";

export const NotifyInitializer = () => {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    notify._init(enqueueSnackbar);
  }, [enqueueSnackbar]);

  return null;
};
