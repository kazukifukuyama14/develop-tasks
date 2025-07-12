import { AppRoleType } from "./appRole";

/**
 * ログインユーザー情報を格納するための型
 */
export type CurrentUser = {
  sub: string;
  email: string;
  role: AppRoleType;
};
