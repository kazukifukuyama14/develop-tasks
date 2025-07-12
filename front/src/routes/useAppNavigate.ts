import { useNavigate, type NavigateOptions } from "react-router-dom";

import { APP_ROUTES } from "./route";

export const useAppNavigate = () => {
  const navigate = useNavigate();

  return {
    top: (options?: NavigateOptions) =>
      navigate(APP_ROUTES.top.route(), options),
    about: (options?: NavigateOptions) =>
      navigate(APP_ROUTES.about.route(), options),
    taskList: (options?: NavigateOptions) =>
      navigate(APP_ROUTES.taskList.route(), options),
  };
};
