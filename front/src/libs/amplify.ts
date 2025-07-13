import { Amplify } from "aws-amplify";
import { getEnv } from "./env";

const USER_POOL_ID = getEnv("VITE_COGNITO_USER_POOL_ID");
const CLIENT_ID = getEnv("VITE_COGNITO_CLIENT_ID");

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: USER_POOL_ID,
      userPoolClientId: CLIENT_ID,
    },
  },
});
