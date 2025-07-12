import { useNavigate, type NavigateOptions } from "react-router-dom";
import { PUBLIC_ROUTES } from "./route";

export const usePublicNavigate = () => {
  const navigate = useNavigate();

  return {
    login: (options?: NavigateOptions) =>
      navigate(PUBLIC_ROUTES.login.route(), options),
    signup: (options?: NavigateOptions) =>
      navigate(PUBLIC_ROUTES.signup.route(), options),
    emailVerify: (options?: NavigateOptions) =>
      navigate(PUBLIC_ROUTES.emailVerify.route(), options),
  };
};
