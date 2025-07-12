import AboutPage from "@/components/pages/AboutPage";
import EmailVerificationPage from "@/components/pages/EmailVerificationPage";
import LoginPage from "@/components/pages/LoginPage";
import SignupPage from "@/components/pages/SignupPage";
import TaskListPage from "@/components/pages/TaskListPage";
import TopPage from "@/components/pages/TopPage";

export const PUBLIC_ROUTES = {
  login: {
    path: "/login",
    route: () => "/login",
    element: LoginPage,
  },
  signup: {
    path: "/signup",
    route: () => "/signup",
    element: SignupPage,
  },
  emailVerify: {
    path: "/email-verify",
    route: () => "/email-verify",
    element: EmailVerificationPage,
  },
} as const;

export const APP_ROUTES = {
  top: {
    path: "/",
    route: () => "/",
    element: TopPage,
  },
  about: {
    path: "/about",
    route: () => "/about",
    element: AboutPage,
  },
  taskList: {
    path: "/tasks",
    route: () => "/tasks",
    element: TaskListPage,
  },
};
