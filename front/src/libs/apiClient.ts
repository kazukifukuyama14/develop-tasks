import axios, { type AxiosInstance } from "axios";
import { fetchAuthSession } from "aws-amplify/auth";

import logger from "./logger";
import { getEnv } from "./env";

const API_URL = getEnv("VITE_API_URL");

// CognitoのIDトークンを取得
const getIdToken = async (): Promise<string | null> => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString(); // or accessToken
    return token ?? null;
  } catch (err) {
    logger.warn("認証セッションの取得に失敗:", err);
    return null;
  }
};

// バージョン付きのAPIクライアント（例：/v1/... にアクセス）
export const apiV1Client: AxiosInstance = axios.create({
  // URL例) http://localhost:8080/v1/xxx
  baseURL: `${API_URL}/v1`,
  timeout: 10000,
});

apiV1Client.defaults.headers.common["Content-Type"] = "application/json";

apiV1Client.interceptors.request.use(
  async (config) => {
    const token = await getIdToken();

    if (!token) {
      logger.warn("トークンが取得できなかったため、リクエストを中止します。");
      return Promise.reject(new axios.Cancel("No auth token"));
    }

    config.headers["Authorization"] = `Bearer ${token}`;

    return config;
  },
  (error) => Promise.reject(error)
);
