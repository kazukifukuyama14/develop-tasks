import { type VariantType, type SnackbarKey } from "notistack";

type NotifyFn = (msg: string, options?: { key?: SnackbarKey }) => void;

interface NotifyAPI {
  success: NotifyFn;
  error: NotifyFn;
  info: NotifyFn;
  warning: NotifyFn;
  _init: (
    enqueue: (
      msg: string,
      opts?: { variant: VariantType; key?: SnackbarKey }
    ) => void
  ) => void;
}

const notify: NotifyAPI = {
  success: () => {},
  error: () => {},
  info: () => {},
  warning: () => {},
  _init: () => {},
};

// 初期化（App.tsx 側で呼び出す）
notify._init = (enqueue) => {
  notify.success = (msg, options) =>
    enqueue(msg, { variant: "success", ...options });
  notify.error = (msg, options) =>
    enqueue(msg, { variant: "error", ...options });
  notify.info = (msg, options) => enqueue(msg, { variant: "info", ...options });
  notify.warning = (msg, options) =>
    enqueue(msg, { variant: "warning", ...options });
};

export default notify;
