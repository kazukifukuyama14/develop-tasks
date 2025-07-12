export const AppRole = {
  Admin: "admin",
  Member: "member",
} as const;

export type AppRoleType = (typeof AppRole)[keyof typeof AppRole];
